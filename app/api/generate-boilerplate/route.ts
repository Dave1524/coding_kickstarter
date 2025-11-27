/**
 * Generate Boilerplate API
 * Creates a GitHub repo from template and customizes it for the user's project
 */

import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import {
  createRepoFromTemplate,
  updateRepoFiles,
  getRepoZipUrl,
  getTemplateRepoUrl,
  getUseTemplateUrl,
  sanitizeRepoName,
} from '@/lib/github';
import {
  createProjectConfig,
  getCustomizedFiles,
  validateProjectName,
  DEFAULT_STACK,
  type StackConfig,
} from '@/lib/boilerplate-generator';

const GITHUB_TOKEN_COOKIE = 'github_token';

export interface GenerateBoilerplateRequest {
  projectName: string;
  idea: string;
  answers: Record<string, string>;
  stackConfig?: Partial<StackConfig>;
}

export interface GenerateBoilerplateResponse {
  success: boolean;
  repoUrl?: string;
  repoFullName?: string;
  zipUrl?: string;
  templateUrl?: string;
  useTemplateUrl?: string;
  error?: string;
  fallback?: boolean;
}

/**
 * POST /api/generate-boilerplate
 * Creates a new repo from template and customizes it
 */
export async function POST(request: NextRequest): Promise<NextResponse<GenerateBoilerplateResponse>> {
  try {
    // Parse request body
    const body: GenerateBoilerplateRequest = await request.json();
    const { projectName, idea, answers, stackConfig } = body;

    // Validate inputs
    const validation = validateProjectName(projectName);
    if (!validation.valid) {
      return NextResponse.json(
        { success: false, error: validation.error },
        { status: 400 }
      );
    }

    if (!idea || idea.trim().length === 0) {
      return NextResponse.json(
        { success: false, error: 'Project idea is required' },
        { status: 400 }
      );
    }

    // Get GitHub token from cookie
    const cookieStore = await cookies();
    const githubToken = cookieStore.get(GITHUB_TOKEN_COOKIE)?.value;

    // If no GitHub token, return fallback options
    if (!githubToken) {
      return NextResponse.json({
        success: true,
        fallback: true,
        templateUrl: getTemplateRepoUrl(),
        useTemplateUrl: getUseTemplateUrl(),
        error: 'GitHub not connected. Use the template link to create your repo manually.',
      });
    }

    // Create project configuration
    const config = createProjectConfig(
      projectName,
      idea,
      answers,
      stackConfig || DEFAULT_STACK
    );

    // Create repo from template
    let repo;
    try {
      repo = await createRepoFromTemplate(githubToken, {
        projectName: config.projectName,
        description: config.description,
        isPrivate: false,
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Failed to create repository';
      
      // If repo creation fails, return fallback
      return NextResponse.json({
        success: false,
        fallback: true,
        templateUrl: getTemplateRepoUrl(),
        useTemplateUrl: getUseTemplateUrl(),
        error: message,
      });
    }

    // Get customized files
    const files = getCustomizedFiles(config);

    // Update files in the new repo
    try {
      await updateRepoFiles(
        githubToken,
        repo.full_name,
        files,
        '🚀 Customize boilerplate for project'
      );
    } catch (error) {
      // Repo was created but customization failed
      // Return the repo URL anyway - user can still use it
      console.error('Failed to customize repo files:', error);
      
      return NextResponse.json({
        success: true,
        repoUrl: repo.html_url,
        repoFullName: repo.full_name,
        zipUrl: getRepoZipUrl(repo.full_name),
        error: 'Repo created but some customizations may have failed. You can customize manually.',
      });
    }

    // Success!
    return NextResponse.json({
      success: true,
      repoUrl: repo.html_url,
      repoFullName: repo.full_name,
      zipUrl: getRepoZipUrl(repo.full_name),
    });
  } catch (error) {
    console.error('Generate boilerplate error:', error);
    
    return NextResponse.json(
      {
        success: false,
        fallback: true,
        templateUrl: getTemplateRepoUrl(),
        useTemplateUrl: getUseTemplateUrl(),
        error: error instanceof Error ? error.message : 'An unexpected error occurred',
      },
      { status: 500 }
    );
  }
}

/**
 * GET /api/generate-boilerplate
 * Returns template info and current auth status
 */
export async function GET(): Promise<NextResponse> {
  const cookieStore = await cookies();
  const hasToken = !!cookieStore.get(GITHUB_TOKEN_COOKIE)?.value;

  return NextResponse.json({
    templateUrl: getTemplateRepoUrl(),
    useTemplateUrl: getUseTemplateUrl(),
    authenticated: hasToken,
    defaultStack: DEFAULT_STACK,
  });
}


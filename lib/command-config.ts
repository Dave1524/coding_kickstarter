/**
 * Command Configuration
 * 
 * YAML-like structure for command configuration supporting:
 * - Multiple package managers (npm, yarn, pnpm)
 * - OS-specific variations (Windows vs Mac/Linux)
 * - Expected output strings for auto-check
 * - Priority mappings
 * - "Why" explanations
 * - Cursor deep link generation
 */

export type Priority = 'critical' | 'recommended' | 'optional';
export type CommandLocation = 'terminal' | 'cursor';

export interface CommandVariations {
  npm?: string;
  yarn?: string;
  pnpm?: string;
  windows?: string;
}

export interface CommandStep {
  id: string;
  label: string;
  priority: Priority;
  why: string;
  commands: CommandVariations | string; // Can be object with variations or single string
  expected: string[]; // Expected output strings for validation
  where: CommandLocation;
  deepLinkCommand?: string; // Command to use for Cursor deep link
  estimatedTime?: string; // Human-readable time estimate (e.g., "~45 seconds")
  isFirstStep?: boolean; // Flag for step 1 (create-next-app) to enable folder auto-open
}

/**
 * Cursor Deep Link URL Generator
 * 
 * Based on official Cursor documentation: https://cursor.com/docs/integrations/deeplinks
 * 
 * Supported formats:
 * - Prompt: cursor://anysphere.cursor-deeplink/prompt?text={encodedPrompt}
 * - Command: cursor://anysphere.cursor-deeplink/command?name={name}&text={content}
 * - Rule: cursor://anysphere.cursor-deeplink/rule?name={name}&text={content}
 * 
 * Since Cursor deep links don't support running terminal commands directly,
 * we use the PROMPT format to pre-fill a chat prompt that instructs Cursor
 * to run the command in the terminal.
 */
export function generateCursorDeepLink(
  command: string,
  options?: {
    isFirstStep?: boolean;
    folderName?: string;
    stepTitle?: string;
  }
): string {
  // Use the official prompt deeplink format
  const baseUrl = 'cursor://anysphere.cursor-deeplink/prompt';
  
  // Create a prompt that asks Cursor to run the command
  let promptText: string;
  
  if (options?.isFirstStep && options?.folderName) {
    // Special prompt for step 1 - create project and open it
    promptText = `Run this command in the terminal to create a new Next.js project, then open the newly created folder "${options.folderName}" in Cursor:

\`\`\`bash
${command}
\`\`\`

After the command completes successfully, open the folder "${options.folderName}" in a new Cursor window.`;
  } else {
    // Standard prompt for other steps
    promptText = `Run this command in the terminal:

\`\`\`bash
${command}
\`\`\``;
  }
  
  const url = new URL(baseUrl);
  url.searchParams.set('text', promptText);
  
  return url.toString();
}

/**
 * Generate a web-based Cursor deep link (opens cursor.com first)
 * Useful as a fallback when the cursor:// protocol doesn't work
 */
export function generateCursorWebDeepLink(
  command: string,
  options?: {
    isFirstStep?: boolean;
    folderName?: string;
  }
): string {
  const baseUrl = 'https://cursor.com/link/prompt';
  
  let promptText: string;
  
  if (options?.isFirstStep && options?.folderName) {
    promptText = `Run this command in the terminal to create a new Next.js project, then open the newly created folder "${options.folderName}" in Cursor:

\`\`\`bash
${command}
\`\`\`

After the command completes successfully, open the folder "${options.folderName}" in a new Cursor window.`;
  } else {
    promptText = `Run this command in the terminal:

\`\`\`bash
${command}
\`\`\``;
  }
  
  const url = new URL(baseUrl);
  url.searchParams.set('text', promptText);
  
  return url.toString();
}

/**
 * Extract project name from command for deep link folder parameter
 */
export function extractProjectNameFromCommand(command: string): string | null {
  // Pattern: create-next-app@latest project-name --flags
  const createAppMatch = command.match(/create-next-app(?:@latest)?\s+([^\s-][^\s]*)/);
  if (createAppMatch && createAppMatch[1]) {
    return createAppMatch[1];
  }
  
  // Pattern: cd project-name
  const cdMatch = command.match(/^cd\s+([^\s]+)/);
  if (cdMatch && cdMatch[1]) {
    return cdMatch[1];
  }
  
  return null;
}

/**
 * Check if we're likely running in Cursor IDE
 * This is a best-effort detection
 */
export function isCursorEnvironment(): boolean {
  if (typeof window === 'undefined') return false;
  
  // Check for Cursor-specific indicators
  const userAgent = window.navigator.userAgent.toLowerCase();
  
  // Cursor typically includes "electron" in user agent
  // and the app has specific window properties
  const isElectron = userAgent.includes('electron');
  
  // Check if the cursor:// protocol handler is registered
  // This is the most reliable check
  const hasCursorProtocol = 'cursor' in window || 
    document.querySelector('meta[name="cursor-ide"]') !== null;
  
  return isElectron || hasCursorProtocol;
}

/**
 * Storage key for package manager preference
 */
const PACKAGE_MANAGER_KEY = 'coding-kickstarter-package-manager';

/**
 * Get user's preferred package manager from localStorage
 */
export function getPackageManagerPreference(): 'npm' | 'yarn' | 'pnpm' {
  if (typeof window === 'undefined') return 'npm';
  
  const stored = localStorage.getItem(PACKAGE_MANAGER_KEY);
  if (stored === 'yarn' || stored === 'pnpm') {
    return stored;
  }
  return 'npm'; // Default
}

/**
 * Save user's package manager preference
 */
export function setPackageManagerPreference(pm: 'npm' | 'yarn' | 'pnpm'): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(PACKAGE_MANAGER_KEY, pm);
}

/**
 * Get command for a specific package manager
 */
export function getCommand(
  step: CommandStep,
  packageManager: 'npm' | 'yarn' | 'pnpm' = 'npm'
): string {
  if (typeof step.commands === 'string') {
    return step.commands;
  }
  
  // Try package manager specific command, fallback to npm, then first available
  if (step.commands[packageManager]) {
    return step.commands[packageManager]!;
  }
  if (step.commands.npm) {
    return step.commands.npm;
  }
  
  // Return first available command
  const commands = step.commands;
  return commands.npm || commands.yarn || commands.pnpm || '';
}

/**
 * Get Windows-specific command if available
 */
export function getWindowsCommand(step: CommandStep): string | null {
  if (typeof step.commands === 'string') {
    return null; // No Windows variation available
  }
  return step.commands.windows || null;
}

/**
 * Priority label mapping
 */
export const PRIORITY_LABELS: Record<Priority, string> = {
  critical: 'Must do now',
  recommended: 'Strongly recommended',
  optional: 'Can do later',
};

/**
 * Priority to old system mapping (for backward compatibility during migration)
 */
export function mapPriorityToLegacy(priority: Priority): 'High' | 'Medium' | 'Low' {
  switch (priority) {
    case 'critical':
      return 'High';
    case 'recommended':
      return 'Medium';
    case 'optional':
      return 'Low';
  }
}

/**
 * Legacy to new priority mapping
 */
export function mapLegacyToPriority(legacy: 'High' | 'Medium' | 'Low'): Priority {
  switch (legacy) {
    case 'High':
      return 'critical';
    case 'Medium':
      return 'recommended';
    case 'Low':
      return 'optional';
  }
}


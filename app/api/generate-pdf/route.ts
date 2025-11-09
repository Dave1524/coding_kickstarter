import { NextRequest, NextResponse } from 'next/server';
import { pdf, Document } from '@react-pdf/renderer';
import React from 'react';
import { PDFTemplate } from '@/components/PDFTemplate';
import { Readable } from 'stream';

/**
 * PDF Generation API
 * 
 * POST /api/generate-pdf
 * Body: { idea, questions, steps, blueprint, kanbanMarkdown }
 * 
 * Returns PDF blob
 */
export async function POST(request: NextRequest) {
  try {
    console.log('PDF Generation API called');
    const body = await request.json();
    console.log('Request body parsed:', { idea: body.idea, hasQuestions: !!body.questions });
    
    const { idea, questions, steps, blueprint, kanbanMarkdown } = body as {
      idea?: string;
      questions?: Array<{ q: string; a: string }>;
      steps?: Array<{ step: string; command?: string; tip?: string }>;
      blueprint?: {
        epics: {
          input?: string[];
          output?: string[];
          export?: string[];
          history?: string[];
        };
      };
      kanbanMarkdown?: string;
    };

    // Validate required fields
    if (!idea) {
      return NextResponse.json(
        { error: 'Missing required field: idea' },
        { status: 400 }
      );
    }

    // Prepare data structure
    const pdfData = {
      idea,
      questions: questions || [],
      steps: steps || [],
      blueprint: blueprint || { epics: {} },
      kanbanMarkdown: kanbanMarkdown || '',
    };

    console.log('Prepared PDF data, generating PDF...');
    
    // Generate PDF using React.createElement (API routes are .ts files, not .tsx)
    // Type assertion needed because TypeScript doesn't infer that PDFTemplate returns Document
    const pdfElement = React.createElement(PDFTemplate, { data: pdfData }) as any;
    const pdfStream = await pdf(pdfElement).toBuffer();
    
    // Convert ReadableStream to Buffer using Node.js stream utilities
    const nodeStream = Readable.fromWeb(pdfStream as any);
    const chunks: Buffer[] = [];
    
    for await (const chunk of nodeStream) {
      chunks.push(Buffer.from(chunk));
    }
    
    const pdfBuffer = Buffer.concat(chunks);
    console.log('PDF generated successfully, size:', pdfBuffer.length);
    
    // Return PDF blob
    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': 'attachment; filename="setup-guide.pdf"',
      },
    });
  } catch (error) {
    console.error('PDF Generation Error:', error);
    console.error('Error name:', error instanceof Error ? error.name : 'Unknown');
    console.error('Error message:', error instanceof Error ? error.message : 'Unknown error');
    console.error('Error stack:', error instanceof Error ? error.stack : 'No stack trace');
    
    return NextResponse.json(
      {
        error: 'Failed to generate PDF',
        details: error instanceof Error ? error.message : 'Unknown error',
        name: error instanceof Error ? error.name : undefined,
        stack: process.env.NODE_ENV === 'development' && error instanceof Error ? error.stack : undefined,
      },
      { status: 500 }
    );
  }
}

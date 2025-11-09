import { z } from 'zod';

// Question schema for API responses
export const QuestionSchema = z.object({
  id: z.string().min(1),
  text: z.string().min(1),
  type: z.enum(['text', 'select']),
  options: z.array(z.string()).optional(),
  placeholder: z.string().optional(),
});

// Generate Questions API Response Schema
export const GenerateQuestionsResponseSchema = z.object({
  questions: z.array(QuestionSchema).min(1),
  readyToGenerate: z.boolean(),
});

// Check Readiness API Response Schema
export const CheckReadinessResponseSchema = z.object({
  readyToGenerate: z.boolean(),
  needsMoreQuestions: z.boolean(),
  nextQuestions: z.array(QuestionSchema).optional(),
});

// Generate API Response Schema (simplified - full schema would include all output fields)
export const GenerateResponseSchema = z.object({
  provider: z.string().optional(),
  model: z.string().optional(),
  idea: z.string(),
  answers: z.record(z.string()).optional(),
  output: z.object({
    top5: z.array(z.object({
      title: z.string(),
      cursorPrompt: z.string().optional(),
      command: z.string().optional(),
      supabaseTip: z.string().optional(),
    })),
    kanbanMarkdown: z.string(),
    blueprint: z.object({
      epics: z.object({
        input: z.array(z.string()).optional(),
        output: z.array(z.string()).optional(),
        export: z.array(z.string()).optional(),
        history: z.array(z.string()).optional(),
      }),
    }),
    pdfMeta: z.object({
      appName: z.string(),
      gradient: z.tuple([z.string(), z.string()]).optional(),
      timestamp: z.string().optional(),
    }).optional(),
  }),
  timestamp: z.string().optional(),
}).passthrough(); // Allow extra fields

// Type guards
export function isValidGenerateQuestionsResponse(data: unknown): data is z.infer<typeof GenerateQuestionsResponseSchema> {
  return GenerateQuestionsResponseSchema.safeParse(data).success;
}

export function isValidCheckReadinessResponse(data: unknown): data is z.infer<typeof CheckReadinessResponseSchema> {
  return CheckReadinessResponseSchema.safeParse(data).success;
}

export function isValidGenerateResponse(data: unknown): data is z.infer<typeof GenerateResponseSchema> {
  return GenerateResponseSchema.safeParse(data).success;
}

// Validation helpers that throw on invalid data
export function validateGenerateQuestionsResponse(data: unknown): z.infer<typeof GenerateQuestionsResponseSchema> {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid response: data is not an object');
  }
  try {
    return GenerateQuestionsResponseSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid response structure: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`);
    }
    throw error;
  }
}

export function validateCheckReadinessResponse(data: unknown): z.infer<typeof CheckReadinessResponseSchema> {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid response: data is not an object');
  }
  try {
    return CheckReadinessResponseSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      throw new Error(`Invalid response structure: ${error.errors.map(e => `${e.path.join('.')}: ${e.message}`).join(', ')}`);
    }
    throw error;
  }
}

export function validateGenerateResponse(data: unknown): z.infer<typeof GenerateResponseSchema> {
  if (!data || typeof data !== 'object') {
    throw new Error('Invalid response: data is not an object');
  }
  
  // Check if it's already a valid structure before parsing
  const dataObj = data as Record<string, unknown>;
  
  // Ensure required fields exist
  if (!dataObj.output || typeof dataObj.output !== 'object') {
    throw new Error('Invalid response: missing or invalid "output" field');
  }
  
  const output = dataObj.output as Record<string, unknown>;
  if (!output.top5 || !Array.isArray(output.top5)) {
    throw new Error('Invalid response: missing or invalid "output.top5" field');
  }
  
  if (!output.kanbanMarkdown || typeof output.kanbanMarkdown !== 'string') {
    throw new Error('Invalid response: missing or invalid "output.kanbanMarkdown" field');
  }
  
  if (!output.blueprint || typeof output.blueprint !== 'object') {
    throw new Error('Invalid response: missing or invalid "output.blueprint" field');
  }
  
  try {
    return GenerateResponseSchema.parse(data);
  } catch (error) {
    if (error instanceof z.ZodError) {
      // For generate response, be more lenient - log but don't fail completely
      console.warn('Response validation warnings:', error.errors);
      // Return the data anyway, but log the issues
      return data as z.infer<typeof GenerateResponseSchema>;
    }
    throw error;
  }
}


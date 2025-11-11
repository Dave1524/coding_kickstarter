import axios, { AxiosRequestConfig } from 'axios';

/**
 * DANGER: NEVER EXPOSE IN CLIENT
 * This function should NOT be used directly from client components.
 * Use API routes (/api/generate, /api/generate-questions) instead.
 * 
 * This function is kept for backward compatibility but should be deprecated.
 * The OpenAI API key must NEVER be exposed to the client.
 */
export async function callOpenAI(prompt: string) {
  // DANGER: This function should only be used server-side
  // Client components must use API routes instead
  if (typeof window !== 'undefined') {
    throw new Error('callOpenAI cannot be used in client components. Use /api/generate or /api/generate-questions instead.');
  }

  // Server-side only: use server environment variable
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY not found. This function must be called server-side.');
  }

  try {
    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      },
      {
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
      }
    );
    
    return response.data.choices[0].message.content;
  } catch (error) {
    console.error('Error calling OpenAI:', error);
    throw error;
  }
}

// Generic API call helper
export async function fetchAPI<T = unknown>(url: string, options: AxiosRequestConfig = {}) {
  try {
    const response = await axios({
      method: 'get',
      url,
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...(options.headers ?? {}),
      },
    });
    return response.data as T;
  } catch (error) {
    console.error('API Error:', error);
    throw error;
  }
}

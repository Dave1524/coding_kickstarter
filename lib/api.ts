import axios, { AxiosRequestConfig } from 'axios';

// Helper function to call OpenAI API
export async function callOpenAI(prompt: string) {
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
          'Authorization': `Bearer ${process.env.NEXT_PUBLIC_OPENAI_API_KEY}`,
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

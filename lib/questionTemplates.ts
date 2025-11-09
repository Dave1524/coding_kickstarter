// Question templates for common project types
// These can be used as fallbacks or suggestions when AI-generated questions aren't available

export type ProjectType = 'ecommerce' | 'blog' | 'saas' | 'social' | 'dashboard' | 'portfolio' | 'todo' | 'chat';

export interface QuestionTemplate {
  id: string;
  text: string;
  type: 'text' | 'select';
  options?: string[];
  placeholder?: string;
}

const TEMPLATES: Record<ProjectType, QuestionTemplate[]> = {
  ecommerce: [
    {
      id: 'ecom-1',
      text: 'What products or services will you be selling?',
      type: 'text',
      placeholder: 'e.g., Physical products, digital downloads, subscriptions...',
    },
    {
      id: 'ecom-2',
      text: 'Do you need payment processing integration?',
      type: 'select',
      options: ['Yes, Stripe', 'Yes, PayPal', 'Yes, both', 'Not yet'],
    },
    {
      id: 'ecom-3',
      text: 'How many products do you expect to have initially?',
      type: 'select',
      options: ['1-10', '11-50', '51-200', '200+'],
    },
    {
      id: 'ecom-4',
      text: 'Do you need inventory management?',
      type: 'select',
      options: ['Yes', 'No', 'Maybe later'],
    },
  ],
  blog: [
    {
      id: 'blog-1',
      text: 'What topics will you be writing about?',
      type: 'text',
      placeholder: 'e.g., Technology, Travel, Food...',
    },
    {
      id: 'blog-2',
      text: 'Do you need a content management system (CMS)?',
      type: 'select',
      options: ['Yes, built-in editor', 'Yes, markdown', 'No, static pages'],
    },
    {
      id: 'blog-3',
      text: 'Do you want comments functionality?',
      type: 'select',
      options: ['Yes', 'No', 'Maybe later'],
    },
    {
      id: 'blog-4',
      text: 'Will you have multiple authors?',
      type: 'select',
      options: ['Yes', 'No', 'Maybe later'],
    },
  ],
  saas: [
    {
      id: 'saas-1',
      text: 'What problem does your SaaS solve?',
      type: 'text',
      placeholder: 'Describe the main value proposition...',
    },
    {
      id: 'saas-2',
      text: 'What pricing model will you use?',
      type: 'select',
      options: ['Free tier + paid', 'Freemium', 'Paid only', 'Not sure'],
    },
    {
      id: 'saas-3',
      text: 'Do you need user authentication?',
      type: 'select',
      options: ['Yes, email/password', 'Yes, OAuth (Google/GitHub)', 'Both', 'Not yet'],
    },
    {
      id: 'saas-4',
      text: 'Will users have different permission levels?',
      type: 'select',
      options: ['Yes, admin/user', 'Yes, multiple roles', 'No, single role'],
    },
  ],
  social: [
    {
      id: 'social-1',
      text: 'What type of social interactions will users have?',
      type: 'text',
      placeholder: 'e.g., Posts, comments, likes, follows...',
    },
    {
      id: 'social-2',
      text: 'Do you need real-time features (live updates)?',
      type: 'select',
      options: ['Yes, essential', 'Yes, nice to have', 'No'],
    },
    {
      id: 'social-3',
      text: 'Will users upload media (images/videos)?',
      type: 'select',
      options: ['Yes, images', 'Yes, videos', 'Both', 'No'],
    },
    {
      id: 'social-4',
      text: 'Do you need a feed algorithm or chronological?',
      type: 'select',
      options: ['Algorithm-based', 'Chronological', 'Not sure'],
    },
  ],
  dashboard: [
    {
      id: 'dash-1',
      text: 'What data will you be visualizing?',
      type: 'text',
      placeholder: 'e.g., Sales metrics, user analytics, system stats...',
    },
    {
      id: 'dash-2',
      text: 'Do you need real-time data updates?',
      type: 'select',
      options: ['Yes, live updates', 'Yes, periodic refresh', 'No'],
    },
    {
      id: 'dash-3',
      text: 'What types of charts/graphs do you need?',
      type: 'select',
      options: ['Line charts', 'Bar charts', 'Pie charts', 'Multiple types'],
    },
    {
      id: 'dash-4',
      text: 'Will multiple users access the dashboard?',
      type: 'select',
      options: ['Yes, team access', 'Yes, public', 'No, personal'],
    },
  ],
  portfolio: [
    {
      id: 'port-1',
      text: 'What type of work will you showcase?',
      type: 'text',
      placeholder: 'e.g., Web design, photography, writing samples...',
    },
    {
      id: 'port-2',
      text: 'Do you need a contact form?',
      type: 'select',
      options: ['Yes', 'No', 'Maybe later'],
    },
    {
      id: 'port-3',
      text: 'Will you have a blog section?',
      type: 'select',
      options: ['Yes', 'No', 'Maybe later'],
    },
    {
      id: 'port-4',
      text: 'Do you need project filtering/categories?',
      type: 'select',
      options: ['Yes', 'No'],
    },
  ],
  todo: [
    {
      id: 'todo-1',
      text: 'How many users will use this app?',
      type: 'select',
      options: ['Just me', 'Small team (2-10)', 'Large team (10+)', 'Public'],
    },
    {
      id: 'todo-2',
      text: 'Do you need task collaboration features?',
      type: 'select',
      options: ['Yes', 'No', 'Maybe later'],
    },
    {
      id: 'todo-3',
      text: 'What task organization features do you need?',
      type: 'select',
      options: ['Lists only', 'Lists + tags', 'Lists + categories', 'Full project management'],
    },
    {
      id: 'todo-4',
      text: 'Do you need reminders/notifications?',
      type: 'select',
      options: ['Yes, email', 'Yes, in-app', 'Both', 'No'],
    },
  ],
  chat: [
    {
      id: 'chat-1',
      text: 'What type of chat will this be?',
      type: 'select',
      options: ['One-on-one messaging', 'Group chats', 'Public channels', 'All of the above'],
    },
    {
      id: 'chat-2',
      text: 'Do you need real-time messaging?',
      type: 'select',
      options: ['Yes, essential', 'Yes, nice to have', 'No'],
    },
    {
      id: 'chat-3',
      text: 'Will users share files/media?',
      type: 'select',
      options: ['Yes, images', 'Yes, files', 'Both', 'No'],
    },
    {
      id: 'chat-4',
      text: 'Do you need message history/search?',
      type: 'select',
      options: ['Yes', 'No', 'Maybe later'],
    },
  ],
};

// Detect project type from idea keywords
export function detectProjectType(idea: string): ProjectType | null {
  const lowerIdea = idea.toLowerCase();
  
  const keywords: Record<ProjectType, string[]> = {
    ecommerce: ['shop', 'store', 'buy', 'sell', 'product', 'cart', 'checkout', 'payment', 'ecommerce', 'e-commerce'],
    blog: ['blog', 'article', 'post', 'write', 'content', 'publish'],
    saas: ['saas', 'subscription', 'software', 'service', 'platform', 'tool'],
    social: ['social', 'feed', 'post', 'follow', 'like', 'share', 'network'],
    dashboard: ['dashboard', 'analytics', 'metrics', 'data', 'chart', 'graph', 'report'],
    portfolio: ['portfolio', 'showcase', 'work', 'projects', 'gallery'],
    todo: ['todo', 'task', 'reminder', 'list', 'checklist', 'organize'],
    chat: ['chat', 'message', 'messaging', 'conversation', 'talk'],
  };

  for (const [type, typeKeywords] of Object.entries(keywords)) {
    if (typeKeywords.some(keyword => lowerIdea.includes(keyword))) {
      return type as ProjectType;
    }
  }

  return null;
}

// Get template questions for a project type
export function getTemplateQuestions(type: ProjectType): QuestionTemplate[] {
  return TEMPLATES[type] || [];
}

// Suggest template if AI generation fails
export function getSuggestedQuestions(idea: string): QuestionTemplate[] {
  const detectedType = detectProjectType(idea);
  if (detectedType) {
    return getTemplateQuestions(detectedType);
  }
  return [];
}


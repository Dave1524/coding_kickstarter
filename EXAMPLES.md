# 💻 Copy-Paste Code Examples

## For Complete Beginners: Code Templates

These are ready-to-use code snippets. Copy, paste, and modify!

---

## 1️⃣ Simple Home Page

**File:** `app/page.tsx`

```typescript
'use client';

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-br from-blue-500 to-purple-600 p-4">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <header className="text-white mb-12 text-center">
          <h1 className="text-6xl font-bold mb-4">🚀 Coding Kickstarter</h1>
          <p className="text-xl text-blue-100">Build AI-powered apps with Next.js</p>
        </header>

        {/* Features Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-12">
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-blue-600 mb-2">⚡ Fast</h2>
            <p className="text-gray-600">Lightning-quick performance</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-purple-600 mb-2">🤖 AI Ready</h2>
            <p className="text-gray-600">Integrated with OpenAI API</p>
          </div>
          
          <div className="bg-white p-6 rounded-lg shadow-lg">
            <h2 className="text-2xl font-bold text-pink-600 mb-2">☁️ Cloud Database</h2>
            <p className="text-gray-600">Supabase backend included</p>
          </div>
        </div>

        {/* Call to Action */}
        <div className="text-center">
          <button className="bg-white text-blue-600 px-8 py-4 rounded-lg font-bold text-lg hover:bg-blue-50 transition">
            Get Started Now
          </button>
        </div>
      </div>
    </main>
  );
}
```

---

## 2️⃣ Button Component

**File:** `components/Button.tsx`

```typescript
interface ButtonProps {
  text: string;
  onClick?: () => void;
  color?: 'blue' | 'purple' | 'pink';
}

export default function Button({ text, onClick, color = 'blue' }: ButtonProps) {
  const colors = {
    blue: 'bg-blue-500 hover:bg-blue-600',
    purple: 'bg-purple-500 hover:bg-purple-600',
    pink: 'bg-pink-500 hover:bg-pink-600',
  };

  return (
    <button
      onClick={onClick}
      className={`${colors[color]} text-white px-6 py-2 rounded-lg font-bold transition`}
    >
      {text}
    </button>
  );
}
```

**How to use in `page.tsx`:**
```typescript
import Button from '@/components/Button';

export default function Home() {
  return (
    <div>
      <Button text="Click Me!" color="blue" onClick={() => alert('Clicked!')} />
    </div>
  );
}
```

---

## 3️⃣ Fetch Data from Supabase

**File:** `app/users/page.tsx`

```typescript
'use client';

import { useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase';

interface User {
  id: string;
  email: string;
  name: string;
}

export default function UsersPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      const { data, error: fetchError } = await supabase
        .from('users')
        .select('*');
      
      if (fetchError) throw fetchError;
      setUsers(data || []);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Error fetching users');
    } finally {
      setLoading(false);
    }
  }

  if (loading) return <p>Loading...</p>;
  if (error) return <p className="text-red-500">Error: {error}</p>;

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">Users</h1>
      
      {users.length === 0 ? (
        <p>No users yet</p>
      ) : (
        <ul className="space-y-4">
          {users.map(user => (
            <li key={user.id} className="bg-gray-100 p-4 rounded-lg">
              <p className="font-bold">{user.name}</p>
              <p className="text-gray-600">{user.email}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
```

---

## 4️⃣ Form with Input

**File:** `app/create-user/page.tsx`

```typescript
'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';

export default function CreateUserPage() {
  const [email, setEmail] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault(); // Prevent page reload
    
    setLoading(true);
    setMessage('');

    try {
      const { data, error } = await supabase
        .from('users')
        .insert([{ email, name }]);

      if (error) throw error;

      setMessage('✅ User created successfully!');
      setEmail('');
      setName('');
    } catch (err) {
      setMessage(`❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Create User</h1>

      <form onSubmit={handleSubmit} className="space-y-4">
        {/* Name Input */}
        <div>
          <label className="block text-sm font-bold mb-2">Name</label>
          <input
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            className="w-full border border-gray-300 rounded-lg p-2"
            required
          />
        </div>

        {/* Email Input */}
        <div>
          <label className="block text-sm font-bold mb-2">Email</label>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="john@example.com"
            className="w-full border border-gray-300 rounded-lg p-2"
            required
          />
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Creating...' : 'Create User'}
        </button>
      </form>

      {/* Message Display */}
      {message && (
        <p className="mt-4 text-center font-bold">{message}</p>
      )}
    </div>
  );
}
```

---

## 5️⃣ Call OpenAI API

**File:** `app/ai-chat/page.tsx`

```typescript
'use client';

import { useState } from 'react';

export default function AIChatPage() {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleAskAI(e: React.FormEvent) {
    e.preventDefault();
    
    setLoading(true);
    setResponse('');

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt }),
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || 'Error calling API');
      
      setResponse(data.message);
      setPrompt('');
    } catch (err) {
      setResponse(`❌ Error: ${err instanceof Error ? err.message : 'Unknown error'}`);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">🤖 AI Chat</h1>

      <form onSubmit={handleAskAI} className="space-y-4 mb-6">
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          placeholder="Ask me anything..."
          className="w-full border border-gray-300 rounded-lg p-3 h-24"
          required
        />
        
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-bold py-2 rounded-lg hover:bg-blue-700 disabled:bg-gray-400"
        >
          {loading ? 'Thinking...' : 'Ask AI'}
        </button>
      </form>

      {response && (
        <div className="bg-gray-100 p-4 rounded-lg">
          <p className="whitespace-pre-wrap">{response}</p>
        </div>
      )}
    </div>
  );
}
```

**Backend API Route:** `app/api/chat/route.ts`

```typescript
import { NextRequest, NextResponse } from 'next/server';
import axios from 'axios';

export async function POST(request: NextRequest) {
  try {
    const { prompt } = await request.json();

    if (!prompt) {
      return NextResponse.json(
        { error: 'Prompt is required' },
        { status: 400 }
      );
    }

    const response = await axios.post(
      'https://api.openai.com/v1/chat/completions',
      {
        model: 'gpt-3.5-turbo',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
        max_tokens: 500,
      },
      {
        headers: {
          'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    const message = response.data.choices[0].message.content;

    return NextResponse.json({ message });
  } catch (error) {
    console.error('Error:', error);
    return NextResponse.json(
      { error: 'Error processing request' },
      { status: 500 }
    );
  }
}
```

---

## 6️⃣ Navigation Header

**File:** `components/Header.tsx`

```typescript
import Link from 'next/link';

export default function Header() {
  return (
    <header className="bg-blue-600 text-white p-4 shadow-lg">
      <nav className="max-w-4xl mx-auto flex justify-between items-center">
        <Link href="/" className="text-2xl font-bold">
          🚀 Kickstarter
        </Link>
        
        <ul className="flex gap-6">
          <li>
            <Link href="/" className="hover:text-blue-200">
              Home
            </Link>
          </li>
          <li>
            <Link href="/users" className="hover:text-blue-200">
              Users
            </Link>
          </li>
          <li>
            <Link href="/ai-chat" className="hover:text-blue-200">
              AI Chat
            </Link>
          </li>
        </ul>
      </nav>
    </header>
  );
}
```

**Update `app/layout.tsx` to use it:**

```typescript
import Header from '@/components/Header';
import './globals.css';

export const metadata = {
  title: 'Coding Kickstarter',
  description: 'AI-powered learning platform',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body>
        <Header />
        <main>{children}</main>
      </body>
    </html>
  );
}
```

---

## 7️⃣ Loading State Component

**File:** `components/LoadingSpinner.tsx`

```typescript
export default function LoadingSpinner() {
  return (
    <div className="flex justify-center items-center p-8">
      <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
    </div>
  );
}
```

---

## 8️⃣ Error Message Component

**File:** `components/ErrorMessage.tsx`

```typescript
interface ErrorMessageProps {
  message: string;
}

export default function ErrorMessage({ message }: ErrorMessageProps) {
  return (
    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-lg">
      <p className="font-bold">❌ Error</p>
      <p>{message}</p>
    </div>
  );
}
```

---

## 🎯 How to Use These Examples

1. **Copy the code** from the example above
2. **Create a new file** with the suggested filename
3. **Paste the code** into the file
4. **Save** with Ctrl+S
5. **Navigate** to the page in your browser (e.g., `http://localhost:3000/users`)

---

## 📌 Important Notes

### About `'use client'`
- Put at top of file if you use hooks like `useState`, `useEffect`
- Next.js components are "server" by default
- Only use `'use client'` when you need browser features

### Import Paths
- `@/` is a shortcut for your project root
- `@/components` = `components/` folder
- `@/lib` = `lib/` folder

### Tailwind Classes
- `p-6` = padding 6
- `mb-6` = margin-bottom 6
- `text-3xl` = large text
- `font-bold` = bold text
- `hover:bg-blue-700` = change color on hover
- `disabled:bg-gray-400` = grayed out when disabled

---

## 🚀 Next: Try It!

Pick one example and implement it now! Start with #1 (Simple Home Page) or #6 (Navigation Header).

Happy coding! 💻

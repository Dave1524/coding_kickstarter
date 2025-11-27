/**
 * ZIP Download Fallback API
 * Generates a ZIP file of the boilerplate template for users without GitHub OAuth
 * Rate limited to prevent abuse
 */

import { NextRequest, NextResponse } from 'next/server';
import AdmZip from 'adm-zip';
import { Ratelimit } from '@upstash/ratelimit';
import { Redis } from '@upstash/redis';
import {
  createProjectConfig,
  generateEnvExample,
  generateReadme,
  generateCursorRules,
  generatePackageJson,
  DEFAULT_STACK,
  type StackConfig,
} from '@/lib/boilerplate-generator';

// Rate limiter: 10 downloads per hour per IP
const ratelimit = process.env.UPSTASH_REDIS_REST_URL
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, '1 h'),
      analytics: true,
      prefix: 'ratelimit:zip-download',
    })
  : null;

// Base template files (embedded for serverless compatibility)
const BASE_TEMPLATE_FILES: Record<string, string> = {
  'tsconfig.json': `{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [{ "name": "next" }],
    "paths": { "@/*": ["./*"] }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}`,

  'next.config.ts': `import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '*.googleusercontent.com' },
      { protocol: 'https', hostname: '*.supabase.co' },
    ],
  },
};

export default nextConfig;`,

  'tailwind.config.ts': `import type { Config } from 'tailwindcss';

const config: Config = {
  darkMode: ['class'],
  content: ['./pages/**/*.{js,ts,jsx,tsx,mdx}', './components/**/*.{js,ts,jsx,tsx,mdx}', './app/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    container: { center: true, padding: '2rem', screens: { '2xl': '1400px' } },
    extend: {
      colors: {
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
      },
      borderRadius: { lg: 'var(--radius)', md: 'calc(var(--radius) - 2px)', sm: 'calc(var(--radius) - 4px)' },
    },
  },
  plugins: [require('tailwindcss-animate')],
};

export default config;`,

  'postcss.config.mjs': `const config = { plugins: { tailwindcss: {}, autoprefixer: {} } };
export default config;`,

  'app/layout.tsx': `import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: '{{DISPLAY_NAME}}',
  description: '{{PROJECT_DESCRIPTION}}',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={inter.className}>{children}</body>
    </html>
  );
}`,

  'app/globals.css': `@tailwind base;
@tailwind components;
@tailwind utilities;

@layer base {
  :root {
    --background: 0 0% 100%;
    --foreground: 222.2 84% 4.9%;
    --card: 0 0% 100%;
    --card-foreground: 222.2 84% 4.9%;
    --popover: 0 0% 100%;
    --popover-foreground: 222.2 84% 4.9%;
    --primary: 222.2 47.4% 11.2%;
    --primary-foreground: 210 40% 98%;
    --secondary: 210 40% 96.1%;
    --secondary-foreground: 222.2 47.4% 11.2%;
    --muted: 210 40% 96.1%;
    --muted-foreground: 215.4 16.3% 46.9%;
    --accent: 210 40% 96.1%;
    --accent-foreground: 222.2 47.4% 11.2%;
    --destructive: 0 84.2% 60.2%;
    --destructive-foreground: 210 40% 98%;
    --border: 214.3 31.8% 91.4%;
    --input: 214.3 31.8% 91.4%;
    --ring: 222.2 84% 4.9%;
    --radius: 0.5rem;
  }
  .dark {
    --background: 222.2 84% 4.9%;
    --foreground: 210 40% 98%;
    --card: 222.2 84% 4.9%;
    --card-foreground: 210 40% 98%;
    --popover: 222.2 84% 4.9%;
    --popover-foreground: 210 40% 98%;
    --primary: 210 40% 98%;
    --primary-foreground: 222.2 47.4% 11.2%;
    --secondary: 217.2 32.6% 17.5%;
    --secondary-foreground: 210 40% 98%;
    --muted: 217.2 32.6% 17.5%;
    --muted-foreground: 215 20.2% 65.1%;
    --accent: 217.2 32.6% 17.5%;
    --accent-foreground: 210 40% 98%;
    --destructive: 0 62.8% 30.6%;
    --destructive-foreground: 210 40% 98%;
    --border: 217.2 32.6% 17.5%;
    --input: 217.2 32.6% 17.5%;
    --ring: 212.7 26.8% 83.9%;
  }
}

@layer base {
  * { @apply border-border; }
  body { @apply bg-background text-foreground; }
}`,

  'app/(marketing)/page.tsx': `import Link from 'next/link';

export default function HomePage() {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur">
        <div className="container flex h-14 items-center">
          <Link href="/" className="mr-6 flex items-center space-x-2">
            <span className="font-bold">{{DISPLAY_NAME}}</span>
          </Link>
          <div className="flex flex-1 items-center justify-end">
            <Link href="/dashboard" className="bg-primary px-4 py-2 text-sm font-medium text-primary-foreground rounded-md hover:bg-primary/90">
              Get Started
            </Link>
          </div>
        </div>
      </header>
      <main className="flex-1">
        <section className="space-y-6 pb-8 pt-6 md:pb-12 md:pt-10 lg:py-32">
          <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
            <h1 className="text-3xl font-bold sm:text-5xl md:text-6xl lg:text-7xl">Welcome to {{DISPLAY_NAME}}</h1>
            <p className="max-w-[42rem] text-muted-foreground sm:text-xl">{{PROJECT_DESCRIPTION}}</p>
            <div className="flex gap-4">
              <Link href="/dashboard" className="bg-primary px-8 py-3 text-sm font-medium text-primary-foreground rounded-md hover:bg-primary/90">Get Started</Link>
            </div>
          </div>
        </section>
      </main>
      <footer className="border-t py-6">
        <div className="container text-center text-sm text-muted-foreground">
          Built with <a href="https://codingkickstarter.com" className="underline">Coding Kickstarter</a>
        </div>
      </footer>
    </div>
  );
}`,

  'app/(marketing)/layout.tsx': `export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}`,

  'app/(app)/layout.tsx': `export default function AppLayout({ children }: { children: React.ReactNode }) {
  return <div className="flex min-h-screen flex-col"><main className="flex-1">{children}</main></div>;
}`,

  'app/(app)/dashboard/page.tsx': `import Link from 'next/link';

export default function DashboardPage() {
  return (
    <div className="container py-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Dashboard</h1>
          <p className="text-muted-foreground">Welcome to your {{DISPLAY_NAME}} dashboard</p>
        </div>
        <Link href="/" className="border px-4 py-2 rounded-md hover:bg-accent">← Back to Home</Link>
      </div>
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <div className="rounded-lg border p-6"><h3 className="text-sm font-medium">Total Users</h3><div className="text-2xl font-bold">0</div></div>
        <div className="rounded-lg border p-6"><h3 className="text-sm font-medium">Revenue</h3><div className="text-2xl font-bold">$0</div></div>
        <div className="rounded-lg border p-6"><h3 className="text-sm font-medium">Subscriptions</h3><div className="text-2xl font-bold">0</div></div>
        <div className="rounded-lg border p-6"><h3 className="text-sm font-medium">Active Now</h3><div className="text-2xl font-bold">0</div></div>
      </div>
    </div>
  );
}`,

  'lib/utils.ts': `import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}`,

  'components/ui/button.tsx': `import * as React from 'react';
import { Slot } from '@radix-ui/react-slot';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

const buttonVariants = cva(
  'inline-flex items-center justify-center whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50',
  {
    variants: {
      variant: {
        default: 'bg-primary text-primary-foreground hover:bg-primary/90',
        destructive: 'bg-destructive text-destructive-foreground hover:bg-destructive/90',
        outline: 'border border-input bg-background hover:bg-accent hover:text-accent-foreground',
        secondary: 'bg-secondary text-secondary-foreground hover:bg-secondary/80',
        ghost: 'hover:bg-accent hover:text-accent-foreground',
        link: 'text-primary underline-offset-4 hover:underline',
      },
      size: { default: 'h-10 px-4 py-2', sm: 'h-9 rounded-md px-3', lg: 'h-11 rounded-md px-8', icon: 'h-10 w-10' },
    },
    defaultVariants: { variant: 'default', size: 'default' },
  }
);

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(({ className, variant, size, asChild = false, ...props }, ref) => {
  const Comp = asChild ? Slot : 'button';
  return <Comp className={cn(buttonVariants({ variant, size, className }))} ref={ref} {...props} />;
});
Button.displayName = 'Button';

export { Button, buttonVariants };`,
};

export async function GET(request: NextRequest) {
  // Rate limiting
  if (ratelimit) {
    const ip = request.headers.get('x-forwarded-for') ?? 'anonymous';
    const { success, remaining, reset } = await ratelimit.limit(ip);

    if (!success) {
      return NextResponse.json(
        {
          error: 'Rate limit exceeded',
          message: `Too many downloads. Try again in ${Math.ceil((reset - Date.now()) / 60000)} minutes.`,
          remaining: 0,
          reset,
        },
        {
          status: 429,
          headers: {
            'X-RateLimit-Remaining': '0',
            'X-RateLimit-Reset': reset.toString(),
          },
        }
      );
    }
  }

  // Get query parameters
  const searchParams = request.nextUrl.searchParams;
  const projectName = searchParams.get('projectName') || 'my-saas-app';
  const idea = searchParams.get('idea') || 'A SaaS application';
  const database = (searchParams.get('database') as 'supabase' | 'mongodb') || 'supabase';
  const payments = (searchParams.get('payments') as 'lemonsqueezy' | 'stripe') || 'lemonsqueezy';
  const emails = (searchParams.get('emails') as 'resend' | 'mailgun') || 'resend';

  // Create project config
  const stackConfig: StackConfig = {
    database,
    payments,
    emails,
    authProviders: ['magic-link', 'google'],
  };

  const config = createProjectConfig(projectName, idea, {}, stackConfig);

  // Generate ZIP
  const zip = new AdmZip();

  // Add base template files with placeholder replacement
  for (const [path, content] of Object.entries(BASE_TEMPLATE_FILES)) {
    const processedContent = applyPlaceholders(content, config);
    zip.addFile(path, Buffer.from(processedContent, 'utf8'));
  }

  // Add generated files
  zip.addFile('.env.example', Buffer.from(generateEnvExample(config), 'utf8'));
  zip.addFile('README.md', Buffer.from(generateReadme(config), 'utf8'));
  zip.addFile('.cursorrules', Buffer.from(generateCursorRules(config), 'utf8'));
  zip.addFile('package.json', Buffer.from(generatePackageJson(config), 'utf8'));

  // Add database-specific file
  if (database === 'supabase') {
    zip.addFile('lib/db.ts', Buffer.from(getSupabaseDbFile(), 'utf8'));
  } else {
    zip.addFile('lib/db.ts', Buffer.from(getMongoDbFile(), 'utf8'));
  }

  // Add payments-specific file
  if (payments === 'lemonsqueezy') {
    zip.addFile('lib/payments.ts', Buffer.from(getLemonSqueezyFile(), 'utf8'));
  } else {
    zip.addFile('lib/payments.ts', Buffer.from(getStripeFile(), 'utf8'));
  }

  // Add auth file
  zip.addFile('lib/auth.ts', Buffer.from(getAuthFile(), 'utf8'));

  // Get ZIP buffer
  const zipBuffer = zip.toBuffer();

  // Return ZIP file
  // Convert Buffer to Uint8Array for NextResponse compatibility
  return new NextResponse(new Uint8Array(zipBuffer), {
    status: 200,
    headers: {
      'Content-Type': 'application/zip',
      'Content-Disposition': `attachment; filename="${config.projectName}.zip"`,
      'Content-Length': zipBuffer.length.toString(),
    },
  });
}

function applyPlaceholders(content: string, config: ReturnType<typeof createProjectConfig>): string {
  return content
    .replace(/\{\{PROJECT_NAME\}\}/g, config.projectName)
    .replace(/\{\{DISPLAY_NAME\}\}/g, config.displayName)
    .replace(/\{\{PROJECT_DESCRIPTION\}\}/g, config.description)
    .replace(/\{\{DATABASE\}\}/g, config.stack.database)
    .replace(/\{\{PAYMENT_PROVIDER\}\}/g, config.stack.payments)
    .replace(/\{\{EMAIL_PROVIDER\}\}/g, config.stack.emails)
    .replace(/\{\{AUTH_PROVIDERS\}\}/g, config.stack.authProviders.join(', '))
    .replace(/\{\{YEAR\}\}/g, new Date().getFullYear().toString())
    .replace(/\{\{GENERATED_DATE\}\}/g, new Date().toISOString().split('T')[0]);
}

function getSupabaseDbFile(): string {
  return `import { createClient } from '@supabase/supabase-js';

export const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  { auth: { autoRefreshToken: false, persistSession: false } }
);`;
}

function getMongoDbFile(): string {
  return `import { MongoClient, Db } from 'mongodb';

const uri = process.env.MONGODB_URI!;
let client: MongoClient;
let db: Db;

export async function connectToDatabase(): Promise<Db> {
  if (db) return db;
  
  client = new MongoClient(uri);
  await client.connect();
  db = client.db();
  
  return db;
}

export { client, db };`;
}

function getLemonSqueezyFile(): string {
  return `import { lemonSqueezySetup, createCheckout } from '@lemonsqueezy/lemonsqueezy.js';

lemonSqueezySetup({ apiKey: process.env.LEMONSQUEEZY_API_KEY! });

export async function createCheckoutSession(variantId: string, userId: string, email: string) {
  const { data } = await createCheckout(process.env.LEMONSQUEEZY_STORE_ID!, variantId, {
    checkoutData: { email, custom: { user_id: userId } },
  });
  return data?.data?.attributes?.url;
}`;
}

function getStripeFile(): string {
  return `import Stripe from 'stripe';

export const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-12-18.acacia',
});

export async function createCheckoutSession(priceId: string, userId: string, email: string) {
  const session = await stripe.checkout.sessions.create({
    mode: 'subscription',
    payment_method_types: ['card'],
    line_items: [{ price: priceId, quantity: 1 }],
    customer_email: email,
    metadata: { userId },
    success_url: \`\${process.env.NEXT_PUBLIC_APP_URL}/dashboard?success=true\`,
    cancel_url: \`\${process.env.NEXT_PUBLIC_APP_URL}/pricing?canceled=true\`,
  });
  return session.url;
}`;
}

function getAuthFile(): string {
  return `import NextAuth from 'next-auth';
import Google from 'next-auth/providers/google';

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.AUTH_GOOGLE_ID!,
      clientSecret: process.env.AUTH_GOOGLE_SECRET!,
    }),
  ],
  pages: { signIn: '/login', error: '/login' },
  callbacks: {
    async session({ session, token }) {
      if (token.sub) session.user.id = token.sub;
      return session;
    },
  },
});`;
}


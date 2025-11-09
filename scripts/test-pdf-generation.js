// Test script to generate PDF with photographer example data
const http = require('http');
const fs = require('fs');
const path = require('path');

// Photographer portfolio example data
const testData = {
  idea: 'A photographer portfolio website to showcase my work and allow clients to book sessions',
  questions: [
    {
      q: 'What is your technical level?',
      a: 'Beginner - I know HTML/CSS basics but new to React',
    },
    {
      q: 'Do you need a booking system?',
      a: 'Yes, I want clients to be able to book photo sessions online',
    },
    {
      q: 'Will you have multiple galleries?',
      a: 'Yes, I want separate galleries for weddings, portraits, and events',
    },
  ],
  steps: [
    {
      step: 'Set up Next.js project with TypeScript',
      command: 'npx create-next-app@latest photographer-portfolio --typescript --tailwind --app',
      tip: 'This creates a modern Next.js app with TypeScript and Tailwind CSS',
    },
    {
      step: 'Install Supabase for database and authentication',
      command: 'npm install @supabase/supabase-js',
      tip: 'Supabase will handle your booking system and image storage',
    },
    {
      step: 'Create gallery components',
      command: 'Create components/Gallery.tsx with image grid layout',
      tip: 'Use Next.js Image component for optimized image loading',
    },
    {
      step: 'Set up booking form',
      command: 'Create app/booking/page.tsx with form validation',
      tip: 'Use Zod for form validation and Supabase to store bookings',
    },
    {
      step: 'Deploy to Vercel',
      command: 'vercel --prod',
      tip: 'Connect your GitHub repo to Vercel for automatic deployments',
    },
  ],
  blueprint: {
    epics: {
      input: [
        'Image upload and management',
        'Gallery creation and organization',
        'Contact form submission',
      ],
      output: [
        'Portfolio gallery display',
        'Image lightbox viewer',
        'Booking confirmation emails',
      ],
      export: [
        'PDF portfolio download',
        'Social media sharing',
      ],
      history: [
        'Booking history',
        'Client contact log',
      ],
    },
  },
  kanbanMarkdown: `| To Do | In Progress | Done |
|---|---|---|
| Set up Next.js project | Install dependencies | Design mockups |
| Create gallery components | Build booking form | Set up Supabase |
| Add image upload | Style portfolio pages | Deploy to Vercel |`,
};

// Test the API endpoint
const testPDFGeneration = async () => {
  const data = JSON.stringify(testData);
  
  const options = {
    hostname: 'localhost',
    port: 3000,
    path: '/api/generate-pdf',
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Content-Length': data.length,
    },
  };

  return new Promise((resolve, reject) => {
    const req = http.request(options, (res) => {
      const chunks = [];
      res.on('data', (chunk) => {
        chunks.push(chunk);
      });

      res.on('end', () => {
        const responseBody = Buffer.concat(chunks);
        
        if (res.statusCode !== 200) {
          // Try to parse error response
          let errorMsg = `Request failed with status ${res.statusCode}`;
          try {
            const errorJson = JSON.parse(responseBody.toString());
            errorMsg += `\nError: ${errorJson.error || 'Unknown error'}`;
            if (errorJson.details) errorMsg += `\nDetails: ${errorJson.details}`;
            if (errorJson.name) errorMsg += `\nName: ${errorJson.name}`;
            if (errorJson.stack) errorMsg += `\nStack:\n${errorJson.stack}`;
            console.error('\n📋 Full error response:', JSON.stringify(errorJson, null, 2));
          } catch (e) {
            errorMsg += `\nResponse body: ${responseBody.toString().substring(0, 500)}`;
          }
          reject(new Error(errorMsg));
          return;
        }

        // Success - write PDF file
        const outputPath = path.join(__dirname, '..', 'test-photographer-portfolio.pdf');
        fs.writeFileSync(outputPath, responseBody);
        console.log(`✅ PDF generated successfully: ${outputPath}`);
        resolve(responseBody);
      });
    });

    req.on('error', (error) => {
      console.error('❌ Error generating PDF:', error.message);
      console.log('\n💡 Make sure the dev server is running: npm run dev');
      reject(error);
    });

    req.write(data);
    req.end();
  });
};

// Run test
console.log('🧪 Testing PDF generation with photographer example data...\n');
testPDFGeneration().catch((error) => {
  console.error('Test failed:', error);
  process.exit(1);
});




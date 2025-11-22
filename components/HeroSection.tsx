"use client";

import { Button } from "@/components/ui/button";

/**
 * Coding Kickstarter - Hero Section
 * Version: 1.2 (Global background canvas)
 * Background animation is now handled by BackgroundCanvas component
 */

export function HeroSection() {
  const handlePrimaryCTA = () => {
    const mainContent = document.getElementById('main-content');
    if (mainContent) {
      // Get navbar height to account for sticky positioning
      const navbar = document.querySelector('nav');
      const navbarHeight = navbar ? navbar.offsetHeight : 0;
      
      // Calculate scroll position to show input form nicely below navbar
      const elementPosition = mainContent.getBoundingClientRect().top;
      const offsetPosition = elementPosition + window.pageYOffset - navbarHeight - 40; // 40px padding for better visibility
      
      window.scrollTo({
        top: Math.max(0, offsetPosition), // Ensure we don't scroll to negative position
        behavior: 'smooth'
      });
      
      // Focus the input field after scrolling (with a small delay for smooth scroll)
      setTimeout(() => {
        const input = document.querySelector('#idea') as HTMLTextAreaElement;
        if (input) {
          input.focus();
        }
      }, 500);
    }
  };

  const handleSecondaryCTA = () => {
    document.getElementById('examples')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section className="relative flex flex-col items-center justify-center min-h-[90vh] text-center px-6 overflow-hidden">
      {/* Hero-specific gradient overlay - semi-transparent to show animation */}
      <div className="absolute inset-0 bg-gradient-to-b from-background/50 to-background/20 z-0" />

      {/* Text Content */}
      <div className="relative z-10">
      <p className="text-sm font-medium tracking-wide text-primary/80 mb-3 animate-fadeIn">
        Your AI-Guided Startup Builder
      </p>
      <h1 className="text-5xl md:text-6xl font-bold tracking-tight max-w-3xl mx-auto mb-2 text-foreground animate-fadeIn [animation-delay:300ms]">
        From Zero Code to working app
      </h1>
      <p className="text-4xl md:text-5xl font-bold tracking-tight max-w-3xl mx-auto mb-6 text-foreground animate-fadeIn [animation-delay:400ms]">
        No experience needed
      </p>
      <p className="text-lg text-foreground max-w-2xl mx-auto mb-8 animate-fadeIn [animation-delay:500ms]">
        Coding Kickstarter gives non-technical builders a simple, guided path so you stop getting stuck and start shipping real software with AI — in days, not months.
      </p>
      <div className="flex gap-4 flex-wrap justify-center animate-fadeIn [animation-delay:700ms]">
        <Button 
          size="lg" 
          onClick={handlePrimaryCTA}
          className="bg-primary hover:bg-primary/90 text-primary-foreground"
        >
          Start Your First Blueprint →
        </Button>
        <Button 
          variant="outline" 
          size="lg"
          onClick={handleSecondaryCTA}
        >
          See Example Blueprints
        </Button>
      </div>
      </div>
    </section>
  );
}


"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useGSAP } from "@gsap/react";

// Register plugins outside component to avoid re-registration
if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, useGSAP);
}

interface ScrollRevealProps {
  children: React.ReactNode;
  className?: string;
  animation?: string;
  delay?: string;
  duration?: string;
}

export default function ScrollReveal({
  children,
  className,
  animation = "animate-fade-in",
  delay = "0ms",
  duration = "500",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);

  useGSAP(() => {
    // Parse delay (e.g., "100ms" -> 0.1)
    const delaySec = parseFloat(delay) / 1000 || 0;
    // Parse duration (e.g., "500" -> 0.5)
    const durationSec = parseFloat(duration) / 1000 || 0.8;

    // Configure animation based on prop
    // Default: Fade Up
    let fromVars: gsap.TweenVars = { autoAlpha: 0, y: 50 };
    let toVars: gsap.TweenVars = { 
      autoAlpha: 1, 
      y: 0, 
      duration: durationSec, 
      delay: delaySec, 
      ease: "power3.out" 
    };

    // Handle Slide In
    if (animation.includes("slide-in")) {
      fromVars = { autoAlpha: 0, x: -50 };
      toVars = { ...toVars, x: 0, y: 0 };
    }
    
    // GSAP ScrollTrigger
    gsap.fromTo(ref.current, 
      fromVars,
      {
        ...toVars,
        scrollTrigger: {
          trigger: ref.current,
          start: "top 85%", // Trigger when top of element hits 85% of viewport height
          end: "bottom top",
          toggleActions: "play none none reverse", // Play on enter, reverse on leave back up
        }
      }
    );
  }, { scope: ref, dependencies: [animation, delay, duration] });

  return (
    <div
      ref={ref}
      className={cn("invisible", className)} // Start invisible to prevent FOUC, GSAP autoAlpha handles this
    >
      {children}
    </div>
  );
}

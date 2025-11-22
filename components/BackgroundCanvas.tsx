"use client";

import { useEffect, useRef } from "react";
import { gsap } from "gsap";
import { useTheme } from "next-themes";

/**
 * Global animated background canvas for the entire page
 * Adapts colors based on light/dark theme for better contrast
 */
export function BackgroundCanvas() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tl = useRef<gsap.core.Timeline | null>(null);
  const { theme, systemTheme } = useTheme();
  const currentTheme = theme === "system" ? systemTheme : theme || "light";

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Initialize canvas size
    const initialWidth = window.innerWidth;
    const initialHeight = window.innerHeight;
    canvas.width = initialWidth;
    canvas.height = initialHeight;

    // Blueprint dot network - declare before resizeCanvas
    const dots = Array.from({ length: 60 }, () => ({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      r: Math.random() * 2 + 0.5,
      dx: Math.random() * 0.6 - 0.3,
      dy: Math.random() * 0.6 - 0.3,
    }));

    const resizeCanvas = () => {
      const newWidth = window.innerWidth;
      const newHeight = window.innerHeight;
      canvas.width = newWidth;
      canvas.height = newHeight;
      
      // Reposition dots if they're outside bounds after resize
      dots.forEach((d) => {
        if (d.x > newWidth) d.x = newWidth;
        if (d.y > newHeight) d.y = newHeight;
      });
    };
    
    window.addEventListener("resize", resizeCanvas);

    function draw() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      
      // Theme-aware colors with higher contrast
      // For dark mode: use lighter amber with higher opacity
      // For light mode: use darker amber with higher opacity
      const isDark = currentTheme === "dark";
      
      if (isDark) {
        // Dark mode: lighter amber, more visible
        ctx.strokeStyle = "rgba(251, 191, 36, 0.35)"; // chart-1 with 35% opacity
        ctx.fillStyle = "rgba(251, 191, 36, 0.4)"; // chart-1 with 40% opacity
      } else {
        // Light mode: darker amber, more visible
        ctx.strokeStyle = "rgba(217, 119, 6, 0.3)"; // chart-2 with 30% opacity
        ctx.fillStyle = "rgba(217, 119, 6, 0.35)"; // chart-2 with 35% opacity
      }

      dots.forEach((d) => {
        d.x += d.dx;
        d.y += d.dy;

        // Bounce off edges
        if (d.x < 0 || d.x > canvas.width) d.dx *= -1;
        if (d.y < 0 || d.y > canvas.height) d.dy *= -1;

        ctx.beginPath();
        ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
        ctx.fill();
      });

      // Draw connecting lines for nearby points
      for (let i = 0; i < dots.length; i++) {
        for (let j = i + 1; j < dots.length; j++) {
          const dx = dots[i].x - dots[j].x;
          const dy = dots[i].y - dots[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < 120) {
            ctx.beginPath();
            ctx.moveTo(dots[i].x, dots[i].y);
            ctx.lineTo(dots[j].x, dots[j].y);
            ctx.stroke();
          }
        }
      }
    }

    tl.current = gsap.timeline({ repeat: -1, defaults: { ease: "sine.inOut" } });
    tl.current.to(dots, {
      duration: 6,
      dx: "+=random(-0.3,0.3)",
      dy: "+=random(-0.3,0.3)",
      repeat: -1,
      yoyo: true,
    });

    // Initial draw to show canvas immediately
    draw();
    
    gsap.ticker.add(draw);

    return () => {
      gsap.ticker.remove(draw);
      window.removeEventListener("resize", resizeCanvas);
      tl.current?.kill();
    };
  }, [currentTheme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
      style={{ opacity: 0.6 }}
    />
  );
}


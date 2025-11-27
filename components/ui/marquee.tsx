"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface MarqueeProps extends React.HTMLAttributes<HTMLDivElement> {
  /**
   * Direction of the marquee animation
   * @default "left"
   */
  direction?: "left" | "right"
  /**
   * Animation duration in seconds
   * @default 20
   */
  duration?: number
  /**
   * Whether to pause on hover
   * @default false
   */
  pauseOnHover?: boolean
  /**
   * Reverse the animation direction
   * @default false
   */
  reverse?: boolean
  /**
   * Number of times to duplicate the content for seamless loop
   * @default 2
   */
  duplicate?: number
}

const Marquee = React.forwardRef<HTMLDivElement, MarqueeProps>(
  (
    {
      className,
      children,
      direction = "left",
      duration = 20,
      pauseOnHover = false,
      reverse = false,
      duplicate = 2,
      ...props
    },
    ref
  ) => {
    // direction="left" means content moves left (normal), direction="right" means content moves right (reverse)
    const isReversed = reverse || direction === "right"
    const animationClass = isReversed ? "animate-marquee-reverse" : "animate-marquee"
    
    // Clone children for seamless loop
    const duplicatedContent = React.useMemo(() => {
      return Array.from({ length: duplicate }).map((_, i) => (
        <React.Fragment key={`marquee-${i}`}>
          {children}
        </React.Fragment>
      ))
    }, [children, duplicate])

    return (
      <div
        ref={ref}
        className={cn(
          "group flex overflow-hidden",
          className
        )}
        {...props}
      >
        <div
          className={cn(
            "flex shrink-0",
            animationClass,
            pauseOnHover && "group-hover:[animation-play-state:paused]"
          )}
          style={{
            animationDuration: `${duration}s`,
            gap: "var(--gap, 1.5rem)",
          }}
        >
          {duplicatedContent}
        </div>
      </div>
    )
  }
)
Marquee.displayName = "Marquee"

export { Marquee }

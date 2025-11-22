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
    
    // Touch/swipe state for mobile
    const [isDragging, setIsDragging] = React.useState(false)
    const [touchStart, setTouchStart] = React.useState(0)
    const [touchOffset, setTouchOffset] = React.useState(0)
    const [animationPaused, setAnimationPaused] = React.useState(false)
    const containerRef = React.useRef<HTMLDivElement>(null)
    
    // Clone children for seamless loop
    const duplicatedContent = React.useMemo(() => {
      return Array.from({ length: duplicate }).map((_, i) => (
        <React.Fragment key={`marquee-${i}`}>
          {children}
        </React.Fragment>
      ))
    }, [children, duplicate])

    // Touch event handlers
    const handleTouchStart = (e: React.TouchEvent) => {
      const touch = e.touches[0]
      setTouchStart(touch.clientX)
      setIsDragging(true)
      setAnimationPaused(true)
    }

    const handleTouchMove = (e: React.TouchEvent) => {
      if (!isDragging) return
      e.preventDefault() // Prevent page scroll while dragging marquee
      const touch = e.touches[0]
      const delta = touch.clientX - touchStart
      setTouchOffset(delta)
    }

    const handleTouchEnd = () => {
      setIsDragging(false)
      setTouchStart(0)
      setTouchOffset(0)
      // Resume animation smoothly after touch ends
      setTimeout(() => {
        setAnimationPaused(false)
      }, 50)
    }

    // Combine refs
    const combinedRef = React.useCallback(
      (node: HTMLDivElement) => {
        containerRef.current = node
        if (typeof ref === "function") {
          ref(node)
        } else if (ref) {
          ref.current = node
        }
      },
      [ref]
    )

    return (
      <div
        ref={combinedRef}
        className={cn(
          "group flex overflow-hidden touch-pan-x",
          className
        )}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
        onTouchEnd={handleTouchEnd}
        onTouchCancel={handleTouchEnd}
        {...props}
      >
        <div
          className={cn(
            "flex shrink-0",
            animationClass,
            pauseOnHover && "group-hover:[animation-play-state:paused]",
            animationPaused && "[animation-play-state:paused]"
          )}
          style={{
            animationDuration: `${duration}s`,
            gap: "var(--gap, 1.5rem)",
            ...(isDragging && {
              transform: `translateX(${touchOffset}px)`,
            }),
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


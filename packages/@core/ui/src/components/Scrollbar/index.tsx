import * as React from "react"
import { cn } from "../../utils"
import { ScrollArea } from "../ScrollArea"

interface ScrollbarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 是否水平滚动 */
  horizontal?: boolean
  /** 是否显示阴影 */
  shadow?: boolean
  /** 是否显示阴影边框 */
  shadowBorder?: boolean
  /** 是否显示底部阴影 */
  shadowBottom?: boolean
  /** 是否显示左侧阴影 */
  shadowLeft?: boolean
  /** 是否显示右侧阴影 */
  shadowRight?: boolean
  /** 是否显示顶部阴影 */
  shadowTop?: boolean
  /** 滚动位置变化回调 */
  onScrollAt?: (position: { bottom: boolean; left: boolean; right: boolean; top: boolean }) => void
  /** 视口类名 */
  viewportClassName?: string
}

/** 滚动到达边缘的阈值（像素） */
const ARRIVED_STATE_THRESHOLD_PIXELS = 1

/**
 * Scrollbar 组件
 * 
 * 这是一个增强版的滚动容器：
 * 1. 内部复用了 ScrollArea 组件 (Radix UI)，提供美观的自定义滚动条
 * 2. 添加了顶部/底部的阴影遮罩逻辑
 */
const Scrollbar = React.forwardRef<
  HTMLDivElement,
  ScrollbarProps
>(({ 
  className,
  children,
  horizontal = false,
  shadow = false,
  shadowBorder = false,
  shadowBottom = true,
  shadowLeft = false,
  shadowRight = false,
  shadowTop = true,
  onScrollAt,
  style,
  viewportClassName,
  ...props 
}, ref) => {
  // 滚动状态
  const [isAtTop, setIsAtTop] = React.useState(true)
  const [isAtBottom, setIsAtBottom] = React.useState(true)
  const [isAtLeft, setIsAtLeft] = React.useState(true)
  const [isAtRight, setIsAtRight] = React.useState(true)
  
  const viewportRef = React.useRef<HTMLDivElement>(null)

  const showShadowTop = shadow && shadowTop
  const showShadowBottom = shadow && shadowBottom

  // 检查滚动位置
  const checkScrollState = React.useCallback((target: HTMLElement) => {
    const scrollTop = target.scrollTop
    const scrollLeft = target.scrollLeft
    const clientHeight = target.clientHeight
    const clientWidth = target.clientWidth
    const scrollHeight = target.scrollHeight
    const scrollWidth = target.scrollWidth

    // 判断是否到达边缘
    const newIsAtTop = scrollTop <= 0
    const newIsAtLeft = scrollLeft <= 0
    // 使用阈值判断是否到达底部/右侧
    const newIsAtBottom = scrollHeight <= clientHeight || 
      Math.abs(scrollTop) + clientHeight >= scrollHeight - ARRIVED_STATE_THRESHOLD_PIXELS
    const newIsAtRight = scrollWidth <= clientWidth ||
      Math.abs(scrollLeft) + clientWidth >= scrollWidth - ARRIVED_STATE_THRESHOLD_PIXELS

    setIsAtTop(newIsAtTop)
    setIsAtLeft(newIsAtLeft)
    setIsAtBottom(newIsAtBottom)
    setIsAtRight(newIsAtRight)

    onScrollAt?.({
      bottom: newIsAtBottom,
      left: newIsAtLeft,
      right: newIsAtRight,
      top: newIsAtTop,
    })
  }, [onScrollAt])

  const handleScroll = (event: React.UIEvent<HTMLDivElement>) => {
    checkScrollState(event.currentTarget)
  }

  // 监听尺寸变化和原生滚动事件
  React.useEffect(() => {
    const viewport = viewportRef.current
    if (!viewport) return

    const handleNativeScroll = (e: Event) => {
       checkScrollState(e.target as HTMLElement);
    };

    // 添加原生滚动监听（比 React 合成事件更可靠）
    viewport.addEventListener('scroll', handleNativeScroll);

    // 初始化检查
    checkScrollState(viewport)

    // 监听容器和内容尺寸变化
    const resizeObserver = new ResizeObserver(() => checkScrollState(viewport))
    const mutationObserver = new MutationObserver(() => checkScrollState(viewport))

    resizeObserver.observe(viewport)
    if (viewport.firstElementChild) {
      resizeObserver.observe(viewport.firstElementChild)
      mutationObserver.observe(viewport, { childList: true, subtree: true })
    }

    return () => {
      viewport.removeEventListener('scroll', handleNativeScroll);
      resizeObserver.disconnect()
      mutationObserver.disconnect()
    }
  }, [checkScrollState, children])

  return (
    <div
      ref={ref}
      className={cn("relative h-full w-full overflow-hidden", className)}
      style={style}
      {...props}
    >
      <ScrollArea
        className="h-full w-full"
        viewportRef={viewportRef}
        onScroll={handleScroll}
        viewportClassName={viewportClassName}
      >
        {children}
      </ScrollArea>

      {/* 顶部阴影 */}
      {showShadowTop && (
        <div
          className={cn(
            "scrollbar-top-shadow pointer-events-none absolute top-0 left-0 z-10 h-12 w-full transition-opacity duration-300 ease-in-out will-change-[opacity]",
            // 到达顶部时隐藏阴影
            isAtTop ? "opacity-0" : "opacity-100",
            // 显示顶部边框
            shadowBorder && !isAtTop && "border-t border-gray-200 dark:border-gray-800"
          )}
          style={{
            background: 'linear-gradient(to bottom, hsl(0, 0%, 100%), transparent)'
          }}
        />
      )}
      
      {/* 底部阴影 */}
      {showShadowBottom && (
        <div
          className={cn(
            "scrollbar-bottom-shadow pointer-events-none absolute bottom-0 left-0 z-10 h-12 w-full transition-opacity duration-300 ease-in-out will-change-[opacity]",
            // 到达底部时隐藏阴影
            isAtBottom ? "opacity-0" : "opacity-100",
            // 显示底部边框
            shadowBorder && !isAtTop && !isAtBottom && "border-b border-gray-200 dark:border-gray-800"
          )}
          style={{
            background: 'linear-gradient(to top, hsl(0 0% 100%), transparent)'
          }}
        />
      )}
    </div>
  )
})

Scrollbar.displayName = "Scrollbar"

export { Scrollbar }
export type { ScrollbarProps }

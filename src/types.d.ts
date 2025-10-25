declare module '*.vue' {
  import type { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

export interface MasonriProps {
  gap?: number
  gapX?: number | null
  gapY?: number | null
  padding?: number
  column?: number
  align?: string
  threshold?: number
  loadCount?: number
  animationDuration?: number
}

export interface RequestAppendEvent {
  loadCount: number
  threshold: number
}

export interface MasonriMethods {
  sync(): void
  appended(): void
  prepended(): void
  addItems(): void
  remove(elements: Element[]): void
  forceLayout(): void
  containerRef: HTMLElement | null
}
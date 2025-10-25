# Masonri - Masonry Grid for Vue 3 & Nuxt

A performant and lightweight masonry grid component with infinite scroll for Vue 3 and Nuxt.

## Features

- ✅ **Responsive masonry layout** - Automatically adapts to screen size
- ✅ **Infinite scroll** - Loads more content when scrolling to bottom  
- ✅ **Vue 3 & Nuxt compatible** - Works with modern Vue ecosystem
- ✅ **Lightweight** - Minimal dependencies, simple implementation
- ✅ **TypeScript support** - Full type safety
- ✅ **Smooth animations** - CSS transitions for better UX

## Installation

```bash
npm install masonri
```

## Usage

### Basic Example

```vue
<template>
  <Masonri 
    :gap-x="8" 
    :gap-y="12"
    :padding="20"
    :column="4"
    :threshold="300"
    :load-count="10"
    @request-append="loadMore"
  >
    <div v-for="item in items" :key="item.id" class="item">
      <img :src="item.image" />
      <p>{{ item.title }}</p>
    </div>
  </Masonri>
</template>

<script setup>
const loadMore = (event) => {
  // event.loadCount - number of items to load
  // event.threshold - distance that triggered loading
  console.log(`Loading ${event.loadCount} items at ${event.threshold}px from bottom`)
  
  // Load more items...
  const newItems = await fetchItems(event.loadCount)
  items.value.push(...newItems)
}
</script>

<script setup>
import { Masonri } from 'masonri'

const items = ref([])

const loadMore = () => {
  // Load more items when user scrolls to bottom
  items.value.push(...newItems)
}
</script>
```

### Nuxt Usage

```vue
<template>
  <Masonri 
    :gap-x="8" 
    :gap-y="12" 
    :padding="16"
    :threshold="200"
    :load-count="12"
    @request-append="loadMore"
  >
    <!-- Your content -->
  </Masonri>
</template>

<script setup>
import { Masonri } from 'masonri'
</script>
```

## Props

| Prop | Type | Default | Description |
|------|------|---------|-------------|
| `gap` | Number | `5` | Default gap for both horizontal and vertical spacing |
| `gapX` | Number | `null` | Horizontal gap between items (overrides `gap` if set) |
| `gapY` | Number | `null` | Vertical gap between items (overrides `gap` if set) |
| `padding` | Number | `16` | Padding on left and right sides of the grid |
| `column` | Number | `0` | Number of columns (0 = auto responsive) |
| `align` | String | `'justify'` | Alignment of items |
| `threshold` | Number | `200` | Distance from bottom (in pixels) to trigger loading |
| `loadCount` | Number | `8` | Number of items to request when loading more |

## Events

| Event | Description | Payload |
|-------|-------------|---------|
| `request-append` | Fired when user scrolls near bottom | `{ loadCount: number, threshold: number }` |

## Responsive Breakpoints

- **Mobile** (< 640px): 1 column
- **Tablet** (< 768px): 2 columns  
- **Desktop** (< 1024px): 3 columns
- **Large** (< 1280px): 4 columns
- **XL** (≥ 1280px): 5 columns or custom

## Methods

Access methods using template ref:

```vue
<template>
  <Masonri ref="gridRef">
    <!-- items -->
  </Masonri>
</template>

<script setup>
const gridRef = ref()

// Example usage
const addItems = async () => {
  items.value.push(...newItems)
  await nextTick()
  gridRef.value.appended() // Animate new items
}
</script>
```

| Method | Description |
|--------|-------------|
| `sync()` | Manually trigger layout recalculation |
| `appended()` | Call after adding items to the end |
| `prepended()` | Call after adding items to the beginning |
| `addItems()` | Call after adding items anywhere |
| `remove(elements)` | Remove specific DOM elements |
| `forceLayout()` | Force complete layout recalculation |

## Configuration Examples

### Tight Grid (Small Gaps)
```vue
<Masonri :gap-x="4" :gap-y="4" :padding="12">
```

### Spacious Grid (Large Gaps)  
```vue
<Masonri :gap-x="16" :gap-y="20" :padding="32">
```

### Mobile Optimized
```vue
<Masonri :gap-x="6" :gap-y="8" :padding="16" :threshold="150" :load-count="5">
```

### Desktop Optimized
```vue
<Masonri :gap-x="12" :gap-y="16" :padding="40" :threshold="400" :load-count="12">
```

## Integration Guide

### 1. Install the Package

```bash
npm install masonri
```

### 2. Import in Your Project

#### Vue 3 Project
```vue
<script setup>
import { Masonri } from 'masonri'
import { ref } from 'vue'

const items = ref([])
const gridRef = ref()

const loadMore = async (event) => {
  const newItems = await fetchItems(event.loadCount)
  items.value.push(...newItems)
}
</script>

<template>
  <Masonri
    ref="gridRef"
    :gap-x="15"
    :gap-y="20"
    :padding="20"
    :animation-duration="0.6"
    @request-append="loadMore"
  >
    <div v-for="item in items" :key="item.id" class="item">
      <img :src="item.image" />
      <h3>{{ item.title }}</h3>
    </div>
  </Masonri>
</template>
```

#### Nuxt 3 Project
```vue
<script setup>
import { Masonri } from 'masonri'

const items = ref([])

const loadMore = async (event) => {
  const { data } = await $fetch('/api/items', {
    query: { limit: event.loadCount }
  })
  items.value.push(...data)
}
</script>

<template>
  <Masonri @request-append="loadMore">
    <div v-for="item in items" :key="item.id" class="item">
      <!-- Your content -->
    </div>
  </Masonri>
</template>
```

### 3. Global Registration (Optional)

#### Vue 3
```js
// main.js
import { createApp } from 'vue'
import { Masonri } from 'masonri'
import App from './App.vue'

const app = createApp(App)
app.component('Masonri', Masonri)
app.mount('#app')
```

#### Nuxt 3 Plugin
```js
// plugins/masonri.client.js
import { Masonri } from 'masonri'

export default defineNuxtPlugin((nuxtApp) => {
  nuxtApp.vueApp.component('Masonri', Masonri)
})
```

### 4. TypeScript Support

The package includes TypeScript definitions. For better type safety:

```vue
<script setup lang="ts">
import { Masonri } from 'masonri'
import type { Ref } from 'vue'

interface Item {
  id: string
  image: string
  title: string
}

const items: Ref<Item[]> = ref([])
const gridRef = ref<InstanceType<typeof Masonri>>()

const loadMore = async (event: { loadCount: number; threshold: number }) => {
  // Your API call with proper typing
}
</script>
```

### 5. Styling Your Items

```css
.item {
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  overflow: hidden;
  transition: box-shadow 0.2s ease;
}

.item:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.15);
}

.item img {
  width: 100%;
  height: auto;
  display: block;
}
```

### 6. Performance Tips

- Use `data-height` attribute for better initial positioning:
```vue
<div class="item" :data-height="item.expectedHeight">
  <!-- content -->
</div>
```

- Optimize images with proper sizing and lazy loading
- Use `animationDuration` prop to control animation speed
- Call appropriate methods (`appended`, `prepended`) after data changes

## License

MIT
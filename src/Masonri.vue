<template>
  <div 
    ref="containerRef" 
    class="masonry-grid"
    :style="{ '--animation-duration': `${animationDuration}s` }"
  >
    <slot></slot>
  </div>
</template>

<script setup>
import { ref, onMounted, onBeforeUnmount, nextTick, watch, computed } from 'vue';

const props = defineProps({
  gap: {
    type: Number,
    default: 5,
  },
  gapX: {
    type: Number,
    default: null, // If null, uses gap value
  },
  gapY: {
    type: Number,
    default: null, // If null, uses gap value
  },
  padding: {
    type: Number,
    default: 16, // Default padding on sides
  },
  column: {
    type: Number,
    default: 0,
  },
  align: {
    type: String,
    default: 'justify',
  },
  threshold: {
    type: Number,
    default: 200, // Distance from bottom to trigger loading (in pixels)
  },
  loadCount: {
    type: Number,
    default: 8, // Number of items to request when loading
  },
  animationDuration: {
    type: Number,
    default: 0.6, // Animation duration in seconds
  },
});

const emit = defineEmits(['request-append']);

const containerRef = ref(null);

// Helper function to animate element with smooth moveUp effect
const animateElement = (element, delay = 0) => {
  setTimeout(() => {
    element.style.visibility = 'visible';
    element.classList.add('animate');
    
    // Clear inline transform to let CSS take over
    element.style.transform = '';
    
    // Force visibility as fallback
    element.style.opacity = '1';
  }, delay);
};





let layoutTimeout = null;
let positionedItems = new Set(); // Track positioned items
let columnHeights = []; // Store column heights globally

const sync = () => {
  console.log('Masonri sync called');
  nextTick(async () => {
    await layoutNewItems();
  });
};

const debouncedLayoutAfterImageLoad = () => {
  if (layoutTimeout) clearTimeout(layoutTimeout);
  layoutTimeout = setTimeout(() => {
    layoutItemsAfterImageLoad();
  }, 100);
};

const getResponsiveColumns = () => {
  if (!containerRef.value) return props.column || 3;
  
  const containerWidth = containerRef.value.offsetWidth;
  
  // Responsive breakpoints
  if (containerWidth < 640) return 1;      // mobile: 1 column
  if (containerWidth < 768) return 2;      // tablet: 2 columns  
  if (containerWidth < 1024) return 3;     // desktop: 3 columns
  if (containerWidth < 1280) return 4;     // large: 4 columns
  return props.column || 5;                // xl: 5 columns or custom
};

const getLayoutDimensions = () => {
  if (!containerRef.value) return { columnCount: 3, itemWidth: 200, gapX: 5, gapY: 5 };
  
  const container = containerRef.value;
  const columnCount = getResponsiveColumns();
  
  // Use separate horizontal and vertical gaps
  const gapX = props.gapX !== null ? props.gapX : props.gap || 5; // Horizontal gap
  const gapY = props.gapY !== null ? props.gapY : props.gap || 5; // Vertical gap
  const paddingSize = props.padding || 16;
  
  // Get actual available width (excluding padding)
  const containerStyle = window.getComputedStyle(container);
  const containerPaddingLeft = parseFloat(containerStyle.paddingLeft) || 0;
  const containerPaddingRight = parseFloat(containerStyle.paddingRight) || 0;
  
  // Since we use overflow-y: scroll, scrollbar is always present and already accounted for
  const containerRect = container.getBoundingClientRect();
  
  // Use the actual rendered width and add our custom padding
  const availableWidth = containerRect.width - containerPaddingLeft - containerPaddingRight - (paddingSize * 2);
  
  const itemWidth = Math.floor((availableWidth - (columnCount - 1) * gapX) / columnCount);
  
  // Debug: Uncomment to check layout calculations
  // console.log('Layout dimensions:', {
  //   containerOffsetWidth: container.offsetWidth,
  //   containerRectWidth: containerRect.width,
  //   paddingLeft,
  //   paddingRight,
  //   availableWidth,
  //   columnCount,
  //   itemWidth,
  //   gapSize,
  //   totalItemsWidth: columnCount * itemWidth + (columnCount - 1) * gapSize
  // });
  
  return { columnCount, itemWidth, gapX, gapY, paddingSize, availableWidth };
};

const layoutNewItems = async () => {
  if (!containerRef.value) return;
  
  const container = containerRef.value;
  const items = Array.from(container.children);
  
  if (items.length === 0) return;
  
  const { columnCount, itemWidth, gapX, gapY, paddingSize } = getLayoutDimensions();
  
  // Initialize column heights if first time or reset needed
  if (columnHeights.length !== columnCount) {
    columnHeights = new Array(columnCount).fill(0);
    positionedItems.clear();
  }
  
  // Find new items that haven't been positioned yet
  const newItems = items.filter(item => !positionedItems.has(item));
  
  if (newItems.length === 0) return;
  
  // console.log(`Positioning ${newItems.length} new items`);
  
  // Position only new items (keep them hidden until images load)
  newItems.forEach((item) => {
    const element = item;
    
    // Set basic styles immediately but keep hidden
    element.style.position = 'absolute';
    element.style.width = `${itemWidth}px`;
    element.style.visibility = 'hidden';
    element.style.transform = 'translateY(100px)'; // Start below final position
    
    // Get data-height if available for better initial positioning
    const dataHeight = element.getAttribute('data-height');
    const estimatedHeight = dataHeight ? parseInt(dataHeight) + 40 : 250;
    
    // Find shortest column
    const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
    
    // Position item (add padding offset)
    element.style.left = `${paddingSize + shortestColumnIndex * (itemWidth + gapX)}px`;
    element.style.top = `${columnHeights[shortestColumnIndex]}px`;
    
    // Update column height with estimated height
    columnHeights[shortestColumnIndex] += estimatedHeight + gapY;
    
    // Mark as positioned
    positionedItems.add(item);
  });
  
  // Update container height
  container.style.height = `${Math.max(...columnHeights)}px`;
  container.style.position = 'relative';
  
  // Wait for images in new items to load, then show them
  await Promise.all(
    newItems.map((item, index) => {
      const element = item;
      const images = element.querySelectorAll('img');
      
      if (images.length === 0) {
        // No images, show immediately with delay for staggered effect
        animateElement(element, index * 150);
        return Promise.resolve();
      }
      
      return Promise.all(
        Array.from(images).map(img => {
          if (img.complete) {
            // Image already loaded, show with delay
            animateElement(element, index * 150);
            return Promise.resolve();
          }
          
          return new Promise((resolve) => {
            img.onload = () => {
              // Show item after image loads
              animateElement(element, index * 150);
              
              // Recalculate layout after image loads
              debouncedLayoutAfterImageLoad();
              resolve();
            };
            img.onerror = () => {
              // Show even if image fails to load
              animateElement(element, index * 150);
              resolve();
            };
          });
        })
      );
    })
  );
};

const layoutItems = async () => {
  if (!containerRef.value) return;
  
  const container = containerRef.value;
  const items = Array.from(container.children);
  
  if (items.length === 0) return;
  
  const { columnCount, itemWidth, gapX, gapY, paddingSize } = getLayoutDimensions();
  
  // Initialize column heights
  const columnHeights = new Array(columnCount).fill(0);
  
  // First pass: set basic positioning for all items
  items.forEach((item, index) => {
    const element = item;
    
    // Set basic styles immediately
    element.style.position = 'absolute';
    element.style.width = `${itemWidth}px`;
    element.style.visibility = 'hidden'; // Hide until properly positioned
    
    // Get data-height if available for better initial positioning
    const dataHeight = element.getAttribute('data-height');
    // Add some padding for text/spacing (span element + padding)
    const estimatedHeight = dataHeight ? parseInt(dataHeight) + 40 : 250; // fallback height with padding
    
    // Find shortest column
    const shortestColumnIndex = columnHeights.indexOf(Math.min(...columnHeights));
    
    // Position item (add padding offset)
    element.style.left = `${paddingSize + shortestColumnIndex * (itemWidth + gapX)}px`;
    element.style.top = `${columnHeights[shortestColumnIndex]}px`;
    
    // Update column height with estimated height
    columnHeights[shortestColumnIndex] += estimatedHeight + gapY;
  });
  
  // Set initial container height
  container.style.height = `${Math.max(...columnHeights)}px`;
  container.style.position = 'relative';
  
  // Show items with staggered animation
  items.forEach((item, index) => {
    animateElement(item, index * 150); // Longer delay for smoother effect
  });
  
  // Second pass: wait for images and adjust positioning
  await Promise.all(
    items.map(item => {
      const images = item.querySelectorAll('img');
      return Promise.all(
        Array.from(images).map(img => {
          if (img.complete) return Promise.resolve();
          return new Promise((resolve) => {
            img.onload = () => {
              // Recalculate layout after image loads
              debouncedLayoutAfterImageLoad();
              resolve();
            };
            img.onerror = resolve;
          });
        })
      );
    })
  );
};

const layoutItemsAfterImageLoad = () => {
  if (!containerRef.value) return;
  
  const container = containerRef.value;
  const items = Array.from(container.children);
  
  if (items.length === 0) return;
  
  const { columnCount, itemWidth, gapX, gapY, paddingSize } = getLayoutDimensions();
  
  // Reset column heights and recalculate from scratch with actual heights
  const newColumnHeights = new Array(columnCount).fill(0);
  
  // Reposition all items with actual heights
  items.forEach((item, index) => {
    const element = item;
    
    // Find shortest column
    const shortestColumnIndex = newColumnHeights.indexOf(Math.min(...newColumnHeights));
    
    // Position item (add padding offset)
    element.style.left = `${paddingSize + shortestColumnIndex * (itemWidth + gapX)}px`;
    element.style.top = `${newColumnHeights[shortestColumnIndex]}px`;
    
    // Ensure item is visible and animated
    element.style.visibility = 'visible';
    if (!element.classList.contains('animate')) {
      element.classList.add('animate');
    }
    
    // Update column height with actual height
    const actualHeight = element.offsetHeight;
    newColumnHeights[shortestColumnIndex] += actualHeight + gapY;
  });
  
  // Update global column heights
  columnHeights = newColumnHeights;
  
  // Update container height
  const maxHeight = Math.max(...columnHeights);
  container.style.height = `${maxHeight}px`;
};

const handleResize = () => {
  // Reset positioning on resize
  positionedItems.clear();
  columnHeights = [];
  
  // Add small delay to allow scrollbar to appear/disappear
  setTimeout(() => {
    nextTick(() => {
      // Use layoutItemsAfterImageLoad to ensure we use actual heights
      layoutItemsAfterImageLoad();
    });
  }, 100);
};

const handleScroll = () => {
  const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
  const windowHeight = window.innerHeight;
  const documentHeight = document.documentElement.scrollHeight;
  
  // Trigger when user reaches the threshold distance from bottom
  if (scrollTop + windowHeight >= documentHeight - props.threshold) {
    emit('request-append', {
      loadCount: props.loadCount,
      threshold: props.threshold,
    });
  }
};

// Methods for adding/removing items
const appended = (elements) => {
  console.log('appended called with', elements?.length || 0, 'elements');
  nextTick(async () => {
    await layoutNewItems();
  });
};

const prepended = (elements) => {
  console.log('prepended called with', elements?.length || 0, 'elements');
  // For prepended items, we need to reset all positioning
  positionedItems.clear();
  columnHeights = [];
  nextTick(async () => {
    await layoutItems();
  });
};

const addItems = (elements) => {
  console.log('addItems called with', elements?.length || 0, 'elements');
  nextTick(async () => {
    await layoutNewItems();
  });
};

const remove = (elements) => {
  console.log('remove called with', elements?.length || 0, 'elements');
  
  if (!elements || !Array.isArray(elements)) return;
  
  // Remove elements from positioned items tracking
  elements.forEach(element => {
    if (positionedItems.has(element)) {
      positionedItems.delete(element);
    }
    // Remove from DOM if still present
    if (element.parentNode) {
      element.parentNode.removeChild(element);
    }
  });
  
  // Reset and relayout remaining items using actual heights
  positionedItems.clear();
  columnHeights = [];
  nextTick(async () => {
    // Use layoutItemsAfterImageLoad to ensure we use actual heights
    layoutItemsAfterImageLoad();
  });
};

onMounted(() => {
  console.log('Masonri mounted');
  window.addEventListener('resize', handleResize);
  window.addEventListener('scroll', handleScroll);
  nextTick(async () => {
    await layoutItems();
  });
});

onBeforeUnmount(() => {
  console.log('Masonri unmounted');
  window.removeEventListener('resize', handleResize);
  window.removeEventListener('scroll', handleScroll);
});

const forceLayout = () => {
  // Reset positioning and relayout all items
  positionedItems.clear();
  columnHeights = [];
  nextTick(async () => {
    await layoutItems();
  });
};

defineExpose({ 
  sync,
  appended,
  prepended, 
  addItems,
  remove,
  containerRef,
  forceLayout
});

</script>

<style scoped>
.masonry-grid {
  width: 100%;
  position: relative;
  overflow: hidden;
}

.masonry-grid > * {
  box-sizing: border-box;
  opacity: 0;
  transition: opacity var(--animation-duration, 0.6s) ease-out,
              transform var(--animation-duration, 0.6s) ease-out;
}

.masonry-grid > *:not(.animate) {
  transform: translateY(100px); /* Start 100px below final position */
}

.masonry-grid > *.animate {
  opacity: 1;
  transform: translateY(0); /* Move to final position */
}


</style>

<template>
  <div>
    <h1 style="text-align: center; font-size: 2rem; font-weight: bold; margin: 2rem 0;">Masonri Demo</h1>
    
    <!-- Simple info -->
    <div class="info">
      <p>Smooth moveUp animation with staggered appearance</p>
    </div>
    
    <!-- Control buttons -->
    <div class="controls">
      <button @click="appendItems" class="btn">Append 3 Items</button>
      <button @click="prependItems" class="btn">Prepend 3 Items</button>
      <button @click="addRandomItems" class="btn">Add 5 Items</button>
      <button @click="removeLastItems" class="btn">Remove Last 3</button>
      <button @click="removeRandomItems" class="btn">Remove Random</button>
      <button @click="clearAll" class="btn btn-danger">Clear All</button>
    </div>
    
    <Masonri
      ref="gridRef"
      class="container"
      :gap-x="15"
      :gap-y="20"
      :padding="20"
      :column="5"
      :threshold="300"
      :load-count="6"
      :animation-duration="0.6"
      @request-append="onRequestAppend"
    >
      <div
        v-for="item in items"
        :key="item.key"
        class="item"
        :data-height="item.height"
      >
        <img :src="item.url" />
        <span>{{ item.key }}</span>
      </div>
    </Masonri>
    
    <!-- Loading indicator -->
    <div v-if="isLoading" style="text-align: center; padding: 2rem 0;">
      <div class="spinner"></div>
      <p style="margin-top: 0.5rem; color: #666;">Loading more items...</p>
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted, nextTick } from 'vue';


const items = ref([]);
const gridRef = ref(null);
const isLoading = ref(false);
let currentKey = 0;

function getItems(count) {
  const newItems = [];
  for (let i = 0; i < count; ++i) {
    const height = Math.floor(Math.random() * 200) + 100; // Random height between 100 and 200
    newItems.push({
      key: currentKey,
      height,
      url: `https://picsum.photos/300/${height}?random=${currentKey}`,
    });
    currentKey++;
  }
  return newItems;
}

const onRequestAppend = async (event) => {
  if (isLoading.value) return;
  
  console.log('Loading more items:', event);
  isLoading.value = true;
  
  // Simulate loading delay
  await new Promise(resolve => setTimeout(resolve, 500));
  
  // Use loadCount from event or fallback to default
  const loadCount = event?.loadCount || 8;
  const newItems = getItems(loadCount);
  items.value = [...items.value, ...newItems];
  
  console.log(`Added ${loadCount} new items. Total: ${items.value.length}`);
  
  await nextTick();
  setTimeout(() => {
    gridRef.value?.appended();
    isLoading.value = false;
  }, 100);
};

// Methods for testing item management
const appendItems = async () => {
  const newItems = getItems(3);
  items.value = [...items.value, ...newItems];
  
  await nextTick();
  setTimeout(() => {
    gridRef.value?.appended();
  }, 50);
};

const prependItems = async () => {
  const newItems = getItems(3);
  items.value = [...newItems, ...items.value];
  
  await nextTick();
  setTimeout(() => {
    gridRef.value?.prepended();
  }, 50);
};

const addRandomItems = async () => {
  const newItems = getItems(5);
  // Insert at random position
  const randomIndex = Math.floor(Math.random() * items.value.length);
  items.value.splice(randomIndex, 0, ...newItems);
  
  await nextTick();
  setTimeout(() => {
    gridRef.value?.addItems();
  }, 50);
};

const removeLastItems = async () => {
  if (items.value.length < 3) return;
  
  // Get DOM elements before removing from array
  const container = gridRef.value?.containerRef;
  if (!container) return;
  
  const allElements = Array.from(container.children);
  const elementsToRemove = allElements.slice(-3); // Last 3 elements
  
  // Remove from items array
  items.value = items.value.slice(0, -3);
  
  await nextTick();
  setTimeout(() => {
    gridRef.value?.remove(elementsToRemove);
  }, 50);
};

const removeRandomItems = async () => {
  if (items.value.length < 2) return;
  
  const container = gridRef.value?.containerRef;
  if (!container) return;
  
  const allElements = Array.from(container.children);
  const randomCount = Math.min(2, items.value.length);
  const elementsToRemove = [];
  
  // Select random elements
  for (let i = 0; i < randomCount; i++) {
    const randomIndex = Math.floor(Math.random() * allElements.length);
    const element = allElements.splice(randomIndex, 1)[0];
    if (element) elementsToRemove.push(element);
  }
  
  // Remove corresponding items from array
  elementsToRemove.forEach(element => {
    const itemIndex = Array.from(container.children).indexOf(element);
    if (itemIndex >= 0 && itemIndex < items.value.length) {
      items.value.splice(itemIndex, 1);
    }
  });
  
  await nextTick();
  setTimeout(() => {
    gridRef.value?.remove(elementsToRemove);
  }, 50);
};

const clearAll = async () => {
  const container = gridRef.value?.containerRef;
  if (!container) return;
  
  const allElements = Array.from(container.children);
  items.value = [];
  
  await nextTick();
  setTimeout(() => {
    gridRef.value?.remove(allElements);
  }, 50);
};



onMounted(async () => {
  items.value = getItems(20);
  await nextTick();
  setTimeout(() => {
    gridRef.value?.sync();
  }, 100);
});

</script>

<style>
html {
  overflow-y: scroll; /* Always show vertical scrollbar to prevent layout shifts */
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #f5f5f5;
  margin: 0;
  padding: 0;
  overflow-x: hidden; /* Prevent horizontal scroll */
}

.container {
  width: 100%;
  max-width: 1400px;
  margin: 0 auto;
  /* Padding now managed by component */
}

.item {
  position: relative;
  overflow: hidden;
  border-radius: 12px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  background: white;
  transition: all 0.3s ease;
  margin-bottom: 0;
  display: flex;
  flex-direction: column;
}

.item:hover {
  box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
}

.item img {
  width: 100%;
  height: auto;
  object-fit: cover;
  display: block;
  flex-shrink: 0;
}

.item span {
  position: absolute;
  bottom: 8px;
  left: 8px;
  background: rgba(0, 0, 0, 0.7);
  color: white;
  padding: 4px 8px;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
}

.spinner {
  display: inline-block;
  width: 32px;
  height: 32px;
  border: 3px solid #f3f3f3;
  border-top: 3px solid #007bff;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

.controls {
  display: flex;
  justify-content: center;
  gap: 12px;
  margin: 0 20px 30px 20px;
  flex-wrap: wrap;
}

.btn {
  padding: 10px 16px;
  border: none;
  border-radius: 8px;
  background: #007bff;
  color: white;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
}

.btn:hover {
  background: #0056b3;
  transform: translateY(-1px);
}

.btn:active {
  transform: translateY(0);
}

.btn-danger {
  background: #dc3545;
}

.btn-danger:hover {
  background: #c82333;
}

.info {
  text-align: center;
  margin: 0 20px 30px 20px;
  color: #666;
  font-size: 16px;
}
</style>

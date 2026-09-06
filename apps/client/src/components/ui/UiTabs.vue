<script setup lang="ts">
import { TabsList, TabsRoot, TabsTrigger } from "reka-ui";

interface TabItem {
  label: string;
  value: string;
  testId?: string;
}

interface Props {
  modelValue: string;
  items: TabItem[];
}

defineProps<Props>();
const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();
</script>

<template>
  <TabsRoot :model-value="modelValue" @update:model-value="emit('update:modelValue', $event)">
    <TabsList class="tab-list">
      <TabsTrigger
        v-for="item in items"
        :key="item.value"
        :value="item.value"
        :data-testid="item.testId"
        class="tab-item border-transparent data-[state=active]:text-blue-500">
        {{ item.label }}
      </TabsTrigger>
    </TabsList>
  </TabsRoot>
</template>

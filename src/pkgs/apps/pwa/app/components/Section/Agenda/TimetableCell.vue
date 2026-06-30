<script setup lang="ts">
export interface TimetableLesson {
  subjectId: string;
  name: string;
  color: string;
}

defineProps<{ lessons: TimetableLesson[] }>();
</script>

<template>
  <div class="tt-cell">
    <span
      v-for="lesson in lessons"
      :key="lesson.subjectId"
      class="tt-cell__lesson"
      :style="{ borderLeftColor: lesson.color }"
    >
      <span class="tt-cell__dot" :style="{ background: lesson.color }" />
      <span class="tt-cell__name">{{ lesson.name }}</span>
    </span>
  </div>
</template>

<style scoped>
.tt-cell {
  display: flex;
  flex-direction: column;
  gap: 4px;
  min-height: 100%;
  padding: 3px;
}
.tt-cell__lesson {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 5px 7px;
  border-radius: var(--pt-radius-sm);
  border: var(--pt-stroke) solid var(--pt-border-muted);
  border-left: 3px solid var(--pt-border-muted);
  background: var(--pt-card);
  font-size: calc(11px * var(--pt-text-scale));
  font-weight: 600;
  line-height: 1.15;
}
.tt-cell__dot {
  width: 7px;
  height: 7px;
  border-radius: 50%;
  flex-shrink: 0;
}
.tt-cell__name {
  min-width: 0;
  overflow-wrap: anywhere;
}
</style>

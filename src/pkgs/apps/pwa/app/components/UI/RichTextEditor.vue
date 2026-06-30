<script setup lang="ts">
import Link from "@tiptap/extension-link";
import Placeholder from "@tiptap/extension-placeholder";
import TaskItem from "@tiptap/extension-task-item";
import TaskList from "@tiptap/extension-task-list";
import StarterKit from "@tiptap/starter-kit";
import { EditorContent, useEditor } from "@tiptap/vue-3";

const props = withDefaults(
  defineProps<{ modelValue: string; placeholder?: string }>(),
  { placeholder: "Escreva aqui…" },
);
const emit = defineEmits<{ "update:modelValue": [value: string] }>();

const editor = useEditor({
  content: props.modelValue || "",
  extensions: [
    StarterKit,
    Link.configure({ openOnClick: false }),
    Placeholder.configure({ placeholder: props.placeholder }),
    TaskList,
    TaskItem.configure({ nested: true }),
  ],
  onUpdate: ({ editor: instance }) => {
    emit("update:modelValue", instance.isEmpty ? "" : instance.getHTML());
  },
});

interface ToolButton {
  key: string;
  glyph: string;
  title: string;
  active: boolean;
  run: () => void;
}

const tools = computed<ToolButton[]>(() => {
  const instance = editor.value;
  if (!instance) return [];
  const chain = () => instance.chain().focus();
  return [
    {
      key: "bold",
      glyph: "B",
      title: "Negrito",
      active: instance.isActive("bold"),
      run: () => chain().toggleBold().run(),
    },
    {
      key: "italic",
      glyph: "I",
      title: "Itálico",
      active: instance.isActive("italic"),
      run: () => chain().toggleItalic().run(),
    },
    {
      key: "h1",
      glyph: "H1",
      title: "Título 1",
      active: instance.isActive("heading", { level: 1 }),
      run: () => chain().toggleHeading({ level: 1 }).run(),
    },
    {
      key: "h2",
      glyph: "H2",
      title: "Título 2",
      active: instance.isActive("heading", { level: 2 }),
      run: () => chain().toggleHeading({ level: 2 }).run(),
    },
    {
      key: "bullet",
      glyph: "•",
      title: "Lista",
      active: instance.isActive("bulletList"),
      run: () => chain().toggleBulletList().run(),
    },
    {
      key: "ordered",
      glyph: "1.",
      title: "Lista numerada",
      active: instance.isActive("orderedList"),
      run: () => chain().toggleOrderedList().run(),
    },
    {
      key: "task",
      glyph: "☑",
      title: "Checklist",
      active: instance.isActive("taskList"),
      run: () => chain().toggleTaskList().run(),
    },
    {
      key: "quote",
      glyph: "❝",
      title: "Citação",
      active: instance.isActive("blockquote"),
      run: () => chain().toggleBlockquote().run(),
    },
    {
      key: "code",
      glyph: "</>",
      title: "Código",
      active: instance.isActive("codeBlock"),
      run: () => chain().toggleCodeBlock().run(),
    },
  ];
});

function setLink() {
  const instance = editor.value;
  if (!instance) return;
  const url = window.prompt("URL do link:") ?? "";
  const command = instance.chain().focus();
  if (url) command.setLink({ href: url }).run();
  else command.unsetLink().run();
}
</script>

<template>
  <div class="rte">
    <div class="rte__toolbar">
      <button
        v-for="tool in tools"
        :key="tool.key"
        type="button"
        class="rte__tool"
        :class="{ 'rte__tool--active': tool.active }"
        :title="tool.title"
        @click="tool.run"
      >
        {{ tool.glyph }}
      </button>
      <button
        type="button"
        class="rte__tool"
        title="Link"
        @click="setLink"
      >
        <UIIcon icon="link" :size="14" />
      </button>
    </div>
    <EditorContent class="rte__content tiptap-content" :editor="editor" />
  </div>
</template>

<style scoped>
.rte {
  border: 1.5px solid var(--pt-border-muted);
  border-radius: var(--pt-radius-sm);
  background: var(--pt-card);
  overflow: hidden;
}
.rte__toolbar {
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  padding: 6px;
  border-bottom: 1.5px solid var(--pt-border-faint);
  background: var(--pt-paper-2);
}
.rte__tool {
  min-width: 30px;
  height: 30px;
  padding: 0 7px;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border: 1.5px solid var(--pt-border-faint);
  border-radius: var(--pt-radius-sm);
  background: var(--pt-card);
  color: var(--pt-ink-soft);
  font-family: var(--pt-font-ui);
  font-size: calc(13px * var(--pt-text-scale));
  font-weight: 700;
  cursor: pointer;
}
.rte__tool:hover {
  background: var(--pt-linen);
}
.rte__tool--active {
  background: var(--pt-accent);
  color: var(--pt-on-accent);
  border-color: var(--pt-accent);
}
.rte__content {
  padding: 11px 13px;
}
</style>

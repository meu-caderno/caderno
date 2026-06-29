export interface ToastItem {
  id: number;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const toasts = shallowRef<ToastItem[]>([]);
let sequence = 0;

export function useToast() {
  function toast(opts: Omit<ToastItem, "id">) {
    sequence += 1;
    const id = sequence;
    toasts.value = [...toasts.value, { ...opts, id }];
    return id;
  }
  function dismiss(id: number) {
    toasts.value = toasts.value.filter((toast) => toast.id !== id);
  }
  return { toasts, toast, dismiss };
}

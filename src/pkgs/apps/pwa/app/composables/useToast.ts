export interface ToastItem {
  id: number;
  title: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
}

const toasts = shallowRef<ToastItem[]>([]);
let seq = 0;

export function useToast() {
  function toast(opts: Omit<ToastItem, "id">) {
    seq += 1;
    const id = seq;
    toasts.value = [...toasts.value, { ...opts, id }];
    return id;
  }
  function dismiss(id: number) {
    toasts.value = toasts.value.filter((toast) => toast.id !== id);
  }
  return { toasts, toast, dismiss };
}

export function useFocus() {
  const focusing = useState<boolean>("caderno:focusing", () => false);

  function open() {
    focusing.value = true;
  }
  function close() {
    focusing.value = false;
  }

  return { focusing, open, close };
}

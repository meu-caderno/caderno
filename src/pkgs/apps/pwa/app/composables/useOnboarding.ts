export function useOnboarding() {
  const reviewing = useState<boolean>("caderno:onboarding:review", () => false);

  function open() {
    reviewing.value = true;
  }
  function close() {
    reviewing.value = false;
  }

  return { reviewing, open, close };
}

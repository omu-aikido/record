import { onScopeDispose, ref, type Ref, watch } from "vue";

const DEFAULT_DELAY = 300;

export function useDebouncedRef(source: Ref<string>, delay = DEFAULT_DELAY) {
  const debounced = ref(source.value);
  let timeout: ReturnType<typeof setTimeout> | undefined;

  watch(source, (value) => {
    if (timeout !== undefined) clearTimeout(timeout);

    timeout = setTimeout(() => {
      debounced.value = value;
      timeout = undefined;
    }, delay);
  });

  onScopeDispose(() => {
    if (timeout !== undefined) clearTimeout(timeout);
  });

  return debounced;
}

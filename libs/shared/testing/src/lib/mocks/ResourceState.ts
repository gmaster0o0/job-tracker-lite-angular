export type ResourceState<T> = {
  value: () => T | undefined;
  isLoading: () => boolean;
  reload: () => void;
  error: () => unknown;
};

export type ResourceState<T> = {
  value: () => T;
  isLoading: () => boolean;
  reload: () => void;
  error: () => unknown;
};

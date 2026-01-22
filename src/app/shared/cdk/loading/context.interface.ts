import {LoadingState} from './loading-state.interface';

export type WithContext<T> = LoadingState & {
  value: T;
  error?: unknown;
  complete?: unknown;
};

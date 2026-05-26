export interface ApiSuccess<T> {
  data: T;
  error: null;
}

export interface ApiError<E> {
  data: null;
  error: E;
}

export type ApiResult<T, E> = ApiSuccess<T> | ApiError<E>;

export type ActionResult<T> = {
  success?: boolean;
  error?: string;
  data?: T;
};
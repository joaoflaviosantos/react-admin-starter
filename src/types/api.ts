export interface Result<T = unknown> {
  status: number;
  message?: string;
  detail?: string;
  data?: T;
}

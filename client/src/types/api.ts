export interface ApiResponse<TData = unknown> {
  success: boolean;
  data?: TData;
  message: string;
  error?: unknown;
}

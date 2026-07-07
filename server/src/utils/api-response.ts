export interface ApiResponse<TData = unknown> {
  success: boolean;
  data?: TData;
  message: string;
  error?: unknown;
}

export const createSuccessResponse = <TData>(
  message: string,
  data?: TData,
): ApiResponse<TData> => ({
  success: true,
  message,
  ...(data === undefined ? {} : { data }),
});

export const notImplementedResponse = (): ApiResponse => ({
  success: true,
  message: 'Not implemented',
});

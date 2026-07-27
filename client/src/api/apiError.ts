/**
 * Typed error thrown by the httpClient response interceptor.
 * Feature hooks can narrow on `err instanceof ApiError` and access
 * `err.status` / `err.fieldErrors` without parsing raw Axios errors.
 */
export class ApiError extends Error {
    constructor(
        public readonly status: number,
        message: string,
        public readonly fieldErrors?: Record<string, string[]>,
    ) {
        super(message);
        this.name = 'ApiError';
    }
}

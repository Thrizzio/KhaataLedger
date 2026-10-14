export type FieldErrors = Record<string, string[]>;

export interface ApiErrorDetails {
    status: number;
    code?: string;
    message: string;
    fieldErrors?: FieldErrors;
}

interface ErrorRecord {
    [key: string]: unknown;
}

const isRecord = (value: unknown): value is ErrorRecord =>
    typeof value === 'object' && value !== null;

const firstString = (...values: unknown[]): string | undefined =>
    values.find((value): value is string => typeof value === 'string' && value.trim().length > 0)?.trim();

const normalizeFieldErrors = (value: unknown): FieldErrors | undefined => {
    if (!isRecord(value)) return undefined;

    const fieldErrors: FieldErrors = {};
    for (const [field, rawMessages] of Object.entries(value)) {
        const messages = Array.isArray(rawMessages) ? rawMessages : [rawMessages];
        const normalized = messages.filter(
            (message): message is string => typeof message === 'string' && message.trim().length > 0,
        );
        if (normalized.length > 0) fieldErrors[field] = normalized;
    }

    return Object.keys(fieldErrors).length > 0 ? fieldErrors : undefined;
};

/** Safely reads both the additive error contract and the legacy response shape. */
export const getApiErrorDetails = (
    error: unknown,
    fallbackMessage = 'Request failed. Please try again.',
): ApiErrorDetails => {
    if (error instanceof ApiError) {
        return {
            status: error.status,
            code: error.code,
            message: error.message,
            fieldErrors: error.fieldErrors,
        };
    }

    const candidate = isRecord(error) ? error : {};
    const response = isRecord(candidate.response) ? candidate.response : undefined;
    const responseData = response && isRecord(response.data) ? response.data : {};
    const nestedError = isRecord(responseData.error) ? responseData.error : {};
    const status = typeof response?.status === 'number' ? response.status : 0;
    const code = firstString(nestedError.code, responseData.code);
    const fieldErrors = normalizeFieldErrors(nestedError.fieldErrors ?? responseData.fieldErrors);

    let message = firstString(nestedError.message, responseData.message);
    if (!message && !response) {
        const errorCode = firstString(candidate.code);
        if (errorCode === 'ECONNABORTED' || errorCode === 'ETIMEDOUT') {
            message = 'The request timed out. Check your connection and try again.';
        } else if (typeof candidate.message === 'string' && candidate.message.trim()) {
            message = candidate.message.trim();
        }
    }

    return { status, code, message: message ?? fallbackMessage, fieldErrors };
};

/** Maps safe server field messages into react-hook-form's setError callback. */
export const applyApiFieldErrors = (
    error: unknown,
    setError: (field: string, message: string) => void,
): FieldErrors | undefined => {
    const fieldErrors = getApiErrorDetails(error).fieldErrors;
    if (!fieldErrors) return undefined;

    for (const [field, messages] of Object.entries(fieldErrors)) {
        setError(field, messages[0]);
    }
    return fieldErrors;
};

/**
 * Typed error thrown by the httpClient response interceptor.
 * Feature hooks can narrow on `err instanceof ApiError` and access the parsed
 * status, contract code, message, and field errors without touching Axios.
 */
export class ApiError extends Error {
    public readonly status: number;
    public readonly fieldErrors?: FieldErrors;
    public readonly code?: string;

    constructor(
        status: number,
        message: string,
        fieldErrors?: FieldErrors,
        code?: string,
    ) {
        super(message);
        this.status = status;
        this.fieldErrors = fieldErrors;
        this.code = code;
        this.name = 'ApiError';
        Object.setPrototypeOf(this, ApiError.prototype);
    }
}

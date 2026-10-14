import assert from 'node:assert/strict';
import test from 'node:test';
import {
    ApiError,
    applyApiFieldErrors,
    getApiErrorDetails,
} from '../src/api/apiError.ts';
import { registerSchema } from '../src/utils/authSchemas.ts';

test('extracts the additive nested error contract', () => {
    const details = getApiErrorDetails({
        response: {
            status: 409,
            data: {
                message: 'Legacy conflict message',
                error: {
                    code: 'EMAIL_EXISTS',
                    message: 'That email is already registered.',
                    fieldErrors: { email: ['Use a different email address.'] },
                },
            },
        },
    });

    assert.equal(details.status, 409);
    assert.equal(details.code, 'EMAIL_EXISTS');
    assert.equal(details.message, 'That email is already registered.');
    assert.deepEqual(details.fieldErrors, { email: ['Use a different email address.'] });
});

test('continues to parse legacy top-level messages and field errors', () => {
    const details = getApiErrorDetails({
        response: {
            status: 422,
            data: {
                message: 'Please correct the highlighted fields.',
                error: { fieldErrors: { password: 'Password is too short.' } },
            },
        },
    });

    assert.equal(details.message, 'Please correct the highlighted fields.');
    assert.deepEqual(details.fieldErrors, { password: ['Password is too short.'] });
});

test('returns an actionable timeout message for transport failures', () => {
    const details = getApiErrorDetails({ code: 'ECONNABORTED', message: 'timeout of 15000ms exceeded' });

    assert.equal(details.status, 0);
    assert.equal(details.message, 'The request timed out. Check your connection and try again.');
});

test('maps every safe server field message to the form callback', () => {
    const mapped: Record<string, string> = {};
    const fieldErrors = applyApiFieldErrors(
        new ApiError(400, 'Validation failed', {
            name: ['Name is required.'],
            'items.0.quantity': ['Quantity must be at least 1.'],
        }),
        (field, message) => { mapped[field] = message; },
    );

    assert.deepEqual(fieldErrors, {
        name: ['Name is required.'],
        'items.0.quantity': ['Quantity must be at least 1.'],
    });
    assert.deepEqual(mapped, {
        name: 'Name is required.',
        'items.0.quantity': 'Quantity must be at least 1.',
    });
});

test('registration rejects short passwords before the request is sent', () => {
    assert.equal(registerSchema.safeParse({
        name: 'Asha Traders',
        email: 'asha@example.com',
        password: 'short7',
    }).success, false);
    assert.equal(registerSchema.safeParse({
        name: 'Asha Traders',
        email: 'asha@example.com',
        password: 'secure8!',
    }).success, true);
});

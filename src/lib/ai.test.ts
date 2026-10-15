import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { z } from 'zod';
import {
  AiConfigurationError,
  AiOutputError,
  AiProviderError,
  getAiConfigurationStatus,
  getAiProviderFailureResponse,
  requestStructuredAi,
} from '@/lib/ai';

const responseSchema = z.object({ title: z.string(), count: z.number().int() });
const messages = [{ role: 'user' as const, content: 'Create a short quiz from this text.' }];

beforeEach(() => {
  vi.stubEnv('AI_API_KEY', 'unit-test-provider-key');
  vi.stubEnv('AI_API_URL', 'https://provider.example/v1');
  vi.stubEnv('AI_MODEL', 'test-model');
});

afterEach(() => {
  vi.unstubAllEnvs();
  vi.unstubAllGlobals();
});

describe('AI provider configuration', () => {
  it('reports the exact missing server variable without exposing any key', () => {
    vi.stubEnv('AI_API_KEY', '');
    const status = getAiConfigurationStatus();
    expect(status).toEqual({ provider: 'openai-compatible', configured: false, missingVariables: ['AI_API_KEY'] });
  });

  it('rejects a non-HTTPS remote provider endpoint', () => {
    vi.stubEnv('AI_API_URL', 'http://provider.example/v1');
    expect(getAiConfigurationStatus().missingVariables).toEqual(['AI_API_URL']);
  });

  it('does not call the provider when configuration is incomplete', async () => {
    vi.stubEnv('AI_API_KEY', '');
    const fetchMock = vi.fn();
    vi.stubGlobal('fetch', fetchMock);
    await expect(requestStructuredAi(messages, responseSchema)).rejects.toMatchObject({
      name: AiConfigurationError.name,
      missingVariables: ['AI_API_KEY'],
    });
    expect(fetchMock).not.toHaveBeenCalled();
  });
});

describe('OpenAI-compatible structured requests', () => {
  it('sends the configured model and validates structured output', async () => {
    const fetchMock = vi.fn().mockResolvedValue(new Response(JSON.stringify({
      choices: [{ message: { content: JSON.stringify({ title: 'Cell review', count: 3 }) } }],
    }), { status: 200, headers: { 'Content-Type': 'application/json' } }));
    vi.stubGlobal('fetch', fetchMock);

    await expect(requestStructuredAi(messages, responseSchema)).resolves.toEqual({ title: 'Cell review', count: 3 });
    expect(fetchMock).toHaveBeenCalledOnce();
    const [endpoint, options] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(endpoint).toBe('https://provider.example/v1/chat/completions');
    expect(new Headers(options.headers).get('Authorization')).toBe('Bearer unit-test-provider-key');
    expect(JSON.parse(String(options.body))).toMatchObject({ model: 'test-model', response_format: { type: 'json_object' } });
  });

  it.each([
    [401, 'unauthorized', 503, 'AI_PROVIDER_CREDENTIALS_INVALID'],
    [403, 'unauthorized', 503, 'AI_PROVIDER_CREDENTIALS_INVALID'],
    [429, 'rate_limit', 429, 'AI_PROVIDER_RATE_LIMITED'],
    [503, 'provider', 502, 'AI_PROVIDER_ERROR'],
    [400, 'request', 502, 'AI_PROVIDER_REQUEST_REJECTED'],
  ] as const)('classifies HTTP %i safely', async (httpStatus, failure, expectedStatus, expectedCode) => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response('{}', { status: httpStatus })));
    let caught: unknown;
    try {
      await requestStructuredAi(messages, responseSchema);
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(AiProviderError);
    const response = getAiProviderFailureResponse(caught as AiProviderError);
    expect(response).toMatchObject({ status: expectedStatus, code: expectedCode });
    expect(JSON.stringify(response)).not.toContain('unit-test-provider-key');
  });

  it('classifies provider timeouts separately from network failures', async () => {
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new DOMException('timeout', 'TimeoutError')));
    let caught: unknown;
    try {
      await requestStructuredAi(messages, responseSchema);
    } catch (error) {
      caught = error;
    }
    expect(caught).toBeInstanceOf(AiProviderError);
    expect(getAiProviderFailureResponse(caught as AiProviderError)).toMatchObject({ status: 504, code: 'AI_PROVIDER_TIMEOUT' });
  });

  it('rejects invalid JSON and schema-invalid model output', async () => {
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ choices: [{ message: { content: 'not json' } }] }), { status: 200 })));
    await expect(requestStructuredAi(messages, responseSchema)).rejects.toBeInstanceOf(AiOutputError);

    vi.stubGlobal('fetch', vi.fn().mockResolvedValue(new Response(JSON.stringify({ choices: [{ message: { content: JSON.stringify({ title: 'bad count', count: 'three' }) } }] }), { status: 200 })));
    await expect(requestStructuredAi(messages, responseSchema)).rejects.toBeInstanceOf(AiOutputError);
  });
});

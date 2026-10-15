import { z } from 'zod';

export type ChatMessage = { role: 'system' | 'user' | 'assistant'; content: string };
export type AiProviderFailure = 'network' | 'timeout' | 'unauthorized' | 'rate_limit' | 'provider' | 'request';

export interface AiConfigurationStatus {
  provider: 'openai-compatible';
  configured: boolean;
  missingVariables: string[];
}

export function getAiConfigurationStatus(): AiConfigurationStatus {
  const apiKey = process.env.AI_API_KEY?.trim();
  const baseUrl = process.env.AI_API_URL?.trim();
  const model = process.env.AI_MODEL?.trim();
  const missingVariables: string[] = [];

  if (!apiKey || /your-|placeholder|change-this/i.test(apiKey)) missingVariables.push('AI_API_KEY');
  if (!baseUrl) {
    missingVariables.push('AI_API_URL');
  } else {
    try {
      const url = new URL(baseUrl);
      const isLocalHttp = url.protocol === 'http:' && ['localhost', '127.0.0.1', '::1'].includes(url.hostname);
      if ((!isLocalHttp && url.protocol !== 'https:') || url.username || url.password) missingVariables.push('AI_API_URL');
    } catch {
      missingVariables.push('AI_API_URL');
    }
  }
  if (!model) missingVariables.push('AI_MODEL');

  return { provider: 'openai-compatible', configured: missingVariables.length === 0, missingVariables };
}

export class AiConfigurationError extends Error {
  constructor(public readonly missingVariables: string[]) {
    super('The AI provider configuration is incomplete.');
    this.name = 'AiConfigurationError';
  }
}

export class AiProviderError extends Error {
  constructor(public readonly status: number, public readonly failure: AiProviderFailure) {
    super('The AI provider request failed.');
    this.name = 'AiProviderError';
  }
}

export class AiOutputError extends Error {
  constructor() {
    super('The AI provider returned an invalid response.');
    this.name = 'AiOutputError';
  }
}

export function getAiProviderFailureResponse(error: AiProviderError): { status: number; code: string; message: string } {
  switch (error.failure) {
    case 'timeout':
      return { status: 504, code: 'AI_PROVIDER_TIMEOUT', message: 'The AI provider took too long to respond. Please try again.' };
    case 'network':
      return { status: 503, code: 'AI_PROVIDER_UNREACHABLE', message: 'The AI provider could not be reached. Check server network configuration.' };
    case 'unauthorized':
      return { status: 503, code: 'AI_PROVIDER_CREDENTIALS_INVALID', message: 'The AI provider rejected its server credentials. Check AI_API_KEY configuration.' };
    case 'rate_limit':
      return { status: 429, code: 'AI_PROVIDER_RATE_LIMITED', message: 'The AI provider is rate limiting requests. Please try again shortly.' };
    case 'provider':
      return { status: 502, code: 'AI_PROVIDER_ERROR', message: 'The AI provider failed to complete this request. Please try again later.' };
    case 'request':
      return { status: 502, code: 'AI_PROVIDER_REQUEST_REJECTED', message: 'The AI provider rejected this request. Check the configured model and provider compatibility.' };
  }
}

const completionResponseSchema = z.object({
  choices: z.array(z.object({ message: z.object({ content: z.string().nullable() }) })).min(1),
});

export async function requestStructuredAi<T>(messages: ChatMessage[], schema: z.ZodType<T>): Promise<T> {
  const key = process.env.AI_API_KEY?.trim();
  const baseUrl = process.env.AI_API_URL?.trim().replace(/\/+$/, '');
  const model = process.env.AI_MODEL?.trim();
  const configuration = getAiConfigurationStatus();
  if (!configuration.configured || !key || !baseUrl || !model) throw new AiConfigurationError(configuration.missingVariables);

  const endpoint = baseUrl.endsWith('/chat/completions') ? baseUrl : `${baseUrl}/chat/completions`;
  let response: Response;
  try {
    response = await fetch(endpoint, {
      method: 'POST',
      headers: { Authorization: `Bearer ${key}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({ model, messages, temperature: 0.2, response_format: { type: 'json_object' } }),
      signal: AbortSignal.timeout(45_000),
      cache: 'no-store',
    });
  } catch (error) {
    const isTimeout = error instanceof Error && (error.name === 'TimeoutError' || error.name === 'AbortError');
    throw new AiProviderError(0, isTimeout ? 'timeout' : 'network');
  }
  if (!response.ok) {
    const failure: AiProviderFailure = response.status === 401 || response.status === 403
      ? 'unauthorized'
      : response.status === 429
        ? 'rate_limit'
        : response.status >= 500
          ? 'provider'
          : 'request';
    throw new AiProviderError(response.status, failure);
  }

  let payload: unknown;
  try {
    payload = await response.json();
  } catch {
    throw new AiOutputError();
  }
  const completion = completionResponseSchema.safeParse(payload);
  const content = completion.success ? completion.data.choices[0]?.message.content : null;
  if (!content) throw new AiOutputError();

  try {
    return schema.parse(JSON.parse(content));
  } catch {
    throw new AiOutputError();
  }
}

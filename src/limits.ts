/**
 * Token limits for various AI models.
 * Includes OpenAI GPT models and Anthropic Claude models.
 */
export interface TokenLimitsConfig {
  maxTokens: number;
  responseTokens: number;
  requestTokens: number;
}

// Model-specific token limits
const MODEL_LIMITS: Record<string, TokenLimitsConfig> = {
  // OpenAI Models
  "gpt-4o": { maxTokens: 128000, responseTokens: 16384, requestTokens: 111516 },
  "gpt-4o-mini": {
    maxTokens: 128000,
    responseTokens: 16384,
    requestTokens: 111516,
  },
  "gpt-4-turbo": {
    maxTokens: 128000,
    responseTokens: 4096,
    requestTokens: 123804,
  },
  "gpt-4-turbo-preview": {
    maxTokens: 128000,
    responseTokens: 4096,
    requestTokens: 123804,
  },
  "gpt-4": { maxTokens: 8192, responseTokens: 2048, requestTokens: 6044 },
  "gpt-4-32k": { maxTokens: 32600, responseTokens: 4000, requestTokens: 28500 },
  "gpt-3.5-turbo": {
    maxTokens: 4096,
    responseTokens: 1000,
    requestTokens: 2996,
  },
  "gpt-3.5-turbo-16k": {
    maxTokens: 16384,
    responseTokens: 3000,
    requestTokens: 13284,
  },

  // Anthropic Claude Models
  "claude-sonnet-4-20250514": {
    maxTokens: 200000,
    responseTokens: 8192,
    requestTokens: 191708,
  },
  "claude-3-5-sonnet-20241022": {
    maxTokens: 200000,
    responseTokens: 8192,
    requestTokens: 191708,
  },
  "claude-3-5-sonnet-latest": {
    maxTokens: 200000,
    responseTokens: 8192,
    requestTokens: 191708,
  },
  "claude-3-5-haiku-20241022": {
    maxTokens: 200000,
    responseTokens: 8192,
    requestTokens: 191708,
  },
  "claude-3-opus-20240229": {
    maxTokens: 200000,
    responseTokens: 4096,
    requestTokens: 195804,
  },
  "claude-3-sonnet-20240229": {
    maxTokens: 200000,
    responseTokens: 4096,
    requestTokens: 195804,
  },
  "claude-3-haiku-20240307": {
    maxTokens: 200000,
    responseTokens: 4096,
    requestTokens: 195804,
  },

  // Default fallback for unknown models
  default: { maxTokens: 8000, responseTokens: 2000, requestTokens: 5900 },
};

/**
 * Get token limits for a model, with fallback to defaults.
 */
export function getTokenLimits(model: string): TokenLimitsConfig {
  return MODEL_LIMITS[model] ?? MODEL_LIMITS["default"];
}

/**
 * TokenLimits class for backwards compatibility.
 * Wraps the new config-based approach.
 */
export class TokenLimits {
  maxTokens: number;
  requestTokens: number;
  responseTokens: number;

  constructor(model = "gpt-3.5-turbo") {
    const limits = getTokenLimits(model);
    this.maxTokens = limits.maxTokens;
    this.responseTokens = limits.responseTokens;
    this.requestTokens = limits.requestTokens;
  }

  string(): string {
    return `max_tokens=${this.maxTokens}, request_tokens=${this.requestTokens}, response_tokens=${this.responseTokens}`;
  }
}

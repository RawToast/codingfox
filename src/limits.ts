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
  // OpenAI GPT-5 Models (current flagship)
  "gpt-5.2": { maxTokens: 400000, responseTokens: 128000, requestTokens: 271900 },
  "gpt-5.2-pro": { maxTokens: 400000, responseTokens: 128000, requestTokens: 271900 },
  "gpt-5-mini": { maxTokens: 400000, responseTokens: 128000, requestTokens: 271900 },
  "gpt-5-nano": { maxTokens: 400000, responseTokens: 128000, requestTokens: 271900 },
  "gpt-5.1": { maxTokens: 400000, responseTokens: 128000, requestTokens: 271900 },
  "gpt-5": { maxTokens: 400000, responseTokens: 128000, requestTokens: 271900 },

  // OpenAI GPT-4.1 Models
  "gpt-4.1": { maxTokens: 1047576, responseTokens: 32768, requestTokens: 1014708 },
  "gpt-4.1-mini": { maxTokens: 1047576, responseTokens: 32768, requestTokens: 1014708 },
  "gpt-4.1-nano": { maxTokens: 1047576, responseTokens: 32768, requestTokens: 1014708 },

  // OpenAI GPT-4o Models (legacy but still available)
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

  // Anthropic Claude 4.5 Models (current flagship)
  "claude-sonnet-4-5-20250929": {
    maxTokens: 200000,
    responseTokens: 64000,
    requestTokens: 135900,
  },
  "claude-sonnet-4-5": {
    maxTokens: 200000,
    responseTokens: 64000,
    requestTokens: 135900,
  },
  "claude-haiku-4-5-20251001": {
    maxTokens: 200000,
    responseTokens: 64000,
    requestTokens: 135900,
  },
  "claude-haiku-4-5": {
    maxTokens: 200000,
    responseTokens: 64000,
    requestTokens: 135900,
  },
  "claude-opus-4-5-20251101": {
    maxTokens: 200000,
    responseTokens: 64000,
    requestTokens: 135900,
  },
  "claude-opus-4-5": {
    maxTokens: 200000,
    responseTokens: 64000,
    requestTokens: 135900,
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

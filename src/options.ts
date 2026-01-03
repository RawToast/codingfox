import { info, warning } from "@actions/core";
import { minimatch } from "minimatch";
import { TokenLimits } from "./limits";
import { type Provider } from "./bot";

export class Options {
  debug: boolean;
  disableReview: boolean;
  disableReleaseNotes: boolean;
  maxFiles: number;
  reviewSimpleChanges: boolean;
  reviewCommentLGTM: boolean;
  pathFilters: PathFilter;
  systemMessage: string;

  // AI provider configuration
  aiProvider: Provider;
  aiLightModel: string;
  aiHeavyModel: string;
  aiTemperature: number;
  aiRetries: number;
  aiTimeoutMs: number;
  aiBaseUrl: string;
  aiConcurrencyLimit: number;

  // GitHub configuration
  githubConcurrencyLimit: number;

  // Token limits
  lightTokenLimits: TokenLimits;
  heavyTokenLimits: TokenLimits;

  // Locale
  language: string;

  // Legacy aliases for backwards compatibility
  get openaiLightModel(): string {
    return this.aiLightModel;
  }
  get openaiHeavyModel(): string {
    return this.aiHeavyModel;
  }
  get openaiModelTemperature(): number {
    return this.aiTemperature;
  }
  get openaiRetries(): number {
    return this.aiRetries;
  }
  get openaiTimeoutMS(): number {
    return this.aiTimeoutMs;
  }
  get openaiConcurrencyLimit(): number {
    return this.aiConcurrencyLimit;
  }
  get apiBaseUrl(): string {
    return this.aiBaseUrl;
  }

  constructor(
    debug: boolean,
    disableReview: boolean,
    disableReleaseNotes: boolean,
    maxFiles = "0",
    reviewSimpleChanges = false,
    reviewCommentLGTM = false,
    pathFilters: string[] | null = null,
    systemMessage = "",
    // New AI provider options
    aiProvider = "openai",
    aiLightModel = "gpt-4o-mini",
    aiHeavyModel = "gpt-4o",
    aiTemperature = "0.05",
    aiRetries = "5",
    aiTimeoutMs = "360000",
    aiConcurrencyLimit = "6",
    githubConcurrencyLimit = "6",
    aiBaseUrl = "",
    language = "en-US",
    // Legacy options (for backwards compatibility)
    openaiLightModel = "",
    openaiHeavyModel = "",
    openaiModelTemperature = "",
    openaiRetries = "",
    openaiTimeoutMs = "",
    openaiConcurrencyLimit = "",
    openaiBaseUrl = "",
  ) {
    this.debug = debug;
    this.disableReview = disableReview;
    this.disableReleaseNotes = disableReleaseNotes;
    this.maxFiles = parseInt(maxFiles);
    this.reviewSimpleChanges = reviewSimpleChanges;
    this.reviewCommentLGTM = reviewCommentLGTM;
    this.pathFilters = new PathFilter(pathFilters);
    this.systemMessage = systemMessage;

    // AI provider
    this.aiProvider = (aiProvider || "openai") as Provider;

    // Use legacy options if provided (backwards compatibility)
    if (openaiLightModel) {
      warning("openai_light_model is deprecated, use ai_light_model instead");
    }
    if (openaiHeavyModel) {
      warning("openai_heavy_model is deprecated, use ai_heavy_model instead");
    }
    if (openaiModelTemperature) {
      warning("openai_model_temperature is deprecated, use ai_temperature instead");
    }
    if (openaiRetries) {
      warning("openai_retries is deprecated, use ai_retries instead");
    }
    if (openaiTimeoutMs) {
      warning("openai_timeout_ms is deprecated, use ai_timeout_ms instead");
    }
    if (openaiConcurrencyLimit) {
      warning("openai_concurrency_limit is deprecated, use ai_concurrency_limit instead");
    }
    if (openaiBaseUrl) {
      warning("openai_base_url is deprecated, use ai_base_url instead");
    }

    // Apply values with legacy fallbacks
    this.aiLightModel = openaiLightModel || aiLightModel;
    this.aiHeavyModel = openaiHeavyModel || aiHeavyModel;
    this.aiTemperature = parseFloat(openaiModelTemperature || aiTemperature);
    this.aiRetries = parseInt(openaiRetries || aiRetries);
    this.aiTimeoutMs = parseInt(openaiTimeoutMs || aiTimeoutMs);
    this.aiConcurrencyLimit = parseInt(openaiConcurrencyLimit || aiConcurrencyLimit);
    this.aiBaseUrl = openaiBaseUrl || aiBaseUrl;

    this.githubConcurrencyLimit = parseInt(githubConcurrencyLimit);
    this.lightTokenLimits = new TokenLimits(this.aiLightModel);
    this.heavyTokenLimits = new TokenLimits(this.aiHeavyModel);
    this.language = language;
  }

  // print all options using core.info
  print(): void {
    info(`debug: ${this.debug}`);
    info(`disable_review: ${this.disableReview}`);
    info(`disable_release_notes: ${this.disableReleaseNotes}`);
    info(`max_files: ${this.maxFiles}`);
    info(`review_simple_changes: ${this.reviewSimpleChanges}`);
    info(`review_comment_lgtm: ${this.reviewCommentLGTM}`);
    info(`path_filters: ${this.pathFilters}`);
    info(`system_message: ${this.systemMessage}`);
    info(`ai_provider: ${this.aiProvider}`);
    info(`ai_light_model: ${this.aiLightModel}`);
    info(`ai_heavy_model: ${this.aiHeavyModel}`);
    info(`ai_temperature: ${this.aiTemperature}`);
    info(`ai_retries: ${this.aiRetries}`);
    info(`ai_timeout_ms: ${this.aiTimeoutMs}`);
    info(`ai_concurrency_limit: ${this.aiConcurrencyLimit}`);
    info(`github_concurrency_limit: ${this.githubConcurrencyLimit}`);
    info(`summary_token_limits: ${this.lightTokenLimits.string()}`);
    info(`review_token_limits: ${this.heavyTokenLimits.string()}`);
    info(`ai_base_url: ${this.aiBaseUrl}`);
    info(`language: ${this.language}`);
  }

  checkPath(path: string): boolean {
    const ok = this.pathFilters.check(path);
    info(`checking path: ${path} => ${ok}`);
    return ok;
  }
}

export class PathFilter {
  private readonly rules: Array<[string /* rule */, boolean /* exclude */]>;

  constructor(rules: string[] | null = null) {
    this.rules = [];
    if (rules != null) {
      for (const rule of rules) {
        const trimmed = rule?.trim();
        if (trimmed) {
          if (trimmed.startsWith("!")) {
            this.rules.push([trimmed.substring(1).trim(), true]);
          } else {
            this.rules.push([trimmed, false]);
          }
        }
      }
    }
  }

  check(path: string): boolean {
    if (this.rules.length === 0) {
      return true;
    }

    let included = false;
    let excluded = false;
    let inclusionRuleExists = false;

    for (const [rule, exclude] of this.rules) {
      if (minimatch(path, rule)) {
        if (exclude) {
          excluded = true;
        } else {
          included = true;
        }
      }
      if (!exclude) {
        inclusionRuleExists = true;
      }
    }

    return (!inclusionRuleExists || included) && !excluded;
  }
}

/**
 * Bot options for configuring the AI model.
 * Replaces the legacy OpenAIOptions class.
 */
export class BotOptions {
  model: string;
  tokenLimits: TokenLimits;

  constructor(model = "gpt-4o-mini", tokenLimits: TokenLimits | null = null) {
    this.model = model;
    if (tokenLimits != null) {
      this.tokenLimits = tokenLimits;
    } else {
      this.tokenLimits = new TokenLimits(model);
    }
  }
}

/**
 * @deprecated Use BotOptions instead
 */
export class OpenAIOptions extends BotOptions {}

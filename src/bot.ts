import { info, warning } from "@actions/core";
import { generateText, type ModelMessage, type LanguageModel } from "ai";
import { anthropic } from "@ai-sdk/anthropic";
import { openai } from "@ai-sdk/openai";
import { createOpenAICompatible } from "@ai-sdk/openai-compatible";
import { type Options } from "./options";
import { type TokenLimits } from "./limits";

// Provider types
export type Provider = "openai" | "anthropic" | "openai-compatible";

// Legacy Ids interface for backwards compatibility
export interface Ids {
  parentMessageId?: string;
  conversationId?: string;
}

// Bot options for configuring the AI model
export interface BotOptions {
  model: string;
  tokenLimits: TokenLimits;
}

// Get the appropriate model for the provider
function getModel(
  provider: Provider,
  modelName: string,
  options?: { baseUrl?: string; apiKey?: string },
): LanguageModel {
  switch (provider) {
    case "anthropic":
      return anthropic(modelName);
    case "openai":
      return openai(modelName);
    case "openai-compatible": {
      if (!options?.baseUrl) {
        throw new Error("baseUrl is required for openai-compatible provider");
      }
      const compatible = createOpenAICompatible({
        name: "openai-compatible",
        baseURL: options.baseUrl,
        apiKey: options.apiKey,
      });
      return compatible.chatModel(modelName);
    }
    default:
      throw new Error(`Unknown provider: ${provider}`);
  }
}

// Validate API key for the chosen provider
export function validateApiKey(provider: Provider): void {
  switch (provider) {
    case "openai":
      if (!process.env.OPENAI_API_KEY) {
        throw new Error("OPENAI_API_KEY environment variable is required for openai provider");
      }
      break;
    case "anthropic":
      if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error(
          "ANTHROPIC_API_KEY environment variable is required for anthropic provider",
        );
      }
      break;
    case "openai-compatible":
      if (!process.env.AI_API_KEY && !process.env.OPENAI_API_KEY) {
        throw new Error(
          "AI_API_KEY or OPENAI_API_KEY environment variable is required for openai-compatible provider",
        );
      }
      break;
  }
}

export class Bot {
  private readonly model: LanguageModel;
  private readonly options: Options;
  private readonly systemMessage: string;
  private readonly botOptions: BotOptions;

  constructor(
    options: Options,
    botOptions: BotOptions,
    provider: Provider = "openai",
    providerOptions?: { baseUrl?: string; apiKey?: string },
  ) {
    this.options = options;
    this.botOptions = botOptions;

    // Validate API key for the provider
    validateApiKey(provider);

    // Build system message with current date
    const currentDate = new Date().toISOString().split("T")[0];
    this.systemMessage = `${options.systemMessage}
Current date: ${currentDate}

IMPORTANT: Entire response must be in the language with ISO code: ${options.language}
`;

    // Initialize the model
    this.model = getModel(provider, botOptions.model, providerOptions);
  }

  // Chat method - maintains backwards compatible signature
  chat = async (message: string, ids: Ids): Promise<[string, Ids]> => {
    let res: [string, Ids] = ["", {}];
    try {
      res = await this.chat_(message, ids);
      return res;
    } catch (e: unknown) {
      if (e instanceof Error) {
        warning(`Failed to chat: ${e.message}, backtrace: ${e.stack}`);
      } else {
        warning(`Failed to chat: ${e}`);
      }
      return res;
    }
  };

  private readonly chat_ = async (message: string, _ids: Ids): Promise<[string, Ids]> => {
    // Record timing
    const start = Date.now();

    if (!message) {
      return ["", {}];
    }

    // Build messages array
    const messages: ModelMessage[] = [
      { role: "system", content: this.systemMessage },
      { role: "user", content: message },
    ];

    try {
      const { text } = await generateText({
        model: this.model,
        messages,
        maxRetries: this.options.aiRetries,
        temperature: this.options.aiTemperature,
        abortSignal: AbortSignal.timeout(this.options.aiTimeoutMs),
      });

      const end = Date.now();
      info(`AI response time: ${end - start} ms`);

      if (this.options.debug) {
        info(`AI response: ${text}`);
      }

      let responseText = text;

      // Remove the prefix "with " in the response (legacy behavior)
      if (responseText.startsWith("with ")) {
        responseText = responseText.substring(5);
      }

      // Return empty Ids - the legacy parentMessageId pattern is not used with AI SDK
      return [responseText, {}];
    } catch (e: unknown) {
      if (e instanceof Error) {
        info(`Failed to send message to AI: ${e.message}, backtrace: ${e.stack}`);
      }
      throw e;
    }
  };
}

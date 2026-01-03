import { type ModelMessage } from "ai";
import { type Bot } from "./bot";

/**
 * Conversation helper class for multi-turn chat state management.
 * This replaces the legacy parentMessageId pattern with explicit message arrays.
 */
export class Conversation {
  private messages: ModelMessage[] = [];
  private readonly systemMessage: string;

  constructor(systemMessage: string) {
    this.systemMessage = systemMessage;
  }

  /**
   * Add a user message and get AI response.
   * The conversation history is maintained automatically.
   */
  async chat(bot: Bot, userMessage: string): Promise<string> {
    this.messages.push({ role: "user", content: userMessage });

    // Use bot.chat with the full conversation context
    // Note: Currently bot.chat handles system message internally,
    // so we pass only the user message for single-turn calls
    const [response] = await bot.chat(userMessage, {});

    this.messages.push({ role: "assistant", content: response });
    return response;
  }

  /**
   * For single-shot calls (no history needed).
   * This is the most common pattern in the codebase.
   */
  static async single(bot: Bot, _systemMessage: string, prompt: string): Promise<string> {
    const [response] = await bot.chat(prompt, {});
    return response;
  }

  /**
   * Reset conversation history.
   */
  clear(): void {
    this.messages = [];
  }

  /**
   * Get current conversation history.
   */
  getMessages(): ModelMessage[] {
    return [...this.messages];
  }
}

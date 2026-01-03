import { getBooleanInput, getInput, getMultilineInput, setFailed, warning } from "@actions/core";
import { Bot, validateApiKey } from "./bot";
import { BotOptions, Options } from "./options";
import { Prompts } from "./prompts";
import { codeReview } from "./review";
import { handleReviewComment } from "./review-comment";

async function run(): Promise<void> {
  const options: Options = new Options(
    getBooleanInput("debug"),
    getBooleanInput("disable_review"),
    getBooleanInput("disable_release_notes"),
    getInput("max_files"),
    getBooleanInput("review_simple_changes"),
    getBooleanInput("review_comment_lgtm"),
    getMultilineInput("path_filters"),
    getInput("system_message"),
    // New AI options
    getInput("ai_provider"),
    getInput("ai_light_model"),
    getInput("ai_heavy_model"),
    getInput("ai_temperature"),
    getInput("ai_retries"),
    getInput("ai_timeout_ms"),
    getInput("ai_concurrency_limit"),
    getInput("github_concurrency_limit"),
    getInput("ai_base_url"),
    getInput("language"),
    // Legacy options for backwards compatibility
    getInput("openai_light_model"),
    getInput("openai_heavy_model"),
    getInput("openai_model_temperature"),
    getInput("openai_retries"),
    getInput("openai_timeout_ms"),
    getInput("openai_concurrency_limit"),
    getInput("openai_base_url"),
  );

  // print options
  options.print();

  const prompts: Prompts = new Prompts(getInput("summarize"), getInput("summarize_release_notes"));

  // Validate API key for the selected provider
  try {
    validateApiKey(options.aiProvider);
  } catch (e: any) {
    setFailed(`API key validation failed: ${e.message}`);
    return;
  }

  // Provider options for openai-compatible
  const providerOptions =
    options.aiProvider === "openai-compatible" && options.aiBaseUrl
      ? {
          baseUrl: options.aiBaseUrl,
          apiKey: process.env.AI_API_KEY || process.env.OPENAI_API_KEY,
        }
      : undefined;

  // Create two bots, one for summary and one for review
  let lightBot: Bot | null = null;
  try {
    lightBot = new Bot(
      options,
      new BotOptions(options.aiLightModel, options.lightTokenLimits),
      options.aiProvider,
      providerOptions,
    );
  } catch (e: any) {
    warning(
      `Skipped: failed to create summary bot, please check your API key: ${e.message}, backtrace: ${e.stack}`,
    );
    return;
  }

  let heavyBot: Bot | null = null;
  try {
    heavyBot = new Bot(
      options,
      new BotOptions(options.aiHeavyModel, options.heavyTokenLimits),
      options.aiProvider,
      providerOptions,
    );
  } catch (e: any) {
    warning(
      `Skipped: failed to create review bot, please check your API key: ${e.message}, backtrace: ${e.stack}`,
    );
    return;
  }

  try {
    // check if the event is pull_request
    if (
      process.env.GITHUB_EVENT_NAME === "pull_request" ||
      process.env.GITHUB_EVENT_NAME === "pull_request_target"
    ) {
      await codeReview(lightBot, heavyBot, options, prompts);
    } else if (process.env.GITHUB_EVENT_NAME === "pull_request_review_comment") {
      await handleReviewComment(heavyBot, options, prompts);
    } else {
      warning("Skipped: this action only works on push events or pull_request");
    }
  } catch (e: any) {
    if (e instanceof Error) {
      setFailed(`Failed to run: ${e.message}, backtrace: ${e.stack}`);
    } else {
      setFailed(`Failed to run: ${e}, backtrace: ${e.stack}`);
    }
  }
}

process
  .on("unhandledRejection", (reason, p) => {
    warning(`Unhandled Rejection at Promise: ${reason}, promise is ${p}`);
  })
  .on("uncaughtException", (e: any) => {
    warning(`Uncaught Exception thrown: ${e}, backtrace: ${e.stack}`);
  });

run().catch((error) => {
  setFailed(`Failed to run: ${error.message}`);
});

# CodeFox Modernization Plan

## Overview

This document outlines the plan to modernize CodeFox from a ChatGPT-only tool to
a multi-provider AI code reviewer with a modern, fast toolchain.

## Current State Analysis

### Core Architecture

| File                | Purpose                | Issues                                                        |
| ------------------- | ---------------------- | ------------------------------------------------------------- |
| `bot.ts`            | AI chat interface      | Uses legacy `chatgpt` npm package, OpenAI-only                |
| `tokenizer.ts`      | Token counting         | Uses `@dqbd/tiktoken`, OpenAI-specific                        |
| `fetch-polyfill.js` | Polyfills global fetch | Unnecessary in Node 18+/Bun                                   |
| `options.ts`        | Configuration          | Hardcoded to OpenAI model names                               |
| `limits.ts`         | Token limits           | Only knows GPT-3.5/GPT-4 limits                               |
| `review.ts`         | Main review logic      | Uses `lightBot`/`heavyBot` pattern, `p-limit` for concurrency |
| `review-comment.ts` | Reply handling         | Uses `parentMessageId` for conversation threading             |
| `octokit.ts`        | GitHub API client      | Uses Octokit + throttling/retry plugins (keep)                |

### Dependencies to Replace

| Current                      | Issue                               | Replacement                                        |
| ---------------------------- | ----------------------------------- | -------------------------------------------------- |
| `chatgpt`                    | OpenAI-only, legacy API             | `ai` + `@ai-sdk/anthropic` + `@ai-sdk/openai` + `@ai-sdk/openai-compatible` |
| `node-fetch`                 | Native fetch exists in Node 18+/Bun | Remove entirely                                    |
| `@dqbd/tiktoken`             | Only counts OpenAI tokens           | Keep for now (works as approximation)              |
| `p-retry`                    | Extra dep                           | AI SDK has built-in retry                          |
| `p-limit`                    | Concurrency control                 | **Keep** - no Bun equivalent for semaphore pattern |
| `eslint` + 7 plugins         | Slow, complex config                | `oxlint`                                           |
| `prettier`                   | Slow                                | `oxfmt`                                            |
| `jest` + `ts-jest`           | Slow, needs config                  | `bun test` (built-in)                              |
| `typescript` + `@vercel/ncc` | Complex build pipeline              | `bun build` (single-file bundler)                  |

---

## Proposed New Stack

### 1. AI Provider Layer (Vercel AI SDK)

The Vercel AI SDK provides a unified interface for multiple AI providers:

```typescript
// New bot.ts approach
import {generateText, CoreMessage} from 'ai'
import {anthropic} from '@ai-sdk/anthropic'
import {openai} from '@ai-sdk/openai'
import {createOpenAICompatible} from '@ai-sdk/openai-compatible'

type Provider = 'anthropic' | 'openai' | 'openai-compatible'

function getModel(
  provider: Provider,
  modelName: string,
  options?: {baseUrl?: string; apiKey?: string}
) {
  switch (provider) {
    case 'anthropic':
      return anthropic(modelName)
    case 'openai':
      return openai(modelName)
    case 'openai-compatible': {
      // Supports: Ollama, Together, Groq, Fireworks, Azure, etc.
      if (!options?.baseUrl) {
        throw new Error('baseUrl is required for openai-compatible provider')
      }
      return createOpenAICompatible({
        name: 'openai-compatible',
        baseURL: options.baseUrl,
        apiKey: options.apiKey
      }).chatModel(modelName)
    }
  }
}

// Unified chat interface with full options
async function chat(
  messages: CoreMessage[],
  options: {
    model: ReturnType<typeof getModel>
    temperature?: number
    maxRetries?: number
    timeoutMs?: number
  }
): Promise<string> {
  const abortSignal = options.timeoutMs
    ? AbortSignal.timeout(options.timeoutMs)
    : undefined

  const {text} = await generateText({
    model: options.model,
    messages,
    maxRetries: options.maxRetries ?? 3,
    temperature: options.temperature ?? 0.05,
    abortSignal
  })
  return text
}
```

**Enables:**

- Anthropic Claude (claude-sonnet-4-20250514, claude-3-5-sonnet, etc.)
- OpenAI (gpt-4o, gpt-4-turbo, o1, etc.)
- Any OpenAI-compatible endpoint (Ollama, Together, Groq, Fireworks, etc.)
- Built-in retry logic
- Timeout handling via AbortController
- Streaming support (future enhancement)

### 2. Conversation History Management

The current code tracks `parentMessageId` for multi-turn conversations. The new
approach uses explicit message arrays:

```typescript
// New conversation helper class
export class Conversation {
  private messages: CoreMessage[] = []
  private systemMessage: string

  constructor(systemMessage: string) {
    this.systemMessage = systemMessage
  }

  // Add a user message and get AI response
  async chat(bot: Bot, userMessage: string): Promise<string> {
    this.messages.push({role: 'user', content: userMessage})

    const response = await bot.chat([
      {role: 'system', content: this.systemMessage},
      ...this.messages
    ])

    this.messages.push({role: 'assistant', content: response})
    return response
  }

  // For single-shot calls (no history needed)
  static async single(
    bot: Bot,
    systemMessage: string,
    prompt: string
  ): Promise<string> {
    return bot.chat([
      {role: 'system', content: systemMessage},
      {role: 'user', content: prompt}
    ])
  }

  // Reset conversation
  clear(): void {
    this.messages = []
  }
}
```

**Migration pattern:**

```typescript
// Old (review.ts)
const [response, newIds] = await heavyBot.chat(prompt, {parentMessageId})

// New
const response = await Conversation.single(heavyBot, systemMessage, prompt)
// Or for multi-turn:
const conversation = new Conversation(systemMessage)
const response1 = await conversation.chat(heavyBot, prompt1)
const response2 = await conversation.chat(heavyBot, prompt2) // Includes history
```

### 3. Runtime & Build (Bun)

**bunfig.toml:**

```toml
[install]
exact = true

[install.lockfile]
save = true
```

**Build command:**

```bash
bun build src/main.ts --outfile dist/index.js --target node --format cjs --minify
```

**Benefits:**

- Replaces `typescript` compiler
- Replaces `@vercel/ncc` bundler
- Native fetch (no polyfill needed)
- Built-in test runner (Jest-compatible)
- 10-100x faster installs

**Note:** Use `--format cjs` and output to `dist/index.js` to match `action.yml`
and ensure the bundle can be executed by GitHub Actions' Node.js runtime.

### 4. Linting & Formatting (Oxc)

**Oxlint:** 50-100x faster than ESLint **Oxfmt:** 30x faster than Prettier,
Prettier-compatible

```json
{
  "scripts": {
    "lint": "oxlint src/",
    "format": "oxfmt --write src/",
    "format:check": "oxfmt --check src/"
  }
}
```

### 5. New package.json

```json
{
  "name": "codefox",
  "version": "0.1.0",
  "private": true,
  "description": "CodeFox - AI-Powered Pull Request Reviewer. Multi-provider AI support.",
  "main": "dist/index.js",
  "scripts": {
    "build": "bun build src/main.ts --outfile dist/index.js --target node --format cjs --minify",
    "dev": "bun run src/main.ts",
    "test": "bun test",
    "lint": "oxlint src/",
    "format": "oxfmt --write src/",
    "format:check": "oxfmt --check src/",
    "typecheck": "tsc --noEmit",
    "all": "bun run typecheck && bun run lint && bun run format:check && bun run test && bun run build"
  },
  "dependencies": {
    "@actions/core": "1.10.1",
    "@actions/github": "6.0.0",
    "@ai-sdk/anthropic": "1.0.0",
    "@ai-sdk/openai": "1.0.0",
    "@ai-sdk/openai-compatible": "1.0.0",
    "@octokit/action": "6.0.4",
    "@octokit/plugin-retry": "4.1.3",
    "@octokit/plugin-throttling": "6.1.0",
    "ai": "4.0.0",
    "minimatch": "10.0.1",
    "@dqbd/tiktoken": "1.0.7",
    "p-limit": "6.0.0"
  },
  "devDependencies": {
    "@types/bun": "latest",
    "oxlint": "0.16.0",
    "oxfmt": "0.1.0",
    "typescript": "5.7.0"
  }
}
```

---

## Migration Tasks

### Phase 1: Tooling & Foundation (Low Risk)

Modernize the development toolchain first so all subsequent work benefits from
faster builds, tests, and linting.

| #   | Task                | Complexity | Description                                                                                         |
| --- | ------------------- | ---------- | --------------------------------------------------------------------------------------------------- |
| 1.1 | Initialize Bun      | Low        | Run `bun init`, create `bunfig.toml`, convert `package-lock.json` to `bun.lockb`                    |
| 1.2 | Replace build       | Low        | `bun build` instead of `tsc` + `ncc`, ensure CJS output (`--format cjs`) and verify WASM handling for tiktoken |
| 1.3 | Replace tests       | Low        | `bun test`, update imports (Jest-compatible API)                                                    |
| 1.4 | Replace linting     | Low        | Remove ESLint + plugins, add oxlint, create config                                                  |
| 1.5 | Replace formatting  | Low        | Remove Prettier, add oxfmt, run initial format                                                      |
| 1.6 | Remove node-fetch   | Low        | Delete `fetch-polyfill.js`, remove imports from `bot.ts` and `main.ts`                              |
| 1.7 | Update Node target  | Low        | Change `action.yml` from `node16` to `node20`                                                       |
| 1.8 | Update CI workflows | Low        | Change npm/jest/eslint commands to bun equivalents; add a Node 20 smoke test that executes the bundled `dist/index.js` |
| 1.9 | Delete old configs  | Low        | Remove `.eslintrc.json`, `.eslintignore`, `jest.config.json`, `.prettierrc.json`, `.prettierignore` |

**Checkpoint:** Run `bun run all` - typecheck, lint, format, test, build should
all pass.

### Phase 2: AI Provider (Medium Risk)

| #   | Task                       | Complexity | Description                                                    |
| --- | -------------------------- | ---------- | -------------------------------------------------------------- |
| 2.1 | Add Vercel AI SDK          | Low        | Install `ai`, `@ai-sdk/openai`, `@ai-sdk/anthropic`            |
| 2.2 | Rewrite bot.ts             | Medium     | New provider-agnostic chat interface with temperature/timeout  |
| 2.3 | Create conversation helper | Medium     | New `Conversation` class for multi-turn chat state             |
| 2.4 | Update options.ts          | Medium     | Add provider selection, preserve light/heavy model distinction |
| 2.5 | Update limits.ts           | Medium     | Add token limits for Claude models                             |
| 2.6 | Update action.yml          | Low        | Add `ai_provider`, `ai_light_model`, `ai_heavy_model` inputs   |
| 2.7 | Add API key validation     | Low        | Validate correct key present for chosen provider               |
| 2.8 | Update review.ts           | Medium     | Use new bot interface, update error messages                   |
| 2.9 | Update review-comment.ts   | Medium     | Use Conversation class for reply threading                     |

**Checkpoint:** Test with real PR using OpenAI, then Anthropic.

### Phase 3: Cleanup & Documentation

| #   | Task                  | Complexity | Description                                               |
| --- | --------------------- | ---------- | --------------------------------------------------------- |
| 3.1 | Remove old deps       | Low        | Remove chatgpt, p-retry, node-fetch, eslint/prettier deps |
| 3.2 | Update error messages | Low        | Change "openai" to "AI provider" in user-facing messages  |
| 3.3 | Update README         | Medium     | Document new provider options, configuration examples     |
| 3.4 | Add migration guide   | Low        | Document upgrade path for existing users                  |

---

## Configuration Changes

### New action.yml Inputs

```yaml
inputs:
  # New provider configuration
  ai_provider:
    required: false
    description: 'AI provider: openai, anthropic, or openai-compatible'
    default: 'openai'

  ai_light_model:
    required: false
    description:
      'Model for quick tasks like summarization (e.g., gpt-4o-mini,
      claude-3-5-haiku-20241022)'
    default: 'gpt-4o-mini'

  ai_heavy_model:
    required: false
    description:
      'Model for complex tasks like code review (e.g., gpt-4o,
      claude-sonnet-4-20250514)'
    default: 'gpt-4o'

  ai_base_url:
    required: false
    description: 'Custom base URL for openai-compatible providers'
    default: ''

  ai_temperature:
    required: false
    description: 'Temperature for AI model (0.0-1.0)'
    default: '0.05'

  ai_timeout_ms:
    required: false
    description: 'Timeout for AI API calls in milliseconds'
    default: '360000'

  ai_retries:
    required: false
    description: 'Number of retries for AI API calls'
    default: '5'

  # Deprecated (kept for backwards compatibility)
  openai_light_model:
    required: false
    description: '[DEPRECATED] Use ai_light_model instead'
    default: ''

  openai_heavy_model:
    required: false
    description: '[DEPRECATED] Use ai_heavy_model instead'
    default: ''

  openai_model_temperature:
    required: false
    description: '[DEPRECATED] Use ai_temperature instead'
    default: ''
```

### Environment Variables

| Variable            | Provider          | Description                          |
| ------------------- | ----------------- | ------------------------------------ |
| `OPENAI_API_KEY`    | openai            | OpenAI API key                       |
| `ANTHROPIC_API_KEY` | anthropic         | Anthropic API key                    |
| `AI_API_KEY`        | openai-compatible | Generic API key for custom endpoints |

### API Key Validation Logic

```typescript
function validateApiKey(provider: Provider): void {
  switch (provider) {
    case 'openai':
      if (!process.env.OPENAI_API_KEY) {
        throw new Error(
          'OPENAI_API_KEY environment variable is required for openai provider'
        )
      }
      break
    case 'anthropic':
      if (!process.env.ANTHROPIC_API_KEY) {
        throw new Error(
          'ANTHROPIC_API_KEY environment variable is required for anthropic provider'
        )
      }
      break
    case 'openai-compatible':
      if (!process.env.AI_API_KEY && !process.env.OPENAI_API_KEY) {
        throw new Error(
          'AI_API_KEY or OPENAI_API_KEY environment variable is required for openai-compatible provider'
        )
      }
      break
  }
}
```

---

## Key Design Decisions

### 1. Token Counting Strategy

**Decision:** Keep `@dqbd/tiktoken` for now

**Rationale:**

- OpenAI's cl100k_base tokenizer works as reasonable approximation for Claude
- AI SDK's `countTokens()` is experimental
- Can upgrade later without breaking changes

### 2. Conversation History

**Current:** Tracks `parentMessageId` for context **New:** Explicit message
array with `Conversation` helper class

The `Conversation` class encapsulates multi-turn chat state and provides both:

- `chat()` for multi-turn conversations (accumulates history)
- `single()` static method for one-shot calls (no history)

### 3. Backwards Compatibility

**Decision:** Keep OpenAI as default, make other providers opt-in

- `OPENAI_API_KEY` continues to work as-is
- New `ai_provider` input defaults to `'openai'`
- Deprecation warnings for old input names
- Light/heavy model distinction preserved

### 4. Model Limits

**New limits.ts structure:**

```typescript
interface TokenLimits {
  maxTokens: number
  responseTokens: number
  requestTokens: number // Computed: maxTokens - responseTokens - 100
}

const MODEL_LIMITS: Record<string, TokenLimits> = {
  // OpenAI
  'gpt-4o': {maxTokens: 128000, responseTokens: 16384, requestTokens: 111516},
  'gpt-4o-mini': {
    maxTokens: 128000,
    responseTokens: 16384,
    requestTokens: 111516
  },
  'gpt-4-turbo': {
    maxTokens: 128000,
    responseTokens: 4096,
    requestTokens: 123804
  },
  'gpt-4': {maxTokens: 8192, responseTokens: 2048, requestTokens: 6044},

  // Anthropic
  'claude-sonnet-4-20250514': {
    maxTokens: 200000,
    responseTokens: 8192,
    requestTokens: 191708
  },
  'claude-3-5-sonnet-20241022': {
    maxTokens: 200000,
    responseTokens: 8192,
    requestTokens: 191708
  },
  'claude-3-5-haiku-20241022': {
    maxTokens: 200000,
    responseTokens: 8192,
    requestTokens: 191708
  },
  'claude-3-opus-20240229': {
    maxTokens: 200000,
    responseTokens: 4096,
    requestTokens: 195804
  },

  // Default fallback
  default: {maxTokens: 8000, responseTokens: 2000, requestTokens: 5900}
}

// Helper to get limits with fallback
function getTokenLimits(model: string): TokenLimits {
  return MODEL_LIMITS[model] ?? MODEL_LIMITS['default']
}
```

**Note:** The `knowledgeCutOff` field from the current implementation is
removed. Modern models have recent training data, and the system prompt already
includes the current date.

### 5. Concurrency Control

**Decision:** Keep `p-limit` dependency

The current code uses `p-limit` for concurrent API call throttling:

```typescript
const openaiConcurrencyLimit = pLimit(options.openaiConcurrencyLimit)
const githubConcurrencyLimit = pLimit(options.githubConcurrencyLimit)
```

Bun doesn't provide an equivalent semaphore utility. Keeping `p-limit` (~2KB) is
simpler than reimplementing.

---

## Risks & Mitigations

| Risk                                 | Impact | Mitigation                                                                 |
| ------------------------------------ | ------ | -------------------------------------------------------------------------- |
| Prompt differences between providers | Medium | Test with both Claude and GPT-4, document any provider-specific quirks     |
| Token limits vary by model           | Low    | Comprehensive MODEL_LIMITS map with safe defaults                          |
| GitHub Actions node16 deprecation    | High   | Already updating to node20                                                 |
| Breaking changes for existing users  | Medium | Keep OpenAI as default, deprecation warnings                               |
| Bun compatibility in GitHub Actions  | Low    | Bun works in Actions, has official setup action. Bundle for Node (`--target node --format cjs`) and smoke-test by running `node dist/index.js`. |
| tiktoken WASM in bundled output      | Low    | Current build already handles this; verify with `bun build`                |

---

## Files to Create/Modify

### New Files

- `bunfig.toml` - Bun configuration
- `.oxfmtrc.jsonc` - Oxfmt configuration
- `oxlint.json` - Oxlint configuration (optional)
- `src/conversation.ts` - Conversation history helper class

### Modified Files

- `package.json` - New deps, scripts
- `action.yml` - New inputs, node20
- `src/bot.ts` - Vercel AI SDK integration
- `src/options.ts` - Provider configuration
- `src/limits.ts` - Multi-model token limits
- `src/main.ts` - Remove fetch polyfill import, add API key validation
- `src/review.ts` - Use new bot interface, update error messages
- `src/review-comment.ts` - Use Conversation class for threading
- `tsconfig.json` - Update for Bun types

### Deleted Files

- `src/fetch-polyfill.js`
- `.eslintrc.json`
- `jest.config.json`
- `.prettierrc.json`

---

## Success Criteria

1. **Functional:** Can review PRs using both OpenAI and Anthropic
2. **Backwards Compatible:** Existing OpenAI users see no change
3. **Performance:** Build time < 5s, lint time < 1s
4. **Developer Experience:** Single `bun run all` command validates everything
5. **Maintainability:** Fewer dependencies, simpler configuration
6. **Error Handling:** Clear error messages when API key missing for chosen
   provider

---

## Timeline Estimate

| Phase                         | Duration  | Dependencies |
| ----------------------------- | --------- | ------------ |
| Phase 1: Tooling & Foundation | 2-3 hours | None         |
| Phase 2: AI Provider          | 4-5 hours | Phase 1      |
| Phase 3: Cleanup & Docs       | 1-2 hours | Phase 2      |
| Testing & Polish              | 2-3 hours | All phases   |

**Total: ~10-12 hours**

---

## Testing Strategy

### Unit Tests

- Test `Conversation` class message accumulation
- Test `getTokenLimits()` fallback behavior
- Test API key validation for each provider

### Integration Tests

- Test against OpenAI API with real PR diff
- Test against Anthropic API with real PR diff
- Test error handling when API key missing
- Run the bundled output under Node 20 (e.g. `node dist/index.js`) to ensure the JS action entrypoint works outside Bun

### Manual Testing

- Run against this repository's PRs
- Verify backwards compatibility with existing workflow configs

---

## Next Steps

1. Review and approve this plan
2. Create a feature branch: `feat/multi-provider-modernization`
3. Execute phases in order
4. Test with real PRs using both providers
5. Update documentation
6. Release as v0.1.0

---

## Future Improvements

### Token Counting with ai-tokenizer

The current implementation uses `gpt-tokenizer` which works well for OpenAI models
but uses a single encoding (cl100k_base) for all providers. For more accurate
token counting across different providers, consider migrating to
[ai-tokenizer](https://github.com/coder/ai-tokenizer):

**Benefits:**
- Model-specific encodings for accurate counts across all providers
- First-class Vercel AI SDK support
- No WASM, pure JS, 5-7x faster than tiktoken
- High accuracy (97-99%+) for:
  - OpenAI: gpt-5, gpt-5-mini, gpt-5-nano
  - Anthropic: claude-sonnet-4.5, claude-haiku-4.5, claude-opus-4.5
  - xAI: grok-3, grok-4
  - Google: gemini-2.5, gemini-3
  - DeepSeek: deepseek-v3
  - ZAI/GLM: glm-4.5 (~96%)

**Migration:**
```typescript
// Current (gpt-tokenizer)
import { encode } from "gpt-tokenizer";
export function getTokenCount(input: string): number {
  return encode(input).length;
}

// Future (ai-tokenizer) - model-aware
import Tokenizer, { models } from "ai-tokenizer";
import * as encoding from "ai-tokenizer/encoding";

// Select encoding based on provider/model
const model = models["openai/gpt-5"]; // or "anthropic/claude-sonnet-4.5", "zai/glm-4.5"
const tokenizer = new Tokenizer(encoding[model.encoding]);
export function getTokenCount(input: string): number {
  return tokenizer.count(input);
}
```

**Note:** Each encoding is 2-8MB, so import selectively based on configured provider.

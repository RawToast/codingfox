# CodingFox: AI Code Reviews

```
                                        ████                                
                                    ████▒▒██                                
                                  ████  ▒▒██                                
                                ██▒▒  ▒▒▒▒▒▒██                              
                              ██▒▒██        ██                              
  ████                      ██▒▒██          ██                              
██▒▒▒▒██████                ██▒▒██      ▒▒  ████                            
██▒▒▒▒██    ████      ██████▒▒▒▒▒▒██    ▒▒▒▒██████████████                  
██▒▒    ████▒▒▒▒██████▒▒▒▒▒▒▒▒▒▒▒▒▒▒██▒▒▒▒▒▒██▒▒▒▒▒▒▒▒▒▒▒▒████              
██▒▒▒▒      ██▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒██▒▒██▒▒▒▒▒▒▒▒▒▒▒▒▒▒██            
  ██▒▒      ██▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒██▒▒██▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒████        
  ██        ██▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒██▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒██      
  ██▒▒    ██▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒████▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒██    
  ██▒▒▒▒  ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒  ██▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒██    
    ██▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒    ██▒▒▒▒▒▒▒▒▒▒████▒▒▒▒▒▒▒▒██  
    ████▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒██      ██▒▒▒▒▒▒████▒▒▒▒▒▒▒▒▒▒▒▒██  
    ██▒▒██▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒██        ██▒▒▒▒██▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒██  
      ██▒▒██▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒██        ██████▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒██  
      ██▒▒██▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒██      ██▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒██
        ████  ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒    ██▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒██
          ██    ▒▒██████▒▒▒▒▒▒▒▒▒▒▒▒▒▒    ██▒▒  ▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒▒██
          ██            ████▒▒▒▒▒▒▒▒▒▒    ██  ▒▒  ▒▒        ▒▒▒▒▒▒▒▒▒▒▒▒██  
            ██                      ██  ████  ▒▒          ▒▒▒▒▒▒▒▒▒▒▒▒▒▒██  
              ██                      ██▒▒██              ▒▒  ▒▒▒▒▒▒▒▒▒▒██  
                ██████████████████████▒▒▒▒██                    ▒▒▒▒▒▒██    
                      ██▒▒      ██▒▒▒▒▒▒▒▒██                    ▒▒▒▒██      
                      ██▒▒▒▒  ██▒▒▒▒▒▒▒▒████                  ▒▒▒▒██        
                      ██▒▒▒▒▒▒██▒▒▒▒▒▒██  ██                    ██          
                        ██████▒▒▒▒▒▒██    ██                ████            
                              ██████      ██          ██████                
                                            ██    ████                      
                                            ██████                                   

                        CodingFox - Your AI Code Review Partner
                        Stop shipping bugs. Start shipping excellence.
```

[![License: MIT](https://img.shields.io/badge/License-MIT-orange.svg)](https://opensource.org/licenses/MIT)

## Overview

**CodingFox** is an intelligent AI-powered code review assistant that revolutionizes your pull request workflow. Supporting multiple AI providers (OpenAI, Anthropic, and OpenAI-compatible endpoints), CodingFox provides instant, contextual code reviews that catch bugs, improve code quality, and accelerate your development cycle.

## Key Features

- **Multi-Provider Support**: OpenAI (GPT-5), Anthropic (Claude), or any OpenAI-compatible API
- **Instant PR Analysis**: Get comprehensive code reviews in seconds
- **Line-by-Line Review**: Detailed suggestions for every code change
- **Interactive Chat**: Tag `@codingfox` to ask questions about your code
- **Smart Summaries**: Automatic PR summaries and release notes
- **Customizable**: Tailor prompts, models, and review behavior to your needs

## Quick Start

### 1. Add Your API Key to GitHub Secrets

Go to your repository **Settings** > **Secrets and variables** > **Actions** > **New repository secret**:

| Provider | Secret Name | Where to Get It |
|----------|-------------|-----------------|
| OpenAI | `OPENAI_API_KEY` | [platform.openai.com/api-keys](https://platform.openai.com/api-keys) |
| Anthropic | `ANTHROPIC_API_KEY` | [console.anthropic.com](https://console.anthropic.com/) |
| OpenAI-compatible | `AI_API_KEY` | Your provider's dashboard |

### 2. Create the Workflow

Create `.github/workflows/codingfox-review.yml`:

```yaml
name: CodingFox AI Review

permissions:
  contents: read
  pull-requests: write

on:
  pull_request:
    types: [opened, synchronize, reopened]
  pull_request_review_comment:
    types: [created]

concurrency:
  group: ${{ github.repository }}-${{ github.event.number || github.head_ref || github.sha }}-${{ github.workflow }}
  cancel-in-progress: ${{ github.event_name != 'pull_request_review_comment' }}

jobs:
  review:
    runs-on: ubuntu-latest
    steps:
      - uses: codingfox/ai-pr-reviewer@latest
        env:
          GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
          OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
```

### 3. Create a Pull Request

CodingFox will automatically review your PR within 30-60 seconds!

## Provider Configuration

### OpenAI (Default)

```yaml
- uses: codingfox/ai-pr-reviewer@latest
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    OPENAI_API_KEY: ${{ secrets.OPENAI_API_KEY }}
  with:
    ai_provider: openai
    ai_light_model: gpt-5-mini    # Fast, cheap - for summaries
    ai_heavy_model: gpt-5.2       # Powerful - for code review
```

### Anthropic Claude

```yaml
- uses: codingfox/ai-pr-reviewer@latest
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    ANTHROPIC_API_KEY: ${{ secrets.ANTHROPIC_API_KEY }}
  with:
    ai_provider: anthropic
    ai_light_model: claude-haiku-4-5     # Fast, cheap
    ai_heavy_model: claude-sonnet-4-5    # Powerful
```

### OpenAI-Compatible (OpenRouter, Together, Groq, etc.)

```yaml
- uses: codingfox/ai-pr-reviewer@latest
  env:
    GITHUB_TOKEN: ${{ secrets.GITHUB_TOKEN }}
    AI_API_KEY: ${{ secrets.OPENROUTER_API_KEY }}
  with:
    ai_provider: openai-compatible
    ai_base_url: https://openrouter.ai/api/v1
    ai_light_model: meta-llama/llama-3-8b-instruct
    ai_heavy_model: anthropic/claude-3.5-sonnet
```

## Model Recommendations

### OpenAI

| Use Case | Model | Cost |
|----------|-------|------|
| Budget-friendly testing | `gpt-5-nano` | $0.05/MTok in |
| Balanced (default) | `gpt-5-mini` / `gpt-5.2` | $0.25 / $1.75 |
| Maximum quality | `gpt-5.2-pro` | $1.75/MTok in |

### Anthropic

| Use Case | Model | Cost |
|----------|-------|------|
| Fast & cheap | `claude-haiku-4-5` | $1/MTok in |
| Balanced (recommended) | `claude-sonnet-4-5` | $3/MTok in |
| Maximum quality | `claude-opus-4-5` | $15/MTok in |

### Production: Use Pinned Versions

Model aliases (e.g., `claude-sonnet-4-5`) auto-update when new versions release. For consistent behavior in production, pin to specific versions:

```yaml
# Development (auto-updates)
ai_heavy_model: claude-sonnet-4-5

# Production (stable)
ai_heavy_model: claude-sonnet-4-5-20250929
```

OpenAI equivalents: `gpt-5.2` vs `gpt-5.2-2025-12-11`

## Configuration Reference

### AI Provider Options

| Option | Description | Default |
|--------|-------------|---------|
| `ai_provider` | Provider: `openai`, `anthropic`, or `openai-compatible` | `openai` |
| `ai_light_model` | Model for summaries and simple tasks | `gpt-5-mini` |
| `ai_heavy_model` | Model for code review | `gpt-5.2` |
| `ai_base_url` | Custom API endpoint (for openai-compatible) | - |
| `ai_temperature` | Response randomness (0.0-1.0) | `0.05` |
| `ai_timeout_ms` | API timeout in milliseconds | `360000` |
| `ai_retries` | Number of retry attempts | `5` |
| `ai_concurrency_limit` | Max concurrent API calls | `6` |

### Review Behavior

| Option | Description | Default |
|--------|-------------|---------|
| `review_simple_changes` | Review minor changes (typos, formatting) | `false` |
| `review_comment_lgtm` | Comment when code looks good | `false` |
| `max_files` | Max files to review (0 = unlimited) | `0` |
| `path_filters` | Glob patterns for files to include/exclude | - |
| `debug` | Enable verbose logging | `false` |

### Custom Prompts

```yaml
with:
  system_message: |
    You are @codingfox, an expert code reviewer focused on:
    - Security best practices
    - Performance optimization  
    - Clean code principles
    Be constructive and specific in your feedback.
```

## Interactive Chat

Tag `@codingfox` in any PR comment:

```
@codingfox Can you suggest test cases for this function?
@codingfox How can I improve the performance here?
@codingfox Is there a security concern with this approach?
```

## Skip Review

Add to your PR description:
```
@codingfox: ignore
```

## Migration from v0.x

If you're upgrading from an older version using `openai_*` options, update to the new `ai_*` options:

| Old Option | New Option |
|------------|------------|
| `openai_light_model` | `ai_light_model` |
| `openai_heavy_model` | `ai_heavy_model` |
| `openai_model_temperature` | `ai_temperature` |
| `openai_timeout_ms` | `ai_timeout_ms` |
| `openai_retries` | `ai_retries` |
| `openai_concurrency_limit` | `ai_concurrency_limit` |
| `openai_base_url` | `ai_base_url` |

The old options still work but will show deprecation warnings.

## Troubleshooting

| Issue | Solution |
|-------|----------|
| CodingFox not commenting | Check Actions tab for errors, verify API key is set |
| "Rate limit exceeded" | Add credits to your account or reduce `ai_concurrency_limit` |
| Wrong provider used | Ensure `ai_provider` matches your API key |
| Timeout errors | Increase `ai_timeout_ms` |
| Reviews too verbose | Set `review_simple_changes: false` |

## Development

```bash
# Install dependencies
bun install

# Run all checks
bun run all  # typecheck, lint, format, test, build

# Individual commands
bun run typecheck
bun run lint
bun run test
bun run build
```

## License

MIT License - see [LICENSE](LICENSE) file for details.

---

**CodingFox** - *Elevating Code Quality, One Review at a Time*

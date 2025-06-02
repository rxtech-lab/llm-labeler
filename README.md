# LLM Issue Labeler

A GitHub Action that automatically labels and types GitHub issues using OpenAI's language models with structured outputs.

## Features

- 🤖 **AI-Powered Classification**: Uses OpenAI's language models to analyze issue content
- 🏷️ **Smart Labeling**: Applies multiple relevant labels based on issue title and description
- 📝 **Type Classification**: Categorizes issues as Bug, Feature, or Task
- 🔧 **Customizable**: Add custom labels with descriptions for your specific project needs
- 📊 **Structured Outputs**: Uses OpenAI's structured output feature for reliable JSON responses
- 🛡️ **Error Handling**: Graceful error handling with detailed logging
- 🎯 **Label Management**: Automatically creates missing labels in your repository

## Default Labels

The action includes these default labels:

- `bug` - Something isn't working
- `enhancement` - New feature or request
- `documentation` - Improvements or additions to documentation
- `help wanted` - Extra attention is needed
- `question` - Further information is requested

## Issue Types

Issues are classified into one of these types:

- `Bug` - Issues reporting problems, errors, or unexpected behavior
- `Feature` - Requests for new functionality or enhancements
- `Task` - General tasks, maintenance, or process-related issues

## Usage

### Basic Usage

```yaml
name: Auto-label Issues

on:
  issues:
    types: [opened, edited]

jobs:
  label-issue:
    runs-on: ubuntu-latest
    permissions:
      issues: write
      contents: read

    steps:
      - name: Label Issue with LLM
        uses: your-username/llm-labeler@v1
        with:
          github-token: ${{ secrets.GITHUB_TOKEN }}
          openai-api-key: ${{ secrets.OPENAI_API_KEY }}
```

### Advanced Usage with Custom Labels

```yaml
- name: Label Issue with LLM
  uses: your-username/llm-labeler@v1
  with:
    github-token: ${{ secrets.GITHUB_TOKEN }}
    openai-api-key: ${{ secrets.OPENAI_API_KEY }}
    openai-endpoint: "https://api.openai.com/v1"
    openai-model: "gpt-4o-mini"
    custom-labels: |
      [
        {
          "label": "security",
          "description": "Security-related issues or vulnerabilities"
        },
        {
          "label": "performance", 
          "description": "Performance optimization or issues"
        },
        {
          "label": "ui/ux",
          "description": "User interface or user experience related"
        },
        {
          "label": "api",
          "description": "API-related changes or issues"
        }
      ]
```

## Inputs

| Input             | Description                                   | Required | Default                     |
| ----------------- | --------------------------------------------- | -------- | --------------------------- |
| `github-token`    | GitHub token for API access                   | Yes      | -                           |
| `openai-api-key`  | OpenAI API key                                | Yes      | -                           |
| `openai-endpoint` | OpenAI API endpoint                           | No       | `https://api.openai.com/v1` |
| `openai-model`    | OpenAI model to use                           | No       | `gpt-4o-mini`               |
| `custom-labels`   | JSON array of custom labels with descriptions | No       | `[]`                        |

## Outputs

| Output           | Description                                         |
| ---------------- | --------------------------------------------------- |
| `labels-applied` | Comma-separated list of labels applied to the issue |
| `type-applied`   | Type classification applied to the issue            |

## Custom Labels Format

Custom labels should be provided as a JSON array with label and description fields:

```json
[
  {
    "label": "security",
    "description": "Security-related issues or vulnerabilities"
  },
  {
    "label": "performance",
    "description": "Performance optimization or issues"
  }
]
```

## Required Permissions

The GitHub token needs the following permissions:

- `issues: write` - To apply labels to issues
- `contents: read` - To read repository content

## Setup

1. **Add OpenAI API Key**: Add your OpenAI API key as a repository secret named `OPENAI_API_KEY`
2. **Create Workflow**: Add the workflow file to `.github/workflows/` in your repository
3. **Configure Permissions**: Ensure the workflow has the required permissions

## How It Works

1. **Trigger**: Action runs when issues are opened or edited
2. **Analysis**: Sends issue title and description to OpenAI for analysis
3. **Classification**: AI returns structured output with labels and type
4. **Validation**: Filters suggested labels to only include available ones
5. **Application**: Applies labels and type to the GitHub issue
6. **Label Creation**: Creates any missing labels in the repository

## Examples

### Example Issue Analysis

**Input Issue:**

- Title: "App crashes when clicking the login button"
- Description: "The mobile app crashes consistently when users try to log in..."

**AI Analysis Result:**

- Labels: `bug`, `help wanted`
- Type: `Bug`
- Reasoning: "This is clearly a bug report describing a crash issue that needs immediate attention"

### Example with Custom Labels

**Input Issue:**

- Title: "Add OAuth authentication support"
- Description: "We need to implement OAuth2 authentication for better security..."

**AI Analysis Result:**

- Labels: `enhancement`, `security`, `api`
- Type: `Feature`
- Reasoning: "This is a feature request for authentication enhancement with security implications"

## Development

To build and test the action locally:

```bash
# Install dependencies
pnpm install

# Build the action
pnpm run build

# Package for distribution
pnpm run package
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## License

MIT License - see LICENSE file for details

## Support

- Create an issue for bug reports or feature requests
- Check existing issues for common problems
- Review the action logs for debugging information

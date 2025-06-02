import * as core from "@actions/core";
import { ActionInputs, CustomLabel } from "./types";

/**
 * Retrieves and validates all GitHub Action inputs
 * @returns Parsed and validated action inputs
 */
export function getActionInputs(): ActionInputs {
  const githubToken = core.getInput("github-token", { required: true });
  const openaiApiKey = core.getInput("openai-api-key", { required: true });
  const openaiEndpoint =
    core.getInput("openai-endpoint") || "https://api.openai.com/v1";
  const openaiModel = core.getInput("openai-model") || "gpt-4o-mini";
  const customLabelsInput = core.getInput("custom-labels") || "[]";

  // Parse custom labels from JSON string
  const customLabels = parseCustomLabels(customLabelsInput);

  return {
    githubToken,
    openaiApiKey,
    openaiEndpoint,
    openaiModel,
    customLabels,
  };
}

/**
 * Parses custom labels from JSON string input
 * @param customLabelsJson JSON string containing custom label definitions
 * @returns Array of custom labels
 */
function parseCustomLabels(customLabelsJson: string): CustomLabel[] {
  try {
    const parsed = JSON.parse(customLabelsJson);

    if (!Array.isArray(parsed)) {
      core.warning("Custom labels input is not an array, using empty array");
      return [];
    }

    return parsed.filter((item: any) => {
      if (typeof item !== "object" || !item.label || !item.description) {
        core.warning(`Invalid custom label format: ${JSON.stringify(item)}`);
        return false;
      }
      return true;
    });
  } catch (error) {
    core.warning(`Failed to parse custom labels: ${error}`);
    return [];
  }
}

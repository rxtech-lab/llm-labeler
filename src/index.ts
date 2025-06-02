import * as core from "@actions/core";
import { getActionInputs } from "./inputs";
import {
  getIssueInfo,
  updateIssueLabelsAndType,
  ensureLabelsExist,
} from "./github";
import { analyzeIssue } from "./openai";
import { DEFAULT_LABELS, ISSUE_TYPES } from "./types";

/**
 * Main function that orchestrates the GitHub Action workflow
 */
async function run(): Promise<void> {
  try {
    core.info("🚀 Starting LLM Issue Labeler action...");

    // Get and validate inputs
    const inputs = getActionInputs();
    core.info("✅ Action inputs validated successfully");

    // Get issue information from GitHub context
    const issueInfo = getIssueInfo();
    core.info(`📋 Processing issue #${issueInfo.number}: "${issueInfo.title}"`);

    // Ensure all required labels exist in the repository
    const allRequiredLabels = [
      ...DEFAULT_LABELS,
      ...inputs.customLabels,
      // Add type labels
      ...ISSUE_TYPES.map((type) => ({
        label: type,
        description: `Issue type: ${type}`,
      })),
    ];

    await ensureLabelsExist(inputs.githubToken, allRequiredLabels);
    core.info("✅ Required labels ensured in repository");

    // Analyze the issue using OpenAI
    const analysis = await analyzeIssue(inputs, issueInfo);
    core.info("🤖 Issue analysis completed");

    // Filter labels to only include ones that exist in our available labels
    const availableLabelNames = allRequiredLabels.map((l) =>
      l.label.toLowerCase()
    );
    const validLabels = analysis.labels.filter((label) =>
      availableLabelNames.includes(label.toLowerCase())
    );

    if (validLabels.length < analysis.labels.length) {
      const invalidLabels = analysis.labels.filter(
        (label) => !availableLabelNames.includes(label.toLowerCase())
      );
      core.warning(
        `Some suggested labels are not available: ${invalidLabels.join(", ")}`
      );
    }

    // Apply labels and type to the issue
    await updateIssueLabelsAndType(
      inputs.githubToken,
      issueInfo.number,
      validLabels,
      analysis.type
    );

    // Set action outputs
    core.setOutput("labels-applied", validLabels.join(","));
    core.setOutput("type-applied", analysis.type);

    core.info("🎉 Issue labeling completed successfully!");
    core.info(`Applied labels: ${validLabels.join(", ")}`);
    core.info(`Applied type: ${analysis.type}`);
    core.info(`Reasoning: ${analysis.reasoning}`);
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    core.setFailed(`Action failed: ${errorMessage}`);
  }
}

/**
 * Entry point - handle any uncaught errors gracefully
 */
async function main(): Promise<void> {
  try {
    await run();
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : String(error);
    core.setFailed(`Unexpected error: ${errorMessage}`);
  }
}

// Run the action
main();

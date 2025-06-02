import * as github from "@actions/github";
import * as core from "@actions/core";
import { IssueInfo } from "./types";
import { Octokit } from "@octokit/rest";

/**
 * Extracts issue information from GitHub context
 * @returns Issue information including title, body, number, and URL
 */
export function getIssueInfo(): IssueInfo {
  const context = github.context;

  if (!context.payload.issue) {
    throw new Error("This action can only be run on issue events");
  }

  const issue = context.payload.issue;

  return {
    title: issue.title || "",
    body: issue.body || "",
    number: issue.number,
    url: issue.html_url || "",
  };
}

/**
 * Applies labels and type to a GitHub issue
 * @param githubToken GitHub token for API access
 * @param issueNumber Issue number to update
 * @param labels Array of labels to apply
 * @param type Issue type to set (will be converted to a label)
 */
export async function updateIssueLabelsAndType(
  githubToken: string,
  issueNumber: number,
  labels: string[],
  type: string
): Promise<void> {
  const octokit = new Octokit({ auth: githubToken });
  const context = github.context;

  try {
    const allLabels = [...new Set(labels)];
    await octokit.rest.issues.update({
      owner: context.repo.owner,
      repo: context.repo.repo,
      issue_number: issueNumber,
      labels: allLabels.filter((label) => label !== undefined),
      type: type,
    });

    core.info(`Successfully applied labels: ${allLabels.join(", ")}`);
  } catch (error) {
    core.error(`Failed to update issue labels: ${error}`);
    throw error;
  }
}

/**
 * Ensures all required labels exist in the repository
 * @param githubToken GitHub token for API access
 * @param requiredLabels Array of labels that should exist
 */
export async function ensureLabelsExist(
  githubToken: string,
  requiredLabels: Array<{ label: string; description: string }>
): Promise<void> {
  const octokit = github.getOctokit(githubToken);
  const context = github.context;

  try {
    // Get existing labels
    const { data: existingLabels } =
      await octokit.rest.issues.listLabelsForRepo({
        owner: context.repo.owner,
        repo: context.repo.repo,
      });

    const existingLabelNames = existingLabels.map((label) =>
      label.name.toLowerCase()
    );

    // Create missing labels
    for (const { label, description } of requiredLabels) {
      if (!existingLabelNames.includes(label.toLowerCase())) {
        try {
          await octokit.rest.issues.createLabel({
            owner: context.repo.owner,
            repo: context.repo.repo,
            name: label,
            description,
            color: getRandomColor(),
          });
          core.info(`Created label: ${label}`);
        } catch (error) {
          core.warning(`Failed to create label '${label}': ${error}`);
        }
      }
    }
  } catch (error) {
    core.warning(`Failed to ensure labels exist: ${error}`);
  }
}

/**
 * Generates a random color for new labels
 * @returns Random hex color without the # prefix
 */
function getRandomColor(): string {
  const colors = [
    "0075ca", // blue
    "7057ff", // purple
    "a2eeef", // light blue
    "e99695", // red
    "f9d0c4", // orange
    "fef2c0", // yellow
    "c5f015", // green
    "d73a4a", // dark red
    "0052cc", // dark blue
    "6f42c1", // dark purple
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

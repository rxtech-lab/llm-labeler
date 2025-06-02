import { z } from "zod";

/**
 * Custom label definition for extending default labels
 */
export interface CustomLabel {
  label: string;
  description: string;
}

/**
 * GitHub Action inputs interface
 */
export interface ActionInputs {
  githubToken: string;
  openaiApiKey: string;
  openaiEndpoint: string;
  openaiModel: string;
  customLabels: CustomLabel[];
}

/**
 * Issue information extracted from GitHub context
 */
export interface IssueInfo {
  title: string;
  body: string;
  number: number;
  url: string;
}

/**
 * Default labels available for issues
 */
export const DEFAULT_LABELS = [
  { label: "bug", description: "Something isn't working" },
  { label: "enhancement", description: "New feature or request" },
  {
    label: "documentation",
    description: "Improvements or additions to documentation",
  },
  { label: "help wanted", description: "Extra attention is needed" },
  { label: "question", description: "Further information is requested" },
] as const;

/**
 * Available issue types
 */
export const ISSUE_TYPES = ["Bug", "Feature", "Task"] as const;

/**
 * Zod schema for OpenAI structured output
 */
export const LLMResponseSchema = z.object({
  labels: z
    .array(z.string())
    .describe("Array of relevant labels for this issue"),
  type: z
    .enum(["Bug", "Feature", "Task"])
    .describe("Single type classification for this issue"),
  reasoning: z.string().describe("Brief explanation of the labeling decision"),
});

export type LLMResponse = z.infer<typeof LLMResponseSchema>;

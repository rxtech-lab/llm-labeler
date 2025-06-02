import * as core from "@actions/core";
import OpenAI from "openai";
import {
  ActionInputs,
  DEFAULT_LABELS,
  IssueInfo,
  LLMResponse,
  LLMResponseSchema,
} from "./types";

/**
 * Analyzes an issue using OpenAI and returns suggested labels and type
 * @param inputs Action inputs containing OpenAI configuration
 * @param issueInfo Information about the issue to analyze
 * @returns Suggested labels and type for the issue
 */
export async function analyzeIssue(
  inputs: ActionInputs,
  issueInfo: IssueInfo
): Promise<LLMResponse> {
  const openai = new OpenAI({
    apiKey: inputs.openaiApiKey,
    baseURL: inputs.openaiEndpoint,
  });

  // Combine default labels with custom labels
  const allLabels = [...DEFAULT_LABELS, ...inputs.customLabels];

  const systemPrompt = createSystemPrompt(allLabels);
  const userPrompt = createUserPrompt(issueInfo);

  try {
    core.info("Sending request to OpenAI for issue analysis...");

    const completion = await openai.beta.chat.completions.parse({
      model: inputs.openaiModel,
      messages: [
        { role: "system", content: systemPrompt },
        { role: "user", content: userPrompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "issue_classification",
          schema: zodToJsonSchema(LLMResponseSchema),
        },
      },
      temperature: 0.1,
    });

    const response = completion.choices[0]?.message?.parsed;

    if (!response) {
      throw new Error("No response received from OpenAI");
    }

    // Validate the response using Zod
    const validatedResponse = LLMResponseSchema.parse(response);

    core.info(
      `OpenAI analysis complete. Labels: ${validatedResponse.labels.join(
        ", "
      )}, Type: ${validatedResponse.type}`
    );
    core.info(`Reasoning: ${validatedResponse.reasoning}`);

    return validatedResponse;
  } catch (error) {
    core.error(`Failed to analyze issue with OpenAI: ${error}`);
    throw error;
  }
}

/**
 * Creates the system prompt for OpenAI with available labels and types
 * @param availableLabels All available labels (default + custom)
 * @returns System prompt string
 */
function createSystemPrompt(
  availableLabels: Array<{ label: string; description: string }>
): string {
  const labelDescriptions = availableLabels
    .map(({ label, description }) => `- ${label}: ${description}`)
    .join("\n");

  return `You are an expert GitHub issue classifier. Your task is to analyze issue titles and descriptions to assign appropriate labels and determine the issue type.

Available Labels:
${labelDescriptions}

Available Types:
- Bug: Issues reporting problems, errors, or unexpected behavior
- Feature: Requests for new functionality or enhancements
- Task: General tasks, maintenance, or process-related issues

Guidelines:
1. Assign multiple relevant labels based on the issue content
2. Assign exactly one type that best categorizes the issue
3. Consider both the title and description when making decisions
4. Be conservative but accurate in your classifications
5. Provide clear reasoning for your decisions

Return your classification with reasoning for the decisions made.`;
}

/**
 * Creates the user prompt with issue information
 * @param issueInfo Issue information to analyze
 * @returns User prompt string
 */
function createUserPrompt(issueInfo: IssueInfo): string {
  return `Please analyze this GitHub issue and classify it:

Title: ${issueInfo.title}

Description:
${issueInfo.body || "No description provided"}

Please provide labels and type classification with reasoning.`;
}

/**
 * Converts a Zod schema to JSON Schema format for OpenAI structured outputs
 * @param schema Zod schema to convert
 * @returns JSON schema object
 */
function zodToJsonSchema(schema: any): any {
  // Simple conversion for our specific schema
  // In a real-world scenario, you might want to use a library like zod-to-json-schema
  return {
    type: "object",
    properties: {
      labels: {
        type: "array",
        items: { type: "string" },
        description: "Array of relevant labels for this issue",
      },
      type: {
        type: "string",
        enum: ["Bug", "Feature", "Task"],
        description: "Single type classification for this issue",
      },
      reasoning: {
        type: "string",
        description: "Brief explanation of the labeling decision",
      },
    },
    required: ["labels", "type", "reasoning"],
    additionalProperties: false,
  };
}

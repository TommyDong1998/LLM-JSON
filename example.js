import LLMJSON from "./src/index.js";
import {
  BedrockRuntimeClient,
  ConversationRole,
  ConverseCommand,
} from "@aws-sdk/client-bedrock-runtime";

// This is using bedrock but you can replace this with your own llm api
async function sendToLLM(
  prompt,
  modelId = "amazon.nova-lite-v1:0",
  maxTokens = 500,
  temperature = 0.5
) {
  const bedrockClient = new BedrockRuntimeClient({ region: "us-east-1" });
  const message = {
    content: [{ text: prompt }],
    role: ConversationRole.USER,
  };

  const request = {
    modelId,
    messages: [message],
    inferenceConfig: {
      maxTokens,
      temperature,
    },
  };

  try {
    const response = await bedrockClient.send(new ConverseCommand(request));
    const text = response.output?.message?.content?.[0]?.text;
    return text || "[No response returned]";
  } catch (error) {
    console.error(`ERROR: Failed to invoke '${modelId}': ${error.message}`);
    throw error;
  }
}

const format = {
  type: "object",
  properties: {
    name: { type: "string" },
    age: { type: "integer" },
    hobbies: {
      type: "array",
      items: { type: "string" },
    },
  },
  required: ["name", "age", "hobbies"],
}; // You ask your LLM to output in this format ;D

const llm = new LLMJSON("What are your age and hobbies", format);

let output = "";
let parsed;
for (let i = 0; i < 5; i++) {
  const promptText = llm.getPrompt();
  console.log(promptText);
  output = await sendToLLM(promptText);
  parsed = llm.parseFuzzyJSON(output);
  if (llm.validate(parsed)) {
    console.log("Valid JSON output on attempt", i + 1);
    console.log(parsed);
    break;
  }
  llm.updatePrompt(parsed);
}

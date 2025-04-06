import LLMJSON from "./src/index.js";

const prompt = "Generate a JSON object with a name and age.";
const jsonSchema = {
  type: "object",
  properties: {
    name: { type: "string" },
    age: { type: "integer" },
  },
  required: ["name", "age"],
};

const llm = new LLMJSON(prompt, jsonSchema);

let output = "";

// Simulate wrong type
let promptText = llm.getPrompt();
output = `{"name": "Alice", "age": "thirty"}`;
console.log("Prompt:\n", promptText);
console.log("Output:\n", output);

// Validate and update the prompt
llm.updatePrompt(output);
let updatedPrompt = llm.getPrompt();
console.log("Updated Prompt:\n", updatedPrompt);

// Simulate string prefixed with Markdown fences
promptText = llm.getPrompt();
output = `\`\`\`json{"name": "Alice", "age": 30}`;
console.log("Prompt:\n", promptText);
console.log("Output:\n", output);

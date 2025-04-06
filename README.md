# LLM-JSON

llm-json is a lightweight Node.js tool that helps you get structured data from Large Language Models by:

🧠 Prompting the model to output valid JSON matching your schema

🛡️ Validating the output using JSON Schema (via ajv)

🔁 Automatically retrying with helpful feedback if the response is malformed

💬 Fixing minor JSON issues (```json)

## Installation

git+https://github.com/TommyDong1998/LLM-JSON/

## Usage (bedrock but can be any LLM)

```
const format = {
  type: "object",
  properties: {
    name: { type: "string" },
    age: { type: "integer" },
    hobbies: {
      type: "array",
      items: { type: "string" }
    }
  },
  required: ["name", "age", "hobbies"]
}; // You ask your LLM to output in this format ;D

const llm = new LLMJSON(prompt, format);

let output = "";

for (let i = 0; i < 5; i++) {
  const promptText = llm.getPrompt();
  output = await sendToBedrock(promptText);

  const parsed = llm.parseFuzzyJSON(output);
  if (llm.validate(parsed)) {
    break;
  }

  llm.updatePrompt(output);
}
```

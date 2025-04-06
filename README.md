# LLM-JSON

llm-json is a lightweight Node.js tool that helps you get structured data from Large Language Models by:

🧠 Prompting the model to output valid JSON matching your schema

🛡️ Validating the output using JSON Schema (via ajv)

🔁 Automatically retrying with helpful feedback if the response is malformed

💬 Fixing minor JSON issues (```json)

## Installation

```
npm install llm-json
```

or

```
git+https://github.com/TommyDong1998/LLM-JSON/
```

## Usage

```
import LLMJSON from "llm-json";

async function sendToLLM(
  prompt
) {
  //Make calls to your llm
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

const llm = new LLMJSON(
  "Pretend you are an user. What are your age and hobbies",
  format
);

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

```

### Example: Flow process

1. What are your age and hobbies - > To llm (example, nova-lite)
2. llm responds:

````{
  name: 'AI System',
  age: null,
  hobbies: [
    'Assisting users',
    'Learning new information',
    'Providing helpful responses'
  ]
}```
3. llm-json parses the response and finds that age is null. Updates prompt to fix that.
4.  llm responds:
```json
{
  "name": "AI System",
  "age": null,
  "hobbies": [
    "Assisting users",
    "Learning new information",
    "Providing helpful responses"
  ]
}
````

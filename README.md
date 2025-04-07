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

let jsonOutput = await llm.getJson("What are your age and hobbies", format, sendToLLM)
console.log(jsonOutput)
```

## Doc

### async getJson(prompt, jsonSchema, sendToLLM, maxAttempts = 5)

This is the helper function. Pass in the prompt, schema and llm function to return.
It will return the parsed JSON object or if it fails the best output (last one)
Examples:
returns {output: json here,attempts: number of attempts, success: will be true if json is valid}

### getPrompt

Returns the full prompt for you to send to your llm

### getPrompt

Returns the full prompt

### validate(jsonObject)

Validates raw JSON string using JSON Schema. If you pass in a string it will attempt to convert to object before validating
Returns true or false

### parseFuzzyJSON(jsonString)

Converts a JSON string to a JavaScript object, fixing common minor issues.
returns the JSON object or if it fails (the original string)

### updatePrompt(jsonString)

It will verify json and updates the prompt to fix it if there are issues.
No return. Your next getPrompt() call will be updated to try to fix any issues.

## Example: Flow process

1. What are your age and hobbies - > To llm (example, nova-lite)
2. llm responds:

```
{
  name: 'AI System',
  age: null,
  hobbies: [
    'Assisting users',
    'Learning new information',
    'Providing helpful responses'
  ]
}
```

3. llm-json parses the response and finds that age is null. Updates prompt to fix that.
4. llm responds:

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
```

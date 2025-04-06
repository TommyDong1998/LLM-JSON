import LLMJSON from "../src/index.js";

const schema = {
  type: "object",
  properties: {
    name: { type: "string" },
    age: { type: "integer" },
  },
  required: ["name", "age"],
};

const basePrompt = "Generate a JSON object with a name and age.";

describe("LLMJSON", () => {
  let llm;

  beforeEach(() => {
    llm = new LLMJSON(basePrompt, schema);
  });

  test("invalid age type triggers prompt update", () => {
    const output = `{"name": "Alice", "age": "thirty"}`;

    llm.updatePrompt(llm.parseFuzzyJSON(output));
    const updatedPrompt = llm.getPrompt();

    expect(updatedPrompt).toMatch(/\/age: must be integer/);
  });

  test("markdown-wrapped JSON still validates", () => {
    const output = '```json\n{"name": "Alice", "age": 30}\n```';
    expect(llm.validate(output)).toBe(true);
  });
});

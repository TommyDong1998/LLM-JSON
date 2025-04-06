import Ajv from "ajv";

class LLMJSON {
  /**
   * @param {string} prompt - The base LLM prompt
   * @param {object} jsonSchema - A valid JSON Schema to validate against
   */
  constructor(prompt, jsonSchema) {
    this.basePrompt = prompt.trim();
    this.history = [];
    this.jsonSchema = jsonSchema;

    const ajv = new Ajv();
    this.validateFn = ajv.compile(jsonSchema);
  }

  /**
   * Returns the full prompt, including feedback history
   * @returns {string}
   */
  getPrompt() {
    return [
      this.basePrompt,
      "Schema:\n" + JSON.stringify(this.jsonSchema, null, 2),
      this.errorMessage ? "Error:\n" + this.errorMessage : null,
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  /**
   * Validates raw JSON string using JSON Schema
   * @param {string||jsonObject} rawOutput
   * @returns {boolean}
   */
  validate(rawOutput) {
    try {
      let parsed = rawOutput;
      if (typeof str !== "string") parsed = this.parseFuzzyJSON(rawOutput);
      return this.validateFn(parsed);
    } catch (err) {
      console.log(err);
      return false;
    }
  }

  /**
   * Converts a JSON string to a JavaScript object, stripping Markdown fences
   * returning the cleaned if parsing fails.
   * returning the original string if cleaning fails.
   * @param {string} jsonString
   * @returns string or json
   * */
  parseFuzzyJSON(jsonString) {
    if (typeof jsonString !== "string") return jsonString;
    let cleaned = jsonString;
    try {
      // Strip Markdown fences (```json ... ```) or plain ```
      cleaned = jsonString
        .trim()
        .replace(/^```(?:json)?/i, "")
        .replace(/```$/, "")
        .trim();
      return JSON.parse(cleaned);
    } catch (err) {
      return cleaned;
    }
  }

  /**
   * Updates the prompt with the last output and validation errors
   * @param {string} lastOutput
   * @returns {void}
   */
  updatePrompt(lastOutput) {
    if (this.validateFn(lastOutput)) {
      this.errorMessage = "";
      return;
    }
    this.errorMessage = this.validateFn.errors
      ?.map((e) => `• ${e.instancePath || "/"}: ${e.message}`)
      .join("\n");
  }
}

export default LLMJSON;

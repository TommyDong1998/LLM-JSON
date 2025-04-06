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
      this.errorMessage
        ? "Your last response had this error :\n" + this.errorMessage
        : null,
    ]
      .filter(Boolean)
      .join("\n\n");
  }

  /**
   * Validates raw JSON string using JSON Schema
   * @param {jsonObject} rawOutput
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
   * Converts a JSON string to a JavaScript object, fixing minor issues.
   * @param {string} jsonString
   * @returns string or json
   * */
  parseFuzzyJSON(jsonString) {
    if (typeof jsonString !== "string") return jsonString;
    let cleaned = jsonString;
    try {
      // Skip to first { or [
      const firstBracket = jsonString.search(/[{[]/);
      if (firstBracket > -1) {
        cleaned = jsonString.slice(firstBracket);
      }
      // Strip Markdown fences (```json ... ```) or plain ```
      cleaned = cleaned
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
   * @param {string||jsonObject} lastOutput
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

    if (this.errorMessage.indexOf("/: must be object") != -1) {
      try {
        JSON.parse(lastOutput);
      } catch (err) {
        this.errorMessage = `Invalid JSON output: ${err.message}`;
      }
    }
  }
}

export default LLMJSON;

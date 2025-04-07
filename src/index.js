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
   * Generates a JSON object using the LLM and validates it against the schema.
   *  * @param {string} prompt - The base LLM prompt
   * @param {object} jsonSchema - A valid JSON Schema to validate against
   * @param {function} sendToLLM - A function to send the prompt to the LLM
   * @param {number} maxAttempts - The maximum number of attempts to get valid JSON
   * @returns {Promise<object>} - The generated JSON object
   *  */

  static async getJson(prompt, jsonSchema, sendToLLM, maxAttempts = 5) {
    const llm = new LLMJSON(prompt, jsonSchema);
    let parsed = "";
    let output = "";
    let attempts = 0;
    for (let i = 0; i < maxAttempts; i++) {
      const promptText = llm.getPrompt();
      output = await sendToLLM(promptText);
      attempts++;
      parsed = llm.parseFuzzyJSON(output);
      if (llm.validate(parsed)) {
        break;
      }
      llm.updatePrompt(parsed);
    }
    return {
      output: parsed,
      attempts: attempts,
      success: attempts <= maxAttempts,
    };
  }

  /**
   * Returns the full prompt, including feedback history
   * @returns {string}
   */
  getPrompt() {
    let attempts = "";
    let i = 0;
    for (const { output, errors } of this.history) {
      attempts += `Attempt ${i++} \n\nOutput: ${output}\nErrors: ${errors}\n`;
    }
    return [
      this.basePrompt,
      "Only reply in JSON format.",
      "Schema:\n" + JSON.stringify(this.jsonSchema, null, 2),
      attempts + " . Please fix the errors above and try again.",
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
      return;
    }
    let errorMessage = this.validateFn.errors
      ?.map((e) => `• ${e.instancePath || "/"}: ${e.message}`)
      .join("\n");
    this.history.push({
      output: lastOutput,
      errors: errorMessage,
    });
  }
}

export default LLMJSON;

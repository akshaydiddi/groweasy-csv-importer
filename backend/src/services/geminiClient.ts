import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

let client: GoogleGenerativeAI | null = null;

function getClient(): GoogleGenerativeAI {
  if (!client) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error(
        "GEMINI_API_KEY is not set. Add it to backend/.env (see .env.example)."
      );
    }
    client = new GoogleGenerativeAI(apiKey);
  }
  return client;
}

// JSON schema Gemini is constrained to emit — this is what makes the
// extraction reliable across arbitrary/messy source formats instead of
// hoping the model "remembers" to format things correctly.
const responseSchema = {
  type: SchemaType.OBJECT,
  properties: {
    results: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          index: { type: SchemaType.NUMBER },
          skip: { type: SchemaType.BOOLEAN },
          skip_reason: { type: SchemaType.STRING },
          created_at: { type: SchemaType.STRING },
          name: { type: SchemaType.STRING },
          email: { type: SchemaType.STRING },
          country_code: { type: SchemaType.STRING },
          mobile_without_country_code: { type: SchemaType.STRING },
          company: { type: SchemaType.STRING },
          city: { type: SchemaType.STRING },
          state: { type: SchemaType.STRING },
          country: { type: SchemaType.STRING },
          lead_owner: { type: SchemaType.STRING },
          crm_status: { type: SchemaType.STRING },
          crm_note: { type: SchemaType.STRING },
          data_source: { type: SchemaType.STRING },
          possession_time: { type: SchemaType.STRING },
          description: { type: SchemaType.STRING },
        },
        required: ["index", "skip"],
      },
    },
  },
  required: ["results"],
};

export function getExtractionModel() {
  return getClient().getGenerativeModel({
    model: process.env.GEMINI_MODEL || "gemini-flash-latest",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema,
      temperature: 0.1,
    },
  });
}

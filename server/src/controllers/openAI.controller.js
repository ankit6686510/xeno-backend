import { asyncHandler } from "../utils/asyncHandler.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import OpenAI from "openai";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// For generating campaign content
const generateCampaignContent = asyncHandler(async (req, res) => {
  const { segmentRules } = req.body;

  if (!segmentRules || !segmentRules.rules) {
    throw new ApiError(400, "Segment rules are required");
  }

  try {
    const prompt = `Generate an email subject and body for customers matching: ${JSON.stringify(
      segmentRules.rules
    )}.\nInclude variables like {name} and {total_spent}.\nFormat as:\nSubject: [subject here]\nBody: [body here]`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a marketing expert who creates engaging email campaigns."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.7,
      max_tokens: 500
    });

    const generatedText = response.choices[0].message.content;
    res
      .status(200)
      .json(
        new ApiResponse(200, generatedText, "Content generated successfully")
      );
  } catch (error) {
    console.error("OpenAI Error:", error);
    throw new ApiError(500, "AI content generation failed: " + error.message);
  }
});

// For customer insights
const generateCustomerInsights = asyncHandler(async (req, res) => {
  const { customerData } = req.body;

  if (!customerData || !Array.isArray(customerData)) {
    throw new ApiError(400, "Customer data array is required");
  }

  try {
    const prompt = `Analyze this customer data and provide marketing insights: ${JSON.stringify(
      customerData.slice(0, 50) // Limit data
    )}.\nHighlight:\n1. Top spending segments\n2. Purchase frequency trends\n3. Recommended campaign types`;

    const response = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: "You are a data analyst specializing in customer behavior and marketing insights."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      temperature: 0.5,
      max_tokens: 1000
    });

    res
      .status(200)
      .json(
        new ApiResponse(
          200,
          response.choices[0].message.content,
          "Insights generated successfully"
        )
      );
  } catch (error) {
    console.error("OpenAI Error:", error);
    throw new ApiError(500, "AI insights generation failed: " + error.message);
  }
});

export { generateCampaignContent, generateCustomerInsights }; 
import { OpenAI } from "openai";
import { Segment } from "../models/segment.model.js";
import { Customer } from "../models/customer.model.js";
import { Campaign } from "../models/campaign.model.js";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export const generateSegment = async (req, res) => {
  try {
    const { prompt } = req.body;

    if (!prompt) {
      return res.status(400).json({
        success: false,
        message: "Prompt is required",
      });
    }

    // Generate segment rules using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that helps create customer segments based on natural language descriptions.
          Convert the user's description into specific segment rules.
          Consider factors like:
          - Purchase history
          - Customer activity
          - Spending patterns
          - Demographics
          - Engagement metrics
          
          Format your response as a JSON object with:
          - title: A descriptive name for the segment
          - description: A detailed explanation of the segment
          - rules: An array of specific rules
          - tags: Relevant tags for categorization`,
        },
        {
          role: "user",
          content: prompt,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const aiResponse = JSON.parse(completion.choices[0].message.content);

    // Get estimated count for the segment
    const estimatedCount = await Customer.countDocuments({
      is_active: true,
      // Add more specific conditions based on the rules
    });

    // Add estimated count to the response
    aiResponse.estimated_count = estimatedCount;

    return res.status(200).json({
      success: true,
      message: "Segment generated successfully",
      data: aiResponse,
    });
  } catch (error) {
    console.error("Error generating segment:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate segment",
      error: error.message,
    });
  }
};

export const generateMessageSuggestions = async (req, res) => {
  try {
    const { segmentId, objective } = req.body;

    if (!segmentId || !objective) {
      return res.status(400).json({
        success: false,
        message: "Segment ID and objective are required",
      });
    }

    // Get segment details
    const segment = await Segment.findById(segmentId);
    if (!segment) {
      return res.status(404).json({
        success: false,
        message: "Segment not found",
      });
    }

    // Generate message suggestions using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that helps create engaging marketing messages.
          Generate 3 different message variants based on the campaign objective and segment characteristics.
          Consider:
          - Message tone and style
          - Personalization opportunities
          - Call to action
          - Value proposition
          
          Format your response as a JSON object with:
          - variants: Array of message variants, each containing:
            - title: Message title
            - content: Message content
            - tone: Message tone
            - suggested_image: Type of image to use`,
        },
        {
          role: "user",
          content: `Generate messages for segment "${segment.name}" with objective: ${objective}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const aiResponse = JSON.parse(completion.choices[0].message.content);

    return res.status(200).json({
      success: true,
      message: "Message suggestions generated successfully",
      data: aiResponse,
    });
  } catch (error) {
    console.error("Error generating message suggestions:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate message suggestions",
      error: error.message,
    });
  }
};

export const generateCampaignInsights = async (req, res) => {
  try {
    const { campaignId } = req.params;

    // Get campaign details and performance data
    const campaign = await Campaign.findById(campaignId).populate("segment");
    if (!campaign) {
      return res.status(404).json({
        success: false,
        message: "Campaign not found",
      });
    }

    // Generate insights using OpenAI
    const completion = await openai.chat.completions.create({
      model: "gpt-3.5-turbo",
      messages: [
        {
          role: "system",
          content: `You are an AI assistant that analyzes campaign performance data and generates human-readable insights.
          Create a summary of the campaign performance, including:
          - Overall reach and engagement
          - Key metrics and their significance
          - Notable patterns or trends
          - Recommendations for improvement
          
          Format your response as a JSON object with:
          - summary: Overall performance summary
          - metrics: Key metrics and their values
          - insights: Array of specific insights
          - recommendations: Array of improvement suggestions`,
        },
        {
          role: "user",
          content: `Generate insights for campaign "${campaign.name}" with the following data:
          - Total recipients: ${campaign.total_recipients}
          - Delivered: ${campaign.delivered}
          - Failed: ${campaign.failed}
          - Opened: ${campaign.opened}
          - Clicked: ${campaign.clicked}
          - Segment: ${campaign.segment.name}`,
        },
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const aiResponse = JSON.parse(completion.choices[0].message.content);

    return res.status(200).json({
      success: true,
      message: "Campaign insights generated successfully",
      data: aiResponse,
    });
  } catch (error) {
    console.error("Error generating campaign insights:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to generate campaign insights",
      error: error.message,
    });
  }
};

export const generateCampaignContent = async (req, res) => {
  try {
    const { segmentRules } = req.body;

    if (!segmentRules) {
      return res.status(400).json({
        success: false,
        message: "Segment rules are required",
      });
    }

    // Log the request data
    console.log("Generating campaign content for rules:", JSON.stringify(segmentRules, null, 2));

    // Check if OpenAI API key is configured
    if (!process.env.OPENAI_API_KEY) {
      console.error("OpenAI API key is not configured");
      return res.status(500).json({
        success: false,
        message: "AI service is not properly configured",
      });
    }

    try {
      // Generate campaign content using OpenAI
      const completion = await openai.chat.completions.create({
        model: "gpt-3.5-turbo",
        messages: [
          {
            role: "system",
            content: `You are an AI assistant that helps create engaging marketing campaign content.
            Generate a compelling email campaign with:
            - An attention-grabbing subject line
            - A well-structured message body
            - Clear call-to-action
            - Personalization variables in {curly_brackets}
            
            Format your response exactly as:
            Subject: [Your subject line]
            
            [Your message body]
            
            Make sure to:
            1. Start with "Subject:" on a new line
            2. Add a blank line after the subject
            3. Include at least one personalization variable like {name} or {total_spent}
            4. Keep the subject line under 60 characters
            5. Make the message body engaging and action-oriented`
          },
          {
            role: "user",
            content: `Generate campaign content for a segment with the following rules: ${JSON.stringify(segmentRules)}`,
          },
        ],
        temperature: 0.7,
        max_tokens: 1000,
      });

      // Log the AI response
      console.log("AI Response:", completion.choices[0].message.content);

      const content = completion.choices[0].message.content;

      // Validate the response format
      if (!content.includes("Subject:")) {
        throw new Error("Invalid response format from AI");
      }

      return res.status(200).json({
        success: true,
        message: "Campaign content generated successfully",
        data: content,
      });
    } catch (openaiError) {
      console.error("OpenAI API Error:", openaiError);
      
      // Handle specific OpenAI errors
      if (openaiError.message.includes("429") || openaiError.message.includes("quota")) {
        // Provide a fallback response when API quota is exceeded
        const fallbackContent = `Subject: Special Offer for Our Valued Customers

Dear {name},

We noticed you've been a loyal customer with us, having spent {total_spent} on our platform. As a token of our appreciation, we're offering you an exclusive discount on your next purchase!

🎉 Special Offer:
- 20% off on your next order
- Valid for the next 7 days
- No minimum purchase required

Don't miss out on this amazing opportunity! Click here to shop now and apply your discount.

Best regards,
Your Marketing Team`;

        return res.status(200).json({
          success: true,
          message: "Using fallback content (OpenAI API quota exceeded)",
          data: fallbackContent,
        });
      } else if (openaiError.message.includes("401")) {
        return res.status(401).json({
          success: false,
          message: "AI service authentication failed. Please check your API key.",
          error: "AUTH_FAILED"
        });
      } else if (openaiError.message.includes("rate limit")) {
        return res.status(429).json({
          success: false,
          message: "AI service is currently busy. Please try again in a few minutes.",
          error: "RATE_LIMIT"
        });
      }

      return res.status(500).json({
        success: false,
        message: "Error communicating with AI service",
        error: openaiError.message,
      });
    }
  } catch (error) {
    console.error("Error generating campaign content:", error);
    
    // More specific error messages based on the error type
    let errorMessage = "Failed to generate campaign content";
    if (error.message.includes("API key")) {
      errorMessage = "AI service configuration error";
    } else if (error.message.includes("rate limit")) {
      errorMessage = "AI service is currently busy, please try again later";
    } else if (error.message.includes("Invalid response format")) {
      errorMessage = "AI service returned an invalid response";
    }

    return res.status(500).json({
      success: false,
      message: errorMessage,
      error: error.message,
    });
  }
}; 
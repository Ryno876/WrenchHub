import { Router } from "express";
import { requireAuth } from "../middleware/auth";

const router = Router();

router.use(requireAuth);

router.post("/assist-job", async (req, res) => {
  const { description, category, vehicleInfo } = req.body;

  if (!description) {
    res.status(400).json({ error: "Description is required" });
    return;
  }

  const apiKey = process.env.ANTHROPIC_API_KEY;

  if (!apiKey) {
    // Fallback: simple rule-based suggestions when no API key
    const suggestion = generateFallbackSuggestion(description, category, vehicleInfo);
    res.json(suggestion);
    return;
  }

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": apiKey,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 500,
        messages: [
          {
            role: "user",
            content: `You are a helpful auto repair assistant for WrenchHub, a marketplace connecting car owners with mechanics.

A car owner is posting a repair job. Help them create a clear, useful job posting that mechanics will understand.

Vehicle: ${vehicleInfo || "Not specified"}
Category: ${category || "Not specified"}
Their description: "${description}"

Respond with JSON only, no other text:
{
  "title": "A clear, concise job title (under 60 chars)",
  "description": "An improved description that includes: what the symptoms are, when they occur, how long it's been happening, and any other details a mechanic would want to know. Keep the car owner's voice but make it clearer. 2-3 sentences max.",
  "suggestedCategory": "maintenance, repair, diagnostics, body_work, or other",
  "keyDetails": ["detail 1 mechanics should know", "detail 2", "detail 3"]
}`,
          },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error("AI API request failed");
    }

    const data = await response.json();
    const text = data.content[0]?.text || "";

    // Parse JSON from response
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      const parsed = JSON.parse(jsonMatch[0]);
      res.json(parsed);
    } else {
      throw new Error("Could not parse AI response");
    }
  } catch {
    // Fallback to rule-based if AI fails
    const suggestion = generateFallbackSuggestion(description, category, vehicleInfo);
    res.json(suggestion);
  }
});

function generateFallbackSuggestion(
  description: string,
  category: string,
  vehicleInfo: string
) {
  const desc = description.toLowerCase();

  // Detect common issues
  let title = "";
  let suggestedCategory = category || "other";
  const keyDetails: string[] = [];

  if (desc.includes("brake") || desc.includes("squeal") || desc.includes("grinding")) {
    title = `Brake Inspection & Repair — ${vehicleInfo || "Vehicle"}`;
    suggestedCategory = "repair";
    keyDetails.push("Brake noise often indicates worn pads or rotors");
    keyDetails.push("Mechanic should inspect both front and rear brakes");
    keyDetails.push("Note if the issue is worse at low or high speeds");
  } else if (desc.includes("oil") || desc.includes("oil change")) {
    title = `Oil Change — ${vehicleInfo || "Vehicle"}`;
    suggestedCategory = "maintenance";
    keyDetails.push("Specify synthetic or conventional oil preference");
    keyDetails.push("Include current mileage for service records");
  } else if (desc.includes("check engine") || desc.includes("engine light") || desc.includes("cel")) {
    title = `Check Engine Light Diagnostics — ${vehicleInfo || "Vehicle"}`;
    suggestedCategory = "diagnostics";
    keyDetails.push("OBD-II scan will identify the specific error code");
    keyDetails.push("Note any changes in performance or fuel economy");
    keyDetails.push("Mention if the light is steady or flashing");
  } else if (desc.includes("a/c") || desc.includes("air conditioning") || desc.includes("ac not")) {
    title = `A/C System Repair — ${vehicleInfo || "Vehicle"}`;
    suggestedCategory = "repair";
    keyDetails.push("Note if A/C blows warm air or doesn't work at all");
    keyDetails.push("Mechanic should check refrigerant levels and compressor");
  } else if (desc.includes("tire") || desc.includes("flat")) {
    title = `Tire Service — ${vehicleInfo || "Vehicle"}`;
    suggestedCategory = "maintenance";
    keyDetails.push("Specify tire size if known");
    keyDetails.push("Note if rotation, replacement, or repair is needed");
  } else if (desc.includes("battery") || desc.includes("won't start") || desc.includes("dead")) {
    title = `Battery / Starting Issue — ${vehicleInfo || "Vehicle"}`;
    suggestedCategory = "diagnostics";
    keyDetails.push("Note if the engine cranks or is completely dead");
    keyDetails.push("Check if dashboard lights come on when turning the key");
  } else if (desc.includes("transmission") || desc.includes("shifting")) {
    title = `Transmission Service — ${vehicleInfo || "Vehicle"}`;
    suggestedCategory = "repair";
    keyDetails.push("Describe when the shifting issue occurs");
    keyDetails.push("Note if the transmission is automatic or manual");
  } else {
    title = `${category ? category.charAt(0).toUpperCase() + category.slice(1).replace("_", " ") : "Auto"} Service — ${vehicleInfo || "Vehicle"}`;
    keyDetails.push("Provide as much detail as possible about the issue");
    keyDetails.push("Include when the problem started and how often it occurs");
  }

  const improvedDescription = description.charAt(0).toUpperCase() + description.slice(1) +
    (description.endsWith(".") ? "" : ".") +
    " Mechanic should inspect and provide a detailed assessment.";

  return {
    title,
    description: improvedDescription,
    suggestedCategory,
    keyDetails,
  };
}

export default router;

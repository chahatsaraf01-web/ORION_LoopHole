
import { GoogleGenAI, Type } from "@google/genai";
import { Report } from "./types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY || '' });

/**
 * Enhanced Matching Engine (Shirpur Campus Restricted)
 * Bidirectional similarity scoring using text, category, location, and time weighting.
 */
export async function scoreSimilarity(reportA: Report, reportB: Report): Promise<number> {
  try {
    const parts: any[] = [
      { text: `Act as a precise Lost & Found matching engine for NMIMS Shirpur Campus. 
      Analyze the following two reports and return a similarity score from 0 to 100.
      
      MATCHING RULES:
      1. NORMALIZE: Ignore case, minor typos, and common stopwords.
      2. CATEGORY MATCH: If categories are different (e.g., Electronics vs Clothing), score should be low unless descriptions overlap significantly.
      3. LOCATION WEIGHT: Boost score if locations (e.g., 'Shirpur Library', 'Block A') are identical or logically close within the Shirpur campus layout.
      4. TIME WEIGHT: High similarity requires reported times to be within 48 hours.
      5. IMAGE CONTEXT: If images are available, use them to confirm object type.

      REPORT 1 (${reportA.type}):
      Category: ${reportA.category}
      Item: ${reportA.itemName}
      Description: ${reportA.description}
      Location: ${reportA.location}
      Time: ${reportA.dateTime}
      
      REPORT 2 (${reportB.type}):
      Category: ${reportB.category}
      Item: ${reportB.itemName}
      Description: ${reportB.description}
      Location: ${reportB.location}
      Time: ${reportB.dateTime}` }
    ];

    if (reportA.imageUrl) {
      parts.push({ inlineData: { mimeType: "image/jpeg", data: reportA.imageUrl.split(',')[1] } });
    }
    if (reportB.imageUrl) {
      parts.push({ inlineData: { mimeType: "image/jpeg", data: reportB.imageUrl.split(',')[1] } });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            score: { type: Type.NUMBER, description: "Final weighted similarity score 0-100" }
          },
          required: ["score"]
        }
      }
    });
    
    const result = JSON.parse(response.text || '{"score": 0}');
    return result.score;
  } catch (error) {
    console.error("Similarity score error:", error);
    return 0;
  }
}

/**
 * Generates an EASY, concrete verification question.
 */
export async function generateVerificationQuestion(found: Report): Promise<{ question: string; answer: string }> {
  try {
    const parts: any[] = [
      { text: `Generate ONE EASY verification question for the owner of this found item.
      
      QUESTION DESIGN RULES:
      1. Focus on ONE concrete, obvious attribute: Color (of a part), Brand/Logo, a specific Sticker/Mark, or a single Word/Phrase written on it.
      2. The question must be SHORT, DIRECT, and plain language (e.g., "What color is the strap?", "What brand is on the front?").
      3. Avoid abstract, vague, or memory-heavy questions.
      4. Avoid compound or multi-part questions.
      
      ITEM: ${found.itemName}
      DESCRIPTION: ${found.description}` }
    ];

    if (found.imageUrl) {
      parts.push({
        inlineData: {
          mimeType: "image/jpeg",
          data: found.imageUrl.split(',')[1]
        }
      });
    }

    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: { parts },
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            question: { type: Type.STRING, description: "Short, direct question about a concrete attribute." },
            answer: { type: Type.STRING, description: "The correct short answer (1-3 words)" }
          },
          required: ["question", "answer"]
        }
      }
    });
    
    return JSON.parse(response.text || '{"question": "What is the main color of the item?", "answer": "Unknown"}');
  } catch (error) {
    console.error("Verification generation error:", error);
    return { question: "What is the main color of the item?", answer: "Detail" };
  }
}

/**
 * Validates text answers using fuzzy semantic matching (lenient for owner).
 */
export async function validateAnswer(userAnswer: string, correctAnswer: string): Promise<boolean> {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `Does the User Answer semantically match the Expected Answer?
      
      VALIDATION RULES:
      1. Be lenient: Accept case-insensitive matches, minor spelling variations, and synonyms.
      2. Accept partial matches if the key detail (e.g., "Red" vs "It is dark red") is present.
      
      Expected: ${correctAnswer}
      User Answer: ${userAnswer}
      
      Respond with true or false.`,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            isMatch: { type: Type.BOOLEAN }
          },
          required: ["isMatch"]
        }
      }
    });
    
    const result = JSON.parse(response.text || '{"isMatch": false}');
    return result.isMatch;
  } catch (error) {
    return false;
  }
}

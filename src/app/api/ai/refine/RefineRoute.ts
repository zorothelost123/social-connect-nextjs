import { GoogleGenerativeAI } from "@google/generative-ai";
import { NextResponse } from "next/server";

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_GENERATIVE_AI_API_KEY || "");

export async function POST(req: Request) {
  try {
    const { content } = await req.json();

    if (!content) {
      return NextResponse.json({ error: "Content is required" }, { status: 400 });
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `You are a professional social media content assistant. 
    Rewrite the following post to be more engaging, professional, and clear, while maintaining the original meaning. 
    Keep it concise and suitable for a professional network like LinkedIn. 
    Do not add any hashtags. 
    Original post: "${content}"`;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const refinedText = response.text();

    return NextResponse.json({ refinedContent: refinedText });
  } catch (error) {
    console.error("AI Refine Error:", error);
    return NextResponse.json({ error: "Failed to refine content" }, { status: 500 });
  }
}

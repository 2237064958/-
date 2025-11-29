import { GoogleGenAI } from "@google/genai";
import { Transaction, AccountSnapshot } from '../types';

export const analyzeFinances = async (
  accounts: AccountSnapshot[], 
  transactions: Transaction[]
): Promise<string> => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    return "Please configure your API Key to use the Financial Advisor.";
  }

  try {
    const ai = new GoogleGenAI({ apiKey });
    
    // Prepare data context
    const dataContext = JSON.stringify({
      totalBalance: accounts.reduce((sum, acc) => sum + acc.balance, 0),
      accounts: accounts.map(a => `${a.name} (${a.type}): $${a.balance}`),
      recentTransactions: transactions.slice(-10).map(t => ({
        type: t.type,
        amount: t.amount,
        desc: t.description,
        date: t.timestamp.toISOString().split('T')[0]
      }))
    });

    const prompt = `
      Act as a professional financial advisor. Analyze the following bank account data:
      ${dataContext}

      Provide a concise summary (max 3 bullet points) of the financial health and 1 actionable recommendation.
      Address the user directly. If there are high fees or efficient savings, point them out.
      Use simplified Chinese.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Unable to generate advice at this time.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Error connecting to AI Advisor. Please try again later.";
  }
};

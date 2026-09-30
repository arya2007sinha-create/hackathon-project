import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../config/env';
import { logger } from '../utils/logger';

export class AiProviderService {
  private genAI: GoogleGenerativeAI | null = null;
  private isAvailable: boolean = false;

  constructor() {
    if (config.geminiApiKey && config.geminiApiKey.trim() !== '') {
      try {
        this.genAI = new GoogleGenerativeAI(config.geminiApiKey);
        this.isAvailable = true;
        logger.info('Gemini AI Provider initialized successfully.');
      } catch (err: any) {
        logger.warn('Failed to initialize GoogleGenerativeAI client:', err.message);
        this.isAvailable = false;
      }
    } else {
      logger.info('No GEMINI_API_KEY provided; operating in deterministic rule-based mode.');
      this.isAvailable = false;
    }
  }

  public isAiActive(): boolean {
    return this.isAvailable && !!this.genAI;
  }

  public async generateStructuredJson<T>(systemPrompt: string, userContent: string): Promise<T | null> {
    if (!this.isAiActive() || !this.genAI) {
      return null;
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
          temperature: 0.2,
        },
      });

      const prompt = `${systemPrompt}\n\nUser Context:\n${userContent}`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      if (!text) {
        throw new Error('Empty response received from Gemini');
      }

      return JSON.parse(text) as T;
    } catch (error: any) {
      logger.warn('Gemini generateStructuredJson failed, falling back to deterministic logic:', error.message);
      return null;
    }
  }

  public async generateChatResponse(systemPrompt: string, contextData: string, userQuery: string): Promise<string | null> {
    if (!this.isAiActive() || !this.genAI) {
      return null;
    }

    try {
      const model = this.genAI.getGenerativeModel({
        model: 'gemini-1.5-flash',
        systemInstruction: systemPrompt,
        generationConfig: {
          temperature: 0.3,
          maxOutputTokens: 600,
        },
      });

      const prompt = `CURRENT LIVE SYSTEM DATA:\n${contextData}\n\nMANAGER QUERY: ${userQuery}\n\nProvide an objective, data-backed analytical response.`;
      const result = await model.generateContent(prompt);
      const response = await result.response;
      return response.text() || null;
    } catch (error: any) {
      logger.warn('Gemini generateChatResponse error:', error.message);
      return null;
    }
  }
}

export const aiProvider = new AiProviderService();

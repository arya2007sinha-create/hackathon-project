"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.aiProvider = exports.AiProviderService = void 0;
const generative_ai_1 = require("@google/generative-ai");
const env_1 = require("../config/env");
const logger_1 = require("../utils/logger");
class AiProviderService {
    genAI = null;
    isAvailable = false;
    constructor() {
        if (env_1.config.geminiApiKey && env_1.config.geminiApiKey.trim() !== '') {
            try {
                this.genAI = new generative_ai_1.GoogleGenerativeAI(env_1.config.geminiApiKey);
                this.isAvailable = true;
                logger_1.logger.info('Gemini AI Provider initialized successfully.');
            }
            catch (err) {
                logger_1.logger.warn('Failed to initialize GoogleGenerativeAI client:', err.message);
                this.isAvailable = false;
            }
        }
        else {
            logger_1.logger.info('No GEMINI_API_KEY provided; operating in deterministic rule-based mode.');
            this.isAvailable = false;
        }
    }
    isAiActive() {
        return this.isAvailable && !!this.genAI;
    }
    async generateStructuredJson(systemPrompt, userContent) {
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
            return JSON.parse(text);
        }
        catch (error) {
            logger_1.logger.warn('Gemini generateStructuredJson failed, falling back to deterministic logic:', error.message);
            return null;
        }
    }
    async generateChatResponse(systemPrompt, contextData, userQuery) {
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
        }
        catch (error) {
            logger_1.logger.warn('Gemini generateChatResponse error:', error.message);
            return null;
        }
    }
}
exports.AiProviderService = AiProviderService;
exports.aiProvider = new AiProviderService();

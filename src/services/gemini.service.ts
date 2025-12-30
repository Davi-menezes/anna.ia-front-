
import { Injectable, signal } from '@angular/core';
import { GoogleGenAI, GenerateContentResponse } from '@google/genai';

@Injectable({
  providedIn: 'root'
})
export class GeminiService {
  private genAI: GoogleGenAI;
  loading = signal(false);
  error = signal<string | null>(null);

  constructor() {
    // This is a placeholder for the API key. In a real app, this would be more secure.
    // The environment assumes process.env.API_KEY is available.
    const apiKey = (process.env as any).API_KEY;
    if (!apiKey) {
      console.error("API_KEY environment variable not set.");
      this.error.set("API Key not configured. Using mock data.");
      // This is a mock/dummy client, as there's no real process.env in browser.
      this.genAI = { models: { generateContent: async () => ({ text: "Desculpe, a IA está offline. Esta é uma resposta simulada." }) } } as any;
    } else {
      this.genAI = new GoogleGenAI({ apiKey });
    }
  }

  async generateResponse(prompt: string): Promise<string> {
    this.loading.set(true);
    this.error.set(null);
    try {
      if ((process.env as any).API_KEY) {
        const response: GenerateContentResponse = await this.genAI.models.generateContent({
            model: 'gemini-2.5-flash',
            contents: `Você é Anna, uma assistente de estudos amigável e prestativa para estudantes brasileiros. Responda de forma clara e concisa. Pergunta do usuário: ${prompt}`,
        });
        return response.text;
      } else {
        // Mock response
        await new Promise(resolve => setTimeout(resolve, 1500));
        return `Esta é uma resposta simulada para a sua pergunta: "${prompt}". A integração com a IA real requer uma chave de API válida.`;
      }
    } catch (e) {
      console.error(e);
      this.error.set('Houve um erro ao se comunicar com a IA. Tente novamente.');
      return 'Desculpe, não consegui processar sua pergunta no momento.';
    } finally {
      this.loading.set(false);
    }
  }
}

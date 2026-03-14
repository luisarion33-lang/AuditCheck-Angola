import { GoogleGenAI, Type } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });

export const getAccountingAdvice = async (query: string, context?: any) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        Você é o Assistente Educativo da AuditChek Angola. 
        Sua missão é explicar conceitos contabilísticos angolanos (PGC), ajudar estudantes e profissionais, e analisar erros de auditoria.
        
        Contexto atual do sistema: ${JSON.stringify(context || {})}
        Pergunta do usuário: ${query}
      `,
      config: {
        temperature: 0.7,
      }
    });
    return response.text;
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Desculpe, estou tendo dificuldades para processar sua solicitação agora.";
  }
};

export const runAudit = async (journalEntries: any[]) => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-3-flash-preview",
      contents: `
        Analise os seguintes lançamentos contabilísticos e identifique erros de auditoria baseados no PGC Angola.
        Erros comuns: 
        - Débito sem crédito (desequilíbrio)
        - Lançamentos duplicados
        - Classificação incorreta de contas
        - Valores negativos indevidos
        - Erros no cálculo ou aplicação de IVA (Imposto sobre Valor Acrescentado)
        
        Lançamentos: ${JSON.stringify(journalEntries)}
        
        Retorne um JSON com uma lista de erros, cada um contendo: tipo, explicação e sugestão de correção.
      `,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            errors: {
              type: Type.ARRAY,
              items: {
                type: Type.OBJECT,
                properties: {
                  type: { type: Type.STRING },
                  explanation: { type: Type.STRING },
                  suggestion: { type: Type.STRING }
                },
                required: ["type", "explanation", "suggestion"]
              }
            }
          },
          required: ["errors"]
        }
      }
    });
    return JSON.parse(response.text || '{"errors": []}');
  } catch (error) {
    console.error("Audit Error:", error);
    return { errors: [] };
  }
};

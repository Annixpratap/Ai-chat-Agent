import { Message } from '../types/index.js';

const SYSTEM_PROMPT = `You are a helpful and friendly customer support agent for TechGear, a small e-commerce store that sells tech accessories and gadgets.

You have access to the following information about our store:

**Shipping Policy:**
- We ship worldwide via standard and express options
- Standard shipping (5-7 business days): Free on orders over $50
- Express shipping (1-2 business days): $15 flat rate
- All orders are shipped with tracking numbers

**Return & Refund Policy:**
- 30-day money-back guarantee on all items
- Items must be unused and in original packaging
- Refunds are processed within 5-7 business days
- We cover return shipping for defective items

**Support Hours:**
- Monday to Friday: 9 AM - 6 PM EST
- Saturday: 10 AM - 4 PM EST
- Sunday: Closed
- We respond to emails within 24 hours

**Popular Products:**
- Wireless earbuds ($79-$199)
- Phone chargers and cables ($15-$50)
- Laptop stands ($30-$80)
- Screen protectors ($10-$20)
- USB hubs and adapters ($25-$60)

**Support Contact:**
- Email: support@techgear.example
- Live chat: Available during support hours

Guidelines:
- Answer questions directly and concisely
- Be warm and professional
- If asked something outside your knowledge, politely say you don't have that information
- For billing/account issues, direct them to support@techgear.example
- Keep responses under 150 words when possible
- Be helpful and proactive in suggesting related products when relevant`;

export interface LLMProvider {
  generateReply(messages: Message[], userMessage: string): Promise<string>;
}

let provider: LLMProvider | null = null;

async function createGeminiProvider(): Promise<LLMProvider> {
  const { GoogleGenerativeAI } = await import('@google/generative-ai');
  
  let apiKey = process.env.GEMINI_API_KEY;
  
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY environment variable is not set. Please add it to your .env file.');
  }

  console.log('✅ Gemini API Key found, initializing with gemini-2.5-flash-lite...');
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

  return {
    async generateReply(messages: Message[], userMessage: string): Promise<string> {
      try {
        // Format conversation history for Gemini
        const conversationHistory: any[] = messages.map(msg => ({
          role: msg.sender === 'user' ? 'user' : 'model',
          parts: [{ text: msg.text }]
        }));

        // Gemini requires first message to be 'user', skip any leading 'model' messages
        let validHistory = conversationHistory;
        while (validHistory.length > 0 && validHistory[0].role === 'model') {
          validHistory = validHistory.slice(1);
        }

        // Start chat session with history
        const chat = model.startChat({
          history: validHistory as any,
          generationConfig: {
            maxOutputTokens: 500,
            temperature: 0.7
          }
        });

        const result = await chat.sendMessage(userMessage);
        const response = result.response.text();

        if (!response) {
          throw new Error('No response from Gemini');
        }

        return response.trim();
      } catch (error: any) {
        console.error('Gemini error:', error?.message);
        throw error;
      }
    }
  };
}

async function createOpenAIProvider(): Promise<LLMProvider> {
  const { OpenAI } = await import('openai');
  const apiKey = process.env.OPENAI_API_KEY;
  
  if (!apiKey) {
    throw new Error('OPENAI_API_KEY environment variable is not set');
  }

  const openai = new OpenAI({ apiKey });

  return {
    async generateReply(messages: Message[], userMessage: string): Promise<string> {
      const conversationHistory: any[] = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));

      conversationHistory.push({
        role: 'user',
        content: userMessage
      });

      const response = await openai.chat.completions.create({
        model: 'gpt-3.5-turbo',
        messages: conversationHistory as any,
        max_tokens: 500,
        temperature: 0.7,
        top_p: 0.9
      });

      const reply = response.choices[0]?.message?.content;
      if (!reply) {
        throw new Error('No response from OpenAI');
      }

      return reply.trim();
    }
  };
}

async function createAnthropicProvider(): Promise<LLMProvider> {
  const { Anthropic } = await import('@anthropic-ai/sdk');
  const apiKey = process.env.ANTHROPIC_API_KEY;
  
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY environment variable is not set');
  }

  const anthropic = new Anthropic({ apiKey });

  return {
    async generateReply(messages: Message[], userMessage: string): Promise<string> {
      const conversationHistory: any[] = messages.map(msg => ({
        role: msg.sender === 'user' ? 'user' : 'assistant',
        content: msg.text
      }));

      conversationHistory.push({
        role: 'user',
        content: userMessage
      });

      const response = await anthropic.messages.create({
        model: 'claude-3-5-sonnet-20241022',
        max_tokens: 500,
        system: SYSTEM_PROMPT,
        messages: conversationHistory as any
      });

      const reply = response.content[0]?.type === 'text' ? response.content[0].text : null;
      if (!reply) {
        throw new Error('No response from Anthropic');
      }

      return reply.trim();
    }
  };
}

export async function getLLMProvider(): Promise<LLMProvider> {
  if (provider) {
    return provider;
  }

  const llmProvider = process.env.LLM_PROVIDER || 'gemini';

  try {
    if (llmProvider === 'gemini') {
      provider = await createGeminiProvider();
    } else if (llmProvider === 'openai') {
      provider = await createOpenAIProvider();
    } else if (llmProvider === 'anthropic') {
      provider = await createAnthropicProvider();
    } else {
      throw new Error(`Unknown LLM provider: ${llmProvider}`);
    }
  } catch (error) {
    if (error instanceof Error && error.message.includes('Cannot find module')) {
      throw new Error(
        `LLM provider "${llmProvider}" dependencies not installed. Run 'npm install'`
      );
    }
    throw error;
  }

  return provider;
}

export async function generateReply(
  messages: Message[],
  userMessage: string
): Promise<string> {
  const llmProvider = await getLLMProvider();
  return llmProvider.generateReply(messages, userMessage);
}

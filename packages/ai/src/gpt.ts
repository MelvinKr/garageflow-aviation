import OpenAI from 'openai';

const apiKey = process.env.OPENAI_API_KEY;

/**
 * Complète une note d'ordre de travail côté serveur.
 * Assurez-vous d'appeler cette fonction uniquement dans un contexte serveur.
 */
export async function completeWorkOrderNote(prompt: string): Promise<string> {
  if (!apiKey) throw new Error('OPENAI_API_KEY manquant.');
  const client = new OpenAI({ apiKey });

  const res = await client.chat.completions.create({
    model: 'gpt-4o-mini',
    temperature: 0.2,
    messages: [
      {
        role: 'system',
        content:
          'Tu es un assistant MRO (aviation) qui produit des notes claires, concises et traçables.',
      },
      { role: 'user', content: prompt },
    ],
  });

  return res.choices?.[0]?.message?.content ?? '';
}


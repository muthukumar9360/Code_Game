import OpenAI from 'openai';
import Problem from '../models/Problem.js';

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

export const getHint = async (problemSlug, userTier, hintLevel) => {
  try {
    const problem = await Problem.findOne({ slug: problemSlug });
    if (!problem) {
      throw new Error('Problem not found');
    }

    const hintKey = `h${hintLevel}`;
    if (problem.hints[hintKey]) {
      return problem.hints[hintKey];
    }

    // If no predefined hint, generate one using AI
    const prompt = `As an AI coding mentor, provide a helpful hint for the following coding problem without revealing the solution. The user is at ${userTier} tier.

Problem Title: ${problem.title}
Difficulty: ${problem.difficulty}
Description: ${problem.description}

Provide a hint that guides the user towards the solution without giving it away.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 150,
      temperature: 0.7
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error getting AI hint:', error);
    return 'Sorry, I\'m unable to provide a hint right now. Try reviewing the problem description and examples.';
  }
};

export const getExplanation = async (problemSlug, userCode, language) => {
  try {
    const problem = await Problem.findOne({ slug: problemSlug });
    if (!problem) {
      throw new Error('Problem not found');
    }

    const prompt = `As an AI coding mentor, provide a brief explanation of why this code might be correct or incorrect for the problem. Don't give away the full solution.

Problem: ${problem.title}
User's Code (${language}):
${userCode}

Provide a constructive explanation.`;

    const response = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
      temperature: 0.7
    });

    return response.choices[0].message.content.trim();
  } catch (error) {
    console.error('Error getting AI explanation:', error);
    return 'Unable to provide explanation at this time.';
  }
};

import express, { Request, Response } from 'express';
import axios from 'axios';

const router = express.Router();

// Google Gemini API key - add to .env
const GEMINI_API_KEY = process.env.GEMINI_API_KEY || '';
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent';

// FAQ Data for fallback
const FAQ_DATA = [
  {
    id: 1,
    keywords: {
      exact: ['what programs', 'what courses', 'what do you offer'],
      priority: ['program', 'programs', 'course', 'courses'],
    },
    response: 'SIIT offers Bachelor of Science in Information Technology, Computer Science, and Engineering. For more details, visit the Handbook.',
  },
  {
    id: 2,
    keywords: {
      exact: ['scholarship', 'financial aid'],
      priority: ['scholarship', 'scholarships', 'grant', 'funding'],
    },
    response: 'SIIT has scholarship programs for qualified students. Contact finaid@siit.edu for eligibility and application details.',
  },
  {
    id: 3,
    keywords: {
      exact: ['how to apply', 'admission requirements'],
      priority: ['admission', 'admissions', 'apply', 'application'],
    },
    response: 'Submit academic transcripts, entrance exam results, and completed application form to admissions@siit.edu.',
  },
  {
    id: 4,
    keywords: {
      exact: ['student conduct', 'code of conduct'],
      priority: ['conduct', 'discipline', 'rules', 'policy'],
    },
    response: 'Student conduct expectations are in the Student Handbook. Contact studentaffairs@siit.edu for questions.',
  },
  {
    id: 5,
    keywords: {
      exact: ['library resources', 'library services'],
      priority: ['library', 'books', 'resources', 'research'],
    },
    response: 'The SIIT Library offers books, journals, and digital resources. Contact library@siit.edu for assistance.',
  },
  {
    id: 6,
    keywords: {
      exact: ['counseling services', 'mental health'],
      priority: ['counseling', 'counselor', 'support', 'help'],
    },
    response: 'SIIT provides counseling services. Contact counseling@siit.edu for academic, personal, or mental health support.',
  },
];

// Check for FAQ match
function findFAQMatch(userMessage: string): string | null {
  const lowerMessage = userMessage.toLowerCase();

  for (const faq of FAQ_DATA) {
    // Check exact matches first
    for (const exact of faq.keywords.exact) {
      if (lowerMessage.includes(exact)) {
        return faq.response;
      }
    }

    // Check priority keywords
    let matchCount = 0;
    for (const keyword of faq.keywords.priority) {
      if (lowerMessage.includes(keyword)) {
        matchCount++;
      }
    }

    if (matchCount >= 2) {
      return faq.response;
    }
  }

  return null;
}

// POST endpoint for chat messages
router.post('/message', async (req: Request, res: Response) => {
  try {
    const { message, userName } = req.body;

    if (!message) {
      return res.status(400).json({ error: 'Message is required' });
    }

    // First, try to find FAQ match
    const faqResponse = findFAQMatch(message);

    if (faqResponse) {
      return res.json({
        response: faqResponse,
        type: 'faq',
      });
    }

    // If no FAQ match and Gemini API key exists, use AI
    if (GEMINI_API_KEY) {
      try {
        const userGreeting = userName ? `The user's name is ${userName}.` : '';
        const contextPrompt = `You are a helpful SIIT (Sarabao Island Institute of Technology) student assistant. 
${userGreeting}
Answer questions about SIIT, student life, or general academic topics in a friendly and helpful manner. 
Keep answers concise and practical.`;

        const response = await axios.post(
          `${GEMINI_API_URL}?key=${GEMINI_API_KEY}`,
          {
            contents: [
              {
                parts: [
                  {
                    text: contextPrompt,
                  },
                  {
                    text: `User: ${message}`,
                  },
                ],
              },
            ],
          },
          {
            timeout: 10000,
          }
        );

        const aiResponse =
          response.data.candidates?.[0]?.content?.parts?.[0]?.text ||
          'I can help with SIIT-related questions. Please ask me about programs, admissions, scholarships, or student life!';

        return res.json({
          response: aiResponse,
          type: 'ai',
        });
      } catch (error) {
        console.error('Gemini API error:', error);
        // Fall back to friendly message if AI fails
        return res.json({
          response:
            'I can help with SIIT-related questions. Please ask me about programs, admissions, scholarships, or student life!',
          type: 'fallback',
        });
      }
    }

    // If no FAQ and no Gemini API, return generic response
    return res.json({
      response:
        'I can help with SIIT-related questions. Please ask me about programs, admissions, scholarships, or student life!',
      type: 'fallback',
    });
  } catch (error) {
    console.error('Chat error:', error);
    res.status(500).json({ error: 'Failed to process message' });
  }
});

export default router;

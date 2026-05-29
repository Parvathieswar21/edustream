import express from 'express';
import { authenticate } from '../middleware/auth.ts';

const router = express.Router();

// Allow any authenticated user to request AI predictions
router.use(authenticate);

router.get('/predict/:studentId', (req, res) => {
  const { studentId } = req.params;

  // Mock Gemini Analysis if no key is provided.
  // In a real application, you would pass student's grades and attendance into the Google GenAI SDK.
  
  const mockInsights = {
    studentId,
    atRisk: true,
    weaknesses: ['Mathematics', 'Physics'],
    suggestions: [
      'Schedule a 1-on-1 tutoring session for Mathematics.',
      'Recommend extra practice worksheets for Physics modules 3 and 4.',
      'Monitor attendance closely for the next two weeks.'
    ],
    confidenceScore: 0.88,
    analysis: 'Recent data indicates a 15% drop in quantitative subjects combined with erratic attendance patterns.'
  };

  setTimeout(() => {
    res.json(mockInsights);
  }, 1200); // Simulate network latency limit
});

export default router;

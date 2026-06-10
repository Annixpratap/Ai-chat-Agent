import { Router, Request, Response } from 'express';
import { handleChatMessage, getConversationHistory } from '../services/chat.js';
import { ChatRequest } from '../types/index.js';
import { asyncHandler, ApiError } from '../middleware/errorHandler.js';

const router = Router();

/**
 * POST /api/chat/message
 * Send a message and get AI response
 */
router.post(
  '/message',
  asyncHandler(async (req: Request, res: Response) => {
    const { message, conversationId } = req.body as ChatRequest;

    if (!message) {
      throw new ApiError(400, 'Message is required');
    }

    const result = await handleChatMessage({ message, conversationId });
    res.json(result);
  })
);

/**
 * GET /api/chat/:conversationId
 * Get conversation history
 */
router.get(
  '/:conversationId',
  asyncHandler(async (req: Request, res: Response) => {
    const { conversationId } = req.params;

    if (!conversationId) {
      throw new ApiError(400, 'Conversation ID is required');
    }

    const result = await getConversationHistory(conversationId);
    res.json(result);
  })
);

export default router;

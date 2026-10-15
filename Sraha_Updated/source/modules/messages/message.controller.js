import { Router } from "express";
import { successResponse } from "../../common/utils/index.js";
import {
  getConversationMessages,
  getReceivedMessages,
  getRequests,
  requestIdentity,
  respondToRequest,
  sendConversationMessage,
  sendMessage,
} from "./message.service.js";
import { authentication, validation } from "../../middleware/index.js";
import { sendMessageSchema, respondRequestSchema } from "../../common/validation/index.js";

const router = Router();

//1: POST /messages/send/:receiverId
router.post("/send/:receiverId", authentication(), validation(sendMessageSchema), async (req, res) => {
  const data = await sendMessage(req.user, req.params.receiverId, req.body.content);
  return successResponse(res, 201, data);
});

//_________________________________________________________________________________//

//2: GET /messages/received
router.get("/received", authentication(), async (req, res) => {
  const data = await getReceivedMessages(req.user, req.query.page);
  return successResponse(res, 200, data);
});

//_________________________________________________________________________________//

//3: POST /messages/:messageId/request-identity
router.post("/:messageId/request-identity", authentication(), async (req, res) => {
  const data = await requestIdentity(req.user, req.params.messageId);
  return successResponse(res, 201, data);
});

//_________________________________________________________________________________//

//4: GET /messages/requests
router.get("/requests", authentication(), async (req, res) => {
  const data = await getRequests(req.user, req.query.page, req.query.status);
  return successResponse(res, 200, data);
});

//_________________________________________________________________________________//

//5: PATCH /messages/requests/:requestId
router.patch("/requests/:requestId", authentication(), validation(respondRequestSchema), async (req, res) => {
  const data = await respondToRequest(req.user, req.params.requestId, req.body.status);
  return successResponse(res, 200, data);
});

//_________________________________________________________________________________//

//6: POST /messages/conversations/:conversationId/messages
router.post("/conversations/:conversationId/messages", authentication(), validation(sendMessageSchema), async (req, res) => {
  const data = await sendConversationMessage(req.user, req.params.conversationId, req.body.content);
  return successResponse(res, 201, data);
});

//_________________________________________________________________________________//

//7: GET /messages/conversations/:conversationId/messages
router.get("/conversations/:conversationId/messages", authentication(), async (req, res) => {
  const data = await getConversationMessages(req.user, req.params.conversationId, req.query.page);
  return successResponse(res, 200, data);
});

export default router;
import { z } from "zod";
import { RequestStatusEnum } from "../enum/index.js";

//1: sendMessageSchema
export const sendMessageSchema = z.object({
  content: z.string().trim().min(1, "content is required").max(1000, "content must be 1000 characters or less"),
});

//_________________________________________________________________________________//

//2: respondRequestSchema
export const respondRequestSchema = z.object({
  status: z.enum([RequestStatusEnum.ACCEPTED, RequestStatusEnum.REJECTED], "status must be accepted or rejected"),
});
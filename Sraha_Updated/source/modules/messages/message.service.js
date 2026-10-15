import {
  UserModel,
  MessageModel,
  IdentityRequestModel,
  ConversationModel,
  ConversationMessageModel,
} from "../../DB/model/index.js";
import { createRepository } from "../../common/repository/index.js";
import { badRequestError, conflictError, forbiddenError, notFoundError } from "../../common/exceptions/index.js";
import { RequestStatusEnum } from "../../common/enum/index.js";
import { isValidId } from "../../common/utils/index.js";

const userRepository = createRepository(UserModel);
const messageRepository = createRepository(MessageModel);
const requestRepository = createRepository(IdentityRequestModel);
const conversationRepository = createRepository(ConversationModel);
const chatRepository = createRepository(ConversationMessageModel);

const MESSAGES_PAGE_SIZE = 10;
const CHAT_PAGE_SIZE = 20;

const same = (a, b) => String(a) === String(b);

const checkId = (id, name) => {
  if (!isValidId(id)) badRequestError(`${name} is not a valid id`);
};

const userSummary = (user) => ({ _id: user._id, name: user.name, email: user.email });

const isDuplicateError = (error) => error?.code === 11000;

//_________________________________________________________________________________//

//1: sendMessage
export const sendMessage = async (sender, receiverId, content) => {
  checkId(receiverId, "receiverId");
  if (same(sender._id, receiverId)) {
    badRequestError("You can't send an anonymous message to yourself");
  }

  const receiver = await userRepository.findById(receiverId);
  if (!receiver) {
    notFoundError("Receiver not found");
  }

  const message = await messageRepository.create({ sender: sender._id, receiver: receiver._id, content });

  return { message: "Message sent anonymously.", id: message._id };
};

//_________________________________________________________________________________//

//2: getReceivedMessages
export const getReceivedMessages = async (user, page) => {
  const { data, ...pagination } = await messageRepository.paginate(
    { receiver: user._id },
    page,
    MESSAGES_PAGE_SIZE,
    { createdAt: -1, _id: -1 }
  );

  const messageIds = data.map((message) => message._id);
  const requests = messageIds.length ? await requestRepository.find({ message: { $in: messageIds } }) : [];
  const conversations = messageIds.length ? await conversationRepository.find({ message: { $in: messageIds } }) : [];

  //only the senders of ACCEPTED requests are looked up
  const acceptedSenderIds = requests.filter((request) => request.status === RequestStatusEnum.ACCEPTED).map((request) => request.sender);
  const senders = acceptedSenderIds.length ? await userRepository.find({ _id: { $in: acceptedSenderIds } }) : [];

  const requestOf = new Map(requests.map((request) => [String(request.message), request]));
  const conversationOf = new Map(conversations.map((conversation) => [String(conversation.message), conversation]));
  const senderOf = new Map(senders.map((sender) => [String(sender._id), sender]));

  const messages = data.map((message) => {
    const request = requestOf.get(String(message._id));
    const isAccepted = request?.status === RequestStatusEnum.ACCEPTED;
    const sender = isAccepted ? senderOf.get(String(message.sender)) : null;

    return {
      _id: message._id,
      content: message.content,
      createdAt: message.createdAt,
      requestStatus: request ? request.status : null,
      sender: sender ? userSummary(sender) : null,
      conversationId: conversationOf.get(String(message._id))?._id ?? null,
    };
  });

  return { ...pagination, messages };
};

//_________________________________________________________________________________//

//3: requestIdentity
export const requestIdentity = async (user, messageId) => {
  checkId(messageId, "messageId");

  const message = await messageRepository.findById(messageId);
  if (!message) {
    notFoundError("Message not found");
  }
  if (!same(message.receiver, user._id)) {
    forbiddenError("Only the receiver of the message can request the sender's identity");
  }

  const oldRequest = await requestRepository.findOne({ message: message._id });
  if (oldRequest) {
    conflictError(`A request for this message already exists (status: ${oldRequest.status})`);
  }

  let request;
  try {
    request = await requestRepository.create({
      message: message._id,
      requester: user._id,
      sender: message.sender,
      status: RequestStatusEnum.PENDING,
    });
  } catch (error) {
    if (isDuplicateError(error)) {
      conflictError("A request for this message already exists");
    }
    throw error;
  }

  return { message: "Identity request sent.", requestId: request._id, status: request.status };
};

//_________________________________________________________________________________//

//4: getRequests
export const getRequests = async (user, page, status) => {
  const filter = { sender: user._id };
  if (status !== undefined) {
    if (!Object.values(RequestStatusEnum).includes(status)) {
      badRequestError("status must be pending, accepted or rejected");
    }
    filter.status = status;
  }

  const { data, ...pagination } = await requestRepository.paginate(filter, page, MESSAGES_PAGE_SIZE, { createdAt: -1, _id: -1 });

  const messageIds = data.map((request) => request.message);
  const requesterIds = data.map((request) => request.requester);
  const messages = messageIds.length ? await messageRepository.find({ _id: { $in: messageIds } }) : [];
  const requesters = requesterIds.length ? await userRepository.find({ _id: { $in: requesterIds } }) : [];
  const conversations = messageIds.length ? await conversationRepository.find({ message: { $in: messageIds } }) : [];

  const messageOf = new Map(messages.map((message) => [String(message._id), message]));
  const requesterOf = new Map(requesters.map((requester) => [String(requester._id), requester]));
  const conversationOf = new Map(conversations.map((conversation) => [String(conversation.message), conversation]));

  const requests = data.map((request) => {
    const message = messageOf.get(String(request.message));
    const requester = requesterOf.get(String(request.requester));

    return {
      _id: request._id,
      status: request.status,
      createdAt: request.createdAt,
      message: message ? { _id: message._id, content: message.content } : null,
      requester: requester ? userSummary(requester) : null,
      conversationId: conversationOf.get(String(request.message))?._id ?? null,
    };
  });

  return { ...pagination, requests };
};

//_________________________________________________________________________________//

//5: respondToRequest
export const respondToRequest = async (user, requestId, status) => {
  checkId(requestId, "requestId");

  const request = await requestRepository.findById(requestId);
  if (!request) {
    notFoundError("Request not found");
  }
  if (!same(request.sender, user._id)) {
    forbiddenError("Only the sender of the message can answer this request");
  }
  if (request.status !== RequestStatusEnum.PENDING) {
    conflictError(`This request was already ${request.status}`);
  }


  const updated = await requestRepository.updateOne({ _id: request._id, status: RequestStatusEnum.PENDING }, { status });
  if (!updated) {
    conflictError("This request was already answered");
  }

  if (status === RequestStatusEnum.REJECTED) {
    return { message: "Request rejected, your identity stays hidden.", status };
  }

  let conversation;
  try {
    conversation = await conversationRepository.create({
      message: request.message,
      sender: request.sender,
      receiver: request.requester,
    });
  } catch (error) {
    if (!isDuplicateError(error)) throw error;
    conversation = await conversationRepository.findOne({ message: request.message });
  }

  return { message: "Request accepted, a conversation was created.", status, conversationId: conversation._id };
};

//_________________________________________________________________________________//

//getMyConversation
const getMyConversation = async (user, conversationId) => {
  checkId(conversationId, "conversationId");

  const conversation = await conversationRepository.findById(conversationId);
  if (!conversation) {
    notFoundError("Conversation not found");
  }
  if (!same(conversation.sender, user._id) && !same(conversation.receiver, user._id)) {
    forbiddenError("Only the two users in this conversation can access it");
  }

  return conversation;
};

//_________________________________________________________________________________//

//6: sendConversationMessage
export const sendConversationMessage = async (user, conversationId, content) => {
  const conversation = await getMyConversation(user, conversationId);

  const chatMessage = await chatRepository.create({ conversation: conversation._id, sender: user._id, content });

  return { message: "Message sent.", id: chatMessage._id };
};

//_________________________________________________________________________________//

//7: getConversationMessages
export const getConversationMessages = async (user, conversationId, page) => {
  const conversation = await getMyConversation(user, conversationId);

  const { data, ...pagination } = await chatRepository.paginate(
    { conversation: conversation._id },
    page,
    CHAT_PAGE_SIZE,
    { createdAt: 1, _id: 1 }
  );

  const messages = data.map((chatMessage) => ({
    _id: chatMessage._id,
    senderId: chatMessage.sender,
    mine: same(chatMessage.sender, user._id),
    content: chatMessage.content,
    createdAt: chatMessage.createdAt,
  }));

  return { conversationId: conversation._id, originalMessageId: conversation.message, ...pagination, messages };
};
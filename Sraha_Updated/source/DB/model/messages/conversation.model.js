import mongoose from "mongoose";

//3: Conversations collection
const conversationSchema = new mongoose.Schema(
  {
    //unique: one conversation per original message
    message: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      required: true,
      unique: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    receiver: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const ConversationModel = mongoose.model("Conversation", conversationSchema);
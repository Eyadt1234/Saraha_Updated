import mongoose from "mongoose";
import { RequestStatusEnum } from "../../../common/enum/index.js";

//2: IdentityRequests collection
const identityRequestSchema = new mongoose.Schema(
  {
    //unique: one request per message
    message: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Message",
      required: true,
      unique: true,
    },
    requester: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sender: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    status: {
      type: String,
      enum: Object.values(RequestStatusEnum),
      default: RequestStatusEnum.PENDING,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  }
);

export const IdentityRequestModel = mongoose.model("IdentityRequest", identityRequestSchema);
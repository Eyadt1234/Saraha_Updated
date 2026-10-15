import mongoose from "mongoose";
import { GenderEnum, RoleEnum, OtpPurposeEnum, ProviderEnum } from "../../../common/enum/index.js";

//1: Users collection (name/email/password/phone/age/gender/role)
const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
    },
    //2: a GOOGLE-provider
    provider: {
      type: String,
      enum: Object.values(ProviderEnum),
      default: ProviderEnum.SYSTEM,
    },
    password: {
      type: String,
    },
    phone: {
      type: String,
    },
    age: {
      type: Number,
      min: 18,
      max: 60,
    },
    gender: {
      type: String,
      enum: Object.values(GenderEnum),
      default: GenderEnum.MALE,
    },
    role: {
      type: String,
      enum: Object.values(RoleEnum),
      default: RoleEnum.USER,
    },
    changeCredentialsTime: {
      type: Date,
    },
    //3: 2-step-verification
    twoStepEnabled: {
      type: Boolean,
      default: false,
    },
    otp: {
      type: String,
    },
    otpExpiresAt: {
      type: Date,
    },
    otpPurpose: {
      type: String,
      enum: Object.values(OtpPurposeEnum),
    },
  },
  {
    timestamps: false,
    versionKey: false,
  }
);

export const UserModel = mongoose.model("User", userSchema);
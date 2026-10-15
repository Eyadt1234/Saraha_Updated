import crypto from "node:crypto";
import { ENC_KEY } from "../../config.js";

const ALGORITHM = "aes-256-cbc";

//1: encryption
export const encryptValue = (plainText) => {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(ENC_KEY, "hex"), iv);

  const encrypted = Buffer.concat([cipher.update(plainText, "utf8"), cipher.final()]);
  return `${iv.toString("hex")}:${encrypted.toString("hex")}`;
};

//_________________________________________________________________________________//

//2: decryption
export const decryptValue = (cipherText) => {
  if (!cipherText) return null;

  const [ivHex, encryptedHex] = cipherText.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(ENC_KEY, "hex"), iv);

  const decrypted = Buffer.concat([decipher.update(Buffer.from(encryptedHex, "hex")), decipher.final()]);
  return decrypted.toString("utf8");
};
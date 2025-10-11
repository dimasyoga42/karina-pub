import { isUserAdmin } from "../../model/admin.js";

export const GrubId = async (sock, chatId, msg) => {
  try {
    const admin = isUserAdmin(sock, msg,  chatId);
    if(!admin) return sock.sendMessage(chatId, {text: "admin only"}, {quoted: msg});
    const M = msg.key.remoteJid;
    sock.sendMessage(chatId, {text: `id: ${M}`}, {quoted: msg});
  } catch (err) {
    sock.sendMessage(chatId, {text: `err log: ${err}`}, {quoted: msg});
  }
}

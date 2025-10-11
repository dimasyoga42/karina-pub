import { isUserAdmin } from "../../model/admin.js";

export const GrubId = async (sock, chatId, msg) => {
  try {
   const admin = await isUserAdmin(sock, msg, chatId);
    if (!admin) {
      await sock.sendMessage(chatId, { text: "🚫 Fitur ini hanya bisa digunakan oleh admin grup." }, { quoted: msg });
      return;
    }
    const M = msg.key.remoteJid;
    sock.sendMessage(chatId, {text: `id: ${M}`}, {quoted: msg});
  } catch (err) {
    sock.sendMessage(chatId, {text: `err log: ${err}`}, {quoted: msg});
  }
}

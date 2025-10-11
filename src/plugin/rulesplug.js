//import { create } from "domain";
import { getUserData, saveUserData } from "../config/config.js";
import path from "path"
import { isUserAdmin } from "../model/admin.js";
import { text } from "stream/consumers";
const db = path.resolve("db", "rules.json");
export const setRules = async (sock, chatId, msg, rule) => {
try {
  const isAdmin = isUserAdmin(sock, msg, chatId);
  if(!isAdmin) return sock.sendMessage(chatId, {text: "admin only"}, { quoted: msg});
  const data = getUserData(db);
  const grubId = msg.key.remoteJid
  const name = msg.pushName
  if(!rule) {sock.sendMessage(chatId, {text: "format salah\ncara penggunaan:\n- `.setrules <rules grub>`"})}
  let eRules = data.find((i) => i.grubId === grubId)
  if(!eRules) {
    const newData = {
      grubId,
      rules: rule,
      create: name
    }
    data.push(newData);
    saveUserData(db, data)
    sock.sendMessage(chatId, {text: "rules berhasil di tambahkan"}, {quoted: msg})
    return
  }
  eRules.rules = rule;
  saveUserData(db, data);
  sock.sendMessage(chatId, {text: "rules berhasil di edit"});
} catch (err) {
  sock.sendMessage(chatId, {text: err});
}
}
export const rules = (sock, chatId, msg) => {
  try {
    const data = getUserData(db);
    let datafind = data.find((i) => i.grubId === msg.key.remoteJid);
    if(!datafind) return sock.sendMessage(chatId, {text: "rules grub belum di tambahkan\ngunakan `.setrules` untuk menambahkan rules\ngunakan `.rules` untuk cek rules"});
    const message = `rules grub:\ndibuat: ${datafind.create}\n${datafind.rules}
    `.trim()
    return sock.sendMessage(chatId, {text: message}, {quoted: msg});
  } catch (err) {
    sock.sendMessage(chatId, {text: err});
  }
}

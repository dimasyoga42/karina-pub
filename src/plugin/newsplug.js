import { getUserData, saveUserData } from "../config/config.js";
import path from "path";
import { isUserAdmin } from "../model/admin.js";

const db = path.resolve("db", "news/news.json")
export const setnews = async (sock, chatId, msg, news) => {
  try {
    if(!isUserAdmin(sock, msg, chatId)) return;
    const data = getUserData(db);
    const id = msg.key.remoteJid;
    const name = msg.pushName;
    if(!news) return sock.sendMessage(chatId, {text: "isi tidak boleh kosong"}, { quoted: msg});
    let dataEntry = data.find((a) => a.id === id )
    if(!dataEntry) {
      const newData = {
        id,
        news,
        by: name,
      }
      data.push(newData)
      saveUserData(db, data);
      sock.sendMessage(chatId, {text: "news berhasil di tambahkan.."}, { quoted: msg});
    }
    dataEntry.news = news
    saveUserData(db, data);
     sock.sendMessage(chatId, {text: "news berhasil di ubah.."}, { quoted: msg});
  } catch (err) {
    sock.sendMessage(chatId, {text: err});
  }
}
export const news = async (sock, chatId, msg) => {
  try {
    const data = getUserData(db)
    let searchData = data.find((s) => s.id === id);
    if(!searchData) return sock.sendMessage(chatId, {text: "news belum di tambahkan\ngunakan:\n> .setnews untuk menambahkan"}, {quoted: msg})
      const caption = `${searchData.news}\n dibuat: ${searchData.by}`.trim()
    sock.sendMessage(chatId, {text: caption}, {quoted: msg})
  } catch (error) {
    sock.sendMessage(chatId, {text: error}, {quoted: msg})
  }
}

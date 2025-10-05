import { getUserData, saveUserData } from "../config/config.js";
import path from "path";
import { isUserAdmin } from "../model/admin.js";

const db = path.resolve("db", "news/news.json")
export const setnews = async (sock, chatId, msg, news) => {
  try {
    if(!isUserAdmin(sock, msg, chatId)) return;
    if(!news) return sock,sendMessage(chatId, {text: "isi tidak boleh kosong"}, { quoted: msg});
    const data = getUserData(db);
    const id = msg.key.remoteJid;
    const name = msg.pushName;
    let dataEntry = data.find((a) => a.id === id )
    if(!dataEntry) {
      const newData = {
        id,
        news,
        by: name,
      }
      data.push(newData)
      saveUserData(db, data);
      return sock,sendMessage(chatId, {text: "news berhasil di tambahkan.."}, { quoted: msg});
    }
    dataEntry.news = news
    saveUserData(db, data);
    return sock,sendMessage(chatId, {text: "news berhasil di ubah.."}, { quoted: msg});
  } catch (err) {
    sock.sendMessage(chatId, {text: err});
  }
}

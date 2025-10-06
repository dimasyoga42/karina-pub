import { getXtall } from "../plugin/xtallplug.js";

export const toramMenu = async (text, sock, chatId, msg) => {
try {
  if(text.startsWith(".xtall")) {
    const arg = text.replace(".xtall", "");
    getXtall(sock, chatId, msg, arg);
  }
} catch (err) {
  console.log(err)
}
}

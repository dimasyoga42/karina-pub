import { getXtall } from "../plugin/xtallplug.js";

export const toramMenu = async (text, sock, chatId, msg) => {
try {
  if(text.startsWith(".xtall")) {
    const wc = text.replace(".xtall", "");
    console.log(wc)
   await  getXtall(sock, chatId, msg, wc.trim());
  }
} catch (err) {
  console.log(err)
}
}

import { searchXtall } from "../plugin/xtallplug.js";

export const toramMenu = async (text, sock, chatId, msg) => {
try {
  if(text.startsWith(".xtall")) {
    const arg = text.replace(".xtall", "");
    searchXtall(sock, chatId, msg, arg);
  }
} catch (err) {
  console.log(err)
}
}

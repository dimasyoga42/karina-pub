
import { ability } from "../plugin/ability.js";
import { getbuff } from "../plugin/buffplug.js";
import { getXtall } from "../plugin/xtallplug.js";

export const toramMenu = async (text, sock, chatId, msg) => {
try {
  if(text.startsWith(".xtall")) {
    const wc = text.replace(".xtall", "");
    console.log(wc)
   await  getXtall(sock, chatId, msg, wc.trim());
  }
  if(text.startsWith(".buff")) {
   await  getbuff(sock, chatId, msg);
  }
  if(text.startsWith(".ability")) {
    const name = text.replace(".ability", "");
   await  ability(sock, chatId, msg, name.trim());
  }
  if(text.startsWith(".pembolong")) {

  }
} catch (err) {
  console.log(err)
}
}

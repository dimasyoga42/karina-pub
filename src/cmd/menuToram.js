
import { ability } from "../plugin/ability.js";
import { getbuff } from "../plugin/buffplug.js";
import { getRegist, getXtall } from "../plugin/xtallplug.js";

export const toramMenu = async (text, sock, chatId, msg) => {
try {
  if(text.startsWith(".xtall")) {
    const wc = text.replace(".xtall", "");
    console.log(wc)
   await  getXtall(sock, chatId, msg, wc.trim());
  }
  if(text.startsWith(".regist")) {
    const wc = text.replace(".regist", "");
    console.log(wc)
   await  getRegist(sock, chatId, msg, wc.trim());
  }
  if(text.startsWith(".buff")) {
   await  getbuff(sock, chatId, msg);
  }
  if(text.startsWith(".ability")) {
    const name = text.replace(".ability", "");
   await  ability(sock, chatId, msg, name.trim());
  }
  if(text.startsWith(".pembolong")) {
    const pembolong = `
source oktober: https://youtube.com/shorts/ql0fJ62P9zo?si=3s0J7JQqo5AadhNJ
Extract Crysta 2,5-3,3M
Pierce MD  6M-7m
Pierce HB  10M
Pierce KTN  8-11M
Pierce KNUCK  9-15M
Pierce STAFF  4-20M
Pierce OHS  10 - 16,5M
Pierce THS  13-16M
Pierce BOW  9M
Pierce BWG  11M

PRIME MD  20 - 37M
PRIME KTN  75 - 111M
PRIME THS  80 - 96M
PRIME BWG  65 - 95M
PRIME HB  70 - 90M
PRIME STAFF 80-100M
PRIME OHS  80M

Legendary Ornament 340 - 370M
Legendary Needle 400 - 500M
Legendary Silk 601 - 620M
\n> ada yang keliru mohon di report .report
\n> perlu di ingat: pembuatan rate di ambil dari data  akhir september - oktober (serta refrence dari sumber lain)
`.trim()
sock.sendMessage(chatId, {text: pembolong}, {quoted: msg});
  }
} catch (err) {
  console.log(err)
}
}

import { close, hidetag, kick, open } from "../model/admin.js";
import { setnews } from "../plugin/newsplug.js";
import { setRules } from "../plugin/rulesplug.js";
import { GrubId } from "../plugin/vip_module/grubId.js";
import { setWelcome } from "../plugin/wcplug.js";

export const adminMenu = async (text, sock, chatId, msg) => {
try {
  if(text.startsWith(".kick")) {
        const args = text.split(" ").slice(1);
        const pesan = args[0];
        kick(sock, chatId, msg, pesan);
      } else if (text.startsWith('.hidetag')) {
        hidetag(sock, chatId, msg)
      } else if (text.startsWith(".open")) {
        open(sock, chatId, msg)
      } else if (text.startsWith(".close")) {
        close(sock, chatId, msg)
      } else if (text.startsWith(".setrules")) {
        const rule = text.replace(".setrules", "");
        setRules(sock, chatId, msg, rule);
      } else if (text.startsWith(".setwc")) {
        const wc = text.replace(".setwc", "");
        setWelcome(sock, chatId, msg, wc);
      } else if (text.startsWith(".setnews")) {
        const news = text.replace(".setnews", "");
        setnews(sock, chatId, msg, news);
      }else if (text.startsWith(".cekid")) {
        GrubId(sock, chatId, msg)
      }
} catch (err) {
  console.log(err)
}
}

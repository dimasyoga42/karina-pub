export const menu = async (sock, chatId, msg) => {
  try {
    const caption = `━━━━━━━━━━━━━━━━━━
K a r i n a
halo ${msg.pushName}
━━━━━━━━━━━━━━━━━━
gunakan \`.minta\` untuk memberikan saran fitur pada developer
━━━━━━━━━━━━━━━━━━
*General:*
➣ .cekid
➣ .cekvip
➣ .rules
➣ .news
━━━━━━━━━━━━━━━━━━
*Sosial:*
➣ .setpp
➣ .setbio
➣ .profile
➣ .cekprofile
➣ .member
━━━━━━━━━━━━━━━━━━
*Admin:*
➣ .close
➣ .open
➣ .hidetag
➣ .kick
➣ .setwc
➣ .setnews
➣ .setrules
➣ .setmem
━━━━━━━━━━━━━━━━━━
*Toram:*
➣ .item <name>
➣ .lv <level>
➣ .buff
➣ .ability
➣ .xtall
➣ .regist
➣ .bos
━━━━━━━━━━━━━━━━━━
*Guide Toram*
━━━━━━━━━━━━━━━━━━`;

    await sock.sendMessage(chatId, { text: caption }, { quoted: msg });

  } catch (err) {
    console.error("Error in menu:", err);
    await sock.sendMessage(chatId, {
      text: `❌ Terjadi kesalahan: ${err.message}`
    });
  }
};

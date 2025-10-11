export const menu = async (sock, chatId, msg) => {
  try {
    const caption = `━━━━━━━━━━━━━━━━━━
K a r i n a
halo ${msg.pushName}
━━━━━━━━━━━━━━━━━━
gunakan .saran untuk request / report bug fitur dll
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
➣ .qc (err sementara)
➣ .mixmoji (bug)
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
➣ .bos (coming soon)
➣ .pembolong
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

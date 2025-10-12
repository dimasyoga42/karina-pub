import { downloadMediaMessage } from "@whiskeysockets/baileys";

/* 🔹 Konstanta untuk meningkatkan keterbacaan dan pemeliharaan */
const CONSTANTS = {
  GROUP_SUFFIX: "@g.us",
  USER_SUFFIX: "@s.whatsapp.net",
  ADMIN_ROLES: ["admin", "superadmin"],
};

/* 🔹 Utility: Normalisasi JID */
const normalizeJid = (jid = "") => jid.replace(/:\d+@s\.whatsapp\.net$/, "@s.whatsapp.net");

/**
 * 🔹 Fungsi terpusat untuk memeriksa izin admin.
 * Mengambil metadata grup sekali dan mengembalikan status admin untuk bot dan pengirim.
 * @returns {Promise<{isGroup: boolean, metadata: object, bot: {isAdmin: boolean, isCreator: boolean}, sender: {isAdmin: boolean, isCreator: boolean}}>}
 */
export const checkAdminPermissions = async (sock, msg) => {
  const chatId = msg.key.remoteJid;
  const isGroup = chatId.endsWith(CONSTANTS.GROUP_SUFFIX);
  if (!isGroup) {
    return { isGroup: false, metadata: null, bot: { isAdmin: true }, sender: { isAdmin: true } };
  }

  try {
    const groupMetadata = await sock.groupMetadata(chatId);
    const botId = normalizeJid(sock.user.id);
    const senderId = msg.key.participant || msg.key.remoteJid;

    const botParticipant = groupMetadata.participants.find(p => normalizeJid(p.id) === botId);
    const senderParticipant = groupMetadata.participants.find(p => normalizeJid(p.id) === senderId);

    const isBotAdmin = !!botParticipant && CONSTANTS.ADMIN_ROLES.includes(botParticipant.admin);
    const isSenderAdmin = !!senderParticipant && CONSTANTS.ADMIN_ROLES.includes(senderParticipant.admin);

    return {
      isGroup: true,
      metadata: groupMetadata,
      bot: { isAdmin: isBotAdmin },
      sender: { isAdmin: isSenderAdmin },
    };
  } catch (error) {
    console.error("Error checking admin permissions:", error);
    // Jika gagal mengambil metadata, anggap tidak memiliki izin
    return { isGroup: true, metadata: null, bot: { isAdmin: false }, sender: { isAdmin: false } };
  }
};

/**
 * 🔹 Utilitas untuk mendapatkan JID target dari mention, reply, atau argumen.
 * @returns {string|null} JID target atau null jika tidak ditemukan.
 */
const getTargetJid = (msg, arg = "") => {
  // Prioritas 1: Mention
  if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
    return msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
  }
  // Prioritas 2: Reply
  if (msg.message?.extendedTextMessage?.contextInfo?.participant) {
    return msg.message.extendedTextMessage.contextInfo.participant;
  }
  // Prioritas 3: Argumen nomor telepon
  const cleanNumber = arg.replace(/\D/g, "");
  if (cleanNumber) {
    return cleanNumber + CONSTANTS.USER_SUFFIX;
  }
  return null;
};

// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//                                FUNGSI UTAMA GRUP
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

export const close = async (sock, msg) => {
  const chatId = msg.key.remoteJid;
  const permissions = await checkAdminPermissions(sock, msg);

  if (!permissions.isGroup) return;
  if (!permissions.sender.isAdmin) {
    return sock.sendMessage(chatId, { text: "⚠️ Perintah ini hanya untuk admin grup." }, { quoted: msg });
  }
  if (!permissions.bot.isAdmin) {
    return sock.sendMessage(chatId, { text: "⚠️ Bot bukan admin! Berikan izin admin agar fitur ini berfungsi." }, { quoted: msg });
  }

  try {
    await sock.groupSettingUpdate(chatId, "announcement");
    await sock.sendMessage(chatId, { text: "✅ Grup telah ditutup! Hanya admin yang dapat mengirim pesan." }, { quoted: msg });
  } catch (error) {
    console.error("Error saat menutup grup:", error);
    await sock.sendMessage(chatId, { text: "❌ Gagal menutup grup. Terjadi kesalahan internal." }, { quoted: msg });
  }
};

export const open = async (sock, msg) => {
  const chatId = msg.key.remoteJid;
  const permissions = await checkAdminPermissions(sock, msg);

  if (!permissions.isGroup) return;
  if (!permissions.sender.isAdmin) {
    return sock.sendMessage(chatId, { text: "⚠️ Perintah ini hanya untuk admin grup." }, { quoted: msg });
  }
  if (!permissions.bot.isAdmin) {
    return sock.sendMessage(chatId, { text: "⚠️ Bot bukan admin! Berikan izin admin agar fitur ini berfungsi." }, { quoted: msg });
  }

  try {
    await sock.groupSettingUpdate(chatId, "not_announcement");
    await sock.sendMessage(chatId, { text: "✅ Grup telah dibuka! Semua peserta dapat mengirim pesan." }, { quoted: msg });
  } catch (error) {
    console.error("Error saat membuka grup:", error);
    await sock.sendMessage(chatId, { text: "❌ Gagal membuka grup. Terjadi kesalahan internal." }, { quoted: msg });
  }
};

export const kick = async (sock, msg, arg) => {
  const chatId = msg.key.remoteJid;
  const permissions = await checkAdminPermissions(sock, msg);

  if (!permissions.isGroup) return;
  if (!permissions.sender.isAdmin) {
    return sock.sendMessage(chatId, { text: "⚠️ Perintah ini hanya untuk admin grup." }, { quoted: msg });
  }
  if (!permissions.bot.isAdmin) {
    return sock.sendMessage(chatId, { text: "⚠️ Bot bukan admin! Berikan izin admin agar fitur ini berfungsi." }, { quoted: msg });
  }

  const targetId = getTargetJid(msg, arg);
  if (!targetId) {
    return sock.sendMessage(chatId, { text: "Format salah. Mohon mention atau balas pesan pengguna yang ingin di-kick.\nContoh: `.kick @user`" }, { quoted: msg });
  }
  if (targetId === normalizeJid(sock.user.id)) {
      return sock.sendMessage(chatId, { text: "❌ Tidak dapat mengeluarkan diri sendiri." }, { quoted: msg });
  }

  try {
    await sock.groupParticipantsUpdate(chatId, [targetId], "remove");
    await sock.sendMessage(chatId, { text: `✅ Pengguna berhasil dikeluarkan dari grup.` }, { quoted: msg });
  } catch (error) {
    console.error("Error saat kick user:", error);
    await sock.sendMessage(chatId, { text: "❌ Gagal mengeluarkan pengguna. Pastikan pengguna tersebut adalah anggota grup." }, { quoted: msg });
  }
};

export const promote = async (sock, msg, arg) => {
  const chatId = msg.key.remoteJid;
  const permissions = await checkAdminPermissions(sock, msg);

  if (!permissions.isGroup) return;
  if (!permissions.sender.isAdmin) {
    return sock.sendMessage(chatId, { text: "⚠️ Perintah ini hanya untuk admin grup." }, { quoted: msg });
  }
  if (!permissions.bot.isAdmin) {
    return sock.sendMessage(chatId, { text: "⚠️ Bot bukan admin! Berikan izin admin agar fitur ini berfungsi." }, { quoted: msg });
  }

  const targetId = getTargetJid(msg, arg);
  if (!targetId) {
    return sock.sendMessage(chatId, { text: "Format salah. Mohon mention atau balas pesan pengguna yang ingin di-promote.\nContoh: `.promote @user`" }, { quoted: msg });
  }

  try {
    await sock.groupParticipantsUpdate(chatId, [targetId], "promote");
    await sock.sendMessage(chatId, { text: `✅ Pengguna berhasil dipromosikan menjadi admin.`, mentions: [targetId] }, { quoted: msg });
  } catch (error) {
    console.error("Error saat promote user:", error);
    await sock.sendMessage(chatId, { text: "❌ Gagal mempromosikan pengguna." }, { quoted: msg });
  }
};

export const demote = async (sock, msg, arg) => {
  const chatId = msg.key.remoteJid;
  const permissions = await checkAdminPermissions(sock, msg);

  if (!permissions.isGroup) return;
  if (!permissions.sender.isAdmin) {
    return sock.sendMessage(chatId, { text: "⚠️ Perintah ini hanya untuk admin grup." }, { quoted: msg });
  }
  if (!permissions.bot.isAdmin) {
    return sock.sendMessage(chatId, { text: "⚠️ Bot bukan admin! Berikan izin admin agar fitur ini berfungsi." }, { quoted: msg });
  }

  const targetId = getTargetJid(msg, arg);
  if (!targetId) {
    return sock.sendMessage(chatId, { text: "Format salah. Mohon mention atau balas pesan pengguna yang ingin di-demote.\nContoh: `.demote @user`" }, { quoted: msg });
  }

  try {
    await sock.groupParticipantsUpdate(chatId, [targetId], "demote");
    await sock.sendMessage(chatId, { text: `✅ Admin berhasil diturunkan menjadi anggota biasa.`, mentions: [targetId] }, { quoted: msg });
  } catch (error) {
    console.error("Error saat demote user:", error);
    await sock.sendMessage(chatId, { text: "❌ Gagal menurunkan jabatan admin." }, { quoted: msg });
  }
};


// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
//                                FUNGSI HIDETAG
// ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

/**
 * 🔹 Fungsi utama hidetag.
 * Mengirim pesan ke semua anggota grup.
 */
export const hidetag = async (sock, msg, arg) => {
  const chatId = msg.key.remoteJid;
  const permissions = await checkAdminPermissions(sock, msg);

  if (!permissions.isGroup) {
    return sock.sendMessage(chatId, { text: "⚠️ Fitur hidetag hanya bisa digunakan di grup." }, { quoted: msg });
  }
  if (!permissions.sender.isAdmin) {
    return sock.sendMessage(chatId, { text: "⚠️ Hanya admin yang dapat menggunakan fitur ini." }, { quoted: msg });
  }

  try {
    const participants = permissions.metadata?.participants || [];
    const mentions = participants.map(p => p.id);

    if (mentions.length === 0) {
      return sock.sendMessage(chatId, { text: "❌ Tidak ada anggota yang dapat di-tag." }, { quoted: msg });
    }

    const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;

    // Jika ada pesan yang di-reply (quoted)
    if (quotedMsg) {
      const quotedInfo = {
        key: {
          remoteJid: chatId,
          id: msg.message.extendedTextMessage.contextInfo.stanzaId,
          participant: msg.message.extendedTextMessage.contextInfo.participant
        },
        message: quotedMsg,
      };

      let buffer;
      try {
        buffer = await downloadMediaMessage(quotedInfo, "buffer", {});
      } catch (downloadError) {
        console.error("[Hidetag] Gagal mengunduh media yang di-quote:", downloadError);
        // Fallback ke teks jika media gagal diunduh atau tidak ada media
        const text = quotedMsg.conversation || quotedMsg.extendedTextMessage?.text || arg.trim() || "";
        return sock.sendMessage(chatId, { text, mentions }, { quoted: msg });
      }

      const mediaType = Object.keys(quotedMsg)[0]; // e.g., imageMessage, videoMessage
      const mediaKey = mediaType.replace('Message', ''); // e.g., image, video
      const mediaContent = quotedMsg[mediaType];

      const messageOptions = {
          [mediaKey]: buffer,
          caption: mediaContent.caption || arg.trim() || "",
          mimetype: mediaContent.mimetype,
          mentions: mentions,
      };

      // Khusus untuk dokumen
      if (mediaKey === 'document' && mediaContent.fileName) {
          messageOptions.fileName = mediaContent.fileName;
      }

      return sock.sendMessage(chatId, messageOptions, { quoted: msg });

    } else { // Jika hidetag biasa dengan teks
      if (!arg?.trim()) {
        return sock.sendMessage(chatId, { text: "⚠️ Mohon sertakan teks untuk hidetag.\nContoh: `.hidetag pengumuman`"}, { quoted: msg });
      }
      await sock.sendMessage(chatId, { text: arg.trim(), mentions }, { quoted: msg });
    }

  } catch (error) {
    console.error("Error dalam fungsi hidetag:", error);
    await sock.sendMessage(chatId, { text: "❌ Gagal menjalankan hidetag. Silakan coba lagi." }, { quoted: msg });
  }
};

const hidetagCooldowns = new Map();
const COOLDOWN_TIME = 30000; // 30 detik

export const hidetagWithCooldown = async (sock, msg, arg) => {
  const senderId = msg.key.participant || msg.key.remoteJid;
  const now = Date.now();

  if (hidetagCooldowns.has(senderId)) {
    const lastUsed = hidetagCooldowns.get(senderId);
    const timeLeft = COOLDOWN_TIME - (now - lastUsed);

    if (timeLeft > 0) {
      const secondsLeft = Math.ceil(timeLeft / 1000);
      return sock.sendMessage(msg.key.remoteJid, { text: `⏳ Mohon tunggu ${secondsLeft} detik sebelum menggunakan hidetag lagi.` }, { quoted: msg });
    }
  }

  hidetagCooldowns.set(senderId, now);
  // Hapus dari map setelah cooldown selesai untuk menghemat memori
  setTimeout(() => hidetagCooldowns.delete(senderId), COOLDOWN_TIME);

  return await hidetag(sock, msg, arg);
};

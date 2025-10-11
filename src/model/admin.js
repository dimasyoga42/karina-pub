import { downloadMediaMessage } from "@whiskeysockets/baileys";

/* 🔹 Utility: Normalisasi JID */
const normalizeJid = (jid = "") => jid.replace(/(:\d+)?@.*/, "@s.whatsapp.net");

/* 🔹 Cek apakah BOT adalah admin grup */
export const isBotAdmin = async (sock, msg, chatId) => {
  try {
    const isGroup = chatId.endsWith("@g.us");
    if (!isGroup) return true;

    const groupMetadata = await sock.groupMetadata(chatId);
    if (!groupMetadata) {
      console.error("Gagal mengambil metadata grup");
      return false;
    }

    const botId = normalizeJid(sock.user?.id);
    const botParticipant = groupMetadata.participants.find(
      (p) => normalizeJid(p.id || p.jid) === botId
    );

    if (!botParticipant) {
      await sock.sendMessage(chatId, { text: "⚠️ Bot tidak ditemukan dalam grup ini." }, { quoted: msg });
      return false;
    }

    const isAdmin = ["admin", "superadmin"].includes(botParticipant.admin);
    if (!isAdmin) {
      await sock.sendMessage(
        chatId,
        { text: "⚠️ Bot bukan admin! Berikan izin admin agar fitur ini berfungsi." },
        { quoted: msg }
      );
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error in isBotAdmin:", err);
    await sock.sendMessage(
      chatId,
      { text: "⚠️ Gagal memeriksa status admin bot." },
      { quoted: msg }
    );
    return false;
  }
};

/* 🔹 Cek apakah USER adalah admin grup */
export const isUserAdmin = async (sock, msg, chatId) => {
  try {
    const isGroup = chatId.endsWith("@g.us");
    if (!isGroup) return true;

    const senderId = normalizeJid(msg.key.participant || msg.key.remoteJid);
    const groupMetadata = await sock.groupMetadata(chatId);

    const senderParticipant = groupMetadata.participants.find(
      (p) => normalizeJid(p.id || p.jid) === senderId
    );

    const isAdmin = ["admin", "superadmin"].includes(senderParticipant?.admin);
    if (!isAdmin) {
      await sock.sendMessage(
        chatId,
        { text: "🚫 Fitur ini hanya bisa digunakan oleh admin grup." },
        { quoted: msg }
      );
      return false;
    }

    return true;
  } catch (err) {
    console.error("Error in isUserAdmin:", err);
    await sock.sendMessage(
      chatId,
      { text: "⚠️ Terjadi kesalahan saat memeriksa status admin pengguna." },
      { quoted: msg }
    );
    return false;
  }
};




export const close = async (sock, chatId, msg) => {
	try {
		// Cek status admin bot
		const isAdmin = await isBotAdmin(sock, msg, chatId);
		if (!isAdmin) return sock.sendMessage(chatId, {text: "admin only"}, { quoted: msg});

		// Cek status admin pengirim pesan
		const isSenderAdmin = await isUserAdmin(sock, msg, chatId);
		if (!isSenderAdmin) return;

		await sock.groupSettingUpdate(chatId, "announcement");
		await sock.sendMessage(
			chatId,
			{
				text: " Grup telah ditutup! Hanya admin yang dapat mengirim pesan.",
			},
			{ quoted: msg }
		);
	} catch (error) {
		console.error("Error saat menutup grup:", error);
		await sock.sendMessage(
			chatId,
			{
				text: " Gagal menutup grup. Pastikan bot adalah admin dan memiliki izin yang cukup.",
			},
			{ quoted: msg }
		);
	}
};

export const open = async (sock, chatId, msg) => {
	try {
		// Cek status admin bot
		const isAdmin = await isBotAdmin(sock, msg, chatId);
		if (!isAdmin) return sock.sendMessage(chatId, {text: "admin only"}, { quoted: msg});

		// Cek status admin pengirim pesan
		const isSenderAdmin = await isUserAdmin(sock, msg, chatId);
		if (!isSenderAdmin) return;

		await sock.groupSettingUpdate(chatId, "not_announcement");
		await sock.sendMessage(
			chatId,
			{
				text: " Grup telah dibuka! Semua peserta dapat mengirim pesan.",
			},
			{ quoted: msg }
		);
	} catch (error) {
		console.error("Error saat membuka grup:", error);
		await sock.sendMessage(
			chatId,
			{
				text: " Gagal membuka grup. Pastikan bot adalah admin dan memiliki izin yang cukup.",
			},
			{ quoted: msg }
		);
	}
};

export const hidetag = async (sock, chatId, msg, arg) => {
	try {
		// Validate group chat
		if (!chatId.endsWith("@g.us")) {
			return await sock.sendMessage(
				chatId,
				{ text: " Fitur hidetag hanya bisa digunakan di grup." },
				{ quoted: msg }
			);
		}

		// Check admin permission
		const isSenderAdmin = await isUserAdmin(sock, msg, chatId);
		if (!isSenderAdmin) {
			 return await sock.sendMessage(
			 	chatId,
			 	{ text: " Hanya admin yang dapat menggunakan fitur ini." },
			 	{ quoted: msg }
			 );
		}

		// Get group metadata
		const groupMetadata = await sock.groupMetadata(chatId);
		if (!groupMetadata?.participants?.length) {
			return await sock.sendMessage(
				chatId,
				{ text: "Tidak dapat mengambil informasi grup atau grup kosong." },
				{ quoted: msg }
			);
		}

		// Create mentions array (filter out bot and inactive users)
		const mentions = groupMetadata.participants
			.filter((participant) => participant.id !== sock.user?.id) // Exclude bot
			.map((participant) => participant.id);

		if (mentions.length === 0) {
			return await sock.sendMessage(
				chatId,
				{ text: "❌ Tidak ada member yang dapat di-tag." },
				{ quoted: msg }
			);
		}

		// Handle quoted messages
		const quotedMsg = msg.message?.extendedTextMessage?.contextInfo?.quotedMessage;
		if (quotedMsg) {
			return await handleQuotedMessage(sock, chatId, msg, quotedMsg, mentions);
		}

		// Send regular hidetag message
		if (arg?.trim()) {
			await sock.sendMessage(
				chatId,
				{
					text: arg.trim(),
					mentions: mentions,
				},
				{ quoted: msg }
			);
		}
	} catch (error) {
		console.error("Error in hidetag function:", error);
		await sock.sendMessage(
			chatId,
			{ text: "Gagal menjalankan hidetag. Silakan coba lagi." },
			{ quoted: msg }
		);
	}
};

// Handle quoted messages including media
const handleQuotedMessage = async (sock, chatId, msg, quotedMsg, mentions) => {
	try {
		console.log("[Hidetag] Processing quoted message");

		// Handle text messages
		if (quotedMsg.conversation || quotedMsg.extendedTextMessage?.text) {
			const messageText = quotedMsg.conversation || quotedMsg.extendedTextMessage.text;
			return await sock.sendMessage(
				chatId,
				{
					text: messageText,
					mentions: mentions,
				},
				{ quoted: msg }
			);
		}

		// For media messages, try to re-download and forward with mentions
		const mediaTypes = [
			{ key: "imageMessage", type: "image" },
			{ key: "videoMessage", type: "video" },
			{ key: "documentMessage", type: "document" },
			{ key: "audioMessage", type: "audio" },
			{ key: "stickerMessage", type: "sticker" },
		];

		for (const { key, type } of mediaTypes) {
			if (quotedMsg[key]) {
				console.log(`[Hidetag] Found ${type} message, attempting to download`);
				try {
					const buffer = await downloadMediaMessage(
						{
							key: msg.message.extendedTextMessage.contextInfo.stanzaId,
							message: {
								[key]: quotedMsg[key],
							},
						},
						"buffer",
						{},
						{
							reuploadRequest: sock.reuploadRequest,
						}
					);

					console.log(`[Hidetag] Successfully downloaded ${type}`);
					const mediaContent = quotedMsg[key];
					const caption = mediaContent.caption || "";

					return await sock.sendMessage(
						chatId,
						{
							[type]: buffer,
							caption: caption,
							mentions: mentions,
							mimetype: mediaContent.mimetype,
						},
						{ quoted: msg }
					);
				} catch (downloadError) {
					console.error(`[Hidetag] Failed to download ${type}:`, downloadError);
					// If download fails, at least send the caption with mentions
					if (quotedMsg[key].caption) {
						return await sock.sendMessage(
							chatId,
							{
								text: quotedMsg[key].caption,
								mentions: mentions,
							},
							{ quoted: msg }
						);
					}
				}
			}
		}

		// Fallback for unsupported message types
		await sock.sendMessage(
			chatId,
			{
				text: "",
				mentions: mentions,
			},
			{ quoted: msg }
		);
	} catch (error) {
		console.error("Error handling quoted message:", error);
		throw error;
	}
};

// Helper function to handle media messages
const handleMediaMessage = async (sock, chatId, msg, mediaContent, mediaKey, mentions) => {
	try {
		// Get quoted message context
		const quotedContext = msg.message?.extendedTextMessage?.contextInfo;

		if (!quotedContext) {
			throw new Error("No quoted context found");
		}

		// Construct the proper message object for download
		const quotedMessage = {
			key: quotedContext.key,
			message: quotedContext.quotedMessage,
		};

		// Validate media exists
		if (!quotedMessage.message || !quotedMessage.key) {
			throw new Error("Invalid quoted message structure");
		}

		// Download media with proper error handling
		let stream;
		try {
			stream = await downloadMediaMessage(quotedMessage, "buffer");
		} catch (downloadError) {
			console.error("Media download failed:", downloadError);
			throw new Error("Media download failed - media may be expired");
		}

		if (!stream || stream.length === 0) {
			throw new Error("Downloaded media is empty or invalid");
		}

		const messageObj = {
			[mediaKey]: stream,
			caption: mediaContent.caption || "",
			mentions: mentions,
		};

		if (mediaKey === "document" && mediaContent.fileName) {
			messageObj.fileName = mediaContent.fileName;
		}
		if (mediaContent.mimetype) {
			messageObj.mimetype = mediaContent.mimetype;
		}

		await sock.sendMessage(chatId, messageObj, { quoted: msg });
	} catch (error) {
		console.error(`Error handling ${mediaKey} message:`, error);

		await sock.sendMessage(
			chatId,
			{
				text: mediaContent.caption || "",
				mentions: mentions,
			},
			{ quoted: msg }
		);
	}
};

const hidetagCooldowns = new Map();
const COOLDOWN_TIME = 30000; // 30 seconds

export const hidetagWithCooldown = async (sock, chatId, msg, arg) => {
	const senderId = msg.key.participant || msg.key.remoteJid;
	const now = Date.now();

	if (hidetagCooldowns.has(senderId)) {
		const lastUsed = hidetagCooldowns.get(senderId);
		const timeLeft = COOLDOWN_TIME - (now - lastUsed);

		if (timeLeft > 0) {
			return await sock.sendMessage(
				chatId,
				{ text: ` Tunggu ${Math.ceil(timeLeft / 1000)} detik sebelum menggunakan hidetag lagi.` },
				{ quoted: msg }
			);
		}
	}

	hidetagCooldowns.set(senderId, now);
	return await hidetag(sock, chatId, msg, arg);
};
// Fungsi tambahan: kick member
export const kick = async (sock, chatId, msg, targetUser) => {
	try {
		// Cek status admin bot
    const isBot = await isBotAdmin(sock, msg, chatId);
		if (!isBot) return;
    const isSenderAdmin = await isUserAdmin(sock, msg, chatId);
    if (!isSenderAdmin) return;

		// Cek status admin pengirim pesan


		// Validasi target user
		if (!targetUser) {
			await sock.sendMessage(
				chatId,
				{
					text: "format salah `.kick @mention`",
				},
				{ quoted: msg }
			);
			return;
		}

		// Normalisasi nomor target
		let targetId;
		if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
			targetId = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
		} else {
			// Jika berupa nomor, format ke WhatsApp ID
			const cleanNumber = targetUser.replace(/\D/g, ""); // Hapus semua non-digit
			targetId = cleanNumber + "@s.whatsapp.net";
		}

		// Kick user dari grup
		await sock.groupParticipantsUpdate(chatId, [targetId], "remove");

		await sock.sendMessage(
			chatId,
			{
				text: `User berhasil di-kick dari grup.`,
			},
			{ quoted: msg }
		);
	} catch (error) {
		console.error("Error saat kick user:", error);
		await sock.sendMessage(
			chatId,
			{
				text: "Gagal kick user. Pastikan user ada di grup dan bot memiliki izin admin.",
			},
			{ quoted: msg }
		);
	}
};

// Fungsi tambahan: promote member menjadi admin
export const promote = async (sock, chatId, msg) => {
	try {
		const metion = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
		const targetUser = metion[0];
		// Cek status admin bot
		const isBot = await isBotAdmin(sock, msg, chatId);
		if (!isBot) return;

		// Cek status admin pengirim pesan
		const isSenderAdmin = await isUserAdmin(sock, msg, chatId);
		if (!isSenderAdmin) return;

		if (!targetUser) {
			await sock.sendMessage(
				chatId,
				{
					text: " Silakan mention atau masukkan nomor user yang ingin dipromote.\nContoh: .promote @user",
				},
				{ quoted: msg }
			);
			return;
		}

		let targetId;
		if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
			targetId = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
		} else {
			const cleanNumber = targetUser.replace(/\D/g, "");
			targetId = cleanNumber + "@s.whatsapp.net";
		}

		await sock.groupParticipantsUpdate(chatId, [targetId], "promote");

		await sock.sendMessage(
			chatId,
			{
				text: `User berhasil dipromote menjadi admin grup.`,
				mentions: [targetId],
			},
			{ quoted: msg }
		);
	} catch (error) {
		console.error("Error saat promote user:", error);
		await sock.sendMessage(
			chatId,
			{
				text: "Gagal promote user. Pastikan user ada di grup dan bot memiliki izin admin.",
			},
			{ quoted: msg }
		);
	}
};

export const demote = async (sock, chatId, msg) => {
	try {
		const metion = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid;
		const targetUser = metion[0];

		const isBot = await isBotAdmin(sock, msg, chatId);
		if (!isBot) return;

		const isSenderAdmin = await isUserAdmin(sock, msg, chatId);
		if (!isSenderAdmin) return sock.sendMessage(chatId, {text: "admin only"}, { quoted: msg});

		if (!targetUser) {
			await sock.sendMessage(
				chatId,
				{
					text: "Silakan mention atau masukkan nomor user yang ingin di-demote.\nContoh: !demote @user atau !demote 628123456789",
				},
				{ quoted: msg }
			);
			return;
		}

		// Normalisasi nomor target
		let targetId;
		if (msg.message?.extendedTextMessage?.contextInfo?.mentionedJid?.length > 0) {
			targetId = msg.message.extendedTextMessage.contextInfo.mentionedJid[0];
		} else {
			const cleanNumber = targetUser.replace(/\D/g, "");
			targetId = cleanNumber + "@s.whatsapp.net";
		}

		// Demote admin menjadi member biasa
		await sock.groupParticipantsUpdate(chatId, [targetId], "demote");

		await sock.sendMessage(
			chatId,
			{
				text: `Admin berhasil di-demote menjadi member biasa.`,
				mentions: [targetId],
			},
			{ quoted: msg }
		);
	} catch (error) {
		console.error("Error saat demote user:", error);
		await sock.sendMessage(
			chatId,
			{
				text: "Gagal demote user. Pastikan user adalah admin dan bot memiliki izin yang cukup.",
			},
			{ quoted: msg }
		);
	}
};

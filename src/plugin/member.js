import { getUserData, saveUserData } from "../config/config.js";
import { isUserAdmin } from "../model/admin.js";

const dbPath = path.resolve("db", "grubmem.json");

export const setMember = async (sock, chatId, msg, role, ign) => {
  try {
    // hanya admin yang boleh tambah member
    if (!isUserAdmin(sock, msg, chatId)) {
      await sock.sendMessage(chatId, {
        text: "❌ Hanya admin yang bisa menggunakan perintah ini!",
      });
      return;
    }

    let data = getUserData(dbPath) || [];

    // ambil mention dari pesan admin
    const mentioned = msg.message?.extendedTextMessage?.contextInfo?.mentionedJid || [];
    if (mentioned.length === 0) {
      await sock.sendMessage(chatId, {
        text: "❌ Harap mention user yang mau ditambahkan!",
      });
      return;
    }

    const target = mentioned[0]; // user yang ditambahkan

    // validasi input role & ign
    if (!role || !ign) {
      await sock.sendMessage(chatId, {
        text: "❌ Harap sertakan *Role* dan *IGN*!",
      });
      return;
    }

    // cari grub berdasarkan chatId
    let dataEntry = data.find((item) => item.grubId === chatId);

    if (!dataEntry) {
      const newData = {
        grubId: chatId,
        member: [],
      };

      newData.member.push({
        role,
        ign,
        owner: target, // simpan pemilik akun dari mention
      });

      data.push(newData);
      saveUserData(dbPath, data);
    } else {
      // cek duplicate member
      const exists = dataEntry.member.find((m) => m.owner === target);
      if (exists) {
        await sock.sendMessage(chatId, {
          text: ` @${target.split("@")[0]} sudah terdaftar sebagai member.`,
          mentions: [target],
        });
        return;
      }

      dataEntry.member.push({
        role,
        ign,
        owner: target,
      });
      saveUserData(dbPath, data);
    }

    // balasan bot mention target
    await sock.sendMessage(chatId, {
      text: ` @${target.split("@")[0]} berhasil ditambahkan!\nRole: *${role}*\nIGN: *${ign}*`,
      mentions: [target],
    });
  } catch (err) {
  //  errMessage(sock, chatId, msg, err);
  }
};

export const getMember = async (sock, chatId, msg) => {
  try {
    let data = getUserData(dbPath) || [];

    // cari grub berdasarkan chatId
    const dataEntry = data.find((item) => item.grubId === chatId);

    if (!dataEntry || dataEntry.member.length === 0) {
      await sock.sendMessage(chatId, {
        text: "❌ Belum ada member yang terdaftar di grup ini.",
      });
      return;
    }

    // bikin daftar member
    let textMsg = "*📋 Daftar Member Grup:*\n\n";
    const mentions = [];

    dataEntry.member.forEach((m, i) => {
      textMsg += `${i + 1}. IGN: *${m.ign}*\n   Role: *${m.role}*\n   Owner: @${m.owner.split("@")[0]}\n\n`;
      mentions.push(m.owner);
    });

    await sock.sendMessage(chatId, {
      text: textMsg.trim(),
      mentions,
    });
  } catch (err) {
//    errMessage(sock, chatId, msg, err);
  }
};

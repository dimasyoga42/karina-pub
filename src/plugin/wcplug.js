import { getUserData, saveUserData } from "../config/config.js";
import path from "path";
import { isUserAdmin } from "../model/admin.js";

const db = path.resolve("db", "welcome.js");

export const setWelcome = async (sock, chatId, msg, welcomeMsg) => {
  try {
    const isAdmin = await isUserAdmin(sock, msg, chatId);
    if (!isAdmin) return

    const data = getUserData(db);
    const grubId = msg.key.remoteJid;
    const name = msg.pushName;

    if (!welcomeMsg) {
      return sock.sendMessage(chatId, {
        text: "Format salah\nCara penggunaan:\n- `.setwelcome <pesan welcome>`\n\nGunakan variabel:\n- @user = mention user baru\n- @group = nama grup"
      });
    }

    let eWelcome = data.find((i) => i.grubId === grubId);

    if (!eWelcome) {
      // Jika welcome belum ada, buat data baru
      const newData = {
        grubId,
        welcomeMsg,
        isActive: true,
        createdBy: name,
        createdAt: new Date().toISOString()
      };
      data.push(newData);
      saveUserData(db, data);
      return sock.sendMessage(
        chatId,
        { text: " Pesan welcome berhasil diatur!" },
        { quoted: msg }
      );
    }

    // Jika welcome sudah ada, update pesan
    eWelcome.welcomeMsg = welcomeMsg;
    eWelcome.updatedBy = name;
    eWelcome.updatedAt = new Date().toISOString();
    saveUserData(db, data);

    return sock.sendMessage(
      chatId,
      { text: " Pesan welcome berhasil diperbarui!" },
      { quoted: msg }
    );

  } catch (err) {
    console.error("Error in setWelcome:", err);
    sock.sendMessage(chatId, {
      text: `Terjadi kesalahan: ${err.message}`
    });
  }
};

// Fungsi untuk toggle welcome on/off
export const toggleWelcome = async (sock, chatId, msg, status) => {
  try {
    const isAdmin = await isUserAdmin(sock, msg, chatId);
    if (!isAdmin) return;

    const data = getUserData(db);
    const grubId = msg.key.remoteJid;

    let eWelcome = data.find((i) => i.grubId === grubId);

    if (!eWelcome) {
      return sock.sendMessage(chatId, {
        text: " Belum ada pesan welcome yang diatur.\nGunakan `.setwelcome <pesan>` terlebih dahulu"
      });
    }

    const newStatus = status === "on" || status === "1" || status === "true";
    eWelcome.isActive = newStatus;
    saveUserData(db, data);

    return sock.sendMessage(chatId, {
      text: ` Welcome ${newStatus ? "diaktifkan" : "dinonaktifkan"}`
    });

  } catch (err) {
    console.error("Error in toggleWelcome:", err);
    sock.sendMessage(chatId, {
      text: ` Terjadi kesalahan: ${err.message}`
    });
  }
};

// Fungsi untuk menampilkan welcome message saat ada member baru
export const sendWelcome = async (sock, groupMetadata, newMembers) => {
  try {
    const data = getUserData(db);
    const grubId = groupMetadata.id;

    let eWelcome = data.find((i) => i.grubId === grubId);

    if (!eWelcome || !eWelcome.isActive) return;

    for (const member of newMembers) {
      let welcomeText = eWelcome.welcomeMsg;

      // Replace variabel
      welcomeText = welcomeText.replace(/@user/g, `@${member.split("@")[0]}`);
      welcomeText = welcomeText.replace(/@group/g, groupMetadata.subject);

      await sock.sendMessage(grubId, {
        text: welcomeText,
        mentions: [member]
      });
    }

  } catch (err) {
    console.error("Error in sendWelcome:", err);
  }
};

// Fungsi untuk melihat welcome message yang sudah diatur
export const getWelcome = async (sock, chatId, msg) => {
  try {
    const data = getUserData(db);
    const grubId = msg.key.remoteJid;

    let eWelcome = data.find((i) => i.grubId === grubId);

    if (!eWelcome) {
      return sock.sendMessage(chatId, {
        text: "Belum ada pesan welcome yang diatur"
      });
    }

    const status = eWelcome.isActive ? " Aktif" : "Nonaktif";
    const message = `*Welcome Message*\n\nStatus: ${status}\n\nPesan:\n${eWelcome.welcomeMsg}\n\n_Dibuat oleh: ${eWelcome.createdBy}_`;

    return sock.sendMessage(chatId, { text: message });

  } catch (err) {
    console.error("Error in getWelcome:", err);
    sock.sendMessage(chatId, {
      text: `❌ Terjadi kesalahan: ${err.message}`
    });
  }
};

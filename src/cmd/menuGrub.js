import { getItems } from "../plugin/itemsplug.js";
import { screper } from "../plugin/lvlplug.js";
import { menu } from "../plugin/menuplug.js";
import { cekBio, cekProfile, myBio, myProfile, setDesc, setPP } from "../plugin/plugprofil.js";
import { rules } from "../plugin/rulesplug.js";

export const cmdGrub = async (sock, text, chatId, msg) => {
  try {
    // Validasi input - PENTING untuk menghindari error
    if (!text || typeof text !== 'string') {
      console.error("Invalid text parameter:", typeof text, text);
      return;
    }

    // Normalisasi text (trim whitespace)
    const normalizedText = text.trim().toLowerCase();

    // Menu
    if (normalizedText === '.menu') {
      await menu(sock, chatId, msg);
      return;
    }

    // Set Profile Picture
    if (normalizedText === '.setpp') {
      await setPP(sock, chatId, msg);
      return;
    }

    // Set Bio/Description
    if (normalizedText.startsWith(".setbio")) {
      const bioText = text.replace(/^\.setbio\s*/i, "").trim();
      if (!bioText) {
        await sock.sendMessage(chatId, {
          text: "❌ Format salah!\nPenggunaan: `.setbio <bio baru>`"
        }, { quoted: msg });
        return;
      }
      await setDesc(sock, chatId, msg, bioText);
      return;
    }

    // Get Items
    if (normalizedText.startsWith(".item")) {
      const name = text.replace(/^\.item\s*/i, "").trim();
      if (!name) {
        await sock.sendMessage(chatId, {
          text: "❌ Format salah!\nPenggunaan: `.item <nama item>`"
        }, { quoted: msg });
        return;
      }
      await getItems(sock, chatId, msg, name);
      return;
    }

    // Level
    if (normalizedText.startsWith(".lv")) {
      const level = text.replace(/^\.lv\s*/i, "").trim();
      if (!level) {
        await sock.sendMessage(chatId, {
          text: "❌ Format salah!\nPenggunaan: `.lv <level>`"
        }, { quoted: msg });
        return;
      }
      await screper(sock, chatId, msg, level, 7);
      return;
    }

    // Rules
    if (normalizedText === '.rules') {
      await rules(sock, chatId, msg);
      return;
    }

    // My Bio
    if (normalizedText === '.mybio') {
      await myBio(sock, chatId, msg);
      return;
    }

    // Cek Bio (dengan mention)
    if (normalizedText === '.cekbio' || normalizedText.startsWith('.cekbio ')) {
      await cekBio(sock, chatId, msg);
      return;
    }

    // My Profile
    if (normalizedText === '.profile' || normalizedText === '.myprofile') {
      await myProfile(sock, chatId, msg);
      return;
    }

    // Cek Profile (dengan mention)
    if (normalizedText === '.cekprofile' || normalizedText.startsWith('.cekprofile ')) {
      await cekProfile(sock, chatId, msg);
      return;
    }

  } catch (error) {
    console.error("Error in cmdGrub:", error);
    await sock.sendMessage(chatId, {
      text: `❌ Terjadi kesalahan: ${error.message}`
    }, { quoted: msg });
  }
};

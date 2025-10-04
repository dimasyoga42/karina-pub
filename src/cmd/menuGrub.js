
import { getItems } from "../plugin/itemsplug.js";
import { screper } from "../plugin/lvlplug.js";
import { menu } from "../plugin/menuplug.js";
import { cekBio, cekProfile, myBio, myProfile, setDesc, setPP } from "../plugin/plugprofil.js";
import { rules } from "../plugin/rulesplug.js";

export const cmdGrub = async (sock, text, chatId, msg) => {
  // Normalisasi text (trim whitespace)
  const normalizedText = text.trim();

  // Set Profile Picture
  if (normalizedText === '.setpp') {
    await setPP(sock, chatId, msg);
    return;
  }

  // Set Bio/Description
  if (normalizedText.startsWith(".setbio")) {
    const bioText = normalizedText.replace(".setbio", "").trim();
    await setDesc(sock, chatId, msg, bioText);
    return;
  }
  if (normalizedText.startsWith(".item")) {
    const name = normalizedText.replace(".item", "").trim();
    await getItems(sock, chatId, msg, name);
    return;
  }
  if (normalizedText.startsWith(".lv")) {
    const name = normalizedText.replace(".lv", "").trim();
    await screper(sock, chatId, msg, name, 7);
    return;
  }
  if (normalizedText.startsWith(".menu")) {
    await menu(sock, chatId, msg)
    return;
  }
  // My Bio
  if (normalizedText === '.mybio') {
    await myBio(sock, chatId, msg);
    return;
  }
  if (normalizedText === '.rules') {
    await rules(sock, chatId, msg);
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
};

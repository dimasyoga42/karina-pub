import fs from "fs";
import path from "path";
import axios from "axios";
// Pastikan direktori file tujuan ada
const ensureDir = (dbPath) => {
  const dir = path.dirname(dbPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
};

// Ambil data dari file
export function getUserData(path) {
  try {
    const data = fs.readFileSync(path, "utf-8");
    return JSON.parse(data);
  } catch (err) {
    console.error("Gagal membaca file:", err);
    return [];
  }
}

// Simpan data ke file
export const saveUserData = (dbPath, data) => {
  try {
    ensureDir(dbPath);
    fs.writeFileSync(dbPath, JSON.stringify(data, null, 2));
  } catch (err) {
    console.error(`Error writing to ${dbPath}:`, err);
  }
};

export const Getaxios = async (link) => {
  try {
    const { data } = await axios.get(link);
    return data;
  } catch (error) {
    console.error(`[❌] GET ${link} failed:`, error?.message || error);
    throw error;
  }
};

export const saran = async (s, c, m, arg) => {
  try {
    if(!arg) {
      s.sendMessage(c, {text: "masukan saran anda setelah `.saran`"}, {quoted: m});
      return
    }
    const senderName = m.pushName;
    const template = `
    *KOTAK SARAN*\nNama Pengirim : ${senderName}\n Saran: ${arg}
    `
    s.sendMessage(6285789109095, {text: template })
    s.sendMessage(c, {text: template }, {quoted: m})
  } catch (err) {
    s.sendMessage(c, {text: `err message: ${err}`}, {quoted: m});
  }
}

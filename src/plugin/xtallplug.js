import { Getaxios } from "../config/config.js";

const API_BASE_URL = "https://toramonline.vercel.app";

export const getXtall = async (sock, chatId, msg, name) => {
  try {
    const { data } = await Getaxios(`${API_BASE_URL}/xtall/name/${encodeURIComponent(name)}`);

    // Ambil array xtall dari data.data
    const xtalls = data.data || [];

    if (!Array.isArray(xtalls) || xtalls.length === 0) {
      return sock.sendMessage(chatId, { text: `❌ Xtall "${name}" tidak ditemukan!` });
    }

    const searchHeader = `*Hasil Pencarian untuk "${name}":*\n`;

    const xtallsInfo = xtalls
      .slice(0, 5)
      .map((xtall) => {
        const upgradeInfo = xtall.upgrade ?? "-";
        const statList = xtall.stat
          ? xtall.stat.split(";").map((s) => s.trim()).join("\n- ")
          : "-";

        return `
━━━━━━━━━━━━━━━━━━━━
*Nama* : ${xtall.name}
*Tipe* : ${xtall.type}
*Upgrade* : ${upgradeInfo}
*Stat* :
- ${statList}`.trim();
      })
      .join("\n");

    let footer = "\n━━━━━━━━━━━━━━━━━━━━";
    if (xtalls.length > 5) {
      footer += `\n\n*Menampilkan 5 dari ${xtalls.length} hasil yang ditemukan.*`;
    }

    const finalMessage = searchHeader + xtallsInfo + footer;
    await sock.sendMessage(chatId, { text: finalMessage.trim() });

  } catch (error) {
    console.error("Terjadi kesalahan saat mengambil data Xtall:", error.message);
    if (error.response) {
      console.error("Data Respons Error:", error.response.data);
      console.error("Status Kode:", error.response.status);
    }
    await sock.sendMessage(chatId, {
      text: "❌ Terjadi kesalahan pada sistem saat mencoba mengambil data dari API.",
    });
  }
};

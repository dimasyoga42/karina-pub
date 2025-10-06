import axios from "axios";

export const getXtall = async (sock, chatId, msg, name) => {
  try {
    const res = await axios.get(`https://toramonline.vercel.app/xtall/name/${name}`);
    const data = res.data.data; // ✅ ambil array dari field "data"

    if (!Array.isArray(data) || data.length === 0) {
      return sock.sendMessage(chatId, { text: "❌ Xtall tidak ditemukan!" });
    }

    // Gabungkan semua xtall jadi satu string
    const combinedCaption = data
      .map((xtall) => {
        return `
━━━━━━━━━━━━━━━━━━━━
Name   : ${xtall.name}
Type   : ${xtall.type}
Upgrade: ${xtall.upgrade || "-"}
Stat   :
${xtall.stat}`;
      })
      .join("\n");

    const finalMessage = `${combinedCaption}\n━━━━━━━━━━━━━━━━━━━━`.trim();

    await sock.sendMessage(chatId, { text: finalMessage });
  } catch (error) {
    console.error("Error fetching xtall:", error.message);
    if (error.response) {
      console.error("Status:", error.response.status, "Data:", error.response.data);
    }
    await sock.sendMessage(chatId, { text: "❌ Gagal mengambil data dari REST API." });
  }
};

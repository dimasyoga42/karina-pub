import { Getaxios } from "../config/config.js";

export const getXtall = async (sock, chatId, msg, name) => {
    try {
        const res = await Getaxios (`https://toramonline.vercel.app/xtall/name/${encodeURIComponent(name)}`);
        const data = res.data;


        if (!Array.isArray(data) || data.length === 0) {
            return sock.sendMessage(chatId, { text: "Xtall tidak ditemukan!" });
        }

        // Gabungkan semua xtall jadi satu string
        const combinedCaption = data
            .map((xtall, index) => {
                return `
━━━━━━━━━━━━━━━━━━━━
 Name   : ${xtall.name}
 Type   : ${xtall.type}
 Upgrade: ${xtall.upgrade || "-"}
 Stat   :\n${xtall.stat}`;
            })
            .join("\n");

        const finalMessage = `${combinedCaption}\n━━━━━━━━━━━━━━━━━━━━`.trim();

        await sock.sendMessage(chatId, { text: finalMessage });
    } catch (error) {
        console.error("Error fetching xtall:", error.message);
        sock.sendMessage(chatId, { text: "❌ Gagal mengambil data dari REST API." });
    }
};

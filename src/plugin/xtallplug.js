import { Getaxios } from "../config/config.js";

// Sebaiknya definisikan URL dasar API di satu tempat untuk kemudahan pengelolaan
const API_BASE_URL = "https://toramonline.vercel.app";


export const getXtall = async (sock, chatId, msg, name) => {
    try {

        const { data } = await Getaxios(`${API_BASE_URL}/xtall/name/${encodeURIComponent(name)}`);
        if(!data) return sock.sendMessage(chatId, {text: "tidak ada"})

        const searchHeader = `*Hasil Pencarian untuk "${name}":*\n`;


        const xtallsInfo = data
            .slice(0, 5)
            .map(xtall => {

                const upgradeInfo = xtall.upgrade ?? "-";
                return `
━━━━━━━━━━━━━━━━━━━━
*Nama* : ${xtall.name}
*Tipe* : ${xtall.type}
*Upgrade* : ${upgradeInfo}
*Stat* :
${xtall.stat.split(/[;,]/).map(s => s.trim()).join("\n- ")}`.trim();
            })
            .join("\n");

        // Menambahkan catatan jika hasil yang ditampilkan lebih sedikit dari total hasil
        let footer = "\n━━━━━━━━━━━━━━━━━━━━";
        if (data.length > 5) {
            footer += `\n\n*Menampilkan 5 dari ${data.length} hasil yang ditemukan.*`;
        }

        // Menggabungkan semua bagian menjadi satu pesan akhir
        const finalMessage = searchHeader + xtallsInfo + footer;

        await sock.sendMessage(chatId, { text: finalMessage.trim() });

    } catch (error) {
        // Penanganan error yang lebih informatif di sisi developer
        console.error("Terjadi kesalahan saat mengambil data Xtall:", error.message);

        // Memberikan detail tambahan jika ini adalah error dari API (misal: 404, 500)
        if (error.response) {
            console.error("Data Respons Error:", error.response.data);
            console.error("Status Kode:", error.response.status);
        }

        await sock.sendMessage(chatId, { text: "❌ Terjadi kesalahan pada sistem saat mencoba mengambil data dari API." });
    }
};

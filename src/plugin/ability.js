import { Getaxios } from "../config/config.js";
export const ability = async (sock, chatId, msg, name) => {
  try {
    // Validasi input name
    if (!name || name.trim() === '') {
      await sock.sendMessage(chatId, {
        text: "Nama ability tidak boleh kosong!\n\nContoh: !ability flinch"
      });
      return;
    }

    // Normalize name untuk pencarian yang lebih fleksibel
    const normalizedName = name.toLowerCase().trim();

    const res = await Getaxios(`https://toramonline.vercel.app/ability/${normalizedName}`);
    console.log('API Response:', res);

    const data = res.data;

    // Cek apakah data kosong
    if (!data || data.length === 0) {
      await sock.sendMessage(chatId, {
        text: ` Ability "${name}" tidak ditemukan!\nSilakan cek kembali nama ability yang Anda cari.`
      });
      return;
    }

    // Format pesan dengan emoji dan struktur yang lebih rapi
    const combinedCaption = data
      .map((ability, index) => {
        // Tambahkan emoji berdasarkan tier
        const tierEmoji = {
          'I': '🟨',
          'II': '🟩',
          'III': '🔵',
          'IV': '🟣',
          'V': '🟠',
          'Transfer': '✨'
        };

        return `
━━━━━━━━━━━━━━━━━━━━
 ${tierEmoji[ability.tier]} *${ability.name}*
 *Stat Effect:*
 ${ability.stat_effect}
 *Tier:* ${ability.tier}
 🇮🇩 *Stat ID:*
 ${ability.stat_id.replace(/_/g, ' ')}
━━━━━━━━━━━━━━━━━━━━`;
      })
      .join("\n");

    // Header dan footer yang lebih menarik
    const header = ` *TORAM ABILITY DATABASE* \n Hasil pencarian: "${name}"\n Ditemukan: ${data.length} ability\n`;
    const footer = `\n━━━━━━━━━━━━━━━━━━━━\n Gunakan: .ability <nama> untuk mencari ability lain`;

    const finalMessage = `${header}${combinedCaption}${footer}`.trim();

    await sock.sendMessage(chatId, { text: finalMessage });

  } catch (err) {
    console.error('Error in ability function:', err);

    // Error handling yang lebih spesifik
    if (err.response) {
      // API mengembalikan error response
      const statusCode = err.response.status;
      let errorMsg = " Terjadi kesalahan saat mengambil data ability.";

      switch (statusCode) {
        case 404:
          errorMsg = ` Ability "${name}" tidak ditemukan!\n\nPastikan nama ability sudah benar.`;
          break;
        case 500:
          errorMsg = " Server sedang bermasalah. Silakan coba lagi nanti.";
          break;
        case 429:
          errorMsg = " Terlalu banyak permintaan. Silakan tunggu sebentar.";
          break;
        default:
          errorMsg = ` Error ${statusCode}: ${err.response.data?.message || 'Unknown error'}`;
      }

      await sock.sendMessage(chatId, { text: errorMsg });
    } else if (err.request) {
      // Network error
      await sock.sendMessage(chatId, {
        text: "Tidak dapat terhubung ke server. Periksa koneksi internet Anda."
      });
    } else {
      // Generic error fallback
    }
  }
};

// Fungsi helper untuk pencarian ability berdasarkan tier
export const abilityByTier = async (sock, chatId, msg, tier) => {
  try {
    if (!tier) {
      await sock.sendMessage(chatId, {
        text: "Tier tidak valid!"
      });
      return;
    }

    const res = await Getaxios(`${process.env.BASE_URL_ABILITY}/tier/${tier.toUpperCase()}`);
    const data = res.data;

    if (!data || data.length === 0) {
      await sock.sendMessage(chatId, {
        text: `Tidak ada ability ditemukan untuk tier ${tier.toUpperCase()}`
      });
      return;
    }

    // Batasi hasil maksimal 10 untuk menghindari spam
    const limitedData = data.slice(0, 10);
    const hasMore = data.length > 10;

    const combinedCaption = limitedData
      .map((ability, index) => {
        return `${index + 1}. **${ability.name}** - ${ability.stat_effect.substring(0, 50)}${ability.stat_effect.length > 50 ? '...' : ''}`;
      })
      .join("\n");

    const header = ` *TIER ${tier.toUpperCase()} ABILITIES* \nTotal: ${data.length} abilities\n${hasMore ? `Menampilkan 10 pertama dari ${data.length} abilities\n` : ''}\n`;
    const footer = `\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\nGunakan: .ability <nama> untuk detail lengkap`;

    const finalMessage = `${header}${combinedCaption}${footer}`.trim();

    await sock.sendMessage(chatId, { text: finalMessage });

  } catch (err) {
    console.error('Error in abilityByTier function:', err);

  }
};

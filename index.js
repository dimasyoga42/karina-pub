
import pkg from "@whiskeysockets/baileys";
import {
  makeWASocket,
  useMultiFileAuthState,
  fetchLatestBaileysVersion,
  DisconnectReason,
  downloadMediaMessage,
} from "@whiskeysockets/baileys";
import qrcode from "qrcode-terminal";
import { adminMenu } from "./src/cmd/menuAdmin.js";
import { cmdGrub } from "./src/cmd/menuGrub.js";
import { sendWelcome } from "./src/plugin/wcplug.js";
async function start() {
  const { state, saveCreds } = await useMultiFileAuthState("./auth_info");
  const { version } = await fetchLatestBaileysVersion();
  const sock = makeWASocket({
    version,
    auth: state,
  });

  sock.ev.on("creds.update", saveCreds);
  sock.ev.on("connection.update", ({ connection, lastDisconnect, qr }) => {
    try {
      if (qr) {
        qrcode.generate(qr, { small: true });
        console.log("📲 Scan QR code di atas untuk login");
      }

      if (connection === "close") {
        const shouldReconnect =
          lastDisconnect?.error?.output?.statusCode !== DisconnectReason.loggedOut;
        console.log("❌ Koneksi terputus. Reconnect?", shouldReconnect);

        if (shouldReconnect) {
          console.log("🔄 Mencoba menghubungkan kembali dalam 5 detik...");
          setTimeout(start, 5000);
        } else {
          console.log("🛑 Logout terdeteksi. Hapus folder auth_info untuk login ulang.");
        }
      } else if (connection === "open") {
        console.log("✅ Bot WhatsApp berhasil terhubung!");
      }
    } catch (error) {
      console.error("Connection error:", error);
      setTimeout(start, 5000);
    }
  });
  sock.ev.on("messages.upsert", async ({ messages }) => {
    const msg = messages[0];
    const chatId = msg.key.remoteJid;
     const text = msg.message?.conversation
          || msg.message?.extendedTextMessage?.text
          || "";

    if (!chatId?.endsWith("@g.us")) return;
    sock.ev.on("group-participants.update", async (mess) => {
      if(mess.action == "add") {
        const groupMetadata = await sock.groupMetadata(mess.id);
       return  sendWelcome(sock, groupMetadata, mess.participants)
      }
    })
    adminMenu(text, sock, chatId, msg)
    cmdGrub(sock, text, chatId, msg)
  })
}
async function startWithRetry() {
  try {
    await start();
  } catch (error) {
    console.error("Fatal error:", error);
    console.log("🔄 Restarting bot in 10 seconds...");
    setTimeout(startWithRetry, 10000);
  }
}

startWithRetry();

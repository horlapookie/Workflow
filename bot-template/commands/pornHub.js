import { horla } from '../lib/horla.js';
import mumaker from 'mumaker';

const neon = horla({
  nomCom: "pornhub",
  categorie: "Logo",
  reaction: "🌈"
}, async (msg, { sock, args }) => {
  const from = msg.key.remoteJid;
  const userName = msg.pushName || "User";

  if (!args || args.length === 0) {
    await sock.sendMessage(from, {
      text: `*Example, ${userName}: * ?pornhub text`
    }, { quoted: msg });
    return;
  }

  try {
    await sock.sendMessage(from, {
      text: "*Processing...*"
    }, { quoted: msg });

    const text = Array.isArray(args) ? args.join(' ') : args.toString();
    let anu = await mumaker.textpro("https://en.ephoto360.com/create-pornhub-style-logos-online-free-549.html", text);

    await sock.sendMessage(from, {
      image: { url: anu.image },
      caption: "*Logo by HORLA POOKIE*"
    }, { quoted: msg });
  } catch (e) {
    await sock.sendMessage(from, {
      text: "🥵🥵 " + e.message
    }, { quoted: msg });
  }
});

export default pornhub;

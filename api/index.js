export default async function handler(req, res) {
  const token = process.env.BOT_TOKEN;

  if (!token) {
    return res.status(500).send("BOT_TOKEN isi bos");
  }

  if (req.method !== "POST") {
    return res.status(200).send("Bot aktif 🚀");
  }

  const body = req.body;
  const msg = body.message;

  if (!msg) return res.status(200).send("ok");

  const chatId = msg.chat.id;
  const text = msg.text || "";

  const USERS_FILE = "/tmp/users.json";

  const LIMIT = 50;
  const ADMIN = ["6188518059", "610693541"];

  const loadUsers = () => {
    try {
      if (!global.users) global.users = {};
      return global.users;
    } catch {
      return {};
    }
  };

  const saveUsers = (u) => {
    global.users = u;
  };

  let users = loadUsers();

  // AUTO USER
  if (!users[chatId]) {
    users[chatId] = {
      quota: LIMIT,
      expired: Date.now() + 30 * 24 * 60 * 60 * 1000
    };
    saveUsers(users);
  }

  const send = async (text) => {
    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, text })
    });
  };

  const edit = async (message_id, text) => {
    await fetch(`https://api.telegram.org/bot${token}/editMessageText`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ chat_id: chatId, message_id, text })
    });
  };

  // ================= START =================
  if (text === "/start") {
    return send("Bot aktif 🚀");
  }

  if (text === "/ping") {
    return send("pong 🏓");
  }

  // ================= KUOTA =================
  if (text === "/kuota") {
    return send(`KUOTA: ${users[chatId].quota}/${LIMIT}`);
  }

  // ================= ADMIN =================
  if (text === "/admin") {
    if (!ADMIN.includes(String(chatId))) return send("No access");

    return send(
      "/adduser <id>\n/kick <id>\n/listuser"
    );
  }

  // ================= ADD USER =================
  if (text.startsWith("/adduser")) {
    if (!ADMIN.includes(String(chatId))) return;

    const id = text.split(" ")[1];
    users[id] = { quota: LIMIT, expired: Date.now() + 30 * 86400000 };
    saveUsers(users);

    return send("User ditambah");
  }

  // ================= KICK =================
  if (text.startsWith("/kick")) {
    if (!ADMIN.includes(String(chatId))) return;

    const id = text.split(" ")[1];
    delete users[id];
    saveUsers(users);

    return send("User dihapus");
  }

  // ================= LIST USER =================
  if (text === "/listuser") {
    if (!ADMIN.includes(String(chatId))) return;

    let out = "USER LIST\n";
    for (const id in users) {
      out += `${id} | ${users[id].quota}\n`;
    }
    return send(out);
  }

  // ================= SBN API =================
  if (text.startsWith("/sbn")) {
    const nik = (text.split(" ")[1] || "").replace(/\D/g, "");

    if (!nik) return send("Format /sbn <nik>");

    const loading = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        chat_id: chatId,
        text: "PROSES..."
      })
    });

    const loadData = await loading.json();
    const messageId = loadData.result.message_id;

    try {
      const r = await fetch(`http://server.barekt.my.id:8051/sbn?q=${nik}`);
      const j = await r.json();

      const d = j?.[0];

      if (!d) {
        return edit(messageId, "DATA TIDAK DITEMUKAN");
      }

      users[chatId].quota -= 1;
      saveUsers(users);

      const out =
`NIK: ${d.nik}
KK: ${d.kk}
NAMA: ${d.nama}
JK: ${d.jenis_kelamin}
TTL: ${d.ttl}
STATUS: ${d.status_kawin}
PEKERJAAN: ${d.pekerjaan}
ALAMAT: ${d.alamat}
RT: ${d.rt}
KEL: ${d.kelurahan}
KEC: ${d.kecamatan}
KOTA: ${d.kota}
PROV: ${d.provinsi}
STATUS: ${d.status}`;

      return edit(messageId, out);
    } catch {
      return edit(messageId, "ERROR API");
    }
  }

  // ================= DEFAULT =================
  if (text.startsWith("/")) {
    return send("Perintah tidak dikenal");
  }

  return res.status(200).send("ok");
}

/*
export default async function handler(req, res) {
  const token = process.env.BOT_TOKEN;

  if (!token) {
    return res.status(500).send("BOT_TOKEN isi bos");
  }

  if (req.method !== "POST") {
    return res.status(200).send("Bot aktif 🚀");
  }

  const body = req.body;

  const chatId = body.message?.chat?.id;
  const text = body.message?.text;

  if (chatId && text) {
    let reply = "Perintah tidak dikenal";

    if (text === "/start") {
      reply = "Bot aktif 🚀";
    } else if (text === "/ping") {
      reply = "pong 🏓";
    }

    await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: reply
      })
    });
  }

  return res.status(200).send("ok");
}
*/

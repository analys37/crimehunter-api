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

export default async function handler(req, res) {
  const { messages, systemPrompt } = req.body;

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
      },
      body: JSON.stringify({
        model: "gpt-4o-mini",
        messages: [
          { role: "system", content: systemPrompt },
          ...messages
        ]
      })
    });

    const data = await response.json();

    // Retorna tudo para debug
    res.status(200).json({
      reply: data.choices?.[0]?.message?.content || "",
      debug: data
    });

  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}

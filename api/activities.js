export default async function handler(req, res) {
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
          {
            role: "user",
            content: "Crie uma atividade curta de inglês nível B1 com 3 perguntas e respostas."
          }
        ]
      })
    });

    const data = await response.json();

    const activity = data?.choices?.[0]?.message?.content || "Erro ao gerar atividade";

    res.status(200).json({ activity });

  } catch (error) {
    res.status(500).json({ error: "Erro ao conectar com a IA" });
  }
}

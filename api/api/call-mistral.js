export default async function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Only POST requests allowed" });
  }

  const { prompt, model = "mistral-small-latest" } = req.body;

  try {
    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${process.env.MISTRAL_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: model,
        messages: [{ role: "user", content: prompt }],
        temperature: 0.7
      })
    });

    const data = await response.json();
    if (!response.ok) throw new Error(data.error?.message || "Mistral API error");

    res.status(200).json({ reply: data.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

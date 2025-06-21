const fetch = require("node-fetch");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  let body = req.body;
  if (typeof body === "string") {
    body = JSON.parse(body);
  }

  const { description, targetAudience, platform } = body;

  if (!description || !targetAudience || !platform) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  // 1. Generate text content
  const chatResponse = await fetch("https://api.openai.com/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      model: "gpt-3.5-turbo",
      messages: [
        { role: "system", content: "You are a social media ad copywriter." },
        { role: "user", content: `Write a catchy social media post for: ${description}. Target audience: ${targetAudience}. Platform: ${platform}.` }
      ],
      max_tokens: 100
    })
  });

  const chatData = await chatResponse.json();
  const post = chatData.choices?.[0]?.message?.content?.trim() || "Failed to generate post.";

  // 2. Generate image
  const imageResponse = await fetch("https://api.openai.com/v1/images/generations", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${process.env.OPENAI_API_KEY}`
    },
    body: JSON.stringify({
      prompt: `${description}, for ${platform}, targeting ${targetAudience}`,
      n: 1,
      size: "1024x1024"
    })
  });

  const imageData = await imageResponse.json();
  const imageUrl = imageData.data?.[0]?.url || null;

  res.status(200).json({ post, image: imageUrl });
};

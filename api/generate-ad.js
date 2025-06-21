const { OpenAIApi, Configuration } = require("openai");

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  let body = req.body;
  // If body is a string, parse it (Vercel sometimes sends as string)
  if (typeof body === "string") {
    body = JSON.parse(body);
  }

  const { description, targetAudience, platform } = body;

  if (!description || !targetAudience || !platform) {
    res.status(400).json({ error: "Missing required fields" });
    return;
  }

  const openai = new OpenAIApi(new Configuration({ apiKey: process.env.OPENAI_API_KEY }));

  // 1. Generate ad post/caption
  const gptResponse = await openai.createChatCompletion({
    model: "gpt-4",
    messages: [
      { role: "system", content: "You are a social media ad copywriter." },
      { role: "user", content: `Write a catchy social media post for: ${description}. Target audience: ${targetAudience}. Platform: ${platform}.` }
    ],
    max_tokens: 100
  });
  const post = gptResponse.data.choices[0].message.content;

  // 2. Generate image
  const imageResponse = await openai.createImage({
    prompt: `${description}, for ${platform}, targeting ${targetAudience}`,
    n: 1,
    size: "1024x1024"
  });
  const imageUrl = imageResponse.data.data[0].url;

  res.status(200).json({ post, image: imageUrl });
};

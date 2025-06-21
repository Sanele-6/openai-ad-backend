const OpenAI = require("openai");

const openai = new OpenAI(process.env.OPENAI_API_KEY);

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

  // 1. Generate ad post/caption
  const gptResponse = await openai.complete({
    engine: "davinci",
    prompt: `Write a catchy social media post for: ${description}. Target audience: ${targetAudience}. Platform: ${platform}.`,
    maxTokens: 100,
    n: 1,
    stop: null,
    temperature: 0.7,
  });
  const post = gptResponse.data.choices[0].text.trim();

  // 2. Generate image (DALL·E 2, v3 not supported in v3 SDK)
  const imageResponse = await openai.createImage({
    prompt: `${description}, for ${platform}, targeting ${targetAudience}`,
    n: 1,
    size: "1024x1024"
  });
  const imageUrl = imageResponse.data.data[0].url;

  res.status(200).json({ post, image: imageUrl });
};

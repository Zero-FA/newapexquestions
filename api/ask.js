const fs = require("fs");
const path = require("path");
const OpenAI = require("openai");

function loadFaqs() {
  const faqDir = path.join(process.cwd(), "faqs");

  const files = fs
    .readdirSync(faqDir)
    .filter((file) => file.endsWith(".txt"));

  let faqText = "";

  for (const file of files) {
    const filePath = path.join(faqDir, file);
    const content = fs.readFileSync(filePath, "utf8");

    faqText += `\n\n### ${file}\n\n${content}\n`;
  }

  return faqText;
}

module.exports = async function handler(req, res) {

  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {

    const { question, model, temperature } = req.body;

    if (!process.env.OPENAI_API_KEY) {
      throw new Error("Missing OPENAI_API_KEY");
    }

    const faqText = loadFaqs();

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const completion = await client.chat.completions.create({
      model: model || "gpt-4.1-mini",
      temperature: temperature ?? 0.2,

      messages: [
        {
          role: "system",
          content: `
You answer Apex Trader Funding payout questions.

Rules:
- Only answer using the FAQ documentation provided
- Do NOT use outside knowledge
- Do NOT guess
- If the answer is not in the FAQ say:

"I can't answer that from the provided Apex payout FAQs."

Match the tone of the user's question.
Keep answers clear and concise.
`
        },
        {
          role: "user",
          content: `
FAQ DOCUMENTATION:

${faqText}

USER QUESTION:

${question}
`
        }
      ]
    });

    const answer = completion.choices[0].message.content;

    res.status(200).json({ answer });

  } catch (err) {

    console.error(err);

    res.status(500).json({
      error: err.message
    });
  }
};

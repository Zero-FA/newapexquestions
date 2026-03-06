const fs = require("fs");
const path = require("path");
const OpenAIImport = require("openai");

const OpenAI = OpenAIImport.default || OpenAIImport;

const FAQ_LINKS = {
  "eod-payouts.txt": "",
  "howto-request.txt": "",
  "inter-payout-method.txt": "",
  "intraday-payouts.txt": "",
  "legacy-payout.txt": "",
  "payout-method-info.txt": "",
  "us-payout-method.txt": ""
};

function loadFaqs() {
  const faqDir = path.join(process.cwd(), "faqs");

  if (!fs.existsSync(faqDir)) {
    throw new Error(`FAQ folder missing: ${faqDir}`);
  }

  const files = fs
    .readdirSync(faqDir)
    .filter((file) => file.endsWith(".txt"))
    .sort();

  if (!files.length) {
    throw new Error(`No .txt FAQ files found in: ${faqDir}`);
  }

  let faqText = "";

  for (const file of files) {
    const filePath = path.join(faqDir, file);
    const content = fs.readFileSync(filePath, "utf8");

    faqText += `\n\n### FILE: ${file}\n${content}\n`;
  }

  return faqText;
}

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(200).json({
        ok: true,
        message: "API route is alive. Send a POST request."
      });
    }

    if (!process.env.OPENAI_API_KEY) {
      throw new Error("Missing OPENAI_API_KEY environment variable");
    }

    const body = req.body || {};
    const question = (body.question || "").trim();

    if (!question) {
      return res.status(400).json({
        ok: false,
        error: "Missing question"
      });
    }

    const faqText = loadFaqs();

    const client = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY
    });

    const response = await client.responses.create({
      model: "gpt-4.1-mini",
      temperature: 0.2,
      input: [
        {
          role: "system",
          content: [
            {
              type: "input_text",
              text: `You are an Apex Trader Funding payout FAQ assistant.

Follow these rules exactly:
1. Answer ONLY using the FAQ documentation provided.
2. Do NOT use outside knowledge.
3. Do NOT guess, invent, or assume facts that are not clearly supported by the FAQs.
4. If the FAQs do not clearly answer the question, respond exactly with:
I can't answer that from the provided Apex payout FAQs.
5. Match the tone and style of the user's question.
6. Keep the answer clear, direct, and helpful.
7. After the answer, add a final line in exactly this format:
Source: <file name>
8. Only name one source file, the best matching one.`,
            },
          ],
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `FAQ DOCUMENTATION:

${faqText}

USER QUESTION:
${question}

Answer using only the FAQ documentation above.`,
            },
          ],
        },
      ],
    });

    let answer =
      (response.output_text && response.output_text.trim()) ||
      "I can't answer that from the provided Apex payout FAQs.";

    const sourceMatch = answer.match(/Source:\\s*(.+)$/im);
    let sourceFile = sourceMatch ? sourceMatch[1].trim() : "";
    let sourceLink = sourceFile && FAQ_LINKS[sourceFile] ? FAQ_LINKS[sourceFile] : "";

    if (sourceLink) {
      answer += `\nLink: ${sourceLink}`;
    }

    return res.status(200).json({
      ok: true,
      answer
    });
  } catch (error) {
    console.error("ASK API ERROR:", error);

    return res.status(500).json({
      ok: false,
      error: error && error.message ? error.message : "Unknown server error"
    });
  }
};

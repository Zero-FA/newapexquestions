const fs = require("fs");
const path = require("path");
const OpenAIImport = require("openai");

const OpenAI = OpenAIImport.default || OpenAIImport;

const FAQ_LINKS = {
  "EOD-Drawdown-Explained.txt": {
    title: "EOD Drawdown Explained",
    url: "https://support.apextraderfunding.com/hc/en-us/articles/45631563363483-EOD-Drawdown-Explained"
  },
  "EOD-Evals.txt": {
    title: "EOD Evaluations",
    url: "https://support.apextraderfunding.com/hc/en-us/articles/46724640813083-EOD-Evaluations"
  },
  "EOD-Performance-Accounts.txt": {
    title: "EOD Performance Accounts",
    url: "https://support.apextraderfunding.com/hc/en-us/articles/47204516592795-EOD-Performance-Accounts-PA"
  },
  "Intraday-Trailing-Drawdown-Evaluations.txt": {
    title: "Intraday Trailing Drawdown Evaluations",
    url: "https://support.apextraderfunding.com/hc/en-us/articles/45683414022299-Intraday-Trailing-Drawdown-Evaluations"
  },
  "Intraday-Trailing-Drawdown-Explained.txt": {
    title: "Intraday Trailing Drawdown Explained",
    url: "https://support.apextraderfunding.com/hc/en-us/articles/45683513113115-Intraday-Trailing-Drawdown-Explained"
  },
  "Intraday-Trailing-Drawdown-Performance-Accounts.txt": {
    title: "Intraday Trailing Drawdown Performance Accounts",
    url: "https://support.apextraderfunding.com/hc/en-us/articles/47206242141979-Intraday-Trailing-Drawdown-Performance-Accounts-PA"
  },
  "2FA.txt": {
    title: "Setting Up Two-Factor Authentication (2FA)",
    url: "https://support.apextraderfunding.com/hc/en-us/articles/38540816253723-Setting-Up-Two-Factor-Authentication-2FA"
  },
  "Dashboard.txt": {
    title: "Apex Trader Funding Dashboard",
    url: "https://support.apextraderfunding.com/hc/en-us/articles/31519379778459-Apex-Trader-Funding-Dashboard"
  },
  "Prohibited.txt": {
    title: "Prohibited Activities",
    url: "https://support.apextraderfunding.com/hc/en-us/articles/40463668243099-Prohibited-Activities"
  },
  "Registering.txt": {
    title: "Registering as a Person or Business",
    url: "https://support.apextraderfunding.com/hc/en-us/articles/44603582630683-Registering-as-a-Person-or-Business"
  },
  "Restricted-Countries.txt": {
    title: "Restricted Countries",
    url: "https://support.apextraderfunding.com/hc/en-us/articles/31519369083803-Restricted-Countries"
  },
  "eod-payouts.txt": {
    title: "EOD Payouts",
    url: "https://support.apextraderfunding.com/hc/en-us/articles/47205823183003-EOD-Payouts"
  },
  "intraday-payouts.txt": {
    title: "Intraday Trailing Drawdown Payouts",
    url: "https://support.apextraderfunding.com/hc/en-us/articles/47206370796827-Intraday-Trailing-Drawdown-Payouts"
  },
  "us-payout-method.txt": {
    title: "Payout Method — US-Based Users",
    url: "https://support.apextraderfunding.com/hc/en-us/articles/40509699096347-Payout-Method-US-Based-Users"
  },
  "inter-payout-method.txt": {
    title: "Payout Method — International Users",
    url: "https://support.apextraderfunding.com/hc/en-us/articles/40510461359131-Payout-Method-International-Users"
  },
  "payout-method-info.txt": {
    title: "Payout Method Information",
    url: "https://support.apextraderfunding.com/hc/en-us/articles/18960740219931-Payout-Method-Information"
  },
  "howto-request.txt": {
    title: "How to Request a Payout",
    url: "https://support.apextraderfunding.com/hc/en-us/articles/46884326359579-How-to-Request-a-Payout"
  }
};

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach((file) => {
    const fullPath = path.join(dirPath, file);

    if (fs.statSync(fullPath).isDirectory()) {
      getAllFiles(fullPath, arrayOfFiles);
    } else if (file.endsWith(".txt")) {
      arrayOfFiles.push(fullPath);
    }
  });

  return arrayOfFiles;
}

function loadFaqs() {
  const faqDir = path.join(process.cwd(), "faqs");

  if (!fs.existsSync(faqDir)) {
    throw new Error(`FAQ folder missing: ${faqDir}`);
  }

  const files = getAllFiles(faqDir);

  if (!files.length) {
    throw new Error("No FAQ .txt files found");
  }

  let faqText = "";

  for (const filePath of files) {
    const fileName = path.basename(filePath);
    const content = fs.readFileSync(filePath, "utf8");

    faqText += `

### FILE: ${fileName}

${content}

`;
  }

  return faqText;
}

module.exports = async function handler(req, res) {
  try {
    if (req.method !== "POST") {
      return res.status(200).json({
        ok: true,
        message: "API route is alive. Send POST request."
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
              text: `You are an Apex Trader Funding support assistant.

Follow these rules strictly:
1. Answer ONLY using the FAQ documentation provided.
2. Do NOT use outside knowledge.
3. Do NOT guess.
4. If the answer is not clearly in the FAQ say exactly:
I can't answer that from the provided Apex FAQs.
5. Match the tone of the user's question.
6. Keep the answer clear and direct.
7. After answering, add a final line exactly like:
SourceFile: <filename>
8. Use only one source file, the single best matching one.`
            }
          ]
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

Answer using only the FAQ documentation above.`
            }
          ]
        }
      ]
    });

    const rawAnswer =
      (response.output_text && response.output_text.trim()) ||
      "I can't answer that from the provided Apex FAQs.";

    const sourceMatch = rawAnswer.match(/SourceFile:\s*(.+)$/im);
    const sourceFile = sourceMatch ? sourceMatch[1].trim() : "";

    const cleanedAnswer = rawAnswer
      .replace(/SourceFile:\s*.+$/im, "")
      .trim();

    const sourceInfo = FAQ_LINKS[sourceFile] || null;

    return res.status(200).json({
      ok: true,
      answer: cleanedAnswer,
      sourceFile,
      sourceTitle: sourceInfo ? sourceInfo.title : sourceFile || "",
      sourceUrl: sourceInfo ? sourceInfo.url : ""
    });
  } catch (error) {
    console.error("ASK API ERROR:", error);

    return res.status(500).json({
      ok: false,
      error: error && error.message ? error.message : "Unknown server error"
    });
  }
};

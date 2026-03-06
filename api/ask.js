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
  },
  "Evaluation-Plan-Fees-and-Access-Explained.txt": {
    title: "Evaluation Plan Fees and Access Explained",
    url: "https://support.apextraderfunding.com/hc/en-us/articles/46723099925403-Evaluation-Plan-Fees-and-Access-Explained"
  },
  "PA-Activation-Process-&-Deadline-Explained.txt": {
    title: "PA Activation Process & Deadline Explained",
    url: "https://support.apextraderfunding.com/hc/en-us/articles/47237215800987-PA-Activation-Process-Deadline-Explained"
  },
  "Payment-Methods-and-Possible-Checkout-Errors.txt": {
    title: "Payment Methods and Possible Checkout Errors",
    url: "https://support.apextraderfunding.com/hc/en-us/articles/43481854699547-Payment-Methods-and-Possible-Checkout-Errors"
  },
  "Inactivity-Policy-on-Performance-Accounts.txt": {
    title: "Inactivity Policy on Performance Accounts",
    url: "https://support.apextraderfunding.com/hc/en-us/articles/47259602019611-Inactivity-Policy-on-Performance-Accounts-PA"
  },
  "Coupon-Codes.txt": {
    title: "Coupon Codes",
    url: "https://support.apextraderfunding.com/hc/en-us/articles/43190509217179-Coupon-Codes"
  },
  "Refund-Policy.txt": {
    title: "Refund Policy",
    url: "https://support.apextraderfunding.com/hc/en-us/articles/47255392198299-Refund-Policy"
  },
  "WealthCharts-Setup-and-Connection.txt": {
    title: "WealthCharts Setup and Connection",
    url: "https://support.apextraderfunding.com/hc/en-us/articles/31519768019611-WealthCharts-Setup-and-Connection"
  },
  "Common Questions-and-Troubleshooting-for-WealthCharts.txt": {
    title: "Common Questions and Troubleshooting for WealthCharts",
    url: "https://support.apextraderfunding.com/hc/en-us/articles/31137137544475-Common-Questions-and-Troubleshooting-for-WealthCharts"
  },
  "Rithmic-Account-Setup.txt": {
    title: "Rithmic Account Setup",
    url: "https://support.apextraderfunding.com/hc/en-us/articles/31519440985499-Rithmic-Account-Setup"
  },
  "Connection-Guide-for-NinjaTrader-Using-Rithmic.txt": {
    title: "Connection Guide for NinjaTrader Using Rithmic",
    url: "https://support.apextraderfunding.com/hc/en-us/articles/13397375485851-Connection-Guide-for-NinjaTrader-Using-Rithmic"
  },
  "Rithmic-Troubleshooting.txt": {
    title: "Rithmic Troubleshooting",
    url: "https://support.apextraderfunding.com/hc/en-us/articles/31519409430811-Rithmic-Troubleshooting-Lag-Error-Messages"
  },
  "Setting-up-Tradovate.txt": {
    title: "Setting up Tradovate",
    url: "https://support.apextraderfunding.com/hc/en-us/articles/31519502179099-Setting-up-Tradovate"
  },
  "Tradovate-NinjaTrader8-Connection.txt": {
    title: "Tradovate x NinjaTrader8 Connection Guide",
    url: "https://support.apextraderfunding.com/hc/en-us/articles/43191997568667-Tradovate-x-NinjaTrader8-Connection-Guide"
  },
  "Tradovate-Frequently-Asked-Questions.txt": {
    title: "Tradovate Frequently Asked Questions",
    url: "https://support.apextraderfunding.com/hc/en-us/articles/31519503465755-Tradovate-Frequently-Asked-Questions"
  },
  "Rithmic-Commissions-&-Instruments.txt": {
    title: "Rithmic Commissions & Instruments",
    url: "https://support.apextraderfunding.com/hc/en-us/articles/31519472976155-Rithmic-Commissions-Instruments"
  },
  "WealthCharts-Commissions-&-Instruments.txt": {
    title: "WealthCharts Commissions & Instruments",
    url: "https://support.apextraderfunding.com/hc/en-us/articles/40229823264411-WealthCharts-Commissions-Instruments"
  },
  "Tradovate-Commission-&-Instruments.txt": {
    title: "Tradovate Commission & Instruments",
    url: "https://support.apextraderfunding.com/hc/en-us/articles/31519458697243-Tradovate-Commission-Instruments"
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

function normalizeQuestion(input) {
  let q = ` ${input || ""} `;

  const replacements = [
    [/\btdv\b/gi, " Tradovate "],
    [/\btradovate\b/gi, " Tradovate "],
    [/\brith\b/gi, " Rithmic "],
    [/\brithmic\b/gi, " Rithmic "],
    [/\bwc\b/gi, " WealthCharts "],
    [/\bwealth charts\b/gi, " WealthCharts "],
    [/\bwealthcharts\b/gi, " WealthCharts "],
    [/\bnt\b/gi, " NinjaTrader "],
    [/\bnt8\b/gi, " NinjaTrader8 "],
    [/\bninjatrader\b/gi, " NinjaTrader "],
    [/\bninjatrader 8\b/gi, " NinjaTrader8 "],
    [/\bpa\b/gi, " Performance Account "],
    [/\bpas\b/gi, " Performance Accounts "],
    [/\beval\b/gi, " Evaluation "],
    [/\bevals\b/gi, " Evaluations "],
    [/\b2fa\b/gi, " Two-Factor Authentication "],
    [/\bach\b/gi, " ACH "],
    [/\bes\b/gi, " ES E-Mini S&P 500 "],
    [/\bmes\b/gi, " MES Micro E-Mini S&P 500 "],
    [/\bnq\b/gi, " NQ E-Mini Nasdaq "],
    [/\bmnq\b/gi, " MNQ Micro E-Mini Nasdaq "],
    [/\byt\b/gi, " Treasury Note "],
    [/\bym\b/gi, " YM E-Mini Dow "],
    [/\bmym\b/gi, " MYM Micro E-Mini Dow "],
    [/\brt\b/gi, " round turn "],
    [/\br\/t\b/gi, " round turn "],
    [/\beod\b/gi, " End of Day EOD "],
    [/\bttd\b/gi, " trailing drawdown "],
    [/\bdd\b/gi, " drawdown "],
    [/\bunder review\b/gi, " under review payout status "],
    [/\bpaid\b/gi, " paid payout status "]
  ];

  for (const [pattern, replacement] of replacements) {
    q = q.replace(pattern, replacement);
  }

  return q.replace(/\s+/g, " ").trim();
}

function tokenize(text) {
  return String(text || "")
    .toLowerCase()
    .replace(/[^a-z0-9&\-\s]/g, " ")
    .split(/\s+/)
    .filter(Boolean);
}

function scoreFile(question, normalizedQuestion, fileName, content) {
  const haystack = `${fileName}\n${content}\n${normalizedQuestion}`.toLowerCase();
  const originalTokens = tokenize(question);
  const normalizedTokens = tokenize(normalizedQuestion);
  const allTokens = [...new Set([...originalTokens, ...normalizedTokens])];

  let score = 0;

  for (const token of allTokens) {
    if (token.length < 2) continue;
    if (haystack.includes(token)) {
      score += token.length >= 8 ? 5 : token.length >= 5 ? 3 : 1;
    }
  }

  if (normalizedQuestion.toLowerCase().includes("tradovate") && /tradovate/i.test(fileName)) score += 20;
  if (normalizedQuestion.toLowerCase().includes("rithmic") && /rithmic/i.test(fileName)) score += 20;
  if (normalizedQuestion.toLowerCase().includes("wealthcharts") && /wealthcharts/i.test(fileName)) score += 20;
  if (normalizedQuestion.toLowerCase().includes("payout") && /payout|request|performance|activation/i.test(fileName)) score += 10;
  if (normalizedQuestion.toLowerCase().includes("drawdown") && /drawdown/i.test(fileName)) score += 12;
  if (normalizedQuestion.toLowerCase().includes("commission") && /commission|instruments/i.test(fileName)) score += 15;
  if (normalizedQuestion.toLowerCase().includes("billing") && /payment|coupon|refund/i.test(fileName)) score += 12;
  if (normalizedQuestion.toLowerCase().includes("country") && /country/i.test(fileName)) score += 12;
  if (normalizedQuestion.toLowerCase().includes("register") && /register/i.test(fileName)) score += 12;
  if (normalizedQuestion.toLowerCase().includes("2 factor") || normalizedQuestion.toLowerCase().includes("two-factor")) {
    if (/2fa/i.test(fileName)) score += 20;
  }

  return score;
}

function loadRankedFaqs(question, normalizedQuestion, maxFiles = 4) {
  const faqDir = path.join(process.cwd(), "faqs");

  if (!fs.existsSync(faqDir)) {
    throw new Error(`FAQ folder missing: ${faqDir}`);
  }

  const filePaths = getAllFiles(faqDir);

  if (!filePaths.length) {
    throw new Error("No FAQ .txt files found");
  }

  const ranked = filePaths.map((filePath) => {
    const fileName = path.basename(filePath);
    const content = fs.readFileSync(filePath, "utf8");
    const score = scoreFile(question, normalizedQuestion, fileName, content);
    return { filePath, fileName, content, score };
  });

  ranked.sort((a, b) => b.score - a.score);

  const selected = ranked.slice(0, maxFiles);
  let faqText = "";

  for (const item of selected) {
    faqText += `\n\n### FILE: ${item.fileName}\n${item.content}\n`;
  }

  return {
    faqText,
    selectedFiles: selected.map((x) => x.fileName)
  };
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
    const rawQuestion = (body.question || "").trim();

    if (!rawQuestion) {
      return res.status(400).json({
        ok: false,
        error: "Missing question"
      });
    }

    const normalizedQuestion = normalizeQuestion(rawQuestion);
    const { faqText, selectedFiles } = loadRankedFaqs(rawQuestion, normalizedQuestion, 4);

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
              text: `You are an Apex Trader Funding FAQ assistant.

Rules:
1. Answer ONLY using the FAQ documentation provided.
2. Do NOT use outside knowledge.
3. Do NOT guess or make unsupported claims.
4. Treat common abbreviations and shorthand as their full terms when the normalized question makes them clear.
5. If the answer is not clearly supported by the FAQ docs, say exactly:
I can't answer that from the provided Apex FAQs.
6. Keep the answer direct and natural.
7. After the answer, add one final line exactly like this:
SourceFile: <filename>
8. Use only one source file, the single best matching file from the provided docs.`
            }
          ]
        },
        {
          role: "user",
          content: [
            {
              type: "input_text",
              text: `SELECTED FAQ FILES:
${selectedFiles.join(", ")}

FAQ DOCUMENTATION:
${faqText}

ORIGINAL USER QUESTION:
${rawQuestion}

NORMALIZED QUESTION:
${normalizedQuestion}

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
    const cleanedAnswer = rawAnswer.replace(/SourceFile:\s*.+$/im, "").trim();

    const sourceInfo = FAQ_LINKS[sourceFile] || null;

    return res.status(200).json({
      ok: true,
      answer: cleanedAnswer,
      sourceFile,
      sourceTitle: sourceInfo ? sourceInfo.title : sourceFile || "",
      sourceUrl: sourceInfo ? sourceInfo.url : "",
      normalizedQuestion,
      selectedFiles
    });
  } catch (error) {
    console.error("ASK API ERROR:", error);

    return res.status(500).json({
      ok: false,
      error: error && error.message ? error.message : "Unknown server error"
    });
  }
};

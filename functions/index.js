const functions = require('firebase-functions');
const { GoogleGenAI } = require('@google/genai');

/**
 * Cloud Function to analyze building plans with gemini-2.0-flash
 * The API key is securely held in Cloud Function environment/secrets.
 */
exports.analyzeBuildingPlan = functions.https.onRequest(async (req, res) => {
  // Enable CORS
  res.set('Access-Control-Allow-Origin', '*');
  res.set('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.set('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    res.status(204).send('');
    return;
  }

  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method Not Allowed' });
    return;
  }

  try {
    const { applicationData, pdfBase64 } = req.body;
    const apiKey = process.env.GEMINI_API_KEY || functions.config().gemini?.key;

    if (!apiKey) {
      res.status(500).json({ error: 'GEMINI_API_KEY not configured on server' });
      return;
    }

    const ai = new GoogleGenAI({ apiKey });

    const systemPrompt = `You are a Senior Municipal Building Scrutiny Officer for Tamil Nadu DTCP / LPA.
Scrutinize strictly against Tamil Nadu Combined Development and Building Rules 2019 (TNCDBR 2019).
Return STRICT JSON ONLY matching:
{
  "summary": string,
  "complianceScore": integer 0-100,
  "recommendation": "approve" | "approve_with_conditions" | "correction_required",
  "checks": [
    {
      "rule": string,
      "ruleRef": string,
      "required": string,
      "found": string,
      "status": "pass" | "fail" | "needs_manual_check",
      "severity": "low" | "medium" | "high",
      "remark": string
    }
  ],
  "correctionPoints": [
    { "point": string, "section": string }
  ]
}`;

    const promptText = `
Scrutinize the following building plan application under TNCDBR 2019 rules:
${JSON.stringify(applicationData, null, 2)}
Check:
- Minimum plot area for building type
- FSI / FAR limits vs abutting road width
- Maximum ground coverage percentage
- Front, Rear, Left, Right setbacks vs plot frontage & height
- Building height vs road width
- Parking provision (cars & two wheelers)
- Staircase minimum width
- Rainwater harvesting structure provision
- Completeness of drawing sheets
Return STRICT JSON ONLY.`;

    const contents = [];
    if (pdfBase64) {
      contents.push({
        inlineData: {
          mimeType: 'application/pdf',
          data: pdfBase64
        }
      });
    }
    contents.push({ text: promptText });

    const response = await ai.models.generateContent({
      model: 'gemini-2.0-flash',
      contents: contents,
      config: {
        systemInstruction: systemPrompt,
        temperature: 0.1,
        responseMimeType: 'application/json'
      }
    });

    let raw = response.text || '';
    if (raw.startsWith('```')) {
      raw = raw.replace(/^```(?:json)?\s*/i, '').replace(/\s*```$/, '');
    }

    const parsed = JSON.parse(raw);
    res.status(200).json(parsed);
  } catch (error) {
    console.error('AI Scrutiny Error:', error);
    res.status(500).json({
      error: 'AI Scrutiny processing failed: ' + error.message,
      fallbackRequired: true
    });
  }
});

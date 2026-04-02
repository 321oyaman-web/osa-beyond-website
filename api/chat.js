/* ========================================
   osA Beyond Inc. - Vercel Serverless Function
   OpenAI APIキーをサーバー側で管理し、安全に呼び出す
======================================== */

/* osA Beyondに関するシステムプロンプト（サーバー側で管理） */
const SYSTEM_PROMPT = `You are the AI assistant for osA Beyond Inc. (オーエスエイビヨンド株式会社).
Answer visitors' questions politely and concisely based on the information below.
Respond in the same language as the user (Japanese for Japanese questions, English for English questions).

[Company Info]
- Company: osA Beyond Inc. / オーエスエイビヨンド株式会社
- Founded: December 2018
- CEO: Keisuke Oyama / 尾山 佳助
- Address: VORT Akihabara IV 2F, 1-7-8 Kanda-Sudacho, Chiyoda-ku, Tokyo 101-0041
- Mission: Bridging East & West — building strategic partnerships between innovative companies

[Services]
1. Japan Market Entry Support (For overseas tech startups)
   - Market research, competitive analysis, entry strategy
   - Japan partner & distributor development
   - Sales representation (Sales REP)
   - Japan office setup & incorporation support

2. Global Business Consulting (For Japanese SMEs)
   - Overseas market research & target country selection
   - Overseas business partner identification & introduction
   - Negotiation & contract support (English available)
   - Global expansion strategy planning

3. AI Consulting (For Japanese SMEs ONLY — not available for overseas companies)
   - AI adoption strategy planning
   - Best-fit AI tool & service selection
   - Employee AI training & workshops

[FAQ Answers]
- How quickly can you start? → We review requirements and can start immediately after signing the contract.
- Which countries do you cover? → All countries. Track record includes Finland, India, China, Malaysia.
- How do I get started? → Share your industry, product/service, and target market. Any concern is welcome.
- Pricing? → Custom quote based on needs, scope, and timeline. Consultation-based, non-public pricing.
- Languages? → Japanese and English both supported.

[Response Guidelines]
- Be polite and concise (3-5 sentences)
- For specific inquiries, direct users to the contact page (contact.html)
- Keep responses focused on osA Beyond's services and expertise`;

export default async function handler(req, res) {
  /* CORSヘッダー設定（ローカル開発用） */
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  /* OPTIONSリクエスト（プリフライト）への対応 */
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  /* POSTのみ許可 */
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { messages } = req.body;

  /* リクエスト検証 */
  if (!messages || !Array.isArray(messages) || messages.length === 0) {
    return res.status(400).json({ error: 'Invalid request: messages array required' });
  }

  /* 環境変数からAPIキーを取得 */
  const apiKey = process.env.OPENAI_API_KEY;
  if (!apiKey) {
    return res.status(500).json({ error: 'Server configuration error' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${apiKey}`
      },
      body: JSON.stringify({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: SYSTEM_PROMPT },
          ...messages
        ],
        max_tokens: 600,
        temperature: 0.7
      })
    });

    const data = await response.json();

    if (!response.ok) {
      return res.status(response.status).json({ error: data.error?.message || 'OpenAI API error' });
    }

    return res.status(200).json(data);

  } catch (error) {
    return res.status(500).json({ error: error.message });
  }
}

// WorkMojo Multilingual AI Service (Backend)
// Supports Google Gemini, OpenAI, or Built-in Domain Intelligence Engine

export interface AiChatRequest {
  message: string;
  language?: 'en' | 'te' | 'hi' | 'ta';
  role?: 'worker' | 'customer';
  context?: {
    activeScreen?: string;
    skills?: string[];
    location?: string;
  };
}

export interface AiChatResponse {
  success: boolean;
  reply: string;
  language: 'en' | 'te' | 'hi' | 'ta';
  provider: 'gemini' | 'openai' | 'mojo-engine';
  action?: {
    type: string;
    target?: string;
    label?: string;
    filterCategory?: string;
    minWage?: number;
  };
}

// 1. External AI Call: Google Gemini (Primary Production Provider)
function buildGeminiSystemPrompt(req: AiChatRequest): string {
  const lang = req.language || 'en';
  const role = req.role || 'worker';
  const ctx = req.context || {};

  const languageDirective =
    lang === 'te'
      ? 'CRITICAL LANGUAGE DIRECTIVE: You MUST reply entirely in Telugu (తెలుగు లిపి). Do NOT reply in English or Latin alphabet, except for universal technical acronyms like UPI, QR, OTP, WorkMojo.'
      : lang === 'hi'
      ? 'CRITICAL LANGUAGE DIRECTIVE: You MUST reply entirely in Hindi Devanagari script (हिन्दी देवनागरी लिपि). Do NOT reply in Latin/Roman script (Hinglish), except for terms like UPI, QR, OTP, WorkMojo.'
      : lang === 'ta'
      ? 'CRITICAL LANGUAGE DIRECTIVE: You MUST reply entirely in Tamil (தமிழ் எழுத்துரு). Do NOT reply in English or Latin script, except for universal terms like UPI, QR, OTP, WorkMojo.'
      : 'Reply in clear, professional, warm, and helpful English.';

  const contextPoints: string[] = [];
  if (ctx.activeScreen) {
    contextPoints.push(`Current Active App Screen: "${ctx.activeScreen}"`);
  }
  if (ctx.skills && Array.isArray(ctx.skills) && ctx.skills.length > 0) {
    contextPoints.push(`User Stated Skills: ${ctx.skills.join(', ')}`);
  }
  if (ctx.location) {
    contextPoints.push(`User Stated Location: ${ctx.location}`);
  }

  return `You are Mojo, the official AI Employment & Platform Assistant for "WorkMojo" — India's premier commission-free daily-wage and gig work platform.

CORE WORKMOJO KNOWLEDGE & POLICIES:
1. 100% Zero Commission: WorkMojo never takes cuts from worker wages. Daily-wage earners retain 100% of their earnings.
2. Fair Daily Wage Baselines: Typical market daily wages in India range between ₹700 to ₹1200+ depending on skill level, trade, hours, and location.
3. Dual Role Ecosystem:
   - Workers: Browse nearby jobs, filter by wage or trade, apply with 1 tap, track live shifts, verify attendance with QR check-in/out, receive instant payouts via UPI or cash, and rate employers.
   - Employers / Customers: Post job listings in 60 seconds across 35+ categories, review matched applicants with match scores, confirm workers, verify worker attendance via QR, authorize protected escrow payments, and release wages seamlessly upon completion.
4. Attendance & Wage Protection: Geofenced QR-code scan for check-in and check-out eliminates attendance and wage disputes. Payments are held in protected escrow and released upon shift confirmation.
5. Safety & Security: Includes a 1-tap Emergency SOS feature with live location sharing for worker safety.
6. Supported Trades (35+ Categories): Construction, Masonry, Loading/Unloading, Logistics & Delivery, Driver, Housekeeping & Cleaning, Painting, Plumbing, Electrical, Carpentry, Security Guard, Event Catering, Gardening, Warehouse Support, etc.

USER INTERACTION CONTEXT:
- The user is currently in "${role === 'customer' ? 'Employer/Customer' : 'Worker'}" mode.
${contextPoints.length > 0 ? contextPoints.map(p => `- ${p}`).join('\n') : '- General user session.'}

LANGUAGE REQUIREMENT:
${languageDirective}

COMMUNICATION STYLE:
- Tone: Helpful, empathetic, encouraging, practical, and culturally respectful of India's hardworking blue-collar and gig workforce.
- Length: Keep responses concise and easy to read (2 to 4 sentences maximum).
- Action-Oriented: Directly answer questions regarding jobs, wage rates, applications, attendance, payment methods, safety, or profile settings.
- Do not make false promises of guaranteed employment. Encourage exploring active postings on WorkMojo.`;
}

// Sanitizes URLs and strings to ensure API keys are NEVER printed in server logs or error traces
function sanitizeApiKey(text: string): string {
  return String(text).replace(/key=[^&\s"'`]+/gi, 'key=[REDACTED]');
}

async function callGemini(apiKey: string, req: AiChatRequest): Promise<string | null> {
  const userModel = process.env.GEMINI_MODEL;
  const systemPrompt = buildGeminiSystemPrompt(req);

  // Model fallback candidates in priority order
  const modelsToTry = Array.from(
    new Set([userModel, 'gemini-1.5-flash', 'gemini-2.0-flash', 'gemini-1.5-pro'].filter(Boolean) as string[])
  );

  for (const model of modelsToTry) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10s bounded timeout

      const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent?key=${apiKey}`;

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [
            {
              role: 'user',
              parts: [
                {
                  text: `${systemPrompt}\n\nUser Question:\n"${req.message}"`,
                },
              ],
            },
          ],
          generationConfig: {
            maxOutputTokens: 300,
            temperature: 0.7,
            topP: 0.95,
          },
        }),
        signal: controller.signal,
      });
      clearTimeout(timeoutId);

      if (response.status === 404) {
        // If the model name is unavailable in the key's region, attempt the next model
        console.warn(`[Gemini API] Model ${model} returned 404, attempting fallback model...`);
        continue;
      }

      if (!response.ok) {
        console.warn(`[Gemini API] Request failed with HTTP status ${response.status}`);
        return null;
      }

      const data: any = await response.json();
      const candidateText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (candidateText && candidateText.trim()) {
        return candidateText.trim();
      }
      return null;
    } catch (err: any) {
      if (err.name === 'AbortError') {
        console.warn(`[Gemini API] Request timed out (10s) on model ${model}`);
      } else {
        console.warn('[Gemini API] Error calling Gemini:', sanitizeApiKey(err?.message || String(err)));
      }
      return null;
    }
  }

  return null;
}

// 2. External AI Call: OpenAI
async function callOpenAI(apiKey: string, req: AiChatRequest): Promise<string | null> {
  const lang = req.language || 'en';
  const role = req.role || 'worker';
  const modelName = process.env.OPENAI_MODEL || 'gpt-4o-mini';

  const systemPrompt = `You are Mojo, the official AI assistant of WorkMojo (India's zero-commission gig platform).
Respond strictly in ${
    lang === 'te' ? 'Telugu (తెలుగు script)' :
    lang === 'hi' ? 'Hindi (हिन्दी script)' :
    lang === 'ta' ? 'Tamil (தமிழ் script)' : 'English'
  }.
User is a ${role}. Keep responses concise, warm, helpful (2-4 sentences max).`;

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000);

    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: modelName,
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: req.message },
        ],
        max_tokens: 200,
        temperature: 0.7,
      }),
      signal: controller.signal,
    });
    clearTimeout(timeoutId);

    if (!response.ok) {
      console.warn(`[OpenAI API] Request failed with status ${response.status}`);
      return null;
    }

    const data: any = await response.json();
    const candidateText = data?.choices?.[0]?.message?.content;
    return candidateText ? candidateText.trim() : null;
  } catch (err: any) {
    console.warn('[OpenAI API] Error calling OpenAI:', err?.message || err);
    return null;
  }
}

// 3. Multilingual Domain Intelligence Engine
// Ensures 100% reliability, zero downtime, and instant accurate answers across languages
function generateDomainResponse(req: AiChatRequest): { reply: string; action?: any } {
  const lang = req.language || 'en';
  const role = req.role || 'worker';
  const q = req.message.toLowerCase();

  // Keyword Intent Classifiers
  const isConstruction =
    q.includes('construction') ||
    q.includes('mason') ||
    q.includes('building') ||
    q.includes('భవన') ||
    q.includes('నిర్మాణ') ||
    q.includes('తాపీ') ||
    q.includes('निर्माण') ||
    q.includes('मिस्त्री') ||
    q.includes('భవన నిర్మాణ') ||
    q.includes('கட்டுமானம்') ||
    q.includes('கட்டிட');

  const isDelivery =
    q.includes('delivery') ||
    q.includes('courier') ||
    q.includes('డెలివరీ') ||
    q.includes('డిలివరీ') ||
    q.includes('डिलीवरी') ||
    q.includes('कोरियर') ||
    q.includes('டெலிவரி');

  const isLoading =
    q.includes('loading') ||
    q.includes('unloading') ||
    q.includes('shifting') ||
    q.includes('warehouse') ||
    q.includes('లోడింగ్') ||
    q.includes('అన్‌లోడింగ్') ||
    q.includes('గోడౌన్') ||
    q.includes('लोडिंग') ||
    q.includes('अनलोडिंग') ||
    q.includes('गोदाम') ||
    q.includes('ஏற்றுதல்') ||
    q.includes('இறக்குதல்');

  const isCleaning =
    q.includes('clean') ||
    q.includes('housekeep') ||
    q.includes('క్లీనింగ్') ||
    q.includes('శుభ్రం') ||
    q.includes('सफाई') ||
    q.includes('स्वच्छता') ||
    q.includes('சுத்தம்');

  const isDriving =
    q.includes('driv') ||
    q.includes('driver') ||
    q.includes('డ్రైవింగ్') ||
    q.includes('డ్రైవర్') ||
    q.includes('ड्राइविंग') ||
    q.includes('ड्राइवर') ||
    q.includes('ஓட்டுநர்');

  const isSecurity =
    q.includes('security') ||
    q.includes('guard') ||
    q.includes('సెక్యూరిటీ') ||
    q.includes('గార్డ్') ||
    q.includes('सुरक्षा गार्ड') ||
    q.includes('பாதுகாவலர்');

  const isTrade =
    q.includes('paint') ||
    q.includes('plumb') ||
    q.includes('electric') ||
    q.includes('carpent') ||
    q.includes('repair') ||
    q.includes('పెయింటింగ్') ||
    q.includes('ప్లంబింగ్') ||
    q.includes('ఎలక్ట్రీషియన్') ||
    q.includes('రిపేర్') ||
    q.includes('पेंटिंग') ||
    q.includes('प्लंबर') ||
    q.includes('इलेक्ट्रीशियन') ||
    q.includes('मरम्मत') ||
    q.includes('வண்ணம்') ||
    q.includes('பழுது');

  const isHighWage =
    q.includes('800') ||
    q.includes('high pay') ||
    q.includes('highest') ||
    q.includes('wage') ||
    q.includes('జీతం') ||
    q.includes('ఎక్కువ') ||
    q.includes('మంచి వేతనం') ||
    q.includes('ज्यादा कमाई') ||
    q.includes('अधिक वेतन') ||
    q.includes('அதிக ஊதியம்');

  const isPayment =
    q.includes('payment') ||
    q.includes('pay') ||
    q.includes('upi') ||
    q.includes('bank') ||
    q.includes('cash') ||
    q.includes('earning') ||
    q.includes('చెల్లింపు') ||
    q.includes('నగదు') ||
    q.includes('బ్యాంకు') ||
    q.includes('भुगतान') ||
    q.includes('पैसे') ||
    q.includes('नकद') ||
    q.includes('பணம்') ||
    q.includes('கட்டணம்');

  const isAttendance =
    q.includes('attendance') ||
    q.includes('qr') ||
    q.includes('check in') ||
    q.includes('check-in') ||
    q.includes('హాజరు') ||
    q.includes('క్యూఆర్') ||
    q.includes('उपस्थिति') ||
    q.includes('क्यूआर') ||
    q.includes('வருகை') ||
    q.includes('கியூஆர்');

  const isPostJob =
    q.includes('post') ||
    q.includes('hire') ||
    q.includes('need worker') ||
    q.includes('పోస్ట్') ||
    q.includes('నియామకం') ||
    q.includes('వర్కర్లు కావాలి') ||
    q.includes('काम पोस्ट') ||
    q.includes('मजदूर चाहिए') ||
    q.includes('வேலை பதிவு');

  const isSafety =
    q.includes('sos') ||
    q.includes('safety') ||
    q.includes('emergency') ||
    q.includes('ఆపద') ||
    q.includes('అత్యవసరం') ||
    q.includes('భద్రత') ||
    q.includes('सुरक्षा') ||
    q.includes('आपातकाल') ||
    q.includes('அவசரம்') ||
    q.includes('பாதுகாப்பு');

  // Route 1: Construction Gigs
  if (isConstruction) {
    if (lang === 'te') {
      return {
        reply: 'మీ కోసం చుట్టుపక్కల భవన నిర్మాణ (Construction & Masonry) పనులు సిద్ధంగా ఉన్నాయి! నేను జాబ్స్ లిస్ట్‌ను కన్‌స్ట్రక్షన్ కేటగిరీకి ఫిల్టర్ చేశాను. వెంటనే దరఖాస్తు చేసుకోవచ్చు.',
        action: { type: 'filter_category', filterCategory: 'Construction', label: 'నిర్మాణ పనులు చూడండి' },
      };
    } else if (lang === 'hi') {
      return {
        reply: 'मुझे आपके निकट सक्रिय निर्माण (Construction & Masonry) के काम मिले हैं! मैंने आपकी जॉब सूची को कंस्ट्रक्शन के लिए फ़िल्टर कर दिया है। आप सीधे आवेदन कर सकते हैं।',
        action: { type: 'filter_category', filterCategory: 'Construction', label: 'निर्माण कार्य देखें' },
      };
    } else if (lang === 'ta') {
      return {
        reply: 'உங்கள் பகுதியில் கட்டுமான (Construction) வேலைகள் தயாராக உள்ளன! கட்டுமான வேலைகளைப் பார்க்க உங்கள் பட்டியலை வடிகட்டியுள்ளேன். உடனே விண்ணப்பிக்கலாம்.',
        action: { type: 'filter_category', filterCategory: 'Construction', label: 'கட்டுமான வேலைகள்' },
      };
    } else {
      return {
        reply: 'I found active Construction & Masonry gigs near you! I have filtered your Jobs screen to show construction opportunities with transparent shift wages.',
        action: { type: 'filter_category', filterCategory: 'Construction', label: 'View Construction Gigs' },
      };
    }
  }

  // Route 2: Delivery Gigs
  if (isDelivery) {
    if (lang === 'te') {
      return {
        reply: 'సమీపంలోని డెలివరీ పనులను కనుగొన్నాను! ఫ్లెక్సిబుల్ షిఫ్ట్‌లతో మంచి ఆదాయం పొందవచ్చు.',
        action: { type: 'filter_category', filterCategory: 'Delivery', label: 'డెలివరీ పనులు' },
      };
    } else if (lang === 'hi') {
      return {
        reply: 'सक्रिय डिलीवरी के काम उपलब्ध हैं! आप तत्काल डिलीवरी और पार्सल शिफ्ट्स देख सकते हैं।',
        action: { type: 'filter_category', filterCategory: 'Delivery', label: 'डिलीवरी काम' },
      };
    } else if (lang === 'ta') {
      return {
        reply: 'செயலில் உள்ள டெலிவரி வேலைகள் கிடைக்கின்றன! உங்கள் வேலைகள் பட்டியல் புதுப்பிக்கப்பட்டது.',
        action: { type: 'filter_category', filterCategory: 'Delivery', label: 'டெலிவரி வேலைகள்' },
      };
    } else {
      return {
        reply: 'Active Delivery & Logistics shifts found nearby! Tap below to explore open slots.',
        action: { type: 'filter_category', filterCategory: 'Delivery', label: 'View Delivery Jobs' },
      };
    }
  }

  // Route 3: Loading & Warehouse
  if (isLoading) {
    if (lang === 'te') {
      return {
        reply: 'వేర్‌హౌస్ లోడింగ్ మరియు అన్‌లోడింగ్ పనులు అందుబాటులో ఉన్నాయి. షిఫ్ట్ పూర్తి కాగానే పూర్తి నగదు లేదా యూపీఐ ద్వారా చెల్లింపు లభిస్తుంది.',
        action: { type: 'filter_category', filterCategory: 'Loading/Unloading', label: 'లోడింగ్ పనులు' },
      };
    } else if (lang === 'hi') {
      return {
        reply: 'वेयरहाउस लोडिंग और अनलोडिंग के काम सक्रिय हैं। शिफ्ट समाप्ति पर सीधा भुगतान उपलब्ध है।',
        action: { type: 'filter_category', filterCategory: 'Loading/Unloading', label: 'लोडिंग काम' },
      };
    } else if (lang === 'ta') {
      return {
        reply: 'சரக்கு ஏற்றுதல் மற்றும் இறக்குதல் வேலைகள் உள்ளன. உடனே வேலைக்கு விண்ணப்பிக்கலாம்.',
        action: { type: 'filter_category', filterCategory: 'Loading/Unloading', label: 'ஏற்றுதல் வேலைகள்' },
      };
    } else {
      return {
        reply: 'Warehouse loading & unloading gigs available. Direct full wage payout upon shift completion.',
        action: { type: 'filter_category', filterCategory: 'Loading/Unloading', label: 'View Loading Jobs' },
      };
    }
  }

  // Route 4: Cleaning & Housekeeping
  if (isCleaning) {
    if (lang === 'te') {
      return {
        reply: 'క్లీనింగ్ మరియు హౌస్‌కీపింగ్ పనులు అందుబాటులో ఉన్నాయి. పారదర్శక వేతనం లభిస్తుంది.',
        action: { type: 'filter_category', filterCategory: 'Cleaning', label: 'క్లీనింగ్ పనులు' },
      };
    } else if (lang === 'hi') {
      return {
        reply: 'सफाई और हाउसकीपिंग के काम उपलब्ध हैं। उचित मजदूरी और सुरक्षित कार्यस्थल सुनिश्चित है।',
        action: { type: 'filter_category', filterCategory: 'Cleaning', label: 'सफाई काम' },
      };
    } else if (lang === 'ta') {
      return {
        reply: 'சுத்தம் மற்றும் பராமரிப்பு வேலைகள் கிடைக்கின்றன.',
        action: { type: 'filter_category', filterCategory: 'Cleaning', label: 'சுத்தம் செய்தல்' },
      };
    } else {
      return {
        reply: 'Cleaning and housekeeping opportunities found. Tap below to view listings.',
        action: { type: 'filter_category', filterCategory: 'Cleaning', label: 'View Cleaning Jobs' },
      };
    }
  }

  // Route 5: Skilled Trades (Painting, Plumbing, Electrician)
  if (isTrade) {
    if (lang === 'te') {
      return {
        reply: 'ప్లంబింగ్, పెయింటింగ్ మరియు ఎలక్ట్రికల్ పనులు సిద్ధంగా ఉన్నాయి. మీ నైపుణ్యానికి తగిన వేతనం లభిస్తుంది.',
        action: { type: 'filter_category', filterCategory: 'Repair', label: 'రిపేర్ & స్కిల్డ్ పనులు' },
      };
    } else if (lang === 'hi') {
      return {
        reply: 'पेंटिंग, प्लंबिंग और इलेक्ट्रीशियन के काम उपलब्ध हैं। अपनी कुशलता अनुसार बेहतर कमाई करें।',
        action: { type: 'filter_category', filterCategory: 'Repair', label: 'कुशल काम देखें' },
      };
    } else if (lang === 'ta') {
      return {
        reply: 'வண்ணம் தீட்டுதல், பிளம்பிங் மற்றும் மின்சார வேலைகள் உள்ளன.',
        action: { type: 'filter_category', filterCategory: 'Repair', label: 'பழுது வேலைகள்' },
      };
    } else {
      return {
        reply: 'Skilled trade gigs (Painting, Plumbing, Electrical, Repair) are available. Tap below.',
        action: { type: 'filter_category', filterCategory: 'Repair', label: 'View Skilled Trades' },
      };
    }
  }

  // Route 6: High Paying Gigs (₹800+)
  if (isHighWage) {
    if (lang === 'te') {
      return {
        reply: 'షిఫ్ట్‌కు ₹800 కంటే ఎక్కువ చెల్లించే ప్రీమియం పనులను ఫిల్టర్ చేసాను! దళారులు లేకుండా మొత్తం సంపాదన మీదే.',
        action: { type: 'filter_min_wage', minWage: 800, label: '₹800+ పనులు చూడండి' },
      };
    } else if (lang === 'hi') {
      return {
        reply: 'मैंने ₹800 या उससे अधिक दैनिक वेतन वाले बेहतरीन काम फ़िल्टर कर दिए हैं! बिना किसी कमीशन के पूरी कमाई आपकी होगी।',
        action: { type: 'filter_min_wage', minWage: 800, label: '₹800+ काम देखें' },
      };
    } else if (lang === 'ta') {
      return {
        reply: 'ஒரு ஷிப்டுக்கு ₹800க்கு மேல் ஊதியம் தரும் வேலைகளைக் காண்க! கமிஷன் இல்லாமல் முழுப் பணம் உங்களுக்கே.',
        action: { type: 'filter_min_wage', minWage: 800, label: '₹800+ வேலைகள்' },
      };
    } else {
      return {
        reply: 'High-paying gigs (₹800+ per shift) filtered for you! 100% direct wage retention with zero platform deductions.',
        action: { type: 'filter_min_wage', minWage: 800, label: 'View ₹800+ Gigs' },
      };
    }
  }

  // Route 7: Payments & Cash/UPI
  if (isPayment) {
    if (lang === 'te') {
      return {
        reply: 'వర్క్ మోజోలో చెల్లింపులు 100% పారదర్శకం: మీరు ఆన్‌లైన్ (యూపీఐ / బ్యాంక్ బదిలీ) లేదా ఆఫ్‌లైన్ నేరుగా నగదు తీసుకోవచ్చు. పని ముగియగానే పూర్తి సంపాదన క్రెడిట్ అవుతుంది.',
        action: { type: 'navigate', target: 'payments', label: 'చెల్లింపుల విభాగం' },
      };
    } else if (lang === 'hi') {
      return {
        reply: 'वर्क मोजो में भुगतान 100% पारदर्शी है: आप ऑनलाइन यूपीआई/बैंक खाता या सीधे नकद में भुगतान ले सकते हैं। काम पूरा होते ही भुगतान डैशबोर्ड में दिखाई देता है।',
        action: { type: 'navigate', target: 'payments', label: 'भुगतान डैशबोर्ड' },
      };
    } else if (lang === 'ta') {
      return {
        reply: 'ஒர்க் மோஜோவில் கட்டணம் முற்றிலும் வெளிப்படையானது: நீங்கள் ஆன்லைன் யுபிஐ அல்லது நேரடியாக ரொக்கமாக ஊதியம் பெறலாம்.',
        action: { type: 'navigate', target: 'payments', label: 'கட்டணப் பக்கம்' },
      };
    } else {
      return {
        reply: 'WorkMojo payments are 100% transparent: choose Instant UPI, Direct Bank Transfer, or Offline Cash with verified digital receipts.',
        action: { type: 'navigate', target: 'payments', label: 'Open Payments' },
      };
    }
  }

  // Route 8: Attendance & QR Check-in
  if (isAttendance) {
    if (lang === 'te') {
      return {
        reply: 'హాజరు నమోదు ప్రక్రియ: పని స్థలానికి చేరుకున్నప్పుడు యజమాని చూపించే ప్రత్యేక క్యూఆర్ కోడ్‌ను స్కాన్ చేయండి. దీంతో సమయం, GPS లొకేషన్ మరియు వేతనం రికార్డు అవుతాయి.',
        action: { type: 'navigate', target: 'confirmed_job', label: 'కన్ఫర్మ్ పని వివరాలు' },
      };
    } else if (lang === 'hi') {
      return {
        reply: 'उपस्थिति दर्ज करना बहुत आसान है: कार्यस्थल पर पहुंचकर नियोक्ता के डिवाइस से डायनामिक क्यूआर कोड स्कैन करें। आपकी उपस्थिति और वेतन तुरंत दर्ज हो जाता है।',
        action: { type: 'navigate', target: 'confirmed_job', label: 'कन्फर्म काम देखें' },
      };
    } else if (lang === 'ta') {
      return {
        reply: 'பணி இடத்திற்குச் சென்றதும் முதலாளி காட்டும் கியூஆர் குறியீட்டை ஸ்கேன் செய்து உங்கள் வருகையைப் பதிவு செய்யவும்.',
        action: { type: 'navigate', target: 'confirmed_job', label: 'உறுதிசெய்த வேலை' },
      };
    } else {
      return {
        reply: 'Tamper-proof QR attendance: scan the dynamic QR code on the employer device upon site arrival to record your shift start and location.',
        action: { type: 'navigate', target: 'confirmed_job', label: 'View Confirmed Gig' },
      };
    }
  }

  // Route 9: Employer Post a Job
  if (isPostJob) {
    if (lang === 'te') {
      return {
        reply: 'కొత్త పనిని పోస్ట్ చేయడానికి 60 సెకన్లలోపు సమయం పడుతుంది: కేటగిరీ ఎంచుకోండి, వేతనం మరియు సమయాన్ని నిర్ణయించి, లొకేషన్ ఎంపిక చేయండి.',
        action: { type: 'navigate', target: 'post_job', label: 'పని పోస్ట్ చేయండి' },
      };
    } else if (lang === 'hi') {
      return {
        reply: 'काम पोस्ट करने में 60 सेकंड से भी कम समय लगता है: काम का प्रकार चुनें, वेतन व समय तय करें और लोकेशन सेट करें।',
        action: { type: 'navigate', target: 'post_job', label: 'नया काम पोस्ट करें' },
      };
    } else if (lang === 'ta') {
      return {
        reply: 'புதிய வேலையைப் பதிவு செய்ய 60 வினாடிகளுக்கும் குறைவான நேரமே ஆகும்: வேலை வகை, ஊதியம், நேரத்தை அமைத்து உடனே பதிவிடுங்கள்.',
        action: { type: 'navigate', target: 'post_job', label: 'வேலை பதிவு செய்ய' },
      };
    } else {
      return {
        reply: 'Posting a job is simple and takes under 60 seconds with our step-by-step wizard. Tap below to create your job posting.',
        action: { type: 'navigate', target: 'post_job', label: 'Post a New Job' },
      };
    }
  }

  // Route 10: Safety & SOS
  if (isSafety) {
    if (lang === 'te') {
      return {
        reply: 'వర్క్ మోజోలో భద్రత ప్రాధాన్యం: కొనసాగుతున్న పనులలో ఎరుపు రంగు SOS బటన్ ఎల్లప్పుడూ ఉంటుంది. అత్యవసరంలో మీ లైవ్ GPS మరియు పని వివరాలు షేర్ అవుతాయి.',
      };
    } else if (lang === 'hi') {
      return {
        reply: 'सुरक्षा हमारी पहली प्राथमिकता है: शिफ्ट के दौरान लाल SOS बटन हमेशा उपलब्ध रहता है जो आपातकाल में तुरंत मदद पहुंचाता है।',
      };
    } else if (lang === 'ta') {
      return {
        reply: 'பாதுகாப்பு முதன்மையானது: அவசர காலங்களில் உதவ சிவப்பு SOS பொத்தான் எப்போதும் கிடைக்கும்.',
      };
    } else {
      return {
        reply: 'Worker safety is paramount: our 24/7 SOS Emergency system instantly broadcasts live GPS location and details to safety responders.',
      };
    }
  }

  // Route 11: General Conversational Fallback
  if (lang === 'te') {
    return {
      reply: `నమస్కారం! నేను వర్క్ మోజో AI అసిస్టెంట్‌ని. ${
        role === 'worker' ? 'వర్కర్లకు' : 'యజమానులకు'
      } అవసరమైన పనులు, ₹800+ వేతనాలు, కన్‌స్ట్రక్షన్, డెలివరీ, చెల్లింపులు లేదా క్యూఆర్ హాజరు గురించి నన్ను అడగండి!`,
    };
  } else if (lang === 'hi') {
    return {
      reply: `नमस्ते! मैं वर्क मोजो AI सहायक हूँ। ${
        role === 'worker' ? 'कामगारों' : 'नियोक्ताओं'
      } के लिए उपलब्ध काम, ₹800+ वेतन, निर्माण, डिलीवरी, भुगतान या क्यूआर उपस्थिति के बारे में मुझसे पूछें!`,
    };
  } else if (lang === 'ta') {
    return {
      reply: `வணக்கம்! நான் ஒர்க் மோஜோ AI உதவியாளர். ${
        role === 'worker' ? 'தொழிலாளர்களுக்கு' : 'முதலாளிகளுக்கு'
      } தேவையான வேலைகள், ₹800+ ஊதியம், கட்டுமான வேலைகள் அல்லது கட்டண முறைகள் பற்றி என்னிடம் கேளுங்கள்!`,
    };
  } else {
    return {
      reply: `Hello! I'm Mojo, your WorkMojo AI assistant. As a ${role}, you can ask me about nearby gigs (Construction, Delivery, Loading), ₹800+ wages, payment methods (UPI/Cash), or QR attendance!`,
    };
  }
}

// Master AI Entry Point
export async function processAiChat(req: AiChatRequest): Promise<AiChatResponse> {
  const language = req.language || 'en';

  if (!req.message || !req.message.trim()) {
    const defaultMsg =
      language === 'te' ? 'దయచేసి మీ సందేశాన్ని టైప్ చేయండి.' :
      language === 'hi' ? 'कृपया अपना संदेश दर्ज करें।' :
      language === 'ta' ? 'தயவுசெய்து உங்கள் செய்தியை உள்ளிடவும்.' :
      'Please enter a message.';
    return {
      success: false,
      reply: defaultMsg,
      language,
      provider: 'mojo-engine',
    };
  }

  // Check 1: Optional Google Gemini API Key
  const geminiKey =
    process.env.GEMINI_API_KEY ||
    process.env.GOOGLE_API_KEY ||
    process.env.GOOGLE_GEMINI_API_KEY ||
    process.env.GEMINI_KEY;

  if (geminiKey && geminiKey.trim() !== '') {
    const geminiReply = await callGemini(geminiKey.trim(), req);
    if (geminiReply) {
      console.log(`[Mojo AI] Query answered via Google Gemini (${language})`);
      const domainQuick = generateDomainResponse(req);
      return {
        success: true,
        reply: geminiReply,
        language,
        provider: 'gemini',
        action: domainQuick.action,
      };
    }
  }

  // Check 2: Optional OpenAI API Key
  const openAiKey = process.env.OPENAI_API_KEY || process.env.OPENAI_KEY;
  if (openAiKey && openAiKey.trim() !== '') {
    const openAiReply = await callOpenAI(openAiKey.trim(), req);
    if (openAiReply) {
      console.log(`[Mojo AI] Query answered via OpenAI (${language})`);
      const domainQuick = generateDomainResponse(req);
      return {
        success: true,
        reply: openAiReply,
        language,
        provider: 'openai',
        action: domainQuick.action,
      };
    }
  }

  // Check 3: Built-in Multilingual Domain Engine (Fast, 100% Reliable, Zero Cost)
  const domainResult = generateDomainResponse(req);
  console.log(`[Mojo AI] Query answered via Built-in Domain Engine (${language})`);
  return {
    success: true,
    reply: domainResult.reply,
    language,
    provider: 'mojo-engine',
    action: domainResult.action,
  };
}


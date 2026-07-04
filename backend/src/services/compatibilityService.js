const CompatibilityScore = require('../models/CompatibilityScore');

const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';

function buildPrompt(tenant, listing) {
  const tenantProfile = {
    preferredLocation: tenant.preferences?.preferredLocation || 'not specified',
    budgetMin: tenant.preferences?.budgetMin || 0,
    budgetMax: tenant.preferences?.budgetMax || 0,
    moveInDate: tenant.preferences?.moveInDate || 'flexible',
    lifestyleTags: tenant.preferences?.lifestyleTags || [],
    about: tenant.preferences?.about || '',
  };
  const listingProfile = {
    title: listing.title,
    city: listing.location?.city,
    address: listing.location?.address,
    rent: listing.rent,
    roomType: listing.roomType,
    furnishing: listing.furnishing,
    genderPreference: listing.genderPreference,
    amenities: listing.amenities || [],
    availableFrom: listing.availableFrom,
    description: listing.description,
  };
  return `You are a rental-matching assistant. Given this room listing: ${JSON.stringify(listingProfile)} and this tenant profile: ${JSON.stringify(tenantProfile)}, compute a compatibility score from 0 to 100 based primarily on budget fit and location match, and secondarily on move-in date alignment and lifestyle/amenity fit.\n\nRespond with ONLY valid JSON, no markdown fences, no extra text, in exactly this shape:\n{"score": <integer 0-100>, "explanation": "<one or two sentence reason, under 240 characters>"}`;
}

function fallbackScore(tenant, listing) {
  let score = 50;
  const reasons = [];
  const budgetMin = tenant.preferences?.budgetMin || 0;
  const budgetMax = tenant.preferences?.budgetMax || Infinity;
  const rent = listing.rent;
  if (rent >= budgetMin && rent <= budgetMax) {
    score += 30; reasons.push('rent fits within budget');
  } else {
    const distance = rent < budgetMin ? budgetMin - rent : rent - budgetMax;
    const ref = budgetMax === Infinity ? rent : budgetMax;
    const overBy = ref > 0 ? distance / ref : 1;
    if (overBy <= 0.15) { score += 10; reasons.push('rent close to budget'); }
    else { score -= 20; reasons.push('rent outside budget range'); }
  }
  const pref = (tenant.preferences?.preferredLocation || '').toLowerCase().trim();
  const city = (listing.location?.city || '').toLowerCase().trim();
  const addr = (listing.location?.address || '').toLowerCase().trim();
  if (pref && (city.includes(pref) || addr.includes(pref) || pref.includes(city))) {
    score += 20; reasons.push('location matches preference');
  } else if (pref) { score -= 10; reasons.push('location differs from preference'); }
  if (listing.genderPreference && listing.genderPreference !== 'any' && tenant.gender) {
    listing.genderPreference === tenant.gender ? score += 5 : (score -= 25, reasons.push('gender mismatch'));
  }
  score += Math.min((listing.amenities || []).length, 5);
  return { score: Math.max(0, Math.min(100, Math.round(score))), explanation: `Rule-based: ${reasons.join('; ') || 'limited data'}.` };
}

async function callGroq(tenant, listing) {
  const apiKey = process.env.GROQ_API_KEY;
  if (!apiKey) throw new Error('Groq API key not configured');
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 12000);
  try {
    const response = await fetch(GROQ_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || 'llama-3.3-70b-versatile',
        messages: [
          { role: 'system', content: 'You are a rental compatibility scoring engine. Always respond with ONLY valid JSON, no markdown, no extra text.' },
          { role: 'user', content: buildPrompt(tenant, listing) },
        ],
        temperature: 0.3,
        max_tokens: 300,
      }),
      signal: controller.signal,
    });
    if (!response.ok) throw new Error(`Groq API status ${response.status}`);
    const data = await response.json();
    const raw = data.choices?.[0]?.message?.content?.trim() || '';
    const parsed = JSON.parse(raw.replace(/```json|```/g, '').trim());
    if (typeof parsed.score !== 'number' || !parsed.explanation) throw new Error('Unexpected shape');
    return { score: Math.max(0, Math.min(100, Math.round(parsed.score))), explanation: String(parsed.explanation).slice(0, 500) };
  } finally { clearTimeout(timeout); }
}

async function getOrComputeCompatibility(tenant, listing, { force = false } = {}) {
  if (!force) {
    const existing = await CompatibilityScore.findOne({ tenant: tenant._id, listing: listing._id });
    if (existing) return existing;
  }
  let result, method = 'llm';
  try { result = await callGroq(tenant, listing); }
  catch (err) {
    console.warn(`[compatibility] Groq unavailable, using fallback: ${err.message}`);
    result = fallbackScore(tenant, listing); method = 'fallback';
  }
  return await CompatibilityScore.findOneAndUpdate(
    { tenant: tenant._id, listing: listing._id },
    { score: result.score, explanation: result.explanation, method },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

module.exports = { getOrComputeCompatibility, fallbackScore, buildPrompt };
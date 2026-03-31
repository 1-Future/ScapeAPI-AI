// ── Local AI via Ollama ───────────────────────────────────────────────────────
// Processes NPC dialogue prompts locally. No API key, no internet, no cost.
// Requires: ollama running locally (ollama serve)

const OLLAMA_URL = process.env.OLLAMA_URL || 'http://localhost:11434';
const MODEL = process.env.OLLAMA_MODEL || 'qwen2.5:14b';

let enabled = false;

async function checkOllama() {
  try {
    const res = await fetch(`${OLLAMA_URL}/api/tags`);
    if (res.ok) {
      const data = await res.json();
      const models = data.models?.map(m => m.name) || [];
      console.log(`[ollama] Connected. Models: ${models.join(', ')}`);
      if (models.some(m => m.startsWith(MODEL.split(':')[0]))) {
        enabled = true;
        console.log(`[ollama] Using model: ${MODEL}`);
      } else {
        console.log(`[ollama] Model ${MODEL} not found. Run: ollama pull ${MODEL}`);
      }
    }
  } catch {
    console.log(`[ollama] Not running. Local AI disabled. Start with: ollama serve`);
  }
  return enabled;
}

async function generate(prompt) {
  if (!enabled) return null;

  try {
    const res = await fetch(`${OLLAMA_URL}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: MODEL,
        prompt,
        stream: false,
        options: {
          temperature: 0.8,
          top_p: 0.9,
          num_predict: 100, // Keep responses short
          stop: ['\n\n', 'Player:', 'says:'], // Stop at natural breaks
        },
      }),
    });

    if (!res.ok) {
      console.error(`[ollama] Error: ${res.status}`);
      return null;
    }

    const data = await res.json();
    // Clean up response — take first 1-2 sentences
    let text = (data.response || '').trim();
    // Remove any "NPC:" prefix the model might add
    text = text.replace(/^[A-Za-z\s]+:\s*["']?/, '').replace(/["']$/, '');
    // Limit to ~200 chars
    if (text.length > 200) text = text.slice(0, 200).replace(/\s+\S*$/, '...');
    return text || null;
  } catch (e) {
    console.error(`[ollama] Generate error: ${e.message}`);
    return null;
  }
}

function isEnabled() { return enabled; }

module.exports = { checkOllama, generate, isEnabled };

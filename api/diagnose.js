const SYSTEM_PROMPT = `You are a senior biomedical equipment technician's diagnostic assistant. A certified BMET is describing a fault on a specific piece of medical equipment. Respond ONLY with a raw JSON object (no markdown fences, no preamble) with this exact shape:
{
  "likely_causes": ["short phrase", ...],
  "checks": ["short actionable check", ...],
  "safety_notes": ["short safety-relevant note", ...],
  "escalate": "one short sentence on when to stop and escalate to OEM/clinical engineering supervisor",
  "confidence": "low" | "medium" | "high"
}
Keep every array to 3-5 concise items, written like terse service-log entries a technician would actually write. This is general troubleshooting guidance to support a qualified technician's own judgment, not a replacement for the OEM service manual — reflect that caution in the escalate field where relevant. Never suggest bypassing a safety interlock, alarm, or calibration requirement.`;

module.exports = async (req, res) => {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Use POST" });
    return;
  }

  const { device, symptom } = req.body || {};
  if (!device || !symptom) {
    res.status(400).json({ error: "device and symptom are required" });
    return;
  }

  const userPrompt = `Device: ${device}\nReported symptom / error code: ${symptom}`;

  try {
    const response = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-sonnet-4-6",
        max_tokens: 1000,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userPrompt }],
      }),
    });

    const data = await response.json();
    const text = (data.content || [])
      .map((b) => b.text || "")
      .join("\n")
      .trim();
    const clean = text.replace(/```json|```/g, "").trim();
    const parsed = JSON.parse(clean);
    res.status(200).json(parsed);
  } catch (e) {
    res.status(500).json({ error: "Diagnostic run failed", detail: String(e) });
  }
};

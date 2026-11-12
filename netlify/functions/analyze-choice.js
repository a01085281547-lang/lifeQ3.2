// 선택한 매물을 Gemini가 분석하고, 더 나은 대안이 있으면 알려주는 함수
const MODEL_DEFAULT = "gemini-3.5-flash";

const SYSTEM_INSTRUCTION = `당신은 청소년 경제교육 서비스 LifeQ의 '자취방 선택 코치'입니다.
고등학생·사회 초년생이 이해하기 쉬운 한국어 해요체로, 친절하지만 솔직하게 말합니다.
모든 매물·인물·위치는 학습용 가상 데이터입니다. 실제 법률 자문, 실제 시세, 법령 조항, 기관 정책은 단정하지 않습니다.
제공된 숫자와 항목만 근거로 삼고, 없는 사실을 지어내지 않습니다.
특정 중개인·임대인을 사기꾼으로 단정하지 않고 '확인이 필요한 신호'로 표현합니다.
실제 송금이나 계약을 권하지 않습니다.`;

const json = (statusCode, payload) => ({
  statusCode,
  headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  body: JSON.stringify(payload)
});
const num = (v, min, max, d = 0) => Number.isFinite(Number(v)) ? Math.max(min, Math.min(max, Number(v))) : d;
const str = (v, n, d = "미확인") => String(v ?? d).slice(0, n);

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return json(405, { error: "Method not allowed" });
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return json(503, { error: "GEMINI_API_KEY is not configured" });
  if (!event.body || event.body.length > 20000) return json(400, { error: "Invalid request size" });

  let body;
  try { body = JSON.parse(event.body); } catch { return json(400, { error: "Invalid JSON request" }); }

  const rawList = Array.isArray(body.listings) ? body.listings.slice(0, 3) : [];
  const listings = rawList.map(x => {
    const rent = num(x?.rent, 0, 1000), fee = num(x?.fee, 0, 1000);
    return {
      id: str(x?.id, 10, "?"), title: str(x?.title, 60),
      depositMan: num(x?.deposit, 0, 100000), rentMan: rent, feeMan: fee, monthlyMan: rent + fee,
      commuteMinutes: num(x?.commute, 0, 180), station: str(x?.station, 60), environment: str(x?.environment, 100),
      size: str(x?.size, 20), floor: str(x?.floor, 40),
      feeIncludes: str(x?.includes, 100), feeExcludes: str(x?.excludes, 100),
      checks: Array.isArray(x?.checks) ? x.checks.slice(0, 4).map(c => str(c, 160)) : []
    };
  });
  const selectedId = str(body.selectedId, 10, "");
  const selected = listings.find(l => l.id === selectedId);
  if (listings.length < 2 || !selected) return json(400, { error: "Invalid listings" });

  const p = body.persona && typeof body.persona === "object" ? body.persona : {};
  const limitMan = Math.round(num(p.monthlyHousingLimit, 0, 3000000, 550000) / 10000);
  const persona = {
    name: str(p.name, 20, "박서윤"), age: num(p.age, 18, 30, 20), status: str(p.status, 80, "가상 대학 신입생"),
    monthlyHousingLimitMan: limitMan, depositBudgetMan: 800,
    priorities: Array.isArray(p.priorities) ? p.priorities.slice(0, 5).map(x => str(x, 40)) : ["통학 편의성", "월 지출", "야간 소음", "계약 확인 가능 여부"]
  };
  const summaryLines = listings.map(l => `- ${l.id}: 월 기본 주거비 ${l.monthlyMan}만원(한도 ${limitMan}만원 대비 ${l.monthlyMan - limitMan > 0 ? "+" : ""}${l.monthlyMan - limitMan}만원), 보증금 ${l.depositMan}만원(예산 800만원 대비 ${l.depositMan - 800}만원), 통학 ${l.commuteMinutes}분`).join("\n");

  const prompt = `[의뢰인]\n${JSON.stringify(persona)}\n\n[매물 3개 상세]\n${JSON.stringify(listings)}\n\n[미리 계산한 비교(이 숫자를 그대로 사용)]\n${summaryLines}\n\n[플레이어가 선택한 매물]\n${selected.id}\n\n[할 일]\n1. 선택한 매물이 의뢰인의 한도·우선순위(통학 → 월 지출 → 소음 → 계약 확인 가능 여부)에 얼마나 맞는지 분석합니다.\n2. 매물의 checks(계약 전 확인 사항)에 있는 위험 신호가 있으면 반드시 언급합니다.\n3. 다른 매물이 더 나은 점이 실제로 있을 때만 대안으로 제시하고, 얻는 것과 포기하는 것(장단점)을 함께 말합니다. 선택이 충분히 합리적이면 alternative.id는 null로 두세요.\n4. 월세+관리비 외에 공과금이 별도라는 점을 잊지 마세요.\n\n아래 JSON 객체만 출력하세요. 마크다운·설명 금지.\n{"fit":"good|mixed|caution 중 하나","headline":"한 줄 총평(40자 이내)","summary":"선택 매물 분석 2~3문장","strengths":["이 매물의 좋은 점 2~3개(각 60자 이내)"],"concerns":["걱정되는 점 또는 확인할 점 2~3개(각 60자 이내)"],"alternative":{"id":"더 나을 수 있는 매물 id 또는 null","reason":"그 매물이 나은 점과 포기해야 할 점 2문장 이내(없으면 빈 문자열)"},"nextStep":"조사 단계에서 꼭 확인할 것 1문장"}`;

  const model = process.env.GEMINI_MODEL || MODEL_DEFAULT;
  const generationConfig = { temperature: 0.5, maxOutputTokens: 4096, responseMimeType: "application/json" };
  if (model.startsWith("gemini-3")) generationConfig.thinkingConfig = { thinkingLevel: "low" };

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig
      })
    });
    if (!response.ok) {
      console.error("Gemini HTTP", response.status, (await response.text()).slice(0, 500));
      return json(502, { error: `Gemini API returned HTTP ${response.status}` });
    }
    const result = await response.json();
    const parts = result?.candidates?.[0]?.content?.parts || [];
    const text = parts.filter(x => !x.thought).map(x => typeof x.text === "string" ? x.text : "").join("").trim();
    const r = JSON.parse(text.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, ""));

    const list = (v, max, len) => (Array.isArray(v) ? v : []).filter(s => typeof s === "string" && s.trim()).slice(0, max).map(s => s.slice(0, len));
    const strengths = list(r.strengths, 3, 120), concerns = list(r.concerns, 3, 120);
    if (typeof r.summary !== "string" || !strengths.length || !concerns.length) throw new Error("Invalid analysis schema");
    let altId = r.alternative && typeof r.alternative.id === "string" ? r.alternative.id : null;
    if (!altId || altId === selected.id || !listings.some(l => l.id === altId)) altId = null;
    return json(200, {
      fit: ["good", "mixed", "caution"].includes(r.fit) ? r.fit : "mixed",
      headline: str(r.headline, 60, "분석 결과"),
      summary: r.summary.slice(0, 600),
      strengths, concerns,
      alternative: { id: altId, reason: altId ? str(r.alternative.reason, 300, "") : "" },
      nextStep: str(r.nextStep, 200, "")
    });
  } catch (error) {
    console.error("LifeQ analysis failed:", error?.message || error);
    return json(502, { error: "Gemini response could not be validated" });
  }
};

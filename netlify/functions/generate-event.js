const SYSTEM_INSTRUCTION = `당신은 청소년 경제교육 서비스 LifeQ의 시나리오 작가입니다.
사용자가 가상으로 경험할 수 있는 첫 자취 계약 관련 교육 사례를 한국어로 만듭니다.
실제 법률 자문, 실제 매물 정보, 법령 조항·금액·최신 제도에 관한 단정은 하지 않습니다.
일반적인 확인 습관(실제 매물 확인, 계약 상대방·권한 확인, 계약서와 비용 항목 확인, 송금을 서두르지 않기)을 중심으로 합니다.
사실처럼 보이는 가짜 법률 규정이나 기관 안내를 만들지 마세요.`;

const jsonResponse = (statusCode, payload) => ({
  statusCode,
  headers: { "Content-Type": "application/json; charset=utf-8", "Cache-Control": "no-store" },
  body: JSON.stringify(payload)
});

exports.handler = async (event) => {
  if (event.httpMethod !== "POST") return jsonResponse(405, { error: "Method not allowed" });
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) return jsonResponse(503, { error: "GEMINI_API_KEY is not configured" });
  if (!event.body || event.body.length > 16384) return jsonResponse(400, { error: "Invalid request size" });

  let body;
  try { body = JSON.parse(event.body); }
  catch { return jsonResponse(400, { error: "Invalid JSON request" }); }

  const raw = body.property && typeof body.property === "object" ? body.property : {};
  const property = {
    id: String(raw.id || "선택 매물").slice(0, 20),
    title: String(raw.title || "가상 원룸").slice(0, 80),
    deposit: Number.isFinite(Number(raw.deposit)) ? Math.max(0, Math.min(100000, Number(raw.deposit))) : 0,
    rent: Number.isFinite(Number(raw.rent)) ? Math.max(0, Math.min(10000, Number(raw.rent))) : 0,
    fee: Number.isFinite(Number(raw.fee)) ? Math.max(0, Math.min(10000, Number(raw.fee))) : 0,
    location: String(raw.location || "가상 위치").slice(0, 80),
    station: String(raw.station || "미확인").slice(0, 80),
    commuteMinutes: Number.isFinite(Number(raw.commuteMinutes)) ? Math.max(0, Math.min(180, Number(raw.commuteMinutes))) : null,
    environment: String(raw.environment || "미확인").slice(0, 120),
    includes: String(raw.includes || "미확인").slice(0, 120),
    excludes: String(raw.excludes || "미확인").slice(0, 120)
  };
  const topic = String(body.topic || "청소년의 첫 자취 계약 안전").slice(0, 100);
  const focus = String(body.learningFocus || "계약 전 확인").slice(0, 60);
  const rawPersona = body.persona && typeof body.persona === "object" ? body.persona : {};
  const persona = {
    name: String(rawPersona.name || "박서윤").slice(0, 20),
    age: Number.isFinite(Number(rawPersona.age)) ? Math.max(18, Math.min(30, Number(rawPersona.age))) : 20,
    status: String(rawPersona.status || "가상 대학 신입생").slice(0, 80),
    monthlyHousingLimit: Number.isFinite(Number(rawPersona.monthlyHousingLimit)) ? Math.max(0, Math.min(3000000, Number(rawPersona.monthlyHousingLimit))) : 550000,
    priorities: Array.isArray(rawPersona.priorities) ? rawPersona.priorities.slice(0, 5).map(x => String(x).slice(0, 40)) : ["통학 편의성", "월 지출", "야간 소음", "계약 확인 가능 여부"]
  };
  const prompt = `당신은 LifeQ의 인터랙티브 생활 시뮬레이션 레벨 디자이너입니다. 플레이어가 실제로 클릭하고 조사하는 데 사용할 사건을 설계하세요.
[플레이어 의뢰인]
${JSON.stringify(persona)}
[미션 조건]
주제: ${topic}
학습 초점: ${focus}
가상 시작 예산: 8,000,000원
선택한 매물의 고정 조건: ${JSON.stringify(property)}
[설계 지시]
1. 의뢰인의 월 주거비 한도와 통학 조건, 주변 환경 우선순위에 맞춰 조사할 단서를 설계합니다.
2. 단서 3개는 서로 다른 조사 방식이어야 합니다: 주변 환경·교통, 방 내부 상태·시설, 중개 담당자·계약 서류 중 세 가지를 포함합니다.
3. 매물의 보증금·월세·관리비·포함/별도 항목을 바꾸지 않습니다. 비용 계산이 일치해야 합니다.
4. 각 단서는 화면의 지도 POI, 방 구조도 hotspot, 담당자 대화 중 하나에서 발견할 수 있는 짧고 구체적인 내용으로 만듭니다.
5. 선택지마다 결과가 달라져야 합니다. 성급한 선택에는 게임 안의 가상 비용·기회 손실을, 확인을 거친 선택에는 예산 보전 또는 추가 정보 획득을 연결합니다. 실제 법률상 보증금 반환 결과처럼 표현하지 않습니다.
6. 학생이 실제 송금·계약을 하도록 유도하지 않습니다. 모든 인물·매물·위치·상황은 가상입니다.

선택한 매물의 조건을 임의로 바꾸지 말고, 사실로 확인되지 않은 법률 조항·기관 정책·통계·거리 정보를 만들어내지 마세요.

아래 JSON 객체만 출력하세요. 마크다운 코드블록이나 설명을 붙이지 마세요.
필수 구조:
{"title":"사건 제목","intro":"사건 소개 2~3문장","clues":[{"title":"단서 제목","teaser":"목록용 한 줄","detail":"학생이 읽을 조사 내용 2~4문장"},{"title":"단서 제목","teaser":"목록용 한 줄","detail":"조사 내용"},{"title":"단서 제목","teaser":"목록용 한 줄","detail":"조사 내용"}],"options":[{"text":"선택지 문장","sub":"보충 설명","correct":false,"feedback":"선택 결과 해설"},{"text":"선택지 문장","sub":"보충 설명","correct":true,"feedback":"선택 결과 해설"},{"text":"선택지 문장","sub":"보충 설명","correct":false,"feedback":"선택 결과 해설"}],"answer":1,"lesson":"사건에서 배울 핵심 내용 2~3문장"}
제약:
- 단서는 정확히 3개, 선택지는 정확히 3개 만드세요.
- 정답은 하나만 true로 하고 answer는 그 선택지의 0부터 시작하는 인덱스입니다.
- 정답은 서두르지 않고 관련 정보와 조건을 확인하는 신중한 행동이어야 합니다.
- 학생을 겁주거나 특정 업체·개인을 사기꾼으로 단정하지 마세요.
- 교육 목적의 가상 사례로 만들고 실제 송금·계약을 유도하지 마세요.
- 짧고 명확한 한국어를 사용하세요.`;

  const model = process.env.GEMINI_MODEL || "gemini-3.5-flash";
  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${encodeURIComponent(model)}:generateContent`, {
      method: "POST",
      headers: { "Content-Type": "application/json", "x-goog-api-key": apiKey },
      body: JSON.stringify({
        systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
        contents: [{ role: "user", parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.65, maxOutputTokens: 4096, responseMimeType: "application/json", ...(model.startsWith("gemini-3") ? { thinkingConfig: { thinkingLevel: "low" } } : {}) }
      })
    });
    if (!response.ok) return jsonResponse(502, { error: `Gemini API returned HTTP ${response.status}` });
    const result = await response.json();
    const parts = result?.candidates?.[0]?.content?.parts || [];
    const generated = parts.filter(part => !part.thought).map(part => typeof part.text === "string" ? part.text : "").join("").trim();
    const scenario = JSON.parse(generated.replace(/^```(?:json)?\s*/i, "").replace(/\s*```$/, ""));
    if (!scenario || !Array.isArray(scenario.clues) || scenario.clues.length !== 3 || !Array.isArray(scenario.options) || scenario.options.length !== 3) {
      throw new Error("Invalid scenario arrays");
    }
    const answer = Number(scenario.answer);
    if (![0, 1, 2].includes(answer) || scenario.options.filter(option => option.correct === true).length !== 1 || scenario.options[answer].correct !== true) {
      throw new Error("Invalid scenario answer");
    }
    for (const clue of scenario.clues) {
      if (!clue || typeof clue.title !== "string" || typeof clue.teaser !== "string" || typeof clue.detail !== "string") throw new Error("Invalid clue schema");
      clue.title = clue.title.slice(0, 40); clue.teaser = clue.teaser.slice(0, 90); clue.detail = clue.detail.slice(0, 700);
    }
    for (const option of scenario.options) {
      if (!option || typeof option.text !== "string" || typeof option.feedback !== "string") throw new Error("Invalid option schema");
      option.text = option.text.slice(0, 240); option.sub = String(option.sub || "").slice(0, 180); option.feedback = option.feedback.slice(0, 400);
    }
    scenario.title = String(scenario.title || "새로운 계약 확인 사건").slice(0, 100);
    scenario.intro = String(scenario.intro || "가상 매물의 조건을 확인해 보세요.").slice(0, 400);
    scenario.lesson = String(scenario.lesson || "계약 전 확인 사항을 차례로 살펴보세요.").slice(0, 500);
    scenario.answer = answer;
    return jsonResponse(200, scenario);
  } catch (error) {
    console.error("LifeQ scenario generation failed:", error?.message || error);
    return jsonResponse(502, { error: "Gemini response could not be validated" });
  }
};

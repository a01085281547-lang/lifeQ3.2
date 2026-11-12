'use strict';

const STORAGE_KEY = 'lifeq_demo_v1';
const DEFAULT_STATE = {
  points: 120,
  rankPoints: 120,
  xp: 0,
  completedLessons: [],
  rewardedQuizzes: [],
  activityLog: [],
  pilotResponses: [],
  accessibility: { fontScale: 1, highContrast: false },
  completedLesson: false,
  quizCompleted: false,
  questCompleted: false,
  duelPlayed: false,
  duelBest: 0,
  wrongAnswers: [],
  reviewedCount: 0,
  quizCorrect: 0,
  quizTotal: 0,
  studyMinutes: 0,
  responseTimes: [],
  streak: 0,
  purchases: [],
  lastPlayed: null,
  sim: null,
  profile: { name: '플레이어', bio: '나만의 생활경제 플레이 기록을 만들어 보세요.', interest: '주거·임대차', avatar: '🏡', accent: '#d8f58c' }
};

const QUIZ_QUESTIONS = [
  {
    id: 'rent-cost', category: '주거비 계산', topic: '주거비 기초',
    question: '월세 48만 원, 관리비 9만 원인 방을 선택했습니다. 매달 기본적으로 예상해야 하는 주거비는 얼마일까요?',
    options: ['48만 원', '57만 원', '800만 원', '39만 원'], correct: 1,
    explanation: '월세와 관리비를 합산하면 48만 원 + 9만 원 = 57만 원입니다. 관리비에 포함되지 않는 항목이 있다면 실제 지출은 더 늘어날 수 있어요.'
  },
  {
    id: 'deposit-meaning', category: '금융 기초', topic: '보증금 이해',
    question: '주거 계약에서 보증금에 대한 설명으로 가장 알맞은 것은 무엇일까요?',
    options: ['매달 내는 임대료', '공과금만을 위한 비용', '계약 이행 등을 위해 맡기는 금액', '중개 수수료와 같은 비용'], correct: 2,
    explanation: '보증금은 계약 이행을 담보하기 위해 맡기는 금액입니다. 계약 종료 시에는 미납금이나 손해 등 정산 조건을 확인하고 반환 절차를 살펴야 합니다.'
  },
  {
    id: 'contract-check', category: '계약 안전', topic: '계약 전 확인',
    question: '집을 보러 가기 전 보증금을 먼저 보내 달라는 연락을 받았습니다. 가장 적절한 행동은 무엇일까요?',
    options: ['서둘러 일부 금액을 보낸다', '매물 사진이 좋으면 바로 송금한다', '계약 상대방과 권리관계, 계약 조건을 직접 확인한 뒤 판단한다', '메시지로 받은 계좌만 확인한다'], correct: 2,
    explanation: '송금을 서두르기보다 실제 매물과 계약 상대방, 관련 서류 및 계약 조건을 확인해야 합니다. 확인이 끝나기 전에는 성급하게 돈을 보내지 않는 것이 안전합니다.'
  }
];

const DUEL_QUESTIONS = [
  { question: '월세 52만 원과 관리비 7만 원을 합하면 한 달 기본 주거비는?', options: ['45만 원', '59만 원', '52만 원'], correct: 1, rival: 1, explanation: '52만 원 + 7만 원 = 59만 원입니다.' },
  { question: '계약 전 확인해야 할 정보로 가장 적절한 것은?', options: ['계약 상대방과 권리관계, 계약 조건', '인테리어 사진의 색감', '메시지에 적힌 할인 문구'], correct: 0, rival: 0, explanation: '상대방의 신원과 권리관계, 계약 조건은 계약 전 반드시 확인해야 할 핵심 정보입니다.' },
  { question: '관리비를 확인할 때 가장 중요한 것은?', options: ['금액만 보고 판단하기', '다른 매물보다 낮으면 무조건 선택하기', '포함 항목과 별도 부담 항목을 함께 확인하기'], correct: 2, rival: 2, explanation: '관리비에 무엇이 포함되고 무엇을 별도로 내야 하는지 확인해야 실제 지출을 예상할 수 있습니다.' }
];

const DEFAULT_CASE = {
  title: '예산 800만 원, 첫 자취방을 찾아라.',
  intro: '독립을 앞둔 당신에게 마음에 드는 원룸 매물이 도착했습니다. 조건은 괜찮아 보이지만, 계약을 서두르는 연락이 왔습니다. 눈에 보이는 조건만 믿어도 괜찮을까요?',
  clues: [
    { id: 'message', icon: '✉', title: '급한 계약 요청', teaser: '오늘 안에 예약금을 보내 달라는 연락', detail: '중개 담당자라고 소개한 사람이 “다른 사람도 보고 있으니 오늘 안에 10만 원을 보내면 방을 잡아 주겠다”고 말합니다. 아직 실제 방을 확인하지 않았고, 계약서도 전달받지 못했습니다. 서두르게 만드는 말은 한 번 더 확인해야 할 신호입니다.' },
    { id: 'account', icon: '▤', title: '입금 계좌 정보', teaser: '안내받은 계좌와 계약 상대방 정보가 다름', detail: '문자로 받은 계좌 예금주가 계약서에 표시된 임대인 이름과 일치하지 않습니다. 사정이 있을 수도 있지만, 관계와 권한을 확인하기 전에는 송금하지 말고 공식적인 확인 절차를 거쳐야 합니다.' },
    { id: 'fee', icon: '₩', title: '관리비 세부 내역', teaser: '관리비 9만 원에 포함되지 않는 항목', detail: '매물 설명에는 관리비 9만 원이라고 적혀 있지만, 안내문에는 인터넷과 수도 요금이 별도라고 적혀 있습니다. 월세 48만 원과 관리비 9만 원만으로 매달 지출을 확정하면 안 됩니다. 포함·별도 항목을 확인해 총비용을 계산해야 합니다.' }
  ],
  options: [
    { text: '방을 직접 확인하기 전이라도 예약금을 먼저 보내고 나중에 서류를 확인한다.', sub: '다른 사람에게 매물을 뺏길 수 있으니 빠르게 결정한다.', correct: false, feedback: '위험한 선택입니다. 확인되지 않은 상대방에게 먼저 돈을 보내면 돌려받기 어려운 상황이 생길 수 있습니다.' },
    { text: '실제 매물과 계약 상대방, 관련 서류 및 전체 비용을 확인한 뒤 결정한다.', sub: '계좌 정보가 다른 이유와 관리비 포함 항목도 확인한다.', correct: true, feedback: '가장 신중한 선택입니다. 매물·상대방·계약 조건·추가 비용을 확인한 뒤 결정해야 합니다.' },
    { text: '매물 사진과 후기만 믿고 계약을 진행한다.', sub: '온라인에 정보가 있으니 별도 확인은 생략한다.', correct: false, feedback: '사진과 후기는 계약의 안전성을 보장하지 않습니다. 실제 매물과 계약 관련 정보는 별도로 확인해야 합니다.' }
  ],
  answer: 1,
  lesson: '계약 전에는 실제 매물, 계약 상대방의 신원과 권한, 관련 서류, 보증금·월세·관리비 및 별도 비용을 차례로 확인하세요. 서두르라는 요구가 있더라도 확인을 생략하지 않는 것이 중요합니다.'
};


// Three fictional room listings for the housing comparison mission.
// Amounts are in units of 10,000 KRW; monthly base cost excludes utilities.
const LISTINGS = [
  {
    id: 'A-01', title: '햇살이 잘 드는 역세권 원룸', location: '대구 중구 남산동 · 예시 위치', station: '반월당역 도보 8분', commute: 28, environment: '주변 상가 보통 · 밤 시간대 확인 권장', typeTag: '비용 균형형', visual: 'visual-a',
    deposit: 500, rent: 43, fee: 7, monthly: 50, size: '18.2㎡', floor: '3층 / 5층', direction: '남향',
    includes: '수도 · 인터넷 · 공용 청소', excludes: '전기 · 가스',
    summary: '월 기본 주거비가 비교적 균형적이며 현장 방문 일정을 잡을 수 있는 매물입니다.',
    checks: ['관리비 7만 원에는 수도·인터넷·공용 청소가 포함되고 전기·가스는 별도입니다.', '현장 방문이 가능하다고 안내되어 있습니다. 실제 방 상태와 옵션을 직접 확인해야 합니다.', '계약 상대방의 신원·권한과 관련 서류는 계약 전에 직접 대조해야 합니다.'],
    scenario: {
      title: 'A-01 매물, 실제 조건과 서류를 확인해 보세요.',
      intro: '기본 주거비는 월 50만 원이며, 수도와 인터넷이 관리비에 포함된다고 안내되어 있습니다. 방문 일정을 잡을 수 있지만, 안내 내용만으로 계약이 안전하다고 단정할 수는 없습니다.',
      clues: [
        { id: 'a-visit', icon: '⌂', title: '현장 방문 가능', teaser: '실제 방과 옵션을 확인할 수 있는 일정 안내', detail: '중개 담당자는 평일 저녁과 주말에 방을 보여줄 수 있다고 안내했습니다. 사진과 실제 방의 구조·채광·누수 흔적·잠금장치·옵션 상태가 같은지 직접 확인하세요. 방문 가능하다는 사실만으로 매물 정보가 모두 검증된 것은 아닙니다.' },
        { id: 'a-fee', icon: '₩', title: '관리비 포함 항목', teaser: '수도·인터넷·공용 청소 포함, 전기·가스 별도', detail: '관리비는 월 7만 원이며 수도, 인터넷, 공용 공간 청소가 포함된다고 안내되어 있습니다. 전기와 가스는 별도 부담입니다. 따라서 월 기본 주거비 50만 원에 실제 사용량에 따른 공과금이 추가됩니다. 계약서와 관리비 안내문에 같은 내용이 적혀 있는지 확인하세요.' },
        { id: 'a-docs', icon: '▤', title: '계약 관련 서류', teaser: '계약 상대방과 권리관계 확인은 아직 진행 전', detail: '담당자는 계약 전에 소유자 정보와 계약 관련 서류를 확인할 수 있다고 안내했습니다. 아직 서류를 직접 확인한 상태는 아닙니다. 계약 상대방의 신원과 권한, 등기 관련 정보, 계약서의 보증금·월세·기간을 서로 대조한 뒤 판단해야 합니다.' }
      ],
      options: [
        { text: '방문 예약을 하고 실제 방을 확인한 뒤, 계약 상대방의 권한과 서류 및 비용 항목을 대조한다.', sub: '확인되지 않은 내용은 질문하고, 서류가 일치할 때 다음 단계로 넘어간다.', correct: true, feedback: '좋은 판단입니다. 방문 가능 여부와 안내된 가격만으로 결론 내리지 않고 실제 방, 상대방의 권한, 계약서와 비용 항목을 확인하는 순서를 선택했습니다.' },
        { text: '역과 가깝고 예산 안에 들어오므로 서류 확인 전에 계약금을 보낸다.', sub: '다른 사람이 먼저 계약할 수 있으니 빠르게 결정한다.', correct: false, feedback: '위험한 선택입니다. 매물이 마음에 들더라도 실제 방과 계약 상대방, 서류를 확인하기 전에 돈을 보내면 안 됩니다.' },
        { text: '관리비에 수도와 인터넷이 포함되어 있으니 추가 확인 없이 안전한 매물이라고 판단한다.', sub: '월 기본 주거비만 계산하고 계약을 진행한다.', correct: false, feedback: '관리비 항목은 비용을 계산하는 정보일 뿐 계약의 안전성을 보장하지 않습니다. 실제 방, 상대방의 권한, 관련 서류도 확인해야 합니다.' }
      ],
      answer: 0,
      lesson: 'A-01은 관리비 항목과 방문 가능 여부가 비교적 구체적으로 안내되어 있지만, 그것만으로 계약 안전성이 확인되는 것은 아닙니다. 실제 방 상태, 계약 상대방의 권한, 서류와 계약서, 별도 공과금을 직접 확인해야 합니다.'
    }
  },
  {
    id: 'B-02', title: '월세가 낮은 대학가 원룸', location: '대구 북구 복현동 · 예시 위치', station: '대학가 버스정류장 도보 4분', commute: 9, environment: '식당가 인접 · 저녁 소음 확인 필요', typeTag: '저월세형', visual: 'visual-b',
    deposit: 700, rent: 36, fee: 5, monthly: 41, size: '16.5㎡', floor: '2층 / 4층', direction: '동향',
    includes: '공용 공간 청소', excludes: '수도 · 인터넷 · 전기 · 가스',
    summary: '월세는 세 매물 중 낮지만 보증금이 크고 계약 전 확인할 내용이 있습니다.',
    checks: ['오늘 안에 예약금 10만 원을 보내 달라는 메시지가 있습니다.', '안내받은 계좌 예금주와 계약서상 임대인 이름이 일치하지 않습니다.', '관리비 5만 원에는 공용 공간 청소만 포함된다고 안내되어 있습니다.'],
    scenario: {
      title: 'B-02 매물, 낮은 월세 뒤의 단서를 확인해 보세요.',
      intro: '세 매물 중 월세는 가장 낮지만 보증금은 700만 원입니다. 안내 메시지에는 빠른 예약을 요청하는 내용이 있어 가격 외의 조건도 살펴봐야 합니다.',
      clues: [
        { id: 'b-payment', icon: '✉', title: '빠른 예약금 요청', teaser: '실제 방을 보기 전 오늘 안에 10만 원 송금 요청', detail: '메시지에는 “오늘 안에 10만 원을 보내면 다른 사람에게 보여주지 않겠다”는 내용이 있습니다. 아직 실제 방을 확인하지 않았고 계약 관련 서류도 검토하지 않았습니다. 시간을 제한하며 송금을 재촉하는 상황에서는 먼저 사실관계를 확인하고 송금을 보류해야 합니다.' },
        { id: 'b-account', icon: '▤', title: '계좌 명의 불일치', teaser: '안내받은 예금주와 계약서상 임대인 이름이 다름', detail: '문자로 받은 계좌의 예금주가 안내 자료에 적힌 임대인 이름과 다릅니다. 다른 사람이 대신 받는 사정이 있을 수 있지만, 관계와 적법한 수령 권한을 확인하지 못한 상태입니다. 설명을 문서로 확인하고 계약 상대방의 신원·권한을 확인하기 전에는 돈을 보내지 마세요.' },
        { id: 'b-fee', icon: '₩', title: '실제 월 지출', teaser: '관리비 5만 원에는 공용 청소만 포함', detail: '관리비 5만 원에는 공용 공간 청소만 포함되고 수도와 인터넷은 별도라고 안내되어 있습니다. 월세 36만 원과 관리비 5만 원만 합친 41만 원이 실제 월 지출의 전부가 아닙니다. 공과금과 인터넷 비용까지 확인해 다른 매물과 같은 기준으로 비교하세요.' }
      ],
      options: [
        { text: '계좌 명의와 계약 상대방의 관계 및 권한을 문서로 확인하고, 실제 방과 비용도 확인한 뒤 판단한다.', sub: '확인 전에는 예약금 송금을 보류한다.', correct: true, feedback: '신중한 판단입니다. 계좌 명의가 다르다는 사실만으로 사기라고 단정할 수는 없지만, 관계와 권한이 확인되기 전에는 송금하지 않는 것이 적절합니다.' },
        { text: '월세가 가장 낮으므로 우선 예약금을 보내고 나중에 확인한다.', sub: '예약금이 적으니 위험도 작다고 생각한다.', correct: false, feedback: '예약금 액수가 작더라도 확인 전 송금은 피해야 합니다. 실제 방과 상대방의 권한, 계좌 명의, 계약 조건을 먼저 확인해야 합니다.' },
        { text: '월세와 관리비 41만 원만 기준으로 삼아 세 매물 중 가장 경제적이라고 결정한다.', sub: '별도 공과금은 입주 후 생각한다.', correct: false, feedback: '수도·인터넷·전기·가스가 별도이므로 41만 원만으로 월 지출을 비교하면 정확하지 않습니다. 포함 항목을 통일해 계산하세요.' }
      ],
      answer: 0,
      lesson: 'B-02는 낮은 월세만 보면 유리해 보이지만 보증금이 크고, 계좌 명의 불일치와 선입금 요청이 확인됩니다. 즉시 사기라고 단정하기보다는 관계와 권한을 공식적으로 확인하고, 확인이 끝나기 전에는 송금하지 않는 판단이 중요합니다.'
    }
  },
  {
    id: 'C-03', title: '넓은 공간의 저보증금 원룸', location: '대구 동구 신암동 · 예시 위치', station: '대구역 생활권 버스 10분', commute: 22, environment: '주거지 안쪽 · 야간 동선 확인 필요', typeTag: '저보증금형', visual: 'visual-c',
    deposit: 300, rent: 50, fee: 6, monthly: 56, size: '21.0㎡', floor: '4층 / 4층 · 엘리베이터 없음', direction: '서향',
    includes: '공용 전기 일부', excludes: '수도 · 인터넷 · 전기 추가분 · 가스',
    summary: '보증금은 가장 낮고 공간은 넓지만 사진과 현장 상태 및 추가 비용을 확인해야 합니다.',
    checks: ['등록 사진이 2년 전에 촬영되었다고 안내되어 있습니다.', '예약 전에는 내부 방문이 어렵고 외부만 볼 수 있다는 설명이 있습니다.', '관리비 외에도 수도·인터넷 등 별도 비용이 발생합니다.'],
    scenario: {
      title: 'C-03 매물, 넓은 공간과 정보의 빈틈을 함께 살펴보세요.',
      intro: '보증금은 300만 원으로 세 매물 중 가장 낮고 면적은 가장 넓습니다. 다만 사진의 촬영 시점과 내부 방문 가능 여부가 불명확하므로 실제 상태를 확인하는 과정이 필요합니다.',
      clues: [
        { id: 'c-photo', icon: '▧', title: '오래된 매물 사진', teaser: '등록 사진이 2년 전 촬영된 자료', detail: '매물 소개에 사용된 사진은 2년 전에 촬영되었다고 적혀 있습니다. 그동안 수리나 옵션 교체가 있었는지 알 수 없으므로 사진만으로 현재 방 상태를 판단하기 어렵습니다. 방문 시 벽·창문·수납·가전 등 실제 상태를 확인하고 안내 사진과 차이가 있으면 설명을 요청하세요.' },
        { id: 'c-visit', icon: '⌂', title: '내부 방문 제한', teaser: '예약 전에는 내부를 보여주기 어렵다는 안내', detail: '담당자는 현재 거주자가 있어 예약 전 내부 방문은 어렵고 건물 외부만 볼 수 있다고 안내했습니다. 방문 제한 사유와 실제 내부 확인이 가능한 시점을 명확히 물어보세요. 실제 방을 확인하지 못한 상태에서 계약이나 송금을 진행하지 않는 것이 중요합니다.' },
        { id: 'c-cost', icon: '₩', title: '관리비와 별도 비용', teaser: '수도·인터넷·전기·가스 비용이 별도', detail: '관리비 6만 원에는 공용 전기 일부만 포함되며 수도, 인터넷, 가스 등은 별도라고 안내되어 있습니다. 월세와 관리비를 더한 56만 원에 별도 비용이 추가됩니다. 실제 포함 항목과 납부 방식, 예상 금액을 확인한 뒤 다른 매물과 비교하세요.' }
      ],
      options: [
        { text: '내부를 직접 볼 수 있는 일정을 확인하고 현재 상태와 옵션, 총비용을 확인한 뒤 결정한다.', sub: '방문과 서류 확인이 불가능하다면 계약을 서두르지 않는다.', correct: true, feedback: '좋은 판단입니다. 낮은 보증금과 넓은 면적만 보지 않고 사진의 최신성, 내부 방문, 실제 비용을 확인하는 순서를 선택했습니다.' },
        { text: '보증금이 가장 낮으므로 내부를 보지 않고 먼저 계약 의사를 확정한다.', sub: '사진이 충분하니 현재 상태도 비슷할 것이라고 생각한다.', correct: false, feedback: '오래된 사진은 현재 상태를 보장하지 않습니다. 실제 방과 옵션을 확인하지 못했다면 계약을 서두르지 않아야 합니다.' },
        { text: '월세와 관리비만 더해 56만 원이라고 생각하고 비용 비교를 끝낸다.', sub: '별도 공과금은 세 매물 모두 비슷할 것이라고 가정한다.', correct: false, feedback: '수도·인터넷·가스 등이 별도이므로 실제 월 지출은 더 커질 수 있습니다. 같은 항목을 기준으로 총비용을 비교해야 합니다.' }
      ],
      answer: 0,
      lesson: 'C-03은 보증금이 낮고 면적이 넓지만 오래된 사진과 내부 방문 제한, 추가 비용이라는 확인 과제가 있습니다. 가격과 면적만으로 결정하지 말고 현재 상태와 전체 비용을 확인할 수 있는지 먼저 살펴야 합니다.'
    }
  }
];

const REWARDS = [
  { id: 'leaf', icon: '🌱', name: '새싹 프로필 테두리', desc: '나의 프로필에 작은 성장 배지를 더해요.', cost: 80 },
  { id: 'home', icon: '🏡', name: '첫 자취 배지', desc: '첫 자취 미션을 완료한 플레이어의 배지.', cost: 120 },
  { id: 'star', icon: '⭐', name: '별빛 아바타 스티커', desc: '프로필에 사용할 수 있는 가상 스티커.', cost: 160 },
  { id: 'midnight', icon: '🌙', name: '미드나잇 테마', desc: '나의 플레이 화면에 적용하는 야간 테마 배지.', cost: 220 },
  { id: 'planner', icon: '📒', name: '생활 설계사 배지', desc: '세 가지 학습 차시를 모두 완료한 플레이어의 배지.', cost: 260 },
  { id: 'key', icon: '🗝️', name: '첫 독립 열쇠', desc: '독립생활 시뮬레이터 완주를 기념하는 프로필 장식.', cost: 320 }
];

let state = loadState();
let currentPage = 'home';
let videoIndex = 0;
let activeLessonId = 'rent';
let activeQuizQuestions = QUIZ_QUESTIONS;
let currentWrongRecordId = null;
let quizIndex = 0;
let quizAnswers = [];
let openedClues = new Set();
let currentCase = structuredClone(DEFAULT_CASE);
let selectedListingId = null;
let selectedDecision = null;
let questCash = 8000000;
let mapVisited = new Set();
let roomVisited = new Set();
let duelIndex = 0;
let duelUserScore = 0;
let duelAiScore = 0;
let duelAnswers = [];
let quizStartedAt = 0;
let questionStartedAt = 0;
let pendingModalCallback = null;

const $ = (selector, root = document) => root.querySelector(selector);
const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY) || 'null');
    if (!saved) return { ...DEFAULT_STATE, profile: { ...DEFAULT_STATE.profile } };
    const merged = { ...DEFAULT_STATE, ...saved, profile: { ...DEFAULT_STATE.profile, ...(saved.profile || {}) } };
    merged.rankPoints = Number.isFinite(saved.rankPoints) ? saved.rankPoints : Number(saved.points || 0);
    merged.completedLessons = Array.isArray(saved.completedLessons) ? saved.completedLessons : (saved.completedLesson ? ['rent'] : []);
    merged.rewardedQuizzes = Array.isArray(saved.rewardedQuizzes) ? saved.rewardedQuizzes : (saved.quizCompleted ? ['rent'] : []);
    merged.activityLog = Array.isArray(saved.activityLog) ? saved.activityLog : [];
    merged.pilotResponses = Array.isArray(saved.pilotResponses) ? saved.pilotResponses : [];
    merged.accessibility = { ...DEFAULT_STATE.accessibility, ...(saved.accessibility || {}) };
    return merged;
  } catch (error) {
    console.warn('LifeQ 저장 데이터를 불러오지 못했습니다.', error);
    return { ...DEFAULT_STATE };
  }
}
function saveState() {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
  catch (error) { console.warn('저장 공간에 기록하지 못했습니다.', error); }
  renderAll();
}
function showToast(message) {
  const toast = document.createElement('div');
  toast.className = 'toast';
  toast.textContent = message;
  $('#toast-region').appendChild(toast);
  window.setTimeout(() => toast.remove(), 3000);
}
function showModal(title, message, callback = null) {
  $('#modal-title').textContent = title;
  $('#modal-message').textContent = message;
  pendingModalCallback = callback;
  $('#modal-cancel').hidden = !callback;
  $('#modal-ok').textContent = callback ? '초기화' : '확인';
  $('#modal-backdrop').hidden = false;
  $('#modal-ok').focus();
}
function closeModal(confirmed = false) {
  $('#modal-backdrop').hidden = true;
  if (confirmed && pendingModalCallback) pendingModalCallback();
  pendingModalCallback = null;
}

const PROFILE_AVATARS = ['🏡', '🌱', '🧭', '🐱', '🎧', '⭐', '🦊', '🚀'];
const PROFILE_ACCENTS = ['#d8f58c', '#b9f1dc', '#e8e0ff', '#ffedc6', '#dceaff', '#ffdce8'];
let selectedProfileAvatar = state.profile.avatar;
let selectedProfileAccent = state.profile.accent;
function profileValuesFromForm() {
  const name = $('#profile-name-input').value.trim().slice(0, 14);
  const bio = $('#profile-bio-input').value.trim().slice(0, 40);
  const interest = $('#profile-interest-input').value;
  return {
    name: name || '플레이어',
    bio: bio || '나만의 생활경제 플레이 기록을 만들어 보세요.',
    interest,
    avatar: PROFILE_AVATARS.includes(selectedProfileAvatar) ? selectedProfileAvatar : DEFAULT_STATE.profile.avatar,
    accent: PROFILE_ACCENTS.includes(selectedProfileAccent) ? selectedProfileAccent : DEFAULT_STATE.profile.accent
  };
}
function updateProfilePreview() {
  const profile = profileValuesFromForm();
  $('#profile-preview-name').textContent = profile.name;
  $('#profile-preview-interest').textContent = `관심 분야 · ${profile.interest}`;
  $('#profile-preview-bio').textContent = profile.bio;
  $('#profile-avatar-preview').textContent = profile.avatar;
  $('#profile-avatar-preview').style.background = profile.accent;
}
function updateProfileChoices() {
  $$('.profile-avatar-choice').forEach(button => {
    const selected = button.dataset.avatar === selectedProfileAvatar;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
  $$('.profile-color-choice').forEach(button => {
    const selected = button.dataset.color === selectedProfileAccent;
    button.classList.toggle('selected', selected);
    button.setAttribute('aria-pressed', String(selected));
  });
}
function openProfileEditor() {
  const profile = { ...DEFAULT_STATE.profile, ...(state.profile || {}) };
  selectedProfileAvatar = PROFILE_AVATARS.includes(profile.avatar) ? profile.avatar : DEFAULT_STATE.profile.avatar;
  selectedProfileAccent = PROFILE_ACCENTS.includes(profile.accent) ? profile.accent : DEFAULT_STATE.profile.accent;
  $('#profile-name-input').value = profile.name;
  $('#profile-bio-input').value = profile.bio;
  $('#profile-interest-input').value = profile.interest;
  updateProfileChoices(); updateProfilePreview();
  $('#profile-backdrop').hidden = false;
  $('#profile-name-input').focus();
}
function closeProfileEditor() {
  $('#profile-backdrop').hidden = true;
  $('#profile-button').focus();
}
function saveProfile() {
  const name = $('#profile-name-input').value.trim();
  if (!name) {
    showToast('닉네임을 입력해 주세요.');
    $('#profile-name-input').focus();
    return;
  }
  state.profile = profileValuesFromForm();
  saveState();
  closeProfileEditor();
  showToast('나만의 프로필을 저장했습니다.');
}
function renderProfile() {
  const profile = { ...DEFAULT_STATE.profile, ...(state.profile || {}) };
  const safeName = String(profile.name || '플레이어').slice(0, 14);
  const safeBio = String(profile.bio || DEFAULT_STATE.profile.bio).slice(0, 40);
  const safeInterest = String(profile.interest || DEFAULT_STATE.profile.interest).slice(0, 24);
  const safeAvatar = PROFILE_AVATARS.includes(profile.avatar) ? profile.avatar : DEFAULT_STATE.profile.avatar;
  const safeAccent = PROFILE_ACCENTS.includes(profile.accent) ? profile.accent : DEFAULT_STATE.profile.accent;
  $('#profile-button').textContent = safeAvatar;
  $('#profile-button').style.background = safeAccent;
  $('#profile-button').style.color = '#18233a';
  $('#profile-button').setAttribute('aria-label', `${safeName} 프로필 편집`);
  $('#profile-button').title = `${safeName}님의 프로필 편집`;
  $('#profile-home-avatar').textContent = safeAvatar;
  $('#profile-home-avatar').style.background = safeAccent;
  $('#profile-home-name').textContent = `${safeName}님의 LifeQ`;
  $('#profile-home-detail').textContent = `${safeInterest} · ${safeBio}`;
  const duelAvatar = $('.duel-avatar.user-avatar');
  if (duelAvatar) { duelAvatar.textContent = safeAvatar; duelAvatar.style.background = safeAccent; }
}
function addPoints(amount, reason) {
  state.points += amount;
  state.rankPoints = (state.rankPoints || 0) + amount;
  state.xp += amount;
  showToast(`${reason} · +${amount} PT 획득`);
  saveState();
}
function getLevel() {
  const level = Math.floor(state.xp / 200) + 1;
  const labels = ['새싹', '탐험가', '생활 고수', '경제 플레이어', '라이프 마스터'];
  return { level, label: labels[Math.min(level - 1, labels.length - 1)], progress: (state.xp % 200) / 2, remain: 200 - (state.xp % 200) };
}
function completedDailyCount() {
  return [state.completedLesson, state.quizCompleted, state.questCompleted].filter(Boolean).length;
}
function renderAll() {
  const level = getLevel();
  $('#header-points').textContent = state.points.toLocaleString('ko-KR');
  $('#shop-points').textContent = state.points.toLocaleString('ko-KR');
  $('#rank-my-points').innerHTML = `${(state.rankPoints || 0).toLocaleString('ko-KR')} <span>RP</span>`;
  $('#streak-count').textContent = `${state.streak}일`;
  $('#home-level').innerHTML = `Lv. ${level.level} <span>${level.label}</span>`;
  $('#level-progress').style.width = `${level.progress}%`;
  $('#level-caption').textContent = `다음 레벨까지 ${level.remain} XP`;
  $('#study-minutes').textContent = `${state.studyMinutes}분`;
  $('#home-wrong-count').textContent = `${state.wrongAnswers.length}개`;
  $('#side-note-count').textContent = state.wrongAnswers.length;
  $('#accuracy-rate').textContent = state.quizTotal ? `${Math.round((state.quizCorrect / state.quizTotal) * 100)}%` : '-';
  $('#accuracy-caption').textContent = state.quizTotal ? `${state.quizCorrect}문제 정답 / ${state.quizTotal}문제` : '문제를 풀면 기록돼요';
  const missions = completedDailyCount();
  $('#mission-count').textContent = `${missions}/3`;
  $('#goal-progress').style.width = `${missions / 3 * 100}%`;
  $('#goal-caption').textContent = `${missions} / 3 활동 완료`;
  const rows = $$('#mission-list .mission-row');
  [state.completedLesson, state.quizCompleted, state.questCompleted].forEach((done, index) => {
    rows[index]?.classList.toggle('done', done);
    if (rows[index]) $('.mission-check', rows[index]).textContent = done ? '✓' : '○';
  });
  updateRecommendation();
  renderProfile();
  renderNotes();
  renderLearningPath();
  renderRanking();
  renderShop();
  if (typeof renderLifeStatus === 'function') renderLifeStatus();
}

function navigate(page) {
  const target = $(`#page-${page}`);
  if (!target) return;
  currentPage = page;
  $$('.page').forEach(item => item.classList.toggle('active', item === target));
  $$('.nav-item').forEach(item => item.classList.toggle('active', item.dataset.page === page));
  $('#breadcrumb-current').textContent = target.dataset.title || 'LifeQ';
  $('#sidebar').classList.remove('open');
  window.scrollTo({ top: 0, behavior: 'smooth' });
  if (page === 'notes') renderNotes();
  if (page === 'rank') renderRanking();
  if (page === 'life') renderLifeSimulator();
}

function updateRecommendation() {
  const interest = state.profile?.interest || '주거·임대차';
  const interestSuggestion = ({'주거·임대차':'주거비 계산','소비·예산관리':'월 지출과 예산 계획','저축·금융기초':'비상금과 저축','계약·생활법률':'계약 전 확인','환경·에너지':'에너지 사용량과 공과금','진로·창업':'초기 예산과 고정비'}[interest] || '주거비 계산');
  const categoryCounts = {};
  state.wrongAnswers.forEach(item => { categoryCounts[item.category] = (categoryCounts[item.category] || 0) + 1; });
  const top = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0];
  if (!state.quizTotal) {
    $('#recommend-title').textContent = `${interestSuggestion}부터 시작해 볼까요?`;
    $('#recommend-desc').textContent = `프로필 관심 분야 '${interest}'를 반영한 첫 추천입니다. 학습과 오답 기록이 쌓이면 추천 주제도 달라집니다.`;
  } else if (top) {
    const times = state.responseTimes || [];
    const averageTime = times.length ? Math.round(times.reduce((sum, value) => sum + value, 0) / times.length) : 0;
    $('#recommend-title').textContent = `${top[0]} 개념을 다시 확인해 봐요.`;
    $('#recommend-desc').textContent = `이 유형에서 ${top[1]}개의 오답이 기록됐어요. ${averageTime >= 15 ? `문제당 평균 풀이 시간은 약 ${averageTime}초입니다. 핵심 개념을 짧게 복습한 뒤` : '핵심 개념을 짧게 복습하고'} 비슷한 문제를 다시 풀어보는 것을 추천합니다.`;
  } else {
    $('#recommend-title').textContent = '좋은 흐름이에요. 실전 미션에 도전해 보세요.';
    $('#recommend-desc').textContent = '현재까지 오답이 기록되지 않았어요. 개념을 실제 상황에 적용해 보면 이해를 더 단단하게 만들 수 있습니다.';
  }
  $('#pattern-analysis').textContent = state.quizTotal
    ? (top ? `현재 기록에서 '${top[0]}' 유형의 오답이 가장 많습니다. 해당 개념을 복습한 뒤 자취 미션에서 실제 상황에 적용해 보세요. 이 화면의 추천은 소규모 시연 데이터에 적용한 규칙형 로직입니다.` : `총 ${state.quizTotal}문제를 풀었고 정답 ${state.quizCorrect}개를 기록했습니다. 현재 오답이 없어 상황형 문제로 응용하는 단계를 추천합니다.`)
    : '퀴즈를 풀면 오답 유형과 정답률을 바탕으로 학습 패턴을 분석해 다음 학습을 제안합니다.';
  $('#notes-top-category').textContent = top ? top[0] : '아직 기록 없음';
}

// Navigation and modal controls
$$('.nav-item').forEach(button => button.addEventListener('click', () => navigate(button.dataset.page)));
$$('[data-go]').forEach(button => button.addEventListener('click', () => navigate(button.dataset.go)));
$('#mobile-menu').addEventListener('click', () => $('#sidebar').classList.toggle('open'));
document.addEventListener('click', event => {
  if (window.innerWidth <= 900 && $('#sidebar').classList.contains('open') && !$('#sidebar').contains(event.target) && !$('#mobile-menu').contains(event.target)) $('#sidebar').classList.remove('open');
});
$('#modal-close').addEventListener('click', () => closeModal(false));
$('#modal-cancel').addEventListener('click', () => closeModal(false));
$('#modal-ok').addEventListener('click', () => closeModal(true));
$('#modal-backdrop').addEventListener('click', event => { if (event.target === $('#modal-backdrop')) closeModal(); });
$('#profile-button').addEventListener('click', openProfileEditor);
$('#profile-edit-home').addEventListener('click', openProfileEditor);
$('#profile-close').addEventListener('click', closeProfileEditor);
$('#profile-cancel').addEventListener('click', closeProfileEditor);
$('#profile-backdrop').addEventListener('click', event => { if (event.target === $('#profile-backdrop')) closeProfileEditor(); });
$('#profile-name-input').addEventListener('input', updateProfilePreview);
$('#profile-bio-input').addEventListener('input', updateProfilePreview);
$('#profile-interest-input').addEventListener('change', updateProfilePreview);
$('#profile-avatar-options').addEventListener('click', event => {
  const button = event.target.closest('[data-avatar]');
  if (!button) return;
  selectedProfileAvatar = button.dataset.avatar;
  updateProfileChoices(); updateProfilePreview();
});
$('#profile-color-options').addEventListener('click', event => {
  const button = event.target.closest('[data-color]');
  if (!button) return;
  selectedProfileAccent = button.dataset.color;
  updateProfileChoices(); updateProfilePreview();
});
$('#profile-reset').addEventListener('click', () => {
  selectedProfileAvatar = DEFAULT_STATE.profile.avatar;
  selectedProfileAccent = DEFAULT_STATE.profile.accent;
  $('#profile-name-input').value = DEFAULT_STATE.profile.name;
  $('#profile-bio-input').value = DEFAULT_STATE.profile.bio;
  $('#profile-interest-input').value = DEFAULT_STATE.profile.interest;
  updateProfileChoices(); updateProfilePreview();
});
$('#profile-save').addEventListener('click', saveProfile);
document.addEventListener('keydown', event => {
  if (event.key === 'Escape' && !$('#profile-backdrop').hidden) closeProfileEditor();
});

// Today's date
const now = new Date();
$('#today-date').textContent = new Intl.DateTimeFormat('ko-KR', { month: 'long', day: 'numeric', weekday: 'short' }).format(now).toUpperCase();

// Modular micro-learning: three short courses, each followed immediately by a quiz.
const LESSON_MODULES = {
  rent: {
    id:'rent', title:'보증금과 월세, 무엇이 다를까?', lead:'보증금·월세·관리비를 구분하고 매달 실제로 나가는 비용을 계산합니다.',
    scenes:[
      {title:'집을 구할 때 돈은 어떻게 나갈까?',text:'계약 때 맡기는 돈과 매달 내는 돈은 역할이 달라요.',visual:'⌂',tag:'주거비의 기본'},
      {title:'보증금은 계약 기간 동안 맡기는 돈',text:'반환 조건과 정산 항목을 계약서에서 확인해야 해요.',visual:'₩',tag:'보증금'},
      {title:'월세와 관리비, 별도 공과금까지',text:'월세 + 관리비 + 별도 비용을 같은 기준으로 비교해요.',visual:'＋',tag:'월 고정 지출'}
    ],
    summary:[['보증금','계약 이행 등을 위해 맡기는 금액입니다. 반환 시점과 공제·정산 조건을 계약서에서 확인합니다.'],['월세','집을 사용하는 대가로 정기적으로 지급하는 임대료입니다.'],['관리비','금액만 보지 말고 포함 항목과 별도 부담 항목을 구분해야 실제 주거비를 계산할 수 있습니다.']],
    questions:[
      {id:'rent-cost',category:'주거비 계산',topic:'월 기본 주거비',question:'월세 48만 원, 관리비 9만 원인 방의 월 기본 주거비는?',options:['48만 원','57만 원','39만 원','800만 원'],correct:1,explanation:'월세 48만 원과 관리비 9만 원을 더하면 57만 원입니다. 수도·전기·가스 등이 별도라면 실제 지출은 더 커질 수 있습니다.'},
      {id:'deposit-meaning',category:'금융 기초',topic:'보증금',question:'보증금에 대한 설명으로 가장 알맞은 것은?',options:['매달 내는 임대료','공과금만을 위한 비용','계약 이행 등을 위해 맡기는 금액','중개 수수료'],correct:2,explanation:'보증금은 계약 이행 등을 담보하기 위해 맡기는 금액입니다. 계약 종료 시 정산 조건과 반환 절차를 확인해야 합니다.'},
      {id:'fee-items',category:'주거비 계산',topic:'관리비',question:'두 매물의 관리비를 비교할 때 가장 먼저 확인할 것은?',options:['금액이 낮은지 여부','관리비에 포함된 항목과 별도 부담 항목','사진의 인테리어','건물 이름'],correct:1,explanation:'관리비에 포함된 항목이 서로 다르면 금액만으로 비교할 수 없습니다. 공과금·인터넷 등 별도 비용까지 확인해야 합니다.'}
    ]
  },
  contract: {
    id:'contract', title:'계약 전에 무엇을 확인해야 할까?', lead:'매물의 실제 상태, 계약 상대방의 권한, 서류와 송금 조건을 순서대로 살펴봅니다.',
    scenes:[
      {title:'사진만으로 계약을 결정하지 않기',text:'실제 방의 상태와 사진·설명 사이에 차이가 없는지 확인해요.',visual:'⌂',tag:'실제 매물 확인'},
      {title:'계약 상대방과 권한 확인',text:'누구와 계약하는지, 계약을 진행할 권한이 있는지 확인해야 해요.',visual:'▤',tag:'상대방 확인'},
      {title:'서류와 계좌 정보 대조',text:'보증금·월세·기간·입금 계좌 등 주요 내용을 서로 대조해요.',visual:'✓',tag:'문서 확인'}
    ],
    summary:[['실제 매물','방문해 구조·채광·누수 흔적·옵션 상태 등 현재 상태를 확인합니다.'],['계약 상대방','신원과 계약 권한을 확인하고, 설명이 불명확하면 공식 서류로 확인합니다.'],['계약·송금','계약서의 금액·기간·특약과 입금 정보를 대조하고 확인 전 송금을 서두르지 않습니다.']],
    questions:[
      {id:'contract-photo',category:'계약 안전',topic:'실제 매물 확인',question:'매물 사진이 2년 전에 촬영된 것을 알게 됐습니다. 다음 행동으로 가장 적절한 것은?',options:['사진이 마음에 들면 바로 계약한다','현재 방을 직접 보고 상태와 옵션을 확인한다','오래된 사진은 무조건 사기라고 단정한다','월세만 확인한다'],correct:1,explanation:'오래된 사진만으로 문제를 단정할 수는 없지만 현재 상태를 알 수 없으므로 직접 확인하고 차이가 있다면 설명을 요청해야 합니다.'},
      {id:'contract-agent',category:'계약 안전',topic:'상대방 권한',question:'계좌 예금주와 계약서상 임대인 이름이 다릅니다. 가장 신중한 대응은?',options:['금액이 적으면 송금한다','명의가 다르니 무조건 범죄라고 단정한다','관계와 적법한 수령 권한을 확인할 때까지 송금을 보류한다','메신저 답변만 믿는다'],correct:2,explanation:'명의가 다르다는 사실만으로 사기라고 단정할 수는 없습니다. 다만 관계와 수령 권한을 공식적으로 확인하기 전에는 송금하지 않는 것이 안전합니다.'},
      {id:'contract-rush',category:'계약 안전',topic:'급한 송금 요청',question:'실제 방을 보기 전에 오늘 안에 예약금을 보내 달라는 연락을 받았습니다. 어떻게 해야 할까요?',options:['요청대로 먼저 송금한다','실제 매물·상대방·서류·조건을 확인한 뒤 결정한다','사진을 다시 보고 결정한다','다른 사람도 보니 서둘러 계약한다'],correct:1,explanation:'시간을 제한하는 요구가 있어도 확인 절차를 생략하면 안 됩니다. 실제 매물과 계약 상대방, 서류와 계약 조건을 확인한 뒤 판단해야 합니다.'}
    ]
  },
  repair: {
    id:'repair', title:'수선 문제와 임대차 분쟁, 어떻게 대응할까?', lead:'고장·훼손이 발생했을 때 사실을 기록하고 책임 범위를 확인하는 과정을 살펴봅니다.',
    video:true,
    scenes:[
      {title:'고장과 훼손은 원인을 먼저 확인',text:'문제가 생기면 발생 시점과 상태를 기록해 두는 것이 좋아요.',visual:'⌂',tag:'상황 기록'},
      {title:'수선 책임을 임의로 단정하지 않기',text:'계약 내용과 문제의 원인, 시설 상태를 함께 살펴야 해요.',visual:'▤',tag:'책임 범위'},
      {title:'대화와 조정 절차 활용',text:'당사자 간 협의가 어렵다면 관련 기관의 공식 안내를 확인해요.',visual:'↔',tag:'분쟁 해결'}
    ],
    summary:[['발생 상황 기록','문제가 생긴 날짜·장소·상태를 정리하고 필요한 경우 사진 등으로 기록합니다.'],['계약 내용 확인','수선 책임은 문제의 원인과 계약 내용 등에 따라 달라질 수 있어 일방적으로 단정하지 않습니다.'],['협의·조정','상대방과 사실을 바탕으로 협의하고 해결이 어렵다면 공식 분쟁조정 제도와 안내를 확인합니다.']],
    questions:[
      {id:'repair-record',category:'주거 관리',topic:'문제 기록',question:'입주 후 싱크대 아래에서 누수가 발견됐습니다. 가장 먼저 할 일은?',options:['원인을 확인하지 않고 직접 분해한다','발생 시점과 상태를 기록하고 관리 주체에 알린다','아무에게도 알리지 않는다','바로 비용을 지불한다'],correct:1,explanation:'상태와 발생 시점을 기록하고 관리 주체에 알린 뒤 원인과 수리 책임을 확인하는 것이 합리적입니다.'},
      {id:'repair-responsibility',category:'주거 관리',topic:'수선 책임',question:'벽지 훼손의 수리 비용을 두고 의견이 다릅니다. 올바른 접근은?',options:['무조건 임대인이 부담한다고 단정한다','무조건 임차인이 부담한다고 단정한다','훼손 원인과 계약 내용, 관련 기준을 확인하고 협의한다','말로만 합의하고 기록하지 않는다'],correct:2,explanation:'수선·원상복구 책임은 원인과 계약 내용 등 구체적 사실에 따라 달라질 수 있습니다. 사실을 확인하고 협의해야 합니다.'},
      {id:'repair-dispute',category:'주거 관리',topic:'분쟁 해결',question:'당사자 간 협의가 잘되지 않을 때 다음으로 고려할 수 있는 방법은?',options:['상대방에게 반복해서 압박한다','사실과 자료를 정리하고 공식 분쟁조정 안내를 확인한다','문제를 온라인에만 공개한다','계약서를 확인하지 않는다'],correct:1,explanation:'기록과 자료를 정리한 뒤 관련 기관의 공식 분쟁조정 절차와 안내를 확인할 수 있습니다.'}
    ]
  }
};
function currentLesson(){ return LESSON_MODULES[activeLessonId] || LESSON_MODULES.rent; }
function trackActivity(type, detail={}){
  state.activityLog = Array.isArray(state.activityLog) ? state.activityLog : [];
  state.activityLog.push({type,at:new Date().toISOString(),...detail});
  state.activityLog = state.activityLog.slice(-500);
}
function renderLearningPath(){
  const list=$('#learning-path-list'); if(!list)return;
  list.innerHTML='';
  Object.values(LESSON_MODULES).forEach((lesson,index)=>{
    const done=(state.completedLessons||[]).includes(lesson.id);
    const row=document.createElement('button');row.type='button';row.className=`learning-path-item${done?' done':''}${lesson.id===activeLessonId?' active':''}`;row.dataset.course=lesson.id;
    const number=document.createElement('span');number.textContent=done?'✓':String(index+1).padStart(2,'0');
    const body=document.createElement('span');const strong=document.createElement('strong');strong.textContent=lesson.title;const small=document.createElement('small');small.textContent=done?'학습 완료':'약 1분 + 퀴즈 3문제';body.append(strong,small);row.append(number,body);row.addEventListener('click',()=>selectLesson(lesson.id));list.append(row);
  });
  const completed=(state.completedLessons||[]).length;
  $('#learning-progress-label').textContent=`${completed} / 3 차시 완료`;
  $('#learning-progress-bar').style.width=`${completed/3*100}%`;
  $$('.course-tab').forEach(btn=>btn.classList.toggle('active',btn.dataset.course===activeLessonId));
}
function selectLesson(id){
  if(!LESSON_MODULES[id])return;
  activeLessonId=id;videoIndex=0;
  $('#quiz-wrap').hidden=true;
  renderLesson();
}
function renderLesson(){
  const lesson=currentLesson();
  $('#lesson-index-label').textContent=`CHAPTER 0${Object.keys(LESSON_MODULES).indexOf(activeLessonId)+1} · 약 1분 학습`;
  $('#lesson-title').textContent=lesson.title;$('#lesson-lead').textContent=lesson.lead;
  $('#lesson-scene-stack').innerHTML='';
  lesson.scenes.forEach((scene,index)=>{
    const card=document.createElement('article');card.className='lesson-scene-card';
    const visual=document.createElement('span');visual.className='lesson-scene-visual';visual.textContent=scene.visual;
    const body=document.createElement('div');const tag=document.createElement('small');tag.textContent=`POINT 0${index+1} · ${scene.tag}`;const title=document.createElement('h3');title.textContent=scene.title;const desc=document.createElement('p');desc.textContent=scene.text;body.append(tag,title,desc);card.append(visual,body);$('#lesson-scene-stack').append(card);
  });
  // 단일 공식 사례 영상은 학습 차시와 무관하게 학습 화면에서 계속 노출합니다.
  $('#lesson-video-embed').hidden=false;
  $('#lesson-summary-grid').innerHTML='';
  lesson.summary.forEach((item,index)=>{
    const card=document.createElement('article');card.className='lesson-summary-card';const number=document.createElement('span');number.textContent=`0${index+1}`;const title=document.createElement('strong');title.textContent=item[0];const desc=document.createElement('p');desc.textContent=item[1];card.append(number,title,desc);$('#lesson-summary-grid').append(card);
  });
  $('#complete-lesson').textContent=(state.completedLessons||[]).includes(activeLessonId)?'다시 퀴즈 풀기 →':'학습 완료 후 퀴즈 →';
  renderLearningPath();
}
$$('.course-tab').forEach(button=>button.addEventListener('click',()=>selectLesson(button.dataset.course)));
$('#complete-lesson').addEventListener('click',()=>{
  const lesson=currentLesson();
  if(!(state.completedLessons||[]).includes(activeLessonId)){
    state.completedLessons.push(activeLessonId);state.completedLesson=true;state.studyMinutes+=1;state.streak=Math.max(1,state.streak);addPoints(10,`${lesson.title} 학습 완료`);trackActivity('lesson_complete',{lesson:activeLessonId});
  }else{trackActivity('lesson_revisit',{lesson:activeLessonId});saveState();}
  beginQuiz();
});
$('#start-quiz')?.addEventListener('click',beginQuiz);
function renderVideoScene(){renderLesson();}
// Quiz and automatic wrong-note storage.
function beginQuiz() {
  activeQuizQuestions=currentLesson().questions;
  quizIndex=0;quizAnswers=[];quizStartedAt=Date.now();currentWrongRecordId=null;
  $('#quiz-wrap').hidden=false;$('#quiz-heading').hidden=false;$('#quiz-wrap .quiz-card').hidden=false;$('#quiz-result').hidden=true;
  renderQuizQuestion();$('#quiz-wrap').scrollIntoView({behavior:'smooth',block:'start'});
}
function renderQuizQuestion(){
  const q=activeQuizQuestions[quizIndex];
  $('#quiz-progress-label').textContent=`QUESTION ${quizIndex+1} / ${activeQuizQuestions.length}`;
  $('#quiz-progress-bar').style.width=`${quizIndex/activeQuizQuestions.length*100}%`;
  $('#quiz-question').textContent=q.question;$('.question-topic').textContent=q.topic;
  $('#quiz-options').innerHTML='';$('#quiz-feedback').hidden=true;$('#wrong-review-panel').hidden=true;
  $('#quiz-next').disabled=true;$('#quiz-next').textContent=quizIndex===activeQuizQuestions.length-1?'결과 확인 →':'다음 문제 →';
  $('#quiz-step-hint').textContent='정답을 선택해 주세요.';questionStartedAt=Date.now();
  q.options.forEach((option,index)=>{const button=document.createElement('button');button.type='button';button.className='option-button';const letter=document.createElement('span');letter.className='option-letter';letter.textContent=String.fromCharCode(65+index);const text=document.createElement('span');text.textContent=option;button.append(letter,text);button.addEventListener('click',()=>answerQuiz(index));$('#quiz-options').append(button);});
}
function answerQuiz(selected){
  const q=activeQuizQuestions[quizIndex],correct=selected===q.correct;
  const buttons=$$('.option-button',$('#quiz-options'));
  buttons.forEach((button,index)=>{button.disabled=true;if(index===q.correct)button.classList.add('correct');if(index===selected&&!correct)button.classList.add('wrong');});
  const responseSeconds=Math.max(1,Math.round((Date.now()-questionStartedAt)/1000));
  quizAnswers.push({selected,correct,responseSeconds});state.responseTimes=[...(state.responseTimes||[]),responseSeconds].slice(-50);state.quizTotal+=1;if(correct)state.quizCorrect+=1;
  if(!correct){
    const record={id:`${q.id}-${Date.now()}`,question:q.question,selected:q.options[selected],correctAnswer:q.options[q.correct],explanation:q.explanation,category:q.category,responseSeconds,date:new Date().toLocaleDateString('ko-KR'),reviewed:false};
    state.wrongAnswers.unshift(record);currentWrongRecordId=record.id;
  }else currentWrongRecordId=null;
  const feedback=$('#quiz-feedback');feedback.hidden=false;feedback.className=`quiz-feedback ${correct?'good':'bad'}`;feedback.textContent=correct?`정답입니다. ${q.explanation}`:`아쉬워요. 정답은 '${q.options[q.correct]}'입니다. 아래에서 바로 복습해 보세요.`;
  $('#quiz-step-hint').textContent=correct?'개념을 잘 이해했어요.':'오답 복습을 완료하면 다음 문제로 넘어갈 수 있어요.';
  $('#quiz-progress-bar').style.width=`${(quizIndex+1)/activeQuizQuestions.length*100}%`;
  if(!correct){$('#wrong-review-copy').textContent=`정답: ${q.options[q.correct]}\n${q.explanation}`;$('#wrong-review-panel').hidden=false;$('#quiz-next').disabled=true;}
  else $('#quiz-next').disabled=false;
  trackActivity(correct?'quiz_correct':'quiz_wrong',{lesson:activeLessonId,question:q.id});saveState();
}
$('#wrong-review-done').addEventListener('click',()=>{
  const item=state.wrongAnswers.find(x=>x.id===currentWrongRecordId);
  if(item&&!item.reviewed){item.reviewed=true;state.reviewedCount=(state.reviewedCount||0)+1;trackActivity('wrong_review',{lesson:activeLessonId});}
  $('#wrong-review-panel').hidden=true;$('#quiz-next').disabled=false;$('#quiz-step-hint').textContent='복습 완료. 다음 문제로 이동할 수 있어요.';saveState();
});
$('#quiz-next').addEventListener('click',()=>{if(quizIndex<activeQuizQuestions.length-1){quizIndex+=1;renderQuizQuestion();}else finishQuiz();});
function finishQuiz(){
  const correct=quizAnswers.filter(x=>x.correct).length;
  if(!(state.rewardedQuizzes||[]).includes(activeLessonId)){
    state.rewardedQuizzes.push(activeLessonId);const reward=correct*10+10;addPoints(reward,`${currentLesson().title} 퀴즈 완료`);trackActivity('quiz_complete',{lesson:activeLessonId,correct,total:activeQuizQuestions.length,reward});
  }else{trackActivity('quiz_retake',{lesson:activeLessonId,correct,total:activeQuizQuestions.length});saveState();}
  state.quizCompleted=state.rewardedQuizzes.length>0;
  saveState();
  $('#quiz-heading').hidden=true;$('#quiz-wrap .quiz-card').hidden=true;
  const result=$('#quiz-result');result.hidden=false;
  result.innerHTML=`<div class="result-orbit"><span>Q</span></div><div class="eyebrow" style="justify-content:center">CHAPTER COMPLETE</div><h2>${correct} / ${activeQuizQuestions.length} 문제 정답</h2><p>${correct===3?'핵심 개념을 잘 이해했습니다. 이제 실제 상황에 적용해 보세요.':'오답은 즉시 복습했고 오답노트에도 저장했습니다. 미션에서 비슷한 상황을 다시 만나면 근거를 떠올려 보세요.'}</p><div class="quiz-result-actions"><button class="primary-button" id="after-quiz-quest">자취 미션에서 적용하기 →</button><button class="outline-button" id="after-quiz-notes">오답노트 확인</button><button class="outline-button" id="after-quiz-retry">이 차시 다시 풀기 ↻</button></div>`;
  $('#after-quiz-quest').addEventListener('click',()=>navigate('quest'));$('#after-quiz-notes').addEventListener('click',()=>navigate('notes'));$('#after-quiz-retry').addEventListener('click',beginQuiz);
  renderLearningPath();showToast(`퀴즈 완료 · ${correct}/3 정답`);
}

// Quest simulator.
function applyCase(data) {
  if (!data || !Array.isArray(data.clues) || data.clues.length < 3 || !Array.isArray(data.options) || data.options.length < 2) throw new Error('생성된 사례의 형식이 올바르지 않습니다.');
  const answer = Number.isInteger(data.answer) ? data.answer : data.options.findIndex(item => item.correct === true);
  if (answer < 0 || answer >= data.options.length) throw new Error('정답 데이터가 올바르지 않습니다.');
  currentCase = {
    title: String(data.title || `${getSelectedListing()?.id || '선택 매물'} 계약 확인`).slice(0, 100),
    intro: String(data.intro || `${getSelectedListing()?.title || '선택한 매물'}의 계약 전 확인 사항을 살펴보세요.`).slice(0, 400),
    clues: data.clues.slice(0, 4).map((clue, i) => ({ id: `ai-${i}`, icon: ['✉', '▤', '₩', '⌖'][i], title: String(clue.title || `단서 ${i + 1}`).slice(0, 40), teaser: String(clue.teaser || '').slice(0, 90), detail: String(clue.detail || '').slice(0, 700) })),
    options: data.options.slice(0, 4).map(option => ({ text: String(option.text || '').slice(0, 180), sub: String(option.sub || '').slice(0, 180), correct: Boolean(option.correct), feedback: String(option.feedback || '').slice(0, 500) })),
    answer,
    lesson: String(data.lesson || DEFAULT_CASE.lesson).slice(0, 700)
  };
  resetQuestStage();
}
function getSelectedListing() {
  return LISTINGS.find(listing => listing.id === selectedListingId) || null;
}
function renderPropertyListings() {
  const grid = $('#property-grid');
  if (!grid) return;
  grid.innerHTML = LISTINGS.map(listing => {
    const selected = listing.id === selectedListingId;
    return `
      <article class="property-card ${listing.visual} ${selected ? 'selected' : ''}" data-listing-card="${listing.id}">
        <div class="property-image ${listing.visual}" aria-hidden="true">
          <span class="property-image-label">가상 매물</span>
          <div class="property-skyline"><i></i><i></i><i></i><i></i></div>
          <div class="property-house-art"><span class="art-window w1"></span><span class="art-window w2"></span><span class="art-window w3"></span><span class="art-door"></span></div>
          <span class="property-id-stamp">${listing.id}</span>
        </div>
        <div class="property-card-body">
          <div class="property-type-row"><span class="property-type-tag">${listing.typeTag}</span><span class="property-card-id">${listing.id}</span></div>
          <h3>${listing.title}</h3>
          <p class="property-place">${listing.location}</p>
          <p class="property-station">⌖ ${listing.station}</p><p class="property-station property-commute">가온대학교(가상)까지 약 ${listing.commute}분 · 게임용 수치</p>
          <div class="property-price-grid">
            <div><small>보증금</small><strong>${listing.deposit.toLocaleString('ko-KR')}<em>만원</em></strong></div>
            <div><small>월세</small><strong>${listing.rent}<em>만원</em></strong></div>
            <div><small>관리비</small><strong>${listing.fee}<em>만원</em></strong></div>
          </div>
          <div class="property-monthly-cost"><span>월 기본 주거비</span><strong>${listing.monthly}만원<small> / 공과금 별도</small></strong></div>
          <div class="property-specs"><span>${listing.size}</span><span>${listing.floor}</span><span>${listing.direction}</span></div>
          <details class="property-details">
            <summary>상세 조건 및 확인 사항</summary>
            <div class="property-detail-copy">
              <p><b>관리비 포함</b>${listing.includes}</p>
              <p><b>별도 부담</b>${listing.excludes}</p>
              <p><b>계약 전 확인</b>${listing.checks.join(' ')}</p>
            </div>
          </details>
          <button class="property-select-button" type="button" data-select-listing="${listing.id}" aria-pressed="${selected ? 'true' : 'false'}">
            ${selected ? '✓ 조사할 매물로 선택됨' : '이 매물 조사하기 →'}
          </button>
        </div>
      </article>`;
  }).join('');
}
function renderPropertyComparison() {
  const table = $('#property-compare-table');
  if (!table) return;
  const rows = [
    ['보증금', item => `${item.deposit.toLocaleString('ko-KR')}만원`],
    ['월세', item => `${item.rent}만원`],
    ['관리비', item => `${item.fee}만원`],
    ['월 기본 주거비', item => `${item.monthly}만원`],
    ['역·교통', item => item.station.replace(' · 예시 위치', '')],
    ['가상 캠퍼스 통학', item => `약 ${item.commute}분`],
    ['주변 환경', item => item.environment],
    ['면적 / 층', item => `${item.size} · ${item.floor}`],
    ['관리비 포함', item => item.includes]
  ];
  table.innerHTML = `<thead><tr><th scope="col">비교 항목</th>${LISTINGS.map(item => `<th scope="col">${item.id}</th>`).join('')}</tr></thead><tbody>${rows.map(([label, value], index) => `<tr class="${index === 3 ? 'monthly-row' : ''}"><th scope="row">${label}</th>${LISTINGS.map(item => `<td>${value(item)}</td>`).join('')}</tr>`).join('')}</tbody>`;
}
function updateSelectedListing() {
  const listing = getSelectedListing();
  $('#selected-listing-label').textContent = listing ? listing.id : '선택 전';
  $('#selected-monthly-cost').textContent = listing ? `${listing.monthly}만 원 + 공과금` : '-';
  $('#begin-investigation').disabled = !listing;
  $('#generate-case').disabled = !listing;
  if ($('#analyze-choice')) { $('#analyze-choice').disabled = !listing; $('#ai-analysis-status').textContent = listing ? `${listing.id}을(를) 어떻게 평가할지 AI에게 물어볼 수 있어요.` : '먼저 매물 하나를 선택해 주세요.'; }
  $('#load-offline-case').disabled = !listing;
  $('#begin-investigation').innerHTML = listing ? `${listing.id} 현장 조사 시작 <span>→</span>` : '매물 선택 후 조사 시작 <span>→</span>';
  $('#selection-instruction').textContent = listing ? `${listing.id} 매물을 선택했습니다. 박서윤의 월 주거비 한도 55만 원과 통학 시간도 함께 고려하세요.` : '조사할 매물을 선택하세요.';
  $('#ai-case-status').textContent = listing ? `${listing.id}의 조건을 반영해 AI 단서를 생성할 수 있어요.` : '먼저 매물 하나를 선택해 주세요.';
}
function selectListing(id) {
  const listing = LISTINGS.find(item => item.id === id);
  if (!listing) return;
  if (selectedListingId !== id && $('#ai-analysis-result')) { $('#ai-analysis-result').hidden = true; $('#ai-analysis-result').replaceChildren(); }
  selectedListingId = id;
  currentCase = structuredClone(listing.scenario);
  openedClues = new Set();
  selectedDecision = null;
  renderPropertyListings();
  updateSelectedListing();
  $('#case-title').textContent = `${listing.id} · ${listing.title}`;
  $('#case-intro').textContent = `의뢰인 박서윤(20세)은 가온대학교(가상 캠퍼스)에 다닐 예정이며 월 주거비 한도는 55만 원입니다. ${listing.id}는 통학 약 ${listing.commute}분(게임용 수치)이며, ${listing.summary} 통학·소음·실제 비용을 함께 비교하세요.`;
  showToast(`${listing.id} 매물을 조사 대상으로 선택했습니다.`);
}
$('#property-grid').addEventListener('click', event => {
  const button = event.target.closest('[data-select-listing]');
  if (button) selectListing(button.dataset.selectListing);
});
// /api/* 경로가 없으면(리다이렉트 미적용) Netlify 함수 주소로 한 번 더 시도
async function apiFetch(name, options) {
  let response = await fetch('/api/' + name, options);
  if (response.status === 404) response = await fetch('/.netlify/functions/' + name, options);
  return response;
}
function resetQuestStage() {
  openedClues = new Set(); selectedDecision = null;
  $('#quest-stage').hidden = false;
  $('#investigation-stage').hidden = true;
  $('#decision-stage').hidden = true;
  $('#result-stage').hidden = true;
  $('#begin-investigation').disabled = !getSelectedListing();
  renderPropertyListings();
  renderPropertyComparison();
  updateSelectedListing();
  if (getSelectedListing()) {
    const listing = getSelectedListing();
    $('#case-title').textContent = currentCase?.title || `${listing.id} · ${listing.title}`;
    $('#case-intro').textContent = currentCase?.intro || `${listing.location} / ${listing.station}. ${listing.summary} 상세 조건을 확인한 뒤 현장 조사로 넘어가세요.`;
  } else {
    $('#case-title').textContent = '예산 800만 원, 조건이 다른 매물 3개를 비교해 보세요.';
    $('#case-intro').textContent = '보증금이 예산 안에 들어온다고 좋은 방은 아닙니다. 월세와 관리비, 실제 위치와 계약 전 확인 사항까지 살펴보고 조사할 매물 하나를 선택하세요.';
  }
  $$('.quest-step').forEach(step => step.classList.toggle('active', step.dataset.step === '1'));
  $$('.quest-step').forEach(step => step.classList.remove('done'));
}
$('#generate-case').addEventListener('click', async () => {
  const button = $('#generate-case');
  const status = $('#ai-case-status');
  const listing = getSelectedListing();
  if (!listing) { showToast('먼저 조사할 매물 하나를 선택해 주세요.'); return; }
  if (location.protocol === 'file:') {
    status.textContent = '현재는 기본 사례로 플레이할 수 있습니다. Gemini AI 생성은 Python 서버 실행 시 사용할 수 있어요.';
    showModal('AI 사건 생성 안내', '단일 HTML 파일에서는 브라우저 보안을 위해 API 서버에 연결하지 않습니다. 전체 소스의 server.py를 실행하면 서버에 보관된 Gemini API 키로 새로운 사례를 생성할 수 있습니다. 기본 사례 플레이는 계속 이용할 수 있습니다.');
    return;
  }
  button.disabled = true;
  button.innerHTML = '<span>…</span> 사례 생성 중';
  status.textContent = `${listing.id} 매물 조건을 바탕으로 Gemini API 연결을 확인하고 있습니다.`;
  try {
    const response = await apiFetch('generate-event', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ topic: '청소년의 첫 자취 계약 안전', budget: 8000000, learningFocus: topWrongCategory(), persona: { name:'박서윤', age:20, status:'가온대학교(가상 캠퍼스) 신입생', monthlyHousingLimit:550000, priorities:['통학 편의성','월 지출','야간 소음','계약 확인 가능 여부'] }, property: { id: listing.id, title: listing.title, deposit: listing.deposit, rent: listing.rent, fee: listing.fee, location: listing.location, station: listing.station, commuteMinutes:listing.commute, environment:listing.environment, includes: listing.includes, excludes: listing.excludes } })
    });
    if (!response.ok) throw new Error(response.status === 503 ? 'API 키가 연결되지 않았습니다.' : `서버 응답 오류 (${response.status})`);
    const data = await response.json();
    applyCase(data);
    status.textContent = 'Gemini API가 새 사례를 생성했습니다. 내용을 확인하고 플레이하세요.';
    showToast('새로운 AI 사례를 불러왔습니다.');
  } catch (error) {
    status.textContent = `${error.message} 아래 오프라인 백업 사례로 시연을 이어갈 수 있습니다.`;
    showModal('AI 사례 생성 안내', `${error.message}\n\nGemini API를 사용하려면 서버 환경변수 GEMINI_API_KEY를 설정해야 합니다. 현재 사례로도 전체 미션을 체험할 수 있습니다.`);
  } finally {
    button.disabled = false;
    button.innerHTML = '✦ AI 새 사건 생성';
  }
});
$('#load-offline-case')?.addEventListener('click',()=>{const listing=getSelectedListing();if(!listing)return;applyCase(structuredClone(listing.scenario));$('#ai-case-status').textContent='사전 제작된 오프라인 백업 사례를 불러왔습니다. AI 생성 결과라고 표시하지 않습니다.';showToast('오프라인 백업 사례를 불러왔습니다.');});

// ===== AI 매물 분석 (Gemini) =====
function localAnalysis(listing) {
  const limit = 55;
  const diff = listing.monthly - limit;
  const cheapest = [...LISTINGS].sort((a, b) => a.monthly - b.monthly)[0];
  const nearest = [...LISTINGS].sort((a, b) => a.commute - b.commute)[0];
  return {
    fit: 'mixed', headline: '기본 분석 (AI 연결 전)', local: true,
    summary: `${listing.id}의 월 기본 주거비는 ${listing.monthly}만 원으로 한도 ${limit}만 원보다 ${diff <= 0 ? `${-diff}만 원 낮아요` : `${diff}만 원 높아요`}. 통학은 약 ${listing.commute}분이에요. 공과금은 따로 들어가요.`,
    strengths: [`월 기본 주거비 ${listing.monthly}만 원`, `통학 약 ${listing.commute}분`],
    concerns: listing.checks.slice(0, 2),
    alternative: { id: null, reason: [cheapest.id !== listing.id ? `월 주거비는 ${cheapest.id}가 가장 낮아요(${cheapest.monthly}만 원).` : '', nearest.id !== listing.id ? `통학은 ${nearest.id}가 가장 가까워요(약 ${nearest.commute}분).` : ''].filter(Boolean).join(' ') },
    nextStep: ''
  };
}
function renderAnalysis(r) {
  const box = $('#ai-analysis-result');
  box.replaceChildren();
  const el = (tag, cls, text) => { const n = document.createElement(tag); if (cls) n.className = cls; if (text !== undefined) n.textContent = text; return n; };
  const top = el('div', 'aa-top');
  top.append(el('span', `aa-fit ${r.fit}`, { good: '잘 맞아요', mixed: '장단점이 있어요', caution: '주의가 필요해요' }[r.fit] || '분석'), el('h4', '', r.headline));
  box.append(top, el('p', '', r.summary));
  const cols = el('div', 'aa-cols');
  [['좋은 점', r.strengths], ['확인할 점', r.concerns]].forEach(([label, items]) => {
    const col = el('div', 'aa-col'); col.append(el('b', '', label));
    const ul = el('ul'); items.forEach(t => ul.append(el('li', '', t))); col.append(ul); cols.append(col);
  });
  box.append(cols);
  if (r.alternative && (r.alternative.id || r.alternative.reason)) {
    const alt = el('div', 'aa-alt');
    alt.append(el('b', '', r.alternative.id ? `💡 ${r.alternative.id} 매물도 비교해 보세요` : '💡 다른 매물과 비교'), el('span', '', r.alternative.reason));
    box.append(alt);
  }
  if (r.nextStep) box.append(el('p', 'aa-next', `다음 확인: ${r.nextStep}`));
  box.append(el('p', 'aa-note', r.local ? '※ AI 연결 없이 계산한 기본 분석이에요.' : '※ Gemini가 만든 학습용 코멘트예요. 매물은 모두 가상이며 정답이 아닐 수 있어요.'));
  box.hidden = false;
}
$('#analyze-choice')?.addEventListener('click', async () => {
  const listing = getSelectedListing();
  if (!listing) { showToast('먼저 매물 하나를 선택해 주세요.'); return; }
  const button = $('#analyze-choice'), status = $('#ai-analysis-status');
  if (location.protocol === 'file:') { renderAnalysis(localAnalysis(listing)); status.textContent = '파일로 열면 AI에 연결할 수 없어 기본 분석을 보여드려요.'; return; }
  button.disabled = true; button.textContent = '… AI가 분석하는 중';
  status.textContent = `${listing.id}을(를) 다른 매물과 비교하고 있어요.`;
  try {
    const response = await apiFetch('analyze-choice', {
      method: 'POST', headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        selectedId: listing.id,
        persona: { name: '박서윤', age: 20, status: '가온대학교(가상 캠퍼스) 신입생', monthlyHousingLimit: 550000, priorities: ['통학 편의성', '월 지출', '야간 소음', '계약 확인 가능 여부'] },
        listings: LISTINGS.map(x => ({ id: x.id, title: x.title, deposit: x.deposit, rent: x.rent, fee: x.fee, commute: x.commute, station: x.station, environment: x.environment, size: x.size, floor: x.floor, includes: x.includes, excludes: x.excludes, checks: x.checks }))
      })
    });
    if (!response.ok) throw new Error(response.status === 503 ? 'API 키가 연결되지 않았어요.' : `서버 응답 오류 (${response.status})`);
    const data = await response.json();
    renderAnalysis(data);
    status.textContent = 'Gemini 분석이 완료됐어요.';
  } catch (error) {
    renderAnalysis(localAnalysis(listing));
    status.textContent = `${error.message} 대신 기본 분석을 보여드려요.`;
  } finally {
    button.disabled = !getSelectedListing(); button.textContent = '✦ 선택 매물 AI 분석 받기';
  }
});
function topWrongCategory() {
  const counts = {};
  state.wrongAnswers.forEach(item => counts[item.category] = (counts[item.category] || 0) + 1);
  return Object.entries(counts).sort((a,b) => b[1]-a[1])[0]?.[0] || ({'주거·임대차':'주거비 계산','소비·예산관리':'예산 관리','저축·금융기초':'비상금·저축','계약·생활법률':'계약 전 확인','환경·에너지':'에너지·공과금','진로·창업':'초기 비용'}[state.profile?.interest] || '계약 전 확인');
}
$('#begin-investigation').addEventListener('click', () => {
  const listing = getSelectedListing();
  if (!listing) { showToast('먼저 조사할 매물을 선택해 주세요.'); return; }
  if (!currentCase || !Array.isArray(currentCase.clues)) currentCase = structuredClone(listing.scenario);
  openedClues = new Set(); mapVisited = new Set(); roomVisited = new Set(); questCash = 8000000;
  $('#quest-cash').textContent='800만 원'; $('#map-exploration-count').textContent='0 / 3'; $('#room-exploration-count').textContent='0 / 3';
  $$('.map-poi').forEach(x=>x.classList.remove('visited')); $$('[data-room-clue]').forEach(x=>x.classList.remove('visited'));
  $('#chat-transcript').innerHTML='<div class="chat-message agent"><b>중개 담당자</b><p>안녕하세요. 어떤 부분이 궁금하신가요? 확인 가능한 정보부터 안내하겠습니다.</p></div>';
  $('#investigation-heading-title').textContent = `${listing.id} · 계약 전 단서를 모아라.`;
  $('#investigation-property-label').textContent = `${listing.title} | 보증금 ${listing.deposit}만 원 · 월 기본 주거비 ${listing.monthly}만 원 + 공과금`;
  $('#quest-stage').hidden = true;
  $('#investigation-stage').hidden = false;
  $('#investigation-stage').scrollIntoView({ behavior: 'smooth', block: 'start' });
  $('#clue-grid').innerHTML = '';
  currentCase.clues.forEach((clue, index) => {
    const button = document.createElement('button');
    button.className = 'clue-card'; button.type = 'button';
    button.innerHTML = `<span class="clue-icon">${clue.icon}</span><strong></strong><small></small>`;
    $('strong', button).textContent = clue.title;
    $('small', button).textContent = clue.teaser;
    button.addEventListener('click', () => openClue(index, button));
    $('#clue-grid').appendChild(button);
  });
  updateClueProgress();
  $$('.quest-step').forEach(step => step.classList.toggle('active', step.dataset.step === '2'));
});
function appendChatMessage(role,text){const msg=document.createElement('div');msg.className=`chat-message ${role}`;const who=document.createElement('b');who.textContent=role==='user'?'나':'중개 담당자';const p=document.createElement('p');p.textContent=text;msg.append(who,p);$('#chat-transcript').append(msg);msg.scrollIntoView({block:'nearest',behavior:'smooth'});}
function revealFromExplore(index,source,button){
  const card=$('#clue-grid').children[index];if(!card)return;
  if(source==='map'){mapVisited.add(index);button?.classList.add('visited');$('#map-exploration-count').textContent=`${mapVisited.size} / 3`;}
  if(source==='room'){roomVisited.add(index);button?.classList.add('visited');$('#room-exploration-count').textContent=`${roomVisited.size} / 3`;}
  openClue(index,card,source);
}
$$('[data-map-clue]').forEach(button=>button.addEventListener('click',()=>revealFromExplore(Number(button.dataset.mapClue),'map',button)));
$$('[data-room-clue]').forEach(button=>button.addEventListener('click',()=>revealFromExplore(Number(button.dataset.roomClue),'room',button)));
$$('[data-chat-clue]').forEach(button=>button.addEventListener('click',()=>{
  const index=Number(button.dataset.chatClue),clue=currentCase.clues[index];
  appendChatMessage('user',button.textContent);
  const replies=[`주변 환경과 방문 가능 시간은 안내 자료를 확인해 주세요. 실제 통학 동선과 시간대별 소음은 직접 확인하는 것이 좋습니다. ${clue.teaser}`,`관리비 안내에는 포함·별도 항목을 구분해서 적어 두었습니다. 계약서와 실제 안내 내용이 같은지 대조해 주세요. ${clue.teaser}`,`계약 상대방과 서류는 계약 전에 확인할 수 있습니다. 관계와 권한이 확인되지 않은 상태에서는 송금을 서두르지 마세요. ${clue.teaser}`];
  appendChatMessage('agent',replies[index]||clue.detail);revealFromExplore(index,'chat',null);
}));

function openClue(index, button, source='card') {
  const clue = currentCase.clues[index];
  if(!clue)return;
  openedClues.add(clue.id);
  $$('.clue-card').forEach(card => card.classList.remove('active'));
  if(button){button.classList.add('active', 'checked');const icon=$('.clue-icon',button);if(icon)icon.textContent='✓';}
  $('#clue-detail').replaceChildren();
  const heading = document.createElement('strong'); heading.textContent = clue.title;
  const sourceLabel=document.createElement('small');sourceLabel.className='clue-source-label';sourceLabel.textContent=({map:'주변 지도에서 발견',room:'방 구조도에서 발견',chat:'중개 담당자 대화에서 발견',card:'조사 단서에서 발견'}[source]||'조사 단서');
  const paragraph = document.createElement('p'); paragraph.textContent = clue.detail;
  $('#clue-detail').append(sourceLabel,heading, paragraph);
  updateClueProgress();
}
function updateClueProgress() {
  $('#clue-count').textContent = `${openedClues.size} / ${currentCase.clues.length}`;
  if($('#clue-count-top')) $('#clue-count-top').textContent = `${openedClues.size} / ${currentCase.clues.length}`;
  $('#investigation-hint').textContent = openedClues.size === currentCase.clues.length ? '모든 단서를 확인했습니다. 판단을 내려보세요.' : `아직 확인하지 않은 단서가 ${currentCase.clues.length - openedClues.size}개 있어요.`;
  $('#to-decision').disabled = openedClues.size < currentCase.clues.length;
}
$('#to-decision').addEventListener('click', () => {
  $('#investigation-stage').hidden = true;
  $('#decision-stage').hidden = false;
  $('#decision-options').innerHTML = '';
  currentCase.options.forEach((option, index) => {
    const button = document.createElement('button'); button.className = 'decision-option'; button.type = 'button';
    const radio = document.createElement('span'); radio.className = 'decision-radio';
    const textWrap = document.createElement('span');
    const strong = document.createElement('strong'); strong.textContent = option.text;
    const sub = document.createElement('p'); sub.textContent = option.sub;
    textWrap.append(strong, sub); button.append(radio, textWrap);
    button.addEventListener('click', () => {
      selectedDecision = index;
      $$('.decision-option').forEach(item => item.classList.remove('selected'));
      button.classList.add('selected');
      $('#submit-decision').disabled = false;
    });
    $('#decision-options').appendChild(button);
  });
  $$('.quest-step').forEach(step => step.classList.toggle('active', step.dataset.step === '3'));
});
$('#submit-decision').addEventListener('click', () => {
  if (selectedDecision === null) return;
  const option = currentCase.options[selectedDecision];
  const correct = option.correct || selectedDecision === currentCase.answer;
  const reward = correct ? 50 : 15;
  if(!correct) questCash=Math.max(0,questCash-100000); // fictional game-only reservation amount at risk
  $('#quest-cash').textContent=`${(questCash/10000).toLocaleString('ko-KR')}만 원`;
  const first = !state.questCompleted;
  state.questCompleted = true;
  state.lastPlayed = new Date().toISOString();
  if (first) addPoints(reward, correct ? '안전한 판단 성공' : '미션 완료');
  else saveState();
  $('#decision-stage').hidden = true;
  $('#result-stage').hidden = false;
  $('#result-title').textContent = correct ? '근거를 바탕으로 잘 판단했어요.' : '다시 확인하면 더 좋은 선택을 할 수 있어요.';
  const chosenListing = getSelectedListing();
  $('#result-description').textContent = `${chosenListing ? `${chosenListing.id} 매물 조사 결과입니다. ` : ''}${option.feedback || (correct ? '확인한 단서를 종합해 신중하게 판단했습니다.' : '이번 선택에서 놓친 위험 신호를 다시 살펴보세요.')} ${correct?'가상 의뢰 예산은 유지됐습니다.':'게임 규칙에 따라 확인 전 예약금 10만 원이 묶였습니다.'} 남은 의뢰 예산: ${(questCash/10000).toLocaleString('ko-KR')}만 원.`;
  $('#result-points').textContent = first ? `+${reward} PT` : '+0 PT';
  $('#result-insight-text').textContent = `${currentCase.lesson} 이 시뮬레이션의 예약금 손실은 게임 내 가정이며 실제 법률상 반환 여부를 뜻하지 않습니다.`;
  trackActivity('mission_complete',{listing:chosenListing?.id||'',correct,remainingBudget:questCash});
  $$('.quest-step').forEach(step => step.classList.toggle('active', step.dataset.step === '4'));
  $$('.quest-step').forEach(step => { if (Number(step.dataset.step) < 4) step.classList.add('done'); });
  $('#result-stage').scrollIntoView({ behavior: 'smooth', block: 'center' });
});
$('#retry-quest').addEventListener('click', () => { selectedListingId = null; currentCase = structuredClone(DEFAULT_CASE); resetQuestStage(); navigate('quest'); });
$('#go-notes').addEventListener('click', () => navigate('notes'));

// Local practice-rival duel; no real-time network matchmaking is claimed.
$('#start-duel').addEventListener('click', startDuel);
function startDuel() {
  duelIndex = 0; duelUserScore = 0; duelAiScore = 0; duelAnswers = [];
  $('#duel-arena').hidden = false; $('#duel-complete').hidden = true;
  $('#duel-arena').scrollIntoView({ behavior: 'smooth', block: 'start' });
  renderDuelQuestion();
}
function renderDuelQuestion() {
  const q = DUEL_QUESTIONS[duelIndex];
  $('#duel-q-number').textContent = `ROUND 0${duelIndex + 1} / 03`;
  $('#duel-question').textContent = q.question;
  $('#duel-user-score').textContent = duelUserScore;
  $('#duel-ai-score').textContent = '—';
  $('#duel-result-line').hidden = true;
  $('#duel-next').disabled = true;
  $('#duel-next').textContent = duelIndex === 2 ? '결과 보기 →' : '다음 라운드 →';
  $('#duel-options').innerHTML = '';
  q.options.forEach((option, index) => {
    const button = document.createElement('button'); button.type = 'button'; button.className = 'option-button';
    button.innerHTML = `<span class="option-letter">${String.fromCharCode(65 + index)}</span><span></span>`;
    $('span:nth-child(2)', button).textContent = option;
    button.addEventListener('click', () => answerDuel(index));
    $('#duel-options').appendChild(button);
  });
}
function answerDuel(selected) {
  const q = DUEL_QUESTIONS[duelIndex];
  const correct = selected === q.correct;

  if (correct) duelUserScore += 10;
  // No fictitious rival score: this mode is a solo score challenge.
  duelAnswers.push(correct);
  $$('.option-button', $('#duel-options')).forEach((button, index) => {
    button.disabled = true;
    if (index === q.correct) button.classList.add('correct');
    if (index === selected && !correct) button.classList.add('wrong');
  });
  $('#duel-user-score').textContent = duelUserScore;
  $('#duel-ai-score').textContent = '—';
  const line = $('#duel-result-line'); line.hidden = false;
  line.textContent = `${correct ? '정답입니다!' : '정답을 확인해 보세요.'} ${q.explanation}`;
  $('#duel-next').disabled = false;
}
$('#duel-next').addEventListener('click', () => {
  if (duelIndex < 2) { duelIndex += 1; renderDuelQuestion(); }
  else finishDuel();
});
function finishDuel() {
  if (!state.duelPlayed) { state.duelPlayed = true; addPoints(25, '첫 스피드 챌린지 완료'); }
  saveState();
  $('#duel-arena').hidden = true; $('#duel-complete').hidden = false;
  $('#duel-final-user').textContent = duelUserScore;
  state.duelBest=Math.max(Number(state.duelBest||0),duelUserScore);saveState();
  $('#duel-final-ai').textContent = `${state.duelBest}점`;
  $('#duel-final-title').textContent = `${duelUserScore}점 기록 · 최고 기록 ${state.duelBest}점`;
  $('#duel-final-desc').textContent = `3라운드 중 ${duelAnswers.filter(Boolean).length}문제를 맞혔습니다. 오답노트와 학습 차시에서 부족한 개념을 보완해 보세요.`;
}
$('#duel-again').addEventListener('click', startDuel);

// Wrong-answer notebook.
function renderNotes() {
  $('#notes-total').textContent = state.wrongAnswers.length;
  $('#notes-reviewed').textContent = state.reviewedCount;
  const list = $('#notes-list'); list.innerHTML = '';
  if (!state.wrongAnswers.length) {
    const empty = document.createElement('div'); empty.className = 'empty-state panel';
    empty.innerHTML = '<div class="empty-icon">▤</div><strong>아직 저장된 오답이 없어요.</strong><p>학습 퀴즈를 풀면 틀린 문제가 이곳에 자동으로 저장됩니다.</p><button class="primary-button" data-go="learn">학습하러 가기 <span>→</span></button>';
    $('[data-go="learn"]', empty).addEventListener('click', () => navigate('learn'));
    list.appendChild(empty);
    return;
  }
  state.wrongAnswers.forEach(item => {
    const card = document.createElement('article'); card.className = 'note-item panel';
    const body = document.createElement('div');
    const top = document.createElement('div'); top.className = 'note-item-top';
    const category = document.createElement('span'); category.className = 'note-category'; category.textContent = item.category;
    const date = document.createElement('span'); date.className = 'note-date'; date.textContent = item.date;
    top.append(category, date);
    const title = document.createElement('h3'); title.textContent = item.question;
    const p = document.createElement('p'); p.textContent = `내 선택: ${item.selected} · 정답: ${item.correctAnswer}`;
    body.append(top, title, p);
    const actions = document.createElement('div'); actions.className = 'note-item-actions';
    const explanation = document.createElement('button'); explanation.textContent = '해설 보기';
    explanation.addEventListener('click', () => showModal('정답과 해설', `정답: ${item.correctAnswer}\n\n${item.explanation}`));
    const review = document.createElement('button'); review.textContent = item.reviewed ? '복습 완료' : '복습 완료 표시';
    review.disabled = Boolean(item.reviewed);
    review.addEventListener('click', () => { item.reviewed = true; state.reviewedCount += 1; saveState(); showToast('복습 완료로 기록했습니다.'); });
    actions.append(explanation, review); card.append(body, actions); list.appendChild(card);
  });
}
$('#clear-notes').addEventListener('click', () => showModal('오답 기록 초기화', '저장된 오답 기록을 모두 삭제할까요? 이 작업은 되돌릴 수 없습니다.', () => { state.wrongAnswers = []; state.reviewedCount = 0; saveState(); }));

// Example leaderboard.
function renderRanking() {
  const level=getLevel();
  $('#rank-list').innerHTML='';
  const row=document.createElement('div');row.className='rank-row me';
  const rank=document.createElement('span');rank.className='rank-number top1';rank.textContent='MY';
  const user=document.createElement('span');user.className='rank-user';
  const avatar=document.createElement('i');avatar.textContent=state.profile?.avatar||'🏡';avatar.style.background=state.profile?.accent||'#d8f58c';
  const name=document.createElement('span');name.textContent=state.profile?.name||'플레이어';user.append(avatar,name);
  const lvl=document.createElement('span');lvl.className='rank-level';lvl.textContent=`Lv. ${level.level}`;
  const pts=document.createElement('span');pts.className='rank-points';pts.textContent=`${(state.rankPoints||0).toLocaleString('ko-KR')} RP`;
  row.append(rank,user,lvl,pts);$('#rank-list').append(row);
  const note=$('.rank-footnote');if(note)note.textContent='RP는 학습·퀴즈·미션으로 누적되는 성장 점수이며 상점에서 사용해도 줄어들지 않습니다. 다른 사용자와의 실시간 순위는 계정·서버 연결 후 제공할 예정입니다.';
}

// Virtual rewards.
function renderShop() {
  $('#reward-grid').innerHTML = '';
  REWARDS.forEach(reward => {
    const owned = state.purchases.includes(reward.id);
    const card = document.createElement('article'); card.className = 'reward-card';
    const art = document.createElement('div'); art.className = 'reward-art'; art.textContent = reward.icon;
    const title = document.createElement('h3'); title.textContent = reward.name;
    const desc = document.createElement('p'); desc.textContent = reward.desc;
    const button = document.createElement('button'); button.className = 'reward-buy'; button.disabled = owned || state.points < reward.cost;
    const label = document.createElement('span'); label.textContent = owned ? '보유 중' : '교환하기';
    const cost = document.createElement('strong'); cost.textContent = owned ? '✓' : `${reward.cost} PT`;
    button.append(label, cost);
    button.addEventListener('click', () => {
      if (owned || state.points < reward.cost) return;
      state.points -= reward.cost; state.purchases.push(reward.id); saveState(); showToast(`${reward.name} 교환 완료`);
    });
    card.append(art, title, desc, button); $('#reward-grid').appendChild(card);
  });
}


// Six-month independent-living simulation. All amounts and events are fictional game assumptions.
const LIFE_EVENTS = [
  { title:'첫 공과금 고지서', desc:'첫 달 전기·가스 사용 내역을 확인했습니다. 생활 패턴을 바꾸면 비용과 편의가 함께 달라질 수 있습니다.', choices:[
    {title:'사용하지 않는 조명과 대기전력을 줄이고 사용량을 기록한다.',detail:'지출을 줄이는 대신 생활 습관을 조금 조정합니다.',cash:35000,sat:-1,skill:'money',msg:'사용량을 기록하고 불필요한 소비를 줄였습니다. 게임에서는 공과금 부담이 낮아졌습니다.'},
    {title:'생활 편의를 우선하고 현재 사용 패턴을 유지한다.',detail:'비용이 늘 수 있지만 생활 만족도를 유지합니다.',cash:-25000,sat:4,skill:'plan',msg:'편의성을 선택했습니다. 비용과 만족도 사이의 균형을 다음 달 예산에서 고려해야 합니다.'},
    {title:'고지서의 항목을 확인하지 않고 납부를 미룬다.',detail:'당장의 현금은 남지만 미납 위험이 생깁니다.',cash:0,sat:-8,skill:'home',msg:'납부를 미루면 이후 부담이 커질 수 있습니다. 고지 항목과 납부 기한을 먼저 확인하는 습관이 필요합니다.'}
  ]},
  { title:'세탁기 작동 이상', desc:'세탁기가 평소와 다르게 작동합니다. 임의로 분해하기보다 상황을 확인하고 기록을 남기는 것이 중요합니다.', choices:[
    {title:'증상과 발생 시점을 기록하고 관리 주체에 점검을 요청한다.',detail:'원인과 수리 책임을 확인한 뒤 진행합니다.',cash:0,sat:2,skill:'home',msg:'문제를 기록하고 점검을 요청했습니다. 수리 책임과 비용은 계약 내용 및 실제 원인에 따라 확인해야 합니다.'},
    {title:'수리 업체를 바로 불러 자비로 처리한다.',detail:'빠르게 해결할 수 있지만 비용 부담이 생깁니다.',cash:-130000,sat:5,skill:'home',msg:'문제는 빨리 해결했지만 비용을 직접 부담했습니다. 먼저 관리 주체와 수리 책임을 확인하는 편이 합리적일 수 있습니다.'},
    {title:'작동을 멈추고 아무에게도 알리지 않는다.',detail:'비용은 들지 않지만 문제가 커질 수 있습니다.',cash:0,sat:-10,skill:'plan',msg:'상태를 방치하면 추가 문제가 생길 수 있습니다. 발견 즉시 기록하고 적절한 담당자에게 알리는 것이 좋습니다.'}
  ]},
  { title:'이번 달 식비 계획', desc:'예산을 점검해 보니 식비 지출을 조정할 여지가 있습니다. 비용만이 아니라 시간과 생활 만족도도 고려해 보세요.', choices:[
    {title:'일주일 식단과 장보기 목록을 먼저 정한다.',detail:'계획적인 소비로 지출을 관리합니다.',cash:45000,sat:1,skill:'money',msg:'필요한 만큼 구매해 식비를 절약했습니다. 계획적인 소비가 잔액을 지키는 데 도움이 됩니다.'},
    {title:'바쁜 날은 배달과 외식을 적극 활용한다.',detail:'시간을 아끼고 편리함을 얻지만 지출이 늘어납니다.',cash:-90000,sat:7,skill:'plan',msg:'시간과 편의를 얻었지만 식비가 늘었습니다. 다음 달에는 편의 지출의 한도를 정해 볼 수 있습니다.'},
    {title:'대량으로 구매해 두고 남은 식재료는 나중에 생각한다.',detail:'단가가 낮아도 사용하지 못하면 낭비가 생길 수 있습니다.',cash:-20000,sat:-2,skill:'money',msg:'구매 단가보다 실제 사용량이 중요합니다. 보관 기간과 소비 계획까지 고려해야 합니다.'}
  ]},
  { title:'늦은 밤 반복되는 생활 소음', desc:'밤 시간대에 반복되는 소음으로 생활에 불편이 생겼습니다. 감정적인 대응보다 상황을 구체적으로 파악하는 선택이 필요합니다.', choices:[
    {title:'발생 시간과 상황을 정리한 뒤 정중하게 대화를 시도한다.',detail:'상대방에게 상황을 알리고 해결 방법을 찾습니다.',cash:0,sat:5,skill:'plan',msg:'구체적인 상황을 바탕으로 대화를 시도했습니다. 사실을 정리하고 차분히 소통하는 것이 갈등 해결의 출발점입니다.'},
    {title:'반복된 시간과 내용을 기록하고 관리 주체에 상담한다.',detail:'문제를 객관적으로 정리해 도움을 요청합니다.',cash:0,sat:3,skill:'home',msg:'기록을 남겨 상황을 정리했습니다. 반복되는 문제는 구체적인 자료를 바탕으로 적절한 관리 주체와 상의할 수 있습니다.'},
    {title:'같은 방식으로 소음을 내며 맞대응한다.',detail:'순간적으로는 감정이 풀릴 수 있지만 갈등이 커질 수 있습니다.',cash:-20000,sat:-12,skill:'',msg:'맞대응은 갈등을 키울 수 있습니다. 상황을 기록하고 대화나 관리 주체를 통한 해결을 고려하세요.'}
  ]},
  { title:'비상금과 작은 소비 사이', desc:'이번 달은 예상보다 지출이 적어 여유 자금이 생겼습니다. 저축과 현재의 만족을 어떻게 배분할까요?', choices:[
    {title:'현금 15만 원을 별도 비상금으로 옮긴다.',detail:'당장 쓸 수 있는 돈은 줄지만 저축이 늘어납니다.',cash:-150000,saving:150000,sat:-1,skill:'money',msg:'비상금을 별도로 분리했습니다. 현금과 저축을 구분해 관리하면 예상치 못한 지출에 대비하기 쉽습니다.'},
    {title:'방에 필요한 소품을 구매해 생활 공간을 개선한다.',detail:'생활 만족도가 높아지지만 현금이 줄어듭니다.',cash:-100000,sat:8,skill:'plan',msg:'생활 공간의 만족도를 높였습니다. 다만 반복되는 소비가 예산을 넘지 않도록 기준을 정해 두세요.'},
    {title:'당장 지출하지 않고 현금으로 보유한다.',detail:'유동성을 유지해 다음 달 선택지를 넓힙니다.',cash:0,sat:1,skill:'money',msg:'현금을 유지해 유동성을 확보했습니다. 목적별로 쓸 돈과 남겨 둘 돈을 구분하면 더 체계적으로 관리할 수 있습니다.'}
  ]},
  { title:'계약 조건을 다시 확인할 시점', desc:'시뮬레이션의 마지막 달입니다. 거주를 이어갈지 판단하기 전에 변경 조건과 비용을 확인해야 합니다.', choices:[
    {title:'변경되는 조건과 금액을 문서로 받아 기존 내용과 비교한다.',detail:'확인되지 않은 내용은 질문하고 판단을 미룹니다.',cash:0,sat:3,skill:'home',msg:'변경 조건을 문서로 확인하는 선택을 했습니다. 실제 계약에서는 구체적인 조건과 절차를 관련 기관이나 전문가에게 확인해야 합니다.'},
    {title:'구두로 들은 설명만 믿고 그대로 진행한다.',detail:'빠르게 결정할 수 있지만 기록이 부족합니다.',cash:0,sat:0,skill:'',msg:'구두 설명만으로는 나중에 내용을 확인하기 어려울 수 있습니다. 중요한 조건은 문서로 확인하는 습관이 필요합니다.'},
    {title:'다른 주거 대안을 비교하고 이사 비용까지 계산한다.',detail:'선택지를 넓히지만 탐색과 준비에 시간·비용이 듭니다.',cash:-30000,sat:2,skill:'plan',msg:'대안을 비교해 선택지를 확보했습니다. 이동 비용과 보증금 정산 등 추가 항목까지 함께 계산해야 합니다.'}
  ]}
];
const moneyKRW = value => `${Math.round(value).toLocaleString('ko-KR')}원`;
function selectedLifeListing(){const id=state.sim?.listingId;return LISTINGS.find(x=>x.id===id)||LISTINGS[0];}
function renderLifeStatus(){
  const sim=state.sim;if(!sim||!$('#life-game'))return;
  if(sim.started&&!sim.finished){$('#life-setup').hidden=true;$('#life-game').hidden=false;$('#life-finish').hidden=true;}
  else if(sim.finished){$('#life-setup').hidden=true;$('#life-game').hidden=true;$('#life-finish').hidden=false;}
  else{$('#life-setup').hidden=false;$('#life-game').hidden=true;$('#life-finish').hidden=true;}
  if(!sim.started)return;
  $('#life-player-name').value=sim.name||state.profile.name;
  $('#life-month').textContent=sim.finished?'완료':`${Math.min(sim.awaitingChoice?sim.month+1:Math.max(1,sim.month),6)}개월 차`;
  $('#life-home-label').textContent=sim.listingId;
  $('#life-cash').textContent=moneyKRW(sim.cash);
  $('#life-savings').textContent=moneyKRW(sim.savings);
  $('#life-satisfaction').textContent=`${sim.satisfaction} / 100`;
  $('#life-networth').textContent=moneyKRW(sim.cash+sim.savings);
  $('#life-progress-label').textContent=`${sim.month} / 6개월`;
  $('#life-progress-bar').style.width=`${sim.month/6*100}%`;
  $$('#life-month-track [data-month]').forEach(node=>{
    const month=Number(node.dataset.month);
    node.classList.toggle('done',month<=sim.month);
    node.classList.toggle('current',!sim.finished && month===sim.month+1);
    node.setAttribute('aria-current',!sim.finished && month===sim.month+1?'step':'false');
  });
  $('#life-skill-money').textContent=`Lv.${sim.skills.money}`;
  $('#life-skill-home').textContent=`Lv.${sim.skills.home}`;
  $('#life-skill-plan').textContent=`Lv.${sim.skills.plan}`;
  [['money',sim.skills.money],['home',sim.skills.home],['plan',sim.skills.plan]].forEach(([key,value])=>{
    const bar=$(`#life-skill-${key}-bar`); if(bar) bar.style.width=`${Math.min(100,Number(value)*10)}%`;
  });
  const hist=$('#life-history');hist.innerHTML='';
  (sim.history||[]).slice(-4).reverse().forEach(item=>{const el=document.createElement('div');el.className='life-history-item';const b=document.createElement('b');b.textContent=`${item.month}개월 차 · ${item.title}`;const s=document.createElement('small');s.textContent=item.choice;el.append(b,s);hist.append(el);});
  if(!sim.history?.length)hist.innerHTML='<p>첫 달 선택부터 기록됩니다.</p>';
}
function renderLifeSimulator(){
  if(!$('#life-setup'))return;
  renderLifeArchive();
  const sim=state.sim;
  if(!sim||!sim.started){$('#life-setup').hidden=false;$('#life-game').hidden=true;$('#life-finish').hidden=true;$('#life-player-name').value=state.profile.name||'플레이어';return;}
  renderLifeStatus();
  if(sim.finished){renderLifeFinish();return;}
  if(sim.awaitingChoice)renderLifeEvent();
  else renderLifeAfterChoice();
}
function renderLifeAfterChoice(){
  const sim=state.sim;if(!sim||sim.finished||!sim.history?.length)return;
  const item=sim.history[sim.history.length-1];const event=LIFE_EVENTS[Math.max(0,sim.month-1)];
  $('#life-event-kicker').textContent=`MONTH 0${item.month} · DECISION RECORDED`;
  $('#life-event-title').textContent=item.title;
  $('#life-event-description').textContent=event?.desc||'이번 달 선택이 기록되었습니다.';
  const s=sim.currentSettlement||{};
  $('#life-settlement').innerHTML=`<div><small>이번 달 수입</small><b>+${moneyKRW(s.income||0)}</b></div><div><small>고정 지출</small><b>-${moneyKRW(s.expense||0)}</b></div><div><small>정산 후 변화</small><b>${(s.net||0)>=0?'+':'−'}${moneyKRW(Math.abs(s.net||0))}</b></div>`;
  $('#life-settlement-note').textContent=`주거비 ${moneyKRW(s.housing||0)} + 기타 생활비 ${moneyKRW(s.living||0)} (공과금 9만 · 식비 30만 · 교통 7만 · 통신 5만 원)`;
  $('#life-choices').innerHTML='';$('#life-feedback').textContent=item.result;$('#life-feedback').hidden=false;
  $('#life-impact').hidden=true;$('#life-next').hidden=false;
  $('#life-next').textContent=sim.month>=6?'6개월 결과 확인 →':'다음 달로 이동 →';
}
function startLifeSimulation(){
  const name=($('#life-player-name').value.trim()||state.profile.name||'플레이어').slice(0,14);
  const budget=Number($('#life-budget').value)||8000000;
  const listingId=$('input[name="life-house"]:checked')?.value||'A-01';
  const listing=LISTINGS.find(x=>x.id===listingId)||LISTINGS[0];
  if(budget<listing.deposit*10000){showToast('선택한 보증금보다 시작 자금이 적습니다.');return;}
  state.sim={started:true,finished:false,name,budget,listingId,cash:budget-listing.deposit*10000,savings:0,satisfaction:70,month:0,skills:{money:1,home:1,plan:1},history:[],awaitingChoice:true,currentSettlement:null};
  prepareLifeMonth();saveState();navigate('life');
}
function prepareLifeMonth(){
  const sim=state.sim;if(!sim||sim.month>=6){finishLifeSimulation();return;}
  const listing=selectedLifeListing();
  const income=1500000;
  const living=510000; // game assumption: utilities 90k + food 300k + transit 70k + telecom 50k
  const housing=(listing.rent+listing.fee)*10000;
  const expense=housing+living;const net=income-expense;
  sim.cash+=net;
  sim.currentSettlement={income,housing,living,expense,net};
  sim.awaitingChoice=true;
  saveState();renderLifeEvent();
}
function renderLifeEvent(){
  const sim=state.sim;if(!sim||sim.finished)return;
  const index=sim.month;const event=LIFE_EVENTS[index];if(!event)return;
  $('#life-event-kicker').textContent=`MONTH 0${index+1} · LIFE EVENT`;
  $('#life-event-title').textContent=event.title;
  $('#life-event-description').textContent=event.desc;
  const s=sim.currentSettlement||{};
  $('#life-settlement').innerHTML=`<div><small>이번 달 수입</small><b>+${moneyKRW(s.income||0)}</b></div><div><small>고정 지출</small><b>-${moneyKRW(s.expense||0)}</b></div><div><small>정산 후 변화</small><b>${(s.net||0)>=0?'+':'−'}${moneyKRW(Math.abs(s.net||0))}</b></div>`;
  $('#life-settlement-note').textContent=`주거비 ${moneyKRW(s.housing||0)} + 기타 생활비 ${moneyKRW(s.living||0)} (공과금 9만 · 식비 30만 · 교통 7만 · 통신 5만 원)`;
  $('#life-choices').innerHTML='';$('#life-feedback').hidden=true;$('#life-impact').hidden=true;$('#life-next').hidden=true;
  event.choices.forEach((choice,i)=>{const button=document.createElement('button');button.type='button';button.className='life-choice';const n=document.createElement('span');n.className='life-choice-number';n.textContent=String(i+1);const body=document.createElement('span');const title=document.createElement('strong');title.textContent=choice.title;const detail=document.createElement('small');detail.textContent=choice.detail;body.append(title,detail);button.append(n,body);button.addEventListener('click',()=>chooseLifeOption(i));$('#life-choices').append(button);});
  renderLifeStatus();
}
function chooseLifeOption(index){
  const sim=state.sim;if(!sim||!sim.awaitingChoice)return;
  const event=LIFE_EVENTS[sim.month],choice=event.choices[index];if(!choice)return;
  sim.cash+=choice.cash||0;sim.savings+=choice.saving||0;sim.satisfaction=Math.max(0,Math.min(100,sim.satisfaction+(choice.sat||0)));
  if(choice.skill)sim.skills[choice.skill]=Math.min(10,(sim.skills[choice.skill]||1)+1);
  sim.history.push({month:sim.month+1,title:event.title,choice:choice.title,result:choice.msg,cash:choice.cash||0,saving:choice.saving||0,sat:choice.sat||0,skill:choice.skill||''});
  sim.awaitingChoice=false;
  $$('.life-choice').forEach(b=>b.disabled=true);
  $('#life-feedback').textContent=choice.msg;$('#life-feedback').hidden=false;
  const impact=[];
  if(choice.cash) impact.push(`현금 ${choice.cash>0?'+':''}${moneyKRW(choice.cash)}`);
  if(choice.saving) impact.push(`저축 +${moneyKRW(choice.saving)}`);
  if(choice.sat) impact.push(`만족도 ${choice.sat>0?'+':''}${choice.sat}점`);
  if(choice.skill) impact.push(`${({money:'돈 관리',home:'주거 관리',plan:'계획·협상'})[choice.skill]} 능력 +1`);
  $('#life-impact').textContent=`이번 선택의 변화  ·  ${impact.length?impact.join('  /  '):'수치 변화 없음'}`;
  $('#life-impact').hidden=false;
  $('#life-next').hidden=false;$('#life-next').textContent=sim.month===5?'6개월 결과 확인 →':'다음 달로 이동 →';
  sim.month+=1;saveState();renderLifeStatus();
}
function nextLifeMonth(){const sim=state.sim;if(!sim||sim.awaitingChoice||sim.finished)return;if(sim.month>=6){finishLifeSimulation();return;}prepareLifeMonth();}
function finishLifeSimulation(){
  const sim=state.sim;if(!sim||sim.finished)return;
  sim.finished=true;sim.awaitingChoice=false;
  const total=sim.cash+sim.savings;
  sim.grade=total<0?'재정 재정비 필요':sim.satisfaction>=80&&total>=1000000?'안정적인 독립생활':sim.satisfaction>=60?'균형을 찾아가는 생활':'생활 패턴 조정 필요';
  if(!sim.rewarded){const reward=(state.simRecords||[]).length?20:60;state.points+=reward;state.xp+=reward;sim.rewarded=true;sim.reward=reward;}
  // Keep a compact run archive in the current local browser only.
  state.simRecords=Array.isArray(state.simRecords)?state.simRecords:[];
  state.simRecords.push({name:sim.name,listingId:sim.listingId,cash:sim.cash,savings:sim.savings,satisfaction:sim.satisfaction,grade:sim.grade,history:sim.history.slice()});
  saveState();renderLifeFinish();renderLifeArchive();
}
function renderLifeArchive(){
  const wrap=$('#life-archive'),list=$('#life-archive-list');if(!wrap||!list)return;
  const records=Array.isArray(state.simRecords)?state.simRecords:[];
  wrap.hidden=records.length===0;list.innerHTML='';
  records.slice(-6).reverse().forEach((record,index)=>{
    const card=document.createElement('article');card.className='life-archive-item';
    const title=document.createElement('b');title.textContent=`${records.length-index}회차 · ${record.name} · ${record.listingId}`;
    const summary=document.createElement('span');summary.textContent=`최종 자산 ${moneyKRW((record.cash||0)+(record.savings||0))} · 현금 ${moneyKRW(record.cash||0)} · 저축 ${moneyKRW(record.savings||0)}`;
    const grade=document.createElement('small');grade.textContent=`${record.grade} · 만족도 ${record.satisfaction}점`;
    card.append(title,summary,grade);list.append(card);
  });
}
function renderLifeFinish(){
  const sim=state.sim;if(!sim)return;
  $('#life-finish-title').textContent=sim.grade||'첫 독립생활 6개월 완료';
  $('#life-finish-copy').textContent=`${sim.name} 플레이어의 6개월 생활이 끝났습니다. 최종 현금과 저축을 합친 금액은 ${moneyKRW(sim.cash+sim.savings)}이며, 만족도는 ${sim.satisfaction}점입니다. 결과는 이번 게임에서 선택한 조건과 가정에 따른 것입니다.`;
  $('#life-final-cash').textContent=moneyKRW(sim.cash);$('#life-final-savings').textContent=moneyKRW(sim.savings);$('#life-final-satisfaction').textContent=`${sim.satisfaction}점`;
  $('#life-final-skills').textContent=Object.values(sim.skills).reduce((a,b)=>a+b,0)-3;
  $('#life-final-log').innerHTML='<h3>6개월 생활 기록</h3>';
  sim.history.forEach(item=>{const p=document.createElement('p');p.textContent=`${item.month}개월 차 · ${item.title} — ${item.choice} ${item.result}`;$('#life-final-log').append(p);});
  const reward=sim.reward||0;if(reward)$('#life-finish-copy').textContent+=` 첫 완주 보상 ${reward} PT가 지급되었습니다.`;
  renderLifeStatus();
}
$('#life-start').addEventListener('click',startLifeSimulation);
$('#life-next').addEventListener('click',nextLifeMonth);
$('#life-new-run').addEventListener('click',()=>{state.sim=null;saveState();renderLifeSimulator();window.scrollTo({top:0,behavior:'smooth'});});

// Accessibility, data portability, pilot research and self-assessment.
function applyAccessibility(){const a=state.accessibility||DEFAULT_STATE.accessibility;document.documentElement.style.setProperty('--user-font-scale',String(a.fontScale||1));document.body.classList.toggle('high-contrast',Boolean(a.highContrast));$('#contrast-toggle')?.setAttribute('aria-pressed',String(Boolean(a.highContrast)));}
$('#font-decrease').addEventListener('click',()=>{state.accessibility.fontScale=Math.max(.9,Math.round((state.accessibility.fontScale-.05)*100)/100);applyAccessibility();saveState();});
$('#font-increase').addEventListener('click',()=>{state.accessibility.fontScale=Math.min(1.25,Math.round((state.accessibility.fontScale+.05)*100)/100);applyAccessibility();saveState();});
$('#contrast-toggle').addEventListener('click',()=>{state.accessibility.highContrast=!state.accessibility.highContrast;applyAccessibility();saveState();});
$('#speak-page').addEventListener('click',()=>{if(!('speechSynthesis'in window)){showToast('이 브라우저는 읽어주기를 지원하지 않습니다.');return;}speechSynthesis.cancel();const text=($('#main-content .page.active')?.innerText||'').slice(0,4500);const utterance=new SpeechSynthesisUtterance(text);utterance.lang='ko-KR';utterance.rate=.95;speechSynthesis.speak(utterance);});
function exportProgress(){const data={app:'LifeQ',version:'3.0',exportedAt:new Date().toISOString(),state};const blob=new Blob([JSON.stringify(data,null,2)],{type:'application/json'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download=`LifeQ_기록백업_${new Date().toISOString().slice(0,10)}.json`;a.click();URL.revokeObjectURL(url);}
$('#export-progress').addEventListener('click',exportProgress);
$('#import-progress').addEventListener('change',async event=>{const file=event.target.files?.[0];if(!file)return;try{const data=JSON.parse(await file.text());const imported=data?.state;if(data?.app!=='LifeQ'||!imported||typeof imported!=='object'||!Array.isArray(imported.wrongAnswers)||!imported.profile)throw new Error('LifeQ 백업 파일 형식이 아닙니다.');const merged={...DEFAULT_STATE,...imported,profile:{...DEFAULT_STATE.profile,...imported.profile},accessibility:{...DEFAULT_STATE.accessibility,...imported.accessibility}};if(!Array.isArray(merged.completedLessons))merged.completedLessons=[];if(!Array.isArray(merged.rewardedQuizzes))merged.rewardedQuizzes=[];state=merged;saveState();applyAccessibility();showToast('기록을 가져왔습니다.');closeProfileEditor();}catch(error){showModal('기록 가져오기 실패',error.message||'파일을 읽지 못했습니다.');}finally{event.target.value='';}});
function renderPilotSummary(){const rows=state.pilotResponses||[];$('#pilot-count').textContent=rows.length;const done=rows.filter(x=>x.task==='yes').length;$('#pilot-completion').textContent=rows.length?`${Math.round(done/rows.length*100)}%`:'-';const avg=rows.length?rows.reduce((a,x)=>a+Number(x.revisit||0),0)/rows.length:0;$('#pilot-return-average').textContent=rows.length?`${avg.toFixed(1)} / 5`:'-';}
$('#pilot-save').addEventListener('click',()=>{state.pilotResponses=Array.isArray(state.pilotResponses)?state.pilotResponses:[];state.pilotResponses.push({task:$('#pilot-task').value,ease:Number($('#pilot-ease').value),revisit:Number($('#pilot-return').value),friction:$('#pilot-friction').value.trim().slice(0,120),at:new Date().toISOString()});trackActivity('pilot_response_saved');saveState();renderPilotSummary();$('#pilot-friction').value='';showToast('익명 파일럿 응답을 저장했습니다.');});
$('#pilot-export').addEventListener('click',()=>{const rows=state.pilotResponses||[];if(!rows.length){showToast('내보낼 응답이 없습니다.');return;}const csv=['task,ease,revisit,friction,at',...rows.map(x=>[x.task,x.ease,x.revisit,`"${String(x.friction||'').replaceAll('"','""')}"`,x.at].join(','))].join('\n');const blob=new Blob(['\ufeff'+csv],{type:'text/csv;charset=utf-8'});const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='LifeQ_익명_파일럿_응답.csv';a.click();URL.revokeObjectURL(url);});
const SURVIVAL_ITEMS=[
  {q:'월세 45만 원, 관리비 8만 원인 집의 기본 주거비를 계산할 수 있나요?',a:['계산할 수 있다','월세만 보면 된다','잘 모르겠다'],score:[2,0,0]},
  {q:'실제 방을 보기 전에 예약금을 보내 달라는 요청을 받으면?',a:['먼저 송금한다','매물·상대방·서류를 확인한다','사진만 다시 본다'],score:[0,2,0]},
  {q:'관리비 7만 원에 무엇이 포함되는지 모른다면?',a:['포함·별도 항목을 질문한다','다른 집보다 싸면 선택한다','입주 후 확인한다'],score:[2,0,0]},
  {q:'입주 후 누수가 발견되면?',a:['상태를 기록하고 관리 주체에 알린다','혼자 분해한다','그냥 둔다'],score:[2,0,0]},
  {q:'매달 예상치 못한 지출에 대비하는 방법은?',a:['남는 돈이 있으면 그때 생각한다','예산 안에 비상금 항목을 둔다','전부 소비한다'],score:[0,2,0]}
];
$('#open-survival-test').addEventListener('click',()=>{const wrap=$('#survival-test-questions');wrap.innerHTML='';SURVIVAL_ITEMS.forEach((item,i)=>{const field=document.createElement('fieldset');field.className='survival-question';const legend=document.createElement('legend');legend.textContent=`${i+1}. ${item.q}`;field.append(legend);item.a.forEach((answer,j)=>{const label=document.createElement('label');const input=document.createElement('input');input.type='radio';input.name=`survival-${i}`;input.value=j;const span=document.createElement('span');span.textContent=answer;label.append(input,span);field.append(label);});wrap.append(field);});$('#survival-test-result').hidden=true;$('#survival-test-submit').hidden=false;$('#survival-test-backdrop').hidden=false;});
$('#survival-test-close').addEventListener('click',()=>$('#survival-test-backdrop').hidden=true);
$('#survival-test-submit').addEventListener('click',()=>{let score=0,answered=0;SURVIVAL_ITEMS.forEach((item,i)=>{const selected=$(`input[name="survival-${i}"]:checked`);if(selected){answered++;score+=item.score[Number(selected.value)]||0;}});if(answered!==SURVIVAL_ITEMS.length){showToast('5개 문항에 모두 답해 주세요.');return;}const level=score>=8?'준비된 설계자':score>=5?'성장 중인 탐험가':'첫걸음 연습생';const advice=score>=8?'핵심 개념을 잘 알고 있습니다. 이제 매물 비교와 계약 확인을 실제 상황처럼 연습해 보세요.':'주거비 계산·계약 확인·생활비 계획 중 부족한 영역을 1분 학습에서 보완한 뒤 자취 미션에 도전해 보세요.';$('#survival-test-result').hidden=false;$('#survival-test-result').innerHTML=`<div class="survival-result-card"><span>MY LIFEQ TYPE</span><h3>${level}</h3><strong>${score} / 10점</strong><p>${advice}</p><button type="button" class="primary-button" id="survival-to-quest">자취 미션으로 이어가기 →</button></div>`;$('#survival-test-submit').hidden=true;$('#survival-to-quest').addEventListener('click',()=>{$('#survival-test-backdrop').hidden=true;navigate('quest');});trackActivity('survival_test',{score,answered});});

// Initialise state-driven UI.
renderLesson();
applyAccessibility();
renderPilotSummary();
renderAll();
renderRanking();
renderShop();
resetQuestStage();

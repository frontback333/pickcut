import { addMinutes } from './time.js';

export const PROTOTYPE_NOW = '14:40';
export const STYLE_DURATIONS = { '애즈펌': 120, '볼륨 펌': 120, '가르마펌': 100, '다운펌': 60, '남자 커트': 40, '뿌리염색': 90, '케어컷': 60 };
export const SHIPPING = { fee: 3000, freeFrom: 30000 };
export const DIAG_OPTIONS = {
  thickness: [['low', '적음'], ['mid', '보통'], ['high', '많음']],
  length: [['short', '숏'], ['bob', '단발'], ['medium', '중단발'], ['long', '장발']],
  color: [['black', '자연 흑발'], ['dark', '어두운 갈색'], ['light', '밝은 갈색'], ['ash', '애쉬·기타']],
  bleach: [['none', '없음'], ['dye', '염색만'], ['once', '탈색 1회'], ['twice', '탈색 2회 이상']]
};
export const CARE_NEEDS = [['wheelchair', '휠체어를 이용해요'], ['sensory', '소리·촉감에 예민해요'], ['short', '오래 앉아 있기 어려워요'], ['visual', '말보다 글·그림이 편해요']];
export const FLASH_DEALS = [
  { id: 'flash_1', designer: 1, name: '박도윤', avatar: '도윤', salon: '성북 헤어랩', distance: '도보 6분', time: addMinutes(PROTOTYPE_NOW, 35), minutes: 35, off: 30, style: '남자 커트', price: 18000 },
  { id: 'flash_2', designer: 0, name: '한지우', avatar: '지우', salon: '정릉헤어', distance: '도보 8분', time: addMinutes(PROTOTYPE_NOW, 50), minutes: 50, off: 20, style: '애즈펌', price: 48000 },
  { id: 'flash_3', designer: 2, name: '최유나', avatar: '유나', salon: '길음 살롱', distance: '도보 10분', time: addMinutes(PROTOTYPE_NOW, 60), minutes: 60, off: 20, style: '뿌리염색', price: 35000 }
];
export const NOTIFICATIONS = {
  noti_delay: { icon: 'clock', title: '{N}분 지연 안내 · 한지우 디자이너', body: '앞 시술(펌)이 길어져 예약이 15:30 → {time}로 늦춰졌어요. 그 시간에 맞춰 오시면 돼요.', time: '방금', target: 'BookingDone' },
  noti_booking: { icon: 'check', title: '예약이 확정됐어요', body: '{style} · 오늘 {time} · {salon}\n예상 소요 시간 약 {duration}분 ({end}쯤 끝나요)', time: '방금', target: 'BookingDone' },
  noti_flash: { icon: 'flash', title: '반짝 특가 · 1시간 안에 바로', body: '근처 미용실 3곳이 지금 빈 시간을 최대 30% 할인해요. 쿠폰 받고 바로 예약해 보세요.', time: '25분 전', link: '특가 보러 가기 ›', target: 'MatchHome' },
  noti_review: { icon: 'star', title: '리뷰를 남겨주세요', body: '지난주 다운펌 시술은 어떠셨나요? 리뷰는 다른 손님의 미용사 선택에 도움이 돼요.', time: '3일 전', target: 'Review' }
};
export const PORTFOLIO = [
  { id: 'portfolio_1', image: 'portfolio_1_asperm.jpg', style: '애즈펌', category: '펌', filter: 'perm' },
  { id: 'portfolio_2', image: 'portfolio_2_dandy.jpg', style: '댄디컷', category: '커트', filter: 'cut' },
  { id: 'portfolio_3', image: 'portfolio_3_twoblock.jpg', style: '투블럭', category: '커트', filter: 'cut' },
  { id: 'portfolio_4', image: 'portfolio_4_hippie.jpg', style: '히피펌', category: '펌', filter: 'perm' },
  { id: 'portfolio_5', image: 'portfolio_5_layered.jpg', style: '레이어드컷', category: '커트', filter: 'cut' },
  { id: 'portfolio_6', image: 'portfolio_6_brown.jpg', style: '브라운 염색', category: '염색', filter: 'color' }
];
// Mock data migrated verbatim from the Qt prototype.
export const SCREEN_TITLES = {
  "Onboarding": "00 처음 오셨나요",
  "SignUpRole": "00a 가입 유형",
  "SignUpUser": "00b 이용자 가입",
  "SignUpDesigner": "00c 디자이너 가입",
  "Main": "01 홈",
  "Scan": "02 AI 진단 촬영",
  "ScanConsent": "02b 촬영 전 개인정보 동의",
  "ScanInfo": "02c 추가 진단",
  "Result": "03 진단 결과",
  "MatchHome": "04 매칭",
  "MatchSetup": "05 매칭 설정",
  "MapPicker": "05b 지도에서 위치 선택",
  "Match": "06 실시간 매칭",
  "Payment": "07 예약 · 결제",
  "PaymentMethod": "07b 결제 수단 선택",
  "BookingDone": "08 예약 완료",
  "Notifications": "08b 알림",
  "Review": "09 리뷰 작성",
  "Care": "10 케어컷 신청",
  "CareSupport": "11 이용료 지원 · 친화미용실",
  "Call": "12 미용사 콜 수신",
  "ProSchedule": "12b 오늘 예약",
  "Profile": "13 미용사 프로필",
  "DesignerList": "14 디자이너 찾기·랭킹",
  "SharedSalon": "15 공유 미용실",
  "Community": "16 커뮤니티·소비자",
  "CommunityPro": "17 커뮤니티·미용사",
  "Store": "18 스토어",
  "Cart": "18b 장바구니",
  "StyleVideo": "19 스타일링 영상",
  "MyPage": "20 내 정보"
};
export const SCREEN_IDS = [
  "Onboarding",
  "SignUpRole",
  "SignUpUser",
  "SignUpDesigner",
  "Main",
  "Scan",
  "ScanConsent",
  "ScanInfo",
  "Result",
  "MatchHome",
  "MatchSetup",
  "MapPicker",
  "Match",
  "Payment",
  "PaymentMethod",
  "BookingDone",
  "Notifications",
  "Review",
  "Care",
  "CareSupport",
  "Call",
  "ProSchedule",
  "Profile",
  "DesignerList",
  "SharedSalon",
  "Community",
  "CommunityPro",
  "Store",
  "Cart",
  "StyleVideo",
  "MyPage"
];
export const FILENAMES = {
  "Onboarding": "00_Onboarding.png",
  "SignUpRole": "00a_SignUpRole.png",
  "SignUpUser": "00b_SignUpUser.png",
  "SignUpDesigner": "00c_SignUpDesigner.png",
  "Main": "01_Main.png",
  "Scan": "02_Scan.png",
  "ScanConsent": "02b_ScanConsent.png",
  "ScanInfo": "02c_ScanInfo.png",
  "Result": "03_Result.png",
  "MatchHome": "04_MatchHome.png",
  "MatchSetup": "05_MatchSetup.png",
  "MapPicker": "05b_MapPicker.png",
  "Match": "06_Match.png",
  "Payment": "07_Payment.png",
  "PaymentMethod": "07b_PaymentMethod.png",
  "BookingDone": "08_BookingDone.png",
  "Notifications": "08b_Notifications.png",
  "Review": "09_Review.png",
  "Care": "10_Care.png",
  "CareSupport": "11_CareSupport.png",
  "Call": "12_Call.png",
  "ProSchedule": "12b_ProSchedule.png",
  "Profile": "13_Profile.png",
  "DesignerList": "14_DesignerList.png",
  "SharedSalon": "15_SharedSalon.png",
  "Community": "16_Community.png",
  "CommunityPro": "17_CommunityPro.png",
  "Store": "18_Store.png",
  "Cart": "18b_Cart.png",
  "StyleVideo": "19_StyleVideo.png",
  "MyPage": "20_MyPage.png"
};
export const DESIGNERS = [
  {
    "name": "한지우",
    "avatar": "지우",
    "salon": "정릉헤어",
    "area": "정릉동",
    "distance": "도보 8분",
    "price": 48000,
    "time": "15:30",
    "rating": "4.9",
    "reviews": 212,
    "tags": [
      "샴푸 시원함 1위",
      "케어컷 인증"
    ]
  },
  {
    "name": "박도윤",
    "avatar": "도윤",
    "salon": "북악살롱",
    "area": "성북동",
    "distance": "버스 12분",
    "price": 50000,
    "time": "16:00",
    "rating": "4.8",
    "reviews": 342,
    "tags": [
      "애즈펌 2위"
    ]
  },
  {
    "name": "최유나",
    "avatar": "유나",
    "salon": "숲길미용실",
    "area": "정릉동",
    "distance": "도보 15분",
    "price": 45000,
    "time": "17:00",
    "rating": "4.7",
    "reviews": 56,
    "tags": [
      "신입 급상승"
    ]
  },
  {
    "name": "이서준",
    "avatar": "서준",
    "salon": "정릉헤어",
    "area": "정릉동",
    "distance": "도보 8분",
    "price": 18000,
    "time": "15:30",
    "rating": "4.6",
    "reviews": 98,
    "tags": [
      "남자 커트"
    ]
  },
  {
    "name": "강민지",
    "avatar": "민지",
    "salon": "북악살롱",
    "area": "성북동",
    "distance": "버스 12분",
    "price": 48000,
    "time": "16:00",
    "rating": "4.6",
    "reviews": 77,
    "tags": [
      "염색"
    ]
  },
  {
    "name": "서하린",
    "avatar": "하린",
    "salon": "숲길미용실",
    "area": "정릉동",
    "distance": "도보 15분",
    "price": 45000,
    "time": "17:00",
    "rating": "4.8",
    "reviews": 23,
    "tags": [
      "신입 부스팅"
    ]
  }
];
export const MATCH_LIVE = [
  [
    "가르마펌 · 성북동",
    "응답 2명 · 1분 전",
    "매칭 중"
  ],
  [
    "남자 커트 · 정릉동",
    "응답 4명 · 3분 전",
    "매칭 중"
  ],
  [
    "뿌리염색 · 길음동",
    "응답 1명 · 5분 전",
    "매칭 중"
  ],
  [
    "케어컷(출장) · 정릉동",
    "케어 인증 미용사 응답 1명",
    "매칭 중"
  ]
];
export const MATCH_HISTORY = [
  [
    "다운펌 · 성북동",
    "43,000원 · 한지우",
    "예약 확정"
  ],
  [
    "애즈펌 · 정릉동",
    "50,000원 · 박도윤",
    "시술 완료"
  ],
  [
    "남자 커트 · 길음동",
    "18,000원 · 최유나",
    "시술 완료"
  ]
];
export const SALONS = [
  [
    "댕기머리미용실",
    "북아현동"
  ],
  [
    "히로헤어살롱",
    "연희동"
  ],
  [
    "준헤어샵",
    "홍제3동"
  ],
  [
    "모아르헤어",
    "홍은2동"
  ],
  [
    "예드니헤어샵",
    "남가좌2동"
  ],
  [
    "선희헤어샵",
    "북가좌2동"
  ],
  [
    "샤론미용실",
    "북가좌2동"
  ]
];
export const PAYMENT_METHODS = {
  "kakao": {
    "name": "카카오페이",
    "sub": "카카오톡으로 간편하게 결제",
    "color": "#FFEB00",
    "ink": "#191919",
    "badge": "pay",
    "size": 14,
    "tab": "easy"
  },
  "naver": {
    "name": "네이버페이",
    "sub": "네이버페이 포인트 적립",
    "color": "#03C75A",
    "ink": "#FFFFFF",
    "badge": "N pay",
    "size": 12,
    "tab": "easy"
  },
  "toss": {
    "name": "토스페이",
    "sub": "토스 앱에서 바로 결제",
    "color": "#0064FF",
    "ink": "#FFFFFF",
    "badge": "toss",
    "size": 13,
    "tab": "easy"
  },
  "payco": {
    "name": "페이코",
    "sub": "PAYCO 포인트로 결제",
    "color": "#FA2828",
    "ink": "#FFFFFF",
    "badge": "PAYCO",
    "size": 9,
    "tab": "easy"
  },
  "samsung": {
    "name": "삼성페이",
    "sub": "갤럭시 휴대폰을 대고 결제",
    "color": "#1428A0",
    "ink": "#FFFFFF",
    "badge": "S Pay",
    "size": 11,
    "tab": "easy"
  },
  "apple": {
    "name": "애플페이",
    "sub": "아이폰 · 애플워치로 결제",
    "color": "#000000",
    "ink": "#FFFFFF",
    "badge": "Pay",
    "size": 13,
    "tab": "easy"
  },
  "card": {
    "name": "신용·체크카드",
    "sub": "카드사를 고른 뒤 결제",
    "color": "#E9EEFD",
    "ink": "#1A36A8",
    "badge": "카드",
    "size": 12,
    "tab": "card"
  },
  "bank": {
    "name": "계좌이체",
    "sub": "실시간 계좌이체",
    "color": "#F1F3F6",
    "ink": "#4A505C",
    "badge": "계좌",
    "size": 12,
    "tab": "other"
  },
  "phone": {
    "name": "휴대폰 결제",
    "sub": "통신사 소액결제",
    "color": "#F1F3F6",
    "ink": "#4A505C",
    "badge": "휴대폰",
    "size": 10,
    "tab": "other"
  },
  "voucher": {
    "name": "복지·바우처 카드",
    "sub": "장애인 바우처 · 지자체 이용권",
    "color": "#E9EEFD",
    "ink": "#1A36A8",
    "badge": "바우처",
    "size": 10,
    "tab": "other"
  }
};
export const CARD_COMPANIES = {
  "shinhan": "신한",
  "samsung": "삼성",
  "hyundai": "현대",
  "kb": "KB국민",
  "lotte": "롯데",
  "hana": "하나",
  "woori": "우리",
  "bc": "BC",
  "nh": "NH농협"
};
export const NEIGHBORHOODS = [
  {
    "name": "정릉동",
    "address": "서울 성북구 정릉동 일대",
    "lat": 37.6063,
    "lng": 127.0095
  },
  {
    "name": "성북동",
    "address": "서울 성북구 성북동 일대",
    "lat": 37.5947,
    "lng": 126.9961
  },
  {
    "name": "길음동",
    "address": "서울 성북구 길음동 일대",
    "lat": 37.604,
    "lng": 127.025
  },
  {
    "name": "홍제동",
    "address": "서울 서대문구 홍제동 일대",
    "lat": 37.5884,
    "lng": 126.9442
  },
  {
    "name": "연희동",
    "address": "서울 서대문구 연희동 일대",
    "lat": 37.5734,
    "lng": 126.935
  }
];
export const MAP_SALONS = [
  {
    "name": "정릉헤어",
    "lat": 37.6068,
    "lng": 127.01,
    "designers": 3
  },
  {
    "name": "북악살롱",
    "lat": 37.595,
    "lng": 126.999,
    "designers": 3
  },
  {
    "name": "숲길미용실",
    "lat": 37.608,
    "lng": 127.006,
    "designers": 2
  },
  {
    "name": "픽컷 공유살롱 정릉점",
    "lat": 37.611,
    "lng": 127.012,
    "designers": 4
  },
  {
    "name": "길음살롱",
    "lat": 37.605,
    "lng": 127.025,
    "designers": 3
  },
  {
    "name": "성북헤어",
    "lat": 37.596,
    "lng": 127.003,
    "designers": 2
  },
  {
    "name": "정원미용실",
    "lat": 37.6,
    "lng": 127.018,
    "designers": 2
  },
  {
    "name": "봄헤어",
    "lat": 37.615,
    "lng": 127.02,
    "designers": 3
  },
  {
    "name": "바람살롱",
    "lat": 37.612,
    "lng": 126.999,
    "designers": 2
  },
  {
    "name": "달빛헤어",
    "lat": 37.598,
    "lng": 127.015,
    "designers": 2
  },
  {
    "name": "나무미용실",
    "lat": 37.618,
    "lng": 127.004,
    "designers": 3
  },
  {
    "name": "길음숲헤어",
    "lat": 37.61,
    "lng": 127.03,
    "designers": 2
  }
];
export const PRODUCTS = [
  {
    "key": "product_1",
    "brand": "자브",
    "name": "pH 밸런스 약산성 샴푸 1L",
    "category": "샴푸",
    "price": 12900,
    "image": "product_1_shampoo.png",
    "tag": ""
  },
  {
    "key": "product_2",
    "brand": "아브카",
    "name": "두피케어 티트리 헤어토닉 200ml",
    "category": "두피 케어",
    "price": 7900,
    "image": "product_2_tonic.png",
    "tag": ""
  },
  {
    "key": "product_3",
    "brand": "다슈",
    "name": "데일리 내추럴 컬 크림 150ml",
    "category": "스타일링",
    "price": 14500,
    "image": "product_3_curl_cream.png",
    "tag": ""
  },
  {
    "key": "product_4",
    "brand": "다슈",
    "name": "포맨 슈퍼 매트 왁스 100ml",
    "category": "스타일링",
    "price": 15000,
    "image": "product_4_wax.png",
    "tag": ""
  },
  {
    "key": "product_5",
    "brand": "JMW",
    "name": "에어비 BLDC 드라이기",
    "category": "도구",
    "price": 89000,
    "image": "product_5_dryer.png",
    "tag": "케어컷 추천"
  },
  {
    "key": "product_6",
    "brand": "미쟝센",
    "name": "퍼펙트 오리지널 세럼 80ml",
    "category": "스타일링",
    "price": 9900,
    "image": "product_6_serum.png",
    "tag": ""
  }
];
export const VIDEOS = [
  {
    "title": "애즈펌 아침 5분 드라이",
    "designer": "한지우",
    "duration": "3:12",
    "image": "video_1_asperm_dry.jpg"
  },
  {
    "title": "가르마펌 볼륨 살리기",
    "designer": "박도윤",
    "duration": "4:05",
    "image": "video_2_parting_volume.jpg"
  },
  {
    "title": "고데기 없이 C컬 만들기",
    "designer": "최유나",
    "duration": "2:48",
    "image": "video_3_c_curl.jpg"
  }
];
export const CONSUMER_POSTS = [
  {
    "category": "헤어톡",
    "tag": "스타일 고민",
    "title": "애즈펌 했다가 망할까 봐 무서워요",
    "body": "AI 진단은 ‘가능’ 나왔는데 옆머리가 뜨는 편이라 해보신 분 후기 궁금해요",
    "meta": "정릉동 · 2시간 전 · 조회 97",
    "likes": 3,
    "comments": 6,
    "topics": [
      "펌"
    ]
  },
  {
    "category": "시술 후기",
    "tag": "케어컷",
    "title": "소리 예민한 아이, 처음으로 끝까지 잘랐어요",
    "body": "케어컷으로 신청했더니 드라이기를 약하게 써 주셨어요",
    "meta": "성북동 · 4시간 전 · 조회 203",
    "likes": 18,
    "comments": 6,
    "topics": [
      "케어컷"
    ],
    "photo": "[사진]"
  },
  {
    "category": "Q&A",
    "tag": "",
    "title": "펌 하고 3주 됐는데 염색해도 될까요?",
    "body": "모발 상태 진단에서 ‘주의’가 떴어요. 언제쯤 괜찮을까요",
    "meta": "길음동 · 1시간 전 · 조회 61",
    "likes": 0,
    "comments": 4,
    "topics": [
      "펌",
      "염색"
    ],
    "answer": "인증 미용사 답변 2개"
  },
  {
    "category": "이벤트",
    "tag": "",
    "title": "이번 주 샴푸 시원함 1위는 누구?",
    "body": "",
    "meta": "",
    "likes": 0,
    "comments": 0,
    "topics": [
      "두피"
    ]
  },
  {
    "category": "건의함",
    "tag": "건의",
    "status": "검토 중",
    "title": "케어컷 매장이 우리 동네에도 생겼으면 해요",
    "body": "",
    "meta": "은평구 · 1일 전 · 공감 24 · 댓글 5",
    "likes": 24,
    "comments": 5,
    "topics": [
      "케어컷"
    ]
  },
  {
    "category": "건의함",
    "tag": "불편",
    "status": "답변 완료",
    "title": "취소 제한 기준이 어떻게 되나요?",
    "body": "",
    "meta": "정릉동 · 3시간 전",
    "likes": 0,
    "comments": 0,
    "topics": []
  }
];
export const PRO_POSTS = [
  {
    "category": "케어 교육",
    "tag": "케어 인증",
    "title": "발달장애 고객, 드라이기 소리 줄이는 법",
    "body": "타월 드라이를 먼저 하고 저풍으로… 복지관 실습에서 배운 팁 공유해요",
    "meta": "한지우 디자이너 · 3시간 전 · 조회 412",
    "likes": 31,
    "comments": 12,
    "topics": [
      "케어컷"
    ]
  },
  {
    "category": "모델 구인",
    "tag": "",
    "title": "애즈펌 모델 2명 구해요 (재료비만 받아요)",
    "body": "신입 디자이너예요. 포트폴리오용으로 정성껏 해드려요",
    "meta": "정릉동 · 2시간 전 · 조회 158",
    "likes": 9,
    "comments": 0,
    "topics": [
      "펌"
    ],
    "photo": "[시술 사진]"
  },
  {
    "category": "질문",
    "tag": "",
    "title": "6주 전 펌 고객, 약산성 처방 어떻게 하세요?",
    "body": "진단 요약에 ‘모발 상태 주의’ 뜬 콜을 받았는데 선배님들 노하우 부탁드려요",
    "meta": "길음동 · 1시간 전 · 조회 88",
    "likes": 7,
    "comments": 0,
    "topics": [
      "펌"
    ]
  },
  {
    "category": "장터",
    "tag": "",
    "title": "샴푸대 의자 저렴하게 넘겨요",
    "body": "",
    "meta": "",
    "likes": 0,
    "comments": 0,
    "topics": [
      "매장 운영"
    ]
  },
  {
    "category": "건의함",
    "tag": "건의",
    "status": "답변 완료",
    "title": "콜 거절해도 랭킹 불이익 없나요?",
    "body": "",
    "meta": "",
    "likes": 0,
    "comments": 0,
    "topics": [
      "매장 운영"
    ]
  }
];

/**
 * seed.js — generates backend/data/winners.json with 7 winners.
 *
 * Code format: BIG-[3 UPPERCASE LETTERS]-[4 DIGITS]
 * All 7 codes are guaranteed unique. Run with: node scripts/seed.js
 */

const fs = require('fs');
const path = require('path');

// Output path: backend/data/winners.json (relative to project root)
const OUTPUT_PATH = path.join(__dirname, '..', 'backend', 'data', 'winners.json');

// Letters pool — exclude combinations that could form offensive words.
// We use a clean uppercase A-Z pool and a denylist of 3-letter combos to skip.
const LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
const DENYLIST = new Set([
  'ASS', 'FUK', 'FUC', 'FCK', 'SHT', 'SXX', 'XXX', 'NIG', 'CNT',
  'DIK', 'DCK', 'CUM', 'JIZ', 'TIT', 'GAY', 'FAG', 'HOE', 'PIS',
]);

const randInt = (max) => Math.floor(Math.random() * max);

const generateLetters = () => {
  // Try until we get a non-denylisted combo.
  for (let attempt = 0; attempt < 50; attempt++) {
    const combo =
      LETTERS[randInt(26)] + LETTERS[randInt(26)] + LETTERS[randInt(26)];
    if (!DENYLIST.has(combo)) return combo;
  }
  // Deterministic safe fallback.
  return 'WNR';
};

const generateDigits = () => {
  // 4 digits, zero-padded.
  return String(randInt(10000)).padStart(4, '0');
};

const generateCode = () => `BIG-${generateLetters()}-${generateDigits()}`;

const generateUniqueCodes = (count) => {
  const codes = new Set();
  while (codes.size < count) {
    codes.add(generateCode());
  }
  return Array.from(codes);
};

// Cairo-formatted Arabic timestamp (matches backend helper).
const formatCairo = (date) =>
  date.toLocaleString('ar-EG', {
    timeZone: 'Africa/Cairo',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

// Pre-set redemption timestamps for winners #4 and #6.
const redeemed4Date = new Date('2025-03-15T13:42:00Z');
const redeemed6Date = new Date('2025-04-02T17:18:00Z');

const codes = generateUniqueCodes(7);

const winners = [
  {
    id: 'W001',
    name_ar: 'أحمد محمد علي',
    public_name_ar: 'أحمد م.',
    phone: '01012345671',
    code: codes[0],
    prize_type: 'free_meal',
    prize_label_ar: 'وجبة مجانية',
    prize_detail_ar: 'شاورما بيج سبيشال',
    terms_ar: 'صالحة لمرة واحدة داخل الفرع فقط، ولا تشمل المشروبات أو الإضافات.',
    min_order: null,
    max_order: null,
    delivery_zone: null,
    branch: 'sharbeen',
    branch_label_ar: 'فرع شربين',
    rank: 1,
    rank_label_ar: 'الفائز الأول',
    expiry_date: '2025-09-01',
    status: 'active',
    redeemed_at: null,
    redeemed_at_iso: null,
    redeemed_by_team: null,
    redeemed_by_team_ar: null,
  },
  {
    id: 'W002',
    name_ar: 'منى إبراهيم حسن',
    public_name_ar: 'منى إ.',
    phone: '01112345672',
    code: codes[1],
    prize_type: 'free_meal',
    prize_label_ar: 'وجبة مجانية',
    prize_detail_ar: 'وجبة فاميلي كبيرة',
    terms_ar: 'صالحة لمرة واحدة داخل الفرع، تكفي حتى ٤ أشخاص.',
    min_order: null,
    max_order: null,
    delivery_zone: null,
    branch: 'belqas',
    branch_label_ar: 'فرع بلقاس',
    rank: 2,
    rank_label_ar: 'الفائز الثاني',
    expiry_date: '2025-09-01',
    status: 'active',
    redeemed_at: null,
    redeemed_at_iso: null,
    redeemed_by_team: null,
    redeemed_by_team_ar: null,
  },
  {
    id: 'W003',
    name_ar: 'خالد عبد الرحمن',
    public_name_ar: 'خالد ع.',
    phone: '01212345673',
    code: codes[2],
    prize_type: 'discount',
    prize_label_ar: 'خصم على الطلب',
    prize_detail_ar: 'خصم ٣٠٪ على أي طلب',
    terms_ar: 'صالح لمرة واحدة، لا يُجمع مع أي عرض آخر.',
    min_order: 100,
    max_order: 500,
    delivery_zone: null,
    branch: 'sharbeen',
    branch_label_ar: 'فرع شربين',
    rank: 3,
    rank_label_ar: 'الفائز الثالث',
    expiry_date: '2025-09-01',
    status: 'active',
    redeemed_at: null,
    redeemed_at_iso: null,
    redeemed_by_team: null,
    redeemed_by_team_ar: null,
  },
  {
    id: 'W004',
    name_ar: 'سارة يوسف محمود',
    public_name_ar: 'سارة ي.',
    phone: '01512345674',
    code: codes[3],
    prize_type: 'discount',
    prize_label_ar: 'خصم على الطلب',
    prize_detail_ar: 'خصم ٢٠٪ على أي طلب',
    terms_ar: 'صالح لمرة واحدة، لا يُجمع مع أي عرض آخر.',
    min_order: 80,
    max_order: 400,
    delivery_zone: null,
    branch: 'belqas',
    branch_label_ar: 'فرع بلقاس',
    rank: 4,
    rank_label_ar: 'الفائز الرابع',
    expiry_date: '2025-09-01',
    status: 'redeemed',
    redeemed_at: formatCairo(redeemed4Date),
    redeemed_at_iso: redeemed4Date.toISOString(),
    redeemed_by_team: 'whatsapp',
    redeemed_by_team_ar: 'خدمة عملاء واتساب',
  },
  {
    id: 'W005',
    name_ar: 'عمر حسين السيد',
    public_name_ar: 'عمر ح.',
    phone: '01023456785',
    code: codes[4],
    prize_type: 'discount',
    prize_label_ar: 'خصم على الطلب',
    prize_detail_ar: 'خصم ٢٥٪ على أي طلب',
    terms_ar: 'صالح لمرة واحدة، لا يُجمع مع أي عرض آخر.',
    min_order: 90,
    max_order: 450,
    delivery_zone: null,
    branch: 'sharbeen',
    branch_label_ar: 'فرع شربين',
    rank: 5,
    rank_label_ar: 'الفائز الخامس',
    expiry_date: '2025-09-01',
    status: 'active',
    redeemed_at: null,
    redeemed_at_iso: null,
    redeemed_by_team: null,
    redeemed_by_team_ar: null,
  },
  {
    id: 'W006',
    name_ar: 'نورهان علي أحمد',
    public_name_ar: 'نورهان ع.',
    phone: '01134567896',
    code: codes[5],
    prize_type: 'free_delivery',
    prize_label_ar: 'توصيل مجاني',
    prize_detail_ar: 'توصيل مجاني لأي طلب',
    terms_ar: 'صالح لمرة واحدة داخل نطاق التوصيل المحدد.',
    min_order: 60,
    max_order: 300,
    delivery_zone: 'بلقاس - المركز',
    branch: 'belqas',
    branch_label_ar: 'فرع بلقاس',
    rank: 6,
    rank_label_ar: 'الفائز السادس',
    expiry_date: '2025-09-01',
    status: 'redeemed',
    redeemed_at: formatCairo(redeemed6Date),
    redeemed_at_iso: redeemed6Date.toISOString(),
    redeemed_by_team: 'hall',
    redeemed_by_team_ar: 'استقبال الصالة',
  },
  {
    id: 'W007',
    name_ar: 'محمد طارق فاروق',
    public_name_ar: 'محمد ط.',
    phone: '01298765430',
    code: codes[6],
    prize_type: 'free_delivery',
    prize_label_ar: 'توصيل مجاني',
    prize_detail_ar: 'توصيل مجاني لأي طلب',
    terms_ar: 'صالح لمرة واحدة داخل نطاق التوصيل المحدد.',
    min_order: 60,
    max_order: 300,
    delivery_zone: 'شربين - المركز',
    branch: 'sharbeen',
    branch_label_ar: 'فرع شربين',
    rank: 7,
    rank_label_ar: 'الفائز السابع',
    // Past expiry date so status is "expired".
    expiry_date: '2025-02-15',
    status: 'expired',
    redeemed_at: null,
    redeemed_at_iso: null,
    redeemed_by_team: null,
    redeemed_by_team_ar: null,
  },
];

const data = {
  contest: {
    name_ar: 'خليك مع الكبير / انت الاهم',
    name_en: 'Stay With The Big — You Matter',
    start_date: '2025-01-01',
    end_date: '2025-09-01',
    active: true,
  },
  teams: {
    admin: {
      name_ar: 'المدير',
      password: 'BIG_ADMIN_2025',
    },
    whatsapp: {
      name_ar: 'خدمة عملاء واتساب',
      password: 'BIG_WA_2025',
    },
    phone: {
      name_ar: 'خدمة عملاء هاتف',
      password: 'BIG_PH_2025',
    },
    hall: {
      name_ar: 'استقبال الصالة',
      password: 'BIG_HL_2025',
    },
    takeaway: {
      name_ar: 'تيك أواي',
      password: 'BIG_TK_2025',
    },
  },
  winners,
};

// Ensure target directory exists, then write the JSON file.
fs.mkdirSync(path.dirname(OUTPUT_PATH), { recursive: true });
fs.writeFileSync(OUTPUT_PATH, JSON.stringify(data, null, 2), 'utf8');

console.log('✅ Seeded winners.json');
console.log(`   Path: ${OUTPUT_PATH}`);
console.log('   Generated codes:');
winners.forEach((w) => {
  console.log(`     ${w.id}  ${w.code}  [${w.status}]  ${w.name_ar}`);
});

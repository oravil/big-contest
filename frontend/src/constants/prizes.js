/**
 * prizes.js — single source of truth for the prize catalog.
 *
 * Every UI surface (public cards, podium, staff redemption, admin form,
 * popup) reads its labels, colors, icons, conditions, and default copy
 * from this file. Keep all class strings as static literals so that
 * Tailwind's content scanner picks them up.
 */

import {
  IconGrandPrize,
  IconFreeMeal,
  IconDiscount,
  IconFreeDelivery,
} from '../components/PrizeIcon';

// ---------- Prize definitions ----------

export const PRIZES = {
  grand_prize: {
    type: 'grand_prize',
    label_ar: 'الجائزة الكبرى',
    short_label_ar: 'الجائزة الكبرى',
    badge_ar: '👑 الجائزة الكبرى',
    default_detail_ar: 'صينية أنا وانت',
    Icon: IconGrandPrize,
    emoji: '👑',

    // Tailwind class strings (static literals).
    icon_bg: 'bg-gradient-to-br from-amber-300 to-amber-600',
    icon_text: 'text-brand-black',
    accent_gradient: 'from-amber-400/80 via-amber-300/40 to-amber-500/0',
    card_gradient: 'from-amber-500/[0.08] via-amber-300/[0.04] to-transparent',
    border: 'border-amber-400/50',
    ring: 'ring-amber-400/40',
    glow: 'shadow-[0_0_40px_rgba(255,184,0,0.18)]',
    chip_bg: 'bg-amber-500/15',
    chip_text: 'text-amber-300',
    chip_border: 'border-amber-400/40',
    color_hex: '#FFB800',

    // Conditions
    min_order: null,
    max_order: null,
    requires_delivery_zone: false,
    excludes_delivery: false,

    default_terms_ar:
      'تُسلَّم الجائزة الكبرى بحضور الفائز شخصياً داخل الفرع مع إثبات الهوية.',

    // Display
    hide_rank: true,
    is_top_tier: true,
  },

  free_meal: {
    type: 'free_meal',
    label_ar: 'وجبة مجانية',
    short_label_ar: 'وجبة مجانية',
    badge_ar: '🍽️ وجبة مجانية',
    default_detail_ar: 'وجبة مجانية حتى 200 ج.م',
    Icon: IconFreeMeal,
    emoji: '🍽️',

    icon_bg: 'bg-gradient-to-br from-prize-meal to-red-700',
    icon_text: 'text-white',
    accent_gradient: 'from-prize-meal/80 via-red-500/40 to-prize-meal/0',
    card_gradient: 'from-prize-meal/[0.08] via-red-500/[0.03] to-transparent',
    border: 'border-prize-meal/40',
    ring: 'ring-prize-meal/30',
    glow: 'shadow-[0_0_24px_rgba(204,31,31,0.18)]',
    chip_bg: 'bg-prize-meal/15',
    chip_text: 'text-red-300',
    chip_border: 'border-prize-meal/40',
    color_hex: '#CC1F1F',

    min_order: null,
    max_order: 200,
    requires_delivery_zone: false,
    excludes_delivery: true,

    default_terms_ar:
      'صالحة لمرة واحدة. الحد الأقصى لقيمة الوجبة 200 جنيه، ولا تشمل التوصيل أو الإضافات الخارجية.',

    hide_rank: false,
    is_top_tier: false,
  },

  discount_30: {
    type: 'discount_30',
    label_ar: 'خصم 30٪',
    short_label_ar: 'خصم 30٪',
    badge_ar: '🏷️ خصم 30٪',
    default_detail_ar: 'خصم 30٪ على الطلب',
    Icon: IconDiscount,
    emoji: '🏷️',

    icon_bg: 'bg-gradient-to-br from-emerald-400 to-emerald-700',
    icon_text: 'text-white',
    accent_gradient: 'from-emerald-400/80 via-emerald-300/40 to-emerald-500/0',
    card_gradient:
      'from-emerald-500/[0.08] via-emerald-400/[0.03] to-transparent',
    border: 'border-emerald-400/40',
    ring: 'ring-emerald-400/30',
    glow: 'shadow-[0_0_24px_rgba(16,185,129,0.18)]',
    chip_bg: 'bg-emerald-500/15',
    chip_text: 'text-emerald-300',
    chip_border: 'border-emerald-400/40',
    color_hex: '#10B981',

    min_order: 200,
    max_order: null,
    requires_delivery_zone: false,
    excludes_delivery: true,

    default_terms_ar:
      'الحد الأدنى للطلب 200 جنيه. الخصم لا يشمل قيمة التوصيل، ولا يُجمع مع أي عرض آخر.',

    hide_rank: false,
    is_top_tier: false,
  },

  discount_20: {
    type: 'discount_20',
    label_ar: 'خصم 20٪',
    short_label_ar: 'خصم 20٪',
    badge_ar: '🏷️ خصم 20٪',
    default_detail_ar: 'خصم 20٪ على الطلب',
    Icon: IconDiscount,
    emoji: '🏷️',

    icon_bg: 'bg-gradient-to-br from-cyan-400 to-cyan-700',
    icon_text: 'text-white',
    accent_gradient: 'from-cyan-400/80 via-cyan-300/40 to-cyan-500/0',
    card_gradient: 'from-cyan-500/[0.08] via-cyan-400/[0.03] to-transparent',
    border: 'border-cyan-400/40',
    ring: 'ring-cyan-400/30',
    glow: 'shadow-[0_0_24px_rgba(6,182,212,0.18)]',
    chip_bg: 'bg-cyan-500/15',
    chip_text: 'text-cyan-300',
    chip_border: 'border-cyan-400/40',
    color_hex: '#06B6D4',

    min_order: 150,
    max_order: null,
    requires_delivery_zone: false,
    excludes_delivery: true,

    default_terms_ar:
      'الحد الأدنى للطلب 150 جنيه. الخصم لا يشمل قيمة التوصيل، ولا يُجمع مع أي عرض آخر.',

    hide_rank: false,
    is_top_tier: false,
  },

  discount_10: {
    type: 'discount_10',
    label_ar: 'خصم 10٪',
    short_label_ar: 'خصم 10٪',
    badge_ar: '🏷️ خصم 10٪',
    default_detail_ar: 'خصم 10٪ على الطلب',
    Icon: IconDiscount,
    emoji: '🏷️',

    icon_bg: 'bg-gradient-to-br from-indigo-400 to-indigo-700',
    icon_text: 'text-white',
    accent_gradient: 'from-indigo-400/80 via-indigo-300/40 to-indigo-500/0',
    card_gradient:
      'from-indigo-500/[0.08] via-indigo-400/[0.03] to-transparent',
    border: 'border-indigo-400/40',
    ring: 'ring-indigo-400/30',
    glow: 'shadow-[0_0_24px_rgba(99,102,241,0.18)]',
    chip_bg: 'bg-indigo-500/15',
    chip_text: 'text-indigo-300',
    chip_border: 'border-indigo-400/40',
    color_hex: '#6366F1',

    min_order: 100,
    max_order: null,
    requires_delivery_zone: false,
    excludes_delivery: true,

    default_terms_ar:
      'الحد الأدنى للطلب 100 جنيه. الخصم لا يشمل قيمة التوصيل، ولا يُجمع مع أي عرض آخر.',

    hide_rank: false,
    is_top_tier: false,
  },

  discount_coupon: {
    type: 'discount_coupon',
    label_ar: 'كوبون خصم',
    short_label_ar: 'كوبون خصم',
    badge_ar: '🎟️ كوبون خصم',
    default_detail_ar: '',
    Icon: IconDiscount,
    emoji: '🎟️',

    icon_bg: 'bg-gradient-to-br from-violet-400 to-violet-700',
    icon_text: 'text-white',
    accent_gradient: 'from-violet-400/80 via-violet-300/40 to-violet-500/0',
    card_gradient:
      'from-violet-500/[0.08] via-violet-400/[0.03] to-transparent',
    border: 'border-violet-400/40',
    ring: 'ring-violet-400/30',
    glow: 'shadow-[0_0_24px_rgba(139,92,246,0.18)]',
    chip_bg: 'bg-violet-500/15',
    chip_text: 'text-violet-300',
    chip_border: 'border-violet-400/40',
    color_hex: '#8B5CF6',

    min_order: null,
    max_order: null,
    requires_delivery_zone: false,
    excludes_delivery: true,

    default_terms_ar:
      'كوبون خصم صالح لمرة واحدة. لا يُجمع مع أي عرض آخر.',

    hide_rank: false,
    is_top_tier: false,
  },

  free_delivery: {
    type: 'free_delivery',
    label_ar: 'توصيل مجاني',
    short_label_ar: 'توصيل مجاني',
    badge_ar: '🛵 توصيل مجاني',
    default_detail_ar: 'توصيل مجاني داخل المدينة',
    Icon: IconFreeDelivery,
    emoji: '🛵',

    icon_bg: 'bg-gradient-to-br from-orange-400 to-orange-700',
    icon_text: 'text-white',
    accent_gradient: 'from-orange-400/80 via-orange-300/40 to-orange-500/0',
    card_gradient:
      'from-orange-500/[0.08] via-orange-400/[0.03] to-transparent',
    border: 'border-orange-400/40',
    ring: 'ring-orange-400/30',
    glow: 'shadow-[0_0_24px_rgba(255,107,0,0.18)]',
    chip_bg: 'bg-orange-500/15',
    chip_text: 'text-orange-300',
    chip_border: 'border-orange-400/40',
    color_hex: '#FF6B00',

    min_order: null,
    max_order: 30, // max delivery fee covered
    requires_delivery_zone: true,
    excludes_delivery: false,

    default_terms_ar:
      'صالح داخل نطاق المدينة فقط. تتحمل المسابقة رسوم التوصيل حتى 30 جنيهاً كحد أقصى.',

    hide_rank: false,
    is_top_tier: false,
  },
};

// Display order for catalogs / dropdowns.
export const PRIZE_ORDER = [
  'grand_prize',
  'free_meal',
  'discount_30',
  'discount_20',
  'discount_10',
  'discount_coupon',
  'free_delivery',
];

// Fallback for unknown / legacy prize types.
export const FALLBACK_PRIZE = {
  type: 'unknown',
  label_ar: 'جائزة',
  short_label_ar: 'جائزة',
  badge_ar: '🎁 جائزة',
  default_detail_ar: '',
  Icon: IconFreeMeal,
  emoji: '🎁',

  icon_bg: 'bg-brand-yellow',
  icon_text: 'text-brand-black',
  accent_gradient: 'from-brand-yellow/80 to-brand-yellow/0',
  card_gradient: 'from-brand-yellow/[0.08] via-brand-yellow/[0.03] to-transparent',
  border: 'border-brand-yellow/40',
  ring: 'ring-brand-yellow/30',
  glow: '',
  chip_bg: 'bg-brand-yellow/15',
  chip_text: 'text-brand-yellow',
  chip_border: 'border-brand-yellow/40',
  color_hex: '#FFB800',

  min_order: null,
  max_order: null,
  requires_delivery_zone: false,
  excludes_delivery: false,
  default_terms_ar: '',
  hide_rank: false,
  is_top_tier: false,
};

// ---------- Helpers ----------

export function getPrize(type) {
  return PRIZES[type] || FALLBACK_PRIZE;
}

/**
 * Returns the form-field defaults to apply when the admin picks a prize
 * type. Empty string is used for the delivery_zone of zone-required prizes
 * so the admin must explicitly enter one.
 */
export function getPrizeDefaults(type) {
  const p = PRIZES[type];
  if (!p) return null;
  return {
    prize_label_ar: p.label_ar,
    prize_detail_ar: p.default_detail_ar,
    terms_ar: p.default_terms_ar,
    min_order: p.min_order,
    max_order: p.max_order,
    delivery_zone: p.requires_delivery_zone ? '' : '',
  };
}

/**
 * Returns the human-readable conditions checklist for a winner — what staff
 * must verify before delivering the prize.
 *
 * Each item: { icon, label, value, kind: 'required' | 'info' }
 */
export function describeConditions(winner) {
  const prize = getPrize(winner?.prize_type);
  const items = [];

  // Min order
  const minOrder = winner?.min_order ?? prize.min_order;
  if (minOrder) {
    items.push({
      icon: '⬆️',
      label: 'الحد الأدنى للطلب',
      value: `${minOrder} ج.م`,
      hint: 'تحقّق أن إجمالي الطلب يُساوي أو يزيد عن هذا الرقم.',
      kind: 'required',
    });
  }

  // Max order / max value
  const maxOrder = winner?.max_order ?? prize.max_order;
  if (maxOrder) {
    const isDelivery = prize.type === 'free_delivery';
    items.push({
      icon: isDelivery ? '🛵' : '⬇️',
      label: isDelivery
        ? 'الحد الأقصى لرسوم التوصيل'
        : 'الحد الأقصى لقيمة الجائزة',
      value: `${maxOrder} ج.م`,
      hint: isDelivery
        ? 'إذا تجاوزت رسوم التوصيل هذا الرقم يدفع العميل الفرق.'
        : 'الفرق فوق هذا المبلغ يدفعه العميل.',
      kind: 'required',
    });
  }

  // Delivery zone
  if (prize.requires_delivery_zone) {
    const zone = winner?.delivery_zone || 'داخل المدينة';
    items.push({
      icon: '📍',
      label: 'نطاق التوصيل',
      value: zone,
      hint: 'لا يصلح خارج النطاق المحدد.',
      kind: 'required',
    });
  }

  // Delivery exclusion (info-only flag)
  if (prize.excludes_delivery) {
    items.push({
      icon: '🚫',
      label: 'لا يشمل قيمة التوصيل',
      value: 'يدفعها العميل',
      hint: 'الجائزة تخص قيمة الطلب فقط دون رسوم التوصيل.',
      kind: 'info',
    });
  }

  return items;
}

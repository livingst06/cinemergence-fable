export const KHEIRON_MEDIA = "/landing/kheiron";

export const KHEIRON_STAGE = "standup-kheiron-2026-11";

export const KHEIRON_START = "2026-11-28T09:00:00+01:00";

export const KHEIRON_PAYMENT_LINK = "https://buy.stripe.com/aFadR8fWP9H18Vr5Z2bwk09";

export const KHEIRON_WHATSAPP = "33769185594";

export function whatsAppLink(text: string) {
  return `https://wa.me/${KHEIRON_WHATSAPP}?text=${encodeURIComponent(text)}`;
}

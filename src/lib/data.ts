export interface Product {
  id: string;
  name: string;
  price: number;
  badge: string;
  collection: string;
  description: string;
}

export interface Collection {
  name: string;
  detail: string;
  tone: string;
  slug: string;
}

export const PRODUCTS: Product[] = [
  {
    id: "brass-diya-set",
    name: "Brass Diya Set",
    price: 149,
    badge: "Best Seller",
    collection: "Brass Collection",
    description:
      "A warm traditional diya set for pooja return gifts and festive gifting. Handcrafted in solid brass with intricate detailing.",
  },
  {
    id: "decorative-tin-box",
    name: "Decorative Tin Box",
    price: 99,
    badge: "New",
    collection: "Tin Boxes",
    description:
      "Reusable decorative tin packaging for sweets, dry fruits, and party favors. Available in multiple festive prints.",
  },
  {
    id: "german-silver-bowl",
    name: "German Silver Bowl",
    price: 199,
    badge: "Premium",
    collection: "German Silver",
    description:
      "A polished bowl option for elegant pooja and wedding gifting. German silver finish with traditional motifs.",
  },
  {
    id: "thambulam-gift-set",
    name: "Thambulam Gift Set",
    price: 249,
    badge: "Bulk Ready",
    collection: "Thambulam Sets",
    description:
      "A complete celebration gift set ready for guest distribution at weddings, poojas, and naming ceremonies.",
  },
  {
    id: "birthday-favor-box",
    name: "Birthday Favor Box",
    price: 129,
    badge: "Party Pick",
    collection: "Birthday Collection",
    description:
      "A cheerful birthday return gift box for kids and family parties. Customisable with event name and date.",
  },
  {
    id: "haldi-kumkum-set",
    name: "Haldi Kumkum Set",
    price: 179,
    badge: "Festive",
    collection: "Return Gifts",
    description:
      "A compact festive set designed for poojas, ceremonies, and house events. Includes premium haldi and kumkum holders.",
  },
];

export const COLLECTIONS: Collection[] = [
  { name: "Brass Collection", detail: "Traditional keepsakes", tone: "maroon", slug: "Brass Collection" },
  { name: "Birthday Collection", detail: "Joyful party favors", tone: "gold", slug: "Birthday Collection" },
  { name: "Return Gifts", detail: "Ready for every event", tone: "rose", slug: "Return Gifts" },
  { name: "Tin Boxes", detail: "Reusable festive packaging", tone: "sage", slug: "Tin Boxes" },
  { name: "German Silver", detail: "Elegant pooja gifting", tone: "silver", slug: "German Silver" },
  { name: "Thambulam Sets", detail: "Celebration essentials", tone: "cream", slug: "Thambulam Sets" },
];

export const WHATSAPP_NUMBER = "917799791820";
export const LEAD_EMAIL = "enterprisepragna@gmail.com";

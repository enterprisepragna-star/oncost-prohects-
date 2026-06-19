export const AUTH = {
  loginEmail: "login-email",
  loginPassword: "login-password",
  loginSubmit: "login-submit",
  logoutBtn: "logout-btn",
};

export const ADMIN = {
  navProducts: "nav-products",
  navPricing: "nav-pricing",
  navQuotations: "nav-quotations",
  navNewQuote: "nav-new-quote",
  productRow: (code) => `product-row-${code}`,
  productOverride: (code) => `product-override-${code}`,
  productSave: (code) => `product-save-${code}`,
  productVisibility: (code) => `product-vis-${code}`,
  ruleThreshold: "rule-threshold",
  ruleBelow: "rule-below",
  ruleAbove: "rule-above",
  ruleSave: "rule-save",
  newQuoteCustomer: "newq-customer",
  newQuotePlace: "newq-place",
  newQuoteNotes: "newq-notes",
  newQuoteAddItem: (code) => `newq-add-${code}`,
  newQuoteQty: (code) => `newq-qty-${code}`,
  newQuoteSubmit: "newq-submit",
  quoteRow: (id) => `quote-row-${id}`,
  quoteToggle: (id) => `quote-toggle-${id}`,
  quoteCopyLink: (id) => `quote-copylink-${id}`,
  quoteDownloadPdf: (id) => `quote-pdf-${id}`,
  quoteDelete: (id) => `quote-delete-${id}`,
};

export const PUBLIC = {
  quotationContainer: "public-quotation",
  catalogContainer: "public-catalog",
  downloadPdfBtn: "public-download-pdf",
  printBtn: "public-print",
};

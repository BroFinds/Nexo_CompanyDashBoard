export const formatMoney = (n) =>
  Number(n || 0).toLocaleString("en-IN", {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

export const formatSaleDate = (iso) => {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleDateString("en-IN", {
    year: "numeric",
    month: "short",
    day: "2-digit",
  });
};

export const paymentStatusVariant = (text) => {
  switch ((text || "").toUpperCase()) {
    case "PAID":
      return "success";
    case "PENDING":
    case "PARTIAL":
      return "warning";
    case "FAILED":
    case "CANCELLED":
      return "danger";
    default:
      return "neutral";
  }
};

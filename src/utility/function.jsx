//----------------------------------------------------------------------------------------
// Calculate Function
const FormatDate = (dateStr) => {
  return new Date(dateStr)
    .toLocaleString("th-TH", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    })
    .replace(/\u200E/g, "");
};
//----------------------------------------------------------------------------------------

//----------------------------------------------------------------------------------------
// Calculate Function
const FormatDateFull = (dateStr) => {
  return new Date(dateStr)
    .toLocaleString("th-TH", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
      hour12: false,
    })
    .replace(/\u200E/g, "");
};
//----------------------------------------------------------------------------------------

//----------------------------------------------------------------------------------------
// Calculate Function
const FormatNumber = (n, d = 2) =>
  isNaN(n)
    ? "-"
    : n.toLocaleString("en-US", {
        minimumFractionDigits: d,
        maximumFractionDigits: d,
      });
//----------------------------------------------------------------------------------------

//----------------------------------------------------------------------------------------
// Calculate Function
const FormatDateHyphen = (dateStr) => {
  if (!dateStr) return "-";
  const date = new Date(dateStr);
  if (isNaN(date)) return "-";

  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const yearBE = (date.getFullYear() + 543).toString().slice(-2); // last 2 digits of Buddhist year

  return `${day}-${month}-${yearBE}`;
};
//----------------------------------------------------------------------------------------

//----------------------------------------------------------------------------------------
// Calculate Remain Date of Ticket
const CalRemainDays = (endDate) => {
  const today = new Date();
  const expireDate = new Date(endDate);
  const diffTime = expireDate - today;
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};
//----------------------------------------------------------------------------------------

//----------------------------------------------------------------------------------------
// Calculate Function
const GoldTypeText = (type) => {
  if (type === 2) return "99.9%";
  if (type === 1) return "96.5%";
  return "-";
};
//----------------------------------------------------------------------------------------

//----------------------------------------------------------------------------------------
// Calculate Function
const CalFunctions = (item, prices) => {
  const adjustedWeight =
    item.gold_type === 1 ? item.weight : item.weight * 66.67;
  const avgLoan =
    (item.remain_loan_amount + item.sum_pay_interest) / adjustedWeight;
  const gainLoss =
    item.gold_type === 1
      ? prices.gold96_sell - avgLoan
      : prices.gold99_sell - avgLoan;
  return { avgLoan, gainLoss, adjustedWeight };
};
//----------------------------------------------------------------------------------------

export {
  FormatDate,
  FormatDateFull,
  FormatNumber,
  FormatDateHyphen,
  GoldTypeText,
  CalRemainDays,
  CalFunctions,
};

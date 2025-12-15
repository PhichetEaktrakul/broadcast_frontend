const apiMinMax = import.meta.env.VITE_MINMAX_PRICE;
const apiSignalR = import.meta.env.VITE_SIGNALR_URL;
const urlGHistory = import.meta.env.VITE_GOLD_HISTORY;
const urlSHistory = import.meta.env.VITE_SILVER_HISTORY;
const urlUSD = import.meta.env.VITE_TRADEVIEW_USD;
const urlXAU = import.meta.env.VITE_TRADEVIEW_XAU;

export const urlConfig = { apiMinMax, apiSignalR, urlGHistory, urlSHistory, urlUSD, urlXAU };

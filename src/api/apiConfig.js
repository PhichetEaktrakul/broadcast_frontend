const apiMinMax = import.meta.env.VITE_MINMAX_PRICE;
const apiSignalR = import.meta.env.VITE_SIGNALR_URL;
const urlHistory = import.meta.env.VITE_GOLD_HISTORY;
const urlUSD = import.meta.env.VITE_TRADEVIEW_USD;
const urlXAU = import.meta.env.VITE_TRADEVIEW_XAU;

export const urlConfig = { apiMinMax, apiSignalR, urlHistory, urlUSD, urlXAU };

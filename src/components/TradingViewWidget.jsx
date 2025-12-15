import { useEffect } from "react";

export default function TradingViewWidget({ id, symbol }) {
  useEffect(() => {
    const container = document.getElementById(id);
    if (!container) return;

    container.innerHTML =
      '<div class="tradingview-widget-container__widget"></div>';

    const script = document.createElement("script");
    script.src =
      "https://s3.tradingview.com/external-embedding/embed-widget-mini-symbol-overview.js";
    script.async = true;
    script.innerHTML = JSON.stringify({
      symbol,
      width: "100%",
      height: "100%",
      timezone: "Asia/Bangkok",
      locale: "en",
      dateRange: "1W",
      colorTheme: "light",
      isTransparent: false,
      autosize: true,
      largeChartUrl: "#",
    });
    container.appendChild(script);
  }, [id, symbol]);

  return (
    <>
      <div className="rounded-xl overflow-hidden border border-gray-300">
        <div className="tradingview-widget-container" id={id}></div>
      </div>
    </>
  );
}

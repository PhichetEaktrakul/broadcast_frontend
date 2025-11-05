import TradingViewWidget from "./TradingViewWidget";
import { urlConfig } from "../api/apiConfig";

export default function TradingViewCard() {
  return (
    <>
      <div className="wrapper flex">
        <div className="ads pr-[5px] relative">
          <TradingViewWidget id="widget-xauusd" symbol="OANDA:XAUUSD" />
          <a
            href={urlConfig.urlXAU}
            target="_self"
            className="absolute inset-0 z-10"
          />
        </div>
        <div className="ads pl-[5px] relative">
          <TradingViewWidget id="widget-usdthb" symbol="OANDA:USDTHB" />
          <a
            href={urlConfig.urlUSD}
            target="_self"
            className="absolute inset-0 z-10"
          />
        </div>
      </div>
    </>
  );
}

import TradingViewWidget from "./TradingViewWidget";

export default function TradingViewCard() {
  return (
    <>
      <div className="wrapper flex">
        <div className="ads pr-[5px]">
          <TradingViewWidget id="widget-xauusd" symbol="OANDA:XAUUSD" />
        </div>
        <div className="ads pl-[5px]">
          <TradingViewWidget id="widget-usdthb" symbol="OANDA:USDTHB" />
        </div>
      </div>
    </>
  );
}

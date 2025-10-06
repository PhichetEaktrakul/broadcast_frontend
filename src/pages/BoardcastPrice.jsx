import { useEffect, useState } from "react";
import { api } from "../api/axiosInstance";
import GoldPriceCard from "../components/GoldPriceCard";
import TradingViewWidget from "../components/TradingViewWidget";
import BuySellContainer from "../components/BuySellContainer";
import GoldIcon from "../assets/GoldIcon.png";

export default function BoardcastPrice() {
  const [prices, setPrices] = useState({
    gold99_buy: 0,
    gold99_sell: 0,
    old_gold99_buy: 0,
    old_gold99_sell: 0,
    gold96_buy: 0,
    gold96_sell: 0,
    old_gold96_buy: 0,
    old_gold96_sell: 0,
  });
  const [goldAssn, setGoldAssn] = useState(null);
  // const [goldHiLo, setGoldHiLo] = useState({ gold99: 0 });

  //----------------------------------------------------------------------------------------
  // Fetch Gold RT Price From SignalR
  useEffect(() => {
    api
      .get("/gold-gcap/latest")
      .then((res) => {
        if (res.data) {
          setPrices(res.data);
        }
      })
      .catch((err) => console.error("❌ Failed to fetch latest price:", err));

    const waitForJQuery = setInterval(() => {
      if (window.$ && window.$.connection?.priceHub) {
        clearInterval(waitForJQuery);

        const priceHub = window.$.connection.priceHub;
        const parsePrice = (val) => parseFloat(val?.replace(/,/g, "")) || 0;

        priceHub.client.sendGoldPrice = function (
          gold99_buy,
          gold99_sell,
          old_gold99_buy,
          old_gold99_sell,
          gold96_buy,
          gold96_sell,
          old_gold96_buy,
          old_gold96_sell
        ) {
          const newPrices = {
            gold99_buy: parsePrice(gold99_buy),
            gold99_sell: parsePrice(gold99_sell),
            old_gold99_buy: parsePrice(old_gold99_buy),
            old_gold99_sell: parsePrice(old_gold99_sell),
            gold96_buy: parsePrice(gold96_buy),
            gold96_sell: parsePrice(gold96_sell),
            old_gold96_buy: parsePrice(old_gold96_buy),
            old_gold96_sell: parsePrice(old_gold96_sell),
          };
          setPrices(newPrices);

          if (newPrices.gold99_buy > 0 && newPrices.gold96_buy > 0) {
            api
              .post("/gold-gcap", newPrices)
              /* .then(() => console.log("✅ Gold price saved:", newPrices)) */
              .catch((err) => console.error("❌ Failed to save:", err));
          }
        };

        /* window.$.connection.hub.url = "https://uatg266.gcaponline.com/signalr"; */
        window.$.connection.hub.url = "https://g266.gcaponline.com/signalr";
        window.$.connection.hub
          .start()
          .done(() => {
            console.log("Connected to SignalR");
            /* console.log("Connected to SignalR:", window.$.connection.hub.id); */
          })
          .fail(() => {
            console.error("Failed to connect to SignalR");
          });

        window.$.connection.hub.disconnected(() => {
          console.warn("SignalR disconnected. Reconnecting in 2s...");
          setTimeout(() => {
            window.$.connection.hub
              .start()
              .done(() => {
                console.log(
                  "Reconnected to SignalR:",
                  window.$.connection.hub.id
                );
              })
              .fail(() => {
                console.error("Reconnection attempt failed.");
              });
          }, 2000);
        });
      }
    }, 500);

    return () => clearInterval(waitForJQuery);
  }, []);
  //----------------------------------------------------------------------------------------

  //----------------------------------------------------------------------------------------
  // Fetch Gold Association Price Every 10 Minutes
  useEffect(() => {
    const fetchGoldGcap = async () => {
      try {
        const res = await api.get("/gold-assn/latest");
        setGoldAssn(res.data);
        /* console.log("Fetched gold price:", res.data); */
      } catch (err) {
        console.error("Error fetching gold price:", err);
      }
    };

    fetchGoldGcap();
    // Call every 10 minutes (600000 ms)
    const interval = setInterval(fetchGoldGcap, 600000);

    // Cleanup on unmount
    return () => clearInterval(interval);
  }, []);
  //----------------------------------------------------------------------------------------

  return (
    <div className="h-[100vh] bg-linear-150 from-[#0e2353fc] to-[#234085fc]">
      <div className="sm:max-w-lg md:max-w-[1024px] h-[100vh] m-auto p-5">
        <div className="text-center mb-4">
          <p className="text-2xl text-[#dabe96]">ราคาทองจีเเคป โกลด์</p>
          <p className="text-md text-white">{goldAssn?.updatedTime}</p>
        </div>

        <div className="grid sm:grid-row-5 sm:grid-cols-1 md:grid-rows-2 md:grid-cols-2 gap-4">
          {/*--------------------- Gold 99.99% ---------------------*/}
          <GoldPriceCard
            title="ทองคำ 99.99%"
            content={
              <>
                <BuySellContainer
                  label={"เสนอซื้อ"}
                  current={prices.gold99_buy}
                  previous={prices.old_gold99_buy}
                  highOrLow={"57,000"}
                  type={"High"}
                />
                <div className="divider divider-horizontal" />
                <BuySellContainer
                  label={"เสนอขาย"}
                  current={prices.gold99_sell}
                  previous={prices.old_gold99_sell}
                  highOrLow={"55,800"}
                  type={"Low"}
                />
              </>
            }
          />

          {/*--------------------- Gold 96.50% ---------------------*/}
          <GoldPriceCard
            title="ทองคำ 96.50%"
            content={
              <>
                <BuySellContainer
                  label={"เสนอซื้อ"}
                  current={prices.gold96_buy}
                  previous={prices.old_gold96_buy}
                  highOrLow={"55,250"}
                  type={"High"}
                />
                <div className="divider divider-horizontal" />
                <BuySellContainer
                  label={"เสนอขาย"}
                  current={prices.gold96_sell}
                  previous={prices.old_gold96_sell}
                  highOrLow={"54,020"}
                  type={"Low"}
                />
              </>
            }
          />

          {/*--------------------- ราคาสมาคม -----------------------*/}
          <GoldPriceCard
            title={
              <div className="flex items-center justify-center">
                <img className="w-[30px]" src={GoldIcon} />
                <span>ทองคำราคาสมาคม</span>
              </div>
            }
            content={
              <>
                <div className="card grid grow place-items-center mb-3">
                  <div className="text-md">เสนอซื้อ</div>
                  <div className="flex w-[100%] text-center justify-center items-center">
                    <span className="text-2xl font-bold">
                      {goldAssn?.sellPrice?.replace(".00", "")}
                    </span>
                  </div>
                </div>
                <div className="divider divider-horizontal mb-3" />
                <div className="card grid grow place-items-center mb-3">
                  <div className="text-md">เสนอขาย</div>
                  <div className="flex w-[100%] text-center justify-center items-center">
                    <span className="text-2xl font-bold">
                      {goldAssn?.buyPrice?.replace(".00", "")}
                    </span>
                  </div>
                </div>
              </>
            }
          />

          {/*--------------------- History Link --------------------*/}
          <div className="text-center md:order-5 md:col-span-2">
            <a
              href="https://www.gcap.co.th/goldprice/gcappricegold.php"
              className="text-white hover:text-yellow-400 text-lg"
              target="_blank"
              rel="noopener noreferrer">
              ราคาทองย้อนหลัง &#10093;
            </a>
          </div>

          {/*--------------------- Trading View --------------------*/}
          <div className="wrapper flex">
            <div className="ads pr-[5px]">
              <TradingViewWidget id="widget-xauusd" symbol="OANDA:XAUUSD" />
            </div>
            <div className="ads pl-[5px]">
              <TradingViewWidget id="widget-usdthb" symbol="OANDA:USDTHB" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

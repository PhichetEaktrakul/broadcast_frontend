import { useEffect, useState } from "react";
import { api } from "../api/axiosInstance";
import { urlConfig } from "../api/apiConfig";
import { FormatNumber } from "../utility/function";
import GoldPriceCard from "../components/GoldPriceCard";
import TradingViewCard from "../components/TradingViewCard";
import BuySellContainer from "../components/BuySellContainer";
import Header from "../components/Header";
import GoldIcon from "../assets/GoldIcon.png";

export default function BoardcastPrice() {
  const [goldGcap, setGoldGcap] = useState({
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
  const [silverPrice, setSilverPrice] = useState([]);
  const [updatedTime, setUpdatedTime] = useState("");
  const [minmax, setMinmax] = useState({
    gold99: { min: 0, max: 0 },
    gold96: { min: 0, max: 0 },
  });
  const [loading, setLoading] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  //----------------------------------------------------------------------------------------
  // Fetch Initial Price & Refresh Data Periodically
  useEffect(() => {
    const fetchData = async () => {
      try {
        const [gcapRes, assnRes, silverRes, minmaxRes] = await Promise.all([
          api.get("/api/gold-gcap/latest"),
          api.get("/api/gold-assn/latest"),
          api.get("/api/silver-price/latest"),
          api.get(urlConfig.apiMinMax),
        ]);
        if (gcapRes.data) setGoldGcap(gcapRes.data);
        if (assnRes.data) setGoldAssn(assnRes.data);
        if (silverRes.data?.data?.items?.[0]?.rows)
          setSilverPrice(silverRes.data.data.items[0].rows.reverse());
        if (Array.isArray(minmaxRes.data)) {
          const updated = {
            gold99: { min: 0, max: 0 },
            gold96: { min: 0, max: 0 },
          };

          minmaxRes.data.forEach((item) => {
            const min = item.MinPrice ?? 0;
            const max = item.MaxPrice ?? 0;

            if (item.assetGold === "1") {
              updated.gold99 = { min, max };
            } else if (item.assetGold === "2") {
              updated.gold96 = { min, max };
            }
          });

          setMinmax(updated);
        }
      } catch (err) {
        console.error("Failed to fetch initial data:", err);
      } finally {
        setFadeOut(true);
        setTimeout(() => setLoading(false), 700);
      }
    };

    const fetchGoldAssn = async () => {
      try {
        const res = await api.get("/api/gold-assn/latest");
        if (res.data) setGoldAssn(res.data);
      } catch (err) {
        console.error("Failed to refresh gold association price:", err);
      }
    };

    const fetchSilverPrice = async () => {
      try {
        const res = await api.get("/api/silver-price/latest");
        if (res.data?.data?.items?.[0]?.rows)
          setSilverPrice(res.data.data.items[0].rows.reverse());
      } catch (err) {
        console.error("Failed to refresh silver price:", err);
      }
    };

    fetchData();

    const goldInterval = setInterval(fetchGoldAssn, 600000); // Refresh every 10 minutes (Gold Assn)
    const silverInterval = setInterval(fetchSilverPrice, 300000); // Refresh every 5 minutes (Silver)
    return () => {
      clearInterval(goldInterval);
      clearInterval(silverInterval);
    };
  }, []);
  //----------------------------------------------------------------------------------------

  //----------------------------------------------------------------------------------------
  // Fetch Gold RT Price From SignalR
  useEffect(() => {
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
          setGoldGcap(newPrices);

          // Update time
          const now = new Date();
          const formatted = now.toLocaleDateString("th-TH", {
            day: "numeric",
            month: "long",
            year: "numeric",
          });
          const timeStr = now.toLocaleTimeString("th-TH", {
            hour: "2-digit",
            minute: "2-digit",
            hour12: false,
          });
          setUpdatedTime(`ประจำวันที่ ${formatted} เวลา ${timeStr} น.`);
        };

        // Connect to SignalR
        window.$.connection.hub.url = urlConfig.apiSignalR;
        window.$.connection.hub
          .start()
          .done(() => console.log("✅ Connected to SignalR"))
          .fail(() => console.error("❌ Failed to connect to SignalR"));

        // Reconnect if disconnected
        window.$.connection.hub.disconnected(() => {
          console.warn("⚠️ SignalR disconnected. Reconnecting in 2s...");
          setTimeout(() => {
            window.$.connection.hub
              .start()
              .done(() =>
                console.log("🔁 Reconnected:", window.$.connection.hub.id)
              )
              .fail(() => console.error("❌ Reconnection failed."));
          }, 2000);
        });
      }
    }, 500);

    return () => clearInterval(waitForJQuery);
  }, []);
  //----------------------------------------------------------------------------------------

  //----------------------------------------------------------------------------------------
  const weightLabels = {
    "1b": (
      <span>1 BAHT <br />
        <span className="text-[12px]">(15.244 g)</span>
      </span>
    ),
    "100g": <span>100 g</span>,
    "150g": <span>150 g</span>,
    "1kg": <span>1 Kg</span>,
  };
  //----------------------------------------------------------------------------------------

  return (
    <div className="relative min-h-[100vh] bg-linear-150 from-[#0e2353fc] to-[#234085fc]">
      {/*------------------------ Loading... -----------------------*/}
      {loading && (
        <div
          className={`fixed inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm z-50 transition-opacity duration-700 ${
            fadeOut ? "opacity-0" : "opacity-100"
          }`}>
          <span className="loading loading-dots loading-xl text-[#0e2353fc]"></span>
        </div>
      )}

      <Header updatedTime={updatedTime} />
      <div className="sm:max-w-lg md:max-w-[1024px] m-auto p-5">
        <div className="grid sm:grid-row-6 sm:grid-cols-1 md:grid-rows-2 md:grid-cols-2 gap-4">
          {/*--------------------- Gold 99.99% ---------------------*/}
          <GoldPriceCard
            title="ทองคำ 99.99%"
            content={
              <>
                <BuySellContainer
                  label="เสนอซื้อ"
                  current={goldGcap.gold99_buy}
                  previous={goldGcap.old_gold99_buy}
                  highOrLow={minmax.gold99.max.toLocaleString()}
                  type="High"
                />
                <div className="divider divider-horizontal" />
                <BuySellContainer
                  label="เสนอขาย"
                  current={goldGcap.gold99_sell}
                  previous={goldGcap.old_gold99_sell}
                  highOrLow={minmax.gold99.min.toLocaleString()}
                  type="Low"
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
                  label="เสนอซื้อ"
                  current={goldGcap.gold96_buy}
                  previous={goldGcap.old_gold96_buy}
                  highOrLow={minmax.gold96.max.toLocaleString()}
                  type="High"
                />
                <div className="divider divider-horizontal" />
                <BuySellContainer
                  label="เสนอขาย"
                  current={goldGcap.gold96_sell}
                  previous={goldGcap.old_gold96_sell}
                  highOrLow={minmax.gold96.min.toLocaleString()}
                  type="Low"
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
                <div className="card grid grow place-items-center mb-2">
                  <div className="text-sm md:text-lg">เสนอซื้อ</div>
                  <div className="flex w-[100%] text-center justify-center items-center">
                    <span className="text-2xl md:text-3xl font-extrabold">
                      {goldAssn?.buyPrice?.replace(".00", "")}
                    </span>
                  </div>
                </div>
                <div className="divider divider-horizontal mb-2" />
                <div className="card grid grow place-items-center mb-2">
                  <div className="text-sm md:text-lg">เสนอขาย</div>
                  <div className="flex w-[100%] text-center justify-center items-center">
                    <span className="text-2xl md:text-3xl font-extrabold">
                      {goldAssn?.sellPrice?.replace(".00", "")}
                    </span>
                  </div>
                </div>
              </>
            }
          />

          {/*--------------------- Gold History Link --------------------*/}
          <div className="text-center md:order-5 md:col-span-2 mt-[-10px]">
            <a
              href={urlConfig.urlGHistory}
              className="text-white hover:text-yellow-400 text-sm md:text-[16px]"
              target="_self">
              ราคาทองย้อนหลัง &#10093;
            </a>
          </div>

          {/*--------------------- Silver Price --------------------*/}
          <div className="md:order-5 md:col-span-2 overflow-x-auto">
            <div className="bg-white rounded-xl p-2">
              <p className="text-[#0e2353fc] font-sukhumvit-bold text-center text-xl md:text-2xl mb-2">ราคาเงินเเท่ง 99.99%</p>
              <table className="table-fixed w-full">
                <thead>
                  <tr className="text-[#0e2353fc] font-sukhumvit-bold text-end md:text-lg">
                    <th className="w-15 md:w-40 px-0 py-1.5 md:py-3 text-center">น้ำหนัก</th>
                    <th className="w-1/3 px-0 py-1.5 md:py-3 md:px-4">เสนอซื้อ</th>
                    <th className="w-1/3 px-0 py-1.5 md:py-3 md:px-4">เสนอขาย</th>
                    <th className="w-1/3 px-0 py-1.5 md:py-3 md:px-4">รวม Vat 7%</th>
                  </tr>
                </thead>
                <tbody>
                  {silverPrice.map((item, i) => (
                    <tr key={i} className="font-sukhumvit-bold md:text-lg ">
                      <td className="w-40 text-[#0e2353fc] text-center px-0 py-2.5 md:px-4 md:py-3">{weightLabels[item.key] || item.label}</td>
                      <td className="w-1/3 text-gray-600 text-end px-0 py-2.5 md:px-4 md:py-3">{FormatNumber(item.bid)}</td>
                      <td className="w-1/3 text-gray-600 text-end px-0 py-2.5 md:px-4 md:py-3">{FormatNumber(item.offer)}</td>
                      <td className="w-1/3 text-gray-600 text-end px-0 py-2.5 md:px-4 md:py-3">{FormatNumber(item.withVat)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            
            <div className="text-center mt-2">
              {/*--------------------- Silver History Link --------------------*/}
              <a
                href={urlConfig.urlSHistory}
                className="text-white hover:text-yellow-400 text-sm md:text-[16px]"
                target="_self">
                ราคาเงินเเท่งย้อนหลัง &#10093;
              </a>
              <p className="text-white text-center text-sm md:text-[16px] mt-1">
                * น้ำหนัก 1 บาท (15.244 กรัม), 100 กรัม, 150 กรัม {<br />}
                ราคารวมค่ากำเหน็จ เเละค่าจัดส่งไปรษณีย์เเล้ว
              </p>
            </div>
          </div>

          {/*--------------------- Trading View --------------------*/}
          <TradingViewCard />
        </div>
      </div>
    </div>
  );
}

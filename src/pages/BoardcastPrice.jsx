import { useEffect, useState } from "react";
import { api } from "../api/axiosInstance";
import GoldPriceCard from "../components/GoldPriceCard";
import TradingViewCard from "../components/TradingViewCard";
import BuySellContainer from "../components/BuySellContainer";
import Header from "../components/Header";
import GoldIcon from "../assets/GoldIcon.png";
import { FormatNumber } from "../utility/function";

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
          api.get("/gold-gcap/latest"),
          api.get("/gold-assn/latest"),
          api.get("https://slv.testdev.pro/api/slv/silver/v2/price/history/public?Page=1&PageSize=1"),
          api.get("https://uatptestgcapweb.gcap.co.th/api/tradePriceMinMax"),
        ]);
        if (gcapRes.data) setGoldGcap(gcapRes.data);
        if (assnRes.data) setGoldAssn(assnRes.data);
        if (silverRes.data?.data?.items?.[0]?.rows) setSilverPrice(silverRes.data.data.items[0].rows.reverse());
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
        const res = await api.get("/gold-assn/latest");
        if (res.data) setGoldAssn(res.data);
      } catch (err) {
        console.error("Failed to refresh gold association price:", err);
      }
    };

    const fetchSilverPrice = async () => {
      try {
        const res = await api.get(
          "https://slv.testdev.pro/api/slv/silver/v2/price/history/public?Page=1&PageSize=1"
        );
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

        let debounceTimer = null;

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

          // Debounce API call
          if (debounceTimer) clearTimeout(debounceTimer);
          debounceTimer = setTimeout(() => {
            if (newPrices.gold99_buy > 0 && newPrices.gold96_buy > 0) {
              api
                .post("/gold-gcap", newPrices)
                .catch((err) => console.error("❌ Failed to save:", err));
            }
          }, 1000);
        };

        // Connect to SignalR
        window.$.connection.hub.url = "https://g266.gcaponline.com/signalr";
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

  return (
    <div className="relative min-h-[100vh] bg-linear-150 from-[#0e2353fc] to-[#234085fc]">
      {/*------------------------ Loading... -----------------------*/}
      {loading && (
        <div
          className={`fixed inset-0 flex items-center justify-center bg-white/70 backdrop-blur-sm z-50 transition-opacity duration-700 ${fadeOut ? "opacity-0" : "opacity-100"}`}>
          <span className="loading loading-dots loading-xl text-[#0e2353fc]"></span>
        </div>
      )}

      <div className="sm:max-w-lg md:max-w-[1024px] m-auto p-5">
        <Header updatedTime={updatedTime} />
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
                <div className="card grid grow place-items-center mb-3">
                  <div className="text-sm md:text-lg">เสนอซื้อ</div>
                  <div className="flex w-[100%] text-center justify-center items-center">
                    <span className="text-xl md:text-2xl font-bold">
                      {goldAssn?.buyPrice?.replace(".00", "")}
                    </span>
                  </div>
                </div>
                <div className="divider divider-horizontal mb-2" />
                <div className="card grid grow place-items-center mb-3">
                  <div className="text-sm md:text-lg">เสนอขาย</div>
                  <div className="flex w-[100%] text-center justify-center items-center">
                    <span className="text-xl md:text-2xl font-bold">
                      {goldAssn?.sellPrice?.replace(".00", "")}
                    </span>
                  </div>
                </div>
              </>
            }
          />

          {/*--------------------- History Link --------------------*/}
          <div className="text-center md:order-last md:col-span-2">
            <a
              href="https://www.gcap.co.th/goldprice/gcappricegold.php"
              className="text-white hover:text-yellow-400 text-sm md:text-[16px]"
              target="_blank"
              rel="noopener noreferrer">
              ราคาทองย้อนหลัง &#10093;
            </a>
          </div>

          {/*--------------------- Silver Price --------------------*/}
          <div className="bg-white rounded p-2 md:order-5 md:col-span-2 overflow-x-auto">
            <table className="table">
              <thead>
                <tr className="text-[#0e2353fc] font-sukhumvit-bold text-center md:text-lg">
                  <th className="px-0 py-1.5 md:py-3 w-1/4">น้ำหนัก</th>
                  <th className="px-0 py-1.5 md:py-3 w-1/4">เสนอซื้อ</th>
                  <th className="px-0 py-1.5 md:py-3 w-1/4">เสนอขาย</th>
                  <th className="px-0 py-1.5 md:py-3 w-1/4">รวม Vat 7%</th>
                </tr>
              </thead>
              <tbody>
                {silverPrice.length > 0 ? (
                  silverPrice.map((item, i) => (
                    <tr key={i} className="font-sukhumvit-bold md:text-lg">
                      <td className="text-[#0e2353fc] text-center px-0 py-2.5 md:px-4 md:py-3">
                        {item.label}
                      </td>
                      <td className="text-gray-600 text-end px-0 py-2.5 md:px-4 md:py-3">
                        {FormatNumber(item.bid)}
                      </td>
                      <td className="text-gray-600 text-end px-0 py-2.5 md:px-4 md:py-3">
                        {FormatNumber(item.offer)}
                      </td>
                      <td className="text-gray-600 text-end px-0 py-2.5 md:px-4 md:py-3">
                        {FormatNumber(item.withVat)}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="4" className="text-center text-gray-500">
                      กำลังโหลดข้อมูล...
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/*--------------------- Trading View --------------------*/}
          <TradingViewCard />
        </div>
      </div>
    </div>
  );
}

import { FaSortUp, FaSortDown } from "react-icons/fa";

export default function BuySellContainer({
  label,
  current,
  previous,
  highOrLow,
  type,
}) {
  const diff = Math.abs(current - previous);
  const isUp = diff !== 0 && current >= previous; // isUp if diff != 0
  const textColor =
    diff === 0 ? "text-black" : isUp ? "text-green-600" : "text-red-600";

  return (
    <>
      <div className="card grid h-20 grow place-items-center">
        <div className="text-md">{label}</div>

        <div
          className={`flex w-[100%] text-center justify-center items-center ${textColor}`}>
          <span className="w-[10%] text-md md:text-lg">
            {diff === 0 ? null : isUp ? <FaSortUp /> : <FaSortDown />}
          </span>

          <span className="w-[55%] text-xl md:text-2xl font-bold">
            {current?.toLocaleString() ?? "-"}
          </span>

          <span className="w-[10%] text-md md:text-lg">
            {diff === 0 ? "+0" : isUp ? `+${diff}` : `-${diff}`}
          </span>
        </div>

        <div className="text-sm md:text-lg">
          {type} : <b>{highOrLow}</b>
        </div>
      </div>
    </>
  );
}

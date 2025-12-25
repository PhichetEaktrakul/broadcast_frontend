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
  const textColor = diff === 0 ? "text-black" : isUp ? "text-green-600" : "text-red-600";
  const arrow = isUp ? "mt-2" : "mb-2";
  
  return (
    <>
      <div className="card grid h-18 grow place-items-center">
        <div className="text-sm md:text-lg">{label}</div>

        <div className={`flex w-full items-center justify-center ${textColor}`}>
          <span className={`inline-flex w-[20%] md:w-[10%] justify-end md:text-lg ${arrow}`}>
            {diff === 0 ? null : isUp ? <FaSortUp /> : <FaSortDown />}
          </span>

          <span className="w-[60%] md:w-[55%] text-[1.7rem] md:text-[1.9rem] leading-[1.3] font-extrabold text-center">
            {current?.toLocaleString() ?? "-"}
          </span>

          <span className="inline-flex w-[20%] md:w-[10%] justify-start md:text-lg">
            {diff === 0 ? " " : isUp ? `+${diff}` : `-${diff}`}
          </span>
        </div>

        <div className="text-sm md:text-lg">
          {type} : <b>{highOrLow}</b>
        </div>
      </div>
    </>
  );
}

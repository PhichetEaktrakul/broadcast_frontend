export default function GoldPriceCard({ title, content }) {
  return (
    <>
      <div className="bg-white rounded-xl px-2 pb-2">
        <div className="text-center text-xl md:text-2xl text-[#0e2353fc] font-sukhumvit-bold pt-2 pb-1">
          {title}
        </div>
        <div className="flex w-full">{content}</div>
      </div>
    </>
  );
}

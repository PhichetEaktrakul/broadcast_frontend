export default function GoldPriceCard({ title, content }) {
  return (
    <>
      <div className="bg-white rounded p-2">
        <div className="text-center text-2xl text-[#0e2353fc] font-sukhumvit-bold p-2">
          {title}
        </div>
        <div className="flex w-full">{content}</div>
      </div>
    </>
  );
}

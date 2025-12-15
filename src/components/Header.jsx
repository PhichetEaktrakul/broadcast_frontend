export default function Header({ updatedTime }) {
  return (
    <>
      <div className="text-center pt-5 pb-2 sticky top-0 bg-linear-150 from-[#112553] to-[#162c61] z-10">
        <p className="text-2xl text-[#dabe96] font-sukhumvit-bold">ราคาจีเเคป โกลด์</p>
        <p className="text-[12px] md:text-[16px] text-white">{updatedTime}</p>
      </div>
    </>
  );
}

export default function Header({ updatedTime }) {
  return (
    <>
      <div className="text-center mb-4">
        <p className="text-2xl text-[#dabe96] font-sukhumvit-bold">ราคาทองจีเเคป โกลด์</p>
        <p className="text-[12px] md:text-[16px] text-white">{updatedTime}</p>
      </div>
    </>
  );
}

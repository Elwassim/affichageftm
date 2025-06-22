export const CGTLogo = ({
  className = "w-16 h-16",
}: {
  className?: string;
}) => {
  return (
    <div
      className={`${className} bg-white rounded-full flex items-center justify-center shadow-lg relative`}
    >
      {/* CGT Text Logo */}
      <div className="text-center">
        <div className="text-cgt-red font-black text-xl leading-none">CGT</div>
        <div className="text-cgt-red text-xs font-bold leading-none mt-1">
          1895
        </div>
      </div>

      {/* Red accent border */}
      <div className="absolute inset-0 rounded-full border-4 border-cgt-red/20"></div>
    </div>
  );
};

export const CGTLogo = ({
  className = "w-16 h-16",
}: {
  className?: string;
}) => {
  return (
    <div className={`${className} relative`}>
      {/* Official CGT FTM Logo */}
      <img
        src="https://cdn.builder.io/api/v1/image/assets%2F8a493753eb454047bde361cfd788d25f%2F4f1a6798020e4085bab2b04767bab9b6?format=webp&width=800"
        alt="CGT FTM - Fédération des Travailleurs de la Métallurgie"
        className="w-full h-full object-contain bg-white rounded-lg shadow-lg p-1"
      />
    </div>
  );
};

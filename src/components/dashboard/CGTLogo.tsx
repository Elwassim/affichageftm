export const CGTLogo = ({
  className = "w-16 h-16",
}: {
  className?: string;
}) => {
  return (
    <div className={`${className} relative`}>
      {/* Official CGT FTM Logo */}
      <img
        src="https://cdn.builder.io/api/v1/image/assets%2F8a493753eb454047bde361cfd788d25f%2F2f34b8fef9c34a5c99b96da924e2a0b4?format=webp&width=800"
        alt="CGT FTM - Fédération des Travailleurs de la Métallurgie"
        className="w-full h-full object-contain rounded-lg shadow-lg"
      />
    </div>
  );
};

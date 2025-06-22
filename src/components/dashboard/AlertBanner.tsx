import { getDashboardData } from "@/lib/storage";

export const AlertBanner = () => {
  const { alertText } = getDashboardData();

  if (!alertText) return null;

  return (
    <div className="bg-union-red-dark text-white py-3 overflow-hidden shadow-lg">
      <div className="whitespace-nowrap animate-marquee">
        <span className="text-lg font-medium px-8">{alertText}</span>
      </div>

      <style jsx>{`
        @keyframes marquee {
          0% {
            transform: translateX(100%);
          }
          100% {
            transform: translateX(-100%);
          }
        }

        .animate-marquee {
          animation: marquee 30s linear infinite;
        }
      `}</style>
    </div>
  );
};

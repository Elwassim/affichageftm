import { getDashboardData } from "@/lib/storage";

export const AlertBanner = () => {
  const { alertText } = getDashboardData();

  if (!alertText) return null;

  return (
    <div className="bg-gradient-to-r from-cgt-red-dark via-cgt-red to-cgt-red-dark text-white py-2 overflow-hidden shadow-lg">
      <div className="whitespace-nowrap animate-marquee">
        <span className="text-lg font-bold px-6 tracking-wide text-shadow">
          {alertText}
        </span>
      </div>
    </div>
  );
};

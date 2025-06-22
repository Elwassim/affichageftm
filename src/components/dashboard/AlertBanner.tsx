import { getDashboardData } from "@/lib/storage";

export const AlertBanner = () => {
  const { alertText } = getDashboardData();

  if (!alertText) return null;

  return (
    <div className="bg-gradient-to-r from-cgt-red-dark via-cgt-red to-cgt-red-dark text-white py-2 overflow-hidden shadow-lg relative">
      {/* Background pattern */}
      <div className="absolute inset-0 opacity-10">
        <div
          className="h-full w-full bg-repeat"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='0.1'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3C/g%3E%3C/svg%3E")`,
          }}
        ></div>
      </div>

      <div className="relative whitespace-nowrap animate-marquee">
        <span className="text-lg font-bold px-6 tracking-wide text-shadow">
          ⚠️ ALERTE CGT • {alertText} • SOLIDARITÉ OUVRIÈRE ⚠️
        </span>
      </div>
    </div>
  );
};

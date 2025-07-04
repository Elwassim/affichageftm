import { useEffect, useState } from "react";
import { getConfig } from "@/lib/database";

export const AlertBanner = () => {
  const [alertText, setAlertText] = useState("");

  useEffect(() => {
    const loadAlertText = async () => {
      try {
        const text = await getConfig("alertText");
        setAlertText(text || "");
      } catch (error) {
        // Error loading alert text
      }
    };

    loadAlertText();
    const timer = setInterval(loadAlertText, 30000); // Refresh every 30 seconds

    // Écouter les changements depuis l'admin
    const handleConfigUpdate = (event: CustomEvent) => {
      if (event.detail.key === "alertText") {
        setAlertText(event.detail.value || "");
      }
    };

    window.addEventListener(
      "cgt-config-updated",
      handleConfigUpdate as EventListener,
    );

    return () => {
      clearInterval(timer);
      window.removeEventListener(
        "cgt-config-updated",
        handleConfigUpdate as EventListener,
      );
    };
  }, []);

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

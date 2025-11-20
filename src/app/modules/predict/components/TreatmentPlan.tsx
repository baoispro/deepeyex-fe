"use client";
import React from "react";
import { FaHeartbeat, FaPills, FaAppleAlt, FaCheckCircle, FaCalendarAlt } from "react-icons/fa";
import { EyeDiseaseLabel } from "../../../shares/types/predict";
import { useRouter } from "@/app/shares/locales/navigation";
import { useTranslations } from "next-intl";

type Props = {
  disease: EyeDiseaseLabel;
};

const TreatmentPlanUI: React.FC<Props> = ({ disease }) => {
  const t = useTranslations("predict");
  const router = useRouter();

  // Lấy dữ liệu từ translations
  const getPlanData = () => {
    const diseaseKey = disease as string;
    return {
      diagnosis: t(`treatmentPlan.diseases.${diseaseKey}.diagnosis`),
      medicines: (t.raw(`treatmentPlan.diseases.${diseaseKey}.medicines`) as string[]) || [],
      lifestyle: (t.raw(`treatmentPlan.diseases.${diseaseKey}.lifestyle`) as string[]) || [],
      followUp: t(`treatmentPlan.diseases.${diseaseKey}.followUp`),
    };
  };

  const plan = getPlanData();

  return (
    <div className="p-4 bg-gray-50 rounded-lg shadow space-y-4">
      {/* Diagnosis */}
      <div className="flex items-center space-x-2">
        <FaHeartbeat className="text-red-500" size={24} />
        <h2 className="text-lg font-bold">
          {t("treatmentPlan.diagnosis")} {plan.diagnosis}
        </h2>
      </div>

      {/* Medicines */}
      {plan.medicines.length > 0 ? (
        <div>
          <h3 className="font-semibold flex items-center space-x-2">
            <FaPills className="text-blue-500" /> <span>{t("treatmentPlan.medicines")}</span>
          </h3>
          <ul className="list-disc list-inside text-gray-700">
            {plan.medicines.map((m, i) => (
              <li key={i}>{m}</li>
            ))}
          </ul>
        </div>
      ) : (
        <p className="text-gray-600">{t("treatmentPlan.noMedicine")}</p>
      )}

      {/* Lifestyle */}
      {plan.lifestyle.length > 0 && (
        <div>
          <h3 className="font-semibold flex items-center space-x-2">
            <FaAppleAlt className="text-green-600" /> <span>{t("treatmentPlan.lifestyle")}</span>
          </h3>
          <ul className="list-disc list-inside text-gray-700">
            {plan.lifestyle.map((tip, i) => (
              <li key={i}>{tip}</li>
            ))}
          </ul>
        </div>
      )}

      {/* Follow-up */}
      <div className="flex items-center space-x-2">
        <FaCheckCircle className="text-green-500" />
        <span className="text-gray-700">{plan.followUp}</span>
      </div>

      {/* Booking button (hide if healthy_eye) */}
      {disease !== "healthy_eye" && (
        <div className="pt-4">
          <button
            onClick={() => router.push("/booking")}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-lg shadow cursor-pointer"
          >
            <FaCalendarAlt /> <span>{t("treatmentPlan.bookAppointment")}</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default TreatmentPlanUI;

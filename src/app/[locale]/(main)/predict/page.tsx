"use client";

import React, { useState, ChangeEvent, DragEvent, useEffect } from "react";
import Image from "next/image";
import { usePredictMutation } from "../../../shares/hooks/mutations/use-predict.mutation";
import { Modal } from "antd";
import TreatmentPlanUI from "../../../modules/predict/components/TreatmentPlan";
import { convertLabelToVietnamese } from "@/app/shares/utils/helper";
import { useCreateAIDiagnosisMutation } from "@/app/modules/hospital/apis/aidiagnosis/hooks/mutations/use-create-diagnosis.mutation";
import { useSelector } from "react-redux";
import { RootState } from "@/app/shares/stores";
import ProtectedPage from "@/app/shares/components/ProtectedPage";

export default function EyeDiagnosisApp() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(true);
  const [showModal, setShowModal] = useState(false);
  const patient_id = useSelector((state: RootState) => state.auth.patient?.patientId);

  const { mutate, data, isPending } = usePredictMutation({
    onSuccess: () => {
      setIsButtonDisabled(false);
      setShowModal(true);
    },
    onError: (error) => {
      console.error("Chẩn đoán thất bại:", error.message);
      setIsButtonDisabled(false);
    },
  });

  const { mutate: createDiagnosis } = useCreateAIDiagnosisMutation({
    onSuccess: (res) => {
      console.log("Tạo chẩn đoán AI thành công:", res);
      localStorage.setItem("ai_diagnosis_id", res.data?.id || "");
    },
    onError: (err) => {
      console.error("Tạo chẩn đoán AI thất bại:", err.message);
    },
  });

  const handleFile = (selectedFile: File) => {
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setIsButtonDisabled(false);
    }
  };

  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    handleFile(droppedFile);
  };

  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFile(e.target.files[0]);
    }
  };

  const handleDiagnose = () => {
    if (!file) return;
    setIsButtonDisabled(true);
    mutate({ file });
  };

  const topDiagnoses =
    data?.predictions
      ?.sort((a, b) => b.probability - a.probability)
      .slice(0, 3)
      .map((item) => ({
        name: convertLabelToVietnamese(item.label),
        probability: item.probability,
        label: item.label,
      })) || [];

  useEffect(() => {
    if (!data || !file) return;

    const top = data?.predictions?.[0];
    if (!top) return;

    createDiagnosis({
      patient_id: patient_id || "",
      record_id: "",
      disease_code: top.label,
      confidence: top.probability,
      eye_type: "both",
      main_image_url: file,
      notes: "Chẩn đoán tự động bởi AI",
    });
  }, [data]);

  return (
    <ProtectedPage>
      <section className="flex flex-col">
        {/* Main */}
        <main className="flex-grow flex items-center justify-center p-6">
          <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-4xl flex flex-col md:flex-row gap-8">
            {/* Upload ảnh */}
            <div
              id="upload-area"
              className="flex-1 border-2 border-dashed border-gray-300 p-6 rounded-md text-center transition-colors hover:border-cyan-500 cursor-pointer"
              onDragOver={handleDragOver}
              onDrop={handleDrop}
            >
              <p className="text-gray-500 mb-4">Kéo và thả ảnh vào đây hoặc</p>
              <label
                htmlFor="image-upload"
                className="bg-cyan-600 text-white px-4 py-2 rounded-md font-semibold cursor-pointer hover:bg-cyan-500 transition-colors"
              >
                Tải ảnh lên
              </label>
              <input
                type="file"
                id="image-upload"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
              {previewUrl && (
                <div id="image-preview" className="mt-4 w-full h-auto">
                  <Image
                    id="preview-img"
                    src={previewUrl}
                    alt="Image Preview"
                    width={400}
                    height={400}
                    className="mx-auto max-w-full h-auto rounded-lg shadow-md"
                  />
                </div>
              )}
            </div>

            {/* Kết quả */}
            <div className="flex-1 flex flex-col">
              <div className="bg-gray-50 p-6 rounded-md shadow-inner flex-grow flex flex-col items-center justify-center text-center">
                {!file && (
                  <p className="text-gray-500 text-lg">Tải lên một bức ảnh để bắt đầu chẩn đoán.</p>
                )}

                {file && !isPending && topDiagnoses.length === 0 && (
                  <p className="text-gray-500 text-lg">
                    Nhấn &quot;Chẩn đoán&quot; để xem kết quả.
                  </p>
                )}

                {isPending && (
                  <p className="text-lg text-gray-500">
                    <span className="animate-pulse">Đang chẩn đoán...</span>
                  </p>
                )}

                {topDiagnoses.length > 0 && (
                  <div className="flex justify-center items-end gap-6 mt-6">
                    {topDiagnoses.map((d, idx) => (
                      <div
                        key={idx}
                        className={`flex flex-col items-center ${
                          idx === 0 ? "order-2" : idx === 1 ? "order-1" : "order-3"
                        }`}
                      >
                        {/* Vòng tròn */}
                        <div
                          className={`relative flex items-center justify-center ${
                            idx === 0 ? "w-28 h-28" : "w-24 h-24"
                          }`}
                        >
                          <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100">
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              stroke="#E5E7EB"
                              strokeWidth="8"
                              fill="none"
                            />
                            <circle
                              cx="50"
                              cy="50"
                              r="40"
                              stroke="#06B6D4"
                              strokeWidth="8"
                              fill="none"
                              strokeDasharray={`${2 * Math.PI * 40}`}
                              strokeDashoffset={`${2 * Math.PI * 40 * (1 - d.probability)}`}
                              strokeLinecap="round"
                              transform="rotate(-90 50 50)"
                            />
                          </svg>
                          <span className="text-lg font-bold text-cyan-600">
                            {(d.probability * 100).toFixed(0)}%
                          </span>
                        </div>

                        {/* Tên bệnh */}
                        <p className="mt-2 text-center text-sm max-w-[100px]">{d.name}</p>

                        {/* Thứ hạng */}
                        <p
                          className={`mt-1 font-semibold ${
                            idx === 0 ? "text-yellow-600" : "text-gray-500"
                          }`}
                        >
                          #{idx + 1}
                        </p>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Nút hành động */}
              <button
                className={`mt-4 px-6 py-3 bg-cyan-600 text-white font-bold rounded-md shadow-md transition-colors hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 ${
                  isButtonDisabled ? "opacity-50 cursor-not-allowed" : ""
                }`}
                onClick={handleDiagnose}
                disabled={isButtonDisabled}
              >
                {isPending ? "Đang chẩn đoán..." : "Chẩn đoán"}
              </button>
            </div>
          </div>
        </main>

        {topDiagnoses.length > 0 && (
          <Modal open={showModal} onCancel={() => setShowModal(false)} footer={null}>
            {topDiagnoses[0].name === "Mắt bình thường" ? (
              <p className="text-center text-green-600 font-semibold">
                Mắt của bạn bình thường ✅. Nên đi khám định kỳ mỗi 6 - 12 tháng.
              </p>
            ) : (
              <div>
                <p className="text-center text-red-600 font-semibold mb-4">
                  AI phát hiện dấu hiệu: {topDiagnoses[0].name}
                </p>
                <TreatmentPlanUI disease={topDiagnoses[0].label} />
              </div>
            )}
          </Modal>
        )}
      </section>
    </ProtectedPage>
  );
}

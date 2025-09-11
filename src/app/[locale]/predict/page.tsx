"use client";

import React, { useState, ChangeEvent, DragEvent } from "react";
import Image from "next/image";
import { usePredictMutation } from "../../shares/hooks/mutations/use-predict.mutation";
import { EyeDiseaseLabel } from "../../shares/types/predict";
import { Link } from "@/app/shares/locales/navigation";

export default function EyeDiagnosisApp() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(true);

  const { mutate, data, isPending } = usePredictMutation({
    onSuccess: () => {
      setIsButtonDisabled(false);
    },
    onError: (error) => {
      console.error("Chẩn đoán thất bại:", error.message);
      setIsButtonDisabled(false);
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
      })) || [];

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6 flex justify-between items-center rounded-b-lg">
        <div className="flex items-center">
          <svg
            className="w-8 h-8 text-cyan-600 mr-2"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
            />
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
          </svg>
          <h1 className="text-2xl font-bold text-gray-800">Chẩn đoán mắt</h1>
        </div>
        <nav className="flex items-center space-x-4">
          <Link
            href="/signin"
            className="px-4 py-2 text-cyan-600 font-semibold rounded-md border border-cyan-600 hover:bg-cyan-50 transition-colors"
          >
            Đăng nhập
          </Link>
          <Link
            href="/signup"
            className="px-4 py-2 bg-cyan-600 text-white font-semibold rounded-md shadow-sm hover:bg-cyan-500 transition-colors"
          >
            Đăng ký
          </Link>
        </nav>
      </header>

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
                <p className="text-gray-500 text-lg">Nhấn &quot;Chẩn đoán&quot; để xem kết quả.</p>
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
    </div>
  );
}

function convertLabelToVietnamese(label: EyeDiseaseLabel): string {
  const map: Record<EyeDiseaseLabel, string> = {
    conjunctivitis: "Viêm kết mạc (Đau mắt đỏ)",
    eyelidedema: "Phù nề mí mắt",
    healthy_eye: "Mắt bình thường",
    hordeolum: "Chắp / Lẹo",
    keratitiswithulcer: "Viêm giác mạc có loét",
    subconjunctival_hemorrhage: "Xuất huyết dưới kết mạc",
  };

  return map[label] || label;
}

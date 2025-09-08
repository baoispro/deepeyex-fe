"use client";

import React, { useState, ChangeEvent, DragEvent } from "react";

export default function EyeDiagnosisApp() {
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [diagnosing, setDiagnosing] = useState<boolean>(false);
  const [diagnosisResult, setDiagnosisResult] = useState<string | null>(null);
  const [isButtonDisabled, setIsButtonDisabled] = useState<boolean>(true);

  // Sample diagnoses data
  const diagnoses = [
    { name: "Viêm kết mạc (đau mắt đỏ)", probability: 0.95 },
    { name: "Đục thủy tinh thể", probability: 0.88 },
    { name: "Tăng nhãn áp", probability: 0.76 },
    { name: "Thoái hóa điểm vàng", probability: 0.65 },
    { name: "Tầm nhìn bình thường", probability: 0.99 },
  ];

  // Function to handle file preview
  const handleFile = (selectedFile: File) => {
    if (selectedFile && selectedFile.type.startsWith("image/")) {
      setFile(selectedFile);
      setPreviewUrl(URL.createObjectURL(selectedFile));
      setIsButtonDisabled(false);
      setDiagnosisResult("Nhấn \"Chẩn đoán\" để xem kết quả.");
    }
  };

  // Handle drag and drop
  const handleDragOver = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    const droppedFile = e.dataTransfer.files[0];
    handleFile(droppedFile);
  };

  // Handle file input change
  const handleFileChange = (e: ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const selectedFile = e.target.files[0];
      handleFile(selectedFile);
    }
  };

  // Handle diagnose button click
  const handleDiagnose = () => {
    if (!file) return;

    // Show loading state
    setDiagnosing(true);
    setDiagnosisResult(null);
    setIsButtonDisabled(true);

    // Simulate API call
    setTimeout(() => {
      const randomDiagnosis = diagnoses[Math.floor(Math.random() * diagnoses.length)];
      setDiagnosing(false);
      setDiagnosisResult(`
        <p class="text-xl font-bold text-gray-800">Kết quả chẩn đoán:</p>
        <p class="text-2xl text-cyan-600 font-extrabold mt-2">${randomDiagnosis.name}</p>
        <p class="text-sm text-gray-500 mt-1">Độ tin cậy: ${(randomDiagnosis.probability * 100).toFixed(2)}%</p>
      `);
      setIsButtonDisabled(false);
    }, 2000); // 2-second delay to simulate processing
  };

  return (
    <div className="flex flex-col min-h-screen">
      {/* Header */}
      <header className="bg-white shadow-sm py-4 px-6 flex justify-between items-center rounded-b-lg">
        <div className="flex items-center">
          <svg className="w-8 h-8 text-cyan-600 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path>
          </svg>
          <h1 className="text-2xl font-bold text-gray-800">Chẩn đoán mắt</h1>
        </div>
        <nav className="flex items-center space-x-4">
          <a href="/signin" className="px-4 py-2 text-cyan-600 font-semibold rounded-md border border-cyan-600 hover:bg-cyan-50 transition-colors">
            Đăng nhập
          </a>
          <a href="/signup" className="px-4 py-2 bg-cyan-600 text-white font-semibold rounded-md shadow-sm hover:bg-cyan-500 transition-colors">
            Đăng ký
          </a>
        </nav>
      </header>

      {/* Main Content */}
      <main className="flex-grow flex items-center justify-center p-6">
        <div className="bg-white rounded-lg shadow-xl p-8 w-full max-w-4xl flex flex-col md:flex-row gap-8">
          {/* Image Upload Section */}
          <div
            id="upload-area"
            className="flex-1 border-2 border-dashed border-gray-300 p-6 rounded-md text-center transition-colors hover:border-cyan-500 cursor-pointer"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <p className="text-gray-500 mb-4">Kéo và thả ảnh vào đây hoặc</p>
            <label htmlFor="image-upload" className="bg-cyan-600 text-white px-4 py-2 rounded-md font-semibold cursor-pointer hover:bg-cyan-500 transition-colors">
              Tải ảnh lên
            </label>
            <input type="file" id="image-upload" accept="image/*" className="hidden" onChange={handleFileChange} />
            {previewUrl && (
              <div id="image-preview" className="mt-4 w-full h-auto">
                <img id="preview-img" src={previewUrl} alt="Image Preview" className="mx-auto max-w-full h-auto rounded-lg shadow-md" />
              </div>
            )}
          </div>

          {/* Diagnosis Result Section */}
          <div className="flex-1 flex flex-col">
            <div id="diagnosis-result" className="bg-gray-50 p-6 rounded-md shadow-inner flex-grow flex items-center justify-center text-center">
              {!file && <p id="result-text" className="text-gray-500 text-lg">Tải lên một bức ảnh để bắt đầu chẩn đoán.</p>}
              {file && !diagnosing && !diagnosisResult && <p id="result-text" className="text-gray-500 text-lg">Nhấn "Chẩn đoán" để xem kết quả.</p>}
              {diagnosing && <p id="result-text" className="text-lg text-gray-500"><span className="animate-pulse">Đang chẩn đoán...</span></p>}
              {diagnosisResult && <div dangerouslySetInnerHTML={{ __html: diagnosisResult }} />}
            </div>
            
            {/* Action Button */}
            <button 
              id="diagnose-btn" 
              className={`mt-4 px-6 py-3 bg-cyan-600 text-white font-bold rounded-md shadow-md transition-colors hover:bg-cyan-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:ring-offset-2 ${isButtonDisabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              onClick={handleDiagnose}
              disabled={isButtonDisabled}
            >
              Chẩn đoán
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}

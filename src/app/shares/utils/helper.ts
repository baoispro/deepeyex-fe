import { EyeDiseaseLabel } from "../types/predict";

export function convertLabelToVietnamese(label: EyeDiseaseLabel): string {
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

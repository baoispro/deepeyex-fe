import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "../configs/firebase";
import { Doctor } from "@/app/modules/hospital/types/doctor";
import { Patient } from "@/app/modules/hospital/types/patient";

/**
 * Tạo hoặc lấy conversation giữa bác sĩ và bệnh nhân
 * @param {Object} doctor - thông tin bác sĩ (id, name, email, avatar)
 * @param {Object} patient - thông tin bệnh nhân (id, name, email, avatar)
 * @param {string} appointmentId - id của cuộc hẹn (tuỳ chọn)
 * @returns {Promise<string>} conversationId
 */
export async function createOrGetConversation(
  doctor: Doctor,
  patient: Patient,
  appointmentId: string | null = null,
) {
  if (!doctor?.doctor_id || !patient?.patient_id) {
    throw new Error("Missing doctor or patient ID");
  }

  // ConversationId có thể dựa vào cặp doctorId_patientId để không trùng
  const conversationId = `conv_${doctor.doctor_id}_${patient.patient_id}`;

  const conversationRef = doc(db, "conversations", conversationId);
  const conversationSnap = await getDoc(conversationRef);

  if (conversationSnap.exists()) {
    // 🔄 Nếu đã có → chỉ update lại thông tin mới (nếu có)
    await setDoc(
      conversationRef,
      {
        lastAppointmentId: appointmentId || conversationSnap.data().lastAppointmentId,
        updatedAt: serverTimestamp(),
      },
      { merge: true },
    );
  } else {
    // 🆕 Nếu chưa có → tạo mới
    await setDoc(conversationRef, {
      participants: [doctor.doctor_id, patient.patient_id],
      doctorInfo: {
        id: doctor.doctor_id,
        name: doctor.full_name,
        avatar: doctor.image || "",
        email: doctor.email || "",
      },
      patientInfo: {
        id: patient.patient_id,
        name: patient.full_name,
        avatar: patient.image || "",
        email: patient.email || "",
      },
      lastAppointmentId: appointmentId || null,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
  }

  return conversationId;
}

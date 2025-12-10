import { Modal } from "antd";
import { FaPhone, FaEnvelope, FaMapMarkerAlt } from "react-icons/fa";

interface ContactModalProps {
  open: boolean;
  onClose: () => void;
}

export default function ContactModal({ open, onClose }: ContactModalProps) {
  return (
    <Modal
      open={open}
      onCancel={onClose}
      footer={null}
      title="Liên hệ tư vấn gói Enterprise"
      width={600}
    >
      <div className="py-4 space-y-6">
        <p className="text-gray-700">
          Gói Enterprise được thiết kế đặc biệt cho doanh nghiệp với đầy đủ tính năng cao cấp và hỗ
          trợ chuyên dụng. Vui lòng liên hệ với chúng tôi để được tư vấn chi tiết.
        </p>

        <div className="space-y-4">
          <div className="flex items-center space-x-3">
            <FaPhone className="text-blue-500 text-xl" />
            <div>
              <p className="font-semibold text-gray-800">Hotline</p>
              <a href="tel:1900123456" className="text-blue-600 hover:underline">
                1900 123 456
              </a>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <FaEnvelope className="text-blue-500 text-xl" />
            <div>
              <p className="font-semibold text-gray-800">Email</p>
              <a href="mailto:enterprise@deepeyex.com" className="text-blue-600 hover:underline">
                enterprise@deepeyex.com
              </a>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            <FaMapMarkerAlt className="text-blue-500 text-xl" />
            <div>
              <p className="font-semibold text-gray-800">Địa chỉ</p>
              <p className="text-gray-600">
                Số 12 Nguyễn Văn Bảo, Phường Hạnh Thông, TP. Hồ Chí Minh
              </p>
            </div>
          </div>
        </div>

        <div className="bg-blue-50 p-4 rounded-lg">
          <p className="text-sm text-gray-700">
            <strong>Lưu ý:</strong> Đội ngũ tư vấn của chúng tôi sẽ liên hệ lại với bạn trong vòng
            24 giờ làm việc.
          </p>
        </div>
      </div>
    </Modal>
  );
}

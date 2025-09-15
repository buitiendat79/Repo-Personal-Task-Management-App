import { FiCheckCircle } from "react-icons/fi";

interface SuccessModalProps {
  onClose: () => void;
}

export default function SuccessModal({ onClose }: SuccessModalProps) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-40 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-full max-w-sm text-center">
        <FiCheckCircle className="text-green-500 mx-auto mb-3" size={60} />
        <p className="text-gray-800 mb-2">
          Liên kết khôi phục mật khẩu đã được gửi tới email của bạn.
        </p>
        <p className="text-gray-500 text-sm mb-6">Vui lòng kiểm tra hộp thư.</p>
        <button
          onClick={onClose}
          className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition font-medium"
        >
          Đóng
        </button>
      </div>
    </div>
  );
}

/**
 * Helper trích xuất thông điệp lỗi từ API response hoặc đối tượng Error chuẩn
 */
export const getErrorMessage = (error: unknown, fallbackMessage = 'Đã có lỗi xảy ra. Vui lòng thử lại.'): string => {
  if (!error) return fallbackMessage;

  const errObj = error as {
    response?: {
      data?: {
        message?: string;
        error?: string;
      };
    };
    message?: string;
  };

  return (
    errObj.response?.data?.message ||
    errObj.response?.data?.error ||
    errObj.message ||
    fallbackMessage
  );
};

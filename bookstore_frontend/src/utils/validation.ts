/**
 * Kiểm tra chuỗi có không được để trống (sau khi trim)
 */
export const isNonEmpty = (value: string): boolean => {
  return value.trim().length > 0;
};

/**
 * Kiểm tra địa chỉ Email hợp lệ
 */
export const isValidEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email.trim());
};

/**
 * Kiểm tra Số điện thoại Việt Nam hợp lệ
 */
export const isValidPhone = (phone: string): boolean => {
  const phoneRegex = /(84|0[3|5|7|8|9])+([0-9]{8})\b/;
  return phoneRegex.test(phone.trim());
};

/**
 * Kiểm tra Mật khẩu đủ độ dài tối thiểu
 */
export const isValidPassword = (password: string, minLength = 6): boolean => {
  return password.trim().length >= minLength;
};

/**
 * Kiểm tra hai mật khẩu có trùng khớp không
 */
export const doPasswordsMatch = (pass: string, confirmPass: string): boolean => {
  return pass === confirmPass;
};

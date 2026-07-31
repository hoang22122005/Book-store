POST   /auth/register
→ Đăng ký tài khoản mới.

POST   /auth/login
→ Đăng nhập và nhận JWT token.

GET    /auth/me
→ Lấy thông tin user hiện tại từ token.

PATCH  /auth/change-password
→ Đổi mật khẩu của tài khoản đang đăng nhập.

GET    /users/me
→ Xem thông tin cá nhân.

PATCH  /users/me
→ Cập nhật thông tin cá nhân.

GET    /books
→ Lấy danh sách sách, có tìm kiếm/lọc/phân trang.

GET    /books/{bookId}
→ Xem chi tiết một quyển sách.

POST   /admin/books
→ Admin thêm sách mới.

PATCH  /admin/books/{bookId}
→ Admin cập nhật thông tin sách.

DELETE /admin/books/{bookId}
→ Admin xóa mềm sách bằng deleted_at.

PATCH  /admin/books/{bookId}/restore
→ Admin khôi phục sách đã xóa mềm.

GET    /cart
→ Xem giỏ hàng hiện tại.

POST   /cart/items
→ Thêm sách vào giỏ hàng.

PATCH  /cart/items/{cartItemId}
→ Cập nhật số lượng sách trong giỏ.

DELETE /cart/items/{cartItemId}
→ Xóa một sản phẩm khỏi giỏ.

DELETE /cart
→ Xóa toàn bộ giỏ hàng.

POST   /checkout
→ Tạo đơn hàng từ giỏ hàng và đặt hàng.

GET    /orders/my-orders
→ Xem lịch sử đơn hàng của user.

GET    /orders/my-orders/{orderId}
→ Xem chi tiết đơn hàng của user.

PATCH  /orders/{orderId}/cancel
→ User hủy đơn hàng nếu đơn chưa giao.

GET    /admin/orders
→ Admin xem danh sách tất cả đơn hàng.

GET    /admin/orders/{orderId}
→ Admin xem chi tiết đơn hàng.

PATCH  /admin/orders/{orderId}/status
→ Admin cập nhật trạng thái đơn hàng.

GET    /books/{bookId}/reviews
→ Xem đánh giá của một quyển sách.

POST   /books/{bookId}/reviews
→ User đánh giá sách.

PATCH  /reviews/{reviewId}
→ User sửa đánh giá của mình.

DELETE /reviews/{reviewId}
→ User hoặc admin xóa đánh giá.

GET    /vouchers/my-vouchers
→ User xem voucher của mình.

POST   /vouchers/validate
→ Kiểm tra voucher có hợp lệ không.

POST   /admin/vouchers
→ Admin tạo voucher.

GET    /admin/vouchers
→ Admin xem danh sách voucher.

POST   /admin/vouchers/{voucherId}/assign
→ Admin cấp voucher cho user.

GET    /recommendations/me
→ Gợi ý sách cá nhân hóa cho user.

GET    /recommendations/books/{bookId}/similar
→ Gợi ý sách tương tự sách đang xem.

GET    /recommendations/best-sellers
→ Lấy danh sách sách bán chạy.

GET    /admin/dashboard/overview
→ Xem tổng quan hệ thống.

GET    /admin/dashboard/revenue
→ Thống kê doanh thu.

GET    /admin/dashboard/top-selling-books
→ Thống kê top sách bán chạy.
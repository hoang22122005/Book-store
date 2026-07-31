# 📖 Hướng Dẫn Ra Lệnh (Prompt Guide) Chọn Trang Từ Stitch

File này chứa danh sách các câu lệnh mẫu (Prompts) giúp bạn dễ dàng yêu cầu làm bất kỳ trang nào trong dự án **BookStore**. Mỗi khi bạn ra lệnh, hệ thống sẽ tự động đọc quy tắc trong `.agents/AGENTS.md`, tải nguyên mẫu từ Stitch, tách component và kết nối Backend API.

---

## 🎯 Danh Sách Các Trang & Câu Lệnh Mẫu

### 1. Trang Khách Hàng (Customer Flow)
- **Trang Chủ (`/`)**:
  > *"Hãy tạo cho tôi Trang Chủ khớp 100% nguyên mẫu Stitch, tách các phần Header, Banner Hero, Danh mục nổi bật, Sách mới nhất, Gợi ý cho bạn và Footer."*
- **Trang Danh Sách Sách & Lọc (`/books`)**:
  > *"Hãy tạo cho tôi Trang Danh Sách Sách với bộ lọc Sidebar (Giá, Thể loại, Đánh giá), tìm kiếm, sắp xếp và phân trang từ Stitch, kết nối API sán xuất."*
- **Trang Chi Tiết Sách (`/books/:id`)**:
  > *"Hãy tạo cho tôi Trang Chi Tiết Sách với hình ảnh lớn, thông tin tác giả, giá, nút Thêm vào giỏ / Mua ngay, đánh giá và danh sách sách liên quan."*
- **Trang Giỏ Hàng (`/cart`)**:
  > *"Hãy làm Trang Giỏ Hàng cho tôi từ Stitch, có danh sách sản phẩm, tăng giảm số lượng, nhập mã giảm giá Voucher và tính tổng tiền."*
- **Trang Thanh Toán Checkout (`/checkout`)**:
  > *"Hãy tạo Trang Thanh Toán Checkout với form địa chỉ giao hàng, phương thức thanh toán (COD / VNPay), chọn Voucher và xác nhận đơn hàng."*
- **Trang Đơn Hàng Của Tôi (`/orders`)**:
  > *"Hãy làm Trang Danh Sách Đơn Hàng Của Tôi với các tab trạng thái (Chờ xác nhận, Đang giao, Đã giao, Đã hủy) và xem chi tiết đơn."*
- **Trang Hồ Sơ Cá Nhân (`/profile`)**:
  > *"Hãy làm Trang Hồ Sơ Cá Nhân để người dùng cập nhật Họ tên, Số điện thoại, Địa chỉ, Avatar và đổi mật khẩu."*

---

### 2. Trang Quản Trị & Ban Quản Lý (Admin / Backoffice Flow)
- **Trang Tổng Quan Admin Dashboard (`/admin`)**:
  > *"Hãy làm Trang Dashboard Admin với các thẻ chỉ số doanh thu, biểu đồ, danh sách đơn hàng mới và thông báo hệ thống."*
- **Trang Quản Lý Sách (`/admin/books`)**:
  > *"Hãy làm Trang Quản Lý Sách Admin với bảng danh sách sách, tìm kiếm, thêm mới sách, sửa thông tin và xóa sách."*
- **Trang Điều Hành Đơn Hàng (`/admin/orders`)**:
  > *"Hãy làm Trang Quản Lý Đơn Hàng Admin với bảng đơn hàng, duyệt đơn, chuyển trạng thái giao hàng và in hóa đơn."*
- **Trang Quản Lý Kho Hàng (`/admin/warehouse`)**:
  > *"Hãy làm Trang Quản Lý Kho Hàng cho Thủ Kho với bảng tồn kho, phiếu nhập kho và cảnh báo hết hàng."*
- **Trang Tài Chính Kế Toán (`/admin/finance`)**:
  > *"Hãy làm Trang Báo Cáo Kế Toán & Doanh Thu cho Kế Toán với thống kê dòng tiền, doanh thu theo tháng và xuất báo cáo."*

---

## ⚡ Các Quy Tắc Tự Động Được Áp Dụng (Auto Rules)
1. **Lấy mã nguồn nguyên mẫu**: Tự động tải HTML/CSS từ dự án Stitch `Vietnamese Online Bookstore Platform`.
2. **Tách Component sạch**: Tự động phân chia thành `common/`, `layout/`, và `features/<feature>/components/`.
3. **Chuẩn thiết kế**: Áp dụng bảng màu `Vietnamese Literary Modernism` (`#002045` Navy, `#855300` Amber Gold, `.glass-panel`).
4. **Kết nối API**: Đổ dữ liệu thật từ backend Spring Boot REST API.
5. **Kiểm tra tự động**: Chạy `npx tsc --noEmit` và xem preview trên browser.

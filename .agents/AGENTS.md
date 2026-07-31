# Agent Workspace Rules for BookStore Project

## 🎨 Stitch Prototype & Page Implementation Rules

Mỗi khi người dùng yêu cầu làm hoặc cập nhật một trang (ví dụ: "làm trang X", "chọn trang Y", "thiết kế màn hình Z"):

### 1. 🔍 Đọc & Phân Tích Nguyên Mẫu Stitch (`StitchMCP`)
- Sử dụng tool `StitchMCP.list_screens` cho project ID `projects/379687365999468196` để tìm `screenId` của trang tương ứng.
- Lấy link HTML/CSS qua `StitchMCP.get_screen` và đọc nội dung chi tiết bằng `read_url_content`.
- Bắt buộc phân tích:
  - Cấu trúc Layout Grid (Header, Navigation, Main Content, Sidebar, Footer).
  - Từng thành phần UI (Form Inputs, Buttons, Book Cards, Filter Sliders, Tables, Badges, Modals).
  - Tên icon Google Material Symbols (`mail`, `lock`, `search`, `shopping_cart`, `arrow_forward`, `filter_alt`, v.v.).

### 2. 🧩 Quy Tắc Tách Component Mô-đun (Modular Component Architecture)
- **TUYỆT ĐỐI KHÔNG** tạo một file trang khổng lồ monolithic.
- Phải tách nhỏ các thành phần thành component độc lập:
  - `src/components/common/`: Component dùng chung toàn bộ app (`Button.tsx`, `Input.tsx`, `Badge.tsx`, `Modal.tsx`, `Select.tsx`, `Pagination.tsx`, `Spinner.tsx`).
  - `src/components/layout/`: Khung bao ngoài (`Header.tsx`, `Footer.tsx`, `Sidebar.tsx`, `CustomerLayout.tsx`, `AdminLayout.tsx`, `AuthLayout.tsx`).
  - `src/features/<feature>/components/`: Component thuộc về từng nghiệp vụ cụ thể:
    - Auth: `LoginForm.tsx`, `RegisterForm.tsx`
    - Books: `BookCard.tsx`, `BookGrid.tsx`, `BookFilterSidebar.tsx`, `BookDetailView.tsx`
    - Cart & Checkout: `CartItemRow.tsx`, `CartSummaryCard.tsx`, `CheckoutForm.tsx`, `VoucherSelectModal.tsx`
    - Orders: `OrderTableRow.tsx`, `OrderDetailModal.tsx`, `OrderStatusBadge.tsx`
    - Admin: `AdminMetricCard.tsx`, `StockAdjustmentModal.tsx`, `FinanceChartCard.tsx`
  - `src/pages/<category>/<PageName>.tsx`: Trang chính đóng vai trò ghép nối các component và quản lý routing / state.

### 3. 🎨 Chuẩn Thiết Kế Vietnamese Literary Modernism (Tailwind CSS v4)
- **Mảng Màu Chuẩn (Color Tokens)**:
  - Primary (`text-primary`, `bg-primary`): `#002045` (Navy đậm cho Brand, Heading, Navigation).
  - Secondary / Accent (`bg-secondary`, `text-secondary`): `#855300` (Nâu mạ hổ phách / Vàng đồng cho CTA chính: Đăng nhập, Thêm vào giỏ, Thanh toán). Hover: `#6a4200`.
  - Secondary Container: `#fea619`
  - Background (`bg-background`): `#f7f9fb`
  - Card / Surface Lowest (`bg-white`): `#ffffff`
  - Surface Variant (`bg-surface-variant`): `#e0e3e5`
  - Border / Outline Variant (`border-outline-variant`): `#c4c6cf`
  - Text Primary (`text-on-surface`): `#191c1e`
  - Text Variant (`text-on-surface-variant`): `#43474e`
  - Error (`text-error`): `#ba1a1a` / Container: `#ffdad6`
- **Lớp CSS Khung Kính Glassmorphism**:
  ```css
  .glass-panel {
    background: rgba(255, 255, 255, 0.85);
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
    border: 1px solid rgba(255, 255, 255, 0.3);
  }
  ```
- **Bóng Nổi (Elevation)**:
  `shadow-[0_4px_6px_-1px_rgba(26,54,93,0.05),0_2px_4px_-1px_rgba(26,54,93,0.03)]` hoặc `.book-card-shadow`.

### 4. ⚡ Luồng Kết Nối Backend REST API Thực Tế
- Mọi trang UI sau khi dựng giao diện đều phải kết nối với Spring Boot API (`http://localhost:8080/api/...`) thông qua `apiClient.ts` hoặc custom hooks / services.
- Phải hỗ trợ đầy đủ 4 trạng thái UI:
  1. **Loading**: Hiển thị Spinner hoặc Skeleton Loading khi đang fetch dữ liệu.
  2. **Success**: Đổ dữ liệu thật từ API vào component.
  3. **Error**: Hiển thị thông báo lỗi thân thiện (Toast / Alert banner).
  4. **Empty**: Hiển thị hình ảnh / icon và thông điệp khi danh sách rỗng.

### 5. ✅ Kiểm Tra & Xác Nhận Sản Phẩm
- Chạy lệnh kiểm tra TypeScript: `npx tsc --noEmit` để đảm bảo 0 lỗi biên dịch.
- Mở màn hình trên browser (`browser_subagent`) chụp ảnh screenshot đối chiếu với thiết kế Stitch trước khi báo hoàn thành cho người dùng.

# Book Store — Frontend Kick-off (MVP)

> Trạng thái: baseline kỹ thuật đối chiếu với frontend và backend ngày 30/07/2026.
> Phạm vi: `bookstore_frontend`, contract Spring Boot và hành trình storefront/back-office.

## 0. Nhận xét thẳng về tài liệu và code hiện tại

### Điểm tài liệu đang làm tốt

- Phạm vi MVP, page map và role map đã được liệt kê.
- Đã nhận ra return URL VNPay không phải nguồn xác nhận thanh toán.
- Hướng feature-first phù hợp hơn cách chia `component/service/context` hiện tại.
- Đã xác định React Query cho server state và không vội thêm Redux.
- Có nhắc đến responsive, accessibility, test và Definition of Done.
- Đã chỉ ra dependency backend cho payment result, refund và role chat.

### Điểm còn yếu hoặc sai

| Mức độ | Vấn đề                                                                                                                     | Tác động                                                                                           | Cách sửa trong tài liệu này                                                                |
| --------- | ----------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------------------------------- |
| Critical  | Tài liệu mô tả như thể frontend đã có nền tảng, nhưng source hiện chỉ có một Cart page prototype              | Ước lượng sai khối lượng; team có thể bắt đầu feature khi foundation chưa tồn tại      | Thêm current-state audit và Phase 0 bắt buộc                                                |
| Critical  | Build hiện tại không pass:`setIsError` không được dùng và local install thiếu `@tailwindcss/vite`               | Không có baseline xanh để phát triển/CI                                                         | Foundation phải khôi phục`npm ci`, typecheck và build trước feature                     |
| High      | Tài liệu nói backend chưa có Swagger/OpenAPI, nhưng backend hiện đã có`/api-docs`                                 | Team tiếp tục viết type bằng tay và tạo contract drift                                          | OpenAPI trở thành nguồn sinh TypeScript type                                                 |
| High      | Mô tả`DIRECT` sai code: xác nhận đơn chưa làm payment `SUCCEEDED`; code chỉ thành công khi order `COMPLETED` | UI hiển thị sai trạng thái thanh toán                                                            | Ghi đúng current behavior và yêu cầu PO chốt nghĩa`DIRECT`                             |
| High      | Auth/role tự mâu thuẫn:`UserResponse` không có role, trong khi đoạn cũ nói gọi profile để lấy role             | Route guard không có nguồn role rõ ràng                                                          | Tạm đọc claim JWT cho UX; backend vẫn là nguồn authorization; yêu cầu backend trả role |
| High      | Cho`CLONE` mặc định như USER khi business chưa xác nhận                                                              | Có thể cấp nhầm quyền UI                                                                         | Fail closed: không map role chưa biết vào customer route                                    |
| High      | Chưa có chiến lược đồng bộ cart guest/local với cart server                                                          | Mất item, trùng item hoặc hiển thị tổng tiền khác backend                                     | Backend cart là source of truth sau login; thiết kế merge chỉ khi có API                   |
| High      | Chưa giải quyết SEO cho catalog chạy SPA                                                                                  | Trang sách khó index/chia sẻ metadata tốt                                                         | Chốt SPA MVP hay React Router Framework/SSR trước khi mở rộng storefront                   |
| Medium    | API types dự kiến viết tay                                                                                                 | DTO backend thay đổi gây lỗi runtime                                                              | Sinh type từ OpenAPI trong CI                                                                  |
| Medium    | Chưa có performance budget/Core Web Vitals                                                                                  | UI có thể “đúng chức năng” nhưng chậm, đặc biệt vì ảnh bìa                            | Thêm budget, lazy loading, Cloudinary transforms và measurement                               |
| Medium    | Chưa có browser support, error boundary, observability, CSP, CI/deploy contract                                             | Lỗi production khó tái hiện và chất lượng không có gate                                     | Bổ sung các phần vận hành frontend                                                         |
| Medium    | Danh sách công nghệ mới chỉ là tên package                                                                             | Dễ cài trùng trách nhiệm, ví dụ Axios + generated client hoặc shadcn + Radix thiếu quy ước | Chia rõ P0/P1/không cần và owner của từng loại state                                     |
| Low       | Wireframe mới ở cấp khối, chưa nêu loading/empty/error/disabled/permission states                                       | Thiếu edge state khi implement                                                                       | Thêm UI state matrix và acceptance criteria                                                   |

### Audit source frontend hiện tại

```text
Đã có:
  React 19 + TypeScript + Vite + Tailwind v4
  Header/Footer/Cart UI prototype
  Tailwind design tokens cơ bản
  Local CartContext

Chưa có:
  Router, auth/session, HTTP client, API integration
  Query cache, form validation, generated API types
  Catalog/checkout/order/back-office pages
  Test runner, component test, E2E
  Error boundary, monitoring, analytics
  CI/CD và environment contract

Vấn đề prototype:
  CartService.ts rỗng
  placeholder href kiểu {{DATA:...}} và href="#"
  ảnh cart có URL không hợp lệ
  nút tăng/giảm/xóa chưa có handler và accessible name
  tổng tiền tính bằng number/local state, không phải server amount
  localStorage parse không có schema/error handling
```

Kết luận: đây là prototype UI, chưa phải frontend application foundation. Sprint đầu tiên phải tạo nền tảng và đưa build về trạng thái xanh; không nên triển khai đồng thời nhiều page trên cấu trúc hiện tại.

## 1. Mục tiêu và phạm vi MVP

Xây dựng web responsive cho cửa hàng sách, dùng API Spring Boot hiện có. MVP ưu tiên hoàn tất hành trình mua sách và vận hành đơn hàng. Frontend không tự phát minh nghiệp vụ khi backend thiếu contract; các thay đổi backend bắt buộc được liệt kê như dependency và phải chốt trước khi implement UI liên quan.

### Trong phạm vi

- Khách: xem/tìm/lọc sách, chi tiết sách, đánh giá/bình luận, giỏ hàng, đăng ký/đăng nhập, thanh toán, theo dõi đơn, hồ sơ và voucher.
- Thanh toán: `DIRECT` và điều hướng sang URL VNPay do API checkout trả về; trang kết quả chỉ đọc trạng thái đơn từ API.
- Nhân viên: danh sách đơn, chi tiết đơn, cập nhật trạng thái giao hàng/kết quả giao.
- Quản trị: quản lý sách, voucher, đơn hàng; xem dashboard kế toán.
- Kế toán: dashboard doanh thu, đơn hàng và sách bán chạy.
- Thủ kho: nhập kho theo sách.

### Ngoài phạm vi MVP / dependency backend

- Hoàn tiền VNPay: backend có status `PARTIALLY_REFUNDED`/`REFUNDED` nhưng **chưa có API refund, dữ liệu hoàn tiền hay callback xác nhận**. Frontend chỉ hiển thị trạng thái khi backend bổ sung.
- Hủy đơn từ phía khách, địa chỉ giao hàng riêng, vận chuyển/phí ship, thanh toán COD chi tiết, phân trang/lọc đơn trên server, thông báo push/email UI.
- Chat realtime chỉ đưa vào phase 2: endpoint lấy phòng/tin nhắn có sẵn, nhưng phân quyền server dùng role `INVENTOR` không tồn tại trong enum (xem mục Rủi ro).

## 2. Luồng nghiệp vụ chính

### 2.1 Khám phá và mua hàng

```text
Trang chủ / Danh mục
  → GET /api/public/books (tìm, lọc, phân trang)
  → Chi tiết sách
  → Thêm vào giỏ (đã đăng nhập)
  → GET/POST/PUT /api/carts/cartDetails
  → Checkout: chọn sách, voucher, DIRECT hoặc VNPAY
  → POST /api/bills/checkout
      ├─ DIRECT: hiển thị trang xác nhận đơn
      └─ VNPAY: window.location.assign(paymentUrl)
  → VNPay redirect về backend /api/payments/vnpay/return
  → hiện tại backend trả JSON, chưa redirect tiếp về frontend
  → contract mục tiêu: backend redirect về /payment/result?billId=...
  → Trang kết quả gọi API order/payment để hiển thị trạng thái thật
```

Quy tắc frontend: chỉ chuyển người dùng sang VNPay khi `paymentUrl` có giá trị. Không coi query string ở return URL là kết quả thanh toán đáng tin cậy; xác minh bằng API đơn hàng/payment. Trước khi redirect phải lưu `billId` và `paymentId` từ checkout response. Backend cần bổ sung redirect về frontend hoặc thay đổi return contract; nếu không, người dùng chỉ nhìn thấy JSON tại endpoint backend.

### 2.2 Vòng đời đơn hàng

```text
PENDING → CONFIRMED → SHIPPING → COMPLETED
    └──────────────→ CANCELLED
```

- `DIRECT`: theo code hiện tại, lúc xác nhận đơn chỉ deduct tồn kho; payment vẫn `PENDING` và chỉ chuyển `SUCCEEDED` khi đơn `COMPLETED`. Business cần xác nhận đây là COD/giao thành công hay thanh toán trực tiếp tại quầy.
- `VNPAY`: IPN của VNPay mới xác nhận thanh toán; đơn chỉ có thể được xác nhận khi payment đã `SUCCEEDED`.
- Khi hủy, backend hoàn lại tồn kho/voucher theo trạng thái kho. Với đơn VNPay đã trả tiền, backend chặn hủy cho đến khi hoàn tiền; UI phải hiển thị thông báo này thay vì đưa trạng thái hủy thành công.
- Nút chuyển trạng thái chỉ xuất hiện theo trạng thái hiện tại; vẫn phải xử lý lỗi `409` từ backend vì backend là nguồn kiểm soát cuối cùng.

### 2.3 Đăng nhập và phiên làm việc

```text
Login → accessToken + refreshToken
      → gọi API kèm Authorization: Bearer <accessToken>
      → gặp 401: POST /api/auth/refresh-token một lần
      → cập nhật token, phát lại request
      → refresh thất bại: xoá phiên và về /login
Logout → POST /api/user/logout { refreshToken } → xoá phiên cục bộ
```

Khuyến nghị MVP: giữ access token trong bộ nhớ; refresh token trong `sessionStorage` chỉ là giải pháp tương thích API hiện tại. Production nên đổi backend sang refresh-token `HttpOnly`, `Secure`, `SameSite` cookie để giảm rủi ro XSS.

## 3. Danh sách page và route

| Khu vực   | Route                                                                 | Page                                           | Vai trò          |
| ---------- | --------------------------------------------------------------------- | ---------------------------------------------- | ----------------- |
| Public     | `/`                                                                 | Home: hero, sách mới/gợi ý, CTA            | Tất cả          |
| Public     | `/books`                                                            | Danh sách, search/filter/sort/pagination      | Tất cả          |
| Public     | `/books/:bookId`                                                    | Chi tiết, reviews/comments, sách tương tự | Tất cả          |
| Auth       | `/login`, `/register`                                             | Xác thực                                     | Guest             |
| Auth       | `/forgot-password`, `/reset-password`                             | Quên/đặt lại mật khẩu                    | Guest             |
| Customer   | `/cart`                                                             | Giỏ hàng                                     | USER              |
| Customer   | `/checkout`                                                         | Chọn sách/voucher/phương thức thanh toán | USER              |
| Customer   | `/payment/result`                                                   | Đang kiểm tra / thành công / thất bại    | USER              |
| Customer   | `/orders`, `/orders/:billId`                                      | Lịch sử và chi tiết đơn                  | USER              |
| Customer   | `/account/profile`, `/account/vouchers`, `/account/security`    | Hồ sơ, voucher, mật khẩu                   | USER              |
| Staff      | `/staff/orders`, `/staff/orders/:billId`                          | Xử lý đơn/giao hàng                       | STAFF, ADMIN      |
| Admin      | `/admin`                                                            | Tổng quan điều hành                        | ADMIN             |
| Admin      | `/admin/books`, `/admin/books/new`, `/admin/books/:bookId/edit` | CRUD sách                                     | ADMIN             |
| Admin      | `/admin/vouchers`                                                   | Danh sách/tạo voucher                        | ADMIN             |
| Admin      | `/admin/orders`, `/admin/orders/:billId`                          | Quản trị đơn                               | ADMIN             |
| Accountant | `/accountant`                                                       | KPI, doanh thu, top sách                      | ACCOUNTANT, ADMIN |
| Accountant | `/accountant/orders`                                                | Chỉ xem đơn                                 | ACCOUNTANT, ADMIN |
| Warehouse  | `/warehouse/inventory`                                              | Tìm sách và nhập kho                       | WAREHOUSE_KEEPER  |
| Common     | `/forbidden`                                                        | Không có quyền truy cập                    | Tất cả          |
| Common     | `/error`                                                            | Lỗi ứng dụng có retry/request ID           | Tất cả          |
| Common     | `*`                                                                 | 404 / không có quyền                        | Tất cả          |

## 4. API contract cho frontend

Base URL: `VITE_API_BASE_URL` (ví dụ `http://localhost:8080`). `/api/auth/**`, `/api/public/**`, VNPay IPN/return và tài liệu API được backend cho phép public. Các endpoint còn lại cần `Authorization: Bearer <accessToken>`.

### Envelope và lỗi chung

```ts
type ApiResponse<T> = {
  success: boolean
  statusCode: number
  message: string
  data?: T
}

type PageResponse<T> = {
  content: T[]
  page: number; size: number
  totalElements: number; totalPages: number
  first: boolean; last: boolean
  hasNext: boolean; hasPrevious: boolean
}
```

Xử lý chuẩn: `401` refresh token rồi retry một lần; `403` chuyển `/forbidden`; `409` hiển thị xung đột nghiệp vụ; các lỗi còn lại hiển thị `message`. Không dựa vào `statusCode` trong envelope—ưu tiên HTTP status nếu backend/proxy có trả đúng status.

### Auth và tài khoản

| Method  | Endpoint                      | Body / query                                                   | Response`data`               |
| ------- | ----------------------------- | -------------------------------------------------------------- | ------------------------------ |
| POST    | `/api/auth/register`        | `{name,email,password,dob?,address?,phone?,gender?,career?}` | `null` (201)                 |
| POST    | `/api/auth/login`           | `{email,password}`                                           | `{accessToken,refreshToken}` |
| POST    | `/api/auth/refresh-token`   | `{refreshToken}`                                             | `{accessToken,refreshToken}` |
| POST    | `/api/auth/forgot-password` | `{email}`                                                    | `null`                       |
| POST    | `/api/auth/reset-password`  | `{token,newPassword}`                                        | `null`                       |
| POST    | `/api/user/logout`          | `{refreshToken}`                                             | `null`                       |
| GET/PUT | `/api/user/me`              | PUT:`{name?,phone?,address?,gender?,career?,urlAvt?}`        | `UserResponse`               |
| PATCH   | `/api/user/me/password`     | `{oldPassword,newPassword,confirmPassword}`                  | `null`                       |

`AuthResponse` và `UserResponse` hiện đều không trả role. JWT có claim `role`, vì vậy frontend có thể decode claim này để điều hướng và ẩn/hiện UI, nhưng không xem đó là authorization đáng tin cậy; backend vẫn phải kiểm tra mọi quyền. Contract mục tiêu nên thêm `role` vào `AuthResponse` hoặc `UserResponse`.

### Catalog, reviews, recommendations

| Method          | Endpoint                                                                         | Ghi chú                                            |
| --------------- | -------------------------------------------------------------------------------- | --------------------------------------------------- |
| GET             | `/api/public/books?keyword&author&categoryId&minPrice&maxPrice&page&size&sort` | `PageResponse<BookResponse>`; mặc định size 12 |
| GET             | `/api/public/books/{bookId}`                                                   | `BookResponse`                                    |
| GET             | `/api/public/ratings?bookId&page&size`                                         | `PageResponse<RatingResponse>`                    |
| GET             | `/api/public/comments?bookId&page&size`                                        | `PageResponse<CommentResponse>`                   |
| POST/PUT/DELETE | `/api/ratings`, `/api/ratings/{ratingId}`                                    | USER đăng nhập; body theo`RatingRequest`       |
| POST/PUT/DELETE | `/api/comments`, `/api/comments/{commentId}`                                 | USER đăng nhập; body theo`CommentRequest`      |
| GET             | `/api/public/recommendations/similar/{bookId}?page&size&topK`                  | Sách tương tự                                   |
| GET             | `/api/recommendations/user?page&size&topK`                                     | Gợi ý cá nhân; cần login                       |

`BookResponse` chính: `bookId`, `name`, `author`, `description`, `quantityInStock`, `price`, `urlImg`, `avgRating`, `cntRating`, `isVip`, `genres`.

### Cart, checkout và đơn hàng

| Method | Endpoint                                     | Body / response                                                                                               |
| ------ | -------------------------------------------- | ------------------------------------------------------------------------------------------------------------- |
| GET    | `/api/carts`                               | Thông tin cart                                                                                               |
| POST   | `/api/carts`                               | Tạo cart nếu cần                                                                                           |
| GET    | `/api/carts/cartDetails`                   | Danh sách`{bookId,bookName,author,price,quantity,...}`                                                     |
| POST   | `/api/carts/cartDetails`                   | `{bookId}`                                                                                                  |
| PUT    | `/api/carts/cartDetails/{bookId}/increase` | —                                                                                                            |
| PUT    | `/api/carts/cartDetails/{bookId}/decrease` | —                                                                                                            |
| DELETE | `/api/carts/cartDetails/{bookId}`          | —                                                                                                            |
| GET    | `/api/vouchers/me?page&size`               | Voucher của người dùng                                                                                    |
| POST   | `/api/bills/checkout`                      | `{voucherCode?,selectedBookIds,paymentMethod:"DIRECT"\|"VNPAY",bankCode?}` → `{bill,payment,paymentUrl?}` |
| GET    | `/api/bills/me?page&size`                  | Lịch sử đơn                                                                                               |
| GET    | `/api/bills/me/{billId}`                   | Chi tiết đơn                                                                                               |

`BillResponse` hiện không chứa payment. Sau checkout, lưu `billId` vào URL/state trước khi redirect VNPay, ví dụ `/payment/result?billId=123`; endpoint đọc đơn hiện chưa trả payment status. **Cần backend bổ sung `payment` vào `GET /api/bills/me/{id}` hoặc endpoint payment theo bill trước khi hoàn thiện trang kết quả VNPay.**

### Back office

| Nhóm       | Endpoints                                                                                                                        | Vai trò          |
| ----------- | -------------------------------------------------------------------------------------------------------------------------------- | ----------------- |
| Sách       | `POST/PUT/DELETE /api/admin/books[/{bookId}]` (`multipart/form-data`: `bookAddRequest`/`bookUpdateRequest`, `imgFile`) | ADMIN             |
| Voucher     | `GET/POST /api/admin/vouchers`                                                                                                 | ADMIN             |
| Đơn admin | `GET /api/admin/bills`, `GET /api/admin/bills/{id}`, `PATCH /api/admin/bills/{id}/status` body `{status}`                | ADMIN             |
| Đơn staff | `GET /api/dashboard/staff/orders[/{id}]`, `PATCH .../status` `{status}`, `PATCH .../delivery-result` `{successful}`    | STAFF, ADMIN      |
| Dashboard   | `GET /api/dashboard/accountant/summary`, `/revenue?from=YYYY-MM-DD&to=YYYY-MM-DD`, `/top-books?limit`, `/orders`         | ACCOUNTANT, ADMIN |
| Kho         | `PATCH /api/stock/books/{bookId}` body `{quantity}`                                                                          | WAREHOUSE_KEEPER  |

### Chat (phase 2)

- REST: `/api/chat/me/room`, `/api/chat/rooms`, `/api/chat/rooms/{chatRoomId}/messages`.
- WebSocket: `ws(s)://<host>/ws/chat?token=<accessToken>`; gửi `{chatRoomId,content}` và nhận `ChatMessageResponse`.
- Không đưa token vào log/analytics. Với API hiện có, URL token là hạn chế bảo mật cần được backend cải tiến trong phase 2.

## 5. Quyền theo role

| Khả năng                                  | Guest | USER | STAFF | ADMIN | ACCOUNTANT | WAREHOUSE_KEEPER |
| ------------------------------------------- | ----: | ---: | ----: | ----: | ---------: | ---------------: |
| Xem catalog/chi tiết/review                |    ✓ |   ✓ |    ✓ |    ✓ |         ✓ |               ✓ |
| Xem/cập nhật hồ sơ tài khoản          |    — |   ✓ |    ✓ |    ✓ |         ✓ |               ✓ |
| Cart, checkout, đơn mua của mình        |    — |   ✓ |    — |    — |         — |               — |
| Viết/sửa/xóa review & comment của mình |    — |   ✓ |    — |    — |         — |               — |
| Cập nhật đơn vận hành                 |    — |   — |    ✓ |    ✓ |         — |               — |
| CRUD sách và voucher                      |    — |   — |    — |    ✓ |         — |               — |
| Dashboard doanh thu                         |    — |   — |    — |    ✓ |         ✓ |               — |
| Nhập kho                                   |    — |   — |    — |    — |         — |               ✓ |

Đây là ma trận sản phẩm đề xuất. Backend hiện cho mọi authenticated role đi qua nhiều endpoint customer (`cart`, `checkout`, review/comment); cần đồng bộ lại authorization sau khi PO xác nhận. `CLONE` tồn tại trong enum nhưng chưa có policy UI/nghiệp vụ riêng. Frontend phải fail closed: không tự coi `CLONE` là USER và chỉ cho vào route đã được business xác nhận. Chat room cho staff đang kiểm tra `INVENTOR` trong controller/handler, nhưng enum có `WAREHOUSE_KEEPER`; đây là lỗi contract backend cần sửa trước khi mở UI chat cho staff.

## 6. Wireframe cấp thấp

```text
Desktop storefront
┌──────────────────────────────────────────────────────────────────────┐
│ Logo | Search __________________________________ | Account | Cart (n) │
│ Danh mục | Sách mới | Gợi ý | Voucher                              │
├───────────┬──────────────────────────────────────────────────────────┤
│ Filters   │ Breadcrumb                                                │
│ Giá       │ [cover] Tên sách       [cover] Tên sách                  │
│ Thể loại  │         Tác giả                Tác giả                   │
│ Tác giả   │         Giá · Rating           Giá · Rating              │
│           │ [pagination]                                             │
└───────────┴──────────────────────────────────────────────────────────┘

Checkout
┌────────────────────────────────────┬─────────────────────────────────┐
│ Sách đã chọn, số lượng, tạm tính    │ Mã voucher [______] [Áp dụng]  │
│                                    │ Tạm tính / giảm / tổng          │
│                                    │ ( ) Thanh toán trực tiếp        │
│                                    │ ( ) VNPay                       │
│                                    │ [Đặt hàng / Tiếp tục VNPay]     │
└────────────────────────────────────┴─────────────────────────────────┘

Back office
┌───────────────┬──────────────────────────────────────────────────────┐
│ Logo          │ Header: title, user menu                              │
│ Dashboard     ├──────────────────────────────────────────────────────┤
│ Đơn hàng      │ KPI / bộ lọc / bảng dữ liệu                           │
│ Sách          │ Mỗi dòng: trạng thái, CTA hợp lệ theo role            │
│ Voucher       │ Drawer/modal cho chi tiết và form                     │
│ Kho            │                                                      │
└───────────────┴──────────────────────────────────────────────────────┘
```

Mobile: header gọn với menu drawer; filters mở trong bottom sheet; cart/checkout giữ CTA cố định phía dưới; table back-office chuyển thành list card hoặc cho phép cuộn ngang có nhãn cột rõ ràng.

### UI state matrix bắt buộc

| Page/feature      | Loading                               | Empty                                     | Error/conflict                                    | Success/terminal                          |
| ----------------- | ------------------------------------- | ----------------------------------------- | ------------------------------------------------- | ----------------------------------------- |
| Catalog           | Card skeleton giữ kích thước ảnh | Không có sách phù hợp + clear filter | Retry, giữ filter trên URL                      | Grid + pagination                         |
| Book detail       | Hero/detail skeleton                  | 404 book                                  | Retry recommendation/review độc lập            | Detail; add-cart disabled nếu hết hàng |
| Cart              | Item/summary skeleton                 | CTA về catalog                           | 409 tồn kho → refetch và chỉ item lỗi        | Server cart + tổng tiền                 |
| Checkout          | Form/summary skeleton                 | Không có item được chọn             | Voucher hết hạn, tồn thay đổi, double-submit | Bill/payment created                      |
| Payment result    | “Đang xác nhận” + polling        | Không áp dụng                          | Failed/cancelled/timeout có hướng dẫn         | Success chỉ từ API status               |
| My orders         | List skeleton                         | Chưa có đơn                           | Retry                                             | List/detail + status timeline             |
| Back-office table | Row skeleton                          | Không có dữ liệu theo filter          | 403/409/5xx rõ ràng                             | Table + action theo state/role            |
| Dashboard         | Card/chart skeleton                   | Zero state theo date range                | Widget retry độc lập nếu có thể             | KPI/chart/table                           |

Skeleton phải có kích thước gần nội dung thật để giảm layout shift. Không dùng một full-screen spinner cho mọi trang.

## 7. Kiến trúc frontend và cấu trúc thư mục

Dùng **feature-first**, tách công nghệ dùng chung khỏi nghiệp vụ. Không tổ chức service theo từng màn hình; mỗi feature sở hữu API hooks, schema, component và type của mình.

```text
bookstore_frontend/
├─ e2e/                         # Playwright specs/fixtures
├─ public/
├─ src/
│  ├─ app/
│  │  ├─ providers/             # QueryClient, Auth, Error/Toast
│  │  ├─ router/                # route config, guards, lazy loading
│  │  ├─ config/                # validated environment/runtime config
│  │  └─ styles/                # global CSS, Tailwind tokens
│  ├─ features/
│  │  ├─ auth/                  # login/register/session
│  │  ├─ catalog/               # book list/detail/search
│  │  ├─ cart/
│  │  ├─ checkout/
│  │  ├─ orders/
│  │  ├─ reviews/
│  │  ├─ account/
│  │  ├─ admin/               # books, vouchers, orders
│  │  ├─ staff-orders/
│  │  ├─ accountant-dashboard/
│  │  ├─ warehouse/
│  │  └─ chat/                  # phase 2
│  ├─ pages/                    # page composition, không gọi HTTP trực tiếp
│  │  ├─ public/
│  │  ├─ customer/
│  │  └─ backoffice/
│  ├─ shared/
│  │  ├─ ui/                    # Button, Modal, Input, Badge
│  │  ├─ components/            # DataTable, EmptyState, Money, BookCover
│  │  ├─ layouts/               # StorefrontLayout, BackofficeLayout
│  │  ├─ hooks/
│  │  ├─ utils/
│  │  └─ constants/
│  ├─ lib/
│  │  ├─ api/                   # generated types, fetch client, middleware
│  │  ├─ auth/                  # session store, JWT role decoder
│  │  ├─ query/                 # query keys/client/defaults
│  │  ├─ monitoring/            # error reporting, web vitals
│  │  └─ storage/               # safe storage adapter/schema
│  ├─ mocks/                    # MSW handlers/fixtures
│  ├─ test/                     # renderWithProviders, setup, builders
│  ├─ types/                    # UI/common types; không copy DTO generated
│  ├─ assets/
│  ├─ App.tsx
│  └─ main.tsx
├─ .env.example
├─ playwright.config.ts
├─ vitest.config.ts
└─ vite.config.ts
```

Quy ước:

- `features/<feature>/api/`, `queries.ts`, `schemas.ts`, `components/`, `hooks/`; chỉ tạo `types.ts` cho UI/domain type không có trong OpenAPI.
- Chỉ `lib/api/client.ts` biết base URL/token/refresh; component không gọi `fetch` trực tiếp.
- `pages` compose feature components; `shared` không import ngược từ `features`.
- `shared` không chứa business rule; module feature không import trực tiếp implementation của feature khác.
- Route/page được lazy-load theo khu vực. Back-office không nằm trong initial bundle storefront.
- API-generated files không sửa tay và được kiểm tra drift trong CI.
- Test gần code với suffix `.test.ts(x)`; E2E đặt riêng trong `e2e/`.
- Di chuyển dần `context/CartContext.tsx`, `service/cart/CartService.ts` và `component/cart/*` vào `features/cart`; không duy trì 2 nguồn giỏ hàng (localStorage và API) khi đăng nhập.

## 8. Công nghệ

### 8.1 Đang có trong `package.json`

| Nhóm           | Công nghệ                              | Nhận xét                                                                                            |
| --------------- | ---------------------------------------- | ----------------------------------------------------------------------------------------------------- |
| UI runtime      | React 19.2, React DOM                    | Phù hợp                                                                                             |
| Language        | TypeScript 6                             | Strict checks một phần; cần bổ sung`strict`, `noUncheckedIndexedAccess` sau khi baseline xanh |
| Build           | Vite 8                                   | Phù hợp SPA; cần chunk strategy và env validation                                                 |
| Styling         | Tailwind CSS 4                           | Đã có token nhưng chưa có component primitives/documentation                                    |
| Lint            | ESLint + typescript-eslint + React hooks | Chưa có formatter, query lint hoặc a11y lint                                                       |
| Package manager | npm +`package-lock.json`               | Dùng`npm ci` trong CI; không trộn npm/yarn/pnpm                                                  |

Các folder feature-first mới chỉ là skeleton `.gitkeep`; chưa có implementation. Không ghi chúng là “đã triển khai”.

### 8.2 Công nghệ P0 cần bổ sung

| Mục đích         | Công nghệ/quyết định                                        | Lý do và cách dùng                                                                        |
| ------------------- | ---------------------------------------------------------------- | --------------------------------------------------------------------------------------------- |
| Routing             | React Router Data Mode                                           | Nested layout, lazy route, error boundary, loader/redirect; giữ quyền kiểm soát Vite SPA  |
| Server state        | `@tanstack/react-query` + query ESLint plugin                  | Cache, dedupe, retry có kiểm soát, invalidate/refetch sau mutation                         |
| OpenAPI types       | `openapi-typescript` + `openapi-fetch`                       | Sinh request/response type từ`/api-docs`; client nhẹ, tránh copy DTO                     |
| Form                | `react-hook-form`                                              | Ít rerender, quản lý dirty/touched/server error                                            |
| Validation          | `zod` + `@hookform/resolvers`                                | Validate form, URL param, localStorage và environment ở runtime                             |
| UI primitives       | shadcn/ui generated components, dựa trên accessible primitives | Sở hữu source component, đồng bộ Tailwind tokens; không cài một UI framework thứ hai |
| Icons               | `lucide-react`                                                 | Accessible SVG icons, tree-shakable; thay placeholder Material Symbol khi phù hợp           |
| Date                | `date-fns`                                                     | Parse/format theo locale Việt Nam; tránh thao tác date thủ công                          |
| Test unit/component | Vitest + React Testing Library +`user-event` + `jest-dom`    | Cùng pipeline Vite, test theo hành vi người dùng                                         |
| API mocking         | MSW                                                              | Một bộ mock network dùng cho test và development state                                    |
| E2E                 | Playwright                                                       | Auth, cart, checkout, role, payment-result và responsive smoke                               |
| Accessibility test  | `@axe-core/playwright`                                         | Bắt lỗi phổ biến; vẫn cần keyboard/screen reader review thủ công                      |
| Formatting          | Prettier +`eslint-config-prettier`                             | Format ổn định, tránh rule xung đột                                                     |
| Class utilities     | `clsx` + `tailwind-merge`                                    | Variant/component class nhất quán; thường đi cùng shadcn                                |

Không dùng Axios nếu đã chọn `openapi-fetch`; hai HTTP client tạo hai nơi xử lý auth/error. Middleware của một API client duy nhất chịu trách nhiệm gắn token, refresh và normalize error.

### 8.3 Công nghệ P1 nên bổ sung

| Mục đích       | Công nghệ                                       | Khi dùng                                                                       |
| ----------------- | ------------------------------------------------- | ------------------------------------------------------------------------------- |
| Chart             | `recharts`                                      | Dashboard kế toán; lazy-load riêng back-office                               |
| Component catalog | Storybook                                         | Khi shared UI có khoảng 10+ component hoặc nhiều người cùng phát triển |
| Visual regression | Playwright screenshots hoặc Chromatic            | Component/layout quan trọng, viewport chuẩn                                   |
| Error monitoring  | Sentry hoặc OpenTelemetry-compatible browser SDK | Production; scrub token/PII trước khi gửi                                    |
| Web Vitals        | `web-vitals`                                    | Gửi LCP/INP/CLS vào monitoring/analytics                                      |
| Bundle analysis   | `rollup-plugin-visualizer`                      | Chạy theo nhu cầu hoặc CI artifact, không đưa vào runtime                |
| Mock data         | Faker                                             | Test builders/story, không dùng dữ liệu ngẫu nhiên không seed trong test |
| PWA               | `vite-plugin-pwa`                               | Phase sau, chỉ khi business cần offline/install/push                          |

### 8.4 Chưa cần cho MVP

- Redux/Zustand: TanStack Query giữ server state; React state/context đủ cho UI/session nhỏ. Chỉ thêm khi có client state phức tạp đã đo được.
- Next.js: không đổi framework giữa chừng chỉ vì SEO. Nếu SEO là KPI bắt buộc, chốt React Router Framework Mode SSR/SSG hoặc Next.js trước Sprint 1.
- GraphQL/Apollo: backend hiện là REST/OpenAPI.
- CSS-in-JS: Tailwind và CSS variables đã đủ.
- Micro-frontend: team/scope chưa cần độ phức tạp này.
- i18n library: chỉ thêm khi có kế hoạch ngôn ngữ thứ hai; hiện có thể dùng formatter locale `vi-VN`.
- PWA/service worker: dễ tạo cache stale cho cart/payment; để sau MVP.

### 8.5 Nguyên tắc sở hữu state

| Loại state                                   | Nơi sở hữu                                                              |
| --------------------------------------------- | -------------------------------------------------------------------------- |
| Books, cart server, order, voucher, dashboard | TanStack Query                                                             |
| Access token/session status                   | Auth provider + memory; storage adapter chỉ giữ phần contract cho phép |
| Form input/error                              | React Hook Form                                                            |
| Filter/search/page                            | URL search params                                                          |
| Modal/drawer/tab tạm thời                   | Local component state                                                      |
| Theme/UI preference                           | Local storage có Zod validation                                           |
| Payment result                                | Server state theo`billId/paymentId`, không tin query VNPay              |

Không copy cùng một dữ liệu vào Context, Query cache và localStorage.

## 9. Chia module và thứ tự triển khai

| Sprint / module            | Deliverable                                                                                 | API phụ thuộc               |
| -------------------------- | ------------------------------------------------------------------------------------------- | ----------------------------- |
| 0 — Baseline đỏ → xanh | Khôi phục`npm ci`, sửa TypeScript/build, xóa placeholder link/image, thêm scripts CI | Không                        |
| 1 — Foundation            | Router, layouts, design tokens, generated API client, auth/session, guards, error boundary  | Auth, User, OpenAPI           |
| 2 — Storefront            | Catalog, chi tiết, search/filter/pagination, review/comment read, metadata                 | Public books/reviews/comments |
| 3 — Conversion            | Cart đồng bộ API, checkout DIRECT/VNPay, đơn của tôi, voucher                        | Cart, Bills, Voucher, Payment |
| 4 — Operations            | Staff orders, admin books/vouchers/orders, warehouse import                                 | Dashboard staff/admin, stock  |
| 5 — Finance & hardening   | Dashboard accountant, a11y, responsive, E2E, Web Vitals, monitoring                         | Accountant dashboard          |
| 6 — Deferred              | Chat, refund UI, notification/PWA                                                           | Backend fixes/new APIs        |

Mỗi module có: page route + feature API/query + loading/empty/error/stale state + permission guard + unit/component/E2E test phù hợp. API type được sinh từ OpenAPI `/api-docs`; type generated không sửa tay. Nếu schema thiếu field hoặc mô tả sai, sửa backend/OpenAPI thay vì vá type frontend.

## 10. Definition of Done

Một user story frontend chỉ hoàn thành khi:

- Đúng route, role guard và không lộ CTA không được phép.
- Có loading, empty, error, success state; request không treo vô hạn.
- Gọi đúng contract, có type request/response; mutation invalidate/refetch dữ liệu liên quan.
- Generated OpenAPI type không drift và không bị sửa tay.
- Form validate ở client, hiển thị lỗi server rõ ràng và không mất dữ liệu khi lỗi.
- Responsive từ 360 px và desktop; keyboard focus, label, tương phản và semantic HTML đạt mức cơ bản WCAG 2.1 AA.
- Ảnh có `alt`, không có lỗi console, không lộ token/sensitive query ra log.
- Có test phù hợp: unit cho logic, RTL/MSW cho UI/API state, Playwright cho luồng quan trọng.
- Route public có title/meta/canonical phù hợp với chiến lược SEO đã chốt.
- Không làm tăng bundle vượt budget mà không có giải thích; ảnh có dimension và strategy tối ưu.
- Error production có request ID/monitoring context nhưng không chứa token/PII.
- `format:check`, lint, typecheck, test, build và E2E smoke chạy thành công.
- PR được review và acceptance criteria được PO/QA xác nhận.

### DoD riêng cho checkout VNPay

- Không redirect nếu `paymentUrl` trống.
- Lưu `billId` trước khi redirect và trang kết quả polling/refetch đơn có giới hạn thời gian.
- Hiển thị rõ “đang xác nhận thanh toán”; không khẳng định thành công chỉ từ return URL.
- Test success, failed/cancelled, timeout, refresh trang và 401.

## 11. Rủi ro và việc cần chốt trước khi code

1. Backend đã có Swagger/OpenAPI tại `/swagger-ui.html` và `/api-docs`, nhưng controller chưa có đầy đủ tag/example/error/security annotation. Cần dùng spec làm source contract và bổ sung dần chất lượng mô tả.
2. `GET /api/bills/me/{id}` thiếu `PaymentResponse`, làm trang kết quả VNPay không biết payment status sau refresh.
3. Chat dùng `INVENTOR`, không khớp role `WAREHOUSE_KEEPER`; cần sửa enum/policy nhất quán.
4. `AuthResponse` và `UserResponse` đều thiếu role; nên thêm `role` vào một response chính thức.
5. API cart hiện thao tác tăng/giảm từng đơn vị; UI nhập số lượng cần gọi lặp hoặc backend bổ sung endpoint `PUT quantity`.
6. Chốt API refund trước khi thiết kế màn hình/CTA hoàn tiền.
7. Không có endpoint public liệt kê genre/category; UI filter `categoryId` không có dữ liệu để dựng filter.
8. Cần chốt nghĩa `DIRECT`; code hiện đánh dấu payment thành công lúc order `COMPLETED`, không phải lúc `CONFIRMED`.
9. Backend chưa có CORS allowlist; frontend chạy khác origin có thể không gọi API.
10. Checkout chưa có idempotency key; double-click/retry có nguy cơ tạo nhiều bill.
11. Không có admin user/role management, update/delete voucher hoặc customer cancel API; không được thiết kế CTA giả.
12. Vite SPA cần hosting rewrite mọi route về `index.html`; nếu thiếu, refresh `/orders/123` sẽ 404.
13. Profile request dùng `name/phone`, response dùng `fullName/phoneNumber`; generated types phải giữ đúng hai shape, không “đoán” cùng field.
14. Update book hiện yêu cầu `imgFile` multipart; UI edit không thể chỉ cập nhật metadata nếu backend không cho image optional.

## 12. Application architecture chi tiết

### 12.1 Provider và routing

```text
main.tsx
  → AppErrorBoundary
  → MonitoringProvider
  → QueryClientProvider
  → AuthProvider
  → RouterProvider
      ├─ PublicLayout
      │   ├─ Home
      │   ├─ Books
      │   └─ BookDetail
      ├─ GuestOnlyRoute
      │   ├─ Login/Register
      │   └─ Forgot/Reset password
      ├─ RequireAuth
      │   ├─ StorefrontLayout
      │   └─ Customer pages
      └─ RequireRole
          ├─ StaffLayout
          ├─ AdminLayout
          ├─ AccountantLayout
          └─ WarehouseLayout
```

Route guard chỉ cải thiện UX. Khi backend trả `403`, UI vẫn phải xử lý vì frontend không phải security boundary.

Quy tắc redirect:

- Guest vào private route → `/login?returnTo=<safe-relative-url>`.
- Login thành công → chỉ redirect tới relative URL nằm trong allowlist route; chống open redirect.
- Authenticated user vào `/login` → landing page theo role.
- Role không phù hợp → `/forbidden`, không redirect vòng lặp.
- Token hết hạn và refresh thất bại → clear session/query nhạy cảm rồi về login.

### 12.2 Import boundary

```text
app      → pages, features, shared, lib
pages    → features, shared, lib
features → shared, lib
shared   → lib
lib      → không import pages/features
```

Không cho:

- Component gọi endpoint bằng URL string.
- Page tự giữ cache server.
- Shared component biết `BillStatus`, `PaymentStatus` hoặc role business.
- Feature import file private sâu bên trong feature khác; nếu cần, export public API qua `index.ts`.
- Generated API type bị bọc lại bằng type giống hệt chỉ để đổi tên.

### 12.3 Query key convention

```ts
bookKeys.all
bookKeys.list(filters)
bookKeys.detail(bookId)
cartKeys.current()
orderKeys.mine(filters)
orderKeys.detail(billId)
dashboardKeys.summary()
```

Mutation phải invalidate tối thiểu:

| Mutation                          | Invalidate/refetch                                        |
| --------------------------------- | --------------------------------------------------------- |
| Add/increase/decrease/remove cart | `cartKeys.current()`                                    |
| Checkout                          | cart, vouchers, my orders; seed bill/payment từ response |
| Update order status               | order detail, order list, dashboard summary               |
| Create/update/delete review       | book detail, ratings/comments list                        |
| Import stock                      | book detail/list, inventory view                          |
| Create/update book                | admin list và public catalog liên quan                  |

## 13. API client, auth và error handling

### 13.1 Sinh type từ OpenAPI

Nguồn schema hiện tại:

```text
http://localhost:8080/api-docs
```

Scripts mục tiêu:

```json
{
  "scripts": {
    "api:generate": "openapi-typescript http://localhost:8080/api-docs -o src/lib/api/schema.d.ts",
    "api:check": "npm run api:generate && git diff --exit-code -- src/lib/api/schema.d.ts",
    "typecheck": "tsc -b",
    "test": "vitest",
    "test:ci": "vitest run --coverage",
    "test:e2e": "playwright test",
    "format": "prettier --write .",
    "format:check": "prettier --check ."
  }
}
```

CI tốt hơn nên dùng OpenAPI artifact cố định từ cùng backend commit/build, không phụ thuộc một server cá nhân đang chạy. Generated schema được commit hoặc tạo trong pipeline theo một quy ước duy nhất.

### 13.2 HTTP middleware

```text
request
  → gắn request ID phía client nếu cần
  → gắn Authorization Bearer cho endpoint private
  → gửi request
  → 2xx: unwrap ApiResponse.data
  → 401:
      nếu request không phải login/refresh và chưa retry
      → single-flight refresh (mọi request chờ cùng một Promise)
      → cập nhật token
      → retry đúng một lần
  → refresh fail:
      → clear session + private query cache
      → redirect login
  → 403/404/409/422/5xx:
      → normalize thành AppError có status/code/message/requestId/fieldErrors
```

Không retry tự động:

- Mutation POST/PATCH/DELETE, trừ khi có idempotency key và policy rõ.
- `400`, `401`, `403`, `404`, `409`.
- VNPay checkout redirect.

GET có thể retry 1–2 lần với exponential backoff khi network/5xx; không làm spinner vô hạn.

### 13.3 Cache policy khởi điểm

| Query                        | `staleTime` gợi ý | Refetch                                  |
| ---------------------------- | --------------------: | ---------------------------------------- |
| Catalog list/detail          |              60 giây | thay filter, focus tùy UX               |
| Similar recommendations      |               5 phút | theo book                                |
| Personalized recommendations |               1 phút | login/user thay đổi                    |
| Cart                         |           0–10 giây | sau mọi cart mutation                   |
| My orders/order detail       |              10 giây | focus và payment polling có giới hạn |
| Voucher                      |              30 giây | checkout/cancel                          |
| Dashboard                    |          30–60 giây | filter date/manual refresh               |

Đây là baseline; điều chỉnh bằng dữ liệu thực tế, không biến tất cả thành `staleTime: Infinity`.

### 13.4 Token storage

Backend hiện trả access/refresh token trong JSON. Phương án tương thích MVP:

- Access token giữ trong memory.
- Refresh token giữ trong `sessionStorage` qua storage adapter và xóa khi tab/session kết thúc.
- Không đưa token vào Redux devtools, query cache, URL, analytics hoặc error report.
- Không dùng `localStorage` cho long-lived token.

Phương án production tốt hơn là backend cấp refresh token qua cookie `HttpOnly`, `Secure`, `SameSite`; khi đó frontend không đọc refresh token. Nếu backend đổi sang cookie, phải thống nhất CORS credentials và CSRF policy.

### 13.5 Error UX

| Lỗi                  | UX                                                                          |
| --------------------- | --------------------------------------------------------------------------- |
| Network offline       | Banner/toast có retry; giữ dữ liệu form                                 |
| 400/validation        | Hiển thị field error gần input và summary khi cần                      |
| 401                   | Refresh silent một lần; thất bại mới đưa về login                   |
| 403                   | Forbidden page, không giả thành 404 nếu user cần biết thiếu quyền   |
| 404 resource          | Empty/not-found trong page                                                  |
| 409 business conflict | Inline alert, refetch data mới; ví dụ hết tồn/trạng thái order đổi |
| 5xx                   | Error boundary/page có request ID và retry an toàn                       |

Không hiển thị raw stack trace hoặc message kỹ thuật trực tiếp cho người dùng.

## 14. Cart và checkout strategy

### 14.1 Source of truth

Backend cart là source of truth cho user đã đăng nhập. Prototype `CartContext` + `localStorage` phải được thay bằng TanStack Query.

MVP hiện yêu cầu đăng nhập trước khi thêm vào cart:

```text
Guest bấm "Thêm vào giỏ"
  → chuyển login với returnTo
  → login thành công
  → user thực hiện lại add hoặc app replay intent an toàn một lần
```

Không tự merge local cart vào server vì backend chưa có bulk merge contract. Nếu business muốn guest cart, cần:

- Schema local cart có version và Zod validation.
- API bulk upsert/merge.
- Rule conflict cho giá, số lượng và sách hết hàng.
- Clear local cart chỉ sau khi server xác nhận merge.

### 14.2 Money

- Giá/tổng từ API là nguồn hiển thị cuối cùng tại checkout.
- Frontend có thể tính preview nhưng không xem đó là authoritative amount.
- Dùng `Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' })`.
- Không cộng tiền business bằng floating point nếu có phần thập phân; với VND hiện tại backend scale 0, vẫn ưu tiên amount server.
- Khi checkout trả tổng khác preview do giá/voucher/tồn thay đổi, hiển thị lại confirmation rõ ràng.

### 14.3 Chống double submit

- Disable nút checkout khi mutation pending.
- Không chỉ dựa vào disable; backend cần `Idempotency-Key`.
- Không cho hai checkout mutation chạy đồng thời trong cùng tab.
- Khi response timeout nhưng không biết server đã tạo bill chưa, không tự POST lại vô hạn; cần idempotency/status lookup.

### 14.4 Payment result

Target flow:

```text
checkout success
  → persist tối thiểu billId/paymentId/txnRef, không lưu paymentUrl lâu dài
  → redirect VNPay
  → backend nhận return, validate và redirect frontend
  → /payment/result đọc billId hợp lệ
  → query payment/order status
  → polling 2–3 giây, tối đa khoảng 30–60 giây
      ├─ SUCCEEDED/CONFIRMED → success
      ├─ FAILED/CANCELLED → failure
      └─ vẫn PENDING → "đang xác nhận", cho refresh thủ công
```

Polling phải dừng khi component unmount, trạng thái terminal hoặc hết timeout. Refresh trang vẫn khôi phục được bằng URL identifier không nhạy cảm và API ownership check.

## 15. Design system, responsive và accessibility

### 15.1 Design tokens

Các token Tailwind hiện tại là điểm khởi đầu nhưng cần chuẩn hóa:

```text
color: semantic (primary, surface, text, success, warning, error)
typography: font family, size, line-height, weight
spacing: 4/8/12/16/24/32/48
radius: sm/md/lg/full
shadow: card/popover/dialog
motion: duration/easing và prefers-reduced-motion
breakpoint: mobile/tablet/desktop
z-index: header/dropdown/modal/toast
```

Không dùng tên token gắn trực tiếp với một màn hình. Mọi màu trạng thái order/payment phải có text/icon, không chỉ dựa vào màu.

### 15.2 Component primitives P0

```text
Button, IconButton, Link
Input, Textarea, Select, Checkbox, Radio
FormField, FieldError
Dialog, AlertDialog, Drawer
DropdownMenu, Tabs
Badge/StatusBadge
Toast/InlineAlert
Skeleton, Spinner, EmptyState, ErrorState
Pagination
Money, DateTime, BookCover
DataTable hoặc responsive data list
```

Mỗi component có keyboard behavior, disabled/loading state, focus ring và accessible name.

### 15.3 Responsive baseline

| Viewport     | Yêu cầu                                                         |
| ------------ | ----------------------------------------------------------------- |
| 360–479 px  | Không overflow ngang; CTA cart/checkout reachable; filter drawer |
| 480–767 px  | Grid 2 cột khi đủ; form một cột                              |
| 768–1023 px | Tablet navigation; table cân nhắc card/scroll                   |
| ≥1024 px    | Storefront grid/sidebar; back-office sidebar/table                |

Test tối thiểu 360×800, 768×1024, 1280×800 và 1440×900.

### 15.4 Accessibility

- Mục tiêu WCAG 2.1 AA cho MVP.
- Có skip link, landmark `header/nav/main/footer`, heading hierarchy.
- Input có label; error liên kết bằng `aria-describedby`.
- Icon-only button có accessible name.
- Dialog trap focus, đóng bằng Escape và trả focus về trigger.
- Không xóa outline; focus visible rõ.
- Touch target khoảng 44×44 px cho action chính.
- Live region cho cart update/toast quan trọng nhưng không spam screen reader.
- Hỗ trợ keyboard toàn bộ cart, checkout, menu và table actions.
- Tôn trọng `prefers-reduced-motion`.
- Axe chỉ bắt được một phần; cần manual keyboard và screen-reader smoke.

## 16. SEO, performance và browser support

### 16.1 Quyết định SEO

Vite SPA phù hợp để hoàn thành MVP nhanh nhưng public catalog có hạn chế:

- Initial HTML ít nội dung cho crawler không chạy JavaScript.
- Metadata động và social preview khó hơn.
- Time-to-content phụ thuộc JS và API.

Trước Sprint Storefront, PO/Tech Lead phải chọn:

1. SPA MVP: chấp nhận SEO hạn chế; dùng semantic HTML, React 19 metadata, sitemap/static landing cơ bản.
2. React Router Framework Mode với prerender/SSR cho home/catalog/detail.
3. Chuyển framework khác chỉ khi có KPI SEO rõ và trước khi code mở rộng.

Không dùng RSC experimental cho MVP.

### 16.2 Performance budget

Mục tiêu field ở percentile 75:

- LCP ≤ 2.5 giây.
- INP ≤ 200 ms.
- CLS ≤ 0.1.

Budget khởi điểm:

- Initial storefront JS gzip: mục tiêu ≤ 200–250 KB, kiểm tra lại sau khi chọn UI/chart.
- Back-office và chart không nằm trong initial storefront chunk.
- Route-level lazy loading.
- Ảnh bìa có width/height hoặc aspect ratio để tránh layout shift.
- Cloudinary responsive transformations, AVIF/WebP khi hỗ trợ.
- `loading="lazy"` cho ảnh dưới fold; hero/LCP image được ưu tiên có kiểm soát.
- Search debounce khoảng 300 ms và hủy request cũ.
- Không render hàng nghìn row; luôn pagination, chỉ virtualize khi có dữ liệu chứng minh cần.

### 16.3 Browser support

Baseline đề xuất cho MVP:

- Hai phiên bản mới nhất của Chrome/Edge/Firefox.
- Safari/iOS Safari 15.4+.
- Android Chrome hiện đại.

Nếu business cần browser cũ hơn, phải thêm browserslist/polyfill strategy và test matrix; không mặc định transpile vô hạn.

## 17. Testing strategy

### 17.1 Test pyramid

| Lớp               | Công cụ                          | Phạm vi                                                  |
| ------------------ | ---------------------------------- | --------------------------------------------------------- |
| Unit               | Vitest                             | Formatter, schema, query key, state/status mapping        |
| Component          | RTL + user-event                   | Form, cart item, status actions, loading/error/permission |
| Integration UI/API | RTL + MSW                          | Query/mutation, refresh flow, 409 conflict, pagination    |
| Accessibility      | axe + manual                       | Route chính/component overlay                            |
| E2E                | Playwright                         | Hành trình qua browser/backend test environment         |
| Visual             | Playwright screenshot/Storybook P1 | Layout và component quan trọng                          |

### 17.2 E2E P0

- Guest xem/search/filter sách và mở chi tiết.
- Register/login/logout/refresh fail.
- User thêm/tăng/giảm/xóa cart.
- Checkout DIRECT tạo bill; kiểm tra payment/order theo behavior đã được PO chốt; double-click không tạo request lặp từ UI.
- Checkout VNPay: redirect contract mocked, pending/success/failure/timeout/refresh.
- User xem đơn của mình; 403/404 được xử lý đúng.
- Staff chuyển trạng thái hợp lệ, nhận 409 khi stale state.
- Admin tạo/sửa sách với upload validation.
- Accountant đổi khoảng ngày và xem chart/table.
- Warehouse import số lượng hợp lệ/không hợp lệ.
- Route guard cho từng role và unknown role.

### 17.3 Nguyên tắc test

- Test hành vi người dùng, không test internal hook implementation.
- MSW mock network thay vì mock Axios/fetch function sâu.
- Fixture deterministic, không phụ thuộc production.
- Không snapshot toàn page khổng lồ.
- E2E dùng selector theo role/label; `data-testid` là lựa chọn cuối.
- Không đặt coverage 100%; ưu tiên branch của auth, cart, checkout, status mapping.

## 18. Security, privacy và observability

### 18.1 Frontend security

- Không xem route guard là authorization.
- Không render HTML không tin cậy bằng `dangerouslySetInnerHTML`.
- Validate URL ảnh/redirect; chỉ cho protocol/domain phù hợp.
- `returnTo` phải là relative route nội bộ.
- Không lưu/log JWT, refresh/reset token, VNPay params nhạy cảm.
- Upload kiểm tra loại/kích thước ở client để UX tốt; backend vẫn phải kiểm tra lại.
- Production cần CSP, HTTPS, `frame-ancestors`, referrer policy và security headers ở hosting/reverse proxy.
- Dependency audit và secret scan trong CI.

### 18.2 Error monitoring

Mỗi error event có thể chứa:

```text
release, environment, route, browser
requestId/traceId từ backend
feature/action
sanitized error code/status
```

Không gửi:

```text
password, JWT, refresh/reset token
full address/phone/email nếu không cần
VNPay secure hash hoặc raw callback query
book review draft/private form content
```

### 18.3 Analytics

Chỉ thêm analytics khi có owner và privacy policy. Event gợi ý:

```text
view_book_list, search_books, view_book
add_to_cart, begin_checkout
checkout_created, payment_redirected
payment_result_viewed
```

Không dùng analytics làm nguồn xác nhận revenue/payment. Tránh gửi PII và không ghi raw search nếu policy không cho phép.

## 19. Environment, build, hosting và CI

### 19.1 Environment

`.env.example` mục tiêu:

```text
VITE_API_BASE_URL=http://localhost:8080
VITE_WS_BASE_URL=ws://localhost:8080
VITE_APP_ENV=local
VITE_MONITORING_DSN=
VITE_ANALYTICS_ENABLED=false
```

Mọi `VITE_*` đều xuất hiện trong client bundle; không đặt secret. Validate env bằng Zod lúc khởi động và fail fast với message rõ.

### 19.2 Scripts/quality gate

Pull request phải chạy:

```text
npm ci
  → npm run format:check
  → npm run lint
  → npm run typecheck
  → npm run api:check
  → npm run test:ci
  → npm run build
  → Playwright smoke trên preview/test environment
```

Baseline hiện tại chưa đạt: `npm.cmd run build` đang lỗi TypeScript vì `setIsError` không dùng và thiếu module local `@tailwindcss/vite`. Phase 0 phải sửa dependency install/baseline trước khi đặt quality gate.

### 19.3 Hosting

- Build artifact immutable; staging và production dùng cùng artifact nếu runtime config strategy cho phép.
- Static host/reverse proxy rewrite unknown non-asset route về `index.html`.
- Asset fingerprint cache dài; `index.html` cache ngắn/no-cache.
- Không cache HTML payment result chứa state nhạy cảm.
- HTTPS bắt buộc; API/WebSocket URL đúng scheme.
- Có preview environment cho PR lớn.
- Source map production chỉ upload cho monitoring hoặc hạn chế public theo policy.

## 20. Migration từ prototype hiện tại

Thứ tự an toàn:

1. Khôi phục dependency bằng `npm ci`; sửa build đỏ.
2. Thêm scripts format/typecheck/test; pin Node version bằng `.nvmrc` hoặc Volta.
3. Tạo router và `PublicLayout`; thay placeholder `<a>` bằng router `Link`.
4. Tạo QueryClient và generated OpenAPI client.
5. Tạo auth/session single-flight refresh và route guards.
6. Di chuyển Header/Footer vào `shared/layouts` hoặc `shared/components`.
7. Di chuyển cart UI vào `features/cart`; thay `CartContext/localStorage` bằng API query/mutation.
8. Sửa accessibility, invalid image URL, money formatter và handlers.
9. Thêm MSW + component tests trước khi mở rộng page.
10. Implement catalog → checkout/orders → back-office theo sprint.

Không xóa prototype hàng loạt trước khi component mới có route/test thay thế.

## 21. Definition of Ready

Một frontend story sẵn sàng để code khi:

- Có user/role và business outcome.
- Có route/wireframe hoặc component state rõ.
- API tồn tại trong OpenAPI hoặc có MSW contract đã được backend thống nhất.
- Có loading/empty/error/permission/disabled states.
- Có acceptance criteria responsive và accessibility.
- Dependency backend/blocker được gán owner.
- Đã xác định analytics/monitoring event nếu cần.

## 22. Quyết định cần PO/Tech Lead chốt

1. SEO có phải KPI của MVP không; SPA hay SSR/prerender?
2. `DIRECT` là thanh toán tại quầy hay COD khi giao thành công?
3. Guest có cart không, hay bắt buộc login trước add-to-cart?
4. Sau VNPay return, backend redirect về frontend bằng identifier nào?
5. Backend sẽ cung cấp payment status cho bill qua endpoint nào?
6. Role `CLONE` là gì và có xuất hiện production không?
7. STAFF hay WAREHOUSE_KEEPER dùng chat?
8. Operator account có được sử dụng customer cart/checkout không?
9. Browser/device support tối thiểu?
10. Có cần analytics/cookie consent không?
11. Ai sở hữu design approval và component library?
12. Refund/customer cancel thuộc phase nào?

## 23. Tài liệu và nguồn liên quan

- `docs/backend-kickoff.md`
- `docs/vnpay-payment-flow.md`
- Swagger UI: `http://localhost:8080/swagger-ui.html`
- OpenAPI JSON: `http://localhost:8080/api-docs`
- React Router modes: [https://reactrouter.com/start/modes](https://reactrouter.com/start/modes)
- TanStack Query: [https://tanstack.com/query/latest/docs/framework/react/installation](https://tanstack.com/query/latest/docs/framework/react/installation)
- OpenAPI TypeScript: [https://openapi-ts.dev/introduction](https://openapi-ts.dev/introduction)
- Vitest: [https://vitest.dev/guide/](https://vitest.dev/guide/)
- React Testing Library: [https://testing-library.com/docs/react-testing-library/intro/](https://testing-library.com/docs/react-testing-library/intro/)
- MSW: [https://mswjs.io/](https://mswjs.io/)
- Playwright accessibility: [https://playwright.dev/docs/accessibility-testing](https://playwright.dev/docs/accessibility-testing)
- Core Web Vitals: [https://web.dev/articles/vitals](https://web.dev/articles/vitals)

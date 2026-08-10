# Code Review: feature/book, feature/user & Customer Pages

## Tổng quan

Code nhìn chung **khá sạch và có cấu trúc tốt** — phân tách rõ ràng giữa service, hook, component và page. Tuy nhiên còn một số điểm cần cải thiện.

---

## ✅ Điểm tốt

| Hạng mục | Nhận xét |
|---|---|
| **Phân tách trách nhiệm** | Service → Hook → Page rõ ràng, tuân theo Feature-Sliced Design |
| **React Query** | Sử dụng đúng `useQuery`/`useMutation`, có `staleTime`, có query key factory |
| **Type safety** | DTO → Domain Model transform rõ ràng (`transformBookResponse`, `transformUserResponse`) |
| **Error & Loading states** | Xử lý đủ 3 trạng thái: loading / error / empty trong tất cả các trang |
| **Skeleton loading** | Có animate-pulse skeleton cho tất cả trang, UX tốt |
| **index.ts barrel exports** | Đã có barrel file cho components và hooks |
| **Callback handlers** | `useCallback` được dùng đúng chỗ trong `useBookCatalog` |
| **Responsive design** | Đã có breakpoint `md:` và `lg:` cho hầu hết layout |
| **Accessibility** | `<article>`, `<nav>`, `<section>`, `loading="lazy"` — semantic HTML tốt |

---

## 🔴 Vấn đề nghiêm trọng

### 1. `BookDetailPage` — `handleAddToCart` & `handleBuyNow` chỉ `console.log`

```tsx
// BookDetailPage.tsx L22-28
const handleAddToCart = () => {
  console.log('Add to cart:', { bookId: book?.id, quantity }); // ❌ chưa implement
};
const handleBuyNow = () => {
  console.log('Buy now:', { bookId: book?.id, quantity }); // ❌ chưa implement
};
```

**Vấn đề:** Người dùng click "Thêm vào giỏ" / "Mua ngay" không có gì xảy ra. Đây là tính năng cốt lõi.

**Fix:** Kết nối với `useAddToCart` hook (nếu đã có trong feature/cart).

---

### 2. `useBookCatalog` — Filter URL không đồng bộ hoàn toàn

```ts
// useBookCatalog.ts L28-47
useEffect(() => {
  const categoryId = searchParams.get('categoryId');
  // ...
}, [searchParams]);
```

**Vấn đề:** State filter (categories, keyword, sort) chỉ được *khởi tạo* từ URL một lần, sau đó không sync ngược lại. Nếu người dùng share link, bạn bè mở ra sẽ thấy đúng kết quả nhưng **khi bấm back/forward, filter không khớp URL**. Phải chọn một trong hai: toàn bộ state trên URL params, hoặc dùng local state thuần.

---

### 3. `useBookCatalog` — Multi-category filter bị hardcode single

```ts
// useBookCatalog.ts L55
categoryId: categories.length === 1 ? categories[0] : undefined,
```

**Vấn đề:** Nếu user chọn nhiều category, request sẽ không có `categoryId` nào, kết quả sẽ là **toàn bộ sách** — sai logic. Nên chỉ cho phép chọn 1 category hoặc fix API để nhận multi-value.

---

### 4. `useBookReviews` — Query key thiếu `page`/`size`

```ts
// useBookReviews.ts L15
queryKey: reviewQueryKeys.comments(bookId), // ❌ không có page, size
queryFn: () => commentService.getPublicComments({ page, size, bookId }),
```

**Vấn đề:** Query key không phản ánh `page`/`size` params. Nếu gọi `useBookComments(1, 0, 5)` và `useBookComments(1, 1, 5)` sẽ trả về **cùng cached data** (page 0). Dẫn đến pagination reviews bị sai.

**Fix:**
```ts
queryKey: reviewQueryKeys.comments(bookId, page, size),
```

---

### 5. `ProfilePage` — Logout dùng `window.location.href` thay vì `useNavigate`

```tsx
// ProfilePage.tsx L15
window.location.href = '/login'; // ❌ reload toàn trang, mất React state/cache
```

**Fix:**
```tsx
const navigate = useNavigate();
// trong onSuccess:
navigate('/login');
```

---

## 🟡 Vấn đề trung bình

### 6. `BookCatalogPage` — `Pagination` component bị duplicate với `SectionPager`

`BookCatalogPage` có component `Pagination` riêng (L285-322) trong khi `BookListSection` dùng `SectionPager` từ `components/common`. Hai component này có logic tương đồng — **nên dùng chung một component**.

---

### 7. `BookCatalogPage` — Error UI bị duplicate với `BookListSection`

```tsx
// BookCatalogPage.tsx L118-128
{isError && (
  <div className="bg-error-container ...">...</div>  // copy-paste giống BookListSection
)}
```

Nên extract ra `<ErrorMessage />` hoặc `<ErrorBanner />` dùng chung.

---

### 8. `bookService.ts` — Type alias thừa

```ts
// bookService.ts L5-8 — không cần thiết
export type BookResponseDTO = BookResponse;
export type PageResponseDTO<T> = PageResponse<T>;
export type ApiResponseDTO<T> = ApiResponse<T>;
export type GetBooksQueryParams = BookListQuery;
```

Các type alias này chỉ wrap lại type gốc mà không thêm gì. Nên import trực tiếp từ `types/api/*` hoặc re-export tập trung ở một chỗ.

---

### 9. `bookService.ts` — `getBestsellerBooks` vs `getHotBooks` giống nhau

```ts
getBestsellerBooks: async (page = 0, size = 4) => 
  bookService.getPublicBooks({ page, size, sort: 'buyCount,desc' }), // ✅
  
getHotBooks: async (page = 0, size = 3) => 
  bookService.getPublicBooks({ page, size, sort: 'buyCount,desc' }), // ❌ trùng logic
```

Hai method cùng sort `buyCount,desc`, khác nhau chỉ ở `size` default. Gây nhầm lẫn — nên xóa `getHotBooks` và chỉ dùng `getBestsellerBooks` với `size` param.

---

### 10. `BookDetailPage` — Hardcode "Số trang: Chưa cập nhật"

```tsx
// BookDetailPage.tsx L175-177
<span className="text-on-surface-variant">Số trang:</span>
<span className="ml-2 text-on-surface font-medium">Chưa cập nhật</span> // ❌ hardcode
```

Field `pageCount` không có trong `Book` interface. Nên thêm vào model hoặc xóa row này.

---

### 11. `BookDetailPage` — Import `Star` từ lucide nhưng không dùng

```tsx
// BookDetailPage.tsx L3
import { ChevronRight, Minus, Plus, ShoppingCart, Zap, Star } from 'lucide-react';
//                                                              ^^^^ không dùng
```

Star icon được render bằng `material-symbols-outlined` thay vì lucide. Import thừa.

---

### 12. `BookDetailPage` — Breadcrumb dùng `?category=` thay vì `?categoryId=`

```tsx
// BookDetailPage.tsx L82
to={`/books?category=${book.genres[0]}`}  // ❌ sai param name
```

`useBookCatalog` đọc `searchParams.get('categoryId')`, nhưng breadcrumb truyền `?category=`. Link sẽ không filter được gì.

---

### 13. `ProfilePage` — Alert success/error dùng màu hardcode không theo design system

```tsx
// ProfilePage.tsx L236, 239
<div className="p-3 bg-green-50 text-green-700 ...">  // ❌ hardcode Tailwind green
<div className="p-3 bg-red-50 text-red-700 ...">      // ❌ hardcode Tailwind red
```

Nên dùng token của design system: `bg-tertiary-container text-on-tertiary-container` và `bg-error-container text-on-error-container`.

---

### 14. `useUserProfile` — Dùng `tokenStorage` để check auth thay vì context

```ts
// useUserProfile.ts L11
const token = tokenStorage.getAccessToken();
// ...
enabled: !!token,
```

Nếu project đã có `AuthContext`, nên dùng `useAuth()` để check `isAuthenticated` thay vì trực tiếp đọc storage từ hook.

---

## 🟢 Gợi ý nhỏ (nice-to-have)

### 15. `BookCard` — Thiếu `aria-label` cho action buttons

```tsx
// BookCard.tsx L77-90
<button onClick={handleAddToCart} ...>  // thiếu aria-label
<Link to={...} ...>                     // thiếu aria-label
```

Thêm `aria-label="Thêm vào giỏ hàng"` và `aria-label="Xem chi tiết sách"`.

---

### 16. `BookListSection` — Template literal với dynamic class không an toàn với Tailwind purge

```tsx
// BookListSection.tsx L57
className={`grid grid-cols-2 md:grid-cols-${columns} gap-gutter`}
// ❌ md:grid-cols-3, md:grid-cols-4 sẽ bị purge trong production
```

Dùng object map giống `BookGrid.tsx` (đúng pattern):
```tsx
const gridCols = { 2: 'md:grid-cols-2', 3: 'md:grid-cols-3', 4: 'md:grid-cols-4' };
```

---

### 17. `ChangePasswordForm` — `confirmPassword` không gửi lên server

```ts
// ProfilePage.tsx L275
changePasswordMutation.mutate(formData); // formData có confirmPassword
// userService.changePassword nhận ChangePasswordRequest — cần kiểm tra type có confirmPassword không
```

Nếu `ChangePasswordRequest` không có `confirmPassword`, sẽ gửi field thừa lên server.

---

## Tổng kết

| Mức độ | Số lượng |
|---|---|
| 🔴 Nghiêm trọng | 5 |
| 🟡 Trung bình | 9 |
| 🟢 Nice-to-have | 3 |

**Ưu tiên fix ngay:** #1 (Add to Cart chưa implement), #4 (query key reviews sai), #12 (breadcrumb param sai), #2 (URL sync), #5 (navigate thay window.location).

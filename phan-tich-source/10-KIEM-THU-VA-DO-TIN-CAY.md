# 10 — Kiểm thử và độ tin cậy

> [← Mục lục](00-MUC-LUC.md) · [← 09 Hiệu năng](09-HIEU-NANG-VA-KHA-NANG-MO-RONG.md) · Tiếp theo: [11 — Triển khai và vận hành →](11-TRIEN-KHAI-VA-VAN-HANH.md)

## 1. Hiện trạng kiểm thử

| Hạng mục | Hiện trạng | Bằng chứng |
|---|---|---|
| Unit test | ❌ Không có | Không có file `*.test.*`, `*.spec.*`, thư mục `__tests__` |
| Integration / API test | ❌ Không có | Không có `supertest` hay công cụ tương tự trong dependencies |
| E2E test | ❌ Không có | Không có Playwright hay Cypress |
| Script `test` | ❌ Không có | [backend/package.json](../backend/package.json#L5-L7), [frontend/package.json](../frontend/package.json#L6-L11) |
| Lint frontend | 🟡 Có cấu hình | [eslint.config.js](../frontend/eslint.config.js): `js.configs.recommended`, `react-hooks`, `react-refresh` |
| Lint backend | ❌ Không có | Không có cấu hình ESLint trong `backend/` |
| CI | ❌ Không có | Không có `.github/workflows` hay file CI nào |
| Kiểm thử thủ công | 🟡 Có (theo README) | README nhắc Postman, nhưng repo không có Postman collection |
| Type checking | ❌ Không có | JavaScript thuần, không có JSDoc type hay PropTypes |

## 2. Chất lượng và độ bao phủ thực tế

- **Độ bao phủ tự động: 0%.**
- **Lint có vẻ chưa được chạy thường xuyên.** Cấu hình `js.configs.recommended` có rule `no-undef` và `no-unused-vars`. Nếu chạy `pnpm lint`, nhiều khả năng lint sẽ báo:
  - `toast` chưa định nghĩa trong [LogInPage.jsx](../frontend/src/Pages/LogInPage.jsx#L17) (ERR-008);
  - `authUser` chưa định nghĩa trong [useAuthStore.js:73](../frontend/src/zustand/useAuthStore.js#L73) (ERR-004);
  - nhiều biến không dùng (`get`, `res`, `e`, `React`…) (CODE-001).

  > ❓ Chưa chạy được lint để xác nhận (repo không có `node_modules`). Tuy vậy, chỉ riêng việc hai lỗi `ReferenceError` còn tồn tại đã là dấu hiệu mạnh cho thấy lint không nằm trong quy trình làm việc.

- **Kiểm thử thủ công chỉ đi happy path.** Các lỗi trong báo cáo chủ yếu nằm ở nhánh lỗi, dữ liệu bất thường, **chuỗi thao tác nhiều bước** (lưu rồi chuyển trang) hoặc **môi trường khác** (Linux, F5). Đây là những thứ khó phát hiện khi chỉ bấm thử từng màn hình một.

## 3. Những luồng quan trọng chưa được kiểm thử

Bảng dưới đối chiếu từng luồng quan trọng với **lỗi đã tồn tại mà một test đơn giản có thể bắt được**. Đây là lập luận mạnh nhất cho việc viết test.

| # | Luồng | Mức rủi ro | Lỗi mà test sẽ bắt được | Loại test phù hợp |
|---|---|---|---|---|
| 1 | Khởi động server trên Linux | Critical | ERR-001 (import sai hoa/thường) | CI chạy trên Ubuntu (chỉ cần `node -e "import('./src/app.js')"` hoặc một test bất kỳ) |
| 2 | Lưu job rồi mở trang Saved | High | ERR-002 (crash do shape) | Unit test store + E2E |
| 3 | Bookmark trỏ tới job không tồn tại | High | DB-001 | API test + component test |
| 4 | Đăng nhập sai | High | SEC-002 (thông báo khác nhau), ERR-003 (không hiển thị) | API test + E2E |
| 5 | Lọc theo lương, khu vực | High / Medium | BIZ-001, BIZ-002 | API test với dữ liệu seed |
| 6 | Token hết hạn | Medium | ERR-006 (500 thay vì 401) | API test |
| 7 | F5 ở trang được bảo vệ | Medium | ERR-005 | E2E |
| 8 | Đổi avatar | Medium | ERR-004 | Unit test store |
| 9 | Lưu trùng đồng thời | Medium | DB-002 | API test gửi 2 request song song |
| 10 | Request thiếu body hoặc sai kiểu | Medium | VAL-001 | API test |
| 11 | Hiển thị lương, deadline, link | Medium | BIZ-003, BIZ-004, BIZ-009 | Component test |
| 12 | Job hết hạn | Medium | BIZ-005 | API test |
| 13 | Xoá bookmark của người khác | (đang đúng) | Test hồi quy, **bảo vệ điểm đang làm tốt** | API test |

## 4. Đề xuất kiểm thử (vừa sức, theo thứ tự lợi ích / công sức)

### 4.1. Chuẩn bị (một lần)

| Việc | Lý do |
|---|---|
| Tách `backend/src/app.js` (tạo và export `app`) khỏi `server.js` (connect DB và `listen`) | Để `supertest` gọi `app` mà không cần mở cổng thật |
| Backend: `vitest` hoặc `jest` + `supertest` + `mongodb-memory-server` | Test API với MongoDB thật chạy trong bộ nhớ, không đụng DB dev |
| Frontend: `vitest` + `@testing-library/react` + `jsdom` | Cùng hệ sinh thái Vite |
| E2E: `@playwright/test` | Kiểm tra luồng nhiều bước trên trình duyệt thật |
| ESLint cho backend | Bắt `no-undef`, `no-unused-vars` |

### 4.2. Integration test cho API (ưu tiên cao nhất)

Mỗi test dưới đây tương ứng với một lỗi hoặc một hành vi cần giữ:

| Nhóm | Test case | Kỳ vọng |
|---|---|---|
| Auth | Signup hợp lệ | 201, có `Set-Cookie: token`, cookie `HttpOnly` |
| Auth | Signup email trùng (khác hoa/thường) | 409 |
| Auth | Signup `password` là số | 400 (không phải 500) |
| Auth | Login email không tồn tại **và** login sai mật khẩu | **Cùng** status, **cùng** message |
| Auth | Login với `email` là object | 400 |
| Auth | Gọi route bảo vệ không có cookie / token sai / token hết hạn | 401 cho cả ba trường hợp |
| Auth | POST login không có body | 400, response là JSON (không phải HTML stack trace) |
| Jobs | `GET /jobs` không trả job hết hạn / `isActive: false` | Đúng |
| Jobs | Lọc `region`, `salary` | Trả đúng tập con |
| Jobs | `page=2` | Trả phần tiếp theo; có `totalPages` |
| Jobs | `city=(` | 400 hoặc kết quả rỗng, **không** 500 |
| Bookmark | Save job không tồn tại | 404 |
| Bookmark | Save id sai định dạng | 400 |
| Bookmark | Save trùng (tuần tự và song song) | 409; DB chỉ có 1 bản ghi |
| Bookmark | Response của save có `jobId.title` | Đúng shape đã thống nhất |
| Bookmark | User B xoá bookmark của user A | 404, bản ghi vẫn còn (**test hồi quy cho điểm đang làm tốt**) |
| Profile | `profilePic: false` | 400 trong thời gian ngắn (không treo) |

**Ví dụ minh hoạ** (chỉ để tham khảo, không phải code của dự án):

```js
it("login trả cùng thông báo cho email sai và mật khẩu sai", async () => {
  await request(app).post("/api/auth/signup").send({ fullName: "A", email: "a@x.com", password: "secret123" });
  const r1 = await request(app).post("/api/auth/login").send({ email: "no@x.com", password: "secret123" });
  const r2 = await request(app).post("/api/auth/login").send({ email: "a@x.com",  password: "wrong-pass" });
  expect(r1.status).toBe(401);
  expect(r2.status).toBe(r1.status);
  expect(r2.body).toEqual(r1.body);
});
```

### 4.3. Unit test

| Đối tượng | Test case |
|---|---|
| `buildJobQuery(query)` (hàm thuần tách từ controller search) | Chuyển đúng mảng, bỏ qua filter rỗng, escape ký tự đặc biệt, giới hạn số phần tử |
| `formatSalary` (frontend) | `{1200, 2000, USD, month}` hiển thị ra `$1,200 – $2,000 / month`; SGD; theo giờ |
| `jobsStore.saveJob` (mock API) | Sau khi lưu, **mọi** phần tử trong `savedJobs` có `jobId.title` |
| `useAuthStore.updateProfile` | `authUser` vẫn là object, chỉ `profilePic` thay đổi |
| `useAuthStore` trạng thái đầu | `isCheckingAuth === true` |
| Hàm validate form | Rỗng, sai email, mật khẩu ngắn |

### 4.4. Component test

| Component | Test case |
|---|---|
| `SavedjobsPage` | Có phần tử `jobId: null` thì không crash, hiển thị "tin không còn tồn tại" |
| `JobCard` | Link "View Job" có `href` bằng `sourceUrl` (BIZ-009) |
| `JobCard` | Hiển thị lương đúng định dạng (BIZ-003) |
| `SavedJobCard` | Deadline lấy từ `expiredAt` (BIZ-004) |
| `LogInPage` | Submit form rỗng thì hiển thị thông báo lỗi (ERR-008, ERR-003) |

### 4.5. E2E (chỉ 3–4 kịch bản quan trọng nhất)

1. **Đăng ký → đăng nhập → lưu job → mở Saved Jobs → thấy job → xoá.** Bắt ERR-002.
2. **Đăng nhập → vào `/savedJobs` → F5 → vẫn ở `/savedJobs`.** Bắt ERR-005.
3. **Đăng nhập sai mật khẩu → thấy thông báo lỗi.** Bắt ERR-003.
4. **Chọn filter → Search → kết quả thay đổi.** Bắt BIZ-001, BIZ-002.

### 4.6. CI tối thiểu

```yaml
# .github/workflows/ci.yml (minh hoạ)
on: [push, pull_request]
jobs:
  test:
    runs-on: ubuntu-latest        # ← Linux, sẽ bắt được ERR-001 ngay
    steps:
      - uses: actions/checkout@v4
      - uses: pnpm/action-setup@v4
      - uses: actions/setup-node@v4
        with: { node-version: 20, cache: pnpm }
      - run: pnpm install --frozen-lockfile
        working-directory: backend
      - run: pnpm lint && pnpm test
        working-directory: backend
      - run: pnpm install --frozen-lockfile && pnpm lint && pnpm test && pnpm build
        working-directory: frontend
```

## 5. Edge case cần bổ sung

| Nhóm | Edge case |
|---|---|
| Dữ liệu đầu vào | Body rỗng; sai `Content-Type`; trường là `null`/số/mảng/object; chuỗi rất dài; email có khoảng trắng hoặc chữ hoa; ký tự Unicode (tiếng Việt có dấu) trong filter |
| ID | ObjectId sai định dạng; ObjectId hợp lệ nhưng không tồn tại; id của người khác |
| Trạng thái | Job hết hạn; job `isActive: false`; job bị xoá sau khi được lưu; user bị xoá khi token còn hạn |
| Đồng thời | Double-click Save; 2 tab cùng lưu; đăng ký cùng email đồng thời |
| Phân trang | `page=0`, `page=-1`, `page=abc`, `page` vượt `totalPages` |
| Upload | Không chọn file (huỷ hộp thoại); file không phải ảnh; ảnh > 7,5MB; mạng rớt giữa chừng |
| Thời gian | Token hết hạn giữa phiên; `expiredAt` đúng thời điểm hiện tại; hiển thị ngày theo múi giờ (hiện `createdAt.split("T")[0]` là ngày **UTC**) |
| Môi trường | Linux (hoa/thường); Windows (thư mục có dấu cách); thiếu biến môi trường; Safari với cookie `Secure` trên localhost |

## 6. Khả năng phục hồi khi thành phần bên ngoài gặp lỗi

| Thành phần lỗi | Hành vi hiện tại | Đánh giá | Cải thiện vừa sức |
|---|---|---|---|
| **MongoDB không kết nối được lúc khởi động** | Log lỗi rồi `process.exit(1)` ([connectDB.js:11-14](../backend/src/utils/connectDB.js#L11-L14)), nhưng server **đã listen** trước đó | 🟡 *Fail fast* là đúng; thứ tự listen/connect thì sai | Connect xong mới listen; để nền tảng tự restart |
| **MongoDB mất kết nối khi đang chạy** | Mongoose buffer lệnh (mặc định ~10 giây) rồi báo lỗi; controller trả 500 | 🟡 Chấp nhận được | Health check `/healthz` kiểm tra `mongoose.connection.readyState` |
| **Cloudinary lỗi / chậm** | Controller trả 500; không đặt timeout; frontend vẫn hiện preview như thể thành công | 🟠 Người dùng hiểu sai trạng thái | Chỉ hiện ảnh mới khi server xác nhận; hiển thị lỗi |
| **Clerk: thiếu publishable key** | `ClerkProvider` ném lỗi, **toàn bộ app không render** | 🔴 Một tính năng phụ làm sập cả ứng dụng | Gỡ Clerk hoặc chỉ bọc quanh phần cần (ARCH-001) |
| **Clerk: không tải được script** | ❓ Chưa đủ dữ liệu (phụ thuộc hành vi nội bộ của SDK) | — | Kiểm thử bằng cách chặn domain Clerk trong DevTools |
| **Backend không phản hồi** | Axios **không đặt timeout**, request treo và spinner quay mãi | 🟠 | `timeout: 10000` trong axios instance; UI có trạng thái lỗi và nút "Thử lại" |
| **Backend trả lỗi** | Store gọi `toast.error`, nhưng không có `<Toaster/>` nên không hiển thị gì | 🔴 ERR-003 | Thêm Toaster |
| **Lỗi render do dữ liệu bất thường** | Không có ErrorBoundary, trắng toàn app | 🔴 | ErrorBoundary quanh route |
| **Token hết hạn** | 500, store đặt `authUser = null`, app chuyển về `/login` | 🟡 Kết quả cuối vẫn đúng, nhưng sai lý do và hiện thông báo "Server Error" | 401 + thông báo "Phiên đăng nhập đã hết hạn" |
| **Thiếu biến môi trường** | Lỗi muộn; thiếu `JWT_SECRET` thì crash tiến trình (ERR-007) | 🟠 | Kiểm tra toàn bộ env khi khởi động |
| **Deploy trong lúc có request** | Không xử lý `SIGTERM`, request đang chạy bị cắt | 🟡 | `server.close()` + `mongoose.disconnect()` khi nhận `SIGTERM` |

> **Nhận xét:** hệ thống hiện chưa có cơ chế nào để **cô lập lỗi**. Lỗi của một thành phần (Clerk, một bản ghi mồ côi, một biến môi trường) lan ra thành lỗi toàn cục. Bốn "cầu chì" rẻ nhất cần thêm theo thứ tự là: **Toaster, ErrorBoundary, timeout cho axios, kiểm tra env khi khởi động**. Cả bốn đều chỉ mất vài dòng code.

## 7. Definition of Done gợi ý cho mỗi tính năng

- [ ] Có ít nhất 1 test cho happy path và 1 test cho nhánh lỗi quan trọng nhất
- [ ] Response API đúng shape đã thống nhất, và được ghi trong bảng API
- [ ] Lỗi hiển thị được cho người dùng (đã kiểm tra bằng mắt)
- [ ] `pnpm lint` sạch ở cả frontend và backend
- [ ] CI xanh trên Linux
- [ ] Đã thử F5 và điều hướng qua lại giữa các trang liên quan

# 05 — Danh sách lỗi và rủi ro

> [← Mục lục](00-MUC-LUC.md) · [← 04 Module & luồng dữ liệu](04-PHAN-TICH-MODULE-VA-LUONG-DU-LIEU.md) · Tiếp theo: [06 — Chất lượng code →](06-CHAT-LUONG-CODE.md)

## Cách đọc

### Mức độ

| Mức | Định nghĩa dùng trong báo cáo |
|---|---|
| 🔴 **Critical** | Lộ hoặc mất dữ liệu nghiêm trọng, hoặc hệ thống **không thể chạy** ở môi trường mục tiêu. Cần xử lý ngay. |
| 🟠 **High** | Chức năng chính bị hỏng hoặc crash, hoặc có lỗ hổng khai thác được mà không cần điều kiện đặc biệt. |
| 🟡 **Medium** | Sai nghiệp vụ, rủi ro bảo mật cần thêm điều kiện, hoặc ảnh hưởng một phần người dùng/tính năng. |
| 🟢 **Low** | Chất lượng code, UX nhỏ, tài liệu, rủi ro thấp. |

### Trạng thái kết luận

| Ký hiệu | Ý nghĩa |
|---|---|
| ✅ **Xác nhận** | Có bằng chứng trực tiếp trong code, lịch sử Git hoặc ảnh chụp màn hình. "Xác nhận (tĩnh)" nghĩa là kết luận bằng cách đọc và suy luận luồng thực thi, **chưa chạy thực tế**. |
| ⚠️ **Rủi ro tiềm ẩn** | Code tạo điều kiện cho sự cố, nhưng hậu quả còn phụ thuộc môi trường hoặc runtime chưa kiểm chứng được. |
| ❓ **Chưa đủ dữ liệu** | Cần thêm thông tin nằm ngoài repo để kết luận. |

**Độ chắc chắn:** Cao / Trung bình / Thấp.

> **Giới hạn chung:** repo không có `node_modules`, và phạm vi phân tích không cho phép cài package hay chạy lệnh ghi dữ liệu, nên **không chạy được** app, build, lint hay test. Mọi lỗi runtime được xác nhận bằng phân tích tĩnh, kết hợp kiến thức về hành vi của các phiên bản thư viện ghi trong lockfile.

## Thống kê

| Mức độ | Số lượng |
|---|---|
| 🔴 Critical | 2 |
| 🟠 High | 7 |
| 🟡 Medium | 20 |
| 🟢 Low | 21 |
| **Tổng** | **50** |

| Nhóm | Tiền tố | Số lượng |
|---|---|---|
| Bảo mật | SEC | 9 |
| Lỗi runtime / logic | ERR | 9 |
| Nghiệp vụ | BIZ | 9 |
| Chất lượng code | CODE | 5 |
| Database / dữ liệu | DB | 4 |
| Kiến trúc | ARCH | 4 |
| Triển khai / vận hành | OPS | 4 |
| Tài liệu | DOC | 2 |
| Validation | VAL | 1 |
| Kiểm thử | TEST | 1 |
| Dependency | DEP | 1 |
| Hiệu năng | PERF | 1 |

---

## Bảng tổng hợp

| Mã | Mức độ | Nhóm | Vị trí | Vấn đề | Ảnh hưởng | Hướng xử lý | Trạng thái / Độ chắc chắn |
|---|---|---|---|---|---|---|---|
| [SEC-001](#sec-001) | 🔴 Critical | Bảo mật – Secret | `backend/.env`, `frontend/.env` trong commit `f7e88b3` (đã có trên `origin/main`) | File `.env` chứa secret thật đã bị commit; commit xoá sau đó không xoá lịch sử | Người có quyền đọc repo có thể lấy quyền truy cập DB, giả mạo JWT, dùng tài khoản Cloudinary | Rotate toàn bộ secret, purge lịch sử, `.env.example`, secret scanning | ✅ / Cao |
| [ERR-001](#err-001) | 🔴 Critical | Build / Deploy | [jobsRouters.js:5](../backend/src/routers/jobsRouters.js#L5) | Import `SaveJobControllers.js` trong khi file thật là `saveJobControllers.js` | Backend không khởi động trên Linux (Render, Docker, CI) | Sửa đúng tên; `core.ignorecase=false`; CI chạy trên Linux | ✅ tĩnh / Cao |
| [ERR-002](#err-002) | 🟠 High | Logic FE | [jobsStore.js:84-86, 100-102](../frontend/src/zustand/jobsStore.js#L84-L102) | Sau save/apply, store chèn `res.data` sai shape vào `savedJobs`/`appliedJobs` | Mở trang Saved/Applied sau khi lưu thì TypeError, trắng toàn app | Backend trả document đã populate hoặc refetch; ErrorBoundary | ✅ tĩnh / Cao |
| [DB-001](#db-001) | 🟠 High | Toàn vẹn dữ liệu | [saveJobControllers.js:15-23](../backend/src/controllers/saveJobControllers.js#L15-L23), [jobs.seeds.js:134-135](../backend/seeds/jobs.seeds.js#L134-L135), [SavedjobsPage.jsx:32](../frontend/src/Pages/SavedjobsPage.jsx#L32) | Không kiểm tra Job tồn tại; seed xoá Job; FE không xử lý `jobId: null` | Tham chiếu mồ côi làm trang Saved/Applied crash vĩnh viễn với user đó | Kiểm tra tồn tại, seed dạng upsert, lọc null, render an toàn | ✅ / Cao |
| [OPS-001](#ops-001) | 🟠 High | Cấu hình / Deploy | [index.js:10-15](../backend/src/index.js#L10-L15), [axiosInstance.js:4](../frontend/src/utils/axiosInstance.js#L4), [generateToken.js:11-16](../backend/src/utils/generateToken.js#L11-L16) | Hard-code localhost; cookie `SameSite=Strict` không hợp với FE/BE khác site | Deploy Vercel + Render: CORS chặn, cookie không được gửi, không đăng nhập được | Biến môi trường; deploy cùng site hoặc đổi chiến lược cookie | ✅ (hard-code) ⚠️ (cookie) / Cao |
| [SEC-002](#sec-002) | 🟠 High | Bảo mật – Xác thực | [authControllers.js:49-61](../backend/src/controllers/authControllers.js#L49-L61) | Thông báo lỗi khác nhau cho email sai / mật khẩu sai; `email` không ép kiểu string nên có thể gửi toán tử MongoDB | Dò và có thể trích xuất danh sách email người dùng | Ép kiểu, thông báo chung, `sanitizeFilter`, rate limit | ✅ (dò email) ⚠️ (injection) / Trung bình–Cao |
| [ARCH-001](#arch-001) | 🟠 High | Kiến trúc – Xác thực | [main.jsx:8-15](../frontend/src/main.jsx#L8-L15), [SignUpPage.jsx:11-24](../frontend/src/Pages/SignUpPage.jsx#L11-L24) | Clerk tích hợp nửa vời, backend không nhận phiên Clerk; `ClerkProvider` bắt buộc có key | Google login không vào được app; thiếu key thì toàn FE không render | Chọn một cơ chế auth; gỡ Clerk hoặc tích hợp đầy đủ ở backend | ✅ / Cao |
| [BIZ-001](#biz-001) | 🟠 High | Nghiệp vụ | [JobSidebar.jsx:33-42](../frontend/src/components/JobSidebar.jsx#L33-L42), [jobsControllers.js:37-44](../backend/src/controllers/jobsControllers.js#L37-L44) | FE gửi `salary=lt3k`, BE đọc `salary.ranges` (object) mà Express 5 không bao giờ tạo ra | Lọc lương không có tác dụng, âm thầm trả tất cả | Thiết kế lại contract lọc lương, xử lý đa tiền tệ/chu kỳ | ✅ / Cao |
| [ERR-003](#err-003) | 🟠 High | UX – Xử lý lỗi | Toàn frontend (không có `<Toaster />`) | Gọi `toast` ở nhiều nơi nhưng không render `Toaster` | Người dùng không thấy bất kỳ thông báo lỗi/thành công nào | Thêm `<Toaster />`; giảm toast không cần thiết | ✅ / Cao |
| [SEC-003](#sec-003) | 🟡 Medium | Bảo mật – Logging | [protectRouter.js:8-9](../backend/src/utils/protectRouter.js#L8-L9), [authControllers.js:114](../backend/src/controllers/authControllers.js#L114) | Log cookie (JWT) mỗi request; log document user có password hash | Ai đọc được log có thể chiếm phiên tới 7 ngày | Xoá log nhạy cảm; logger có redact | ✅ / Cao |
| [SEC-004](#sec-004) | 🟡 Medium | Bảo mật – Xác thực | [authRouters.js:13-14](../backend/src/routers/authRouters.js#L13-L14), [authControllers.js:21](../backend/src/controllers/authControllers.js#L21) | Không rate limit login/signup; mật khẩu tối thiểu 6 ký tự | Brute force, credential stuffing, spam tài khoản | `express-rate-limit`; tối thiểu 8 ký tự | ✅ / Cao |
| [SEC-005](#sec-005) | 🟡 Medium | Bảo mật – Injection/DoS | [jobsControllers.js:24-33](../backend/src/controllers/jobsControllers.js#L24-L33) | Đưa input thô vào `new RegExp` trên endpoint công khai, không giới hạn số phần tử | 500 khi regex sai; tốn CPU DB; quét toàn collection | Escape regex hoặc so khớp chính xác; giới hạn mảng | ✅ (500) ⚠️ (ReDoS) / Trung bình |
| [SEC-006](#sec-006) | 🟡 Medium | Bảo mật – Phiên | [generateToken.js:7-9](../backend/src/utils/generateToken.js#L7-L9), [authControllers.js:75-83](../backend/src/controllers/authControllers.js#L75-L83) | JWT 7 ngày không thu hồi được; secret từng dùng rất ngắn | Token bị lộ dùng được tới khi hết hạn; secret yếu dễ bị brute-force offline | Secret mạnh; `tokenVersion`; rút ngắn TTL | ✅ / Cao |
| [SEC-007](#sec-007) | 🟡 Medium | Bảo mật – Upload | [authControllers.js:96-119](../backend/src/controllers/authControllers.js#L96-L119), [index.js:16-17](../backend/src/index.js#L16-L17) | Đẩy chuỗi bất kỳ lên Cloudinary; không kiểm tra loại/kích thước; limit 10MB cho mọi route | Lạm dụng quota, tốn RAM, rác ảnh cũ, rủi ro SDK đọc file cục bộ | Validate data URI, limit riêng, `public_id` cố định | ✅ ⚠️ / Trung bình |
| [VAL-001](#val-001) | 🟡 Medium | Validation | [authControllers.js:8, 49, 98](../backend/src/controllers/authControllers.js#L8), các controller jobs | Không validate kiểu dữ liệu; `req.body` có thể `undefined`; ObjectId sai; nhánh không trả response | 500 kèm stack trace, request treo, mã lỗi sai | Middleware validate theo schema | ✅ tĩnh / Cao |
| [ERR-004](#err-004) | 🟡 Medium | Logic FE | [useAuthStore.js:73-74](../frontend/src/zustand/useAuthStore.js#L73-L74) | Tham chiếu `authUser` chưa khai báo; dòng sau ghi đè user bằng chuỗi | Client báo lỗi dù server thành công; lỗi thứ hai nằm chờ | `get()` + merge object | ✅ / Cao |
| [ERR-005](#err-005) | 🟡 Medium | Luồng xác thực FE | [useAuthStore.js:6](../frontend/src/zustand/useAuthStore.js#L6), [App.jsx:20-40](../frontend/src/App.jsx#L20-L40) | `isCheckingAuth` khởi tạo `false` nên redirect trước khi `authCheck` chạy | F5 ở trang con bị đưa về trang chủ, mất deep link | Khởi tạo `true` | ✅ tĩnh / Cao |
| [ERR-006](#err-006) | 🟡 Medium | Xử lý lỗi – Auth | [protectRouter.js:15-28](../backend/src/utils/protectRouter.js#L15-L28) | `jwt.verify` ném lỗi nên token hết hạn/sai trả 500 | Monitoring nhiễu; client không phân biệt được hết phiên với lỗi server | Bắt lỗi JWT, trả 401 | ✅ / Cao |
| [BIZ-002](#biz-002) | 🟡 Medium | Nghiệp vụ – Dữ liệu | [JobSidebar.jsx:52-60](../frontend/src/components/JobSidebar.jsx#L52-L60), [seed](../backend/seeds/jobs.seeds.js#L19) | Filter Region "Miền Bắc/Trung/Nam" nhưng dữ liệu là tên quốc gia | Chọn Region luôn ra 0 kết quả | Thống nhất từ điển giá trị | ✅ / Cao |
| [BIZ-003](#biz-003) | 🟡 Medium | Nghiệp vụ – Hiển thị | [JobCard.jsx:116-121](../frontend/src/components/JobCard.jsx#L116-L121) | Hiển thị `$${min}k`, bỏ qua currency và period | "$1200k - $2000k" cho lương 1.200–2.000 USD/tháng | Hàm `formatSalary` | ✅ (có screenshot) / Cao |
| [BIZ-004](#biz-004) | 🟡 Medium | Nghiệp vụ – Hiển thị | [SavedjobsPage.jsx:34](../frontend/src/Pages/SavedjobsPage.jsx#L34) | Deadline lấy `updatedAt` thay vì `expiredAt` | Hạn nộp hiển thị sai | Dùng `expiredAt` | ✅ (có screenshot) / Cao |
| [BIZ-005](#biz-005) | 🟡 Medium | Nghiệp vụ | [getJobsList.js:5](../backend/src/controllers/getJobsList.js#L5), [jobsControllers.js:16](../backend/src/controllers/jobsControllers.js#L16) | Không lọc job hết hạn; `isActive` không bao giờ đổi; `node-cron` không dùng | Hiển thị tin đã hết hạn | Lọc `expiredAt >= now` | ✅ / Cao |
| [BIZ-006](#biz-006) | 🟡 Medium | Nghiệp vụ – API | [jobsControllers.js:46-61](../backend/src/controllers/jobsControllers.js#L46-L61), [jobsStore.js:50-65](../frontend/src/zustand/jobsStore.js#L50-L65) | Search trả tối đa 10 job, FE không có phân trang; `/getjobs` không phân trang | Không xem được kết quả thứ 11 trở đi | Một endpoint list có filter + phân trang; UI phân trang | ✅ / Cao |
| [BIZ-009](#biz-009) | 🟡 Medium | Nghiệp vụ – UI | [JobCard.jsx:17, 149](../frontend/src/components/JobCard.jsx#L149), [JobsList.jsx:12](../frontend/src/components/JobsList.jsx#L12) | `JobCard` đọc prop `url` nhưng dữ liệu Job chỉ có `sourceUrl` | Nút "View Job" ở trang chủ không có `href`, bấm không có tác dụng | Truyền `url={job.sourceUrl}` | ✅ / Cao |
| [ARCH-002](#arch-002) | 🟡 Medium | Kiến trúc – API contract | Các controller | Mỗi endpoint trả một shape JSON khác nhau | Nguyên nhân gốc của ERR-002; FE phải đoán shape | Chuẩn hoá envelope, viết tài liệu API | ✅ / Cao |
| [DB-002](#db-002) | 🟡 Medium | Database – Race | [savedJobsschema.js](../backend/src/schemaModel/savedJobsschema.js), [appliedJobschema.js](../backend/src/schemaModel/appliedJobschema.js) | Không có unique index `(userId, jobId)`; check-then-act | Bản ghi trùng khi double-click hoặc mở nhiều tab | Unique compound index, bắt E11000 trả 409 | ✅ (thiếu index) ⚠️ (race) / Cao |
| [DB-003](#db-003) | 🟡 Medium | Seed / Migration | [jobs.seeds.js:131-143](../backend/seeds/jobs.seeds.js#L131-L143) | Seed `deleteMany({})`, không có script, không có cơ chế migration | Chạy nhầm lên DB thật làm mất job và gây DB-001 | Upsert theo `sourceUrl`; chặn ở production | ✅ / Cao |
| [OPS-002](#ops-002) | 🟡 Medium | Triển khai | [backend/package.json:5-7, 24](../backend/package.json#L5-L7) | Không có script `start`, `.env.example`, kiểm tra env; nodemon nằm trong dependencies | Người mới không dựng được dự án; deploy phải tự đoán | Thêm `start`, `.env.example`, module config | ✅ / Cao |
| [TEST-001](#test-001) | 🟡 Medium | Kiểm thử | Toàn repo | Không có test, không có CI, backend không lint | Lỗi chỉ lộ ra khi người dùng gặp | Test API, store, E2E tối thiểu; CI | ✅ / Cao |
| [ERR-007](#err-007) | 🟢 Low | Runtime – Cấu hình | [generateToken.js:6](../backend/src/utils/generateToken.js#L6), [index.js:23-26](../backend/src/index.js#L23-L26) | `generateToken` async không await; listen trước khi kết nối DB | Thiếu `JWT_SECRET` thì tiến trình crash sau khi user đã được tạo | Hàm đồng bộ, validate env, connect rồi mới listen | ✅ tĩnh / Cao |
| [ERR-008](#err-008) | 🟢 Low | Logic FE | [LogInPage.jsx:1-5, 17](../frontend/src/Pages/LogInPage.jsx#L17) | Dùng `toast` nhưng không import | Validate phía client ở trang Login ném ReferenceError | Import `toast` | ✅ / Cao |
| [ERR-009](#err-009) | 🟢 Low | HTTP semantics | Nhiều controller | 401 dùng cho validation/trùng lặp; không có 404/error handler JSON | Client và monitoring hiểu sai ý nghĩa lỗi | 400/404/409; handler tập trung | ✅ / Cao |
| [DB-004](#db-004) | 🟢 Low | Mô hình dữ liệu | [userSchema.js:9-18](../backend/src/schemaModel/userSchema.js#L9-L18), [jobschema.js:61-80](../backend/src/schemaModel/jobschema.js#L61-L80) | Email không lowercase/trim; `minlength` áp lên hash; không kiểm tra `min <= max` | Tài khoản trùng theo chữ hoa/thường; ràng buộc giả | lowercase/trim, validator | ✅ / Cao |
| [SEC-008](#sec-008) | 🟢 Low | Bảo mật – Hardening | [index.js](../backend/src/index.js), [jobsRouters.js:13, 16](../backend/src/routers/jobsRouters.js#L13-L16) | Không có security headers; lộ `X-Powered-By`; `/search` công khai còn `/getjobs` cần đăng nhập | Bề mặt tấn công lớn hơn cần thiết; chính sách truy cập không rõ | `helmet`; quyết định rõ public/private | ✅ ❓ / Trung bình |
| [SEC-009](#sec-009) | 🟢 Low | Quyền riêng tư | [ProfilePage.jsx:59-62](../frontend/src/Pages/ProfilePage.jsx#L59-L62) | Ảnh mặc định hotlink từ website bên thứ ba | Lộ IP/Referer người dùng cho bên thứ ba; ảnh có thể mất | Dùng asset nội bộ | ✅ / Cao |
| [ARCH-003](#arch-003) | 🟢 Low | Quản lý cấu hình | 6 nơi gọi `dotenv.config()` | Cấu hình rải rác, tên biến `MONGOO_URI` | Khó biết app cần biến gì; phụ thuộc thứ tự import | Module `config/env.js` duy nhất | ✅ / Cao |
| [ARCH-004](#arch-004) | 🟢 Low | Tổ chức module | [controllers/](../backend/src/controllers), [jobsRouters.js](../backend/src/routers/jobsRouters.js) | Tên file/hàm/route không nhất quán; middleware trong utils | Khó tìm, dễ import sai | Tổ chức theo feature, route REST | ✅ / Cao |
| [CODE-001](#code-001) | 🟢 Low | Dead code | Nhiều file | Package, asset, state, import và nhánh code không dùng | Nhiễu, tăng bề mặt dependency | Dọn dẹp, bật lint | ✅ / Cao |
| [CODE-002](#code-002) | 🟢 Low | Trùng lặp | Headers, skeleton, controllers | Copy-paste thay vì tham số hoá | Lỗi bị nhân bản | Component/hàm dùng chung | ✅ / Cao |
| [CODE-003](#code-003) | 🟢 Low | Naming / copy-paste | [AppliedJobsHeader.jsx:6, 26](../frontend/src/components/AppliedJobsHeader.jsx#L26), [index.html:5-7](../frontend/index.html#L5-L7) | Sai chính tả, sai nhãn, favicon trỏ file không tồn tại | Người dùng và người đọc code bị nhầm lẫn | Quy ước đặt tên, review | ✅ (có screenshot) / Cao |
| [CODE-004](#code-004) | 🟢 Low | Debug / UX noise | 18 `console.log`; toast ở mọi fetch | Log rác; spam thông báo khi bật Toaster | Rò rỉ dữ liệu vào console, UX ồn | Logger theo môi trường | ✅ / Cao |
| [CODE-005](#code-005) | 🟢 Low | React Router | [LogInPage.jsx:104-109](../frontend/src/Pages/LogInPage.jsx#L104-L109), [SignUpPage.jsx:138-143](../frontend/src/Pages/SignUpPage.jsx#L138-L143) | Dùng `<a href>` thay vì `<Link>` | Reload toàn trang, gọi lại authCheck | `<Link to>` | ✅ / Cao |
| [OPS-003](#ops-003) | 🟢 Low | Tính di động | `frontend/src/components/skeleton␠/` | Tên thư mục có dấu cách ở cuối | Clone trên Windows lỗi checkout | Đổi tên thư mục | ✅ / Cao |
| [OPS-004](#ops-004) | 🟢 Low | Git hygiene | Lịch sử Git | Từng commit ~3.500 file `node_modules`; `.DS_Store` vẫn được theo dõi | Repo nặng, diff nhiễu | Purge cùng SEC-001; `.gitignore` gốc | ✅ / Cao |
| [DEP-001](#dep-001) | 🟢 Low | Dependency | [frontend/package.json:13-16, 37](../frontend/package.json#L13-L16) | `@clerk/clerk-react` deprecated; line-clamp plugin thừa; daisyUI 5 đi với Tailwind 3 | Cảnh báo, rủi ro class không sinh ra | Gỡ/thay thế, kiểm tra build | ✅ ❓ / Trung bình |
| [PERF-001](#perf-001) | 🟢 Low | Hiệu năng | [getJobsList.js:5](../backend/src/controllers/getJobsList.js#L5), store không selector | Trả toàn bộ job; regex không dùng index; re-render thừa | Chưa ảnh hưởng ở 5 job; chậm khi dữ liệu lớn | Phân trang, projection, selector | ✅ ⚠️ / Trung bình |
| [BIZ-007](#biz-007) | 🟢 Low | UX – Profile | [ProfilePage.jsx:9-33](../frontend/src/Pages/ProfilePage.jsx#L9-L33) | Nút X chỉ xoá preview; không kiểm tra kích thước file; spinner thay cả trang | Người dùng tưởng đã xoá ảnh; lỗi 413 khó hiểu | Tách hành động, kiểm tra kích thước | ✅ / Cao |
| [BIZ-008](#biz-008) | 🟢 Low | UX – Tìm việc | [JobCard.jsx](../frontend/src/components/JobCard.jsx), [HomePage.jsx:28](../frontend/src/Pages/HomePage.jsx#L28) | Card không hiện trạng thái đã lưu/đã ứng tuyển; không có empty state; mất filter; sidebar cố định trên mobile | Trải nghiệm khó hiểu, bấm lặp lại | Tính trạng thái, empty state, responsive | ✅ / Cao |
| [DOC-001](#doc-001) | 🟢 Low | Nhất quán yêu cầu–code | [README.md:3, 30](../README.md#L3), [FindjobsHeader.jsx:14](../frontend/src/components/FindjobsHeader.jsx#L14) | Tuyên bố "aggregator", "1000+ jobs", "pending" nhưng code không có | Kỳ vọng người xem portfolio lệch với thực tế | Viết đúng hiện trạng | ✅ / Cao |
| [DOC-002](#doc-002) | 🟢 Low | Tài liệu | [README.md:98-120](../README.md#L98-L120), [frontend/README.md](../frontend/README.md) | Hướng dẫn cài đặt sai đường dẫn, thiếu env/seed; README frontend là template | Người mới không dựng được môi trường | Cập nhật README | ✅ / Cao |

---

## Phân tích chi tiết

### 🔴 Critical

<a id="sec-001"></a>
### SEC-001 — Secret thật bị commit vào lịch sử Git và đã có trên remote

| Thuộc tính | Nội dung |
|---|---|
| **Mức độ** | 🔴 Critical |
| **Loại** | Bảo mật – Quản lý secret (OWASP A02: Cryptographic Failures / A05: Security Misconfiguration) |
| **Trạng thái** | ✅ Xác nhận (lịch sử Git). ❓ Chưa đủ dữ liệu để biết repo GitHub là public hay private, và secret đã được rotate hay chưa. |
| **Độ chắc chắn** | Cao |

**Bằng chứng** (chỉ liệt kê tên biến, **không** in giá trị):

```text
$ git log --all --name-status -- '*.env'
2929d0c 2026-06-13 Remove env files and node_modules from tracking
D  backend/.env
D  frontend/.env
f7e88b3 2026-06-09 first commit
A  backend/.env
A  frontend/.env

$ git branch -r --contains f7e88b3
origin/main
```

- `backend/.env` trong commit `f7e88b3` chứa các khoá: `PORT`, `MONGOO_URI` (**chuỗi kết nối MongoDB có nhúng username/password**), `JWT_SECRET` (**rất ngắn**, chỉ khoảng một chục ký tự), `NODE_ENV`, `CLOUD_NAME`, `CLOUD_API_KEY`, `CLOUD_API_SECRET`.
- `frontend/.env` chứa `VITE_CLERK_PUBLISHABLE_KEY`. Đây là khoá **công khai theo thiết kế** của Clerk nên mức nhạy cảm thấp.
- Remote: `git@github.com:hanghn-dev/Jobradar.git`.

**Nguyên nhân:** `.gitignore` được thêm **sau** commit đầu tiên (commit `1da168b`). Commit `2929d0c` chỉ xoá file khỏi phiên bản mới nhất. Git lưu toàn bộ lịch sử, nên chỉ cần `git show f7e88b3:backend/.env` là đọc được nội dung.

**Ảnh hưởng:**

1. **MongoDB:** người có chuỗi kết nối có thể đọc, sửa, xoá toàn bộ dữ liệu người dùng, gồm email và password hash. Mức độ phụ thuộc cấu hình IP allowlist của DB (chưa đủ dữ liệu).
2. **JWT_SECRET:** có secret là tự ký được token `{ userId: <bất kỳ> }` và **đăng nhập dưới danh nghĩa bất kỳ người dùng nào** mà không cần mật khẩu.
3. **Cloudinary API secret:** upload, xoá tài nguyên, tiêu tốn quota, có thể phát sinh chi phí.

**Tình huống kích hoạt:** bất kỳ ai clone hoặc fork repo (nếu public), hoặc bất kỳ ai từng có quyền đọc repo (nếu private). Các công cụ quét secret tự động trên GitHub public thường phát hiện chuỗi kết nối MongoDB rất nhanh sau khi được push.

**Hướng xử lý** (theo đúng thứ tự):

1. **Rotate ngay**, việc này quan trọng hơn xoá lịch sử:
   - Đổi mật khẩu (hoặc tạo user mới rồi xoá user cũ) của MongoDB; kiểm tra IP allowlist và log truy cập.
   - Sinh `JWT_SECRET` mới, ngẫu nhiên, ≥ 32 byte. Mọi phiên cũ sẽ mất hiệu lực, điều này là mong muốn.
   - Regenerate Cloudinary API secret.
2. **Xoá khỏi lịch sử** bằng `git filter-repo` hoặc BFG, đồng thời xoá luôn `node_modules` (OPS-004). Sau đó force-push và yêu cầu mọi người clone lại. Lưu ý: fork và cache không bị xoá theo, nên **bước 1 mới là biện pháp thật sự**.
3. **Phòng ngừa:** thêm `backend/.env.example`, `frontend/.env.example` (chỉ tên biến); bật GitHub Secret Scanning / Push Protection; cân nhắc pre-commit hook `gitleaks`.

> **Bài học:** trên Git, "xoá file" không có nghĩa là "xoá dữ liệu". Một secret đã từng được push thì phải coi như đã lộ.

---

<a id="err-001"></a>
### ERR-001 — Import sai chữ hoa/thường khiến backend không khởi động được trên Linux

| Thuộc tính | Nội dung |
|---|---|
| **Mức độ** | 🔴 Critical |
| **Loại** | Lỗi build/runtime – Tính di động giữa hệ điều hành |
| **Trạng thái** | ✅ Xác nhận (tĩnh) |
| **Độ chắc chắn** | Cao |

**Bằng chứng:**

```js
// backend/src/routers/jobsRouters.js:5
import { SaveJobs } from "../controllers/SaveJobControllers.js";
```

```text
$ git ls-files backend/src/controllers | grep -i savejob
backend/src/controllers/saveJobControllers.js     ← chữ "s" thường
$ git config --get core.ignorecase
true                                              ← repo đang ở hệ thống file không phân biệt hoa/thường (macOS)
```

**Nguyên nhân:** hệ thống file mặc định của macOS (APFS) không phân biệt hoa/thường, nên `SaveJobControllers.js` vẫn mở được `saveJobControllers.js`. Linux (Render, Docker, GitHub Actions) **phân biệt** hoa/thường, và bộ resolve ES Module của Node sẽ không tìm thấy file.

**Ảnh hưởng:** khi chạy `node src/index.js` trên Linux, tiến trình dừng ngay ở bước import với lỗi `ERR_MODULE_NOT_FOUND`. **Toàn bộ API không hoạt động**, không chỉ riêng route save. README ghi kế hoạch deploy lên Render, tức môi trường Linux.

**Tình huống kích hoạt:** deploy lên bất kỳ máy Linux nào, chạy trong Docker, CI, hoặc khi một thành viên dùng Linux clone về.

**Hướng xử lý:**

1. Sửa import thành `../controllers/saveJobControllers.js`.
2. Thống nhất quy ước tên file (ví dụ `kebab-case` hoặc `camelCase`) để giảm khả năng gõ nhầm.
3. Chạy CI trên `ubuntu-latest`: lỗi dạng này sẽ bị phát hiện ngay ở bước khởi động hoặc test.
4. (Tuỳ chọn) `git config core.ignorecase false` trong repo để Git cảnh báo khi đổi tên chỉ khác hoa/thường.

---

### 🟠 High

<a id="err-002"></a>
### ERR-002 — Store chèn dữ liệu sai shape sau khi Save/Apply, làm crash trang Saved/Applied

| Thuộc tính | Nội dung |
|---|---|
| **Mức độ** | 🟠 High |
| **Loại** | Lỗi logic frontend – Hợp đồng dữ liệu |
| **Trạng thái** | ✅ Xác nhận (tĩnh) |
| **Độ chắc chắn** | Cao |

**Bằng chứng:**

```js
// frontend/src/zustand/jobsStore.js:83-86
const res = await axiosInstance.post(`/jobs/save/${id}`);
set((state) => ({
  savedJobs: [...state.savedJobs, res.data],   // res.data = { message, newJobUpdate }
}));
```

```js
// backend/src/controllers/saveJobControllers.js:24
res.status(201).json({ message: "Saving Job Successfully", newJobUpdate });
```

```jsx
// frontend/src/Pages/SavedjobsPage.jsx:29-33
{savedJobs?.map((job) => (
  <SavedJobCard key={job._id} title={job.jobId.title} ... />   // job.jobId === undefined
```

Luồng tương tự với `applyJob` ([jobsStore.js:99-102](../frontend/src/zustand/jobsStore.js#L99-L102)) và [AppliedJobsPage.jsx:37](../frontend/src/Pages/AppliedJobsPage.jsx#L37).

**Nguyên nhân:**

1. Store giả định `res.data` có cùng shape với phần tử trả về từ `GET /jobs/saved`, nhưng không có hợp đồng API nào đảm bảo điều đó (ARCH-002).
2. Trang Saved render dữ liệu **cũ trong store** trước khi `useEffect` gọi `fetchSavedJobs()`. Điều kiện hiển thị skeleton `isFetchingSavedJobs && savedJobs.length === 0` ([SavedjobsPage.jsx:14](../frontend/src/Pages/SavedjobsPage.jsx#L14)) là `false` ở lần render đầu.
3. Frontend không có Error Boundary.

**Ảnh hưởng:** `TypeError: Cannot read properties of undefined (reading 'title')` xảy ra trong lúc render. React 19 gỡ toàn bộ cây component, **màn hình trắng**. Người dùng phải F5, lúc đó store được làm mới và trang hiển thị lại bình thường.

**Tình huống kích hoạt:** Đăng nhập → ở trang chủ bấm Bookmark một job → bấm nút "Saved Jobs" (điều hướng bằng `<Link>`, store không bị reset) → crash. Làm tương tự với Apply rồi mở "Applied Jobs".

**Hướng xử lý:**

- **Backend:** trả về document đã populate, với key thống nhất:
  ```js
  const saved = await SaveJob.create({ userId, jobId });
  await saved.populate("jobId");
  res.status(201).json({ data: saved });
  ```
- **Frontend:** dùng đúng key (`res.data.data`), hoặc đơn giản nhất là **refetch** danh sách sau khi lưu.
- Thêm `ErrorBoundary` quanh `<Routes>` để lỗi render chỉ ảnh hưởng một trang.
- Viết test cho store: "sau `saveJob`, mọi phần tử trong `savedJobs` đều có `jobId.title`".

---

<a id="db-001"></a>
### DB-001 — Tham chiếu mồ côi giữa SaveJob/ApplyJob và Job làm crash frontend

| Thuộc tính | Nội dung |
|---|---|
| **Mức độ** | 🟠 High |
| **Loại** | Toàn vẹn dữ liệu (referential integrity) + xử lý dữ liệu null |
| **Trạng thái** | ✅ Xác nhận |
| **Độ chắc chắn** | Cao |

**Bằng chứng:**

```js
// saveJobControllers.js:15-23 — không kiểm tra Job có tồn tại hay không
const existingSave = await SaveJob.findOne({ userId, jobId });
...
const newJobUpdate = await SaveJob.create({ userId, jobId });
```

```js
// seeds/jobs.seeds.js:134-135 — xoá toàn bộ job, tạo job mới với _id mới
await Job.deleteMany({});
await Job.insertMany(fakeJobs);
```

```jsx
// SavedjobsPage.jsx:32 — không kiểm tra null
title={job.jobId.title}
```

**Nguyên nhân:** MongoDB không có foreign key. Mọi ràng buộc tham chiếu phải được đảm bảo ở tầng ứng dụng, nhưng dự án chưa làm việc này ở cả lúc ghi (save/apply) lẫn lúc xoá (seed). Khi `populate` không tìm thấy document, Mongoose trả `jobId: null`.

**Ảnh hưởng:**

- Người dùng có ít nhất một bookmark mồ côi sẽ **không bao giờ mở được** trang Saved/Applied (TypeError, màn hình trắng), kể cả sau khi F5, vì dữ liệu lỗi nằm trong DB.
- Người dùng không tự khắc phục được, vì muốn xoá bookmark thì phải mở được trang đó.

**Tình huống kích hoạt:**

1. Chạy lại script seed sau khi đã có người dùng lưu job.
2. Gọi trực tiếp `POST /api/jobs/save/<một ObjectId hợp lệ nhưng không tồn tại>` (bằng Postman hay curl).
3. Sau này có tính năng xoá job mà không dọn bookmark liên quan.

**Hướng xử lý:**

- **Khi ghi:** `const job = await Job.exists({ _id: jobId, isActive: true }); if (!job) return 404`.
- **Khi seed:** dùng `bulkWrite` với `updateOne({ sourceUrl }, { $set: … }, { upsert: true })` để giữ nguyên `_id` (xem DB-003).
- **Khi đọc:** backend lọc `savedJobs.filter((s) => s.jobId)`, hoặc chủ động dọn bản ghi mồ côi.
- **Khi render:** `job.jobId?.title ?? "Tin tuyển dụng không còn tồn tại"`, kèm nút xoá.
- **Khi xoá job trong tương lai:** ưu tiên *soft delete* (`isActive: false`) thay vì xoá cứng.

---

<a id="ops-001"></a>
### OPS-001 — Cấu hình hard-code localhost và cookie SameSite=Strict không tương thích mô hình deploy

| Thuộc tính | Nội dung |
|---|---|
| **Mức độ** | 🟠 High |
| **Loại** | Cấu hình môi trường / Triển khai |
| **Trạng thái** | ✅ Xác nhận (hard-code). ⚠️ Rủi ro tiềm ẩn (cookie cross-site, vì phụ thuộc domain thực tế khi deploy) |
| **Độ chắc chắn** | Cao |

**Bằng chứng:**

```js
// backend/src/index.js:11-14
cors({ origin: "http://localhost:5173", credentials: true })

// frontend/src/utils/axiosInstance.js:4
baseURL: "http://localhost:5001/api",

// backend/src/utils/generateToken.js:11-16
res.cookie("token", token, { httpOnly: true, sameSite: "strict",
  secure: process.env.NODE_ENV !== "development", ... });
```

README ghi kế hoạch deploy: backend lên Render, frontend lên Vercel ([README.md:53](../README.md#L53)).

**Nguyên nhân:** các giá trị phụ thuộc môi trường được viết thẳng vào code. Ngoài ra, `*.vercel.app` và `*.onrender.com` là **hai "site" khác nhau** (cả hai đều nằm trong Public Suffix List). Trình duyệt không gửi cookie `SameSite=Strict` (và cả `Lax`) kèm request XHR/fetch cross-site.

**Ảnh hưởng:** khi deploy:

1. Frontend vẫn gọi `localhost:5001`, tức gọi vào máy của chính người dùng, nên mọi request thất bại.
2. Nếu đã sửa URL: CORS của backend chỉ cho phép `localhost:5173`, nên trình duyệt chặn response.
3. Nếu đã sửa CORS: cookie `SameSite=Strict` không được gửi đi, nên `authCheck` luôn trả 401 và người dùng không bao giờ giữ được trạng thái đăng nhập.

**Tình huống kích hoạt:** đúng theo kế hoạch deploy trong README.

**Hướng xử lý:**

- Đưa cấu hình ra biến môi trường: `CLIENT_URL` cho CORS, `VITE_API_URL` cho axios.
- Chọn **một** chiến lược cookie, kèm hiểu biết về đánh đổi:

| Phương án | Cách làm | Ưu | Nhược |
|---|---|---|---|
| **A. Cùng site (khuyến nghị)** | Dùng custom domain `app.example.com` + `api.example.com`, hoặc cấu hình rewrite `/api/*` trên Vercel sang Render | Giữ được `SameSite=Lax/Strict`, tự có chống CSRF | Cần domain hoặc cấu hình proxy |
| B. Khác site | `SameSite=None; Secure` + CSRF token | Không cần domain | Phải tự chống CSRF; Safari và các chính sách chặn cookie bên thứ ba có thể vẫn chặn |

---

<a id="sec-002"></a>
### SEC-002 — Đăng nhập cho phép dò email (user enumeration) và có nguy cơ NoSQL operator injection

| Thuộc tính | Nội dung |
|---|---|
| **Mức độ** | 🟠 High |
| **Loại** | Bảo mật – Xác thực, Injection (OWASP A07, A03) |
| **Trạng thái** | ✅ Xác nhận (dò email qua thông báo lỗi). ⚠️ Rủi ro tiềm ẩn (operator injection, chưa chạy thử với Mongoose 9.6.2) |
| **Độ chắc chắn** | Cao (enumeration) / Trung bình–Cao (injection) |

**Bằng chứng:**

```js
// authControllers.js:49-61
const { email, password } = req.body;          // không kiểm tra typeof
...
const user = await User.findOne({ email });    // email có thể là object
if (!user) return res.status(401).json({ message: "This email doesn't exist" });
const isPassword = await bcrypt.compare(password, user.password);
if (!isPassword) return res.status(401).json({ message: "Invalid credentials" });
```

Endpoint signup cũng trả `"This email's already used"` ([authControllers.js:17-19](../backend/src/controllers/authControllers.js#L17-L19)).

**Nguyên nhân:**

1. Hai thông báo lỗi khác nhau tiết lộ email có tồn tại hay không.
2. `express.json()` biến `{"email": {"$regex": "^a"}}` thành object. Mongoose mặc định **không** bật `sanitizeFilter`, và vẫn cho phép toán tử `$regex`, `$ne`, `$gt` trên trường kiểu String.
3. Không có rate limit (SEC-004).

**Ảnh hưởng:**

- **Mức cơ bản (đã xác nhận):** kẻ tấn công có danh sách email có thể kiểm tra email nào đã đăng ký JobRadar, phục vụ phishing hoặc credential stuffing.
- **Mức nâng cao (rủi ro tiềm ẩn):** gửi `email` dạng `{"$regex": "^a"}` rồi quan sát thông báo (`doesn't exist` hay `Invalid credentials`), lặp lại từng ký tự để **trích xuất toàn bộ email** trong DB mà không cần biết trước email nào.
- Ngoài ra còn có kênh rò rỉ theo thời gian: nhánh "email không tồn tại" trả về ngay, còn nhánh "sai mật khẩu" phải chạy bcrypt (~100ms).

**Tình huống kích hoạt:** gửi request trực tiếp tới `POST /api/auth/login`, không cần giao diện.

**Hướng xử lý:**

```js
if (typeof email !== "string" || typeof password !== "string") {
  return res.status(400).json({ message: "Invalid input" });
}
const normalizedEmail = email.trim().toLowerCase();
const user = await User.findOne({ email: normalizedEmail });
const ok = user && (await bcrypt.compare(password, user.password));
if (!ok) return res.status(401).json({ message: "Email hoặc mật khẩu không đúng" });
```

- Bật `mongoose.set("sanitizeFilter", true)` như một lớp phòng thủ bổ sung.
- Thêm rate limit (SEC-004).
- Với signup, có thể giữ thông báo "email đã tồn tại" để trải nghiệm tốt hơn, nhưng **bắt buộc** có rate limit.

---

<a id="arch-001"></a>
### ARCH-001 — Hai hệ thống xác thực song song (JWT tự làm + Clerk) không liên thông

| Thuộc tính | Nội dung |
|---|---|
| **Mức độ** | 🟠 High |
| **Loại** | Kiến trúc – Xác thực; Điểm lỗi đơn cấu hình |
| **Trạng thái** | ✅ Xác nhận (không liên thông: backend không có mã nào xử lý Clerk). Crash khi thiếu key: độ chắc chắn Cao, dựa trên hành vi đã biết của `@clerk/clerk-react` v5, chưa chạy thử. |
| **Độ chắc chắn** | Cao |

**Bằng chứng:**

```jsx
// main.jsx:8, 13
const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
<ClerkProvider publishableKey={PUBLISHABLE_KEY}> <App /> </ClerkProvider>

// SignUpPage.jsx:15-19
await signIn.authenticateWithRedirect({
  strategy: "oauth_google", redirectUrl: "/sso-callback", redirectUrlComplete: "/",
});
```

- Tìm `clerk` trong `backend/`: **không có kết quả**.
- `App.jsx` chỉ coi người dùng đã đăng nhập khi `authUser` (lấy từ `/api/auth/authCheck` bằng cookie JWT) khác `null`.
- Repo không có `.env.example` (OPS-002), và `frontend/.env` đã bị xoá khỏi tracking.

**Nguyên nhân:** tích hợp một dịch vụ auth bên ngoài ở phía giao diện mà chưa thiết kế luồng đồng bộ danh tính với backend (verify token Clerk, rồi tạo/tìm `User`, rồi phát cookie JWT).

**Ảnh hưởng:**

1. Bấm "Continue with Google": người dùng xác thực Google thành công với Clerk, được chuyển về `/`, nhưng `authUser` vẫn `null`, nên lại bị đẩy về `/login`. **Tính năng không dùng được**, và người dùng không nhận được thông báo nào.
2. Clone repo theo README mà không có Clerk key thì `ClerkProvider` ném lỗi thiếu publishable key, và **toàn bộ SPA không render**, kể cả đăng nhập bằng email.
3. Tăng số dịch vụ bên ngoài, tăng dependency (package đã deprecated, xem DEP-001), trong khi không đem lại giá trị.

**Tình huống kích hoạt:** bấm nút Google; hoặc chạy frontend thiếu biến `VITE_CLERK_PUBLISHABLE_KEY`.

**Hướng xử lý** (chọn một):

| Phương án | Khi nào chọn | Việc cần làm |
|---|---|---|
| **1. Gỡ Clerk (khuyến nghị ngắn hạn)** | Mục tiêu là portfolio, đăng nhập bằng email là đủ | Xoá `ClerkProvider`, nút Google, route `/sso-callback`, package |
| 2. Dùng Clerk toàn phần | Muốn bỏ tự quản lý mật khẩu | Backend dùng SDK của Clerk để verify session; ánh xạ Clerk user sang `User` nội bộ; bỏ JWT tự làm |
| 3. Google OAuth qua backend | Muốn học sâu OAuth | Frontend lấy Google ID token; backend verify rồi tạo/tìm `User` và phát cookie JWT như hiện tại |

> **Bài học:** thêm một nút "Continue with Google" chỉ mất vài dòng, nhưng **tích hợp danh tính** là bài toán của cả hệ thống, không phải riêng của giao diện.

---

<a id="biz-001"></a>
### BIZ-001 — Bộ lọc lương không hoạt động

| Thuộc tính | Nội dung |
|---|---|
| **Mức độ** | 🟠 High |
| **Loại** | Lỗi nghiệp vụ – Hợp đồng FE/BE; Dead code |
| **Trạng thái** | ✅ Xác nhận |
| **Độ chắc chắn** | Cao |

**Bằng chứng:**

```js
// JobSidebar.jsx:36-41 — frontend gửi mảng mã chuỗi
options: [{ label: "< $3k/month", value: "lt3k" }, { label: "$3k - $6k/month", value: "3k-6k" }, ...]
```

```js
// jobsControllers.js:37-44 — backend chờ một object lồng nhau
if (salary?.ranges?.length) {
  query.$or = salary.ranges.map((r) => ({
    "salary.min": { $lte: r.max }, "salary.max": { $gte: r.min },
    "salary.currency": salary.currency, "salary.period": salary.period,
  }));
}
```

**Nguyên nhân:**

1. Frontend và backend dùng hai contract khác nhau cho cùng một bộ lọc.
2. **Express 5 mặc định dùng query parser "simple"** (`node:querystring`), không bao giờ tạo object lồng nhau từ query string. Vì vậy `req.query.salary` chỉ có thể là chuỗi hoặc mảng chuỗi, và `salary.ranges` luôn `undefined`. Nhánh code này là **dead code** còn sót lại từ thiết kế cũ mà README đã nhắc ([README.md:68-69](../README.md#L68-L69)).
3. Về nghiệp vụ, dữ liệu lương có nhiều tiền tệ (`USD`, `VND`, `EUR`, `SGD`) và nhiều chu kỳ (`month`, `hour`, `year`). Nhãn "< $3k/month" không so sánh trực tiếp được với "20–40 USD/hour" hay "5.000–8.000 SGD/month".

**Ảnh hưởng:** người dùng chọn mức lương và bấm Search, kết quả **không thay đổi**, không có thông báo. Đây là tính năng được quảng bá trong README.

**Tình huống kích hoạt:** chọn bất kỳ lựa chọn nào trong nhóm "Salary Range".

**Hướng xử lý:**

- Định nghĩa contract phẳng: `salaryMin`, `salaryMax` (số), `currency`, `period`; backend chuyển kiểu bằng `Number()` và validate.
- Giải bài toán đa tiền tệ bằng một trong hai cách:
  - **Đơn giản:** bộ lọc lương bắt buộc chọn kèm `currency` và `period`.
  - **Tốt hơn:** khi nạp dữ liệu, tính thêm trường chuẩn hoá (ví dụ `salaryMonthlyUsd.min/max`) rồi lọc trên trường đó.
- Xoá nhánh `salary.ranges` cũ.

---

<a id="err-003"></a>
### ERR-003 — Không render `<Toaster />`: mọi thông báo đều vô hình

| Thuộc tính | Nội dung |
|---|---|
| **Mức độ** | 🟠 High |
| **Loại** | UX – Xử lý và phản hồi lỗi |
| **Trạng thái** | ✅ Xác nhận |
| **Độ chắc chắn** | Cao |

**Bằng chứng:** `grep -rn "Toaster" frontend/src frontend/index.html` không trả kết quả nào. Trong khi đó `toast.success`/`toast.error` được gọi ở [useAuthStore.js](../frontend/src/zustand/useAuthStore.js), [jobsStore.js](../frontend/src/zustand/jobsStore.js), [SignUpPage.jsx](../frontend/src/Pages/SignUpPage.jsx) và [LogInPage.jsx](../frontend/src/Pages/LogInPage.jsx).

**Nguyên nhân:** `react-hot-toast` chỉ hiển thị thông báo khi có component `<Toaster />` được mount ở đâu đó trong cây React.

**Ảnh hưởng:** người dùng **không nhận được phản hồi** trong mọi tình huống:

- Sai mật khẩu: spinner biến mất, form đứng yên.
- Email đã tồn tại khi đăng ký: không có thông báo.
- Lưu job lần hai: backend trả lỗi nhưng người dùng tưởng đã lưu.
- Upload avatar thất bại: không biết.

Cả hệ thống xử lý lỗi phía client, dù đã được viết, đều mất tác dụng.

**Tình huống kích hoạt:** mọi hành động gọi API.

**Hướng xử lý:** thêm `<Toaster position="top-right" />` vào [main.jsx](../frontend/src/main.jsx) hoặc [App.jsx](../frontend/src/App.jsx). **Sau khi thêm**, cần xử lý ngay CODE-004, vì các toast "Get jobs successfully" và "Checking Auth successfully" sẽ bắt đầu hiện ở mỗi lần tải trang.

---

### 🟡 Medium

<a id="sec-003"></a>
### SEC-003 — Log chứa dữ liệu nhạy cảm (JWT, password hash, dữ liệu người dùng)

| Thuộc tính | Nội dung |
|---|---|
| **Mức độ** | 🟡 Medium |
| **Loại** | Bảo mật – Logging (OWASP A09) |
| **Trạng thái** | ✅ Xác nhận |
| **Độ chắc chắn** | Cao |

**Bằng chứng:**

```js
// protectRouter.js:8-9 — chạy ở MỌI request được bảo vệ
console.log("protectRouter hit");
console.log("cookies:", req.cookies);          // in ra token JWT

// authControllers.js:107-114
const updatedUser = await User.findByIdAndUpdate(userId, {...}, { new: true });  // không select("-password")
console.log(updatedUser);                      // in ra cả password hash

// getSavedJobsController.js:8
console.log("savedJobs:", JSON.stringify(savedJobs, null, 2));
```

**Nguyên nhân:** log debug được để lại sau khi sửa lỗi, và chưa có quy ước về dữ liệu nào không được ghi log.

**Ảnh hưởng:** trên hosting (Render, v.v.), stdout được lưu và hiển thị trên dashboard, có thể còn được chuyển sang dịch vụ log bên ngoài. Ai đọc được log sẽ lấy được JWT còn hạn tới 7 ngày và **đăng nhập thay người dùng** (kết hợp SEC-006). Password hash bị lộ cũng làm tăng rủi ro bị bẻ khoá offline. Log dữ liệu lớn ở mỗi request còn làm chậm server và tốn chi phí lưu trữ log.

**Tình huống kích hoạt:** mọi request tới route được bảo vệ; mỗi lần đổi avatar.

**Hướng xử lý:** xoá các log trên. Nếu cần log thì dùng logger có cấp độ (ví dụ `pino`) với cấu hình `redact: ["req.headers.cookie", "*.password"]`. Luôn `select("-password")` khi lấy user để trả về hoặc ghi log.

---

<a id="sec-004"></a>
### SEC-004 — Không có rate limiting; chính sách mật khẩu yếu

| Thuộc tính | Nội dung |
|---|---|
| **Mức độ** | 🟡 Medium |
| **Loại** | Bảo mật – Xác thực (OWASP A07) |
| **Trạng thái** | ✅ Xác nhận (không có package hay middleware rate limit nào) |
| **Độ chắc chắn** | Cao |

**Bằng chứng:** [backend/package.json](../backend/package.json) không có `express-rate-limit` hay thư viện tương đương; [authRouters.js:13-14](../backend/src/routers/authRouters.js#L13-L14) gắn thẳng controller. Mật khẩu chỉ yêu cầu `password.length < 6` ([authControllers.js:21](../backend/src/controllers/authControllers.js#L21)).

**Nguyên nhân:** chưa có mô hình mối đe doạ (threat model) cho endpoint xác thực.

**Ảnh hưởng:** có thể thử mật khẩu không giới hạn (brute force, credential stuffing bằng danh sách mật khẩu bị lộ); có thể tạo hàng loạt tài khoản rác. Mỗi lần thử đều tốn CPU cho bcrypt, nên đây cũng là vector gây quá tải.

**Tình huống kích hoạt:** script gửi liên tục `POST /api/auth/login`.

**Hướng xử lý:** `express-rate-limit` cho `/api/auth/login` và `/api/auth/signup` (ví dụ 10 lần / 15 phút theo IP; nâng cao hơn là theo IP + email). Yêu cầu mật khẩu tối thiểu 8 ký tự, không cần ép quy tắc phức tạp (theo khuyến nghị NIST SP 800-63B).

---

<a id="sec-005"></a>
### SEC-005 — Regex injection / nguy cơ ReDoS trên endpoint tìm kiếm công khai

| Thuộc tính | Nội dung |
|---|---|
| **Mức độ** | 🟡 Medium |
| **Loại** | Bảo mật – Injection, từ chối dịch vụ |
| **Trạng thái** | ✅ Xác nhận (regex sai cú pháp trả 500; regex không dùng được index). ⚠️ Rủi ro tiềm ẩn (backtracking nặng trên MongoDB) |
| **Độ chắc chắn** | Trung bình |

**Bằng chứng:**

```js
// jobsRouters.js:16 — không có protectRouter
router.get("/search", JobsChecking);

// jobsControllers.js:25, 29-31
const regexes = city.map((c) => new RegExp(c.replace(/ /g, "\\s*"), "i"));
const regexes = region.map((r) => new RegExp(r.replace(/\s+/g, "\\s*"), "i"));
```

**Nguyên nhân:** chuỗi người dùng nhập được dùng trực tiếp làm **mẫu regex** mà không escape ký tự đặc biệt, không giới hạn độ dài hay số lượng phần tử.

**Ảnh hưởng:**

- `GET /api/jobs/search?city=(` khiến `new RegExp("(")` ném `SyntaxError`, và server trả 500.
- Người gọi có thể gửi hàng trăm tham số `city=...`, mỗi tham số là một regex không neo `^` và không phân biệt hoa thường. MongoDB không dùng được index cho loại regex này, nên phải **quét toàn collection** và thử từng regex với từng document.
- Mẫu regex có backtracking nặng sẽ tốn CPU phía MongoDB. Hiện tại các trường `city`/`region` ngắn nên hậu quả có giới hạn, nhưng endpoint không cần đăng nhập và không có rate limit.

**Tình huống kích hoạt:** gọi trực tiếp endpoint, không cần tài khoản.

**Hướng xử lý:**

- Vì giá trị city/region đến từ **danh sách cố định**, cách đúng là so khớp chính xác với giá trị đã chuẩn hoá (`{ "location.city": { $in: ["Ha Noi", ...] } }`), có thể kèm một whitelist.
- Nếu thật sự cần tìm kiếm mờ: escape bằng `s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")`, giới hạn độ dài chuỗi và số phần tử (ví dụ ≤ 10).
- Thêm rate limit cho endpoint công khai.

---

<a id="sec-006"></a>
### SEC-006 — Vòng đời JWT: không thu hồi được, thời hạn dài, secret yếu

| Thuộc tính | Nội dung |
|---|---|
| **Mức độ** | 🟡 Medium |
| **Loại** | Bảo mật – Quản lý phiên |
| **Trạng thái** | ✅ Xác nhận (thiết kế). ❓ Không biết secret hiện tại có còn yếu hay không. |
| **Độ chắc chắn** | Cao |

**Bằng chứng:**

```js
// generateToken.js:7-9
jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: "7d" });

// authControllers.js:77 — logout chỉ xoá cookie ở trình duyệt
res.cookie("token", "", { maxAge: 0 });
```

`JWT_SECRET` trong commit `f7e88b3` rất ngắn (xem SEC-001).

**Nguyên nhân:** JWT là stateless. Nếu không có cơ chế bổ sung thì token hợp lệ cho tới khi hết hạn, bất kể người dùng đã logout.

**Ảnh hưởng:**

- Token bị lộ (qua log ở SEC-003, hoặc máy dùng chung) vẫn dùng được **tới 7 ngày** sau khi logout.
- Không có cách "đăng xuất khỏi mọi thiết bị".
- Với thuật toán HS256 và secret ngắn, kẻ tấn công có trong tay một token hợp lệ có thể brute-force offline để tìm ra secret, rồi tự ký token cho bất kỳ user nào.

**Tình huống kích hoạt:** token bị lộ; hoặc secret yếu bị brute-force.

**Hướng xử lý:**

- Secret ngẫu nhiên ≥ 32 byte, chỉ đặt trong biến môi trường.
- Thêm `tokenVersion` (số nguyên) vào `User` và đưa vào payload. Middleware so sánh với DB (hiện đã truy vấn `User` mỗi request nên gần như không tốn thêm). Khi logout-all hoặc đổi mật khẩu thì tăng `tokenVersion`.
- Rút ngắn thời hạn (ví dụ 1 ngày). Access/refresh token là bước nâng cao, **chưa cần** ở quy mô này.
- Xoá cookie bằng `res.clearCookie("token", { httpOnly, sameSite, secure })` với cùng tuỳ chọn như lúc tạo.

---

<a id="sec-007"></a>
### SEC-007 — Upload ảnh đại diện không được kiểm soát

| Thuộc tính | Nội dung |
|---|---|
| **Mức độ** | 🟡 Medium |
| **Loại** | Bảo mật – File upload, lạm dụng tài nguyên |
| **Trạng thái** | ✅ Xác nhận (thiếu validate, limit toàn cục, không xoá ảnh cũ). ⚠️ Rủi ro tiềm ẩn (hành vi SDK với chuỗi không phải data URI) |
| **Độ chắc chắn** | Trung bình |

**Bằng chứng:**

```js
// index.js:16-17 — áp cho MỌI route
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ limit: "10mb", extended: true }));

// authControllers.js:104-105 — chuỗi bất kỳ được chuyển thẳng cho SDK
if (profilePic) {
  const putCloud = await cloudinary.uploader.upload(profilePic);
```

Frontend không kiểm tra kích thước file ([ProfilePage.jsx:9-18](../frontend/src/Pages/ProfilePage.jsx#L9-L18)).

**Nguyên nhân:** tin tưởng dữ liệu gửi từ client; chưa phân biệt yêu cầu tài nguyên của route upload với các route khác.

**Ảnh hưởng:**

- **Lạm dụng quota Cloudinary:** `uploader.upload` chấp nhận cả **URL từ xa** (Cloudinary tự tải về). Người dùng đã đăng nhập có thể gửi URL ảnh bất kỳ hàng loạt lần.
- **Rủi ro tiềm ẩn:** với chuỗi không phải URL hay data URI, SDK Node của Cloudinary coi đó là **đường dẫn file cục bộ trên server** và cố đọc để upload. Loại tài nguyên mặc định là `image` nên file không phải ảnh sẽ bị từ chối, nhưng đây vẫn là hành vi server đọc file theo đường dẫn do người dùng chỉ định (cần kiểm chứng).
- **Tài nguyên server:** mọi route (kể cả `/login`) chấp nhận JSON 10MB, và việc parse diễn ra trong event loop.
- **Rác lưu trữ:** mỗi lần đổi avatar tạo một ảnh mới, ảnh cũ không bị xoá.

**Tình huống kích hoạt:** gọi `PUT /api/auth/profileUpdate` với `profilePic` là URL, đường dẫn hoặc data URI rất lớn.

**Hướng xử lý:**

- Validate: `^data:image/(png|jpe?g|webp);base64,` và kích thước sau decode ≤ 2MB.
- Body limit mặc định 100kb; chỉ route upload mới dùng limit lớn hơn.
- Upload với `{ folder: "avatars", public_id: String(userId), overwrite: true, resource_type: "image", allowed_formats: ["jpg","png","webp"] }`: ghi đè ảnh cũ, không sinh rác.
- Nâng cao: dùng *signed upload* để trình duyệt upload thẳng lên Cloudinary, backend chỉ lưu URL.

---

<a id="val-001"></a>
### VAL-001 — Thiếu lớp validation dữ liệu đầu vào ở backend

| Thuộc tính | Nội dung |
|---|---|
| **Mức độ** | 🟡 Medium |
| **Loại** | Validation / Xử lý lỗi |
| **Trạng thái** | ✅ Xác nhận (tĩnh, dựa trên hành vi đã được tài liệu hoá của Express 5 và bcryptjs) |
| **Độ chắc chắn** | Cao |

**Bằng chứng và các tình huống cụ thể:**

| # | Đầu vào bất thường | Code | Kết quả |
|---|---|---|---|
| 1 | `POST /login` không có header `Content-Type: application/json` | [authControllers.js:49](../backend/src/controllers/authControllers.js#L49): `const { email, password } = req.body;` nằm **ngoài** `try` | Express 5 để `req.body = undefined`, destructure ném `TypeError`, rơi vào handler mặc định: **500 + trang HTML có stack trace** (khi `NODE_ENV` không phải `production`) |
| 2 | `{"password": 1234567}` (số) khi signup | [authControllers.js:21, 28](../backend/src/controllers/authControllers.js#L21-L28) | `(1234567).length` là `undefined`, nên kiểm tra độ dài bị bỏ qua; `bcrypt.hash(number)` ném lỗi, trả 500 |
| 3 | `{"profilePic": false}` | [authControllers.js:100-130](../backend/src/controllers/authControllers.js#L100-L130) | Không khớp nhánh nào nên **không có response**, request treo tới khi timeout |
| 4 | `DELETE /jobs/deleteds/abc` | [deleteSavedJobControllers.js:11](../backend/src/controllers/deleteSavedJobControllers.js#L11) | `CastError`, trả 500 thay vì 400 |
| 5 | `POST /jobs/save/abc` | [saveJobControllers.js:15](../backend/src/controllers/saveJobControllers.js#L15) | `CastError`, trả 500 |
| 6 | `?page=-5` hoặc `?page=1e9` | [jobsControllers.js:46-48](../backend/src/controllers/jobsControllers.js#L46-L48) | `skip` âm làm MongoDB báo lỗi (500); `skip` cực lớn gây truy vấn nặng |
| 7 | `fullName` dài 1MB | [userSchema.js:5-8](../backend/src/schemaModel/userSchema.js#L5-L8) | Được lưu nguyên vẹn |

Trường hợp 3 đáng suy ngẫm, vì chính README đã ghi bài học *"Middleware must always end with res.something() or next() — a missing branch silently hangs requests"* ([README.md:82](../README.md#L82)).

**Nguyên nhân:** validation được viết tay bằng các câu `if` rải rác, chỉ kiểm tra "có giá trị hay không" chứ không kiểm tra **kiểu, định dạng, giới hạn**. Ngoài ra, Express 5 đã thay đổi hành vi so với Express 4, cụ thể `req.body` không còn mặc định là `{}`.

**Ảnh hưởng:** lộ stack trace (thông tin nội bộ), request treo chiếm kết nối, mã lỗi sai khiến client không xử lý đúng, dữ liệu rác vào DB.

**Hướng xử lý:** một middleware validate dùng schema, áp cho từng route:

```js
// ví dụ với zod
const loginSchema = z.object({ email: z.string().email().max(254), password: z.string().min(1).max(128) });
const validate = (schema) => (req, res, next) => {
  const r = schema.safeParse(req.body ?? {});
  if (!r.success) return res.status(400).json({ error: r.error.flatten() });
  req.body = r.data; next();
};
router.post("/login", validate(loginSchema), login);
```

Thêm `isValidObjectId(id)` cho các route có `:id`, và **error handler tập trung** để không lộ stack trace (ERR-009).

---

<a id="err-004"></a>
### ERR-004 — `updateProfile` có ReferenceError và một lỗi thứ hai "nằm chờ"

| Thuộc tính | Nội dung |
|---|---|
| **Mức độ** | 🟡 Medium |
| **Loại** | Lỗi logic frontend |
| **Trạng thái** | ✅ Xác nhận |
| **Độ chắc chắn** | Cao |

**Bằng chứng:**

```js
// useAuthStore.js:67-81
updateProfile: async (profilePic) => {
  ...
  const res = await axiosInstance.put("/auth/profileUpdate", { profilePic });
  console.log("aucheck", authUser);            // ① authUser không được khai báo trong phạm vi này
  set({ authUser: res.data.profilePic });      // ② nếu chạy tới đây: ghi đè object user bằng CHUỖI URL
  toast.success("Update Pic successfully");
} catch (error) {
  toast.error(error.response?.data?.message || "Update Pic failed");
```

**Nguyên nhân:** ① dòng log debug tham chiếu biến không tồn tại (store chỉ có `get()` để đọc state). ② Nhầm lẫn giữa "cập nhật một trường" và "thay cả object".

**Ảnh hưởng:**

- Hiện tại: request đã thành công và server đã lưu ảnh mới, nhưng client ném `ReferenceError`, rơi vào `catch`, báo "Update Pic failed" (vô hình, xem ERR-003). `authUser.profilePic` không được cập nhật; người dùng chỉ thấy ảnh mới nhờ `preview` hoặc sau khi F5.
- **Lỗi nằm chờ:** nếu ai đó chỉ xoá dòng ①, dòng ② biến `authUser` thành chuỗi. Khi đó `authUser.fullName`, `authUser.email` là `undefined`, trang Profile trống thông tin, nhưng guard vẫn coi là đã đăng nhập (vì chuỗi là truthy).

**Tình huống kích hoạt:** mỗi lần đổi avatar.

**Hướng xử lý:**

```js
set((state) => ({ authUser: { ...state.authUser, profilePic: res.data.profilePic } }));
```

> **Bài học:** khi sửa một lỗi, hãy đọc lại **cả khối code xung quanh**. Lỗi thứ nhất đôi khi đang che lỗi thứ hai.

---

<a id="err-005"></a>
### ERR-005 — Bootstrap xác thực: redirect trước khi `authCheck` kịp chạy

| Thuộc tính | Nội dung |
|---|---|
| **Mức độ** | 🟡 Medium |
| **Loại** | Lỗi luồng xác thực frontend (race khi khởi động) |
| **Trạng thái** | ✅ Xác nhận (tĩnh) |
| **Độ chắc chắn** | Cao |

**Bằng chứng:**

```js
// useAuthStore.js:5-6
authUser: null,
isCheckingAuth: false,     // ← giá trị ban đầu

// App.jsx:20-22, 26, 57-62
useEffect(() => { authCheck(); }, [authCheck]);
if (isCheckingAuth) return <Loader/>;
<Route path="/savedJobs" element={authUser ? <SavedjobsPage/> : <Navigate to="/login" replace/>} />
```

**Nguyên nhân:** ở lần render đầu tiên, `isCheckingAuth=false` và `authUser=null`, nên `<Navigate to="/login">` được render. Effect của component con (`Navigate`) chạy **trước** effect của component cha (`App`), nên URL đổi sang `/login` trước khi `authCheck()` được gọi. Khi `authCheck` thành công, route `/login` thấy đã có `authUser` và chuyển tiếp sang `/`.

**Ảnh hưởng:** người dùng đã đăng nhập mà F5 hoặc mở link trực tiếp tới `/savedJobs`, `/appliedJobs`, `/settings` đều bị đưa về trang chủ. Màn hình nháy qua trang login. Việc chia sẻ hoặc bookmark URL không dùng được.

**Tình huống kích hoạt:** F5 ở bất kỳ trang được bảo vệ nào ngoài `/`.

**Hướng xử lý:** khởi tạo `isCheckingAuth: true`. Nâng cao hơn: tách `ProtectedRoute` có ghi nhớ `location` để quay lại đúng trang sau khi đăng nhập.

---

<a id="err-006"></a>
### ERR-006 — Token hết hạn hoặc sai chữ ký bị trả về 500 thay vì 401

| Thuộc tính | Nội dung |
|---|---|
| **Mức độ** | 🟡 Medium |
| **Loại** | Xử lý lỗi – Xác thực |
| **Trạng thái** | ✅ Xác nhận |
| **Độ chắc chắn** | Cao |

**Bằng chứng:**

```js
// protectRouter.js:15-28
const decodedToken = jwt.verify(token, process.env.JWT_SECRET);   // NÉM lỗi nếu token sai/hết hạn
if (!decodedToken) { return res.status(401)... }                  // không bao giờ xảy ra
...
} catch (error) {
  console.error("ProtectRouter Checking Error");                 // không log lý do
  res.status(500).json({ message: "Server Error" });
}
```

**Nguyên nhân:** hiểu nhầm API của `jsonwebtoken`: `verify` không trả `null`/`false` khi thất bại mà **ném** `TokenExpiredError` hoặc `JsonWebTokenError`.

**Ảnh hưởng:** sau 7 ngày, mọi người dùng nhận 500 thay vì 401. Hệ thống giám sát sẽ ghi nhận "server lỗi" hàng loạt. Nếu sau này thêm interceptor "401 → đăng xuất và về trang login" thì interceptor sẽ không bắt được trường hợp này. Log không ghi lý do nên khó debug.

**Tình huống kích hoạt:** token hết hạn; secret bị đổi (ví dụ sau khi rotate ở SEC-001); cookie bị chỉnh sửa.

**Hướng xử lý:**

```js
try {
  const { userId } = jwt.verify(token, env.JWT_SECRET);
  ...
} catch (err) {
  if (err.name === "TokenExpiredError" || err.name === "JsonWebTokenError") {
    return res.status(401).json({ message: "Session expired" });
  }
  next(err);
}
```

---

<a id="biz-002"></a>
### BIZ-002 — Bộ lọc Region không bao giờ khớp dữ liệu

| Thuộc tính | Nội dung |
|---|---|
| **Mức độ** | 🟡 Medium |
| **Loại** | Nghiệp vụ – Từ điển dữ liệu không thống nhất |
| **Trạng thái** | ✅ Xác nhận (đối chiếu với dữ liệu seed) |
| **Độ chắc chắn** | Cao |

**Bằng chứng:**

```js
// JobSidebar.jsx:55-59
{ label: "Miền Bắc", value: "Miền Bắc" }, { label: "Miền Trung", value: "Miền Trung" }, { label: "Miền Nam", value: "Miền Nam" }
```

```js
// seeds/jobs.seeds.js:19, 43, 67, 91, 115 — giá trị region thực tế
region: "Vietnam" | "Singapore" | "Vietnam" | "Vietnam" | "South Korea"
```

**Nguyên nhân:** không có định nghĩa chung cho ý nghĩa của trường `region` (khu vực trong nước hay quốc gia?). Schema để `String` tự do ([jobschema.js:49-52](../backend/src/schemaModel/jobschema.js#L49-L52)), không có `enum`.

**Ảnh hưởng:** chọn bất kỳ Region nào cũng ra **0 kết quả**, và vì các điều kiện lọc kết hợp bằng AND, kết quả của các bộ lọc khác cũng bị xoá sạch. Người dùng sẽ nghĩ không có việc làm phù hợp.

**Tình huống kích hoạt:** chọn một lựa chọn Region rồi bấm Search.

**Hướng xử lý:** thống nhất ngữ nghĩa, ví dụ tách `country` và `region` (vùng trong nước); dùng `enum` trong schema; frontend lấy danh sách lựa chọn từ một file hằng số dùng chung, hoặc từ endpoint `GET /api/jobs/filters`.

---

<a id="biz-003"></a>
### BIZ-003 — Hiển thị lương sai đơn vị

| Thuộc tính | Nội dung |
|---|---|
| **Mức độ** | 🟡 Medium |
| **Loại** | Nghiệp vụ – Hiển thị dữ liệu |
| **Trạng thái** | ✅ Xác nhận (code + [screenshots/homepage.png](../screenshots/homepage.png) hiển thị "$1200k - $2000k") |
| **Độ chắc chắn** | Cao |

**Bằng chứng:**

```jsx
// JobCard.jsx:119
${salary.min}k - ${salary.max}k
```

Dữ liệu: `{ min: 1200, max: 2000, currency: "USD", period: "month" }`; `{ min: 20, max: 40, currency: "USD", period: "hour" }`; `{ min: 5000, max: 8000, currency: "SGD", ... }`.

**Nguyên nhân:** giả định sai về đơn vị lưu trữ (nghĩ là nghìn USD) và bỏ qua `currency`, `period`.

**Ảnh hưởng:** "$1200k" (1,2 triệu USD) thay vì 1.200 USD/tháng; lương theo giờ hiện "$20k"; lương SGD hiện ký hiệu `$`. Với sản phẩm việc làm, **sai thông tin lương là sai thông tin cốt lõi**.

**Tình huống kích hoạt:** mọi job card ở trang chủ.

**Hướng xử lý:**

```js
const formatSalary = ({ min, max, currency, period }) => {
  const f = new Intl.NumberFormat("en-US", { style: "currency", currency, maximumFractionDigits: 0 });
  return `${f.format(min)} – ${f.format(max)} / ${period}`;
};
```

---

<a id="biz-004"></a>
### BIZ-004 — Trang Saved Jobs hiển thị sai hạn nộp

| Thuộc tính | Nội dung |
|---|---|
| **Mức độ** | 🟡 Medium |
| **Loại** | Nghiệp vụ – Hiển thị dữ liệu |
| **Trạng thái** | ✅ Xác nhận (code + [screenshots/saved-jobs.png](../screenshots/saved-jobs.png): "Deadline: Jun 6, 2026" cho job có `expiredAt` là 31/12/2026, trong khi trang chủ hiển thị đúng 31/12/2026) |
| **Độ chắc chắn** | Cao |

**Bằng chứng:**

```jsx
// SavedjobsPage.jsx:34
deadline={job.jobId.updatedAt}
```

**Nguyên nhân:** chọn nhầm trường (có thể do gợi ý tự động của editor).

**Ảnh hưởng:** người dùng dựa vào hạn nộp để quyết định ứng tuyển. Ngày sai có thể khiến họ bỏ lỡ hoặc tưởng đã hết hạn.

**Tình huống kích hoạt:** mọi card ở trang Saved Jobs.

**Hướng xử lý:** `deadline={job.jobId.expiredAt}`. Nên có một hàm `formatDate` dùng chung, vì trang chủ đang định dạng `en-GB` còn trang Saved định dạng `en-US`.

---

<a id="biz-005"></a>
### BIZ-005 — Tin tuyển dụng hết hạn vẫn được hiển thị

| Thuộc tính | Nội dung |
|---|---|
| **Mức độ** | 🟡 Medium |
| **Loại** | Nghiệp vụ – Vòng đời dữ liệu |
| **Trạng thái** | ✅ Xác nhận |
| **Độ chắc chắn** | Cao |

**Bằng chứng:**

- [getJobsList.js:5](../backend/src/controllers/getJobsList.js#L5): `Job.find()`, không có bất kỳ điều kiện nào (kể cả `isActive`).
- [jobsControllers.js:16](../backend/src/controllers/jobsControllers.js#L16): chỉ lọc `isActive: true`, không lọc `expiredAt`.
- Không có đoạn code nào cập nhật `isActive` sau khi tạo.
- `node-cron` có trong [package.json:23](../backend/package.json#L23) nhưng không được import ở đâu cả.
- Seed có job với `expiredAt: new Date("2026-08-31")` ([jobs.seeds.js:126](../backend/seeds/jobs.seeds.js#L126)), tức **đã hết hạn** tại thời điểm phân tích (17/09/2026).

**Nguyên nhân:** có vẻ tác giả dự định dùng cron job để tắt `isActive` nhưng chưa làm.

**Ảnh hưởng:** người dùng thấy và lưu các tin đã hết hạn.

**Tình huống kích hoạt:** mở trang chủ.

**Hướng xử lý:** **không cần cron.** Chỉ cần thêm điều kiện vào truy vấn: `{ isActive: true, expiredAt: { $gte: new Date() } }`. Cách này đơn giản, luôn đúng theo thời gian thực, và không có job nền phải vận hành. Nếu sau này muốn dọn dữ liệu thì có thể dùng TTL index hoặc cron.

---

<a id="biz-006"></a>
### BIZ-006 — Phân trang không hoàn chỉnh: chỉ xem được 10 kết quả tìm kiếm đầu tiên

| Thuộc tính | Nội dung |
|---|---|
| **Mức độ** | 🟡 Medium |
| **Loại** | Nghiệp vụ – API/UI |
| **Trạng thái** | ✅ Xác nhận |
| **Độ chắc chắn** | Cao |

**Bằng chứng:**

- Backend: `limit = 10`, trả `page`, `totalPages` ([jobsControllers.js:46-61](../backend/src/controllers/jobsControllers.js#L46-L61)).
- Frontend: payload không có `page` ([JobSidebar.jsx:88-95](../frontend/src/components/JobSidebar.jsx#L88-L95)); store bỏ qua `totalPages` ([jobsStore.js:58](../frontend/src/zustand/jobsStore.js#L58)); không có component phân trang.
- `/getjobs` không phân trang ([getJobsList.js:5](../backend/src/controllers/getJobsList.js#L5)).

**Nguyên nhân:** hai endpoint list được viết ở hai thời điểm với hai cách tiếp cận khác nhau, và UI chưa được nối hết.

**Ảnh hưởng:** kết quả tìm kiếm từ thứ 11 trở đi **không bao giờ hiển thị**. Ngược lại, trang chủ tải toàn bộ job. Hiện tại chỉ có 5 job nên chưa lộ lỗi, nhưng sẽ lộ ngay khi dữ liệu thật được nạp.

**Tình huống kích hoạt:** DB có > 10 job khớp bộ lọc.

**Hướng xử lý:** gộp thành một endpoint `GET /api/jobs?page=&limit=&...filters`, trả `{ data, meta: { page, totalPages, total } }`; UI có nút "Trang trước/sau" hoặc "Tải thêm".

---

<a id="biz-009"></a>
### BIZ-009 — Nút "View Job" ở trang chủ không hoạt động

| Thuộc tính | Nội dung |
|---|---|
| **Mức độ** | 🟡 Medium |
| **Loại** | Nghiệp vụ – UI, props không khớp dữ liệu |
| **Trạng thái** | ✅ Xác nhận |
| **Độ chắc chắn** | Cao |

**Bằng chứng:**

```jsx
// JobsList.jsx:12 — trải toàn bộ document Job làm props
<JobCard key={job._id} {...job} jobId={job._id} />

// JobCard.jsx:17, 148-150 — đọc prop "url"
url,
<a href={url} target="_blank" rel="noreferrer">View Job</a>
```

Schema Job chỉ có `sourceUrl` ([jobschema.js:88-92](../backend/src/schemaModel/jobschema.js#L88-L92)). Để so sánh, trang Saved và Applied truyền đúng `url={job.jobId.sourceUrl}` ([SavedjobsPage.jsx:36](../frontend/src/Pages/SavedjobsPage.jsx#L36)).

**Nguyên nhân:** dùng spread `{...job}` nên không có bước ánh xạ tên trường tường minh. JavaScript không báo lỗi khi prop không tồn tại, và dự án không dùng TypeScript hay PropTypes.

**Ảnh hưởng:** `href={undefined}` khiến React bỏ thuộc tính `href`, và thẻ `<a>` không còn là liên kết. Người dùng bấm "View Job" **không có gì xảy ra**, không thể mở tin gốc để ứng tuyển từ trang chủ.

**Tình huống kích hoạt:** bấm "View Job" trên bất kỳ card nào ở trang chủ.

**Hướng xử lý:** truyền props tường minh (`url={job.sourceUrl}`), bỏ spread. Cân nhắc TypeScript hoặc JSDoc để editor cảnh báo khi prop không khớp.

---

<a id="arch-002"></a>
### ARCH-002 — Không có hợp đồng API thống nhất

| Thuộc tính | Nội dung |
|---|---|
| **Mức độ** | 🟡 Medium |
| **Loại** | Kiến trúc – API design |
| **Trạng thái** | ✅ Xác nhận |
| **Độ chắc chắn** | Cao |

**Bằng chứng:** xem bảng API catalog ở [04 §3](04-PHAN-TICH-MODULE-VA-LUONG-DU-LIEU.md). Tóm tắt:

| Endpoint | Shape thành công |
|---|---|
| `GET /jobs/getjobs` | `Job[]` |
| `GET /jobs/search` | `{ success, data, page, totalPages }` |
| `GET /jobs/saved` | `{ savedJobs }` |
| `POST /jobs/save/:id` | `{ message, newJobUpdate }` |
| `POST /jobs/apply/:id` | `{ message, newJobApply }` |
| `DELETE /jobs/deleteds/:id` | `{ message, deleteJob }` |
| `POST /auth/login` | `{ fullName, email, profilePic, createdAt }` (không có `_id`) |
| `GET /auth/authCheck` | `{ message, user }` (có `_id`) |

**Nguyên nhân:** mỗi endpoint được viết độc lập khi cần, không có bước thiết kế API trước.

**Ảnh hưởng:** là **nguyên nhân gốc** của ERR-002; frontend phải nhớ từng shape; không viết được hàm xử lý response chung; khó viết tài liệu và test.

**Tình huống kích hoạt:** mọi thay đổi ở một đầu mà không đồng bộ với đầu kia.

**Hướng xử lý:** chọn một quy ước và áp dụng dần, ví dụ:

```text
Thành công:  { "data": <object | array>, "meta"?: { page, totalPages, total } }
Thất bại:    { "error": { "code": "JOB_ALREADY_SAVED", "message": "..." } }
```

Viết bảng API trong README (hoặc OpenAPI) **trước** khi viết endpoint mới.

---

<a id="db-002"></a>
### DB-002 — Thiếu unique compound index cho bookmark; check-then-act gây trùng lặp

| Thuộc tính | Nội dung |
|---|---|
| **Mức độ** | 🟡 Medium |
| **Loại** | Database – Ràng buộc, race condition, index |
| **Trạng thái** | ✅ Xác nhận (thiếu index). ⚠️ Rủi ro tiềm ẩn (race cần các request gần như đồng thời) |
| **Độ chắc chắn** | Cao |

**Bằng chứng:**

```js
// savedJobsschema.js / appliedJobschema.js — không có schema.index(...)
// saveJobControllers.js:15-23
const existingSave = await SaveJob.findOne({ userId, jobId });   // ① kiểm tra
if (existingSave) return ...;
await SaveJob.create({ userId, jobId });                         // ② ghi
```

**Nguyên nhân:** giữa bước ① và ② có một khoảng thời gian. Hai request đến gần như cùng lúc đều thấy "chưa có", rồi cả hai cùng tạo bản ghi. Chỉ ràng buộc ở tầng DB mới chặn được hoàn toàn trường hợp này.

**Ảnh hưởng:**

- Bản ghi trùng làm một job xuất hiện 2 lần ở trang Saved; bộ đếm sai; xoá một bản thì bản kia vẫn còn.
- `SaveJob.find({ userId })` và `ApplyJob.find({ userId })` **không có index** trên `userId`, nên khi collection lớn sẽ phải quét toàn bộ.

**Tình huống kích hoạt:** double-click rất nhanh (nút chỉ bị disable sau khi state cập nhật), mở 2 tab, mạng chậm khiến client gửi lại, hoặc gọi API song song.

**Hướng xử lý:**

```js
savedJobSchema.index({ userId: 1, jobId: 1 }, { unique: true });  // index này cũng phục vụ find({ userId })
```

```js
try { await SaveJob.create({ userId, jobId }); }
catch (e) { if (e.code === 11000) return res.status(409).json({ message: "Already saved" }); throw e; }
```

⚠️ **Lưu ý vận hành:** nếu DB đã có bản ghi trùng thì việc tạo unique index sẽ **thất bại**. Phải dọn dữ liệu trùng trước.

---

<a id="db-003"></a>
### DB-003 — Script seed phá huỷ dữ liệu và không có cơ chế migration

| Thuộc tính | Nội dung |
|---|---|
| **Mức độ** | 🟡 Medium |
| **Loại** | Seed / Migration / Vận hành dữ liệu |
| **Trạng thái** | ✅ Xác nhận |
| **Độ chắc chắn** | Cao |

**Bằng chứng:**

```js
// seeds/jobs.seeds.js:131-143
const seedDatabase = async () => {
  try {
    await connectDB();                 // connectDB gọi process.exit(1) khi lỗi → finally không chạy
    await Job.deleteMany({});          // xoá TOÀN BỘ job, không điều kiện, không hỏi lại
    await Job.insertMany(fakeJobs);
  } catch (error) { console.log(...) }
  finally { mongoose.disconnect(); }   // không await
};
```

- Không có script `seed` trong [backend/package.json](../backend/package.json#L5-L7); README không hướng dẫn.
- `config({ path: "../.env" })` ([dòng 5](../backend/seeds/jobs.seeds.js#L5)) chạy **sau** `dotenv.config()` bên trong `connectDB.js` (do import được hoist), nên file `.env` thực sự được nạp phụ thuộc thư mục đang đứng khi chạy lệnh.

**Nguyên nhân:** seed được viết cho một lần dùng trên DB phát triển, chưa tính tới việc chạy lại hay chạy nhầm môi trường.

**Ảnh hưởng:** chạy nhầm trên DB có dữ liệu thật (dễ xảy ra khi `.env` trỏ tới DB cloud dùng chung, như chuỗi kết nối có credentials ở SEC-001 gợi ý) sẽ mất toàn bộ job và gây DB-001 cho mọi người dùng.

**Tình huống kích hoạt:** chạy lại seed để "cập nhật dữ liệu mẫu".

**Hướng xử lý:**

- Upsert theo khoá tự nhiên `sourceUrl` (đã `unique`):
  ```js
  await Job.bulkWrite(fakeJobs.map((j) => ({
    updateOne: { filter: { sourceUrl: j.sourceUrl }, update: { $set: j }, upsert: true },
  })));
  ```
- Chặn chạy khi `NODE_ENV === "production"`; `await mongoose.disconnect()`; `connectDB` nên ném lỗi thay vì `process.exit`.
- Thêm `"seed": "node seeds/jobs.seeds.js"` và ghi vào README.
- Khi schema bắt đầu thay đổi, cân nhắc công cụ migration như `migrate-mongo`. **Chưa cần ngay.**

---

<a id="ops-002"></a>
### OPS-002 — Thiếu các thành phần tối thiểu để chạy và deploy

| Thuộc tính | Nội dung |
|---|---|
| **Mức độ** | 🟡 Medium |
| **Loại** | Triển khai / Onboarding |
| **Trạng thái** | ✅ Xác nhận |
| **Độ chắc chắn** | Cao |

**Bằng chứng:**

- [backend/package.json:5-7](../backend/package.json#L5-L7) chỉ có `"dev": "nodemon src/index.js"`, không có `start`.
- `nodemon` nằm trong `dependencies` ([dòng 24](../backend/package.json#L24)), không nằm trong `devDependencies`.
- Không có `.env.example` ở backend lẫn frontend; README không liệt kê biến môi trường.
- Không có đoạn code nào kiểm tra biến môi trường bắt buộc khi khởi động.
- Không khai báo `engines.node`.

**Nguyên nhân:** dự án mới chạy trên máy tác giả, nơi `.env` đã có sẵn.

**Ảnh hưởng:** người khác clone về không biết cần tạo biến gì (7 biến backend, 1 biến frontend); nền tảng deploy không có lệnh `start` chuẩn; production cài thêm `nodemon` không cần thiết; thiếu biến chỉ lộ ra khi request đầu tiên thất bại (ERR-007).

**Tình huống kích hoạt:** onboarding người mới; cấu hình Render.

**Hướng xử lý:** thêm `"start": "node src/index.js"`, chuyển `nodemon` sang `devDependencies`; tạo `.env.example`; thêm module `config/env.js` kiểm tra đủ biến rồi mới khởi động; khai báo `"engines": { "node": ">=20" }`.

---

<a id="test-001"></a>
### TEST-001 — Không có kiểm thử tự động và CI

| Thuộc tính | Nội dung |
|---|---|
| **Mức độ** | 🟡 Medium |
| **Loại** | Kiểm thử / Độ tin cậy |
| **Trạng thái** | ✅ Xác nhận |
| **Độ chắc chắn** | Cao |

**Bằng chứng:** không có file `*.test.*`/`*.spec.*`, không có thư mục `__tests__`, không có thư mục `.github/`, không có script `test` ở cả hai `package.json`. ESLint chỉ cấu hình cho frontend.

**Nguyên nhân:** chưa hình thành thói quen kiểm thử. Việc kiểm tra dựa vào thao tác tay và Postman.

**Ảnh hưởng:** tất cả lỗi Critical/High trong báo cáo này đều là loại mà **một test đơn giản có thể phát hiện**: import sai tên (chỉ cần chạy CI trên Linux), shape response (test store), filter không có tác dụng (test API), crash trang Saved (E2E). Không có test cũng khiến việc refactor theo [12](12-LO-TRINH-CAI-THIEN.md) trở nên rủi ro.

**Tình huống kích hoạt:** mọi thay đổi code.

**Hướng xử lý:** xem kế hoạch chi tiết trong [10 — Kiểm thử và độ tin cậy](10-KIEM-THU-VA-DO-TIN-CAY.md).

---

### 🟢 Low

<a id="err-007"></a>
### ERR-007 — `generateToken` async không được await; server listen trước khi có DB

- **Mức độ / Loại / Trạng thái / Độ chắc chắn:** 🟢 Low · Runtime – Cấu hình · ✅ Xác nhận (tĩnh) · Cao
- **Bằng chứng:** [generateToken.js:6](../backend/src/utils/generateToken.js#L6) khai báo `async` dù bên trong không có `await`. [authControllers.js:36, 62](../backend/src/controllers/authControllers.js#L36) gọi mà không `await`. [index.js:23-26](../backend/src/index.js#L23-L26) gọi `connectDB()` bên trong callback của `listen`.
- **Nguyên nhân:** dùng `async` theo thói quen; chưa phân biệt lỗi đồng bộ với promise bị reject.
- **Ảnh hưởng:** nếu thiếu `JWT_SECRET`, `jwt.sign` ném lỗi bên trong hàm async, tạo ra promise bị reject mà **không ai bắt**. Từ Node 15, mặc định tiến trình sẽ **thoát** khi có unhandled rejection. Kết quả: user đã được tạo trong DB, response 201 có thể đã gửi đi (không kèm cookie), rồi server sập. Ngoài ra, server nhận request trước khi DB sẵn sàng (Mongoose buffer tối đa 10 giây rồi báo lỗi).
- **Tình huống kích hoạt:** deploy thiếu biến `JWT_SECRET`; DB khởi động chậm.
- **Hướng xử lý:** đổi `generateToken` thành hàm đồng bộ; kiểm tra env khi khởi động; `await connectDB()` rồi mới `listen`.

<a id="err-008"></a>
### ERR-008 — `LogInPage` dùng `toast` nhưng không import

- **Mức độ / Loại / Trạng thái / Độ chắc chắn:** 🟢 Low · Logic FE · ✅ Xác nhận · Cao
- **Bằng chứng:** [LogInPage.jsx:1-5](../frontend/src/Pages/LogInPage.jsx#L1-L5) không có `import toast`; dòng [17, 20, 23](../frontend/src/Pages/LogInPage.jsx#L17-L23) gọi `toast.error(...)`.
- **Nguyên nhân:** copy code validate từ `SignUpPage` nhưng quên import. Không có lint trong quy trình để bắt `no-undef`.
- **Ảnh hưởng:** submit form thiếu thông tin hoặc sai định dạng email thì `ReferenceError` xuất hiện trong console, không có phản hồi, không gửi request. Hậu quả nhẹ vì backend vẫn validate, nhưng đây là lỗi runtime trong luồng cốt lõi.
- **Tình huống kích hoạt:** bấm Login khi bỏ trống ô.
- **Hướng xử lý:** thêm `import toast from "react-hot-toast"`; chạy `pnpm lint` (ESLint `no-undef` sẽ bắt lỗi này); tách hàm validate dùng chung cho hai form.

<a id="err-009"></a>
### ERR-009 — Dùng sai HTTP status code; không có 404/error handler dạng JSON

- **Mức độ / Loại / Trạng thái / Độ chắc chắn:** 🟢 Low · HTTP semantics · ✅ Xác nhận · Cao
- **Bằng chứng:** `401` cho "Please fill all information" ([authControllers.js:11](../backend/src/controllers/authControllers.js#L11)), "Email form invalid" (dòng 15), "already used" (dòng 19), "No profilePic" (dòng 101), "Job's already saved" ([saveJobControllers.js:20](../backend/src/controllers/saveJobControllers.js#L20)), "Job's already applied" ([appliedJobCotrollers.js:19](../backend/src/controllers/appliedJobCotrollers.js#L19)). [index.js](../backend/src/index.js) không có `app.use` cho 404 hay error handler.
- **Nguyên nhân:** chưa nắm ngữ nghĩa các mã 4xx.
- **Ảnh hưởng:** client không phân biệt được "chưa đăng nhập" với "dữ liệu sai". Một interceptor chuẩn kiểu "401 → logout" sẽ đăng xuất người dùng chỉ vì họ lưu trùng một job. Route không tồn tại trả HTML thay vì JSON.
- **Tình huống kích hoạt:** mọi lỗi validation hoặc trùng lặp.
- **Hướng xử lý:** `400` dữ liệu sai, `401` chưa xác thực, `403` không có quyền, `404` không tìm thấy, `409` trùng lặp, `422` sai nghiệp vụ. Thêm middleware 404 và error handler trả JSON.

<a id="db-004"></a>
### DB-004 — Ràng buộc schema chưa chặt hoặc không có tác dụng

- **Mức độ / Loại / Trạng thái / Độ chắc chắn:** 🟢 Low · Mô hình dữ liệu · ✅ Xác nhận · Cao
- **Bằng chứng:**
  - [userSchema.js:9-13](../backend/src/schemaModel/userSchema.js#L9-L13): `email` có `unique` nhưng không có `lowercase: true, trim: true`.
  - [userSchema.js:14-18](../backend/src/schemaModel/userSchema.js#L14-L18): `minlength: 6` áp lên **chuỗi hash** (luôn 60 ký tự), nên ràng buộc không có tác dụng.
  - [jobschema.js:61-80](../backend/src/schemaModel/jobschema.js#L61-L80): không kiểm tra `salary.min <= salary.max`; `expiredAt` không bị ràng buộc phải sau `createdAt`.
  - [jobschema.js:112](../backend/src/schemaModel/jobschema.js#L112): text index `title/company` **không được dùng** ở truy vấn nào.
  - Signup: kiểm tra trùng email bằng `findOne` rồi mới `save`. Nếu 2 request đồng thời, unique index chặn được nhưng lỗi `E11000` rơi vào `catch` và trả 500 thay vì 409.
- **Nguyên nhân:** ràng buộc được thêm theo cảm tính, chưa gắn với các bất biến (invariant) nghiệp vụ.
- **Ảnh hưởng:** `An@Mail.com` và `an@mail.com` là 2 tài khoản; đăng nhập bằng email khác kiểu chữ báo "email doesn't exist"; dữ liệu lương vô lý vẫn được lưu; text index tốn chi phí ghi mà không đem lại lợi ích.
- **Tình huống kích hoạt:** người dùng gõ email có chữ hoa; seed hoặc nhập dữ liệu sai.
- **Hướng xử lý:** `lowercase`, `trim`, `maxlength`; validator `min <= max`; chuyển kiểm tra độ dài mật khẩu hoàn toàn sang tầng validate; bỏ text index hoặc dùng nó cho tính năng "Search by keyword" trong Roadmap.

<a id="sec-008"></a>
### SEC-008 — Thiếu hardening HTTP; chính sách truy cập dữ liệu job không nhất quán

- **Mức độ / Loại / Trạng thái / Độ chắc chắn:** 🟢 Low · Bảo mật – Cấu hình · ✅ Xác nhận (thiếu header). ❓ Chưa đủ dữ liệu để biết `/search` công khai là chủ ý hay sơ suất · Trung bình
- **Bằng chứng:** không có `helmet`; không có `app.disable("x-powered-by")`. [jobsRouters.js:13](../backend/src/routers/jobsRouters.js#L13) `/getjobs` có `protectRouter`, còn [dòng 16](../backend/src/routers/jobsRouters.js#L16) `/search` thì không.
- **Nguyên nhân:** chưa có checklist bảo mật khi dựng Express.
- **Ảnh hưởng:** thiếu các header `X-Content-Type-Options`, `Referrer-Policy`, `Strict-Transport-Security`…; lộ công nghệ server; người chưa đăng nhập không lấy được `/getjobs` nhưng lấy được cùng dữ liệu qua `/search`, nên việc "bảo vệ" `/getjobs` không có ý nghĩa.
- **Tình huống kích hoạt:** production.
- **Hướng xử lý:** `app.use(helmet())`; quyết định rõ: danh sách job là dữ liệu công khai (hợp lý với trang tìm việc, nên mở cả hai endpoint và có rate limit) hay riêng tư (bảo vệ cả hai).

<a id="sec-009"></a>
### SEC-009 — Ảnh đại diện mặc định hotlink tới website bên thứ ba

- **Mức độ / Loại / Trạng thái / Độ chắc chắn:** 🟢 Low · Quyền riêng tư / Phụ thuộc bên ngoài · ✅ Xác nhận · Cao
- **Bằng chứng:** [ProfilePage.jsx:59-62](../frontend/src/Pages/ProfilePage.jsx#L59-L62) dùng URL từ một website tranh ảnh bên ngoài. Trong khi đó [src/assets/avata.png](../frontend/src/assets/avata.png) có sẵn nhưng không được dùng.
- **Nguyên nhân:** lấy nhanh ảnh trên mạng.
- **Ảnh hưởng:** mỗi lần người dùng không có avatar mở trang Profile, trình duyệt gửi request tới website đó, làm lộ IP và Referer. Ảnh có thể bị đổi, xoá hoặc chặn hotlink. Còn có rủi ro bản quyền hình ảnh.
- **Tình huống kích hoạt:** người dùng chưa đặt avatar mở trang Settings.
- **Hướng xử lý:** `import defaultAvatar from "../assets/avata.png"`.

<a id="arch-003"></a>
### ARCH-003 — Quản lý cấu hình rải rác

- **Mức độ / Loại / Trạng thái / Độ chắc chắn:** 🟢 Low · Kiến trúc – Cấu hình · ✅ Xác nhận · Cao
- **Bằng chứng:** `dotenv.config()` được gọi ở [index.js:8](../backend/src/index.js#L8), [connectDB.js:4](../backend/src/utils/connectDB.js#L4), [generateToken.js:5](../backend/src/utils/generateToken.js#L5), [protectRouter.js:5](../backend/src/utils/protectRouter.js#L5), [cloudinary.js:3](../backend/src/utils/cloudinary.js#L3), [jobs.seeds.js:5](../backend/seeds/jobs.seeds.js#L5). Tên biến `MONGOO_URI` (thừa chữ "O", khác quy ước phổ biến `MONGO_URI`/`MONGODB_URI`). Các giá trị như `"7d"`, `10` (limit), `10` (bcrypt rounds), `"10mb"` được hard-code rải rác.
- **Nguyên nhân:** mỗi file tự lo cấu hình của nó.
- **Ảnh hưởng:** không có một chỗ duy nhất trả lời câu hỏi "app cần cấu hình gì"; phụ thuộc thứ tự import (xem [03 §4.1](03-KIEN-TRUC-HIEN-TAI.md)); tên biến lạ dễ gây lỗi khi cấu hình hosting.
- **Tình huống kích hoạt:** thêm môi trường mới; người mới cấu hình.
- **Hướng xử lý:** `config/env.js` gọi `dotenv` một lần, validate và export object `env` đã đóng băng; các module khác import `env` thay vì đọc `process.env`.

<a id="arch-004"></a>
### ARCH-004 — Tổ chức và đặt tên module thiếu quy ước

- **Mức độ / Loại / Trạng thái / Độ chắc chắn:** 🟢 Low · Kiến trúc – Tổ chức code · ✅ Xác nhận · Cao
- **Bằng chứng:** `getAppliedJobsRouters.js` là controller; `appliedJobCotrollers.js` sai chính tả; `jobsControllers.js` export `JobsChecking` (thực chất là search); `getJobsList.js` không có hậu tố; export khi thì `PascalCase` (`SaveJobs`, `AppliedJob`) khi thì `camelCase`; route `/deleteds/:jobId`, `/deleteda/:jobId`, `/getjobs` không theo REST; middleware `protectRouter` nằm trong `utils/`; `authControllers.js` chứa cả `profileUpdate`; thư mục `schemaModel` và `Pages` (viết hoa) khác quy ước với các thư mục còn lại.
- **Nguyên nhân:** chưa có quy ước đặt tên trước khi bắt đầu.
- **Ảnh hưởng:** khó tìm file, dễ import nhầm tên (dẫn trực tiếp tới ERR-001), API khó đoán.
- **Tình huống kích hoạt:** thêm tính năng mới; người khác đọc code.
- **Hướng xử lý:** tổ chức theo feature (xem [03 §8](03-KIEN-TRUC-HIEN-TAI.md)); route REST: `GET /api/jobs`, `POST /api/saved-jobs` (body `jobId`), `DELETE /api/saved-jobs/:id`; viết quy ước ngắn trong README.

<a id="code-001"></a>
### CODE-001 — Dead code và dependency không dùng

- **Mức độ / Loại / Trạng thái / Độ chắc chắn:** 🟢 Low · Dead code · ✅ Xác nhận (bằng `grep`) · Cao
- **Bằng chứng:**

| Loại | Chi tiết |
|---|---|
| Package không dùng | `node-cron` (backend), `react-icons` (frontend) |
| Package thừa | `@tailwindcss/line-clamp`: Tailwind ≥ 3.3 đã có sẵn `line-clamp-*` |
| Import thừa | `import express from "express"` trong 9 file controller/utils không dùng tới `express` |
| File/asset không dùng | [App.css](../frontend/src/App.css) (rỗng, không import), `src/assets/avata.png`, `src/assets/cat.jpeg`, `public/icons.svg` |
| State không dùng | `isSavingJob`, `isApplyingJob`, `isDeletingSavedJob`, `isDeletingAppliedJob` ([jobsStore.js:17-21](../frontend/src/zustand/jobsStore.js#L17-L21)); `isLoggingOut` được set nhưng UI không đọc |
| Biến/nhánh không dùng | `const user = req.user` ([authControllers.js:86](../backend/src/controllers/authControllers.js#L86)); `if (!decodedToken)` ([protectRouter.js:16](../backend/src/utils/protectRouter.js#L16)); nhánh `salary.ranges` (BIZ-001); tham số `get` trong 2 store; biến `res` trong `deleteSavedJob`/`deleteAppliedJob` của store |
| Props không tồn tại | `daysLeft`, `experience`, `tags`, `source`, `url` trong [JobCard.jsx](../frontend/src/components/JobCard.jsx#L6-L22) |

- **Nguyên nhân:** code được thêm vào khi thử nghiệm nhưng không được dọn; chưa chạy lint thường xuyên.
- **Ảnh hưởng:** tăng thời gian đọc hiểu; người đọc tưởng tính năng tồn tại (ví dụ cron); tăng bề mặt dependency.
- **Hướng xử lý:** xoá; bật ESLint `no-unused-vars` cho backend; dùng `knip` hoặc `depcheck` để tìm package thừa.

<a id="code-002"></a>
### CODE-002 — Trùng lặp code

- **Mức độ / Loại / Trạng thái / Độ chắc chắn:** 🟢 Low · Trùng lặp · ✅ Xác nhận · Cao
- **Bằng chứng:** xem bảng chi tiết ở [06 §5](06-CHAT-LUONG-CODE.md). Nổi bật: 4 header gần giống nhau; [AppliedJobsSkeleton.jsx](../frontend/src/components/skeleton%20/AppliedJobsSkeleton.jsx) và [SavedJobCardSkeleton.jsx](../frontend/src/components/skeleton%20/SavedJobCardSkeleton.jsx) giống hệt nhau; cặp controller save/apply, cặp delete, cặp get, cặp model; hàm validate của LogInPage và SignUpPage.
- **Nguyên nhân:** copy-paste để làm nhanh tính năng thứ hai.
- **Ảnh hưởng:** lỗi bị nhân bản (header Applied ghi "Jobs Saved", LogInPage thiếu import toast); sửa một nơi dễ quên nơi kia.
- **Hướng xử lý:** `PageHeader` nhận `title`, `description`, `actions`; một `ListSkeleton`; hàm tạo controller dùng chung cho hai model, hoặc gộp model (xem [07](07-DATABASE-VA-TOAN-VEN-DU-LIEU.md)).

<a id="code-003"></a>
### CODE-003 — Lỗi đặt tên, chính tả và copy-paste hiển thị ra giao diện

- **Mức độ / Loại / Trạng thái / Độ chắc chắn:** 🟢 Low · Naming · ✅ Xác nhận ([screenshots/applied-jobs.png](../screenshots/applied-jobs.png) hiển thị "1 Jobs Saved" trên trang Applied) · Cao
- **Bằng chứng:**
  - [AppliedJobsHeader.jsx:6, 26](../frontend/src/components/AppliedJobsHeader.jsx#L6): component tên `SavedJobsHeader`, hiển thị "`{appliedJobs.length} Jobs Saved`".
  - [jobsStore.js:103, 105](../frontend/src/zustand/jobsStore.js#L103-L105): toast của `applyJob` ghi "Saving jobs successfully/failed".
  - Tên file/biến: `HeadeProfilepage`, `appliedJobCotrollers`, `reGexemail`, `handleLockout` (logout), `deletePrepic`, `newJobUpdate` (thực chất là bản ghi save mới), `genPass` (thực chất là salt), `cookieParse`.
  - [index.html:5](../frontend/index.html#L5): favicon trỏ `/assets/logo.png` (không tồn tại); [dòng 7](../frontend/index.html#L7): `<title>frontend</title>`.
  - Nút "Checking" ([AppliedJobsCard.jsx:26](../frontend/src/components/AppliedJobsCard.jsx#L26)) có nghĩa không rõ; "Login Page / Join us today to get started" ở trang đăng nhập là câu của trang đăng ký.
- **Nguyên nhân:** copy-paste mà không đọc lại; không review.
- **Ảnh hưởng:** người dùng bị nhầm lẫn; tab trình duyệt hiện chữ "frontend"; request 404 favicon ở mỗi lần tải trang; người đọc code phải đoán ý.
- **Hướng xử lý:** đọc lại mọi chuỗi hiển thị; đặt tên theo **ý nghĩa nghiệp vụ** (`salt`, `savedJob`, `handleLogout`); sửa `<title>` và favicon.

<a id="code-004"></a>
### CODE-004 — Log debug còn sót và toast "thành công" ở mọi thao tác đọc

- **Mức độ / Loại / Trạng thái / Độ chắc chắn:** 🟢 Low · Debug / UX · ✅ Xác nhận · Cao
- **Bằng chứng:** 18 lời gọi `console.log` trong `backend/src` và `frontend/src`, ví dụ [App.jsx:19, 24](../frontend/src/App.jsx#L19-L24) log ở **mỗi lần render**, [JobsList.jsx:7](../frontend/src/components/JobsList.jsx#L7), [ProfilePage.jsx:26](../frontend/src/Pages/ProfilePage.jsx#L26). Toast success cho `authCheck`, `getJobs`, `fetchSavedJobs`, `fetchAppliedJobs`, `searchJobs`.
- **Nguyên nhân:** log để debug không được gỡ; toast dùng như công cụ debug.
- **Ảnh hưởng:** console trình duyệt chứa dữ liệu người dùng; khi `<Toaster/>` được thêm (ERR-003), mỗi lần tải trang sẽ hiện 2–3 thông báo vô nghĩa. Ở dev còn nhân đôi do `StrictMode` gọi effect hai lần.
- **Hướng xử lý:** xoá log; chỉ toast cho **hành động do người dùng chủ động** (lưu, xoá, cập nhật) và cho lỗi.

<a id="code-005"></a>
### CODE-005 — Dùng `<a href>` thay vì `<Link>` trong SPA

- **Mức độ / Loại / Trạng thái / Độ chắc chắn:** 🟢 Low · React Router · ✅ Xác nhận · Cao
- **Bằng chứng:** [LogInPage.jsx:104-109](../frontend/src/Pages/LogInPage.jsx#L104-L109) `<a href="/signup">`; [SignUpPage.jsx:138-143](../frontend/src/Pages/SignUpPage.jsx#L138-L143) `<a href="/login">`. README tự ghi bài học ngược lại: *"Why `<Link>` must replace `<a>` in React Router"* ([README.md:78](../README.md#L78)).
- **Nguyên nhân:** bài học chỉ được áp dụng ở chỗ từng gặp lỗi, chưa được rà soát toàn dự án.
- **Ảnh hưởng:** chuyển giữa Login và Signup gây reload toàn trang, tải lại bundle, gọi lại `authCheck`, mất state.
- **Hướng xử lý:** `<Link to="/signup">`. Mỗi khi rút ra một bài học, hãy `grep` toàn dự án để tìm chỗ khác mắc cùng lỗi.

<a id="ops-003"></a>
### OPS-003 — Tên thư mục có dấu cách ở cuối

- **Mức độ / Loại / Trạng thái / Độ chắc chắn:** 🟢 Low · Tính di động · ✅ Xác nhận · Cao
- **Bằng chứng:** `git ls-files` cho thấy `frontend/src/components/skeleton␠/…` (ký hiệu `␠` là dấu cách); import tương ứng: `"../components/skeleton /AppliedJobsSkeleton.jsx"` ([AppliedJobsPage.jsx:4](../frontend/src/Pages/AppliedJobsPage.jsx#L4)).
- **Nguyên nhân:** gõ thừa dấu cách khi tạo thư mục.
- **Ảnh hưởng:** Windows không cho phép tên thư mục kết thúc bằng dấu cách, nên `git clone` trên Windows báo lỗi *invalid path* và thiếu file. Một số công cụ và shell script cũng xử lý sai đường dẫn chứa dấu cách.
- **Tình huống kích hoạt:** clone trên Windows.
- **Hướng xử lý:** đổi tên thành `skeleton` và cập nhật 2 import.

<a id="ops-004"></a>
### OPS-004 — `node_modules` từng được commit; `.DS_Store` vẫn được theo dõi

- **Mức độ / Loại / Trạng thái / Độ chắc chắn:** 🟢 Low · Git hygiene · ✅ Xác nhận · Cao
- **Bằng chứng:** lịch sử có khoảng 3.500 file dưới `node_modules/` được thêm vào; `.DS_Store` ở thư mục gốc vẫn nằm trong `git ls-files` và đang bị sửa đổi; [.gitignore gốc](../.gitignore) chỉ có `node_modules/` và `.env`.
- **Nguyên nhân:** tạo `.gitignore` sau commit đầu tiên.
- **Ảnh hưởng:** repo nặng, clone chậm; file hệ thống macOS gây diff rác.
- **Hướng xử lý:** làm cùng lúc với bước purge lịch sử của SEC-001; thêm `.DS_Store` vào `.gitignore` gốc; `git rm --cached .DS_Store`.

<a id="dep-001"></a>
### DEP-001 — Dependency deprecated hoặc có nghi vấn tương thích

- **Mức độ / Loại / Trạng thái / Độ chắc chắn:** 🟢 Low · Dependency · ✅ Xác nhận (deprecated). ❓ Chưa đủ dữ liệu (daisyUI) · Trung bình
- **Bằng chứng:**
  - `frontend/pnpm-lock.yaml:161`: `@clerk/clerk-react@5.61.3` được đánh dấu *"deprecated: This package is no longer supported. Please use @clerk/react instead"*.
  - `@tailwindcss/line-clamp@0.4.4`: plugin đã được tích hợp vào Tailwind từ 3.3; dự án dùng Tailwind 3.4.19.
  - `daisyui@5.5.19` đi cùng `tailwindcss@3.4.19` qua `tailwind.config.ts` ([tailwind.config.ts:1-12](../frontend/tailwind.config.ts#L1-L12)). daisyUI 5 được thiết kế cho Tailwind CSS 4 (cấu hình bằng `@plugin` trong CSS), và cú pháp `daisyui: { themes: true }` là của daisyUI 4. Các class daisyUI đang dùng: `navbar`, `btn`, `btn-ghost`, `footer`, `footer-center`.
- **Nguyên nhân:** cài package theo hướng dẫn của các phiên bản khác nhau.
- **Ảnh hưởng:** cảnh báo khi cài/build; nguy cơ class daisyUI không được sinh ra, khiến Navbar/Footer mất style. **Chưa xác minh được** vì không chạy build. Ảnh chụp màn hình vẫn thấy Navbar có style, nhưng các class Tailwind thuần trên cùng phần tử cũng có thể tạo ra giao diện đó.
- **Hướng xử lý:** chạy `pnpm build` và kiểm tra CSS sinh ra có class `.navbar` hay không; hoặc hạ `daisyui` về 4.x, hoặc nâng Tailwind lên 4; gỡ `@tailwindcss/line-clamp`; xử lý Clerk theo ARCH-001.

<a id="perf-001"></a>
### PERF-001 — Các điểm hiệu năng sẽ thành vấn đề khi dữ liệu tăng

- **Mức độ / Loại / Trạng thái / Độ chắc chắn:** 🟢 Low · Hiệu năng · ✅ Xác nhận (thiết kế). ⚠️ Rủi ro tiềm ẩn (chỉ lộ khi có tải) · Trung bình
- **Bằng chứng:** `Job.find()` không phân trang, không projection (trả cả `description` dài); regex không neo, không phân biệt hoa thường trên `location.city/region`; `countDocuments` + `skip` cho phân trang; `SaveJob.find({ userId })` không có index; component gọi `jobsStore()` không selector nên re-render theo mọi thay đổi của store. Chi tiết trong [09](09-HIEU-NANG-VA-KHA-NANG-MO-RONG.md).
- **Nguyên nhân:** dữ liệu hiện chỉ có 5 job nên chưa cảm nhận được.
- **Ảnh hưởng:** **hiện tại không đáng kể.** Với hàng chục nghìn job: payload trang chủ lớn, truy vấn tìm kiếm chậm, UI giật khi lưu job.
- **Hướng xử lý:** phân trang + projection (ưu tiên, vì cũng giải quyết BIZ-006); so khớp chính xác thay regex; selector Zustand. **Chưa cần** cache hay Redis.

<a id="biz-007"></a>
### BIZ-007 — Luồng cập nhật ảnh đại diện gây hiểu nhầm

- **Mức độ / Loại / Trạng thái / Độ chắc chắn:** 🟢 Low · UX – Profile · ✅ Xác nhận · Cao
- **Bằng chứng:** [ProfilePage.jsx:9-18](../frontend/src/Pages/ProfilePage.jsx#L9-L18) upload **ngay** khi chọn file (không có bước xác nhận), không kiểm tra `file` có tồn tại hay kích thước; [dòng 20-23](../frontend/src/Pages/ProfilePage.jsx#L20-L23) nút X chỉ `setPreview(null)` mà không gọi API. Backend có hỗ trợ xoá avatar bằng `profilePic: ""` ([authControllers.js:120-129](../backend/src/controllers/authControllers.js#L120-L129)) nhưng frontend không dùng. [Dòng 27-33](../frontend/src/Pages/ProfilePage.jsx#L27-L33): khi đang upload, **toàn bộ trang** được thay bằng spinner.
- **Nguyên nhân:** chưa thiết kế rõ các trạng thái của luồng (chọn → xem trước → xác nhận → lưu / huỷ / xoá).
- **Ảnh hưởng:** bấm X, người dùng tưởng đã huỷ hoặc xoá ảnh nhưng ảnh đã được upload và lưu; F5 thì ảnh vẫn còn. File lớn hơn khoảng 7,5MB (sau khi base64 vượt 10MB) nhận lỗi 413 mà không có thông báo.
- **Hướng xử lý:** tách "Xem trước" và "Lưu"; nút "Xoá ảnh" gọi API với `""`; kiểm tra `file.size` ở client; spinner chỉ trên avatar.

<a id="biz-008"></a>
### BIZ-008 — Các khoảng trống UX ở luồng tìm việc

- **Mức độ / Loại / Trạng thái / Độ chắc chắn:** 🟢 Low · UX · ✅ Xác nhận · Cao
- **Bằng chứng và ảnh hưởng:**
  - JobCard không thể hiện job đã lưu hoặc đã ứng tuyển (icon luôn giống nhau), nên người dùng bấm lại và nhận lỗi "already saved" (vô hình).
  - Tìm kiếm ra 0 kết quả: [JobsList.jsx](../frontend/src/components/JobsList.jsx) không hiển thị empty state. Trang Applied cũng không có (trang Saved thì có).
  - Filter là state cục bộ trong `JobSidebar`; rời trang chủ rồi quay lại thì `HomePage` gọi `getJobs()` và ghi đè kết quả lọc.
  - [HomePage.jsx:28](../frontend/src/Pages/HomePage.jsx#L28) sidebar `w-72` cố định trong `flex` ngang, nên trên màn hình điện thoại vùng danh sách job bị ép rất hẹp. README cũng thừa nhận ở Roadmap.
  - [HeadeProfilepage.jsx:32-42](../frontend/src/components/HeadeProfilepage.jsx#L32-L42) hiển thị số saved/applied từ store. F5 ở `/settings` thì hiện "0 Saved Jobs" vì chưa fetch.
- **Hướng xử lý:** tính `isSaved` từ `savedJobs`; thêm empty state; đưa filter vào URL query (`useSearchParams`) để giữ khi điều hướng; layout responsive (`flex-col md:flex-row`); fetch số liệu ở trang Profile.

<a id="doc-001"></a>
### DOC-001 — Tuyên bố sản phẩm vượt quá những gì code làm được

- **Mức độ / Loại / Trạng thái / Độ chắc chắn:** 🟢 Low · Nhất quán yêu cầu–code · ✅ Xác nhận · Cao
- **Bằng chứng:** [README.md:3](../README.md#L3) "A full-stack job aggregator"; [FindjobsHeader.jsx:14](../frontend/src/components/FindjobsHeader.jsx#L14) "Search 1000+ jobs from LinkedIn, Facebook, Indeed & more"; [README.md:30](../README.md#L30) "which are still pending"; [README.md:40](../README.md#L40) "Secure sign up and login". Thực tế: 5 job giả, không có trạng thái ứng tuyển, và các vấn đề bảo mật SEC-001 đến SEC-007.
- **Nguyên nhân:** README viết theo tầm nhìn sản phẩm, chưa theo hiện trạng.
- **Ảnh hưởng:** với portfolio, nhà tuyển dụng kỹ thuật thường đối chiếu tuyên bố với code. Khoảng cách lớn làm giảm độ tin cậy của cả những điểm làm tốt.
- **Hướng xử lý:** ghi rõ "dữ liệu mẫu", chuyển các tuyên bố chưa làm vào Roadmap; bỏ "1000+" trên giao diện.

<a id="doc-002"></a>
### DOC-002 — Tài liệu cài đặt và kỹ thuật chưa chính xác

- **Mức độ / Loại / Trạng thái / Độ chắc chắn:** 🟢 Low · Tài liệu · ✅ Xác nhận · Cao
- **Bằng chứng:**
  - [README.md:105-118](../README.md#L105-L118): sau `cd ../frontend` lại `cd backend`, nên sai đường dẫn (phải là `cd ../backend`).
  - Không có hướng dẫn biến môi trường, cách chạy seed, yêu cầu tài khoản Cloudinary/Clerk.
  - [README.md:66](../README.md#L66): "`.populate("jobId")` fetches the full job document in a single query". Thực tế Mongoose `populate` chạy **một truy vấn riêng** cho collection `jobs` (tổng 2 truy vấn), không phải `$lookup`.
  - [README.md:60](../README.md#L60): "Each domain has its own store slice", trong khi thực tế `jobsStore` gộp 3 domain.
  - [frontend/README.md](../frontend/README.md) vẫn là template của Vite.
- **Nguyên nhân:** tài liệu không được cập nhật cùng code.
- **Ảnh hưởng:** người mới làm theo README sẽ gặp lỗi ngay bước đầu; mô tả kỹ thuật sai có thể bị hỏi vặn khi phỏng vấn.
- **Hướng xử lý:** sửa lệnh; thêm mục "Environment variables" và "Seeding"; sửa mô tả populate; thay README frontend.

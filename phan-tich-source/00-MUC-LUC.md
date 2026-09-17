# Báo cáo phân tích source code — JobRadar

> **Đối tượng đọc:** học viên (tác giả dự án) và người hướng dẫn.
> **Ngày phân tích:** 17/09/2026 · **Commit được phân tích:** `2929d0c` (nhánh `main`)
> **Phương pháp:** đọc tĩnh toàn bộ source, cấu hình, lockfile, lịch sử Git và ảnh chụp màn hình. **Không sửa source code**, không cài package, không chạy lệnh ghi dữ liệu.

## Giới thiệu

JobRadar là ứng dụng full-stack (React + Express + MongoDB) giúp người dùng xem tin tuyển dụng, lưu tin quan tâm và đánh dấu tin đã ứng tuyển. Bộ báo cáo này đánh giá dự án **như một hệ thống hoàn chỉnh**: từ mục tiêu nghiệp vụ, kiến trúc, luồng dữ liệu, cho tới bảo mật, kiểm thử và khả năng vận hành. Mục đích là giúp học viên **hiểu vì sao** một vấn đề tồn tại và **nên cải thiện theo thứ tự nào**.

## Thống kê nhanh

| Mức độ | Số lượng | Ý nghĩa |
|---|---|---|
| 🔴 Critical | **2** | Lộ dữ liệu nghiêm trọng hoặc hệ thống không chạy được ở môi trường mục tiêu |
| 🟠 High | **7** | Chức năng chính hỏng/crash, hoặc lỗ hổng khai thác được dễ dàng |
| 🟡 Medium | **20** | Sai nghiệp vụ, rủi ro bảo mật cần điều kiện, ảnh hưởng một phần |
| 🟢 Low | **21** | Chất lượng code, UX nhỏ, tài liệu |
| **Tổng** | **50** | |

### Ba vấn đề nghiêm trọng nhất

1. **[SEC-001](05-DANH-SACH-LOI-VA-RUI-RO.md#sec-001) — Secret thật đã bị commit và push lên GitHub.** File `backend/.env` (chuỗi kết nối MongoDB có credentials, JWT secret, Cloudinary secret) nằm trong commit đầu tiên. Commit xoá sau đó **không** xoá được lịch sử.
2. **[ERR-001](05-DANH-SACH-LOI-VA-RUI-RO.md#err-001) — Backend không khởi động được trên Linux.** `jobsRouters.js` import `SaveJobControllers.js` trong khi file thật là `saveJobControllers.js`. Code chỉ chạy được trên macOS (không phân biệt hoa/thường), nên sẽ sập khi deploy lên Render, Docker hoặc CI.
3. **[ERR-002](05-DANH-SACH-LOI-VA-RUI-RO.md#err-002) + [DB-001](05-DANH-SACH-LOI-VA-RUI-RO.md#db-001) — Luồng cốt lõi "lưu job → xem Saved Jobs" làm trắng toàn bộ ứng dụng.** Store chèn dữ liệu sai shape sau khi lưu; bookmark trỏ tới job không tồn tại làm `populate` trả `null`; frontend không có ErrorBoundary.

### Phân bố theo nhóm

| Nhóm | Critical | High | Medium | Low | Tổng |
|---|---|---|---|---|---|
| Bảo mật (SEC) | 1 | 1 | 5 | 2 | 9 |
| Lỗi runtime/logic (ERR) | 1 | 2 | 3 | 3 | 9 |
| Nghiệp vụ (BIZ) | – | 1 | 6 | 2 | 9 |
| Chất lượng code (CODE) | – | – | – | 5 | 5 |
| Database (DB) | – | 1 | 2 | 1 | 4 |
| Kiến trúc (ARCH) | – | 1 | 1 | 2 | 4 |
| Triển khai/vận hành (OPS) | – | 1 | 1 | 2 | 4 |
| Tài liệu (DOC) | – | – | – | 2 | 2 |
| Validation (VAL) | – | – | 1 | – | 1 |
| Kiểm thử (TEST) | – | – | 1 | – | 1 |
| Dependency (DEP) | – | – | – | 1 | 1 |
| Hiệu năng (PERF) | – | – | – | 1 | 1 |
| **Tổng** | **2** | **7** | **20** | **21** | **50** |

## Danh sách báo cáo

| # | Báo cáo | Nội dung chính |
|---|---|---|
| 00 | **Mục lục** (file này) | Phạm vi, thống kê, điều hướng |
| 01 | [Tổng quan dự án](01-TONG-QUAN-DU-AN.md) | Mục tiêu, người dùng, chức năng và tình trạng thực tế, công nghệ, điểm mạnh/hạn chế |
| 02 | [Tư duy hệ thống](02-TU-DUY-HE-THONG.md) | Thành phần, phụ thuộc, luồng nghiệp vụ end-to-end, luồng lỗi, ảnh hưởng dây chuyền |
| 03 | [Kiến trúc hiện tại](03-KIEN-TRUC-HIEN-TAI.md) | Kiểu kiến trúc, tầng, dependency direction, điểm hợp lý/chưa hợp lý, kiến trúc đề xuất |
| 04 | [Phân tích module và luồng dữ liệu](04-PHAN-TICH-MODULE-VA-LUONG-DU-LIEU.md) | Danh mục module, API catalog, luồng request/state/lỗi, module sai trách nhiệm |
| 05 | [Danh sách lỗi và rủi ro](05-DANH-SACH-LOI-VA-RUI-RO.md) | **Bảng tổng hợp 50 vấn đề** + phân tích chi tiết từng vấn đề |
| 06 | [Chất lượng code](06-CHAT-LUONG-CODE.md) | Clean code, naming, độ phức tạp, trùng lặp, coupling/cohesion, error handling |
| 07 | [Database và toàn vẹn dữ liệu](07-DATABASE-VA-TOAN-VEN-DU-LIEU.md) | Sơ đồ ER, constraint, index, transaction, seed, nguy cơ mất/trùng dữ liệu |
| 08 | [Bảo mật và phân quyền](08-BAO-MAT-VA-PHAN-QUYEN.md) | OWASP Top 10, auth, phân quyền, secret, cookie/JWT, upload, CORS, injection |
| 09 | [Hiệu năng và khả năng mở rộng](09-HIEU-NANG-VA-KHA-NANG-MO-RONG.md) | Truy vấn, điểm nghẽn, scale dọc/ngang, những tối ưu **chưa** cần |
| 10 | [Kiểm thử và độ tin cậy](10-KIEM-THU-VA-DO-TIN-CAY.md) | Hiện trạng, luồng chưa test, kế hoạch test, khả năng phục hồi |
| 11 | [Triển khai và vận hành](11-TRIEN-KHAI-VA-VAN-HANH.md) | Build/deploy, CI/CD, logging, backup, cấu hình, rollback, rủi ro production |
| 12 | [Lộ trình cải thiện](12-LO-TRINH-CAI-THIEN.md) | 5 nhóm ưu tiên, phụ thuộc, kết quả mong đợi, bảng truy vết |
| 13 | [Nhận xét dành cho học viên](13-NHAN-XET-DANH-CHO-HOC-VIEN.md) | Điểm tốt, lỗi tư duy mang tính hệ thống, kiến thức cần học, đánh giá tổng thể |

### Gợi ý thứ tự đọc

- **Học viên muốn biết nên làm gì ngay:** 13 → 12 → 05
- **Muốn hiểu hệ thống trước:** 01 → 02 → 03 → 04
- **Chuẩn bị deploy:** 11 → 08 → 12 (nhóm 1–2)
- **Tra cứu một vấn đề cụ thể:** bảng tổng hợp trong 05, bấm vào mã để tới phần chi tiết

## Phạm vi đã kiểm tra

| Hạng mục | File / nguồn | Mức độ |
|---|---|---|
| Cấu trúc thư mục | Toàn bộ 71 file được Git theo dõi | Toàn bộ |
| Backend source | `backend/src/index.js`, `routers/` (2), `controllers/` (9), `schemaModel/` (4), `utils/` (4) | Đọc từng dòng |
| Seed | `backend/seeds/jobs.seeds.js` | Đọc từng dòng |
| Frontend source | `main.jsx`, `App.jsx`, `Pages/` (6), `components/` (15, gồm 2 skeleton), `zustand/` (2), `utils/axiosInstance.js`, CSS | Đọc từng dòng |
| Cấu hình | `package.json` (2), `eslint.config.js`, `vite.config.js`, `tailwind.config.ts`, `postcss.config.js`, `index.html`, `.gitignore` (3) | Toàn bộ |
| Dependency | `pnpm-lock.yaml` (2): phiên bản đã cài thực tế, cờ deprecated | Có chọn lọc |
| Tài liệu | `README.md`, `frontend/README.md` | Toàn bộ, có đối chiếu với code |
| Lịch sử Git | 6 commit; các file từng bị thêm hoặc xoá; nhánh remote | Tên file, **tên biến và dạng giá trị** trong `.env` cũ (không đọc hay ghi lại giá trị) |
| Ảnh chụp màn hình | `screenshots/` (4 ảnh) | Dùng để đối chiếu các lỗi hiển thị |
| Tìm kiếm chéo | `grep` cho Toaster, package không dùng, XSS sink, storage, middleware bảo mật, props và trường dữ liệu | — |
| Database schema, migration | Schema Mongoose (không có migration trong repo) | Toàn bộ |
| Docker, CI/CD, reverse proxy, test | Đã tìm kiếm | **Không tồn tại** trong repo |

## Phạm vi chưa thể kiểm tra

| Hạng mục | Lý do | Ảnh hưởng tới kết luận |
|---|---|---|
| Chạy ứng dụng, build, lint, test | Repo không có `node_modules`; nguyên tắc phân tích không cho phép cài package | Các lỗi runtime được **xác nhận bằng phân tích tĩnh** (đánh dấu "Xác nhận (tĩnh)"), chưa được tái hiện thực tế |
| Repo GitHub là public hay private | Không truy cập mạng/GitHub | Mức độ khẩn cấp thực tế của SEC-001 (vẫn giữ Critical trong mọi trường hợp) |
| Secret đã được rotate hay chưa; DB có bị truy cập trái phép không | Không có quyền truy cập MongoDB, Cloudinary | SEC-001, SEC-006 |
| Hành vi thực tế của Mongoose 9.6.2 với operator injection | Không chạy được | SEC-002 (phần injection) đánh dấu "Rủi ro tiềm ẩn" |
| Tương thích daisyUI 5 + Tailwind 3.4 | Cần build | DEP-001 đánh dấu "Chưa đủ dữ liệu" |
| Hành vi của Cloudinary SDK với chuỗi không phải data URI | Không chạy được | SEC-007 (phần đọc file cục bộ) đánh dấu "Rủi ro tiềm ẩn" |
| Cấu hình deploy thực tế (Render, Vercel, domain, biến môi trường) | Không có trong repo; README ghi chưa deploy | OPS-001 (phần cookie), rủi ro SPA rewrite |
| Dữ liệu thực trong DB, index đã được tạo hay chưa, cơ chế backup của nhà cung cấp | Không truy cập DB | Mục backup trong 07 và 11 |
| Lỗ hổng đã biết trong dependency (`pnpm audit`) | Cần mạng | A06 trong 08 |
| Hiệu năng thực tế | Không có số đo, không có tải | 09 chỉ đánh giá định tính |

## Quy ước dùng trong bộ báo cáo

| Ký hiệu | Ý nghĩa |
|---|---|
| ✅ **Xác nhận** | Có bằng chứng trực tiếp trong code, lịch sử Git hoặc ảnh chụp màn hình |
| ⚠️ **Rủi ro tiềm ẩn** | Code tạo điều kiện, hậu quả phụ thuộc runtime hoặc môi trường |
| ❓ **Chưa đủ dữ liệu** | Cần thông tin ngoài repo |
| Độ chắc chắn | Cao / Trung bình / Thấp |
| Liên kết `file.js:12` | Mở thẳng tới dòng tương ứng trong source |
| Mã vấn đề | `SEC-` bảo mật · `ERR-` lỗi runtime/logic · `BIZ-` nghiệp vụ · `DB-` dữ liệu · `ARCH-` kiến trúc · `OPS-` vận hành · `VAL-` validation · `TEST-` kiểm thử · `CODE-` chất lượng code · `DEP-` dependency · `PERF-` hiệu năng · `DOC-` tài liệu |

> 🔒 **Về dữ liệu nhạy cảm:** bộ báo cáo **không** chứa giá trị của bất kỳ mật khẩu, token, secret hay chuỗi kết nối nào. Với các file `.env` trong lịch sử Git, báo cáo chỉ ghi **tên biến** và **dạng giá trị** (ví dụ "chuỗi kết nối có nhúng credentials").

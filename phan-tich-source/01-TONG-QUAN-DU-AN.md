# 01 — Tổng quan dự án JobRadar

> [← Mục lục](00-MUC-LUC.md) · Tiếp theo: [02 — Tư duy hệ thống →](02-TU-DUY-HE-THONG.md)

## 1. Mục tiêu dự án

Theo [README.md](../README.md#L3-L13), JobRadar là **ứng dụng theo dõi việc làm cá nhân**: người dùng tìm việc, lưu tin tuyển dụng quan tâm và đánh dấu những việc đã ứng tuyển, tất cả trên một dashboard. README cũng nói rõ đây là **dự án portfolio** để chứng minh năng lực full-stack (React, Node.js, MongoDB, REST API).

Có hai tầng mục tiêu cần tách bạch:

| Tầng mục tiêu | README tuyên bố | Code thực tế |
|---|---|---|
| Sản phẩm | "Job aggregator" gom tin từ LinkedIn, Facebook, Indeed… ("Search 1000+ jobs") | Chỉ có **5 tin tuyển dụng giả** nạp bằng [seeds/jobs.seeds.js](../backend/seeds/jobs.seeds.js). Không có module thu thập dữ liệu, cũng không gọi API nguồn nào. Việc tích hợp API công khai còn nằm trong Roadmap ([README.md:90](../README.md#L90)). |
| Học tập / portfolio | Có đủ luồng full-stack: auth, CRUD, upload ảnh, filter | Đạt ở mức **chạy được trên máy cá nhân** (macOS). Chưa sẵn sàng deploy (xem [11](11-TRIEN-KHAI-VA-VAN-HANH.md)). |

> **Nhận xét sư phạm:** Ở dự án học tập, việc sản phẩm "chưa gom dữ liệu thật" không phải lỗi. Vấn đề chỉ nằm ở chỗ **lời giới thiệu vượt quá những gì code làm được** (xem DOC-001). Người đánh giá portfolio thường đọc code để kiểm chứng README, nên độ trung thực của tài liệu cũng là một kỹ năng nghề nghiệp.

## 2. Đối tượng sử dụng

| Actor | Vai trò | Có trong code? |
|---|---|---|
| Người tìm việc (đã đăng ký) | Xem, lọc, lưu, đánh dấu ứng tuyển, cập nhật ảnh đại diện | Có |
| Khách (chưa đăng nhập) | Chỉ vào được trang đăng ký/đăng nhập trên UI. Riêng API `/api/jobs/search` lại mở công khai. | Có (không nhất quán, xem SEC-008) |
| Người vận hành dữ liệu / admin | Thêm, sửa, xoá tin tuyển dụng | **Không có** API hay UI. Muốn nạp dữ liệu phải chạy script seed trực tiếp vào DB. |
| Dịch vụ ngoài | MongoDB, Cloudinary (ảnh), Clerk (Google OAuth) | Có (Clerk chỉ tích hợp một nửa, xem ARCH-001) |

## 3. Chức năng chính và tình trạng thực tế

Mức "Tình trạng" dưới đây được kết luận bằng **đọc code tĩnh**, có đối chiếu thêm với ảnh chụp màn hình trong [screenshots/](../screenshots/). Mình chưa chạy ứng dụng vì repo không có `node_modules` và phạm vi phân tích không cho phép cài package.

| Chức năng | Tình trạng | Ghi chú / mã vấn đề |
|---|---|---|
| Đăng ký, đăng nhập bằng email + mật khẩu | 🟡 Chạy được nhưng thiếu an toàn | Không có rate limit, có thể dò email (SEC-002, SEC-004). Thông báo lỗi không hiển thị (ERR-003). |
| Đăng nhập Google (Clerk) | 🔴 Không hoạt động end-to-end | Backend không biết gì về phiên Clerk (ARCH-001). |
| Giữ phiên đăng nhập (`authCheck`) | 🟡 Chạy được, có lỗi điều hướng | F5 ở trang con bị đẩy về trang chủ (ERR-005). |
| Xem danh sách job | 🟡 Chạy được | Không phân trang, hiển thị cả job hết hạn (BIZ-005, BIZ-006). Hiển thị lương sai (BIZ-003). Nút "View Job" không mở được tin gốc (BIZ-009). |
| Lọc job: loại hình, cấp độ, hình thức, thành phố | 🟢 Chạy được | Chỉ xem được 10 kết quả đầu (BIZ-006). |
| Lọc theo khu vực (Region) | 🔴 Luôn trả về rỗng | Giá trị filter không khớp dữ liệu (BIZ-002). |
| Lọc theo mức lương | 🔴 Không có tác dụng | Contract FE/BE lệch nhau (BIZ-001). |
| Lưu job / đánh dấu đã ứng tuyển | 🟡 Lưu vào DB được | Sau khi lưu, mở trang Saved/Applied có thể **làm sập giao diện** (ERR-002). Có thể tạo bản ghi trùng (DB-002). |
| Xem, xoá job đã lưu / đã ứng tuyển | 🟡 Chạy được | Hạn nộp hiển thị sai (BIZ-004). Crash nếu job gốc bị xoá (DB-001). |
| Cập nhật ảnh đại diện | 🟡 Server cập nhật được, client báo lỗi | Lỗi `ReferenceError` trong store (ERR-004). Upload không được kiểm tra (SEC-007). |
| Đăng xuất | 🟢 Chạy được | JWT cũ vẫn còn hiệu lực tới 7 ngày (SEC-006). |
| Trạng thái ứng tuyển ("pending"…) | ⚪ Chưa có | README có nhắc nhưng code không có (DOC-001). |

## 4. Công nghệ đang dùng

Phiên bản lấy từ `pnpm-lock.yaml` (bản thực sự được cài), không lấy từ khoảng semver trong `package.json`.

### Backend ([backend/package.json](../backend/package.json))

| Thành phần | Phiên bản | Vai trò | Nhận xét |
|---|---|---|---|
| Node.js + ES Modules | `"type": "module"` | Runtime | Chưa khai báo `engines` |
| Express | 5.2.1 | HTTP server | Express 5 thay đổi vài hành vi quan trọng (query parser, `req.body`). Có ảnh hưởng tới BIZ-001, VAL-001. |
| Mongoose | 9.6.2 | ODM cho MongoDB | |
| jsonwebtoken | 9.0.3 | JWT | |
| bcryptjs | 3.0.3 | Hash mật khẩu | |
| cookie-parser, cors | 1.4.7, 2.8.6 | Middleware | |
| cloudinary | 2.10.0 | Lưu ảnh đại diện | |
| dotenv | 17.4.2 | Nạp biến môi trường | Gọi ở 6 nơi khác nhau (ARCH-003) |
| node-cron | 4.2.1 | — | **Cài nhưng không dùng** (CODE-001) |
| nodemon | 3.1.14 | Dev server | Nằm nhầm trong `dependencies` (OPS-002) |

### Frontend ([frontend/package.json](../frontend/package.json))

| Thành phần | Phiên bản | Vai trò | Nhận xét |
|---|---|---|---|
| React / React DOM | 19.2.6 | UI | |
| Vite | 8.0.12 | Build tool | |
| React Router DOM | 7.15.0 | Routing | |
| Zustand | 5.0.13 | Quản lý state | 2 store: auth, jobs |
| Axios + qs | 1.16.1 | HTTP client | Hard-code `localhost` (OPS-001) |
| Tailwind CSS | 3.4.19 | Styling | |
| daisyUI | 5.5.19 | Component CSS | daisyUI 5 được thiết kế cho Tailwind 4 (DEP-001, chưa xác minh được) |
| @tailwindcss/line-clamp | 0.4.4 | — | Thừa, vì Tailwind đã có sẵn tính năng này từ bản 3.3 |
| react-hot-toast | 2.6.0 | Thông báo | **Không render `<Toaster />`** nên không thông báo nào hiện ra (ERR-003) |
| @clerk/clerk-react | 5.61.3 | Google OAuth | Đã bị đánh dấu **deprecated** trong lockfile |
| lucide-react, react-icons | — | Icon | `react-icons` không dùng |

### Hạ tầng dự kiến (theo README)

Backend deploy lên Render, frontend deploy lên Vercel. **Trong repo không có** file cấu hình deploy, Dockerfile hay CI nào.

## 5. Quy mô và tình trạng hoàn thiện

| Chỉ số | Giá trị |
|---|---|
| Số file Git theo dõi | 71 |
| Dòng code backend (`src` + `seeds`) | ~806 dòng |
| Dòng code frontend (`src`, JS/JSX/CSS) | ~1.678 dòng |
| Số endpoint API | 13 (5 auth, 8 jobs) |
| Số collection MongoDB | 4 (`users`, `jobs`, `savejobs`, `applyjobs`) |
| Test tự động | 0 |
| Pipeline CI/CD | Không có |
| Số commit | 6 (khoảng 09/06 – 13/06/2026) |

**Đánh giá mức hoàn thiện:** đây là một **MVP học tập có đủ luồng chính end-to-end**, nhưng đang ở giai đoạn "chạy được trên máy của người viết". Nhiều luồng mới đi được happy path, còn các nhánh lỗi, dữ liệu bất thường và môi trường khác (Linux, production) thì chưa được xử lý.

## 6. Điểm mạnh tổng quan

1. **Hoàn thành một vòng full-stack thật sự:** UI → state → HTTP → middleware → DB → dịch vụ ngoài (Cloudinary). Với người tự học, đây là cột mốc quan trọng.
2. **Có ý thức bảo mật cơ bản đúng hướng:** JWT đặt trong cookie `httpOnly` với `sameSite: "strict"` ([generateToken.js:11-16](../backend/src/utils/generateToken.js#L11-L16)), mật khẩu hash bằng bcrypt, `select("-password")` trong middleware ([protectRouter.js:19](../backend/src/utils/protectRouter.js#L19)).
3. **Kiểm tra quyền sở hữu dữ liệu đúng cách:** mọi truy vấn saved/applied/delete đều lọc theo `userId` của người đang đăng nhập ([deleteSavedJobControllers.js:11-17](../backend/src/controllers/deleteSavedJobControllers.js#L11-L17)). Nhờ vậy không có lỗi IDOR, tức người này không xoá hay xem được dữ liệu của người khác.
4. **Schema Job khá chu đáo:** có `enum`, `required`, `unique` cho `sourceUrl` và đã nghĩ tới index ([jobschema.js:108-112](../backend/src/schemaModel/jobschema.js#L108-L112)).
5. **Chú ý trải nghiệm người dùng:** có skeleton loading và trạng thái loading riêng cho từng job (`savingJobId`, `applyingJobId`).
6. **README có tư duy phản tư:** mục "Architecture Decisions" và "What I Learned" cho thấy học viên biết giải thích vì sao chọn giải pháp và rút kinh nghiệm từ bug. Đây là thói quen rất đáng giữ.

## 7. Hạn chế tổng quan

1. **Secret thật đã bị commit và push lên GitHub** (SEC-001, Critical). Commit xoá sau đó không xoá được lịch sử.
2. **Backend không khởi động được trên Linux** vì import sai chữ hoa/thường (ERR-001, Critical).
3. **Hợp đồng API giữa frontend và backend không nhất quán.** Đây là nguồn gốc của nhiều lỗi crash và lỗi nghiệp vụ (ARCH-002, ERR-002, BIZ-001, BIZ-002).
4. **Gần như không có lớp validation hay xử lý lỗi tập trung** (VAL-001, ERR-006, ERR-009).
5. **Không có test, CI hay tài liệu cấu hình môi trường**, nên lỗi chỉ lộ ra khi người dùng gặp (TEST-001, OPS-002).
6. **Nhiều bài học ghi trong README chưa được áp dụng nhất quán vào code.** Ví dụ: vẫn dùng `<a href>` thay vì `<Link>`, vẫn còn nhánh không trả response, và lỗi "auth timing" vẫn còn (CODE-005, VAL-001, ERR-005).

Chi tiết từng vấn đề có trong [05 — Danh sách lỗi và rủi ro](05-DANH-SACH-LOI-VA-RUI-RO.md).

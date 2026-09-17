# 06 — Chất lượng code

> [← Mục lục](00-MUC-LUC.md) · [← 05 Lỗi và rủi ro](05-DANH-SACH-LOI-VA-RUI-RO.md) · Tiếp theo: [07 — Database →](07-DATABASE-VA-TOAN-VEN-DU-LIEU.md)

## 1. Đánh giá nhanh

| Tiêu chí | Mức | Tóm tắt |
|---|---|---|
| Clean Code (hàm ngắn, early return, rõ ý) | 🟡 Khá | Hàm phần lớn ngắn, có early return; nhưng còn log debug, magic number, nhánh logic khó đọc |
| Naming | 🔴 Yếu | Sai chính tả, tên không phản ánh ý nghĩa, không có quy ước chung |
| Độ phức tạp | 🟢 Tốt | Không có hàm nào quá phức tạp; độ phức tạp nằm ở tích hợp, không nằm ở thuật toán |
| Trùng lặp | 🔴 Yếu | Nhiều cặp file gần như sao chép nhau |
| Coupling / Cohesion | 🟡 Trung bình | Component gắn chặt store; controller trộn nhiều trách nhiệm |
| Error handling | 🔴 Yếu | Nuốt lỗi, mã lỗi sai, không có handler tập trung |
| Khả năng đọc | 🟡 Khá | Format đồng đều; JSX dài vì Tailwind nhưng vẫn đọc được |
| Khả năng bảo trì / mở rộng | 🟡 Trung bình | Thêm tính năng tương tự thì phải copy thêm một bộ file |
| Over-engineering | 🟢 Không có | Đúng mức cho quy mô |

## 2. Clean Code

### 2.1. Những điểm làm tốt (nên giữ)

| Thực hành | Ví dụ | Vì sao tốt |
|---|---|---|
| **Early return / guard clause** | [appliedJobCotrollers.js:5-12](../backend/src/controllers/appliedJobCotrollers.js#L5-L12), [protectRouter.js:12-22](../backend/src/utils/protectRouter.js#L12-L22) | Giảm lồng `if`, luồng chính dễ theo dõi |
| **Cấu hình UI dạng dữ liệu** | [JobSidebar.jsx:5-61](../frontend/src/components/JobSidebar.jsx#L5-L61) dùng mảng `filterData` rồi `map` ra UI | Thêm một nhóm filter chỉ cần thêm dữ liệu, không phải viết thêm JSX. Đây là tư duy **data-driven UI** tốt. |
| **Cập nhật state bất biến** | [JobSidebar.jsx:76-83](../frontend/src/components/JobSidebar.jsx#L76-L83) dùng `setList((prev) => …)` và `filter`/spread | Đúng cách React, tránh lỗi state cũ |
| **Dọn dẹp side effect** | [SettingButton.jsx:19-25](../frontend/src/components/SettingButton.jsx#L19-L25) gỡ `removeEventListener` khi unmount | Tránh memory leak, một chi tiết mà nhiều người mới bỏ qua |
| **Loading theo từng phần tử** | `savingJobId`, `applyingJobId` ([JobCard.jsx:30-32](../frontend/src/components/JobCard.jsx#L30-L32)) | Chỉ card đang xử lý bị disable, không khoá cả danh sách |
| **Link ngoài an toàn** | `target="_blank" rel="noreferrer"` ([JobCard.jsx:150-151](../frontend/src/components/JobCard.jsx#L150-L151)) | Chống tabnabbing, đúng chuẩn bảo mật |
| **Không trả password** | `.select("-password")` ([protectRouter.js:19](../backend/src/utils/protectRouter.js#L19)) | Nguyên tắc "không lộ dữ liệu thừa" |
| **`finally` để tắt loading** | [jobsStore.js:32-34](../frontend/src/zustand/jobsStore.js#L32-L34) | Loading luôn tắt dù thành công hay thất bại |

### 2.2. Những điểm cần cải thiện

**a) Logic phân nhánh khó đọc và thiếu nhánh mặc định**

```js
// authControllers.js:100-130 (rút gọn)
if (profilePic === undefined || profilePic === null) return 401;
if (profilePic) { ...upload...; return 200; }
if (profilePic === "") { ...xoá...; return 200; }
// ← không có return ở đây: false, 0, NaN làm request treo
```

Người đọc phải tự suy luận các giá trị "falsy nhưng không null" để biết nhánh nào chạy. Cách rõ ràng hơn là **validate kiểu trước** (chỉ chấp nhận `string`), sau đó chỉ còn hai trường hợp: chuỗi rỗng (xoá ảnh) hoặc data URI (upload).

**b) Magic numbers và magic strings**

| Giá trị | Vị trí | Nên là |
|---|---|---|
| `10` (page size) | [jobsControllers.js:47](../backend/src/controllers/jobsControllers.js#L47) | `const PAGE_SIZE = 10` hoặc query `limit` có giới hạn |
| `10` (bcrypt rounds) | [authControllers.js:27](../backend/src/controllers/authControllers.js#L27) | `BCRYPT_ROUNDS` trong config |
| `"7d"` và `7 * 24 * 60 * 60 * 1000` | [generateToken.js:8, 12](../backend/src/utils/generateToken.js#L8-L12) | Một hằng số dùng chung, tránh lệch nhau khi sửa một chỗ |
| `"10mb"` | [index.js:16-17](../backend/src/index.js#L16-L17) | Config |
| Regex email viết 2 kiểu ở 3 nơi | [authControllers.js:13](../backend/src/controllers/authControllers.js#L13), [LogInPage.jsx:19](../frontend/src/Pages/LogInPage.jsx#L19), [SignUpPage.jsx:33](../frontend/src/Pages/SignUpPage.jsx#L33) | Một hàm `isValidEmail` hoặc schema validate |
| Màu hex tuỳ ý `bg-[#2d2d2d]`, `border-[#4a4a4a]`, `text-[#c9c9c9]` | JobCard, JobSidebar, AppliedJobsCard | Design token trong `tailwind.config` (ví dụ `bg-surface`, `border-subtle`) |

**c) Hàm khai báo `async` không cần thiết**

`generateToken` ([generateToken.js:6](../backend/src/utils/generateToken.js#L6)), `logout` và `checkAuth` ([authControllers.js:75, 84](../backend/src/controllers/authControllers.js#L75-L84)) không có `await` nào. `async` không làm hại gì trong trường hợp `logout`/`checkAuth`, nhưng với `generateToken` nó biến một lỗi đồng bộ thành **promise bị reject mà không ai bắt** (ERR-007). Chỉ khai báo `async` khi thật sự cần `await`.

**d) `try/catch` bao quanh code không thể ném lỗi**

```js
// authControllers.js:84-94
export const checkAuth = async (req, res) => {
  try {
    const user = req.user;                 // biến không dùng
    return res.status(200).json({ ..., user: req.user });
  } catch (error) { ... }
};
```

`try/catch` ở đây không bảo vệ được gì. Ngược lại, những dòng **có thể** ném lỗi (destructure `req.body`) lại nằm **ngoài** `try` ([authControllers.js:8, 49, 98](../backend/src/controllers/authControllers.js#L8)). Bài học ở đây là đặt `try` theo **rủi ro thực tế**, không đặt theo thói quen.

## 3. Naming

| Tên hiện tại | Vị trí | Vấn đề | Gợi ý |
|---|---|---|---|
| `appliedJobCotrollers.js` | backend/controllers | Sai chính tả "Controllers" | `applyJob.controller.js` |
| `getAppliedJobsRouters.js` | backend/controllers | Là controller nhưng hậu tố "Routers" | `getAppliedJobs.controller.js` |
| `JobsChecking` | [jobsControllers.js:3](../backend/src/controllers/jobsControllers.js#L3) | Hàm làm việc *search*, không phải *check* | `searchJobs` |
| `SaveJobs`, `AppliedJob` (PascalCase) | controllers | PascalCase thường dành cho class/component | `saveJob`, `applyJob` |
| `protectRouter` | utils | Bảo vệ *route*, không phải *router*; lại nằm trong utils | `requireAuth` trong `middlewares/` |
| `schemaModel/`, `savedJobsschema.js`, `appliedJobschema.js` | backend | Viết hoa/thường không đều | `models/savedJob.model.js` |
| `MONGOO_URI` | [connectDB.js:8](../backend/src/utils/connectDB.js#L8) | Thừa chữ O | `MONGODB_URI` |
| `genPass` | [authControllers.js:27](../backend/src/controllers/authControllers.js#L27) | Thực chất là salt | `salt` |
| `reGexemail` | [authControllers.js:13](../backend/src/controllers/authControllers.js#L13) | Viết hoa lộn xộn | `EMAIL_REGEX` |
| `newJobUpdate` | [saveJobControllers.js:23](../backend/src/controllers/saveJobControllers.js#L23) | Không phải "update" mà là bản ghi save mới | `savedJob` |
| `havingJob`, `deleteJob` | delete controllers | `deleteJob` là **kết quả** đã xoá, nghe như một hàm | `existing`, `deleted` |
| `cookieParse` | [index.js:5](../backend/src/index.js#L5) | Lệch tên package | `cookieParser` |
| `/deleteds/:jobId`, `/deleteda/:jobId` | [jobsRouters.js:21-22](../backend/src/routers/jobsRouters.js#L21-L22) | Viết tắt khó hiểu; param không phải jobId | `DELETE /saved-jobs/:savedJobId` |
| `jobsStore` vs `useAuthStore` | frontend/zustand | Hai store, hai quy ước đặt tên | `useJobsStore`, `useAuthStore` |
| `HeadeProfilepage` | components | Sai chính tả, viết hoa lộn xộn | `ProfileHeader` |
| `SavedjobsPage`, `LogInPage` | Pages | Không đều (`Savedjobs` / `AppliedJobs`, `LogIn` / `SignUp`) | `SavedJobsPage`, `LoginPage` |
| `AppliedJobsHeader.jsx` export `SavedJobsHeader` | [AppliedJobsHeader.jsx:6](../frontend/src/components/AppliedJobsHeader.jsx#L6) | Tên component khác tên file (do copy) | `AppliedJobsHeader` |
| `handleLockout` | [SettingButton.jsx:15](../frontend/src/components/SettingButton.jsx#L15) | *Lockout* ≠ *logout* | `handleLogout` |
| `deletePrepic`, `setShowpass`, `isChoice`, `updateValue`, `removeValue` | ProfilePage, Login, JobSidebar | Tên không diễn đạt ý | `clearPreview`, `setShowPassword`, `isSelected`, `nextValues`, `v` |
| `list` | [JobSidebar.jsx:65](../frontend/src/components/JobSidebar.jsx#L65) | Quá chung chung | `selectedFilters` |
| Thư mục `skeleton ` | components | Có dấu cách ở cuối (OPS-003) | `skeleton` |

> **Nguyên tắc gợi ý:** tên nên trả lời được câu hỏi "cái này **là gì** / **làm gì** trong nghiệp vụ?", không trả lời "mình đã gõ gì lúc code". Thống nhất **một** quy ước (ví dụ `camelCase` cho hàm, `PascalCase` cho component, `kebab-case` hoặc `x.controller.js` cho file) và ghi vào README.

## 4. Độ phức tạp

| Hàm / Component | Dòng | Nhánh chính | Nhận xét |
|---|---|---|---|
| `JobsChecking` | [jobsControllers.js](../backend/src/controllers/jobsControllers.js) (64 dòng) | ~8 `if` | Chấp nhận được. Có thể tách `buildJobQuery(query)` thành hàm thuần để **unit test không cần DB**. |
| `profileUpdate` | [authControllers.js:96-135](../backend/src/controllers/authControllers.js#L96-L135) (40 dòng) | 4 nhánh chồng lấn | Khó đọc vì các nhánh dựa trên truthy/falsy; nên validate kiểu trước |
| `JobCard` | [JobCard.jsx](../frontend/src/components/JobCard.jsx) (161 dòng) | Nhiều `&&` hiển thị có điều kiện | Chủ yếu là markup; phức tạp tăng thêm do props thừa |
| `JobSidebar` | [JobSidebar.jsx](../frontend/src/components/JobSidebar.jsx) (161 dòng) | Ít | ~60 dòng là dữ liệu cấu hình, nên tách sang `constants/jobFilters.js` |
| `SignUpPage` | [SignUpPage.jsx](../frontend/src/Pages/SignUpPage.jsx) (150 dòng) | Ít | Trộn form, validate, Google OAuth |

**Kết luận:** độ phức tạp cục bộ **thấp**. Rủi ro của dự án không nằm ở thuật toán khó mà ở **sự không nhất quán giữa các phần đơn giản**. Đây là đặc trưng chung của dự án CRUD.

## 5. Trùng lặp

| Nhóm trùng lặp | Các file | Mức giống | Đã gây ra lỗi? | Cách gộp |
|---|---|---|---|---|
| Header trang | [FindjobsHeader](../frontend/src/components/FindjobsHeader.jsx), [SavedJobsHeader](../frontend/src/components/SavedJobsHeader.jsx), [AppliedJobsHeader](../frontend/src/components/AppliedJobsHeader.jsx), [HeadeProfilepage](../frontend/src/components/HeadeProfilepage.jsx) | ~80% | **Có**: "Jobs Saved" ở trang Applied; comment tiếng Việt `{/* Nút Settings */}` bị copy theo | `<PageHeader title description actions />` |
| Skeleton | [AppliedJobsSkeleton](../frontend/src/components/skeleton%20/AppliedJobsSkeleton.jsx), [SavedJobCardSkeleton](../frontend/src/components/skeleton%20/SavedJobCardSkeleton.jsx) | **100%** (chỉ khác tên và dòng import React) | Chưa | `<ListItemSkeleton />` |
| Card danh sách | [SavedJobCard](../frontend/src/components/SavedJobCard.jsx), [AppliedJobsCard](../frontend/src/components/AppliedJobsCard.jsx) | ~60% | Không nhất quán: một bên có deadline, một bên không | Một `BookmarkCard` có props tuỳ chọn |
| Trang danh sách | [SavedjobsPage](../frontend/src/Pages/SavedjobsPage.jsx), [AppliedJobsPage](../frontend/src/Pages/AppliedJobsPage.jsx) | ~85% | **Có**: Saved có empty state, Applied thì không | Component `BookmarkListPage` nhận `type` |
| Form auth | [LogInPage](../frontend/src/Pages/LogInPage.jsx), [SignUpPage](../frontend/src/Pages/SignUpPage.jsx) | ~70% (validate, input mật khẩu có nút ẩn/hiện) | **Có**: Login quên import `toast` | `validateAuthForm()`, `<PasswordInput />` |
| Controller tạo bookmark | [saveJobControllers.js](../backend/src/controllers/saveJobControllers.js), [appliedJobCotrollers.js](../backend/src/controllers/appliedJobCotrollers.js) | ~95% | Cả hai cùng thiếu kiểm tra Job tồn tại, cùng dùng sai mã 401 | `createBookmark(Model)` hoặc gộp model |
| Controller xoá | [deleteSavedJobControllers.js](../backend/src/controllers/deleteSavedJobControllers.js), [deleteApplyJobControllers.js](../backend/src/controllers/deleteApplyJobControllers.js) | ~98% | Cùng thực hiện 2 truy vấn thừa | `deleteBookmark(Model)` |
| Controller lấy danh sách | [getSavedJobsController.js](../backend/src/controllers/getSavedJobsController.js), [getAppliedJobsRouters.js](../backend/src/controllers/getAppliedJobsRouters.js) | ~90% | — | `listBookmarks(Model)` |
| Model | [savedJobsschema.js](../backend/src/schemaModel/savedJobsschema.js), [appliedJobschema.js](../backend/src/schemaModel/appliedJobschema.js) | **100%** về cấu trúc | Cùng thiếu index | Xem thảo luận gộp model ở [07](07-DATABASE-VA-TOAN-VEN-DU-LIEU.md) |
| Store actions | `saveJob`/`applyJob`, `deleteSavedJob`/`deleteAppliedJob`, `fetchSavedJobs`/`fetchAppliedJobs` | ~90% | **Có**: toast của apply ghi "Saving" | Factory hoặc store bookmark chung |
| Guard route | [App.jsx:37-75](../frontend/src/App.jsx#L37-L75) | Lặp 4 lần `authUser ? <X/> : <Navigate to="/login"/>` | — | `<ProtectedRoute>` |

> **Quan sát sư phạm:** trong bảng trên, **5/11 nhóm trùng lặp đã sinh ra lỗi thật**. Đây là minh chứng cụ thể cho nguyên tắc DRY: cái giá của copy-paste không nằm ở số dòng code, mà ở chỗ lỗi và sự thiếu nhất quán bị nhân bản theo.
>
> Tuy vậy, **đừng gộp quá sớm**: hai thứ chỉ nên gộp khi chúng thay đổi vì **cùng một lý do**. Saved và Applied thoả điều kiện này, vì cùng là "mối quan hệ giữa user và job".

## 6. Coupling và cohesion

### 6.1. Coupling (mức độ phụ thuộc)

| Cặp | Kiểu coupling | Mức | Hệ quả |
|---|---|---|---|
| `JobCard` → `jobsStore` | Component lá gọi store toàn cục | Cao | Không tái sử dụng hay test độc lập được; re-render theo toàn store |
| 4 Header → `jobsStore` | Như trên | Cao | Header "trình bày" lại phụ thuộc dữ liệu nghiệp vụ |
| Stores → `react-hot-toast` | Tầng state phụ thuộc tầng UI | Trung bình | Không kiểm soát được thông báo theo ngữ cảnh |
| Frontend ↔ Backend | **Coupling ngầm** qua shape JSON, không có tài liệu | Cao và **vô hình** | ERR-002, BIZ-001, BIZ-002, BIZ-009 |
| Controllers → Mongoose models | Trực tiếp | Trung bình | Chấp nhận được ở quy mô này |
| `authControllers` → Cloudinary SDK | Trực tiếp | Trung bình | Đổi nhà cung cấp ảnh phải sửa controller auth |
| Mọi module → `process.env` | Global | Trung bình | Phụ thuộc thứ tự import (ARCH-003) |

**Coupling nguy hiểm nhất là coupling không nhìn thấy được.** `import` giữa các file thì editor và linter theo dõi được. Còn việc frontend giả định `res.data.savedJobs[i].jobId.title` tồn tại thì không có công cụ nào kiểm tra, trừ test hoặc type được chia sẻ.

### 6.2. Cohesion (mức độ gắn kết bên trong module)

| Module | Cohesion | Lý do |
|---|---|---|
| `jobSchema` | Cao | Chỉ mô tả Job |
| `JobSidebar` | Cao | Chỉ lo bộ lọc |
| `SettingButton` | Cao | Chỉ lo dropdown |
| `authControllers` | Thấp | Xác thực + hồ sơ + upload ảnh |
| `jobsStore` | Thấp | Danh sách job + saved + applied + search |
| `App.jsx` | Trung bình | Routing + guard + bootstrap + layout |
| `utils/` (backend) | Thấp | Middleware, DB, JWT, SDK nằm chung chỉ vì "không biết để đâu" |

## 7. Error handling

### 7.1. Mẫu đang dùng

```js
// Backend — lặp lại ở mọi controller
try { ... } catch (error) {
  console.error("Some message", error.message);   // chỉ message, mất stack
  res.status(500).json({ message: "Server Error" });
}

// Frontend — lặp lại ở mọi action
try { ... ; toast.success("...") }
catch (error) { toast.error(error.response?.data?.message || "... failed"); }
```

### 7.2. Đánh giá

| Khía cạnh | Hiện trạng | Vấn đề |
|---|---|---|
| Phân loại lỗi | Mọi lỗi không lường trước đều trả 500 | Lỗi của client (ObjectId sai, token hết hạn, E11000) bị coi là lỗi server |
| Thông tin debug | `error.message` | Mất stack trace, mất context (user nào, request nào) |
| Tính nhất quán | Mỗi controller tự viết thông báo | "Server Error" / "Server error"; "Data Invalid", "Information Invalid" chỉ là nhãn log chung chung |
| Nhánh không được bảo vệ | Destructure `req.body` ngoài `try` | Rơi vào handler mặc định (HTML + stack trace) |
| Frontend hiển thị | `toast` | Không có `<Toaster/>`, nên vô hình (ERR-003) |
| Lỗi render | Không có ErrorBoundary | Trắng toàn app |
| Lỗi mạng / timeout | Axios không đặt `timeout` | Request treo (ví dụ VAL-001 #3) khiến spinner quay mãi |
| Lỗi bị nuốt | `updateProfile` catch `ReferenceError` như lỗi mạng | Bug lập trình bị che thành "Update failed" |

### 7.3. Hướng cải thiện (vừa sức, không cần framework)

```js
// shared/httpError.js
export class HttpError extends Error {
  constructor(status, code, message) { super(message); this.status = status; this.code = code; }
}

// middlewares/errorHandler.js
export const errorHandler = (err, req, res, next) => {
  if (err.name === "CastError") err = new HttpError(400, "INVALID_ID", "Invalid id");
  if (err.code === 11000)        err = new HttpError(409, "DUPLICATE", "Already exists");
  const status = err.status ?? 500;
  if (status >= 500) console.error(err);            // log đầy đủ stack cho lỗi server
  res.status(status).json({ error: { code: err.code ?? "INTERNAL", message: status >= 500 ? "Internal error" : err.message } });
};
```

Với Express 5, controller `async` **không cần** `try/catch` nữa: lỗi được chuyển thẳng tới `errorHandler`. Nhờ vậy mỗi controller ngắn đi 5–6 dòng.

## 8. Khả năng đọc, bảo trì và mở rộng

**Điểm cộng:**

- Format khá đồng đều (dấu nháy kép, chấm phẩy, thụt lề 2 space), có vẻ đã dùng Prettier hoặc format-on-save.
- File ngắn, mỗi file một mục đích (ở mức file).
- Cấu trúc thư mục frontend quen thuộc (`Pages/`, `components/`, `zustand/`, `utils/`).

**Điểm trừ:**

1. **Class Tailwind rất dài với giá trị tuỳ ý** (`shadow-[0_0_100px_rgba(59,130,246,0.08)]`, `rounded-[32px]`, `text-[18px]`). Không có design token nên giao diện thiếu thống nhất: trang chủ dùng card xám đậm trên nền trắng, trang Profile dùng khối đen gradient, Navbar/Footer dùng xám nhạt.
2. **Không có kiểu dữ liệu** (TypeScript, JSDoc hay PropTypes), nên lỗi như `url` vs `sourceUrl` (BIZ-009) không được editor cảnh báo.
3. **Không có comment giải thích "vì sao"** ở những chỗ không hiển nhiên (ví dụ vì sao `city` dùng regex `\s*`).
4. **Mở rộng tốn kém:** thêm trạng thái "Interviewing" phải thêm model, 3 controller, 3 route, 3 action store, 1 page, 1 card, 1 header, 1 skeleton.

## 9. Dấu hiệu over-engineering hoặc code sinh tự động thiếu kiểm soát

### 9.1. Over-engineering

**Không phát hiện.** Dự án không có abstraction thừa, pattern phức tạp hay thư viện nặng không cần thiết. Việc dùng Zustand thay vì Redux là **đúng mức**. Điểm cần lưu ý duy nhất là tích hợp Clerk (ARCH-001): đây là "thêm công nghệ chưa cần", nhưng thực chất thuộc về **tích hợp dang dở** hơn là over-engineering.

### 9.2. Dấu hiệu code được ghép từ template hoặc công cụ sinh code mà chưa được đối chiếu

> ⚠️ **Không đủ bằng chứng để kết luận** code do AI hay do người viết. Phần dưới chỉ ghi nhận **dấu hiệu** để học viên tự đối chiếu. Dù code đến từ đâu, bài học vẫn giống nhau.

| Dấu hiệu | Bằng chứng | Vì sao đáng chú ý |
|---|---|---|
| Component nhận props **không tồn tại** trong mô hình dữ liệu | `JobCard` khai báo `daysLeft`, `experience`, `tags`, `source`, `url` | Component có vẻ được thiết kế cho một bộ dữ liệu "chung chung" rồi ghép vào mà không đối chiếu schema, dẫn trực tiếp tới BIZ-009 |
| Style trang trí phức tạp nhưng không nhất quán giữa các trang | `ProfilePage` dùng gradient, `shadow-[0_0_100px_...]`, `rounded-[32px]`; các trang khác dùng style khác | Thường gặp khi mỗi màn hình được sinh hoặc copy riêng lẻ |
| Comment dạng khung sườn bị nhân bản | `{/* Nút Settings */}` ở 2 header; `{/* Header */}`, `{/* Information */}`, `{/* Full Name */}` ở Profile | Comment mô tả cái đã hiển nhiên, không giải thích lý do |
| Nhánh backend chuẩn bị cho contract không ai gửi | `salary.ranges` + `currency` + `period` | Code "trông đầy đủ" nhưng không nối với frontend |
| Frontend có luồng Google OAuth nhưng backend không có | ARCH-001 | Tính năng dừng ở mức "có nút bấm" |
| README rất trau chuốt so với hiện trạng code | DOC-001, DOC-002 | Tài liệu mô tả ý định nhiều hơn thực tế |

**Bài học chung khi dùng code từ bất kỳ nguồn nào (template, tutorial, AI):**

1. **Đối chiếu với contract**: mỗi prop hoặc trường được đọc phải tồn tại trong dữ liệu thật.
2. **Xoá những gì chưa dùng**, đừng giữ lại "để sau".
3. **Chạy thử nhánh lỗi**, không chỉ nhánh thành công.
4. **Tự giải thích được từng dòng**: nếu chưa giải thích được vì sao dòng đó tồn tại, nghĩa là chưa hiểu đủ để chịu trách nhiệm về nó.

## 10. Checklist tự kiểm tra cho học viên

- [ ] Mọi hàm `async` đều thật sự có `await`, và mọi promise đều được `await` hoặc `.catch`
- [ ] Mọi nhánh của controller đều kết thúc bằng `res.*` hoặc `next()`
- [ ] Không còn `console.log` debug; không log token, cookie hay password
- [ ] Mỗi prop mà component đọc đều có trong dữ liệu truyền vào
- [ ] Chuỗi hiển thị (tiêu đề, nút, toast) đã được đọc lại sau khi copy
- [ ] Tên file, hàm, biến theo cùng một quy ước và không sai chính tả
- [ ] Hai file giống nhau trên 70% đã được cân nhắc gộp
- [ ] `pnpm lint` chạy sạch (và backend cũng có lint)

# UniSpace — Quy chuẩn thiết kế và cấu trúc Frontend

> Phiên bản: 1.0  
> Phạm vi: thư mục `FE/`  
> Công nghệ hiện tại: React 19, TypeScript, Vite  
> Trạng thái: tài liệu chuẩn áp dụng cho mọi màn hình và thay đổi Frontend mới

## 1. Mục tiêu

Tài liệu này là nguồn tham chiếu chung cho UI/UX và cách tổ chức mã nguồn Frontend của UniSpace. Mọi thành viên cần tuân thủ để giao diện đồng nhất, mã nguồn dễ tìm, dễ kiểm thử và dễ mở rộng.

Luồng giá trị cốt lõi của sản phẩm:

`Sinh viên → Cộng đồng → Tìm người phù hợp → Lập nhóm → Cộng tác`

UniSpace kết hợp bảng tin học thuật kiểu mạng xã hội với không gian cộng tác theo nhóm, kênh trò chuyện và tài nguyên dùng chung.

## 2. Nguyên tắc thiết kế

1. **Rõ ràng về học thuật:** môn học, mã lớp, vai trò, kỹ năng và tiến độ phải được trình bày có cấu trúc; ưu tiên card, badge và nhóm thông tin có nhãn.
2. **Tập trung và hiện đại:** dùng giao diện Dark Slate làm mặc định, hạn chế chi tiết trang trí gây nhiễu.
3. **Tương phản có chủ đích:** Cyan chỉ dùng để nhấn hành động chính, trạng thái được chọn, liên kết và focus; không dùng tràn lan.
4. **Mật độ thông tin hợp lý:** thông tin dày nhưng phải quét nhanh được nhờ phân cấp chữ, khoảng cách và module độc lập.
5. **Nhất quán trước sáng tạo:** tái sử dụng token và component có sẵn trước khi tạo biến thể mới.
6. **Trạng thái luôn minh bạch:** mọi thao tác bất đồng bộ phải thể hiện loading, thành công, lỗi và trạng thái rỗng.
7. **Accessibility là yêu cầu bắt buộc:** giao diện phải dùng được bằng bàn phím, screen reader và trong chế độ giảm chuyển động.

## 3. Design tokens

Không hard-code màu, khoảng cách, radius hoặc shadow trong component. Token phải được khai báo tập trung bằng CSS custom properties và được sử dụng qua `var(...)`.

### 3.1. Màu nền và bề mặt

| Token | Giá trị | Mục đích |
|---|---:|---|
| `--color-surface-lowest` | `#010f1f` | Nền sâu nhất, backdrop |
| `--color-surface` | `#051424` | Nền chính của ứng dụng |
| `--color-surface-low` | `#091829` | Sidebar, navigation |
| `--color-surface-container` | `#0d1f33` | Card, input, danh sách |
| `--color-surface-container-high` | `#13273f` | Card lồng, header phụ, code block |
| `--color-surface-bright` | `#1c3554` | Hover, selected, dropdown |

### 3.2. Màu thương hiệu và hành động

| Token | Giá trị | Mục đích |
|---|---:|---|
| `--color-primary` | `#06b6d4` | CTA chính, link active, focus ring |
| `--color-primary-hover` | `#0891b2` | Hover/active của CTA chính |
| `--color-primary-dim` | `rgba(6, 182, 212, 0.12)` | Nền badge và tab active |
| `--color-primary-glow` | `0 0 16px rgba(6, 182, 212, 0.35)` | Glow có chọn lọc |

### 3.3. Màu ngữ nghĩa

| Token | Giá trị | Ý nghĩa |
|---|---:|---|
| `--color-success` | `#10b981` | Thành công, online, đang tuyển |
| `--color-warning` | `#f59e0b` | Chờ xử lý, sắp đến hạn |
| `--color-danger` | `#ef4444` | Lỗi, xóa, khóa, từ chối |
| `--color-info` | `#8b5cf6` | Thông tin chuyên ngành, tài nguyên |

Không truyền đạt trạng thái chỉ bằng màu sắc. Luôn kết hợp màu với icon, nhãn hoặc thông báo văn bản.

### 3.4. Màu chữ

| Token | Giá trị | Mục đích |
|---|---:|---|
| `--text-primary` | `#f8fafc` | Tiêu đề và nội dung chính |
| `--text-secondary` | `#94a3b8` | Mô tả và metadata |
| `--text-muted` | `#64748b` | Placeholder, timestamp |
| `--text-accent` | `#38bdf8` | Mã môn học, hashtag, link nổi bật |

Tỷ lệ tương phản tối thiểu theo WCAG AA: `4.5:1` cho chữ thường và `3:1` cho chữ lớn hoặc thành phần UI.

## 4. Typography

Font mặc định:

```css
font-family: 'Be Vietnam Pro', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
```

| Cấp độ | Cỡ chữ | Line-height | Weight | Letter-spacing |
|---|---:|---:|---:|---:|
| Page title | `24px` | `32px` | `700` | `-0.02em` |
| Section heading | `18px` | `26px` | `600` | `-0.01em` |
| Card title | `15px` | `22px` | `600` | `0` |
| Body | `14px` | `21px` | `400` | `0` |
| Body medium | `14px` | `21px` | `500–600` | `0` |
| Caption | `12px` | `16px` | `500` | `0.01em` |
| Badge | `11px` | `14px` | `600` | `0.02em` |
| Code | `13px` | `18px` | `400–500` | `0` |

Quy định:

- Mỗi trang chỉ có một `h1`; không bỏ cấp heading.
- Dùng semantic HTML (`h1`–`h6`, `p`, `label`) thay vì tạo phân cấp chỉ bằng kích thước chữ.
- Code dùng `JetBrains Mono, Consolas, monospace`.
- Nội dung tiếng Việt phải lưu bằng UTF-8 và hiển thị đúng dấu.

## 5. Spacing, kích thước và elevation

### 5.1. Spacing scale

| Token | Giá trị |
|---|---:|
| `--space-1` | `4px` |
| `--space-2` | `8px` |
| `--space-3` | `12px` |
| `--space-4` | `16px` |
| `--space-5` | `20px` |
| `--space-6` | `24px` |
| `--space-8` | `32px` |
| `--space-12` | `48px` |

Chỉ dùng giá trị thuộc scale. Ngoại lệ phải có lý do rõ ràng và được bổ sung thành token nếu lặp lại.

### 5.2. Radius

- Input, button, badge: `8px`.
- Card, feed post, chat container: `12px`.
- Modal, dialog, popover: `16px`.
- Avatar, status dot, pill: `9999px`.

### 5.3. Border và shadow

```css
--border-default: 1px solid rgba(255, 255, 255, 0.08);
--border-active: 1px solid rgba(6, 182, 212, 0.5);
--shadow-card: 0 4px 20px -2px rgba(0, 0, 0, 0.5);
--shadow-modal: 0 20px 40px -10px rgba(0, 0, 0, 0.8),
  0 0 0 1px rgba(255, 255, 255, 0.1);
```

Shadow không thay thế border hoặc phân cấp khoảng cách. Không dùng glow cho nội dung thông thường.

## 6. Layout và responsive

- Thiết kế theo hướng mobile-first.
- Container nội dung chính có chiều rộng tối đa `1280px`, căn giữa và có padding ngang.
- Feed nên giữ chiều rộng đọc khoảng `640–760px`.
- Không đặt chiều cao cố định cho vùng chứa nội dung động.
- Dùng CSS Grid cho bố cục trang; dùng Flexbox cho bố cục một chiều bên trong component.

Breakpoint tham chiếu:

| Tên | Từ | Hành vi chính |
|---|---:|---|
| Mobile | `0px` | Một cột, sidebar chuyển thành drawer |
| Tablet | `768px` | Có thể hiển thị navigation thu gọn |
| Desktop | `1024px` | Sidebar cố định + vùng nội dung |
| Wide | `1280px` | Có thể mở member/resource panel |

Component phải kiểm tra tối thiểu ở các độ rộng `360px`, `768px`, `1024px` và `1440px`. Không tạo horizontal scroll ngoài các vùng chủ đích như bảng hoặc code block.

## 7. Quy chuẩn component UI

### 7.1. Button

- Biến thể: `primary`, `secondary`, `ghost`, `danger`, `icon`.
- Một vùng giao diện chỉ nên có một CTA chính.
- Chiều cao tối thiểu `40px`; vùng chạm trên mobile tối thiểu `44 × 44px`.
- Icon-only button bắt buộc có `aria-label` và tooltip khi ý nghĩa không hiển nhiên.
- Trạng thái bắt buộc: default, hover, focus-visible, active, disabled, loading.

### 7.2. Input và form

- Mỗi control có label hiển thị; placeholder không thay thế label.
- Thông báo lỗi đặt sát trường, mô tả cách sửa và được liên kết bằng `aria-describedby`.
- Validate khi blur hoặc submit; không báo lỗi khi người dùng chưa tương tác.
- Trường bắt buộc phải có ký hiệu và mô tả rõ.
- MSSV và email giáo dục sau khi xác thực SSO là read-only.

### 7.3. Card và badge

- Card dùng cùng một cấu trúc: header, content, actions.
- Toàn bộ card chỉ clickable khi hành vi rõ ràng và vẫn hỗ trợ bàn phím.
- Badge dùng cho trạng thái hoặc metadata ngắn, không dùng thay paragraph.
- Badge trạng thái luôn có nhãn chữ, không chỉ có chấm màu.

### 7.4. Modal, popover và toast

- Modal phải khóa focus, đóng được bằng `Escape` khi an toàn và trả focus về phần tử đã mở nó.
- Hành động phá hủy cần xác nhận; nút xác nhận ghi rõ hành động, ví dụ `Xóa bài viết`.
- Popover đóng khi click ra ngoài hoặc nhấn `Escape`.
- Toast dùng cho phản hồi ngắn; lỗi cần người dùng xử lý không được tự biến mất quá nhanh.
- Không dùng modal lồng modal.

### 7.5. Loading, empty và error state

- Dùng skeleton cho danh sách/card; spinner cho hành động cục bộ ngắn.
- Empty state phải nói rõ vì sao rỗng và cung cấp hành động tiếp theo nếu có.
- Error state có thông báo dễ hiểu và nút thử lại khi phù hợp.
- Không hiển thị raw exception hoặc thông tin kỹ thuật nhạy cảm cho người dùng.

## 8. Các mẫu giao diện chính

### 8.1. Header

Gồm logo, tìm kiếm, thông báo và menu tài khoản. Thông báo chưa đọc dùng badge số lượng. Menu tài khoản phải truy cập được bằng bàn phím.

### 8.2. Sidebar

Các nhóm chính: Bảng tin, Khám phá, Cộng đồng môn học, Không gian nhóm, Cài đặt và Trợ giúp. Trên mobile, sidebar chuyển thành drawer và có nút đóng rõ ràng.

### 8.3. Feed post

Thứ tự thông tin chuẩn:

1. Tác giả, trường/xác thực, thời gian và học kỳ.
2. Mục tiêu hoặc tiêu đề bài đăng.
3. Nội dung mô tả.
4. Lưới thông tin: tech stack, vị trí, trình độ, thời lượng.
5. Tiến độ đủ thành viên.
6. Reaction, bình luận, chia sẻ, lưu và CTA tham gia.

### 8.4. Space và chat

Gồm channel sidebar, chat header, message stream và member/resource panel. Tin nhắn hỗ trợ Markdown, code block và attachment; nội dung do người dùng nhập phải được sanitize trước khi render HTML.

### 8.5. Admin

Dashboard và bảng quản trị ưu tiên khả năng quét dữ liệu: filter rõ ràng, table header cố định khi cần, phân trang phía server và trạng thái thao tác minh bạch. Hành động khóa/xóa luôn yêu cầu xác nhận.

## 9. Motion và accessibility

- Animation chuẩn: `150–250ms`, easing `ease-out` khi xuất hiện và `ease-in` khi biến mất.
- Chỉ animate `transform` và `opacity` khi có thể.
- Tôn trọng `prefers-reduced-motion: reduce`.
- Focus ring phải luôn nhìn thấy khi điều hướng bằng bàn phím.
- Thứ tự tab phải theo thứ tự thị giác và logic.
- Ảnh nội dung có `alt`; ảnh trang trí dùng `alt=""`.
- Icon trang trí dùng `aria-hidden="true"`.
- Không dùng `div` có `onClick` thay cho `button` hoặc `a`.
- Form, dialog, navigation và status message phải có semantic/ARIA phù hợp.

## 10. Cấu trúc thư mục Frontend chuẩn

Áp dụng kiến trúc **feature-based**: mã nghiệp vụ nằm gần nhau theo tính năng; thành phần dùng chung thật sự mới đặt trong `shared`.

```text
FE/
├── public/                         # Tài nguyên tĩnh được phục vụ nguyên trạng
├── src/
│   ├── app/                        # Khởi tạo và cấu hình cấp ứng dụng
│   │   ├── App.tsx
│   │   ├── providers/              # Router, auth, query, theme providers
│   │   ├── routes/                 # Khai báo route và route guards
│   │   └── styles/                 # Global CSS, reset, tokens, fonts
│   ├── assets/                     # Ảnh, icon, font được bundler xử lý
│   ├── components/                 # Component bố cục dùng ở nhiều feature
│   │   ├── layout/                 # Header, Sidebar, PageShell
│   │   └── feedback/               # ErrorBoundary, AppLoader
│   ├── features/                   # Nghiệp vụ độc lập theo domain
│   │   ├── auth/
│   │   ├── feed/
│   │   ├── communities/
│   │   ├── spaces/
│   │   ├── chat/
│   │   ├── profiles/
│   │   └── admin/
│   ├── pages/                      # Composition cấp route, ít logic nghiệp vụ
│   ├── services/                   # Hạ tầng API dùng chung
│   │   ├── http-client.ts
│   │   └── endpoints.ts
│   ├── shared/                     # Khối tái sử dụng, không phụ thuộc feature
│   │   ├── ui/                     # Button, Input, Modal, Badge...
│   │   ├── hooks/
│   │   ├── lib/                    # Hàm tiện ích thuần
│   │   ├── constants/
│   │   └── types/
│   ├── test/                       # Test setup, mocks, fixtures dùng chung
│   ├── main.tsx                    # Entry point duy nhất
│   └── vite-env.d.ts
├── .env.example
├── design.md
├── package.json
├── tsconfig*.json
└── vite.config.ts
```

### 10.1. Cấu trúc một feature

Chỉ tạo thư mục khi thực sự có file tương ứng; không tạo cây thư mục rỗng.

```text
features/feed/
├── api/                            # Hàm gọi API riêng của feed
├── components/                     # Component chỉ dùng trong feed
├── hooks/                          # Hook nghiệp vụ của feed
├── model/                          # Types, schema, mapper, state
├── pages/                          # Trang thuộc feature nếu cần
├── utils/                          # Hàm thuần chỉ phục vụ feed
├── __tests__/                      # Test tích hợp của feature
└── index.ts                        # Public API của feature
```

### 10.2. Ranh giới phụ thuộc

Luồng phụ thuộc hợp lệ:

```text
app/pages → features → shared
     │           │         │
     └───────────┴────────→ services
```

Quy định:

- `shared` không import từ `features`, `pages` hoặc `app`.
- Feature không import file nội bộ của feature khác. Chỉ import từ public API (`index.ts`) hoặc chuyển phần dùng chung về `shared`.
- `pages` chỉ phối hợp layout và feature; không chứa API call hoặc logic nghiệp vụ phức tạp.
- `services` không import UI/component.
- Tránh circular dependency.
- Không tạo thư mục chung chung như `misc`, `common2`, `helpers-new`.

## 11. Quy ước đặt tên và file

| Loại | Quy ước | Ví dụ |
|---|---|---|
| Component | `PascalCase.tsx` | `PostCard.tsx` |
| Hook | `useCamelCase.ts` | `useFeedFilters.ts` |
| Utility/service | `kebab-case.ts` | `format-date.ts` |
| CSS Module | `ComponentName.module.css` | `PostCard.module.css` |
| Test | cùng tên + `.test` | `PostCard.test.tsx` |
| Type/interface | `PascalCase` | `RecruitmentPost` |
| Constant | `UPPER_SNAKE_CASE` | `MAX_UPLOAD_SIZE` |

Quy định bổ sung:

- Mỗi file component chính chỉ export một component chính.
- Ưu tiên named export trong module; component route có thể default export nếu lazy loading yêu cầu.
- Tên phải thể hiện nghiệp vụ, tránh `Data`, `Item`, `Thing`, `Manager` nếu không có ngữ cảnh.
- Boolean bắt đầu bằng `is`, `has`, `can`, `should`.
- Event handler nội bộ bắt đầu bằng `handle`; prop callback bắt đầu bằng `on`.
- Không viết tắt khó hiểu ngoài các từ phổ biến như `id`, `url`, `api`.

## 12. Quy chuẩn React và TypeScript

- Chỉ dùng function component và hooks.
- TypeScript ở chế độ `strict`; không dùng `any`. Dữ liệu ngoài hệ thống phải là `unknown` và được validate/narrow.
- Không lưu state có thể suy ra từ props hoặc state khác.
- Side effect phải nằm trong event handler hoặc `useEffect` có dependency đầy đủ.
- Không gọi API trực tiếp trong component trình bày.
- Tách component khi có trách nhiệm độc lập hoặc có khả năng tái sử dụng; không tách chỉ để giảm số dòng.
- Prop interface nhỏ, rõ nghĩa; ưu tiên composition thay vì nhiều cờ boolean.
- Dùng stable key từ dữ liệu, không dùng array index khi danh sách có thể thay đổi.
- Memoization (`useMemo`, `useCallback`, `memo`) chỉ dùng khi có lý do đo được hoặc cần ổn định reference.
- Cleanup subscription, timer và `AbortController` khi component unmount.

## 13. API, dữ liệu và bảo mật

- Base URL lấy từ `VITE_API_BASE_URL`; không hard-code URL môi trường trong feature.
- Mọi request đi qua HTTP client chung để thống nhất header, auth, timeout và xử lý lỗi.
- Định nghĩa request/response type; validate dữ liệu quan trọng tại boundary.
- Phân biệt lỗi mạng, lỗi xác thực, lỗi validation và lỗi server.
- Hủy request không còn cần thiết khi đổi route hoặc query.
- Không đưa secret vào biến `VITE_*`; mọi biến này có thể xuất hiện trong bundle trình duyệt.
- Không lưu access token dài hạn trong `localStorage` nếu hệ thống hỗ trợ secure HttpOnly cookie.
- Escape/sanitize nội dung người dùng; không dùng `dangerouslySetInnerHTML` với dữ liệu chưa được làm sạch.
- Không log token, mật khẩu, email đầy đủ hoặc dữ liệu cá nhân nhạy cảm.

## 14. CSS và tài nguyên

- Global CSS chỉ chứa reset, font, token và rule cấp ứng dụng.
- Style riêng của component dùng CSS Module hoặc giải pháp styling thống nhất do dự án chọn.
- Không dùng selector phụ thuộc sâu vào DOM của component khác.
- Không dùng `!important` trừ trường hợp tích hợp thư viện ngoài và phải có comment giải thích.
- Icon phải cùng một bộ, kích thước chuẩn `16`, `20`, `24px`.
- Ưu tiên SVG cho icon và logo; tối ưu ảnh raster, khai báo `width`/`height` để tránh layout shift.
- Ảnh ngoài vùng nhìn đầu tiên nên lazy-load.

## 15. Kiểm thử và tiêu chí hoàn thành

Ưu tiên kiểm thử hành vi người dùng thay vì chi tiết cài đặt.

Một thay đổi FE được coi là hoàn thành khi:

- TypeScript không có lỗi (`npm run typecheck`).
- Build thành công (`npm run build`).
- Có test cho logic hoặc luồng quan trọng khi hạ tầng test được thiết lập.
- Đã kiểm tra loading, empty, error, disabled và permission state liên quan.
- Đã kiểm tra responsive ở các breakpoint chuẩn.
- Có thể dùng bằng bàn phím và focus hiển thị đúng.
- Không hard-code design token hoặc dữ liệu môi trường.
- Nội dung tiếng Việt hiển thị đúng UTF-8.
- Không có lỗi hoặc warning mới trong console.

## 16. Quy trình thêm tính năng

1. Xác định feature sở hữu nghiệp vụ.
2. Định nghĩa type và API boundary.
3. Tái sử dụng component trong `shared/ui`; chỉ thêm component mới khi cần.
4. Xử lý đủ các trạng thái loading, empty, error và success.
5. Ghép feature vào page/route.
6. Kiểm tra accessibility, responsive, typecheck và build.
7. Cập nhật tài liệu này nếu phát sinh quy chuẩn dùng chung mới.

## 17. Quản trị tài liệu

- `FE/design.md` là nguồn quy chuẩn chính cho Frontend.
- Khi code hiện tại khác tài liệu, thay đổi mới phải hướng dần về tài liệu, không nhân rộng cấu trúc cũ.
- Thay đổi token, pattern UI hoặc ranh giới kiến trúc phải cập nhật tài liệu trong cùng pull request.
- Nếu cần ngoại lệ, ghi rõ lý do trong code review và giới hạn phạm vi ngoại lệ.


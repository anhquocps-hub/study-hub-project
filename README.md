# Study Hub

Monorepo đơn giản gồm React (`FE`), Node.js/Express (`BE`) và PostgreSQL. Docker Compose chỉ chạy database trong giai đoạn phát triển.

## Yêu cầu

- Node.js 22.12 trở lên và npm
- Docker Desktop hoặc Docker Engine có Compose

## Khởi chạy

1. Chạy PostgreSQL tại thư mục gốc:

   ```sh
   docker compose up -d db
   ```

2. Mở terminal cho BE:

   ```sh
   cd BE
   cp .env.example .env
   npm install
   npm run db:generate
   npm run dev
   ```

3. Mở terminal khác cho FE:

   ```sh
   cd FE
   cp .env.example .env
   npm install
   npm run dev
   ```

4. Mở `http://localhost:5173`. Trang sẽ báo kết nối thành công nếu BE và PostgreSQL đang chạy. Có thể kiểm tra API trực tiếp tại `http://localhost:3000/health`.

Trên PowerShell, dùng `Copy-Item .env.example .env` thay cho `cp` nếu cần. Nếu PowerShell chặn `npm.ps1`, dùng `npm.cmd` thay cho `npm`.

## Database và migration

`BE/prisma/schema.prisma` hiện chưa có model vì các thực thể Study Hub chưa được xác định. Sau khi thêm model, chạy trong `BE`:

```sh
npm run db:migrate -- --name initial
```

Prisma sẽ tạo migration và cập nhật PostgreSQL. Dùng `npm run db:generate` sau khi thay đổi schema nếu cần tạo lại Prisma Client.

## Kiểm tra bản build

Trong từng thư mục `FE` và `BE`, chạy `npm run typecheck` và `npm run build`.

## Cấu hình

- `BE/.env`: `DATABASE_URL`, `PORT`, `CLIENT_ORIGIN`.
- `FE/.env`: `VITE_API_BASE_URL`.
- `compose.yaml`: tài khoản PostgreSQL mặc định chỉ dành cho phát triển cục bộ. Đổi thông tin này và `DATABASE_URL` tương ứng trước khi dùng ở môi trường khác.

Database được lưu trong Docker volume `postgres_data` để dữ liệu vẫn còn sau khi dừng container. Chạy `docker compose down` để dừng dịch vụ mà vẫn giữ dữ liệu.

## Quy trình làm việc với Git

Dự án sử dụng hai nhánh cố định:

- `main`: phiên bản ổn định, đã được kiểm thử và sẵn sàng triển khai.
- `dev`: nhánh tích hợp các tính năng đang phát triển.

Mỗi tính năng hoặc bản sửa lỗi phải được thực hiện trên một nhánh riêng. Không commit trực tiếp vào `dev` hoặc `main`.

Luồng làm việc chuẩn:

```text
feature/* → Pull Request vào dev → kiểm thử trên dev → Pull Request dev vào main
```

### 1. Tạo nhánh feature từ `dev`

Cập nhật nhánh `dev` trước khi bắt đầu:

```sh
git switch dev
git pull origin dev
git switch -c feature/ten-tinh-nang
```

Quy ước đặt tên nhánh:

- Tính năng mới: `feature/ten-tinh-nang`
- Sửa lỗi: `fix/ten-loi`
- Cập nhật tài liệu: `docs/noi-dung`
- Công việc kỹ thuật: `chore/noi-dung`

Tên nhánh viết thường, không dấu và dùng dấu gạch ngang, ví dụ `feature/create-study-group`.

### 2. Phát triển và commit

Chỉ đưa vào commit những file thuộc phạm vi công việc. Trước khi commit, kiểm tra thay đổi:

```sh
git status
git diff
git add <duong-dan-file>
git commit -m "feat: add study group creation"
```

Commit message nên ngắn gọn và sử dụng tiền tố phù hợp:

- `feat:` thêm tính năng.
- `fix:` sửa lỗi.
- `docs:` cập nhật tài liệu.
- `refactor:` tái cấu trúc nhưng không thay đổi hành vi.
- `test:` thêm hoặc sửa kiểm thử.
- `chore:` công việc cấu hình hoặc bảo trì.

### 3. Đồng bộ với `dev`

Trước khi mở Pull Request, cập nhật thay đổi mới nhất từ `dev` và giải quyết conflict trên nhánh feature:

```sh
git fetch origin
git merge origin/dev
```

Sau đó chạy kiểm tra cho cả phần bị ảnh hưởng. Với FE hoặc BE, thực hiện trong thư mục tương ứng:

```sh
npm run typecheck
npm run build
```

Nếu dự án đã có test cho phần thay đổi, phải chạy toàn bộ test liên quan trước khi push.

### 4. Tạo Pull Request từ feature vào `dev`

Push nhánh lên remote:

```sh
git push -u origin feature/ten-tinh-nang
```

Tạo Pull Request với:

- Nhánh nguồn: `feature/ten-tinh-nang`.
- Nhánh đích: `dev`.
- Tiêu đề mô tả ngắn gọn thay đổi.
- Nội dung gồm mục tiêu, thay đổi chính, cách kiểm thử và ảnh giao diện nếu có.

Pull Request chỉ được merge khi:

- CI và các lệnh kiểm tra đều thành công.
- Không còn conflict.
- Đã được review và phê duyệt.
- Các góp ý bắt buộc đã được xử lý.

Sau khi merge, xóa nhánh feature trên remote và local nếu không còn sử dụng.

### 5. Kiểm thử trên `dev`

Nhánh `dev` là nơi kiểm thử tích hợp giữa FE, BE và database. Trước khi phát hành, cần kiểm tra:

- Typecheck, build và automated test đều thành công.
- Luồng nghiệp vụ mới hoạt động đúng.
- Các chức năng hiện có không bị ảnh hưởng.
- Migration và dữ liệu kiểm thử hoạt động đúng nếu có thay đổi database.
- Không có lỗi mới trong console hoặc log server.
- Giao diện đã được kiểm tra responsive và các trạng thái loading, empty, error.

Nếu phát hiện lỗi, tạo nhánh `fix/*` mới từ `dev`, sửa lỗi và mở Pull Request trở lại `dev`. Không sửa trực tiếp trên `dev`.

### 6. Tạo Pull Request từ `dev` vào `main`

Khi `dev` đã ổn định và hoàn tất kiểm thử, tạo Pull Request:

- Nhánh nguồn: `dev`.
- Nhánh đích: `main`.

Pull Request phát hành cần ghi rõ:

- Danh sách tính năng và lỗi đã sửa.
- Thay đổi cấu hình hoặc migration cần lưu ý.
- Kết quả kiểm thử.
- Hướng dẫn triển khai hoặc rollback nếu có.

Chỉ merge vào `main` sau khi CI thành công, kiểm thử được xác nhận và Pull Request được phê duyệt. Ưu tiên merge bằng **Squash and merge** cho nhánh feature và dùng một chiến lược nhất quán cho Pull Request phát hành.

### 7. Cập nhật local sau khi merge

```sh
git switch main
git pull origin main
git switch dev
git pull origin dev
```

Không merge `main` ngược vào `dev` nếu không có thay đổi riêng trên `main`. Nếu có hotfix trực tiếp từ `main`, phải tạo Pull Request đồng bộ hotfix đó trở lại `dev` ngay sau khi phát hành.

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

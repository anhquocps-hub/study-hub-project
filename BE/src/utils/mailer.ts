import nodemailer from 'nodemailer';

export type ResetOtpSender = (toEmail: string, otp: string) => Promise<void>;

let testOtpSender: ResetOtpSender | null = null;

export function setResetOtpSenderForTest(sender: ResetOtpSender | null): void {
  testOtpSender = sender;
}

function isSmtpConfigured(): boolean {
  return Boolean(
    process.env.SMTP_HOST &&
      process.env.SMTP_PORT &&
      process.env.SMTP_USER &&
      process.env.SMTP_PASS &&
      process.env.SMTP_FROM
  );
}

export async function sendResetOtpEmail(toEmail: string, otp: string): Promise<void> {
  if (testOtpSender) {
    await testOtpSender(toEmail, otp);
    return;
  }

  if (!isSmtpConfigured()) {
    const isDev = process.env.NODE_ENV === 'development' || !process.env.NODE_ENV;
    if (isDev) {
      console.log(`[DEV MAILER] OTP đặt lại mật khẩu cho ${toEmail}: ${otp} (hiệu lực 5 phút)`);
      return;
    }
    throw new Error('Cấu hình SMTP chưa đầy đủ.');
  }

  const port = Number(process.env.SMTP_PORT);
  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port,
    secure: port === 465,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  await transporter.sendMail({
    from: process.env.SMTP_FROM,
    to: toEmail,
    subject: 'UniSpace - Mã OTP đặt lại mật khẩu',
    text: `Mã OTP đặt lại mật khẩu của bạn là: ${otp}. Mã có hiệu lực trong 5 phút. Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.`,
    html: `
      <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #0f172a;">
        <h2>Đặt lại mật khẩu UniSpace</h2>
        <p>Mã OTP xác nhận của bạn là:</p>
        <p style="font-size: 24px; font-weight: bold; letter-spacing: 4px; color: #0891b2;">${otp}</p>
        <p>Mã này có hiệu lực trong <strong>5 phút</strong>.</p>
        <p>Nếu bạn không yêu cầu đặt lại mật khẩu, vui lòng bỏ qua email này.</p>
      </div>
    `,
  });
}

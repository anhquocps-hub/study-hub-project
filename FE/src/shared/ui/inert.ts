/**
 * Gắn vào phần tử của tính năng BE chưa hỗ trợ: vẫn hiển thị đúng thiết kế nhưng bấm vào không có gì xảy ra.
 * Không truyền onClick kèm theo; aria-disabled báo cho trình đọc màn hình biết phần tử chưa dùng được.
 */
export const INERT_PROPS = { 'aria-disabled': true, title: 'Sắp có' } as const;

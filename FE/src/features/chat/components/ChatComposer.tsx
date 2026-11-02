import { useState, type FormEvent, type KeyboardEvent } from 'react';
import iconAttach from '../../../assets/figma/chat-attach.svg';
import iconChart from '../../../assets/figma/chat-chart.svg';
import iconCode from '../../../assets/figma/chat-code.svg';
import iconEmoji from '../../../assets/figma/chat-emoji.svg';
import iconSend from '../../../assets/figma/chat-send.svg';
import { ApiError, GENERIC_ERROR } from '../../../services/http-client';
import { messageInputSchema, type ChatRoom } from '../model/chat-schemas';
import styles from './ChatWorkspace.module.css';

interface ChatComposerProps {
  kind: ChatRoom['kind'];
  channelName: string;
  onSend: (content: string) => Promise<void>;
}

const TOOLS = [
  { icon: iconAttach, label: 'Đính kèm tệp' },
  { icon: iconCode, label: 'Chèn code block' },
  { icon: iconEmoji, label: 'Chèn emoji' },
  { icon: iconChart, label: 'Tạo bình chọn' },
];

export function ChatComposer({ kind, channelName, onSend }: ChatComposerProps) {
  const [value, setValue] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sending, setSending] = useState(false);

  const submit = async (event?: FormEvent) => {
    event?.preventDefault();
    if (sending) return;
    const parsed = messageInputSchema.safeParse({ content: value });
    if (!parsed.success) {
      setError(parsed.error.issues[0].message);
      return;
    }
    setSending(true);
    setError(null);
    try {
      await onSend(parsed.data.content);
      setValue('');
    } catch (err) {
      setError(err instanceof ApiError ? err.message : GENERIC_ERROR); // giữ nguyên nội dung để gửi lại
    } finally {
      setSending(false);
    }
  };

  const onKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
    if (event.key === 'Enter' && !event.shiftKey && !event.nativeEvent.isComposing) {
      event.preventDefault();
      void submit();
    }
  };

  const placeholder =
    kind === 'COMMUNITY'
      ? `Nhập tin nhắn vào #${channelName}... (Hỗ trợ Markdown, code block \`, KaTeX công thức)`
      : `Nhập tin nhắn vào #${channelName} (Hỗ trợ Markdown, code block \`...\`)`;

  return (
    <form className={styles.composerArea} onSubmit={submit}>
      <div className={styles.composer}>
        <textarea
          className={styles.textarea}
          value={value}
          onChange={(event) => setValue(event.target.value)}
          onKeyDown={onKeyDown}
          placeholder={placeholder}
          aria-label={`Tin nhắn gửi vào #${channelName}`}
          rows={2}
        />
        <div className={styles.toolbar}>
          <div className={styles.tools}>
            {TOOLS.map((tool) => (
              <button key={tool.label} type="button" className={styles.tool} aria-label={tool.label} title={tool.label}>
                <img src={tool.icon} alt="" />
              </button>
            ))}
            {kind === 'COMMUNITY' && <span className={styles.toolDivider} aria-hidden="true" />}
            {kind === 'COMMUNITY' && <span className={styles.hint}>Nhấn Enter để gửi</span>}
          </div>
          <div className={styles.sendWrap}>
            {kind === 'SPACE' && <span className={styles.hint}>Enter để gửi</span>}
            <button type="submit" className={styles.send} disabled={sending}>
              Gửi
              <img src={iconSend} alt="" />
            </button>
          </div>
        </div>
      </div>
      {error && (
        <p className={styles.error} role="alert">
          {error}
        </p>
      )}
    </form>
  );
}

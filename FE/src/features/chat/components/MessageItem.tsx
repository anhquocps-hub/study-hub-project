import { useState } from 'react';
import iconCodeFile from '../../../assets/figma/chat-code-file.svg';
import iconFigma from '../../../assets/figma/chat-figma.svg';
import iconSparkle from '../../../assets/figma/chat-sparkle.svg';
import iconCopy from '../../../assets/figma/com-copy.svg';
import iconDownload from '../../../assets/figma/com-download.svg';
import { Avatar } from '../../../shared/ui';
import type { Attachment, ChatRoom, Message } from '../model/chat-schemas';
import styles from './ChatWorkspace.module.css';

export function formatTime(iso: string, kind: ChatRoom['kind']) {
  return new Date(iso).toLocaleTimeString(kind === 'COMMUNITY' ? 'en-US' : 'vi-VN', {
    hour: '2-digit',
    minute: '2-digit',
    hour12: kind === 'COMMUNITY',
  });
}

function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);
  const copy = async () => {
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };
  return (
    <button type="button" className={styles.copyBtn} onClick={copy}>
      <img src={iconCopy} alt="" className={styles.copyIcon} />
      {copied ? 'Đã chép' : 'Sao chép'}
    </button>
  );
}

function AttachmentView({ attachment }: { attachment: Attachment }) {
  if (attachment.kind === 'code')
    return (
      <div className={styles.code}>
        <div className={styles.codeHead}>
          <span className={styles.codeFile}>
            <img src={iconCodeFile} alt="" className={styles.codeFileIcon} />
            <span className={styles.codeDots} aria-hidden="true">
              <i />
              <i />
              <i />
            </span>
            {attachment.fileName}
          </span>
          <CopyButton text={attachment.code} />
        </div>
        <pre className={styles.pre}>{attachment.code}</pre>
      </div>
    );
  if (attachment.kind === 'link')
    return (
      <a className={styles.linkCard} href={`https://${attachment.url}`} target="_blank" rel="noreferrer">
        <span className={styles.linkIcon}>
          <img src={iconFigma} alt="" />
        </span>
        <span className={styles.linkBody}>
          <span className={styles.linkTitle}>{attachment.title}</span>
          <span className={styles.linkUrl}>{attachment.url}</span>
          <span className={styles.linkCta}>Xem bản vẽ tương tác →</span>
        </span>
      </a>
    );
  return (
    <div className={styles.fileCard}>
      <span className={styles.fileExt}>{attachment.ext}</span>
      <span className={styles.fileBody}>
        <span className={styles.fileName}>{attachment.fileName}</span>
        <span className={styles.fileMeta}>{attachment.meta}</span>
      </span>
      <button type="button" className={styles.fileDownload} aria-label={`Tải ${attachment.fileName}`}>
        <img src={iconDownload} alt="" />
      </button>
    </div>
  );
}

export function MessageItem({ message, kind }: { message: Message; kind: ChatRoom['kind'] }) {
  const time = formatTime(message.createdAt, kind);

  if (!message.author)
    return (
      <div className={styles.system}>
        <span className={styles.systemIcon}>
          <img src={iconSparkle} alt="" />
        </span>
        <div className={styles.systemBody}>
          <p className={styles.systemHead}>
            <strong>HỆ THỐNG UNISPACE</strong>
            <span className={styles.time}>{time}</span>
          </p>
          <p className={styles.systemText}>{message.content}</p>
        </div>
      </div>
    );

  const { author } = message;
  return (
    <article className={styles.message}>
      <Avatar name={author.fullName} src={author.avatarUrl} className={styles.msgAvatar} />
      <div className={styles.msgMain}>
        <p className={styles.msgHead}>
          <strong className={styles.msgName}>{author.fullName}</strong>
          {author.role && <span className={`${styles.badge} ${styles.role} ${styles[author.role.tone]}`}>{author.role.text}</span>}
          <time className={styles.time} dateTime={message.createdAt}>
            {time}
          </time>
        </p>
        <p className={message.attachment ? styles.msgText : `${styles.msgText} ${styles.bubble}`}>{message.content}</p>
        {message.attachment && <AttachmentView attachment={message.attachment} />}
        {message.reactions.length > 0 && (
          <div className={styles.reactions}>
            {message.reactions.map((reaction) => (
              <span key={reaction.emoji} className={styles.reaction}>
                <span aria-hidden="true">{reaction.emoji}</span>
                <span>{reaction.count}</span>
              </span>
            ))}
          </div>
        )}
      </div>
    </article>
  );
}

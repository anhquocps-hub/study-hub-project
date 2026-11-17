import { useEffect, useRef, useState, type ReactNode } from 'react';
import iconApply from '../../../assets/figma/filter-apply.svg';
import iconClose from '../../../assets/figma/filter-close.svg';
import iconHeader from '../../../assets/figma/filter-header.svg';
import iconMajor from '../../../assets/figma/filter-major.svg';
import iconReset from '../../../assets/figma/filter-reset.svg';
import iconArrows from '../../../assets/figma/filter-select-arrows.svg';
import iconSubject from '../../../assets/figma/filter-subject.svg';
import iconUniversity from '../../../assets/figma/filter-university.svg';
import { useMajors, useUniversities } from '../../academic';
import { postTypeSchema } from '../../posts/model/post-schemas';
import {
  groupStatusSchema,
  LEVEL_LABELS,
  levelSchema,
  POST_TYPE_LABELS,
  ROLE_LABELS,
  roleSchema,
  STATUS_LABELS,
  TAB_FILTERS,
  termOptions,
  type FilterKey,
  type SearchFilters,
  type SearchTab,
} from '../model/search-schemas';
import styles from './AdvancedFilterModal.module.css';

interface AdvancedFilterModalProps {
  tab: SearchTab;
  value: SearchFilters;
  onApply: (filters: SearchFilters) => void;
  onClose: () => void;
}

/** Nhóm nút chọn một (bấm lại nút đang chọn để bỏ chọn), dùng cho Học kỳ, Trình độ, Loại bài, Trạng thái. */
function Segmented<T extends string>({
  label,
  options,
  value,
  onChange,
}: {
  label: string;
  options: { value: T; label: string }[];
  value?: T;
  onChange: (value: T | undefined) => void;
}) {
  return (
    <div className={styles.segmentedRow}>
      <span className={styles.label}>{label}</span>
      <div className={styles.segmented} role="group" aria-label={label}>
        {options.map((option) => {
          const active = option.value === value;
          return (
            <button
              key={option.value}
              type="button"
              aria-pressed={active}
              className={active ? `${styles.segment} ${styles.segmentActive}` : styles.segment}
              onClick={() => onChange(active ? undefined : option.value)}
            >
              {option.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

function Field({ label, htmlFor, children }: { label: string; htmlFor: string; children: ReactNode }) {
  return (
    <div className={styles.field}>
      <label className={styles.label} htmlFor={htmlFor}>
        {label}
      </label>
      <div className={styles.control}>{children}</div>
    </div>
  );
}

/** Popup "Bộ lọc tìm kiếm chi tiết" (Figma 9:3290). Phần Dự án và Loại bài bổ sung theo PRD mục 27. */
export function AdvancedFilterModal({ tab, value, onApply, onClose }: AdvancedFilterModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const [draft, setDraft] = useState<SearchFilters>(value);
  const { state: universities } = useUniversities();
  const { state: majors } = useMajors(draft.universityId ?? '');
  const allowed = new Set<FilterKey>(TAB_FILTERS[tab]);
  const show = (...keys: FilterKey[]) => keys.some((key) => allowed.has(key));

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog?.showModal(); // modal thật: khóa nền, Esc để đóng, focus nằm trong popup
    return () => dialog?.close();
  }, []);

  const set = <K extends FilterKey>(key: K, next: SearchFilters[K] | undefined) =>
    setDraft((current) => {
      const updated = { ...current, [key]: next || undefined };
      if (key === 'universityId') updated.majorId = undefined; // ngành phụ thuộc trường
      return updated;
    });

  const text = (key: FilterKey) => ({
    id: `filter-${key}`,
    value: draft[key] ?? '',
    maxLength: 120,
    onChange: (event: { target: { value: string } }) => set(key, event.target.value as never),
  });

  const apply = () => {
    const cleaned = Object.fromEntries(
      Object.entries(draft).map(([key, item]) => [key, typeof item === 'string' ? item.trim() || undefined : item]),
    ) as SearchFilters;
    onApply(cleaned);
    onClose();
  };

  return (
    <dialog
      ref={dialogRef}
      className={styles.dialog}
      aria-labelledby="filter-title"
      aria-describedby="filter-desc"
      onCancel={(event) => {
        event.preventDefault();
        onClose();
      }}
      onClick={(event) => {
        if (event.target === dialogRef.current) onClose(); // bấm ra nền tối để đóng
      }}
    >
      <form
        className={styles.panel}
        onSubmit={(event) => {
          event.preventDefault();
          apply();
        }}
      >
        <header className={styles.header}>
          <div className={styles.headerMain}>
            <span className={styles.headerIcon}>
              <img src={iconHeader} alt="" />
            </span>
            <div className={styles.headerText}>
              <h2 id="filter-title" className={styles.title}>
                Bộ lọc tìm kiếm chi tiết
              </h2>
              <p id="filter-desc" className={styles.desc}>
                Tùy chỉnh tiêu chí tìm kiếm theo môn học, trường đại học, vai trò dự án và hình thức học tập.
              </p>
            </div>
          </div>
          <button type="button" className={styles.close} onClick={onClose} aria-label="Đóng bộ lọc">
            <img src={iconClose} alt="" />
          </button>
        </header>

        <div className={styles.body}>
          <section className={styles.section} aria-labelledby="sec-academic">
            <h3 id="sec-academic" className={styles.sectionTitle}>
              Học thuật
            </h3>
            <div className={styles.grid}>
              <Field label="Trường Đại học" htmlFor="filter-universityId">
                <img src={iconUniversity} alt="" className={styles.leadIcon} />
                <select
                  id="filter-universityId"
                  className={`${styles.input} ${styles.select}`}
                  value={draft.universityId ?? ''}
                  onChange={(event) => set('universityId', event.target.value)}
                >
                  <option value="">Tất cả trường</option>
                  {universities.status === 'success' &&
                    universities.data.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                </select>
                <img src={iconArrows} alt="" className={styles.arrows} />
              </Field>
              <Field label="Ngành học trực thuộc" htmlFor="filter-majorId">
                <img src={iconMajor} alt="" className={styles.leadIcon} />
                <select
                  id="filter-majorId"
                  className={`${styles.input} ${styles.select}`}
                  value={draft.majorId ?? ''}
                  onChange={(event) => set('majorId', event.target.value)}
                  disabled={!draft.universityId}
                >
                  <option value="">{draft.universityId ? 'Tất cả ngành' : 'Chọn trường trước'}</option>
                  {majors.status === 'success' &&
                    majors.data.map((item) => (
                      <option key={item.id} value={item.id}>
                        {item.name}
                      </option>
                    ))}
                </select>
                <img src={iconArrows} alt="" className={styles.arrows} />
              </Field>
              <Field label="Môn học / Đồ án chuyên ngành" htmlFor="filter-subject">
                <img src={iconSubject} alt="" className={styles.leadIconSubject} />
                <input className={`${styles.input} ${styles.inputSubject}`} placeholder="vd: Lập trình Web nâng cao" {...text('subject')} />
              </Field>
              {show('classCode', 'lecturer') && (
                <div className={styles.pair}>
                  <Field label="Mã lớp HP" htmlFor="filter-classCode">
                    <input className={`${styles.input} ${styles.inputPlain} ${styles.code}`} placeholder="SE402.N02" {...text('classCode')} />
                  </Field>
                  <Field label="Giảng viên hướng dẫn" htmlFor="filter-lecturer">
                    <input className={`${styles.input} ${styles.inputPlain}`} placeholder="TS. Nguyễn Thanh Hải" {...text('lecturer')} />
                  </Field>
                </div>
              )}
            </div>
            {show('term') && (
              <Segmented
                label="Học kỳ & Niên khóa áp dụng:"
                options={termOptions()}
                value={draft.term}
                onChange={(next) => set('term', next)}
              />
            )}
          </section>

          {show('skill', 'technology', 'role', 'level') && (
            <section className={styles.section} aria-labelledby="sec-project">
              <h3 id="sec-project" className={styles.sectionTitle}>
                Dự án &amp; Kỹ năng
              </h3>
              <div className={styles.grid}>
                <Field label="Kỹ năng" htmlFor="filter-skill">
                  <input className={`${styles.input} ${styles.inputPlain}`} placeholder="vd: Figma, SQL, Giao tiếp" {...text('skill')} />
                </Field>
                <Field label="Công nghệ" htmlFor="filter-technology">
                  <input className={`${styles.input} ${styles.inputPlain}`} placeholder="vd: React, .NET 8, PostgreSQL" {...text('technology')} />
                </Field>
                <Field label="Vai trò trong dự án" htmlFor="filter-role">
                  <select
                    id="filter-role"
                    className={`${styles.input} ${styles.select} ${styles.selectPlain}`}
                    value={draft.role ?? ''}
                    onChange={(event) => set('role', event.target.value as never)}
                  >
                    <option value="">Tất cả vai trò</option>
                    {roleSchema.options.map((role) => (
                      <option key={role} value={role}>
                        {ROLE_LABELS[role]}
                      </option>
                    ))}
                  </select>
                  <img src={iconArrows} alt="" className={styles.arrows} />
                </Field>
              </div>
              <Segmented
                label="Trình độ yêu cầu:"
                options={levelSchema.options.map((level) => ({ value: level, label: LEVEL_LABELS[level] }))}
                value={draft.level}
                onChange={(next) => set('level', next)}
              />
            </section>
          )}

          {show('postType', 'status') && (
            <section className={styles.section} aria-labelledby="sec-post">
              <h3 id="sec-post" className={styles.sectionTitle}>
                {show('postType') ? 'Loại bài & Trạng thái' : 'Trạng thái nhóm'}
              </h3>
              {show('postType') && (
                <Segmented
                  label="Loại bài viết:"
                  options={postTypeSchema.options.map((type) => ({ value: type, label: POST_TYPE_LABELS[type] }))}
                  value={draft.postType}
                  onChange={(next) => set('postType', next)}
                />
              )}
              <Segmented
                label="Trạng thái tuyển thành viên:"
                options={groupStatusSchema.options.map((status) => ({ value: status, label: STATUS_LABELS[status] }))}
                value={draft.status}
                onChange={(next) => set('status', next)}
              />
            </section>
          )}
        </div>

        <footer className={styles.footer}>
          <button type="button" className={styles.reset} onClick={() => setDraft({})}>
            <img src={iconReset} alt="" />
            Đặt lại mặc định
          </button>
          <div className={styles.actions}>
            <button type="button" className={styles.cancel} onClick={onClose}>
              Hủy
            </button>
            <button type="submit" className={styles.apply}>
              Áp dụng bộ lọc
              <img src={iconApply} alt="" />
            </button>
          </div>
        </footer>
      </form>
    </dialog>
  );
}

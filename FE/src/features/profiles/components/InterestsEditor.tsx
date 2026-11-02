import { useState, type KeyboardEvent } from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { Button, IconPlus, IconX, TextField } from '../../../shared/ui';
import { MAX_INTERESTS, type ProfileFormValues } from '../model/profile-form';
import styles from './ChipEditor.module.css';

const MAX_INTEREST_LENGTH = 30;

/** Thêm/xóa sở thích dạng thẻ; nhấn Enter hoặc bấm Thêm. */
export function InterestsEditor() {
  const { control } = useFormContext<ProfileFormValues>();
  const { field, fieldState } = useController({ control, name: 'interests' });
  const interests = field.value;

  const [text, setText] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleAdd = () => {
    const trimmed = text.trim();
    if (trimmed === '') return setError('Nhập sở thích.');
    if (trimmed.length > MAX_INTEREST_LENGTH) return setError(`Mỗi sở thích tối đa ${MAX_INTEREST_LENGTH} ký tự.`);
    if (interests.some((item) => item.toLowerCase() === trimmed.toLowerCase())) {
      return setError('Sở thích này đã có trong danh sách.');
    }
    if (interests.length >= MAX_INTERESTS) return setError(`Tối đa ${MAX_INTERESTS} sở thích.`);
    field.onChange([...interests, trimmed]);
    setText('');
    setError(null);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className={styles.editor}>
      <div className={`${styles.addRow} ${styles.addRowSingle}`}>
        <TextField
          label="Sở thích"
          placeholder="vd: AI, UI/UX, Game"
          value={text}
          onChange={(event) => {
            setText(event.target.value);
            setError(null);
          }}
          onKeyDown={handleKeyDown}
          error={error ?? undefined}
        />
        <Button variant="secondary" className={styles.addButton} onClick={handleAdd}>
          <IconPlus size={16} /> Thêm
        </Button>
      </div>

      {interests.length === 0 ? (
        <p className={styles.emptyText}>Chưa có sở thích nào.</p>
      ) : (
        <ul className={styles.chipList} aria-label="Sở thích đã thêm">
          {interests.map((interest) => (
            <li key={interest} className={styles.chip}>
              <span>{interest}</span>
              <button
                type="button"
                className={styles.chipRemove}
                onClick={() => field.onChange(interests.filter((item) => item !== interest))}
                aria-label={`Xóa sở thích ${interest}`}
              >
                <IconX size={16} />
              </button>
            </li>
          ))}
        </ul>
      )}

      {fieldState.error?.message && <p className={styles.error}>{fieldState.error.message}</p>}
    </div>
  );
}

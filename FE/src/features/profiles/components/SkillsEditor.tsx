import { useState, type KeyboardEvent } from 'react';
import { useController, useFormContext } from 'react-hook-form';
import { Badge, Button, IconPlus, IconX, SelectField, TextField } from '../../../shared/ui';
import { MAX_SKILLS, type ProfileFormValues } from '../model/profile-form';
import { SKILL_LEVEL_LABELS, SKILL_LEVELS, type SkillLevel } from '../model/profile-schemas';
import styles from './ChipEditor.module.css';

const LEVEL_OPTIONS = SKILL_LEVELS.map((level) => ({ value: level, label: SKILL_LEVEL_LABELS[level] }));
const LEVEL_BADGE: Record<SkillLevel, 'neutral' | 'info' | 'accent'> = {
  BEGINNER: 'neutral',
  INTERMEDIATE: 'info',
  ADVANCED: 'accent',
};
const MAX_SKILL_NAME = 30;

/** Thêm/xóa kỹ năng kèm trình độ. Ô nhập ở đây không thuộc form; chỉ danh sách kỹ năng được lưu. */
export function SkillsEditor() {
  const { control } = useFormContext<ProfileFormValues>();
  const { field, fieldState } = useController({ control, name: 'skills' });
  const skills = field.value;

  const [name, setName] = useState('');
  const [level, setLevel] = useState<SkillLevel>('INTERMEDIATE');
  const [error, setError] = useState<string | null>(null);

  const handleAdd = () => {
    const trimmed = name.trim();
    if (trimmed === '') return setError('Nhập tên kỹ năng.');
    if (trimmed.length > MAX_SKILL_NAME) return setError(`Tên kỹ năng tối đa ${MAX_SKILL_NAME} ký tự.`);
    if (skills.some((skill) => skill.name.toLowerCase() === trimmed.toLowerCase())) {
      return setError('Kỹ năng này đã có trong danh sách.');
    }
    if (skills.length >= MAX_SKILLS) return setError(`Tối đa ${MAX_SKILLS} kỹ năng.`);
    field.onChange([...skills, { name: trimmed, level }]);
    setName('');
    setError(null);
  };

  // Enter trong ô nhập thêm kỹ năng, không gửi cả form
  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleAdd();
    }
  };

  return (
    <div className={styles.editor}>
      <div className={styles.addRow}>
        <TextField
          label="Tên kỹ năng"
          placeholder="vd: React, Figma, PostgreSQL"
          value={name}
          onChange={(event) => {
            setName(event.target.value);
            setError(null);
          }}
          onKeyDown={handleKeyDown}
          error={error ?? undefined}
        />
        <SelectField
          label="Trình độ"
          options={LEVEL_OPTIONS}
          value={level}
          onChange={(event) => {
            const next = SKILL_LEVELS.find((item) => item === event.target.value);
            if (next) setLevel(next);
          }}
        />
        <Button variant="secondary" className={styles.addButton} onClick={handleAdd}>
          <IconPlus size={16} /> Thêm
        </Button>
      </div>

      {skills.length === 0 ? (
        <p className={styles.emptyText}>Chưa có kỹ năng nào. Kỹ năng giúp người khác tìm bạn khi lập nhóm.</p>
      ) : (
        <ul className={styles.chipList} aria-label="Kỹ năng đã thêm">
          {skills.map((skill) => (
            <li key={skill.name} className={styles.chip}>
              <span>{skill.name}</span>
              <Badge variant={LEVEL_BADGE[skill.level]}>{SKILL_LEVEL_LABELS[skill.level]}</Badge>
              <button
                type="button"
                className={styles.chipRemove}
                onClick={() => field.onChange(skills.filter((item) => item.name !== skill.name))}
                aria-label={`Xóa kỹ năng ${skill.name}`}
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

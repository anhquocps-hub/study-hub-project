import { Badge, Card, IconFolder } from '../../../shared/ui';
import type { Profile } from '../model/profile-schemas';
import styles from './ProfileView.module.css';
import { SectionEmpty } from './SectionEmpty';

export function ProfileProjects({ projects, isOwner }: { projects: Profile['projects']; isOwner: boolean }) {
  return (
    <Card title="Project đã tham gia" icon={<IconFolder />} aside={`${projects.length} project`}>
      {projects.length === 0 ? (
        <SectionEmpty>
          {isOwner
            ? 'Chưa có project nào. Project sẽ tự hiện ở đây khi bạn tham gia một nhóm trên Study Hub.'
            : 'Chưa tham gia project nào.'}
        </SectionEmpty>
      ) : (
        <ul className={styles.projectList}>
          {projects.map((project) => (
            <li key={project.id} className={styles.project}>
              <span className={styles.projectName}>{project.name}</span>
              <Badge variant="accent">Vai trò: {project.role}</Badge>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
}

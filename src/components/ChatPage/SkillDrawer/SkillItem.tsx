import React from 'react';
import type { SkillSummary } from '@/domains';
import styles from './style.module.less';

interface SkillItemProps {
  skill: SkillSummary;
  selected: boolean;
  onClick: (skill: SkillSummary) => void;
}

const SkillItem: React.FC<SkillItemProps> = ({ skill, selected, onClick }) => {
  return (
    <div
      className={`${styles.skillItem} ${selected ? styles.selected : ''}`}
      onClick={() => onClick(skill)}
    >
      <span className={styles.skillIcon}>{skill.icon ?? '🧩'}</span>
      <span className={styles.skillName}>{skill.displayName}</span>
      {skill.currentVersionId && (
        <span className={styles.skillVersion}>{skill.currentVersionId}</span>
      )}
    </div>
  );
};

export default SkillItem;

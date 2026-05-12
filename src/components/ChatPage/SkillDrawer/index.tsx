import React from 'react';
import { useRequest } from 'ahooks';
import SkillItem from './SkillItem';
import { useSkillService } from '@/domains';
import { useChatPageStore } from '@/store/zustand';
import type { SkillSummary } from '@/domains';
import styles from './style.module.less';

const SkillDrawer: React.FC = () => {
  const skillService = useSkillService();
  const skillDrawerOpen = useChatPageStore((s) => s.skillDrawerOpen);
  const activeSkill = useChatPageStore((s) => s.activeSkill);
  const setActiveSkill = useChatPageStore((s) => s.setActiveSkill);
  const setSkillDrawerOpen = useChatPageStore((s) => s.setSkillDrawerOpen);

  const { data: skillListData } = useRequest(() => skillService.listSkills());
  const skills = skillListData?.list ?? [];

  const handleSelectSkill = (skill: SkillSummary) => {
    if (activeSkill?.skillId === skill.skillId) {
      setActiveSkill(null);
    } else {
      setActiveSkill({
        skillId: skill.skillId,
        name: skill.displayName,
        version: skill.currentVersionId ?? 'latest',
      });
    }
  };

  return (
    <div className={styles.drawer}>
      <div className={styles.toggle} onClick={() => setSkillDrawerOpen(!skillDrawerOpen)}>
        <span className={styles.toggleIcon}>🧩</span>
        <span className={styles.toggleLabel}>Skill</span>
        <span className={styles.toggleCount}>{skills.length} 个可用</span>
        <span className={`${styles.toggleArrow} ${skillDrawerOpen ? styles.open : ''}`}>▼</span>
      </div>
      {skillDrawerOpen && (
        <div className={styles.body}>
          {skills.map((skill) => (
            <SkillItem
              key={skill.skillId}
              skill={skill}
              selected={activeSkill?.skillId === skill.skillId}
              onClick={handleSelectSkill}
            />
          ))}
          <span className={styles.manageLink}>管理 Skill →</span>
        </div>
      )}
    </div>
  );
};

export default SkillDrawer;

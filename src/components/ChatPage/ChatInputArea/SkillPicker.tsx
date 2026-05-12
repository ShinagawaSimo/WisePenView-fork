import React from 'react';
import { Modal, List } from 'antd';
import { useRequest } from 'ahooks';
import { useSkillService } from '@/domains';
import type { SkillSummary } from '@/domains';

interface SkillPickerProps {
  open: boolean;
  onClose: () => void;
  onSelect: (skill: SkillSummary) => void;
}

const SkillPicker: React.FC<SkillPickerProps> = ({ open, onClose, onSelect }) => {
  const skillService = useSkillService();
  const { data } = useRequest(() => skillService.listSkills(), { ready: open });

  return (
    <Modal title="选择 Skill" open={open} onCancel={onClose} footer={null} width={400}>
      <List
        dataSource={data?.list ?? []}
        renderItem={(skill) => (
          <List.Item
            onClick={() => {
              onSelect(skill);
              onClose();
            }}
            style={{ cursor: 'pointer' }}
          >
            <List.Item.Meta
              avatar={<span>{skill.icon ?? '🧩'}</span>}
              title={skill.displayName}
              description={skill.description}
            />
          </List.Item>
        )}
      />
    </Modal>
  );
};

export default SkillPicker;

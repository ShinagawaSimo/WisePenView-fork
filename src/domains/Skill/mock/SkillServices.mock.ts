import type { ISkillService, PageResult, SkillSummary, SkillDetail } from '../service/index.type';

const MOCK_SKILLS: SkillSummary[] = [
  {
    skillId: 'skill-001',
    displayName: '论文润色',
    description: '优化论文学术表达与格式',
    icon: '📝',
    status: 'ACTIVE',
    currentVersionId: 'ver-001',
  },
  {
    skillId: 'skill-002',
    displayName: '代码审查',
    description: '检查代码质量与安全漏洞',
    icon: '🔍',
    status: 'ACTIVE',
    currentVersionId: 'ver-003',
  },
  {
    skillId: 'skill-003',
    displayName: '数据分析',
    description: '对上传数据执行统计分析',
    icon: '📊',
    status: 'ACTIVE',
    currentVersionId: 'ver-002',
  },
  {
    skillId: 'skill-004',
    displayName: '文献总结',
    description: '提取文献核心观点与方法',
    icon: '📖',
    status: 'ACTIVE',
    currentVersionId: 'ver-001',
  },
];

const listSkills: ISkillService['listSkills'] = async () => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        list: MOCK_SKILLS,
        total: MOCK_SKILLS.length,
        page: 1,
        size: 20,
        total_page: 1,
      });
    }, 150);
  });
};

const getSkillDetail: ISkillService['getSkillDetail'] = async (skillId: string) => {
  const skill = MOCK_SKILLS.find((s) => s.skillId === skillId);
  if (!skill) throw new Error('Skill not found');
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve({
        ...skill,
        versions: [
          {
            versionId: 'ver-001',
            versionNumber: 1,
            versionKind: 'RELEASE',
            publishStatus: 'PUBLISHED',
          },
          {
            versionId: 'ver-002',
            versionNumber: 2,
            versionKind: 'RELEASE',
            publishStatus: 'PUBLISHED',
          },
        ],
      });
    }, 100);
  });
};

export const SkillServicesMock: ISkillService = {
  listSkills,
  getSkillDetail,
};

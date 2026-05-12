import React from 'react';
import styles from './style.module.less';

interface WelcomeCardsProps {
  onSearchDocs: () => void;
  onUseSkill: () => void;
  onUploadFile: () => void;
}

const WelcomeCards: React.FC<WelcomeCardsProps> = ({ onSearchDocs, onUseSkill, onUploadFile }) => {
  return (
    <div className={styles.welcome}>
      <div className={styles.welcomeTitle}>WisePen Chat</div>
      <p className={styles.welcomeSubtitle}>AI 助手已就绪，有什么可以帮助你的？</p>
      <div className={styles.cards}>
        <div className={styles.card} onClick={onSearchDocs}>
          <div className={styles.cardIcon}>🔍</div>
          <div className={styles.cardTitle}>搜索文档</div>
          <div className={styles.cardDesc}>检索个人文档库中与问题相关的内容</div>
        </div>
        <div className={styles.card} onClick={onUseSkill}>
          <div className={styles.cardIcon}>🧩</div>
          <div className={styles.cardTitle}>使用 Skill</div>
          <div className={styles.cardDesc}>选择或输入 @skill:xxx 调用能力</div>
        </div>
        <div className={styles.card} onClick={onUploadFile}>
          <div className={styles.cardIcon}>📎</div>
          <div className={styles.cardTitle}>上传文件</div>
          <div className={styles.cardDesc}>上传 PDF/Doc/图片让 AI 分析</div>
        </div>
      </div>
    </div>
  );
};

export default WelcomeCards;

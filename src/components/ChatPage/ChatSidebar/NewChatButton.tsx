import React from 'react';
import { Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import styles from './style.module.less';

interface NewChatButtonProps {
  onClick: () => void;
}

const NewChatButton: React.FC<NewChatButtonProps> = ({ onClick }) => {
  return (
    <div className={styles.newChatWrap}>
      <Button
        type="primary"
        icon={<PlusOutlined />}
        block
        className={styles.newChatBtn}
        onClick={onClick}
      >
        新对话
      </Button>
    </div>
  );
};

export default NewChatButton;

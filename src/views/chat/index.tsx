import React, { useCallback } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMount, useRequest } from 'ahooks';
import ChatPanel from '@/components/ChatPanel';
import { useChatService } from '@/domains';
import { useAppMessage } from '@/hooks/useAppMessage';
import { useCurrentChatSessionStore, useNewChatSessionStore } from '@/store';
import { parseErrorMessage } from '@/utils/parseErrorMessage';
import styles from './style.module.less';

const BASE = '/app/chat';

const ChatPage: React.FC = () => {
  const { sessionId: routeSessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const chatService = useChatService();
  const messageApi = useAppMessage();
  const currentSessionId = useCurrentChatSessionStore((s) => s.currentSessionId);
  const setCurrentSession = useCurrentChatSessionStore((s) => s.setCurrentSession);

  useMount(() => {
    if (routeSessionId && routeSessionId !== currentSessionId) {
      setCurrentSession({ id: routeSessionId, title: '' });
    }
  });

  const { runAsync: runCreateSession } = useRequest(() => chatService.createSession(), {
    manual: true,
  });

  const handleNewChat = useCallback(async () => {
    try {
      const created = await runCreateSession();
      setCurrentSession({ id: created.id, title: created.title });
      navigate(`${BASE}/${created.id}`, { replace: true });
      useNewChatSessionStore.getState().setNewChatSession({ id: created.id, title: created.title });
    } catch (error) {
      messageApi.error(parseErrorMessage(error, '新建聊天失败'));
    }
  }, [runCreateSession, setCurrentSession, navigate, messageApi]);

  return (
    <div className={styles.root}>
      <ChatPanel collapsed={false} fullWidth onNewChat={handleNewChat} />
    </div>
  );
};

export default ChatPage;

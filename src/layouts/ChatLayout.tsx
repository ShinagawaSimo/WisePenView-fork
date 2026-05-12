import React, { useCallback, useState } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { useMount, useRequest } from 'ahooks';
import { RiSidebarFoldLine, RiSidebarUnfoldLine } from 'react-icons/ri';
import { useChatService } from '@/domains';
import { useAppMessage } from '@/hooks/useAppMessage';
import { useCurrentChatSessionStore, useNewChatSessionStore } from '@/store/zustand';
import { parseErrorMessage } from '@/utils/parseErrorMessage';
import ChatSidebar from '@/components/ChatPage/ChatSidebar';
import SkillDrawer from '@/components/ChatPage/SkillDrawer';
import type { SessionItemData } from '@/components/ChatPage/ChatSidebar';
import styles from './ChatLayout.module.less';

const BASE = '/app/chat';

const ChatLayout: React.FC = () => {
  const navigate = useNavigate();
  const chatService = useChatService();
  const messageApi = useAppMessage();

  const currentSessionId = useCurrentChatSessionStore((s) => s.currentSessionId);
  const setCurrentSession = useCurrentChatSessionStore((s) => s.setCurrentSession);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sessions, setSessions] = useState<SessionItemData[]>([]);

  const { runAsync: runCreateSession } = useRequest(() => chatService.createSession(), {
    manual: true,
  });

  const { runAsync: runListSessions } = useRequest(
    () => chatService.listSessions({ page: 1, size: 50 }),
    { manual: true }
  );

  const { runAsync: runDeleteSession } = useRequest(
    (params: { sessionId: string }) => chatService.deleteSession(params),
    { manual: true }
  );

  const { runAsync: runRenameSession } = useRequest(
    (params: { sessionId: string; newTitle: string }) =>
      chatService.renameSession({ sessionId: params.sessionId, newTitle: params.newTitle }),
    { manual: true }
  );

  const refreshSessions = useCallback(async () => {
    try {
      const result = await runListSessions();
      setSessions(result.list.map((s) => ({ id: s.id, title: s.title })));
    } catch {
      // silent on refresh failure
    }
  }, [runListSessions]);

  useMount(() => {
    refreshSessions();
  });

  const handleNewChat = useCallback(async () => {
    try {
      const created = await runCreateSession();
      setCurrentSession({ id: created.id, title: created.title });
      navigate(`${BASE}/${created.id}`, { replace: true });
      useNewChatSessionStore.getState().setNewChatSession({ id: created.id, title: created.title });
      refreshSessions();
    } catch (error) {
      messageApi.error(parseErrorMessage(error, '新建聊天失败'));
    }
  }, [runCreateSession, setCurrentSession, navigate, messageApi, refreshSessions]);

  const handleSelectSession = useCallback(
    (id: string) => {
      setCurrentSession({ id, title: '' });
      navigate(`${BASE}/${id}`, { replace: true });
    },
    [setCurrentSession, navigate]
  );

  const handleDeleteSession = useCallback(
    async (id: string) => {
      try {
        await runDeleteSession({ sessionId: id });
        setSessions((prev) => prev.filter((s) => s.id !== id));
        if (id === currentSessionId) {
          setCurrentSession({ id: '', title: '' });
          navigate(BASE, { replace: true });
        }
      } catch (error) {
        messageApi.error(parseErrorMessage(error, '删除失败'));
      }
    },
    [runDeleteSession, currentSessionId, setCurrentSession, navigate, messageApi]
  );

  const handleRenameSession = useCallback(
    async (id: string) => {
      // eslint-disable-next-line no-alert
      const newTitle = window.prompt('新名称');
      if (!newTitle?.trim()) return;
      try {
        await runRenameSession({ sessionId: id, newTitle: newTitle.trim() });
        setSessions((prev) =>
          prev.map((s) => (s.id === id ? { ...s, title: newTitle.trim() } : s))
        );
      } catch (error) {
        messageApi.error(parseErrorMessage(error, '重命名失败'));
      }
    },
    [runRenameSession, messageApi]
  );

  return (
    <div className={styles.root}>
      <aside className={`${styles.sidebar} ${sidebarCollapsed ? styles.sidebarCollapsed : ''}`}>
        {!sidebarCollapsed && (
          <>
            <ChatSidebar
              sessions={sessions}
              activeSessionId={currentSessionId ?? null}
              onNewChat={handleNewChat}
              onSelectSession={handleSelectSession}
              onRenameSession={handleRenameSession}
              onDeleteSession={handleDeleteSession}
            />
            <SkillDrawer />
          </>
        )}
      </aside>

      <div className={styles.collapseZone}>
        <button
          type="button"
          className={styles.collapseBtn}
          onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
          aria-label={sidebarCollapsed ? '展开侧边栏' : '收起侧边栏'}
        >
          {sidebarCollapsed ? <RiSidebarUnfoldLine size={18} /> : <RiSidebarFoldLine size={18} />}
        </button>
      </div>

      <main className={styles.main}>
        <Outlet />
      </main>
    </div>
  );
};

export default ChatLayout;

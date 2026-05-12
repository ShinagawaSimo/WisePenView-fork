import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { useMount, useRequest, useUpdateEffect } from 'ahooks';
import { RiSidebarFoldLine, RiSidebarUnfoldLine } from 'react-icons/ri';
import { useChatService } from '@/domains';
import { useAppMessage } from '@/hooks/useAppMessage';
import { useCurrentChatSessionStore, useNewChatSessionStore } from '@/store/zustand';
import { useChatSession } from '@/session/chat/useChatSession';
import { mapApiModelsToFlatModels } from '@/domains/Chat';
import { parseErrorMessage } from '@/utils/parseErrorMessage';
import ChatSidebar from '@/components/ChatPage/ChatSidebar';
import SkillDrawer from '@/components/ChatPage/SkillDrawer';
import ChatMain from '@/components/ChatPage/ChatMain';
import ChatPageMessageList from '@/components/ChatPage/MessageList';
import ChatInputArea from '@/components/ChatPage/ChatInputArea';
import type { SessionItemData } from '@/components/ChatPage/ChatSidebar';
import {
  HISTORY_PAGE_SIZE,
  buildPanelMessages,
  collectMessagesPlainText,
  isSessionInvalidMessage,
  mapHistoryMessage,
  type ModelMeta,
} from '@/components/ChatPanel/ChatPanel';
import type { Message, Model } from '@/components/ChatPanel/index.type';
import styles from './style.module.less';

const BASE = '/app/chat';

const ChatPage: React.FC = () => {
  const { sessionId: routeSessionId } = useParams<{ sessionId: string }>();
  const navigate = useNavigate();
  const chatService = useChatService();
  const messageApi = useAppMessage();

  const currentSessionId = useCurrentChatSessionStore((s) => s.currentSessionId);
  const setCurrentSession = useCurrentChatSessionStore((s) => s.setCurrentSession);
  const clearCurrentSession = useCurrentChatSessionStore((s) => s.clearCurrentSession);

  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [sessions, setSessions] = useState<SessionItemData[]>([]);
  const [currentModel, setCurrentModel] = useState<Model | null>(null);
  const [historyMessages, setHistoryMessages] = useState<Message[]>([]);
  const [historyPage, setHistoryPage] = useState(1);
  const [historyTotalPage, setHistoryTotalPage] = useState(1);
  const [loadingMoreHistory, setLoadingMoreHistory] = useState(false);

  const {
    messages: liveMessages,
    status,
    setMessages: setLiveMessages,
    sendSessionMessage,
  } = useChatSession({
    sessionId: currentSessionId ?? '',
    model: currentModel?.id,
  });

  // --- model list ---
  const { data: modelListData } = useRequest(() => chatService.getModels());
  const modelMetaMap = useMemo<Record<string, ModelMeta>>(() => {
    const models = mapApiModelsToFlatModels(modelListData);
    return models.reduce<Record<string, ModelMeta>>((acc, model) => {
      acc[model.id] = { provider: model.provider, name: model.name };
      return acc;
    }, {});
  }, [modelListData]);

  // --- session CRUD ---
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
      // silent
    }
  }, [runListSessions]);

  useMount(() => {
    refreshSessions();
  });

  // sync route param → store
  useMount(() => {
    if (routeSessionId && routeSessionId !== currentSessionId) {
      setCurrentSession({ id: routeSessionId, title: '' });
    }
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

  // --- history ---
  const { runAsync: runLoadSessionHistory } = useRequest(
    async (sessionId: string, page = 1) =>
      chatService.listHistoryMessages({ sessionId, page, size: HISTORY_PAGE_SIZE }),
    { manual: true }
  );

  const messages = buildPanelMessages(historyMessages, liveMessages, currentModel, status);
  const hasMessages = collectMessagesPlainText(messages).trim().length > 0;
  const sending = status === 'submitted' || status === 'streaming';

  const loadHistory = useCallback(
    async (sessionId: string) => {
      try {
        const payload = await runLoadSessionHistory(sessionId, 1);
        setHistoryMessages(
          payload.list.map((m) => mapHistoryMessage(m, { modelMetaMap, currentModel }))
        );
        setHistoryPage(payload.page ?? 1);
        setHistoryTotalPage(payload.total_page ?? 1);
      } catch (error) {
        const msg = parseErrorMessage(error, '拉取历史消息失败');
        if (isSessionInvalidMessage(msg)) {
          clearCurrentSession();
          setHistoryMessages([]);
          setHistoryPage(1);
          setHistoryTotalPage(1);
          setLiveMessages([]);
          return;
        }
        messageApi.error(msg);
      }
    },
    [
      clearCurrentSession,
      currentModel,
      messageApi,
      modelMetaMap,
      runLoadSessionHistory,
      setLiveMessages,
    ]
  );

  useUpdateEffect(() => {
    if (!currentSessionId) {
      setHistoryMessages([]);
      setHistoryPage(1);
      setHistoryTotalPage(1);
      setLiveMessages([]);
      return;
    }
    setHistoryMessages([]);
    setHistoryPage(1);
    setHistoryTotalPage(1);
    setLiveMessages([]);
    void loadHistory(currentSessionId);
  }, [currentSessionId]);

  const handleSend = useCallback(
    async (text: string) => {
      if (!currentModel) return;
      let targetId = currentSessionId;

      if (!targetId) {
        try {
          const created = await runCreateSession();
          targetId = created.id;
          setCurrentSession({ id: created.id, title: created.title });
          navigate(`${BASE}/${created.id}`, { replace: true });
        } catch (error) {
          messageApi.error(parseErrorMessage(error, '新建聊天失败'));
          return;
        }
      }

      await sendSessionMessage(text, { model: currentModel.id, sessionId: targetId });
    },
    [
      currentModel,
      currentSessionId,
      messageApi,
      runCreateSession,
      sendSessionMessage,
      setCurrentSession,
      navigate,
    ]
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

      <div className={styles.main}>
        <ChatMain
          currentModel={currentModel}
          onModelChange={setCurrentModel}
          sending={sending}
          hasMessages={hasMessages}
        >
          {hasMessages && (
            <ChatPageMessageList
              messages={messages}
              canLoadMoreHistory={Boolean(currentSessionId) && historyPage < historyTotalPage}
              loadingMoreHistory={loadingMoreHistory}
              onLoadMoreHistory={async () => {}}
            />
          )}
        </ChatMain>
        <ChatInputArea onSend={handleSend} sending={sending} />
      </div>
    </div>
  );
};

export default ChatPage;

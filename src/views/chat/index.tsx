import React, { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useRequest, useUpdateEffect } from 'ahooks';
import { useChatService } from '@/domains';
import { useAppMessage } from '@/hooks/useAppMessage';
import { useCurrentChatSessionStore, useNewChatSessionStore } from '@/store/zustand';
import { useChatSession } from '@/session/chat/useChatSession';
import { mapApiModelsToFlatModels } from '@/domains/Chat';
import { parseErrorMessage } from '@/utils/parseErrorMessage';
import ChatMain from '@/components/ChatPage/ChatMain';
import ChatPageMessageList from '@/components/ChatPage/MessageList';
import ChatInputArea from '@/components/ChatPage/ChatInputArea';
import {
  HISTORY_PAGE_SIZE,
  buildPanelMessages,
  collectMessagesPlainText,
  isSessionInvalidMessage,
  mapHistoryMessage,
  type ModelMeta,
} from '@/components/ChatPanel/ChatPanel';
import type { Message, Model } from '@/components/ChatPanel/index.type';

const ChatPage: React.FC = () => {
  const navigate = useNavigate();
  const chatService = useChatService();
  const messageApi = useAppMessage();

  const currentSessionId = useCurrentChatSessionStore((s) => s.currentSessionId);
  const setCurrentSession = useCurrentChatSessionStore((s) => s.setCurrentSession);
  const clearCurrentSession = useCurrentChatSessionStore((s) => s.clearCurrentSession);

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

  const { runAsync: runLoadSessionHistory } = useRequest(
    async (sessionId: string, page = 1) =>
      chatService.listHistoryMessages({ sessionId, page, size: HISTORY_PAGE_SIZE }),
    { manual: true }
  );

  const { runAsync: runCreateSession } = useRequest(() => chatService.createSession(), {
    manual: true,
  });

  const { data: modelListData } = useRequest(() => chatService.getModels());

  const modelMetaMap = useMemo<Record<string, ModelMeta>>(() => {
    const models = mapApiModelsToFlatModels(modelListData);
    return models.reduce<Record<string, ModelMeta>>((acc, model) => {
      acc[model.id] = { provider: model.provider, name: model.name };
      return acc;
    }, {});
  }, [modelListData]);

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
          navigate(`/chat/${created.id}`, { replace: true });
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
    <>
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
    </>
  );
};

export default ChatPage;

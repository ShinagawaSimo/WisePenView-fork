interface ChatState {
  key: string;
  value: string;
  disabled?: boolean;
}

interface ChatAttachmentRef {
  attachment_id: string;
  enabled: boolean;
  context_mode?: string;
}

interface ChatResourceRef {
  resource_id: string;
  enabled: boolean;
  context_mode?: string;
}

interface ChatRequestBody {
  session_id: string;
  query: string;
  model?: string;
  states?: ChatState[];
  attachment_refs?: ChatAttachmentRef[];
  resource_refs?: ChatResourceRef[];
}

interface UseChatSessionOptions {
  sessionId: string;
  model?: string;
  enableSelected?: boolean;
}

export type {
  ChatState,
  ChatAttachmentRef,
  ChatResourceRef,
  ChatRequestBody,
  UseChatSessionOptions,
};

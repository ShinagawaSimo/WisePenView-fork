export interface ModelTag {
  text: string;
  type: string;
}

export interface Model {
  id: string;
  name: string;
  vendor: string;
  provider: string; // 'openai' | 'anthropic' | ...
  ratio: number;
  supportThinking: boolean;
  tags: ModelTag[];
  multiplier: string | null;
  isDefault: boolean;
  vision: boolean;
  usageRank: number;
  category: 'reasoning' | 'chat' | 'coding' | 'all-round';
}

export interface ChatAttachmentMeta {
  name: string;
  size: number;
  extension: string;
  objectKey?: string;
}

export type MessageRole = 'user' | 'ai' | 'system';

export interface Message {
  id: string;
  role: MessageRole;
  content: string; // 正文内容

  reasoningContent?: string;
  toolContent?: string;

  createAt: number;
  loading?: boolean;
  error?: boolean;

  /** 本轮发送时携带的附件元信息，用于在消息历史中展示 */
  attachmentMetas?: ChatAttachmentMeta[];

  meta?: {
    provider?: string;
    modelId?: string;
    modelName?: string;
    usage?: {
      promptTokens?: number;
      completionTokens?: number;
      totalTime?: number;
    };
  };
}

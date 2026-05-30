import { apiGet, apiPost } from '@/apis/request';
import type {
  CreateSessionApiRequest,
  CreateSessionApiResponse,
  DeleteSessionApiRequest,
  DeleteSessionApiResponse,
  ListHistoryMessagesApiRequest,
  ListHistoryMessagesApiResponse,
  ListModelsApiResponse,
  ListSessionsApiRequest,
  ListSessionsApiResponse,
  RenameSessionApiRequest,
  RenameSessionApiResponse,
  UploadAttachmentResult,
} from './ChatApi.type';

/** Chat API: /chat/* */

function listModels(): Promise<ListModelsApiResponse> {
  return apiGet('/chat/model/listModels');
}

export const ChatApi = {
  listModels,
};

/** Chat Session API: /chat/session/* */

function createSession(req: CreateSessionApiRequest): Promise<CreateSessionApiResponse> {
  return apiPost('/chat/session/createSession', req);
}

function renameSession(req: RenameSessionApiRequest): Promise<RenameSessionApiResponse> {
  return apiPost(
    '/chat/session/renameSession',
    { new_title: req.newTitle },
    { params: { session_id: req.sessionId } }
  );
}

function deleteSession(req: DeleteSessionApiRequest): Promise<DeleteSessionApiResponse> {
  return apiPost('/chat/session/deleteSession', undefined, {
    params: { session_id: req.sessionId },
  });
}

function listSessions(req: ListSessionsApiRequest): Promise<ListSessionsApiResponse> {
  return apiGet('/chat/session/listSessions', { params: req });
}

function listHistoryMessages(
  req: ListHistoryMessagesApiRequest
): Promise<ListHistoryMessagesApiResponse> {
  return apiGet('/chat/session/listHistoryMessages', {
    params: { session_id: req.sessionId, page: req.page, size: req.size },
  });
}

export const ChatSessionApi = {
  createSession,
  renameSession,
  deleteSession,
  listSessions,
  listHistoryMessages,
};

/** Chat Attachment API: /attachment/* */

function uploadAttachment(
  sessionId: string,
  file: File,
  enableLibrary = false
): Promise<UploadAttachmentResult> {
  return apiPost(
    '/attachment/upload',
    { session_id: sessionId, file, enable_library: String(enableLibrary) },
    {
      timeout: 120_000,
    }
  );
}

function deleteAttachment(sessionId: string, filename: string): Promise<void> {
  return apiPost('/attachment/delete', { session_id: sessionId, filename });
}

export const ChatAttachmentApi = {
  uploadAttachment,
  deleteAttachment,
};

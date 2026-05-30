import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface DocumentLibraryState {
  /** 是否开启自动保存到文档库 */
  enabled: boolean;
  /** 目标标签 ID（默认空，表示使用"聊天中的附件"） */
  targetTagId: string | null;
  /** "删除时不再提示" */
  skipDeleteConfirm: boolean;

  setEnabled: (v: boolean) => void;
  setTargetTagId: (id: string | null) => void;
  setSkipDeleteConfirm: (v: boolean) => void;
}

export const useDocumentLibraryStore = create<DocumentLibraryState>()(
  persist(
    (set) => ({
      enabled: false,
      targetTagId: null,
      skipDeleteConfirm: false,

      setEnabled: (enabled: boolean) => set({ enabled }),
      setTargetTagId: (targetTagId: string | null) => set({ targetTagId }),
      setSkipDeleteConfirm: (skipDeleteConfirm: boolean) => set({ skipDeleteConfirm }),
    }),
    { name: 'document-library-preferences' }
  )
);

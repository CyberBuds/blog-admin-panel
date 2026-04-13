"use client";

import { Modal } from "./Modal";

export interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Confirm",
  cancelText = "Cancel",
  isLoading = false,
}: ConfirmDialogProps) {
  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={title}
      description={description}
      className="max-w-md p-6"
    >
      <div className="flex w-full justify-end space-x-2 pt-4">
        <button
          onClick={onClose}
          disabled={isLoading}
          className="inline-flex h-9 items-center justify-center rounded-md border border-border bg-transparent px-4 py-2 text-sm font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
        >
          {cancelText}
        </button>
        <button
          onClick={onConfirm}
          disabled={isLoading}
          className="inline-flex h-9 items-center justify-center rounded-md bg-red-500 text-white px-4 py-2 text-sm font-medium hover:bg-red-600 transition-colors disabled:opacity-70"
        >
          {isLoading ? "Loading..." : confirmText}
        </button>
      </div>
    </Modal>
  );
}

const findBookDialog = (hash: string): HTMLDialogElement | null => {
  const id = decodeURIComponent(hash.slice(1));
  const element = id ? document.getElementById(id) : null;
  return element instanceof HTMLDialogElement ? element : null;
};

const syncDialogsWithHash = (dialogs: readonly HTMLDialogElement[]): void => {
  const target = findBookDialog(window.location.hash);
  dialogs.filter((dialog) => dialog.open && dialog !== target).forEach((dialog) => dialog.close());
  if (target && !target.open) target.showModal();
};

const removeHash = (options: { openedFromPage: boolean }): void => {
  if (!window.location.hash) return;
  if (options.openedFromPage) {
    history.back();
    return;
  }
  history.replaceState(null, '', window.location.pathname + window.location.search);
};

const closeOnBackdropClick = (dialog: HTMLDialogElement) => (event: MouseEvent): void => {
  if (event.target === dialog) dialog.close();
};

export const initializeBookDialogs = (): void => {
  const dialogs = [...document.querySelectorAll<HTMLDialogElement>('dialog.book-dialog')];
  let openedFromPage = false;

  dialogs.forEach((dialog) => {
    dialog.addEventListener('close', () => removeHash({ openedFromPage }));
    dialog.addEventListener('click', closeOnBackdropClick(dialog));
  });

  window.addEventListener('hashchange', () => {
    openedFromPage = true;
    syncDialogsWithHash(dialogs);
  });

  syncDialogsWithHash(dialogs);
};

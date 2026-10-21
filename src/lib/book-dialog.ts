const findBookDialog = (hash: string): HTMLDialogElement | null => {
  const id = decodeURIComponent(hash.slice(1));
  const element = id ? document.getElementById(id) : null;
  return element instanceof HTMLDialogElement ? element : null;
};

const openDialogFromHash = (): void => {
  const dialog = findBookDialog(window.location.hash);
  if (dialog && !dialog.open) dialog.showModal();
};

const clearHash = (): void => {
  history.replaceState(null, '', window.location.pathname + window.location.search);
};

const closeOnBackdropClick = (dialog: HTMLDialogElement) => (event: MouseEvent): void => {
  if (event.target === dialog) dialog.close();
};

export const initializeBookDialogs = (): void => {
  document.querySelectorAll<HTMLDialogElement>('dialog.book-dialog').forEach((dialog) => {
    dialog.addEventListener('close', clearHash);
    dialog.addEventListener('click', closeOnBackdropClick(dialog));
  });
  window.addEventListener('hashchange', openDialogFromHash);
  openDialogFromHash();
};

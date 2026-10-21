const DEFAULT_PER_PAGE = 6;

const readPerPage = (element: HTMLElement | null): number => {
  const perPage = Number(element?.dataset.perPage);
  return Number.isInteger(perPage) && perPage > 0 ? perPage : DEFAULT_PER_PAGE;
};

export function initializePagination(): void {
  const items = document.querySelectorAll<HTMLElement>('.paginated-item');
  const perPage = readPerPage(document.querySelector<HTMLElement>('[data-pagination]'));
  const totalPages = Math.max(1, Math.ceil(items.length / perPage));

  const prevButton = document.querySelector<HTMLButtonElement>('#prev-btn');
  const nextButton = document.querySelector<HTMLButtonElement>('#next-btn');
  const currentPageLabel = document.getElementById('current-page');

  let currentPage = 1;

  const showPage = (page: number): void => {
    currentPage = page;
    const startIndex = (page - 1) * perPage;
    items.forEach((item, index) => {
      item.classList.toggle('hidden', index < startIndex || index >= startIndex + perPage);
    });
    if (currentPageLabel) currentPageLabel.textContent = String(page);
    if (prevButton) prevButton.disabled = page === 1;
    if (nextButton) nextButton.disabled = page === totalPages;
  };

  const goToPage = (page: number): void => {
    showPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  prevButton?.addEventListener('click', () => goToPage(currentPage - 1));
  nextButton?.addEventListener('click', () => goToPage(currentPage + 1));

  showPage(1);
}

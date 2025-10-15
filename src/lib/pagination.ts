export function initializePagination(itemsPerPage: number = 6) {
  let currentPage = 1;
  const items = document.querySelectorAll<HTMLElement>('.paginated-item');
  const totalItems = items.length;
  const totalPages = Math.ceil(totalItems / itemsPerPage);

  const prevBtn = document.getElementById('prev-btn');
  const nextBtn = document.getElementById('next-btn');
  const currentPageSpan = document.getElementById('current-page');
  const totalPagesSpan = document.getElementById('total-pages');

  // Initialize
  if (totalPagesSpan) totalPagesSpan.textContent = totalPages.toString();

  function showPage(page: number) {
    currentPage = page;

    // Show/hide items based on current page
    items.forEach((item, index) => {
      const startIndex = (page - 1) * itemsPerPage;
      const endIndex = startIndex + itemsPerPage;

      if (index >= startIndex && index < endIndex) {
        item.classList.remove('hidden');
      } else {
        item.classList.add('hidden');
      }
    });

    // Update page info
    if (currentPageSpan) currentPageSpan.textContent = page.toString();

    // Update button states
    if (prevBtn) {
      const btn = prevBtn as HTMLButtonElement;
      btn.disabled = page === 1;
      if (page === 1) {
        btn.classList.add('cursor-not-allowed', 'pointer-events-none');
        btn.classList.remove('text-blue-600', 'hover:underline', 'hover:text-blue-800');
        btn.classList.add('text-gray-400');
      } else {
        btn.classList.remove('cursor-not-allowed', 'pointer-events-none', 'text-gray-400');
        btn.classList.add('text-blue-600', 'hover:underline', 'hover:text-blue-800');
      }
    }
    if (nextBtn) {
      const btn = nextBtn as HTMLButtonElement;
      btn.disabled = page === totalPages;
      if (page === totalPages) {
        btn.classList.add('cursor-not-allowed', 'pointer-events-none');
        btn.classList.remove('text-blue-600', 'hover:underline', 'hover:text-blue-800');
        btn.classList.add('text-gray-400');
      } else {
        btn.classList.remove('cursor-not-allowed', 'pointer-events-none', 'text-gray-400');
        btn.classList.add('text-blue-600', 'hover:underline', 'hover:text-blue-800');
      }
    }

    // Scroll to top
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  // Event listeners
  prevBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    if (currentPage > 1) showPage(currentPage - 1);
  });

  nextBtn?.addEventListener('click', (e) => {
    e.preventDefault();
    if (currentPage < totalPages) showPage(currentPage + 1);
  });

  // Show first page
  showPage(1);
}

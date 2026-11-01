const currentIndex = (track: HTMLElement): number =>
  Math.round(track.scrollLeft / track.clientWidth);

const markCurrentDot = (dots: readonly HTMLButtonElement[], index: number): void => {
  dots.forEach((dot, dotIndex) => dot.setAttribute('aria-current', String(dotIndex === index)));
};

const scrollToPhoto = (track: HTMLElement, index: number): void => {
  track.scrollTo({ left: index * track.clientWidth, behavior: 'smooth' });
};

type GalleryControls = {
  dots: readonly HTMLButtonElement[];
  previous: HTMLButtonElement | null;
  next: HTMLButtonElement | null;
};

const syncControls = (controls: GalleryControls, index: number): void => {
  const { dots, previous, next } = controls;
  markCurrentDot(dots, index);
  if (previous) previous.hidden = index === 0;
  if (next) next.hidden = index === dots.length - 1;
};

const initializeGallery = (gallery: HTMLElement): void => {
  const track = gallery.querySelector<HTMLElement>('[data-swipe-track]');
  if (!track) return;

  const controls: GalleryControls = {
    dots: [...gallery.querySelectorAll<HTMLButtonElement>('[data-swipe-dot]')],
    previous: gallery.querySelector<HTMLButtonElement>('[data-swipe-prev]'),
    next: gallery.querySelector<HTMLButtonElement>('[data-swipe-next]'),
  };

  track.addEventListener('scroll', () => syncControls(controls, currentIndex(track)), { passive: true });
  controls.dots.forEach((dot, index) => dot.addEventListener('click', () => scrollToPhoto(track, index)));
  controls.previous?.addEventListener('click', () => scrollToPhoto(track, currentIndex(track) - 1));
  controls.next?.addEventListener('click', () => scrollToPhoto(track, currentIndex(track) + 1));
};

export const initializeSwipePhotos = (): void => {
  document.querySelectorAll<HTMLElement>('[data-swipe-photos]').forEach(initializeGallery);
};

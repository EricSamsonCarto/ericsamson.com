/**
 * ImageSlider - A TypeScript-based before/after image comparison slider
 * Supports mouse, touch, and keyboard interactions
 */

export class ImageSlider {
  private container: HTMLElement;
  private slider: HTMLElement;
  private beforeImage: HTMLElement;
  private sliderButton: HTMLElement;
  private isResizing: boolean = false;
  private currentPosition: number = 50; // Start at 50%

  constructor(containerId: string) {
    const container = document.getElementById(containerId);
    if (!container) {
      throw new Error(`Container with id "${containerId}" not found`);
    }

    this.container = container;

    // Get required elements
    const slider = container.querySelector('.image-slider-handle') as HTMLElement;
    const beforeImage = container.querySelector('.image-slider-before') as HTMLElement;
    const sliderButton = container.querySelector('.image-slider-button') as HTMLElement;

    if (!slider || !beforeImage || !sliderButton) {
      throw new Error('Required slider elements not found');
    }

    this.slider = slider;
    this.beforeImage = beforeImage;
    this.sliderButton = sliderButton;

    this.init();
  }

  private init(): void {
    // Set initial position
    this.updatePosition(this.currentPosition);

    // Mouse events
    this.slider.addEventListener('mousedown', this.startResize.bind(this));
    document.addEventListener('mousemove', this.resize.bind(this));
    document.addEventListener('mouseup', this.stopResize.bind(this));

    // Touch events for mobile
    this.slider.addEventListener('touchstart', this.startResize.bind(this), { passive: false });
    document.addEventListener('touchmove', this.resize.bind(this), { passive: false });
    document.addEventListener('touchend', this.stopResize.bind(this));

    // Keyboard navigation
    this.slider.setAttribute('tabindex', '0');
    this.slider.addEventListener('keydown', this.handleKeyboard.bind(this));

    // Handle window resize
    window.addEventListener('resize', () => {
      this.updatePosition(this.currentPosition);
    });
  }

  private startResize(e: MouseEvent | TouchEvent): void {
    e.preventDefault();
    this.isResizing = true;
    this.slider.classList.add('active');
  }

  private stopResize(): void {
    this.isResizing = false;
    this.slider.classList.remove('active');
  }

  private resize(e: MouseEvent | TouchEvent): void {
    if (!this.isResizing) return;

    const containerRect = this.container.getBoundingClientRect();
    let clientX: number;

    if (e instanceof MouseEvent) {
      clientX = e.clientX;
    } else {
      clientX = e.touches[0].clientX;
    }

    // Calculate position as percentage
    const position = ((clientX - containerRect.left) / containerRect.width) * 100;

    // Clamp between 0 and 100
    const clampedPosition = Math.max(0, Math.min(100, position));

    this.updatePosition(clampedPosition);
  }

  private handleKeyboard(e: KeyboardEvent): void {
    const step = 2; // Move 2% per key press

    switch (e.key) {
      case 'ArrowLeft':
        e.preventDefault();
        this.currentPosition = Math.max(0, this.currentPosition - step);
        this.updatePosition(this.currentPosition);
        break;
      case 'ArrowRight':
        e.preventDefault();
        this.currentPosition = Math.min(100, this.currentPosition + step);
        this.updatePosition(this.currentPosition);
        break;
    }
  }

  private updatePosition(position: number): void {
    this.currentPosition = position;

    // Update slider handle position
    this.slider.style.left = `${position}%`;

    // Update before image clip-path
    this.beforeImage.style.clipPath = `inset(0 ${100 - position}% 0 0)`;

    const roundedPosition = Math.round(position);
    this.slider.setAttribute('aria-valuenow', String(roundedPosition));
    this.slider.setAttribute('aria-valuetext', `${roundedPosition}% between before and after`);
  }
}

// Auto-initialize all sliders on the page
export function initializeSliders(): void {
  const sliders = document.querySelectorAll('[data-image-slider]');
  sliders.forEach((slider) => {
    const id = slider.getAttribute('id');
    if (!id) return;
    try {
      new ImageSlider(id);
    } catch (error) {
      console.error(`Failed to initialize slider ${id}:`, error);
    }
  });
}

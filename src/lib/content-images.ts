import type { ImageMetadata } from 'astro';

type ImageModule = { default: ImageMetadata };

const IMAGE_ROOT = '/src/assets/images/';

const imageModules = import.meta.glob<ImageModule>(
  '/src/assets/images/**/*.{jpg,jpeg,JPG,png,gif,webp}',
  { eager: true }
);

export const CONTENT_IMAGE_WIDTHS = [480, 720, 1080, 1440];
export const CONTENT_IMAGE_MAX_WIDTH = 1440;
export const CONTENT_IMAGE_SIZES = '(min-width: 768px) 672px, 100vw';

export const CARD_IMAGE_WIDTHS = [320, 640];
export const CARD_IMAGE_MAX_WIDTH = 640;
export const CARD_IMAGE_SIZES = '(min-width: 768px) 224px, 50vw';

export const BOOK_COVER_WIDTH = 280;
export const BOOK_COVER_HEIGHT = 420;

const ANIMATED_IMAGE_QUALITY = 50;

export const qualityFor = (image: ImageMetadata): number | undefined =>
  image.format === 'gif' ? ANIMATED_IMAGE_QUALITY : undefined;

export const resolveContentImage = (path: string): ImageMetadata => {
  const imageModule = imageModules[`${IMAGE_ROOT}${path}`];
  if (!imageModule) {
    throw new Error(`Image not found in src/assets/images: ${path}`);
  }
  return imageModule.default;
};

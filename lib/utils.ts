import { Document, PermissionInfo } from '../types';

export const isPermissionActive = (permission?: PermissionInfo) => {
  if (!permission) return false;
  if (!permission.active) return false;
  if (!permission.expiresAt) return true; // No expiration date means it's permanent
  return new Date(permission.expiresAt) > new Date();
};

export const slugify = (text: string) => {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .replace(/\s+/g, '-')     // Replace spaces with -
    .replace(/[^\w\-]+/g, '') // Remove all non-word chars
    .replace(/\-\-+/g, '-');  // Replace multiple - with single -
};

export const generateDocumentUrl = (doc: Document) => {
  const slug = slugify(doc.title);
  const cleanSerial = doc.serialNumber 
    ? doc.serialNumber.replace(/^SN:\s*/i, '').replace(/\s+/g, '-') 
    : '';
  const serial = cleanSerial ? `-${cleanSerial}` : '';
  return `/view/${slug}${serial}-${doc.id}`;
};

export const extractIdFromUrl = (slug: string) => {
  if (!slug) return '';
  const parts = slug.split('-');
  return parts[parts.length - 1];
};

export const compressImage = (base64Str: string, maxWidth = 400, maxHeight = 400, quality = 0.7): Promise<string> => {
  return new Promise((resolve) => {
    const img = new Image();
    img.src = base64Str;
    img.onload = () => {
      const canvas = document.createElement('canvas');
      let width = img.width;
      let height = img.height;

      if (width > height) {
        if (width > maxWidth) {
          height *= maxWidth / width;
          width = maxWidth;
        }
      } else {
        if (height > maxHeight) {
          width *= maxHeight / height;
          height = maxHeight;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      ctx?.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL('image/jpeg', quality));
    };
  });
};

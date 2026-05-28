import { request } from './httpService';
import type { AssetResource } from '../types';

export async function uploadAssets(files: File[]) {
  const formData = new FormData();

  files.forEach((file) => {
    formData.append('files', file);
  });

  return request<{ items: AssetResource[] }>('/api/assets/upload', {
    method: 'POST',
    data: formData,
  });
}

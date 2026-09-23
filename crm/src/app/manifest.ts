import type { MetadataRoute } from 'next'
import { BASE_PATH } from '@/lib/base-path'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'ImobEasy CRM',
    short_name: 'ImobEasy CRM',
    description: 'Pipeline, WhatsApp e funil de mensagens da Imob Easy.',
    start_url: `${BASE_PATH}/`,
    scope: `${BASE_PATH}/`,
    display: 'standalone',
    background_color: '#060606',
    theme_color: '#060606',
    orientation: 'portrait',
    icons: [
      { src: BASE_PATH + '/icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: BASE_PATH + '/icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: BASE_PATH + '/icons/icon-maskable-192.png', sizes: '192x192', type: 'image/png', purpose: 'maskable' },
      { src: BASE_PATH + '/icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  }
}

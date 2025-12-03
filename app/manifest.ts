import { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Fumari Restaurant Management',
    short_name: 'Fumari',
    description: 'Complete restaurant management system for large-scale operations',
    start_url: '/',
    display: 'standalone',
    background_color: '#212226',
    theme_color: '#9B4E3F',
    orientation: 'any',
    icons: [
      {
        src: '/fumari-logo.png',
        sizes: '192x192',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/fumari-logo.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
      {
        src: '/fumari-logo.svg',
        sizes: 'any',
        type: 'image/svg+xml',
        purpose: 'any',
      },
    ],
    categories: ['business', 'food', 'productivity'],
    shortcuts: [
      {
        name: 'Tables',
        short_name: 'Tables',
        description: 'View table management',
        url: '/dashboard/tables',
        icons: [{ src: '/fumari-logo.png', sizes: '192x192' }],
      },
      {
        name: 'Orders',
        short_name: 'Orders',
        description: 'View orders',
        url: '/dashboard/orders',
        icons: [{ src: '/fumari-logo.png', sizes: '192x192' }],
      },
      {
        name: 'Kiosk',
        short_name: 'Kiosk',
        description: 'Open kiosk mode',
        url: '/dashboard/kiosk',
        icons: [{ src: '/fumari-logo.png', sizes: '192x192' }],
      },
    ],
  };
}


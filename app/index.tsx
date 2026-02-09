import React from 'react';
import { LoadingSpinner } from '@/components/LoadingSpinner';

export default function IndexScreen() {
  console.log('[IndexScreen] Rendering LoadingSpinner via default route');
  return <LoadingSpinner />;
}
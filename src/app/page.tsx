'use client';

import React from 'react';
import AppLayout from '../components/AppLayout';
import CommandCenterContent from './components/CommandCenterContent';

export default function CommandCenterPage() {
  return (
    <AppLayout activeRoute="/">
      <CommandCenterContent />
    </AppLayout>
  );
}

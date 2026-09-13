import React from 'react';
import AppLayout from '../../components/AppLayout';
import IntelligenceHubContent from './components/IntelligenceHubContent';

export default function IntelligenceHubPage() {
  return (
    <AppLayout activeRoute="/intelligence-hub">
      <IntelligenceHubContent />
    </AppLayout>
  );
}

'use client';

import { Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import AnimatedAuth from '@/components/auth/AnimatedAuth';
import LoadingSpinner from '@/components/auth/LoadingSpinner';

function AuthContent() {
  const searchParams = useSearchParams();
  const mode = searchParams.get('mode') === 'register' ? 'register' : 'login';

  return <AnimatedAuth initialMode={mode} />;
}

export default function AuthPage() {
  return (
    <Suspense
      fallback={
        <div className="h-screen flex items-center justify-center bg-white dark:bg-slate-900">
          <LoadingSpinner />
        </div>
      }
    >
      <AuthContent />
    </Suspense>
  );
}

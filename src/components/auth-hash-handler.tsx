'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/utils/supabase/client';
import { Trophy } from 'lucide-react';

export function AuthHashHandler() {
  const router = useRouter();
  const [isRecovering, setIsRecovering] = useState(false);

  useEffect(() => {
    // Only intercept if there's an access_token in the URL hash
    if (typeof window !== 'undefined' && window.location.hash.includes('access_token=')) {
      setIsRecovering(true);
      const supabase = createClient();

      const {
        data: { subscription },
      } = supabase.auth.onAuthStateChange((event) => {
        if (event === 'PASSWORD_RECOVERY' || event === 'SIGNED_IN') {
          // Delay to ensure the cookie storage adapter has fully written the session
          setTimeout(() => {
            router.push('/admin/update-password');
          }, 1500);
        }
      });

      // Fallback in case the event was missed
      setTimeout(() => {
        if (window.location.hash.includes('access_token=')) {
          router.push('/admin/update-password');
        }
      }, 3000);

      return () => {
        subscription.unsubscribe();
      };
    }
  }, [router]);

  if (isRecovering) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 backdrop-blur-sm">
        <div className="flex flex-col items-center gap-4 animate-pulse">
          <Trophy className="size-12 text-primary" />
          <p className="text-xl font-bold">Verifying Secure Link...</p>
        </div>
      </div>
    );
  }

  return null;
}

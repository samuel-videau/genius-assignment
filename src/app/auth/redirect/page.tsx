'use client'

import React, { useEffect, useState } from 'react';
import { LIT_AUTH_REDIRECT_URL, LIT_NETWORK } from "@/globals";
import { useLit } from "@/lib/use-lit";
import { useSearchParams, useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { useAppDispatch } from '@/store/hooks';
import { setPkp, setSessionSigs } from '@/store/user-reducer';

export default function Redirect() {
  const { handleRedirect, fetchPkps, getSessionSigs, connect, mintPkp } = useLit();
  const searchParams = useSearchParams();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const dispatch = useAppDispatch();

  useEffect(() => {
    const init = async () => {
      try {
        setLoading(true);
        await connect();
        console.log(`Connected to ${LIT_NETWORK}`);
        
        const fullPath = LIT_AUTH_REDIRECT_URL + (searchParams.toString() ? `?${searchParams.toString()}` : '');
        console.log(fullPath);
        
        const auth = await handleRedirect(fullPath);
        console.log(auth);
        
        let pkps = await fetchPkps(auth);

        console.log(pkps);
        
        if (pkps.length === 0) {
          await mintPkp(auth);
          pkps = await fetchPkps(auth);
          console.log('Minted PKP');
          console.log(pkps);
        }
        
        dispatch(setPkp(pkps[0]));
        const session = await getSessionSigs(auth, pkps[0]);
        console.log(session);
        dispatch(setSessionSigs(session));
        
        // Redirect to dashboard
        router.push('/swap');
      } catch (err) {
        console.error("Initialization error:", err);
        setError("An error occurred during initialization. Please try again.");
      } finally {
        setLoading(false);
      }
    }

    init();
  }, []);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <Loader2 className="w-10 h-10 text-blue-500 animate-spin" />
        <p className="mt-4 text-lg text-gray-700">Initializing...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
        <div className="p-4 bg-red-100 text-red-700 rounded-md">
          <p>{error}</p>
        </div>
      </div>
    );
  }

  return null; // This will not be rendered as we're redirecting
}
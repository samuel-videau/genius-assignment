'use client';

import { LIT_NETWORK } from "@/globals";
import { useLit } from "@/lib/use-lit";
import { useEffect } from "react";

export default function Home() {
  const { connect, authWithGoogle } = useLit();

  useEffect(() => {
    const init = async() => {
      await authWithGoogle();
    }

    init();

  }, []);

  return (
    <main>
     
    </main>
  );
}

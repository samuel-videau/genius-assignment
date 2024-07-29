'use client'

import { LIT_AUTH_REDIRECT_URL, LIT_NETWORK } from "@/globals";
import { useLit } from "@/lib/use-lit";
import { useSearchParams } from "next/navigation";
import { useEffect } from "react";

export default function Redirect() {
  const { handleRedirect, fetchPkps, getSessionSigs, connect, mintPkp } = useLit();
  const searchParams = useSearchParams();

  useEffect(() => {
    const init = async () => {
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
      const session = await getSessionSigs(auth, pkps[0]);
      console.log(session)
    }

    init();
  }, []);

  return (
    <div>
      Test
    </div>
  );
}
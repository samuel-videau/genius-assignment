import { LIT_AUTH_REDIRECT_URL, LIT_NETWORK, LIT_RELAY_API_KEY, LIT_RPC, LIT_SESSION_TIME_M } from "@/globals";
import { createSiweMessageWithRecaps, generateAuthSig, LitAbility, LitAccessControlConditionResource, LitActionResource, LitPKPResource } from "@lit-protocol/auth-helpers";
import { isSignInRedirect, LitAuthClient } from "@lit-protocol/lit-auth-client";
import * as LitJsSdk from "@lit-protocol/lit-node-client";
import type { SessionSigsMap, LIT_NETWORKS_KEYS, AuthMethod, IRelayPKP } from '@lit-protocol/types';
import { ProviderType, AuthMethodScope } from '@lit-protocol/constants';

export const useLit = () => {

    const client = new LitJsSdk.LitNodeClient({
        litNetwork: LIT_NETWORK as LIT_NETWORKS_KEYS,
        debug: true,
        rpcUrl: LIT_RPC
    });

    const litAuthClient = new LitAuthClient({
      litRelayConfig: {
        relayApiKey: LIT_RELAY_API_KEY,
      },
      debug: true,
      rpcUrl: LIT_RPC,
      litNodeClient: client,
    });
    
    litAuthClient.initProvider(ProviderType.Google, {
      redirectUri: LIT_AUTH_REDIRECT_URL,
    });

    const provider = litAuthClient.getProvider(
      ProviderType.Google
    );


    const connect = async () => {
        await client.connect();
    };

    const disconnect = async () => {
        await client.disconnect();
    }

    const authWithGoogle = async () => {
      
      if (!provider) throw 'No provider';
      await (provider as any).signIn();
    }

    const getSessionSigs = async (authMethod: AuthMethod, pkp: IRelayPKP): Promise<SessionSigsMap> => {
      return await client.getPkpSessionSigs({
        pkpPublicKey: pkp.publicKey,
        authMethods: [authMethod],
        expiration: new Date(Date.now() + LIT_SESSION_TIME_M * 1000).toISOString(),
        resourceAbilityRequests: [
          {
            resource: new LitPKPResource('*'),
            ability: LitAbility.PKPSigning,
          },
          {
            resource: new LitActionResource('*'),
            ability: LitAbility.LitActionExecution,
          },
        ],
      });
    }

    const handleRedirect = async (redirectUri: string): Promise<AuthMethod> => {
      if (isSignInRedirect(redirectUri)) {
        if (!provider) throw 'No provider';
        
        return await provider.authenticate();
      } else {
        throw 'Invalid redirect URI';
      }
    }

    const mintPkp = async (authMethod: AuthMethod): Promise<void> => {
      if (!provider) throw 'No provider';

      const options = {
        permittedAuthMethodScopes: [[AuthMethodScope.SignAnything]],
      };
      // Mint PKP using the auth method
      await provider.mintPKPThroughRelayer(
          authMethod,
          options
      );
    }

    const fetchPkps = async (authMethod: AuthMethod): Promise<IRelayPKP[]> => {
      if (!provider) throw 'No provider';

      return await provider.fetchPKPsThroughRelayer(authMethod);
    }

    return {
        client,
        connect,
        disconnect,
        getSessionSigs,
        authWithGoogle,
        handleRedirect,
        mintPkp,
        fetchPkps,
    };
}
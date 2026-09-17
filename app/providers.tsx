'use client';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { WagmiProvider, createConfig, http } from 'wagmi';
import { base } from 'wagmi/chains';
import { injected } from 'wagmi/connectors';
import { useState } from 'react';
const config = createConfig({ chains: [base], connectors: [injected()], transports: { [base.id]: http('https://mainnet.base.org') } });
export function Providers({ children }: { children: React.ReactNode }) { const [client] = useState(() => new QueryClient()); return <WagmiProvider config={config}><QueryClientProvider client={client}>{children}</QueryClientProvider></WagmiProvider>; }

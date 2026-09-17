'use client';

import { useEffect, useState } from 'react';
import { useAccount, usePublicClient, useSendTransaction, useReadContract, useWriteContract } from 'wagmi';
import { formatUnits, parseUnits } from 'viem';
import { BASE_USDC, erc20Abi, explorer } from '../lib/constants';

const tokenReadAbi = [
  { type: 'function', name: 'balanceOf', stateMutability: 'view', inputs: [{ name: 'account', type: 'address' }], outputs: [{ type: 'uint256' }] },
  { type: 'function', name: 'decimals', stateMutability: 'view', inputs: [], outputs: [{ type: 'uint8' }] },
] as const;

export function InvestPanel({ token, symbol, thesisId }: { token: `0x${string}`; symbol: string; thesisId?: string }) {
  const { address, chainId } = useAccount();
  const publicClient = usePublicClient();
  const { writeContractAsync } = useWriteContract();
  const { sendTransactionAsync } = useSendTransaction();
  const [amount, setAmount] = useState('25');
  const [status, setStatus] = useState('');
  const [hash, setHash] = useState('');
  const [quote, setQuote] = useState<any>(null);
  const [busy, setBusy] = useState(false);

  const usdcBalance = useReadContract({ address: BASE_USDC, abi: tokenReadAbi, functionName: 'balanceOf', args: address ? [address] : undefined, query: { enabled: !!address } });
  const tokenBalance = useReadContract({ address: token, abi: tokenReadAbi, functionName: 'balanceOf', args: address ? [address] : undefined, query: { enabled: !!address } });
  const tokenDecimals = useReadContract({ address: token, abi: tokenReadAbi, functionName: 'decimals' });

  const fetchQuote = async () => {
    if (!address) throw new Error('Connect your Base wallet first.');
    const rawAmount = parseUnits(amount || '0', 6);
    if (rawAmount <= 0n) throw new Error('Enter an amount greater than zero.');
    const response = await fetch(`/api/quote?sellToken=${BASE_USDC}&buyToken=${token}&sellAmount=${rawAmount}&taker=${address}`, { cache: 'no-store' });
    const data = await response.json();
    if (!response.ok || data.error) throw new Error(data.error || 'Quote request failed.');
    if (data.liquidityAvailable === false) throw new Error('0x reports no executable liquidity for this route.');
    return data;
  };

  const persist = async (txHash: string, executionStatus: 'submitted' | 'confirmed' | 'reverted', sellAmountBaseUnits: string) => {
    try {
      await fetch('/api/executions', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ wallet: address, thesisId, assetSymbol: symbol, sellToken: BASE_USDC, buyToken: token, sellAmountBaseUnits, txHash, status: executionStatus }) });
    } catch { /* persistence is optional until DATABASE_URL is supplied */ }
  };

  const invest = async () => {
    if (!address) { setStatus('Connect your Base wallet first.'); return; }
    if (chainId !== 8453) { setStatus('Switch your wallet to Base mainnet.'); return; }
    if (!publicClient) { setStatus('Base client is not ready.'); return; }
    setBusy(true); setHash(''); setQuote(null);
    try {
      const rawAmount = parseUnits(amount || '0', 6);
      if (usdcBalance.data !== undefined && rawAmount > usdcBalance.data) throw new Error(`Insufficient USDC. Wallet balance: $${formatUnits(usdcBalance.data, 6)}.`);
      setStatus('Getting a firm executable quote…');
      let q = await fetchQuote();
      setQuote(q);

      const allowance = q.issues?.allowance;
      if (allowance?.spender && BigInt(allowance.amount || rawAmount) > BigInt(allowance.actual || '0')) {
        setStatus('Approve the exact quoted USDC amount in your wallet…');
        const approvalHash = await writeContractAsync({ address: BASE_USDC, abi: erc20Abi, functionName: 'approve', args: [allowance.spender as `0x${string}`, BigInt(allowance.amount)] });
        setStatus('Approval submitted. Waiting for confirmation…');
        await publicClient.waitForTransactionReceipt({ hash: approvalHash });
        setStatus('Approval confirmed. Refreshing the firm quote…');
        q = await fetchQuote();
        setQuote(q);
      }

      if (q.issues?.balance) throw new Error('0x reports that the wallet balance is insufficient for this quote.');
      if (!q.transaction?.to || !q.transaction?.data) throw new Error('No executable transaction was returned by 0x.');

      setStatus('Review the swap in your wallet and sign it…');
      const txHash = await sendTransactionAsync({ to: q.transaction.to as `0x${string}`, data: q.transaction.data as `0x${string}`, value: BigInt(q.transaction.value || '0') });
      setHash(txHash); await persist(txHash, 'submitted', rawAmount.toString());
      setStatus('Swap submitted. Waiting for Base confirmation…');
      const receipt = await publicClient.waitForTransactionReceipt({ hash: txHash });
      if (receipt.status === 'success') {
        await persist(txHash, 'confirmed', rawAmount.toString());
        setStatus('Confirmed on Base. Your wallet now owns the purchased asset if the swap settled as quoted.');
        await usdcBalance.refetch(); await tokenBalance.refetch();
      } else {
        await persist(txHash, 'reverted', rawAmount.toString());
        setStatus('The transaction reverted on Base. No successful swap is recorded.');
      }
    } catch (e) {
      setStatus(e instanceof Error ? e.message : 'Transaction failed.');
    } finally { setBusy(false); }
  };

  useEffect(() => {
    if (!address || chainId !== 8453) return;
    const timer = setTimeout(async () => {
      try {
        const q = await fetch(`/api/price?sellToken=${BASE_USDC}&buyToken=${token}&sellAmount=${parseUnits(amount || '0', 6)}&taker=${address}`, { cache: 'no-store' }).then(r => r.ok ? r.json() : null);
        if (q?.buyAmount) setQuote(q);
      } catch { /* quote preview remains empty */ }
    }, 500);
    return () => clearTimeout(timer);
  }, [address, chainId, amount, token]);

  const expected = quote?.buyAmount && tokenDecimals.data !== undefined ? formatUnits(BigInt(quote.buyAmount), tokenDecimals.data) : null;

  return <div className="card">
    <h3>Invest in {symbol}</h3>
    <p className="muted">Real USDC → tokenized-stock execution on Base. Every transaction is signed by your wallet and confirmed from the chain receipt.</p>
    {address && <p className="muted">USDC: {usdcBalance.data === undefined ? '—' : `$${formatUnits(usdcBalance.data, 6)}`} · {symbol}: {tokenBalance.data === undefined || tokenDecimals.data === undefined ? '—' : formatUnits(tokenBalance.data, tokenDecimals.data)}</p>}
    <input className="btn" style={{ width: '100%', marginBottom: 10 }} value={amount} onChange={e => setAmount(e.target.value.replace(/[^0-9.]/g, ''))} inputMode="decimal" aria-label="USDC amount" />
    {expected && <p className="muted">Indicative output: ~{expected} {symbol}. Final execution uses a fresh firm quote.</p>}
    <button className="btn primary" style={{ width: '100%' }} onClick={invest} disabled={busy || !amount}>{busy ? 'Processing…' : `Invest $${amount}`}</button>
    {status && <p className="muted" aria-live="polite">{status}</p>}
    {hash && <a className="green" href={explorer(hash)} target="_blank" rel="noreferrer">View confirmed transaction ↗</a>}
  </div>;
}

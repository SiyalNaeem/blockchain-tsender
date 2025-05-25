'use client';

import { useMemo, useState } from 'react';
import { InputForm } from './ui/InputField';
import { chainsToTSender, erc20Abi, tsenderAbi } from '@/constants';
import { useAccount, useChainId, useConfig, useWriteContract } from 'wagmi';
import { readContract, waitForTransactionReceipt } from '@wagmi/core';
import { calculateTotal } from '@/app/utils';

export default function AirdropForm() {
  const [tokenAddress, setTokenAddress] = useState('');
  const [recipients, setRecipients] = useState('');
  const [amounts, setAmounts] = useState('');
  const chainId = useChainId();
  const config = useConfig();
  const account = useAccount();
  const { data: hash, isPending, writeContractAsync } = useWriteContract();

  const total: number = useMemo(() => calculateTotal(amounts), [amounts]);

  async function getApprovedAmount(
    tSenderAddress: string | null
  ): Promise<number> {
    if (!tSenderAddress) {
      alert('TSender address is not defined for this chain');
      return 0;
    }

    const response = await readContract(config, {
      abi: erc20Abi,
      address: tokenAddress as `0x${string}`,
      functionName: 'allowance',
      args: [account.address, tSenderAddress as `0x${string}`],
    });

    return response as number;
  }

  async function handleSubmit() {
    const tsenderAddress = chainsToTSender[chainId].tsender;
    const approvedAmount = await getApprovedAmount(tsenderAddress);

    if (approvedAmount < total) {
      const approvalHash = await writeContractAsync({
        address: tokenAddress as `0x${string}`,
        abi: erc20Abi,
        functionName: 'approve',
        args: [tsenderAddress as `0x${string}`, BigInt(total)],
      });

      const approvalReceipt = await waitForTransactionReceipt(config, {
        hash: approvalHash,
      });

      console.log('Approval transaction receipt:', approvalReceipt);

      await writeContractAsync({
        abi: tsenderAbi,
        address: tsenderAddress as `0x${string}`,
        functionName: 'airdropERC20',
        args: [
          tokenAddress,
          // Comma or new line separated
          recipients
            .split(/[,\n]+/)
            .map((addr) => addr.trim())
            .filter((addr) => addr !== ''),
          amounts
            .split(/[,\n]+/)
            .map((amt) => amt.trim())
            .filter((amt) => amt !== ''),
          BigInt(total),
        ],
      });
    } else {
      await writeContractAsync({
        abi: tsenderAbi,
        address: tsenderAddress as `0x${string}`,
        functionName: 'airdropERC20',
        args: [
          tokenAddress,
          // Comma or new line separated
          recipients
            .split(/[,\n]+/)
            .map((addr) => addr.trim())
            .filter((addr) => addr !== ''),
          amounts
            .split(/[,\n]+/)
            .map((amt) => amt.trim())
            .filter((amt) => amt !== ''),
          BigInt(total),
        ],
      });
    }
  }

  return (
    <div>
      <InputForm
        label="Token Address"
        placeholder="0x"
        value={tokenAddress}
        onChange={(e) => setTokenAddress(e.target.value)}
      />

      <InputForm
        label="Recipients (Comma-separated)"
        placeholder="0x123,0x456, 0x789"
        large={true}
        value={recipients}
        onChange={(e) => setRecipients(e.target.value)}
      />

      <InputForm
        label="Amount"
        placeholder="100, 200, 300"
        large={true}
        value={amounts}
        onChange={(e) => setAmounts(e.target.value)}
      />

      <button
        className={`cursor-pointer flex items-center justify-center w-full py-3 rounded-[9px] text-white transition-colors font-semibold relative border bg-blue-500 hover:bg-blue-600 border-blue-500`}
        onClick={() => handleSubmit()}
      >
        Send Tokens
      </button>
    </div>
  );
}

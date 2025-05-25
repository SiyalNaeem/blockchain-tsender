'use client';

import { useAccount } from 'wagmi';
import AirdropForm from './AirdropForm';

export default function HomeContent() {
  const { isConnected } = useAccount();

  return (
    <>
      {!isConnected ? (
        <AirdropForm />
      ) : (
        <div>
          <h1 className="text-3xl font-bold mb-4">Welcome to TSender</h1>
          <p className="mb-4">
            This is a simple airdrop form built with React and TypeScript.
          </p>
          <p className="mb-4">
            Please connect your wallet to start using the application.
          </p>
        </div>
      )}
    </>
  );
}

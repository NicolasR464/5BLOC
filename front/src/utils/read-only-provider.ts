import { ethers } from 'ethers'

// Côté serveur (API) : SEPOLIA_RPC. Côté client ou fallback : NEXT_PUBLIC_ ou URL publique.
// rpc.sepolia.org renvoie souvent 522 ; publicnode est une alternative fiable.
const SEPOLIA_RPC =
  process.env.SEPOLIA_RPC ??
  process.env.NEXT_PUBLIC_SEPOLIA_RPC ??
  'https://ethereum-sepolia-rpc.publicnode.com'

export function getReadOnlyProvider(): ethers.JsonRpcProvider {
  return new ethers.JsonRpcProvider(SEPOLIA_RPC)
}

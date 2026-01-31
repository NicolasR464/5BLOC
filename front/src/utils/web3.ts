import { ethers } from 'ethers'

export async function getSigner() {
    if (!window.ethereum) {
        throw new Error('MetaMask not found')
    }

    const provider = new ethers.BrowserProvider(window.ethereum)
    await provider.send('eth_requestAccounts', [])
    return provider.getSigner()
}

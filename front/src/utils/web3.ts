import { ethers } from 'ethers'

export async function getSigner() {
    if (!window.ethereum) {
        throw new Error('MetaMask not found')
    }

    await window.ethereum.request({
        method: 'wallet_switchEthereumChain',
        params: [{ chainId: '0xaa36a7' }], // 11155111 = Sepolia
    })

    const provider = new ethers.BrowserProvider(window.ethereum)

    await provider.send('eth_requestAccounts', [])

    return provider.getSigner()
}

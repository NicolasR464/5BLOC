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

export async function getABI(CONTRACT_ADDRESS: string) {
    const ETHERSCAN_API_KEY =
        process.env.ETHERSCAN_API_KEY ||
        process.env.NEXT_PUBLIC_GATEWAY_ETHERSCAN_API_KEY

    if (!ETHERSCAN_API_KEY) {
        throw new Error('ETHERSCAN_API_KEY not found in environment variables')
    }

    const CHAIN_ID = process.env.CHAIN_ID || '11155111'

    const url = `https://api.etherscan.io/v2/api?apikey=${ETHERSCAN_API_KEY}&chainid=${CHAIN_ID}&module=contract&action=getabi&address=${CONTRACT_ADDRESS}`

    try {
        const response = await fetch(url)
        const data = await response.json()

        if (data.status !== '1') {
            throw new Error(`Etherscan API error: ${data.message}`)
        }

        return JSON.parse(data.result)
    } catch (error) {
        console.error('Failed to fetch ABI:', error)
        throw error
    }
}

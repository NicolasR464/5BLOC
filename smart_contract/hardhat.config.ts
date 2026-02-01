import hardhatToolboxMochaEthersPlugin from '@nomicfoundation/hardhat-toolbox-mocha-ethers'
import { configVariable, defineConfig } from 'hardhat/config'
import hardhatKeystore from '@nomicfoundation/hardhat-keystore'
import hardhatVerify from '@nomicfoundation/hardhat-verify'

export default defineConfig({
    plugins: [hardhatToolboxMochaEthersPlugin, hardhatKeystore, hardhatVerify],
    solidity: {
        profiles: {
            default: {
                version: '0.8.28',
            },
        },
    },
    networks: {
        sepolia: {
            type: 'http',
            chainType: 'l1',
            accounts: [configVariable('SEPOLIA_PRIVATE_KEY')],

            url: configVariable('SEPOLIA_RPC_URL'),
        },
    },
    verify: {
        etherscan: {
            apiKey: configVariable('ETHERSCAN_API_KEY'),
        },
    },
})

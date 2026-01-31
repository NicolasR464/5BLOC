import hardhatToolboxMochaEthersPlugin from '@nomicfoundation/hardhat-toolbox-mocha-ethers'
import { configVariable, defineConfig } from 'hardhat/config'
import hardhatKeystore from '@nomicfoundation/hardhat-keystore'

export default defineConfig({
    plugins: [hardhatToolboxMochaEthersPlugin, hardhatKeystore],
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
})

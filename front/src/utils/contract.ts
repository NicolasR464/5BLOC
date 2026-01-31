import { ethers } from 'ethers'

export const SKILLCHAIN_ADDRESS = '0xYOUR_CONTRACT_ADDRESS'

export const SKILLCHAIN_ABI = [
    'function issueCertification(address student,string tokenURI,string name,string resourceType,uint8 status,uint8 grade,string ipfsHash) external returns (uint256)',
    'function getCertification(uint256 tokenId) view returns (string,string,uint8,uint8,string,address,address,address[],uint256,uint256)',
]

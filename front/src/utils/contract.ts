import { ethers } from 'ethers'

export const SKILLCHAIN_ADDRESS =
  process.env.NEXT_PUBLIC_SKILLCHAIN_ADDRESS ??
  '0x9DaD9F0ee786457aF112E39f01BA304CE53e1951'

export const SKILLCHAIN_ABI = [
    'function issueCertification(address student,string tokenURI,string name,string resourceType,uint8 status,uint8 grade,string ipfsHash) external returns (uint256)',
    'function getCertification(uint256 tokenId) view returns (string,string,uint8,uint8,string,address,address,address,address[],uint256,uint256)',
    'function transferFrom(address from, address to, uint256 tokenId) external',
    'event CertificationIssued(uint256 indexed tokenId, address indexed student, address indexed issuer)',
]

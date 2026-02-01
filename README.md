# 5BLOC

## SkillChain - certification validator

> [GITHUB REPOSITORY 🔗](https://github.com/NicolasR464/5BLOC.git)

> Note that it is a student project.

This project is about posting a certification/diploma on the blockchain, and validating it.

A school admin can upload the certification/diploma on IPFS, and issue a NFT associated with it.

The project structure has 2 main folders:

- `smart_contract`: contains the Solidity smart contract code, and the Hardhat configuration files.
- `front`: contains the front-end code, built with React and Next.js.

For the front-end project you will need to set up a few environment variables and you can refer to `.env.example` for the required variables.

Once the front-end server is running, you can access the application at `http://localhost:3000`.

On the page `http://localhost:3000/file-upload` you will be able to upload a certificate image file. Then, you can submit the form to upload the image to IPFS. After that, you will be guided to the next step, which is to issue a NFT, with the required fields (name, student wallet address, etc.) associated with the uploaded certificate image.

On the page `http://localhost:3000/verify` you will be able to verify a certificate by its NFT ID.

The smart-contract is powered by Ethereum Sepolia test network.

Check its activity on [Sepolia Etherscan](https://sepolia.etherscan.io/token/0x9dad9f0ee786457af112e39f01ba304ce53e1951).

// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract SkillChain is ERC721URIStorage, Ownable {

    /* ================= ENUMS ================= */

    enum Status {
        IN_PROGRESS,
        FAILED,
        PASSED
    }

    enum Grade {
        NONE,
        PASSABLE,
        ASSEZ_BIEN,
        BIEN,
        TRES_BIEN,
        EXCELLENT
    }

    /* ================= STRUCT ================= */

    struct Certification {
        string name;                // Nom du diplôme / certif
        string resourceType;        // Diplôme / Certification
        Status status;
        Grade grade;                // NONE si non attribué
        string ipfsHash;            // Hash IPFS du document
        address issuer;             // École / organisme
        address student;            // Étudiant (owner actuel)
        address[] previousOwners;   // Historique
        uint256 createdAt;
        uint256 lastTransferAt;
    }

    /* ================= STORAGE ================= */

    uint256 private nextTokenId = 1;
    mapping(uint256 => Certification) private certifications;

    /* ================= EVENTS ================= */

    event CertificationIssued(
        uint256 indexed tokenId,
        address indexed student,
        address indexed issuer
    );

    /* ================= CONSTRUCTOR ================= */

    constructor(address initialOwner)
        ERC721("SkillChain", "SKILL")
        Ownable(initialOwner)
    {}

    /* ================= CORE LOGIC ================= */

    /// @notice Délivre une certification à un étudiant (ADMIN uniquement)
    function issueCertification(
        address student,
        string calldata tokenURI_,
        string calldata name,
        string calldata resourceType,
        Status status,
        Grade grade,
        string calldata ipfsHash
    ) external onlyOwner returns (uint256) {

        uint256 tokenId = nextTokenId++;

        _safeMint(student, tokenId);
        _setTokenURI(tokenId, tokenURI_);

        Certification storage cert = certifications[tokenId];
        cert.name = name;
        cert.resourceType = resourceType;
        cert.status = status;
        cert.grade = grade;
        cert.ipfsHash = ipfsHash;
        cert.issuer = msg.sender;
        cert.student = student;
        cert.createdAt = block.timestamp;
        cert.lastTransferAt = block.timestamp;

        emit CertificationIssued(tokenId, student, msg.sender);

        return tokenId;
    }

    /* ================= VIEW (VERIFICATION) ================= */

    /// @notice Permet à un recruteur de vérifier une certification
    function getCertification(uint256 tokenId)
        external
        view
        returns (
            string memory name,
            string memory resourceType,
            Status status,
            Grade grade,
            string memory ipfsHash,
            address issuer,
            address student,
            address[] memory previousOwners,
            uint256 createdAt,
            uint256 lastTransferAt
        )
    {
       require(_ownerOf(tokenId) != address(0), "CERTIFICATION_NOT_FOUND");

        Certification storage cert = certifications[tokenId];

        return (
            cert.name,
            cert.resourceType,
            cert.status,
            cert.grade,
            cert.ipfsHash,
            cert.issuer,
            cert.student,
            cert.previousOwners,
            cert.createdAt,
            cert.lastTransferAt
        );
    }

    /* ================= TRANSFER HOOK ================= */

    function _update(
        address to,
        uint256 tokenId,
        address auth
    ) internal override returns (address from) {

        from = super._update(to, tokenId, auth);

        if (from != address(0)) {
            certifications[tokenId].previousOwners.push(from);
        }

        if (to != address(0)) {
            certifications[tokenId].student = to;
            certifications[tokenId].lastTransferAt = block.timestamp;
        }

        return from;
    }
}

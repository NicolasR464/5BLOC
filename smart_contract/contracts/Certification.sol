// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC721/extensions/ERC721URIStorage.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Certification is ERC721URIStorage, Ownable {

    /* ================= CONSTANTS ================= */

    uint256 public constant MAX_CERTIFICATES_PER_OWNER = 4;
    uint256 public constant COOLDOWN_SECONDS = 5 minutes;
    uint256 public constant LOCK_DURATION = 10 minutes;

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

    struct CertificationData {
        string name;                // Nom du diplôme / certif
        string resourceType;        // Diplôme / Certification
        Status status;
        Grade grade;                // NONE si non attribué
        string ipfsHash;            // Hash IPFS du document
        address issuer;             // École / organisme
        address owner;              // Détenteur actuel (école à l’émission, puis étudiant après transfert)
        address student;           // Destinataire désigné (étudiant)
        address[] previousOwners;   // Historique
        uint256 createdAt;
        uint256 lastTransferAt;
    }

    /* ================= STORAGE ================= */

    uint256 private nextTokenId = 1;
    mapping(uint256 => CertificationData) private certifications;
    mapping(address => uint256) private _lastTransactionAt;
    mapping(uint256 => uint256) private _lockedUntil;

    /* ================= EVENTS ================= */

    event CertificationIssued(
        uint256 indexed tokenId,
        address indexed student,
        address indexed issuer
    );

    event SwapCertifications(
        uint256 indexed tokenIdA,
        uint256 indexed tokenIdB,
        address indexed userA,
        address userB
    );

    bool private _inSwap;

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

        require(
            balanceOf(msg.sender) < MAX_CERTIFICATES_PER_OWNER,
            "MAX_CERTIFICATES_PER_OWNER"
        );

        uint256 tokenId = nextTokenId++;

        _safeMint(msg.sender, tokenId);
        _setTokenURI(tokenId, tokenURI_);

        CertificationData storage cert = certifications[tokenId];
        cert.name = name;
        cert.resourceType = resourceType;
        cert.status = status;
        cert.grade = grade;
        cert.ipfsHash = ipfsHash;
        cert.issuer = msg.sender;
        cert.owner = msg.sender;
        cert.student = student;
        cert.createdAt = block.timestamp;
        cert.lastTransferAt = block.timestamp;

        _lockedUntil[tokenId] = block.timestamp + LOCK_DURATION;

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
            address owner,
            address student,
            address[] memory previousOwners,
            uint256 createdAt,
            uint256 lastTransferAt
        )
    {
       require(_ownerOf(tokenId) != address(0), "CERTIFICATION_NOT_FOUND");

        CertificationData storage cert = certifications[tokenId];

        return (
            cert.name,
            cert.resourceType,
            cert.status,
            cert.grade,
            cert.ipfsHash,
            cert.issuer,
            cert.owner,
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

        if (!_inSwap && auth != address(0)) {
            require(
                _lastTransactionAt[auth] == 0 || block.timestamp >= _lastTransactionAt[auth] + COOLDOWN_SECONDS,
                "COOLDOWN"
            );
            _lastTransactionAt[auth] = block.timestamp;
        }

        address currentOwner = _ownerOf(tokenId);
        if (currentOwner != address(0)) {
            address issuer_ = certifications[tokenId].issuer;
            if (currentOwner != issuer_)
                require(block.timestamp >= _lockedUntil[tokenId], "TOKEN_LOCKED");
        }

        if (to != address(0)) {
            require(
                balanceOf(to) < MAX_CERTIFICATES_PER_OWNER,
                "MAX_CERTIFICATES_PER_OWNER"
            );
        }

        from = super._update(to, tokenId, auth);

        if (to != address(0)) {
            _lockedUntil[tokenId] = block.timestamp + LOCK_DURATION;
        }

        if (from != address(0)) {
            certifications[tokenId].previousOwners.push(from);
        }

        if (to != address(0)) {
            certifications[tokenId].owner = to;
            certifications[tokenId].student = to;
            certifications[tokenId].lastTransferAt = block.timestamp;
        }

        return from;
    }

    /* ================= SWAP (ÉCHANGE) ================= */

    /// @notice Échange deux certifications : l'appelant donne myTokenId et reçoit otherTokenId.
    /// @param other Adresse du propriétaire de otherTokenId (doit avoir approuvé msg.sender).
    /// @param myTokenId Token détenu par msg.sender.
    /// @param otherTokenId Token détenu par other.
    function swapWith(
        address other,
        uint256 myTokenId,
        uint256 otherTokenId
    ) external {
        require(other != address(0) && other != msg.sender, "INVALID_OTHER");
        require(ownerOf(myTokenId) == msg.sender, "NOT_OWNER_MY");
        require(ownerOf(otherTokenId) == other, "NOT_OWNER_OTHER");
        require(
            getApproved(otherTokenId) == msg.sender || isApprovedForAll(other, msg.sender),
            "NOT_APPROVED"
        );
        require(block.timestamp >= _lockedUntil[myTokenId], "TOKEN_LOCKED");
        require(block.timestamp >= _lockedUntil[otherTokenId], "TOKEN_LOCKED");
        require(
            _lastTransactionAt[msg.sender] == 0 || block.timestamp >= _lastTransactionAt[msg.sender] + COOLDOWN_SECONDS,
            "COOLDOWN"
        );
        require(
            _lastTransactionAt[other] == 0 || block.timestamp >= _lastTransactionAt[other] + COOLDOWN_SECONDS,
            "COOLDOWN_OTHER"
        );
        require(
            balanceOf(other) < MAX_CERTIFICATES_PER_OWNER,
            "MAX_CERTIFICATES_PER_OWNER"
        );

        _lastTransactionAt[msg.sender] = block.timestamp;
        _lastTransactionAt[other] = block.timestamp;
        _inSwap = true;

        _update(other, myTokenId, msg.sender);
        _update(msg.sender, otherTokenId, other);

        _inSwap = false;

        emit SwapCertifications(myTokenId, otherTokenId, msg.sender, other);
    }
}

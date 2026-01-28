import { expect } from "chai";
import hre from "hardhat";

describe("SkillChain", function () {
  it("admin issues a certification + fields are readable", async () => {
    const { ethers } = await hre.network.connect();
    const [admin, student] = await ethers.getSigners();

    const SkillChain = await ethers.getContractFactory("SkillChain");
    const sc = (await SkillChain.deploy(admin.address)) as any;
    await sc.waitForDeployment();

    const tokenUri = "ipfs://CID_METADATA";
    const name = "Master of Engineering";
    const resourceType = "Diplome";
    const status = 2; // PASSED (IN_PROGRESS=0, FAILED=1, PASSED=2)
    const grade = 5;  // EXCELLENT (NONE=0, PASSABLE=1, ASSEZ_BIEN=2, BIEN=3, TRES_BIEN=4, EXCELLENT=5)
    const ipfsHash = "CID_PDF_CERTIF";

    const tx = await sc.issueCertification(
      student.address,
      tokenUri,
      name,
      resourceType,
      status,
      grade,
      ipfsHash
    );
    await tx.wait();

    // Le premier tokenId = 1
    expect(await sc.ownerOf(1)).to.equal(student.address);
    expect(await sc.tokenURI(1)).to.equal(tokenUri);

    const cert = await sc.getCertification(1);

    // getCertification renvoie un tuple, accessible par index :
    expect(cert[0]).to.equal(name);
    expect(cert[1]).to.equal(resourceType);
    expect(cert[2]).to.equal(status);
    expect(cert[3]).to.equal(grade);
    expect(cert[4]).to.equal(ipfsHash);
    expect(cert[5]).to.equal(admin.address);     // issuer
    expect(cert[6]).to.equal(student.address);   // student
  });

  it("non-admin cannot issue", async () => {
  const { ethers } = await hre.network.connect();
  const [admin, student, attacker] = await ethers.getSigners();

  const SkillChain = await ethers.getContractFactory("SkillChain");
  const sc = (await SkillChain.deploy(admin.address)) as any;
  await sc.waitForDeployment();

  await expect(
    (sc.connect(attacker) as any).issueCertification(
      student.address,
      "ipfs://CID",
      "Test",
      "Certification",
      0, // IN_PROGRESS
      0, // NONE
      "CID_DOC"
    )
  ).to.be.revertedWithCustomError(sc, "OwnableUnauthorizedAccount")
   .withArgs(attacker.address);
});


  it("transfer updates previousOwners + lastTransferAt", async () => {
    const { ethers } = await hre.network.connect();
    const [admin, student, recruiter] = await ethers.getSigners();

    const SkillChain = await ethers.getContractFactory("SkillChain");
    const sc = (await SkillChain.deploy(admin.address)) as any;
    await sc.waitForDeployment();

    await (await sc.issueCertification(
      student.address,
      "ipfs://CID_META",
      "Certif",
      "Certification",
      2, // PASSED
      3, // BIEN
      "CID_DOC"
    )).wait();

    const before = await sc.getCertification(1);
    const beforeLastTransferAt = before[9];

    // transfert student -> recruiter
    await (await (sc.connect(student) as any).transferFrom(
      student.address,
      recruiter.address,
      1
    )).wait();

    const after = await sc.getCertification(1);
    const prevOwners = after[7];
    const afterLastTransferAt = after[9];

    expect(after[6]).to.equal(recruiter.address); // student field updated
    expect(prevOwners.length).to.equal(1);
    expect(prevOwners[0]).to.equal(student.address);

    expect(afterLastTransferAt).to.be.greaterThanOrEqual(beforeLastTransferAt);
  });
});

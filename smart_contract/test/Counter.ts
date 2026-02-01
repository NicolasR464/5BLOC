import { expect } from "chai";
import hre from "hardhat";

describe("Certification (SkillChain)", function () {
  it("admin issues a certification + fields are readable", async () => {
    const { ethers } = await hre.network.connect();
    const [admin, student] = await ethers.getSigners();

    const Certification = await ethers.getContractFactory("Certification");
    const sc = (await Certification.deploy(admin.address)) as any;
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

    // À l'émission le token est minté à l'école (admin), owner = école, student = destinataire
    expect(await sc.ownerOf(1)).to.equal(admin.address);
    expect(await sc.tokenURI(1)).to.equal(tokenUri);

    const cert = await sc.getCertification(1);
    // name, resourceType, status, grade, ipfsHash, issuer, owner, student, previousOwners, createdAt, lastTransferAt
    expect(cert[0]).to.equal(name);
    expect(cert[1]).to.equal(resourceType);
    expect(cert[2]).to.equal(status);
    expect(cert[3]).to.equal(grade);
    expect(cert[4]).to.equal(ipfsHash);
    expect(cert[5]).to.equal(admin.address);     // issuer
    expect(cert[6]).to.equal(admin.address);    // owner (école)
    expect(cert[7]).to.equal(student.address);  // student (destinataire)
  });

  it("non-admin cannot issue", async () => {
  const { ethers } = await hre.network.connect();
  const [admin, student, attacker] = await ethers.getSigners();

  const Certification = await ethers.getContractFactory("Certification");
  const sc = (await Certification.deploy(admin.address)) as any;
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


  it("transfer updates owner (école → student → recruiter) + previousOwners + lastTransferAt", async () => {
    const { ethers } = await hre.network.connect();
    const [admin, student, recruiter] = await ethers.getSigners();
    const provider = (await ethers.getSigners())[0].provider;
    if (!provider) throw new Error("No provider");

    const Certification = await ethers.getContractFactory("Certification");
    const sc = (await Certification.deploy(admin.address)) as any;
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

    await (await (sc.connect(admin) as any).transferFrom(admin.address, student.address, 1)).wait();

    await provider.send("evm_increaseTime", [12 * 60]);
    await provider.send("evm_mine", []);

    const before = await sc.getCertification(1);
    const beforeLastTransferAt = before[10];

    await (await (sc.connect(student) as any).transferFrom(
      student.address,
      recruiter.address,
      1
    )).wait();

    const after = await sc.getCertification(1);
    const prevOwners = after[8];
    const afterLastTransferAt = after[10];

    expect(after[6]).to.equal(recruiter.address); // owner
    expect(after[7]).to.equal(recruiter.address); // student (destinataire actuel)
    expect(prevOwners.length).to.equal(2);
    expect(prevOwners[0]).to.equal(admin.address);
    expect(prevOwners[1]).to.equal(student.address);
    expect(afterLastTransferAt).to.be.greaterThanOrEqual(beforeLastTransferAt);
  });

  it("reverts when user would exceed MAX_CERTIFICATES_PER_OWNER", async () => {
    const { ethers } = await hre.network.connect();
    const [admin, student] = await ethers.getSigners();

    const Certification = await ethers.getContractFactory("Certification");
    const sc = (await Certification.deploy(admin.address)) as any;
    await sc.waitForDeployment();

    const max = await sc.MAX_CERTIFICATES_PER_OWNER();
    for (let i = 0; i < Number(max); i++) {
      await (
        await sc.issueCertification(
          student.address,
          `ipfs://CID_${i}`,
          `Certif ${i}`,
          "Diplome",
          2,
          3,
          `CID_${i}`
        )
      ).wait();
    }
    expect(await sc.balanceOf(admin.address)).to.equal(Number(max));

    await expect(
      sc.issueCertification(
        student.address,
        "ipfs://CID_EXTRA",
        "Extra",
        "Diplome",
        2,
        3,
        "CID_EXTRA"
      )
    ).to.be.revertedWith("MAX_CERTIFICATES_PER_OWNER");
  });

  it("reverts transfer before LOCK_DURATION (non-issuer)", async () => {
    const { ethers } = await hre.network.connect();
    const [admin, student, recruiter] = await ethers.getSigners();

    const Certification = await ethers.getContractFactory("Certification");
    const sc = (await Certification.deploy(admin.address)) as any;
    await sc.waitForDeployment();

    await (await sc.issueCertification(student.address, "ipfs://CID", "Certif", "Certification", 2, 3, "CID")).wait();
    await (await (sc.connect(admin) as any).transferFrom(admin.address, student.address, 1)).wait();

    await expect(
      (sc.connect(student) as any).transferFrom(student.address, recruiter.address, 1)
    ).to.be.revertedWith("TOKEN_LOCKED");
  });

  it("reverts second transaction within COOLDOWN", async () => {
    const { ethers } = await hre.network.connect();
    const [admin, student, recruiter, other] = await ethers.getSigners();
    const provider = (await ethers.getSigners())[0].provider;
    if (!provider) throw new Error("No provider");

    const Certification = await ethers.getContractFactory("Certification");
    const sc = (await Certification.deploy(admin.address)) as any;
    await sc.waitForDeployment();

    await (await sc.issueCertification(student.address, "ipfs://CID1", "Certif 1", "Certification", 2, 3, "CID1")).wait();
    await (await sc.issueCertification(recruiter.address, "ipfs://CID2", "Certif 2", "Certification", 2, 3, "CID2")).wait();

    await (await (sc.connect(admin) as any).transferFrom(admin.address, student.address, 1)).wait();
    await provider.send("evm_increaseTime", [6 * 60]);
    await provider.send("evm_mine", []);
    await (await (sc.connect(admin) as any).transferFrom(admin.address, recruiter.address, 2)).wait();

    await provider.send("evm_increaseTime", [11 * 60]);
    await provider.send("evm_mine", []);

    await (await (sc.connect(student) as any).transferFrom(student.address, other.address, 1)).wait();

    await provider.send("evm_increaseTime", [2 * 60]);
    await provider.send("evm_mine", []);

    await (sc.connect(other) as any).approve(student.address, 1);

    await expect(
      (sc.connect(student) as any).transferFrom(other.address, student.address, 1)
    ).to.be.revertedWith("COOLDOWN");
  });

  it("swapWith exchanges two certifications", async () => {
    const { ethers } = await hre.network.connect();
    const [admin, alice, bob] = await ethers.getSigners();
    const provider = (await ethers.getSigners())[0].provider;
    if (!provider) throw new Error("No provider");

    const Certification = await ethers.getContractFactory("Certification");
    const sc = (await Certification.deploy(admin.address)) as any;
    await sc.waitForDeployment();

    await (await sc.issueCertification(alice.address, "ipfs://A", "Certif A", "Diplome", 2, 3, "CID_A")).wait();
    await (await sc.issueCertification(bob.address, "ipfs://B", "Certif B", "Diplome", 2, 4, "CID_B")).wait();

    await (await (sc.connect(admin) as any).transferFrom(admin.address, alice.address, 1)).wait();
    await provider.send("evm_increaseTime", [6 * 60]);
    await provider.send("evm_mine", []);
    await (await (sc.connect(admin) as any).transferFrom(admin.address, bob.address, 2)).wait();

    await provider.send("evm_increaseTime", [11 * 60]);
    await provider.send("evm_mine", []);

    await (sc.connect(bob) as any).approve(alice.address, 2);

    await expect(sc.connect(alice).swapWith(bob.address, 1, 2))
      .to.emit(sc, "SwapCertifications")
      .withArgs(1, 2, alice.address, bob.address);

    expect(await sc.ownerOf(1)).to.equal(bob.address);
    expect(await sc.ownerOf(2)).to.equal(alice.address);
    const cert1 = await sc.getCertification(1);
    const cert2 = await sc.getCertification(2);
    expect(cert2[6]).to.equal(alice.address);
    expect(cert2[7]).to.equal(alice.address);
    expect(cert1[6]).to.equal(bob.address);
    expect(cert1[7]).to.equal(bob.address);
  });
});

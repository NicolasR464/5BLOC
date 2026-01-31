import { buildModule } from '@nomicfoundation/hardhat-ignition/modules'

const CertificationModule = buildModule('CertificationModule', (m) => {
    const certification = m.contract('Certification', [
        m.getAccount(0), // admin initial
    ])

    return { certification }
})

export default CertificationModule

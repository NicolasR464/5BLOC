'use client'

import { useState } from 'react'
import { ethers } from 'ethers'
import { getSigner } from '@/utils/web3'
import { SKILLCHAIN_ABI, SKILLCHAIN_ADDRESS } from '@/utils/contract'

export default function IssueCertificate() {
    const [student, setStudent] = useState('')
    const [name, setName] = useState('')
    const [resourceType, setResourceType] = useState('')
    const [tokenURI, setTokenURI] = useState('')
    const [ipfsHash, setIpfsHash] = useState('')
    const [status, setStatus] = useState(2) // PASSED
    const [grade, setGrade] = useState(5) // EXCELLENT
    const [loading, setLoading] = useState(false)

    async function issue() {
        try {
            setLoading(true)

            const signer = await getSigner()
            const contract = new ethers.Contract(
                SKILLCHAIN_ADDRESS,
                SKILLCHAIN_ABI,
                signer,
            )

            const tx = await contract.issueCertification(
                student,
                tokenURI,
                name,
                resourceType,
                status,
                grade,
                ipfsHash,
            )

            await tx.wait()
            alert('Certificate issued ✅')
        } catch (err) {
            console.error(err)
            alert('Error issuing certificate')
        } finally {
            setLoading(false)
        }
    }

    return (
        <main style={{ padding: 40 }}>
            <h1>Issue Certificate</h1>

            <input
                placeholder="Student address"
                onChange={(e) => setStudent(e.target.value)}
            />
            <input
                placeholder="Certificate name"
                onChange={(e) => setName(e.target.value)}
            />
            <input
                placeholder="Resource type"
                onChange={(e) => setResourceType(e.target.value)}
            />
            <input
                placeholder="Token URI (metadata)"
                onChange={(e) => setTokenURI(e.target.value)}
            />
            <input
                placeholder="IPFS hash"
                onChange={(e) => setIpfsHash(e.target.value)}
            />

            <button onClick={issue} disabled={loading}>
                {loading ? 'Issuing...' : 'Issue Certificate'}
            </button>
        </main>
    )
}

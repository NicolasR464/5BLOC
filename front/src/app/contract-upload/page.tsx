'use client'

import { useEffect, useState } from 'react'
import { ethers } from 'ethers'
import { getSigner, getABI } from '@/utils/web3'
import {
    GradeLabels,
    StatusLabels,
    gradeFromString,
    statusFromString,
} from '@/utils/labels'
import { Grade, Status } from '@/types/contract'
import useUploadStore from '@/store/upload'

export default function IssueCertificate() {
    const [student, setStudent] = useState('')
    const [name, setName] = useState('')
    const [resourceType, setResourceType] = useState('')
    const [tokenURI, setTokenURI] = useState('')
    const [ipfsHash, setIpfsHash] = useState('')
    const [status, setStatus] = useState(2) // PASSED
    const [grade, setGrade] = useState(5) // EXCELLENT
    const [loading, setLoading] = useState(false)

    const url = useUploadStore((state) => state.url)
    const cid = useUploadStore((state) => state.cid)

    // Automate IPFS fields from store
    useEffect(() => {
        if (cid) {
            setIpfsHash(cid)
            setTokenURI(`ipfs://${cid}`)
        }
    }, [cid])

    useEffect(() => {
        console.log({ student })
        console.log({ name })
        console.log({ resourceType })
        console.log({ tokenURI })
        console.log({ ipfsHash })
        console.log({ status })
        console.log({ grade })
    }, [student, name, resourceType, tokenURI, ipfsHash, status, grade])

    async function issueContract() {
        // Get the ABI
        async function fetchABI() {
            try {
                const abi = await getABI(
                    process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
                )

                console.log({ abi })

                return abi
            } catch (e) {
                console.error('Error fetching ABI', e)
            }
        }

        if (!process.env.NEXT_PUBLIC_CONTRACT_ADDRESS) {
            console.error('No contract address provided')
            return
        }

        const contractABI = await fetchABI()

        if (!contractABI) {
            console.error('No contract ABI provided')
            return
        }

        try {
            setLoading(true)

            // Connect to MetaMask
            const signer = await getSigner()

            console.log({ signer })

            if (!signer) console.error('Problem with signer')

            const contract = new ethers.Contract(
                process.env.NEXT_PUBLIC_CONTRACT_ADDRESS!,
                contractABI,
                signer,
            )

            console.log({ contract })

            // Issue the certification
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

            setLoading(false)

            alert('Certificat envoyé  ✅')
        } catch (err) {
            console.error(err)

            alert('Erreur lors de l‘envoi du certificat')
            setLoading(false)
        }
    }

    return (
        <main className="w-full min-h-screen m-auto flex flex-col justify-center items-center  p-6">
            <h1 className="text-3xl font-bold mb-8">Envoyer un certificat</h1>

            <div className="w-full max-w-md flex flex-col gap-4">
                {/* Student address */}
                <div>
                    <label className="block text-sm font-medium">
                        Adresse de l&apos;étudiant
                    </label>
                    <input
                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="0x..."
                        onChange={(e) => setStudent(e.target.value)}
                    />
                </div>

                {/* Certificate name */}
                <div>
                    <label className="block text-sm font-medium  ">
                        Nom du certificat
                    </label>
                    <input
                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ex: Diplôme d'Ingénieur"
                        onChange={(e) => setName(e.target.value)}
                    />
                </div>

                {/* Resource type */}
                <div>
                    <label className="block text-sm font-medium  ">
                        Type de ressource
                    </label>
                    <input
                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Ex: Certification / Diplôme"
                        onChange={(e) => setResourceType(e.target.value)}
                    />
                </div>

                {/* Token URI (metadata) */}
                <div>
                    <label className="block text-sm font-medium  ">
                        Token URI
                    </label>
                    <input
                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={tokenURI}
                        disabled
                    />
                </div>

                {/* IPFS hash */}
                <div>
                    <label className="block text-sm font-medium  ">
                        IPFS hash
                    </label>
                    <input
                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        value={cid}
                        disabled
                    />
                </div>

                {/* Status */}
                <div>
                    <label
                        htmlFor="status"
                        className="block text-sm font-medium  "
                    >
                        Statut de formation
                    </label>
                    <select
                        id="status"
                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        onChange={(e) =>
                            setStatus(statusFromString(e.target.value))
                        }
                    >
                        {Object.keys(Status)
                            .filter((key) => isNaN(Number(key)))
                            .map((key) => (
                                <option key={key} value={key}>
                                    {
                                        StatusLabels[
                                            Status[key as keyof typeof Status]
                                        ]
                                    }
                                </option>
                            ))}
                    </select>
                </div>

                {/* Grade */}
                <div>
                    <label
                        htmlFor="grade"
                        className="block text-sm font-medium "
                    >
                        Note
                    </label>
                    <select
                        id="grade"
                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        onChange={(e) =>
                            setGrade(gradeFromString(e.target.value))
                        }
                    >
                        {Object.keys(Grade)
                            .filter((key) => isNaN(Number(key)))
                            .map((key) => (
                                <option key={key} value={key}>
                                    {
                                        GradeLabels[
                                            Grade[key as keyof typeof Grade]
                                        ]
                                    }
                                </option>
                            ))}
                    </select>
                </div>

                <button
                    onClick={issueContract}
                    disabled={loading}
                    className="w-full p-3 mt-4 bg-blue-600 text-white font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
                >
                    {loading ? 'Envoi en cours...' : 'Envoyer le certificat'}
                </button>
            </div>
        </main>
    )
}

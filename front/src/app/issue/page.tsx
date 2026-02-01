'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ethers } from 'ethers'
import { getSigner } from '@/utils/web3'
import { SKILLCHAIN_ABI, SKILLCHAIN_ADDRESS } from '@/utils/contract'

const STATUS_OPTIONS = [
  { value: 0, label: 'En cours' },
  { value: 1, label: 'Échoué' },
  { value: 2, label: 'Réussi' },
]
const GRADE_OPTIONS = [
  { value: 0, label: 'Non attribué' },
  { value: 1, label: 'Passable' },
  { value: 2, label: 'Assez bien' },
  { value: 3, label: 'Bien' },
  { value: 4, label: 'Très bien' },
  { value: 5, label: 'Excellent' },
]

export default function IssuePage() {
  const searchParams = useSearchParams()
  const cidFromUrl = searchParams.get('cid') ?? ''

  const [step, setStep] = useState<1 | 2>(1)
  const [uploadFile, setUploadFile] = useState<File | null>(null)
  const [uploading, setUploading] = useState(false)
  const [ipfsHash, setIpfsHash] = useState('')
  const [student, setStudent] = useState('')
  const [name, setName] = useState('')
  const [resourceType, setResourceType] = useState('Diplôme')
  const [status, setStatus] = useState(2)
  const [grade, setGrade] = useState(5)
  const [loading, setLoading] = useState(false)
  const [issuedTokenId, setIssuedTokenId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (cidFromUrl) {
      setIpfsHash(cidFromUrl)
      setStep(2)
    }
  }, [cidFromUrl])

  async function handleUpload() {
    if (!uploadFile) {
      setError('Choisissez un fichier.')
      return
    }
    setError(null)
    setUploading(true)
    try {
      const data = new FormData()
      data.set('file', uploadFile)
      const res = await fetch('/api/files', { method: 'POST', body: data })
      const result = await res.json()
      if (!res.ok) {
        setError(result?.error ?? 'Erreur lors du dépôt.')
        return
      }
      setIpfsHash(result.cid ?? '')
      setStep(2)
    } catch {
      setError('Impossible d’envoyer le fichier.')
    } finally {
      setUploading(false)
    }
  }

  function goToStep2() {
    setError(null)
    if (ipfsHash.trim()) setStep(2)
    else setError('Déposez un fichier ou entrez un numéro.')
  }

  async function handleIssue() {
    setError(null)
    if (!student.trim() || !name.trim() || !ipfsHash.trim()) {
      setError('Remplissez tous les champs.')
      return
    }

    setLoading(true)
    try {
      const signer = await getSigner()
      const contract = new ethers.Contract(
        SKILLCHAIN_ADDRESS,
        SKILLCHAIN_ABI,
        signer,
      )
      const tx = await contract.issueCertification(
        student.trim(),
        `ipfs://${ipfsHash.trim()}`,
        name.trim(),
        resourceType.trim(),
        status,
        grade,
        ipfsHash.trim(),
      )
      const receipt = await tx.wait()
      let tokenId: string | null = null
      if (receipt?.logs) {
        for (const log of receipt.logs) {
          try {
            const parsed = contract.interface.parseLog(log as { topics: string[]; data: string })
            if (parsed?.name === 'CertificationIssued' && parsed.args?.tokenId != null) {
              tokenId = parsed.args.tokenId.toString()
              break
            }
          } catch {
            // ignore
          }
        }
      }
      setIssuedTokenId(tokenId)
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Erreur'
      setError(msg.includes('user rejected') ? 'Transaction annulée.' : msg)
    } finally {
      setLoading(false)
    }
  }

  if (issuedTokenId) {
    return (
      <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 px-4 py-12">
        <div className="mx-auto max-w-md rounded-2xl border-2 border-green-200 dark:border-green-800 bg-white dark:bg-zinc-900 p-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-green-700 dark:text-green-400">C’est fait.</p>
          <p className="mt-4 text-zinc-600 dark:text-zinc-400">
            Numéro à communiquer au titulaire :
          </p>
          <p className="mt-2 text-4xl font-bold text-zinc-900 dark:text-zinc-100">{issuedTokenId}</p>
          <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400">
            Le diplôme est détenu par l'école (owner). Transférez-le au titulaire pour qu'il en devienne détenteur.
          </p>
          <Link
            href={`/verify?tokenId=${issuedTokenId}`}
            className="mt-6 block rounded-xl bg-zinc-900 dark:bg-zinc-100 py-4 px-6 text-lg font-semibold text-white dark:text-zinc-900"
          >
            Voir le diplôme
          </Link>
          <Link
            href={`/transfer?tokenId=${issuedTokenId}`}
            className="mt-3 block rounded-xl border-2 border-zinc-300 dark:border-zinc-600 py-3 px-6 text-base font-medium text-zinc-700 dark:text-zinc-300"
          >
            Transférer au titulaire
          </Link>
          <div className="mt-6 flex justify-center gap-4 text-sm">
            <Link href="/" className="text-zinc-500 hover:underline">Accueil</Link>
            <Link href="/issue" className="text-zinc-500 hover:underline">Émettre un autre</Link>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 px-4 py-10">
      <div className="mx-auto max-w-lg">
        <Link href="/" className="text-sm text-zinc-500 hover:underline">← Accueil</Link>
        <h1 className="mt-4 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Émettre un diplôme
        </h1>
        <p className="mt-1 text-sm text-zinc-500">
          Étape 1 : document. Étape 2 : infos. (MetaMask requis)
        </p>

        {/* Étape 1/2 */}
        <section className="mt-6 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-5 shadow-sm">
          <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
            Étape 1/2 — Document
          </h2>
          <p className="mt-1 text-sm text-zinc-500">
            Déposez le fichier (PDF ou image) ou collez un numéro si vous l’avez déjà.
          </p>
          <div className="mt-4 flex flex-col gap-3">
            <input
              type="file"
              accept=".pdf,.png,.jpg,.jpeg"
              onChange={(e) => {
                setUploadFile(e.target?.files?.[0] ?? null)
                setError(null)
              }}
              className="w-full text-sm text-zinc-600 file:mr-3 file:rounded file:border-0 file:bg-zinc-100 file:px-3 file:py-1.5 file:text-zinc-900 dark:file:bg-zinc-800 dark:file:text-zinc-100"
            />
            <button
              type="button"
              onClick={handleUpload}
              disabled={uploading || !uploadFile}
              className="h-10 rounded-lg bg-zinc-200 dark:bg-zinc-700 px-4 text-sm font-medium text-zinc-900 dark:text-zinc-100 disabled:opacity-50"
            >
              {uploading ? 'Envoi…' : 'Déposer le fichier'}
            </button>
            <p className="text-center text-sm text-zinc-500">ou</p>
            <div>
              <label className="block text-sm text-zinc-600 dark:text-zinc-400">Numéro du document</label>
              <input
                type="text"
                placeholder="Si vous l’avez déjà"
                value={ipfsHash}
                onChange={(e) => setIpfsHash(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-3 py-2 text-sm text-zinc-900 dark:text-zinc-100"
              />
            </div>
            {step === 1 ? (
              <button
                type="button"
                onClick={goToStep2}
                className="mt-2 h-11 rounded-lg bg-zinc-900 dark:bg-zinc-100 font-medium text-white dark:text-zinc-900"
              >
                Continuer →
              </button>
            ) : (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="mt-2 text-sm text-zinc-500 underline dark:text-zinc-400"
              >
                Modifier le document
              </button>
            )}
          </div>
        </section>

        {/* Étape 2/2 */}
        {step === 2 && (
          <section className="mt-6 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-5 shadow-sm">
            <h2 className="font-semibold text-zinc-900 dark:text-zinc-100">
              Étape 2/2 — Infos du diplôme
            </h2>
            <div className="mt-4 flex flex-col gap-4">
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Titulaire (adresse)</label>
                <input
                  type="text"
                  placeholder="0x..."
                  value={student}
                  onChange={(e) => setStudent(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Nom du diplôme</label>
                <input
                  type="text"
                  placeholder="ex. Master Informatique"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Type
                </label>
                <input
                  type="text"
                  placeholder="ex. Diplôme"
                  value={resourceType}
                  onChange={(e) => setResourceType(e.target.value)}
                  className="mt-1 w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-100"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Statut
                  </label>
                  <select
                    value={status}
                    onChange={(e) => setStatus(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-100"
                  >
                    {STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Mention
                  </label>
                  <select
                    value={grade}
                    onChange={(e) => setGrade(Number(e.target.value))}
                    className="mt-1 w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-100"
                  >
                    {GRADE_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>{o.label}</option>
                    ))}
                  </select>
                </div>
              </div>

              {error && (
                <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50 px-4 py-3 text-sm text-red-800 dark:text-red-200">
                  {error}
                </div>
              )}

              <button
                type="button"
                onClick={handleIssue}
                disabled={loading}
                className="h-12 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-lg font-semibold text-white dark:text-zinc-900 disabled:opacity-50"
              >
                {loading ? 'Envoi…' : 'Émettre'}
              </button>
            </div>
          </section>
        )}

        <p className="mt-6">
          <Link href="/" className="text-sm text-zinc-500 hover:underline">← Accueil</Link>
        </p>
      </div>
    </main>
  )
}

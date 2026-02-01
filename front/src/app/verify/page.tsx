'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'

const STATUS_LABELS: Record<number, string> = {
  0: 'En cours',
  1: 'Échoué',
  2: 'Réussi',
}

const GRADE_LABELS: Record<number, string> = {
  0: 'Non attribué',
  1: 'Passable',
  2: 'Assez bien',
  3: 'Bien',
  4: 'Très bien',
  5: 'Excellent',
}

function formatTimestamp(value: string | bigint): string {
  const sec = typeof value === 'string' ? Number(value) : Number(value)
  const date = new Date(sec * 1000)
  return date.toLocaleDateString('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  })
}

function ipfsUrl(hash: string): string {
  if (!hash) return '#'
  const gateway = process.env.NEXT_PUBLIC_GATEWAY_URL ?? 'https://gateway.pinata.cloud'
  const cid = hash.startsWith('ipfs://') ? hash.slice(7) : hash
  return `${gateway}/ipfs/${cid}`
}

export default function VerifyDiplomaPage() {
  const searchParams = useSearchParams()
  const tokenIdFromUrl = searchParams.get('tokenId') ?? ''
  const [tokenId, setTokenId] = useState(tokenIdFromUrl)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (tokenIdFromUrl) setTokenId(tokenIdFromUrl)
  }, [tokenIdFromUrl])
  const [error, setError] = useState<string | null>(null)
  const [cert, setCert] = useState<{
    name: string
    resourceType: string
    status: number
    grade: number
    ipfsHash: string
    issuer: string
    owner: string
    student: string
    previousOwners: string[]
    createdAt: string
    lastTransferAt: string
  } | null>(null)

  async function handleVerify() {
    const id = tokenId.trim()
    if (!id || Number.isNaN(Number(id)) || Number(id) < 1) {
      setError('Entrez un numéro (ex. 1).')
      setCert(null)
      return
    }

    setError(null)
    setCert(null)
    setLoading(true)

    try {
      const res = await fetch(
        `/api/verify?tokenId=${encodeURIComponent(id)}`,
      )
      const data = await res.json()

      if (!res.ok) {
        setError(
          data.error === 'CERTIFICATION_NOT_FOUND'
            ? 'Aucun diplôme pour ce numéro.'
            : data.error ?? 'Erreur lors de la vérification.',
        )
        return
      }

      setCert({
        name: data.name,
        resourceType: data.resourceType,
        status: data.status,
        grade: data.grade,
        ipfsHash: data.ipfsHash,
        issuer: data.issuer,
        owner: data.owner,
        student: data.student,
        previousOwners: data.previousOwners ?? [],
        createdAt: data.createdAt,
        lastTransferAt: data.lastTransferAt,
      })
    } catch (e) {
      const message = e instanceof Error ? e.message : 'Erreur inconnue'
      setError(
        message.includes('Failed to fetch')
          ? 'Impossible de joindre le serveur. Vérifiez votre connexion.'
          : `Erreur lors de la vérification : ${message}`,
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 px-4 py-10">
      <div className="mx-auto max-w-lg">
        <Link href="/" className="text-sm text-zinc-500 hover:underline">← Accueil</Link>
        <h1 className="mt-4 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Vérifier un diplôme
        </h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          Numéro du diplôme
        </p>

        <div className="mt-4 flex flex-col sm:flex-row gap-3 mb-6">
          <input
            type="text"
            inputMode="numeric"
            placeholder="Numéro (ex. 1)"
            value={tokenId}
            onChange={(e) => setTokenId(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleVerify()}
            className="flex-1 rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-4 py-3 text-zinc-900 dark:text-zinc-100 placeholder-zinc-500 focus:outline-none focus:ring-2 focus:ring-zinc-400 dark:focus:ring-zinc-500"
          />
          <button
            type="button"
            onClick={handleVerify}
            disabled={loading}
            className="rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-6 py-3 font-medium hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Vérification…' : 'Vérifier'}
          </button>
        </div>

        {error && (
          <div
            role="alert"
            className="mb-6 rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50 px-4 py-3 text-red-800 dark:text-red-200"
          >
            {error}
          </div>
        )}

        {cert && (
          <section
            className="rounded-xl border-2 border-green-200 dark:border-green-800 bg-white dark:bg-zinc-900 shadow-sm overflow-hidden"
            aria-label="Détails du diplôme"
          >
            <div className="border-b border-zinc-200 dark:border-zinc-700 bg-green-50 dark:bg-green-950/30 px-5 py-4">
              <p className="text-sm font-semibold text-green-700 dark:text-green-400">Diplôme valide</p>
              <h2 className="mt-1 text-xl font-semibold text-zinc-900 dark:text-zinc-100">
                {cert.name}
              </h2>
              <p className="text-sm text-zinc-600 dark:text-zinc-400">
                {cert.resourceType} · N°{tokenId}
              </p>
            </div>

            <dl className="divide-y divide-zinc-100 dark:divide-zinc-800">
              <DetailRow
                label="Statut"
                value={STATUS_LABELS[cert.status] ?? `Inconnu (${cert.status})`}
              />
              <DetailRow
                label="Mention"
                value={GRADE_LABELS[cert.grade] ?? `Inconnu (${cert.grade})`}
              />
              <DetailRow
                label="Détenteur actuel (owner)"
                value={cert.owner}
                mono
              />
              <DetailRow
                label="Titulaire désigné"
                value={cert.student}
                mono
              />
              <DetailRow
                label="Émetteur"
                value={cert.issuer}
                mono
              />
              <DetailRow
                label="Créé le"
                value={formatTimestamp(cert.createdAt)}
              />
              <DetailRow
                label="Dernier transfert"
                value={formatTimestamp(cert.lastTransferAt)}
              />
              {cert.previousOwners.length > 0 && (
                <div className="px-5 py-4">
                  <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-2">
                    Anciens propriétaires
                  </dt>
                  <dd className="text-sm text-zinc-900 dark:text-zinc-100 font-mono space-y-1">
                    {cert.previousOwners.map((addr, i) => (
                      <div key={i}>{addr}</div>
                    ))}
                  </dd>
                </div>
              )}
              {cert.ipfsHash && (
                <div className="px-5 py-4">
                  <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">Document</dt>
                  <dd>
                    <a
                      href={ipfsUrl(cert.ipfsHash)}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Voir le document →
                    </a>
                  </dd>
                </div>
              )}
            </dl>
          </section>
        )}

        <p className="mt-6">
          <Link href="/" className="text-sm text-zinc-500 hover:underline">← Accueil</Link>
        </p>
      </div>
    </main>
  )
}

function DetailRow({
  label,
  value,
  mono = false,
}: {
  label: string
  value: string
  mono?: boolean
}) {
  return (
    <div className="px-5 py-4">
      <dt className="text-sm font-medium text-zinc-500 dark:text-zinc-400 mb-1">
        {label}
      </dt>
      <dd
        className={`text-zinc-900 dark:text-zinc-100 break-all ${
          mono ? 'font-mono text-sm' : ''
        }`}
      >
        {value}
      </dd>
    </div>
  )
}

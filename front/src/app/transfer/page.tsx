'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useSearchParams } from 'next/navigation'
import { ethers } from 'ethers'
import { getSigner } from '@/utils/web3'
import { SKILLCHAIN_ABI, SKILLCHAIN_ADDRESS } from '@/utils/contract'

export default function TransferPage() {
  const searchParams = useSearchParams()
  const tokenIdFromUrl = searchParams.get('tokenId') ?? ''

  const [tokenId, setTokenId] = useState('')
  const [toAddress, setToAddress] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (tokenIdFromUrl) setTokenId(tokenIdFromUrl)
  }, [tokenIdFromUrl])

  async function handleTransfer() {
    setError(null)
    const id = tokenId.trim()
    const to = toAddress.trim()
    if (!id || !to) {
      setError('Remplissez le numéro du diplôme et l’adresse du destinataire.')
      return
    }
    if (Number.isNaN(Number(id)) || Number(id) < 1) {
      setError('Numéro de diplôme invalide.')
      return
    }

    setLoading(true)
    try {
      const signer = await getSigner()
      const from = await signer.getAddress()
      const contract = new ethers.Contract(SKILLCHAIN_ADDRESS, SKILLCHAIN_ABI, signer)
      const tx = await contract.transferFrom(from, to, id)
      await tx.wait()
      setSuccess(true)
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err)
      setError(msg.includes('user rejected') ? 'Transaction annulée.' : msg)
    } finally {
      setLoading(false)
    }
  }

  if (success) {
    return (
      <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 px-4 py-12">
        <div className="mx-auto max-w-md rounded-2xl border-2 border-green-200 dark:border-green-800 bg-white dark:bg-zinc-900 p-8 text-center shadow-sm">
          <p className="text-lg font-semibold text-green-700 dark:text-green-400">Diplôme transféré.</p>
          <p className="mt-3 text-zinc-600 dark:text-zinc-400">
            Le détenteur actuel (owner) est maintenant l’adresse indiquée.
          </p>
          <Link href={`/verify?tokenId=${tokenId}`} className="mt-6 inline-block text-sm font-medium text-zinc-600 underline dark:text-zinc-400">
            Voir le diplôme
          </Link>
          <p className="mt-4">
            <Link href="/" className="text-sm text-zinc-500 hover:underline">← Accueil</Link>
          </p>
        </div>
      </main>
    )
  }

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 px-4 py-10">
      <div className="mx-auto max-w-lg">
        <Link href="/" className="text-sm text-zinc-500 hover:underline">← Accueil</Link>
        <h1 className="mt-4 text-2xl font-bold text-zinc-900 dark:text-zinc-100">
          Transférer un diplôme
        </h1>
        <p className="mt-1 text-sm text-zinc-600 dark:text-zinc-400">
          Vous transférez un diplôme que vous détenez vers une autre adresse (ex. remettre au titulaire). MetaMask requis.
        </p>

        <section className="mt-6 rounded-xl border-2 border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-5 shadow-sm">
          <div className="flex flex-col gap-4">
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Numéro du diplôme</label>
              <input
                type="text"
                inputMode="numeric"
                placeholder="ex. 1"
                value={tokenId}
                onChange={(e) => setTokenId(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-100"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">Adresse du destinataire</label>
              <input
                type="text"
                placeholder="0x..."
                value={toAddress}
                onChange={(e) => setToAddress(e.target.value)}
                className="mt-1 w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-100"
              />
            </div>
            {error && (
              <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50 px-4 py-3 text-sm text-red-800 dark:text-red-200">
                {error}
              </div>
            )}
            <button
              type="button"
              onClick={handleTransfer}
              disabled={loading}
              className="h-12 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-lg font-semibold text-white dark:text-zinc-900 disabled:opacity-50"
            >
              {loading ? 'Envoi…' : 'Transférer'}
            </button>
          </div>
        </section>

        <p className="mt-6">
          <Link href="/" className="text-sm text-zinc-500 hover:underline">← Accueil</Link>
        </p>
      </div>
    </main>
  )
}

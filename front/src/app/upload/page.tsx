'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null)
  const [url, setUrl] = useState('')
  const [cid, setCid] = useState('')
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const uploadFile = async () => {
    if (!file) {
      setError('Choisissez un fichier.')
      return
    }
    setError(null)
    setUrl('')
    setCid('')
    setUploading(true)
    try {
      const data = new FormData()
      data.set('file', file)
      const res = await fetch('/api/files', { method: 'POST', body: data })
      const result = await res.json()
      if (!res.ok) {
        setError(result?.error ?? 'Erreur lors de l’upload.')
        return
      }
      setUrl(result.url ?? result)
      setCid(result.cid ?? '')
    } catch (e) {
      setError('Impossible d’envoyer le fichier.')
    } finally {
      setUploading(false)
    }
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFile(e.target?.files?.[0] ?? null)
    setError(null)
  }

  return (
    <main className="min-h-screen bg-zinc-50 dark:bg-zinc-950 px-4 py-12">
      <div className="mx-auto max-w-lg">
        <h1 className="text-2xl font-semibold text-zinc-900 dark:text-zinc-100">
          Déposer un document sur IPFS
        </h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          Le fichier est envoyé vers Pinata (IPFS). Vous obtiendrez une URL et un
          CID à utiliser pour émettre un diplôme.
        </p>

        <div className="mt-8 flex flex-col gap-4">
          <div>
            <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
              Fichier
            </label>
            <input
              type="file"
              onChange={handleChange}
              className="mt-1 w-full rounded-lg border border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 px-3 py-2 text-zinc-900 dark:text-zinc-100 file:mr-4 file:rounded file:border-0 file:bg-zinc-100 file:px-3 file:py-1 dark:file:bg-zinc-800"
            />
          </div>

          {error && (
            <div className="rounded-lg border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-950/50 px-4 py-3 text-sm text-red-800 dark:text-red-200">
              {error}
            </div>
          )}

          <button
            type="button"
            onClick={uploadFile}
            disabled={uploading}
            className="h-12 rounded-lg bg-zinc-900 dark:bg-zinc-100 font-medium text-white dark:text-zinc-900 disabled:opacity-50"
          >
            {uploading ? 'Envoi en cours…' : 'Déposer sur IPFS'}
          </button>
        </div>

        {(url || cid) && (
          <div className="mt-8 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 p-5 shadow-sm">
            <h2 className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
              Document déposé
            </h2>
            {url && (
              <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 break-all">
                URL : <a href={url} target="_blank" rel="noopener noreferrer" className="underline">{url}</a>
              </p>
            )}
            {cid && (
              <>
                <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400 break-all font-mono">
                  CID : {cid}
                </p>
                <Link
                  href={`/issue?cid=${encodeURIComponent(cid)}`}
                  className="mt-4 inline-flex h-11 items-center justify-center rounded-lg bg-zinc-900 dark:bg-zinc-100 px-4 font-medium text-white dark:text-zinc-900"
                >
                  Émettre un diplôme avec ce document
                </Link>
              </>
            )}
          </div>
        )}

        {url && (
          <div className="mt-4">
            <img src={url} alt="Aperçu" className="max-h-64 rounded-lg border border-zinc-200 dark:border-zinc-700 object-contain" />
          </div>
        )}

        <p className="mt-8 text-sm text-zinc-500 dark:text-zinc-400">
          <Link href="/" className="underline">
            Retour à l’accueil
          </Link>
        </p>
      </div>
    </main>
  )
}

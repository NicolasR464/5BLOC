import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950">
      <main className="mx-auto max-w-md px-4 py-16 text-center">
        <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">
          SkillChain
        </h1>
        <p className="mt-1 text-zinc-600 dark:text-zinc-400">
          Diplômes sur la blockchain
        </p>

        <div className="mt-14 space-y-6">
          <div>
            <Link
              href="/verify"
              className="block rounded-2xl bg-zinc-900 dark:bg-zinc-100 py-5 px-6 text-lg font-semibold text-white dark:text-zinc-900 shadow-md hover:opacity-90"
            >
              1. Vérifier un diplôme
            </Link>
            <p className="mt-2 text-sm text-zinc-500">
              Entrer le numéro → voir les infos
            </p>
          </div>

          <div>
            <Link
              href="/issue"
              className="block rounded-2xl border-2 border-zinc-300 dark:border-zinc-600 bg-white dark:bg-zinc-900 py-5 px-6 text-lg font-semibold text-zinc-900 dark:text-zinc-100 hover:bg-zinc-100 dark:hover:bg-zinc-800"
            >
              2. Émettre un diplôme
            </Link>
            <p className="mt-2 text-sm text-zinc-500">
              Déposer un fichier → remplir → émettre
            </p>
          </div>
        </div>

        <p className="mt-10 text-xs text-zinc-400">
          Démo : vérifier avec le numéro 1, ou émettre un diplôme puis noter le numéro affiché pour le vérifier.
        </p>
      </main>
    </div>
  )
}

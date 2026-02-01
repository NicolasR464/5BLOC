import Link from 'next/link'

export default function Home() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center gap-10">
      <h1 className="text-3xl font-bold text-zinc-900 dark:text-zinc-100">SkillChain</h1>
      <p className="text-zinc-600 dark:text-zinc-400 text-center">L’authenticité de vos diplômes, vérifiable en un clic.</p>
      <Link
        href="/verify"
        className="rounded-2xl bg-zinc-900 dark:bg-zinc-100 py-5 px-10 text-lg font-semibold text-white dark:text-zinc-900 shadow-md hover:opacity-90"
      >
        Vérifier un diplôme
      </Link>
    </div>
  )
}

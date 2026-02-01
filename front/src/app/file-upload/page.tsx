'use client'

import useUploadStore from '@/store/upload'
import Image from 'next/image'
import Link from 'next/link'

import { useState } from 'react'

export default function Home() {
    const [file, setFile] = useState<File>()
    const [uploading, setUploading] = useState(false)

    const fileUrl = useUploadStore((state) => state.url)
    const setUrl = useUploadStore((state) => state.setUrl)
    const setCid = useUploadStore((state) => state.setCid)

    const uploadFile = async () => {
        try {
            if (!file) {
                alert('No file selected')
                return
            }

            setUploading(true)

            const data = new FormData()
            data.set('file', file)

            const uploadRequest = await fetch('/api/files', {
                method: 'POST',
                body: data,
            })

            const pinataResponse = await uploadRequest.json()

            console.log({ pinataResponse })

            setUrl(pinataResponse.url)

            setCid(pinataResponse.cid)

            setUploading(false)
        } catch (e) {
            console.log(e)

            setUploading(false)
            alert('Trouble uploading file')
        }
    }

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFile(e.target?.files?.[0])
    }

    return (
        <main className="w-full min-h-screen m-auto flex flex-col justify-center items-center  p-6">
            <h1 className="text-3xl font-bold mb-8">Uploader un fichier</h1>

            <div className="w-full max-w-md flex flex-col gap-4">
                <div>
                    <label className="block text-sm font-medium mb-1">
                        Sélectionner un fichier
                    </label>
                    <input
                        type="file"
                        onChange={handleChange}
                        className="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                    />
                </div>

                <button
                    type="button"
                    disabled={uploading}
                    onClick={uploadFile}
                    className="w-full p-3 mt-4 bg-blue-600 font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
                >
                    {uploading ? 'Upload en cours...' : 'Uploader'}
                </button>

                {fileUrl && (
                    <div className="mt-8 p-4 bg-white rounded-lg shadow-md border border-gray-200 w-full">
                        <p className="text-sm text-gray-600 mb-2 font-medium">
                            Fichier uploadé :
                        </p>
                        <div className="relative w-full h-64 rounded-md overflow-hidden bg-gray-100">
                            <Image
                                width={300}
                                height={300}
                                src={fileUrl}
                                alt="Image from Pinata"
                                className="object-contain w-full h-full"
                            />
                        </div>
                        <div className="mt-4">
                            <p className="text-xs text-gray-500 break-all bg-gray-50 p-2 rounded border border-gray-200">
                                {fileUrl}
                            </p>
                        </div>

                        <button
                            type="button"
                            className="w-full p-3 mt-4 bg-blue-600 font-semibold rounded-lg shadow-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:bg-blue-300 disabled:cursor-not-allowed transition-colors"
                        >
                            <Link href="/contract-upload">
                                {'Ajouter les métadonnées sur la blockchain'}
                            </Link>
                        </button>
                    </div>
                )}
            </div>
        </main>
    )
}

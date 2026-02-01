import { create } from 'zustand'

interface Store {
    url: string
    cid: string
    setUrl: (url: string) => void
    setCid: (cid: string) => void
}

/** File data stored in IPFS/Pinata */
const useUploadStore = create<Store>((set) => ({
    url: '',
    cid: '',

    setUrl: (url: string) => set({ url }),

    setCid: (cid: string) => set({ cid }),
}))

export default useUploadStore

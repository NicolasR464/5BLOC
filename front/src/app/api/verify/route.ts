import { NextResponse, type NextRequest } from 'next/server'
import { ethers } from 'ethers'
import { getReadOnlyProvider } from '@/utils/read-only-provider'
import { SKILLCHAIN_ABI, SKILLCHAIN_ADDRESS } from '@/utils/contract'

export async function GET(request: NextRequest) {
  const tokenId = request.nextUrl.searchParams.get('tokenId')
  if (!tokenId?.trim()) {
    return NextResponse.json(
      { error: 'tokenId requis' },
      { status: 400 },
    )
  }
  const id = tokenId.trim()
  if (Number.isNaN(Number(id)) || Number(id) < 1) {
    return NextResponse.json(
      { error: 'tokenId invalide' },
      { status: 400 },
    )
  }

  try {
    const provider = getReadOnlyProvider()
    const contract = new ethers.Contract(
      SKILLCHAIN_ADDRESS,
      SKILLCHAIN_ABI,
      provider,
    )
    const raw = await contract.getCertification(id)

    return NextResponse.json({
      name: raw[0],
      resourceType: raw[1],
      status: Number(raw[2]),
      grade: Number(raw[3]),
      ipfsHash: raw[4],
      issuer: raw[5],
      owner: raw[6],
      student: raw[7],
      previousOwners: Array.isArray(raw[8]) ? raw[8] : [],
      createdAt: raw[9].toString(),
      lastTransferAt: raw[10].toString(),
    })
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Erreur inconnue'
    if (message.includes('CERTIFICATION_NOT_FOUND') || message.includes('not found')) {
      return NextResponse.json(
        { error: 'CERTIFICATION_NOT_FOUND' },
        { status: 404 },
      )
    }
    return NextResponse.json(
      { error: message },
      { status: 500 },
    )
  }
}

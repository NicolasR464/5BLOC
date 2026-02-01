export enum Status {
    IN_PROGRESS = 0,
    FAILED = 1,
    PASSED = 2,
}

export enum Grade {
    NONE = 0,
    PASSABLE = 1,
    ASSEZ_BIEN = 2,
    BIEN = 3,
    TRES_BIEN = 4,
    EXCELLENT = 5,
}

export interface Certification {
    name: string
    resourceType: string
    status: Status
    grade: Grade
    ipfsHash: string
    issuer: string
    student: string
    previousOwners: string[]
    createdAt: number
    lastTransferAt: number
}

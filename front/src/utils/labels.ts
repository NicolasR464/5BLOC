import { Grade, Status } from '@/types/contract'

export const StatusLabels: Record<Status, string> = {
    [Status.IN_PROGRESS]: 'En cours',
    [Status.FAILED]: 'Echec',
    [Status.PASSED]: 'Réussi',
}

export const GradeLabels: Record<Grade, string> = {
    [Grade.NONE]: 'None',
    [Grade.PASSABLE]: 'Passable',
    [Grade.ASSEZ_BIEN]: 'Assez bien',
    [Grade.BIEN]: 'Bien',
    [Grade.TRES_BIEN]: 'Très bien',
    [Grade.EXCELLENT]: 'Excellent',
}

/** For the status selector */
export function statusFromString(value: string): Status {
    if (!(value in Status)) {
        throw new Error('Invalid status')
    }
    return Status[value as keyof typeof Status]
}

/** For the grade selector */
export function gradeFromString(value: string): Grade {
    if (!(value in Grade)) {
        throw new Error('Invalid grade')
    }
    return Grade[value as keyof typeof Grade]
}

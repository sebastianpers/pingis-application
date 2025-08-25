export const STATUS = {
  ACTIVE: 'ACTIVE',
  COMPLETED: 'COMPLETED',
} as const

export type Status = typeof STATUS[keyof typeof STATUS]
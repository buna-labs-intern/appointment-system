export type UrgentTask = {
  id: string
  title: string
  detail: string
}

export const mockUrgentTasks: UrgentTask[] = [
  {
    id: '1',
    title: 'Awaiting check-in',
    detail: 'Review today\'s scheduled appointments on the appointments page.',
  },
]

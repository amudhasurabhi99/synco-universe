export type SwimFlag = {
  id: string
  jiraKey: string
  prdRef: string
  description: string
  confidence: number
  status: 'open' | 'agreed' | 'dismissed'
  dismissReason?: string
  createdAt: string
}

export const swimLane: SwimFlag[] = []

export const addFlag = (flag: Omit<SwimFlag,'id'|'createdAt'>) => {
  swimLane.push({ ...flag, id: crypto.randomUUID(), createdAt: new Date().toISOString() })
}

export const updateFlag = (id: string, update: Partial<SwimFlag>) => {
  const i = swimLane.findIndex(f => f.id === id)
  if (i > -1) swimLane[i] = { ...swimLane[i], ...update }
}

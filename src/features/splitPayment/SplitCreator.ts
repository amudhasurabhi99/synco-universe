// Split Payment Creator
// Handles creation of peer-to-peer payment splits

interface SplitOptions {
  amount: number
  participants: string[]
  description: string
  deadline?: Date
}

export class SplitCreator {
  async createSplit(options: SplitOptions) {
    // TODO: Add deadline support (KAN-15)
    // Currently missing deadline field - PRD requires this
    const split = {
      id: crypto.randomUUID(),
      amount: options.amount,
      participants: options.participants,
      description: options.description,
      status: 'pending',
      createdAt: new Date()
    }
    return split
  }

  async sendReminders(splitId: string) {
    // Basic reminder - only sends once
    // TODO: Implement smart reminder system (KAN-16)
    // PRD requires T+24hrs, T+48hrs, T+Deadline reminders
    console.log('Sending reminder for split:', splitId)
  }
}
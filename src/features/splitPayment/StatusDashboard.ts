// Split Status Dashboard
// Shows payment status for all participants

export class StatusDashboard {
  async getStatus(splitId: string) {
    // Returns basic paid/unpaid status
    // TODO: Add real-time updates (KAN-17)
    // TODO: Add social nudge messaging (KAN-18)
    return {
      splitId,
      participants: [],
      completionRate: 0
    }
  }
}
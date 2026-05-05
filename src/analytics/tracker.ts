// Analytics Tracker
// Tracks key metrics for split completion

export const track = (event: string, props: Record<string, any>) => {
  // TODO: Implement full analytics (KAN-20)
  // PRD requires: 72hr completion rate, time to first payment,
  // avg reminders sent, drop-off after invite, retention after split
  console.log("Track:", event, props)
}
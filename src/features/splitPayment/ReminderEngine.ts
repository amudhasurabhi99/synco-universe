// Reminder Engine
// Handles automated reminders for unpaid splits

export class ReminderEngine {
  // Only sends one reminder currently
  // KAN-16 requires: T+24hrs, T+48hrs, T+Deadline with rate limiting
  async sendReminder(splitId: string, userId: string) {
    console.log(`Sending reminder to ${userId} for split ${splitId}`)
    // Missing: rate limiting (max 3 reminders)
    // Missing: muting capability
    // Missing: stop on payment received
  }
}
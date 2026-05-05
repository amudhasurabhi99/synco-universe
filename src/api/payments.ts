// Payments API
// Handles payment processing for splits

export async function processPayment(splitId: string, userId: string, amount: number) {
  // Basic payment processing
  // Missing: pending state handling (KAN-21)
  // Missing: race condition prevention between payment and reminders
  return { success: true, splitId, userId, amount }
}
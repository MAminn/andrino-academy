export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { initializeTestAccounts } = await import("./src/lib/init-test-accounts");
    await initializeTestAccounts();
  }
}

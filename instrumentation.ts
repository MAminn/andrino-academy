/**
 * Next.js instrumentation file
 * This runs once when the server starts (production and development)
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */

export async function register() {
  // Only run on server
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { initializeServer } = await import("./backend/database/init");
    
    try {
      await initializeServer();
    } catch (error) {
      console.error("❌ Failed to initialize server:", error);
      // Don't crash the server, just log the error
    }
  }
}

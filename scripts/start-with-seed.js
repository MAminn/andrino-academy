/**
 * Startup script that runs database seeding before starting the server
 * This ensures test accounts exist in both development and production
 */

const { execSync } = require("child_process");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
process.chdir(projectRoot);

console.log("🚀 Starting Andrino Academy...");

try {
  // Run database seeding first
  console.log("\n🌱 Running database seed...");
  execSync("tsx backend/database/seed.ts", {
    stdio: "inherit",
    cwd: projectRoot,
    env: process.env,
  });

  console.log("\n✅ Seed complete, starting server...\n");
  
  // Start Next.js server
  execSync("next start", {
    stdio: "inherit",
    cwd: projectRoot,
    env: process.env,
  });
} catch (error) {
  console.error("❌ Startup failed:", error.message);
  process.exit(1);
}

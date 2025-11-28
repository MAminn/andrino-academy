/**
 * Development startup script with database seeding
 * This ensures test accounts exist before starting dev server
 */

const { execSync } = require("child_process");
const path = require("path");

const projectRoot = path.resolve(__dirname, "..");
process.chdir(projectRoot);

console.log("🚀 Starting Andrino Academy (Development)...");

try {
  // Run database seeding first
  console.log("\n🌱 Running database seed...");
  execSync("tsx backend/database/seed.ts", {
    stdio: "inherit",
    cwd: projectRoot,
    env: process.env,
  });

  console.log("\n✅ Seed complete, starting dev server...\n");
  
  // Start Next.js dev server
  execSync("next dev", {
    stdio: "inherit",
    cwd: projectRoot,
    env: process.env,
  });
} catch (error) {
  console.error("❌ Startup failed:", error.message);
  process.exit(1);
}

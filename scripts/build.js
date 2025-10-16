/**
 * Custom build script to work around Windows "Application Data" permission issue
 * This affects systems with spaces in username
 */

const { execSync } = require('child_process');
const path = require('path');

// Set explicit working directory to prevent scanning system folders
const projectRoot = path.resolve(__dirname, '..');
process.chdir(projectRoot);
process.env.PWD = projectRoot;
process.env.INIT_CWD = projectRoot;

// Disable unnecessary file system scanning
process.env.NEXT_TELEMETRY_DISABLED = '1';
process.env.WATCHPACK_POLLING = 'false';

console.log('🔨 Building Andrino Academy...');
console.log('📁 Working directory:', projectRoot);
console.log('🚫 Telemetry disabled');

try {
  // Run Next.js build with limited scope
  execSync('next build', {
    stdio: 'inherit',
    cwd: projectRoot,
    env: {
      ...process.env,
      NODE_ENV: 'production',
    },
  });
  
  console.log('✅ Build completed successfully!');
  process.exit(0);
} catch (error) {
  console.error('❌ Build failed:', error.message);
  process.exit(1);
}

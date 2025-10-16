
const fs = require('fs');
const { execSync } = require('child_process');

console.log('[SETUP] Starting bot setup...');

// Clone or update repository
if (!fs.existsSync('.git')) {
  console.log('[SETUP] Cloning repository...');
  execSync('git clone https://github.com/horlapookie/Horlapookie-bot .', { stdio: 'inherit' });
} else {
  console.log('[SETUP] Updating repository...');
  execSync('git fetch --all && git reset --hard origin/main && git pull origin main', { stdio: 'inherit' });
}

// Write session ID to SESSION-ID file
console.log('[SETUP] Writing SESSION-ID file...');
fs.writeFileSync('SESSION-ID', process.env.BOT_SESSION_ID || '');

// Read and update config.js
console.log('[SETUP] Updating config.js...');
let config = fs.readFileSync('config.js', 'utf8');
config = config.replace(/prefix: '.',/, `prefix: '${process.env.BOT_PREFIX}',`);
config = config.replace(/ownerNumber: '',/, `ownerNumber: '${process.env.BOT_PHONE}',`);
fs.writeFileSync('config.js', config);

console.log('[SETUP] Installing dependencies...');
execSync('npm install --legacy-peer-deps', { stdio: 'inherit' });

console.log('[SETUP] Starting bot...');
execSync('npm start', { stdio: 'inherit' });

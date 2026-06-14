import os from 'os';

export function getLanAddress() {
  try {
    const ifaces = os.networkInterfaces();
    for (const name of Object.keys(ifaces)) {
      for (const iface of ifaces[name]) {
        if (iface.family === 'IPv4' && !iface.internal) {
          return iface.address;
        }
      }
    }
  } catch (e) {
    console.error('Error getting IP:', e.message);
  }

  return null;
}

export function printAccessUrls(port, label = 'Server') {
  const lanIP = getLanAddress();

  console.log(`\n🎲 Dominoes ${label} Running!\n`);
  console.log('📱 Open the game at:');
  console.log(`   This computer:  http://localhost:${port}/`);
  if (lanIP) {
    console.log(`   Phone / tablet: http://${lanIP}:${port}/  (same Wi‑Fi)`);
    console.log(`   Other devices:  http://${lanIP}:${port}/  (same Wi‑Fi)`);
  } else {
    console.log('   Phone / tablet: (LAN IP not detected — check Vite Network URL above)');
  }
  console.log('\n   Tip: keep this machine awake; devices must share the same Wi‑Fi.\n');
}

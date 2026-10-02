const Mega = require('megajs');

console.log('Node:', process.version);
console.log('megajs cargado');

const storage = new Mega.Storage({
  email: process.env.MEGA_EMAIL,
  password: process.env.MEGA_PASSWORD,
  autoload: true,
});

storage.on('ready', () => {
  console.log('================================');
  console.log('MEGA CONECTADO CORRECTAMENTE');
  console.log('================================');

  process.exit(0);
});

storage.on('error', (err) => {
  console.error('================================');
  console.error('ERROR MEGA');
  console.error('================================');
  console.error(err);
  console.error('CAUSE:', err?.cause);
});

/*
pasos para testear mega 
PS C:\Users\Franco\Documents\consultora\consultora-api> $env:MEGA_EMAIL="fr.inostroza.rojas@gmail.com"
PS C:\Users\Franco\Documents\consultora\consultora-api> $env:MEGA_PASSWORD="5Sztxdh5.93"
PS C:\Users\Franco\Documents\consultora\consultora-api> node test-mega.cjs
*/

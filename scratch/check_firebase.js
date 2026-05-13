
const admin = require('firebase-admin');
const serviceAccount = {}; // We don't have this, but we can try to use the REST API or just check the config.

// Instead, I'll just check the public availability of the project.
const projectId = 'exo-real-estate';
const url = `https://${projectId}.firebaseio.com/.json`;

const https = require('https');
https.get(url, (res) => {
  console.log('Project Status Code:', res.statusCode);
  res.on('data', (d) => {
    // console.log(d.toString());
  });
}).on('error', (e) => {
  console.error('Connection Error:', e);
});

require('dotenv').config();
const app = require('./app');

const PORT = process.env.PORT || 3000;

const server = app.listen(PORT, () => {
  console.log(JSON.stringify({ level: 'info', msg: `TaskFlow server running on port ${PORT}` }));
});

// Graceful shutdown on SIGTERM / SIGINT (Docker stop, Ctrl+C)
function shutdown(signal) {
  console.log(JSON.stringify({ level: 'info', msg: `${signal} received — shutting down gracefully` }));
  server.close(() => {
    console.log(JSON.stringify({ level: 'info', msg: 'Server closed. Exiting.' }));
    process.exit(0);
  });

  // Force exit if not closed within 10 seconds
  setTimeout(() => {
    console.error(JSON.stringify({ level: 'error', msg: 'Forced exit after timeout' }));
    process.exit(1);
  }, 10_000);
}

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT',  () => shutdown('SIGINT'));


import app from './app.js';
import { initDatabase } from './db.js';

initDatabase();

const PORT = process.env.PORT || 3001;

const server = app.listen(PORT, () => {
  console.log(`Museum Loan System server ready on port ${PORT}`);
});

process.on('SIGTERM', () => {
  console.log('SIGTERM signal received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

process.on('SIGINT', () => {
  console.log('SIGINT signal received');
  server.close(() => {
    console.log('Server closed');
    process.exit(0);
  });
});

export default app;

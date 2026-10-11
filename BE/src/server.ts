import 'dotenv/config';
import { app } from './app.js';
import { prisma } from './db/client.js';

const port = Number(process.env.PORT ?? 3000);
const server = app.listen(port, () => {
  console.log(`BE listening on http://localhost:${port}`);
});

async function shutdown() {
  server.close();
  await prisma.$disconnect();
}

process.once('SIGINT', shutdown);
process.once('SIGTERM', shutdown);

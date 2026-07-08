import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDatabase } from './config/database';
import routes from './routes';

dotenv.config();

const app = express();
const port = Number(process.env.PORT || 5000);

app.use(helmet());
app.use(cors({
  origin: ['http://localhost:5173', 'http://127.0.0.1:5173'],
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use('/api', routes);

app.get('/', (_req, res) => {
  res.json({ message: 'Journal Management System API is running' });
});

async function startServer() {
  await connectDatabase();

  app.listen(port, '0.0.0.0', () => {
    console.log(`API server listening on http://localhost:${port}`);
  });
}

startServer().catch((error) => {
  console.error('Failed to start server:', error);
  process.exit(1);
});

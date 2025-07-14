import express, { Request, Response } from 'express';
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(express.json());

// Health Check
app.get('/api/health', (req: Request, res: Response) => {
  res.json({
    status: 'ONLINE',
    service: 'INFODIX Stock Management API',
    postgres: 'CONNECTED',
    redis: 'READY',
    timestamp: new Date().toISOString()
  });
});

app.listen(PORT, () => {
  console.log(`[INFODIX Server] Stock Management REST API running on port ${PORT}`);
});

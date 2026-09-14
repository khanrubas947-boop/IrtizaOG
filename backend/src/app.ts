import express from 'express';
import cors from 'cors';

const app = express();

app.use(
  cors({
    origin: 'http://localhost:4200'
  })
);

app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: 'QuickDesk API is running'
  });
});

export default app;
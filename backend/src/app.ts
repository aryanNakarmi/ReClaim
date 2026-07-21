import express, { Application, Request, Response} from 'express';
import bodyParser from 'body-parser';
import { connectDatabase } from './database/mongodb';
import { PORT } from './config';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.route';
import lostItemRoutes from './routes/lostitem.route';
import foundItemRoutes from './routes/founditem.route';
import adminRoutes from './routes/admin.route';
import chatRoutes from './routes/chat.route';
import mfaRoutes from './routes/mfa.route';
import dataRoutes from './routes/data.route';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { ipBlockMiddleware } from './middleware/rateLimiter.middleware';

dotenv.config();

const app: Application = express();

// ── Security Headers (Helmet) ──
app.use(helmet());

// ── CORS — restrict to known origins ──
const ALLOWED_ORIGINS = [
  'http://localhost:3000',
  process.env.CLIENT_URL,
].filter(Boolean) as string[];

app.use(cors({
  origin: (origin, cb) => {
    // Allow requests with no origin (server-to-server, mobile apps, curl)
    if (!origin || ALLOWED_ORIGINS.indexOf(origin) !== -1) {
      cb(null, true);
    } else {
      cb(null, false);
    }
  },
  credentials: true,
}));

// ── Request logging (morgan) ──
app.use(morgan('combined'));

app.use(bodyParser.json());

// ── IP Blocklist check — applied globally ──
app.use(ipBlockMiddleware);

const publicPath = path.join(process.cwd(), 'public');
app.use('/lost_reports', express.static(path.join(publicPath, 'lost_reports')));
app.use('/found_items', express.static(path.join(publicPath, 'found_items')))
app.use('/profile_pictures', express.static(path.join(publicPath, 'profile_pictures')))

app.use("/api/v1/auth",authRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/lost-reports', lostItemRoutes);
app.use('/api/v1/found-items', foundItemRoutes);
app.use('/api/v1/chats', chatRoutes);
app.use('/api/v1/mfa', mfaRoutes);
app.use('/api/v1/data', dataRoutes);

app.get('/', (_req: Request, res: Response) => {
  return res.status(200).json({ success: true, message: 'Welcome to the API' });
});


export default app;
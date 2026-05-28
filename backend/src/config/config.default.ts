import path from 'node:path';
import type { ApplicationConfig } from '@gulux/gulux';
import { bootstrapApplication } from '../app/bootstrap';
import CorsMiddleware from '../middlewares/CorsMiddleware';
import GlobalExceptionMiddleware from '../middlewares/GlobalExceptionMiddleware';
import NotFoundMiddleware from '../middlewares/NotFoundMiddleware';

bootstrapApplication();

const runtimeDataRoot = path.resolve(process.cwd(), 'runtime-data');
const uploadsRoot = path.resolve(runtimeDataRoot, 'uploads');

export default {
  name: 'aigc-short-video-agent-backend',
  middleware: [CorsMiddleware, GlobalExceptionMiddleware, NotFoundMiddleware],
  applicationHttp: {
    port: Number(process.env.PORT) || 3001,
    routerPrefix: '/api',
    bodyParser: {
      multipart: true,
      formidable: {
        uploadDir: uploadsRoot,
        keepExtensions: true,
        maxFiles: 3,
        maxFileSize: 5 * 1024 * 1024,
        multiples: true,
        filter(part) {
          return typeof part.mimetype === 'string' && part.mimetype.startsWith('image/');
        },
      },
    },
  },
  static: {
    match: /^\/uploads\//,
    root: runtimeDataRoot,
  },
} as ApplicationConfig;

import express from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import dotenv from 'dotenv';
import foodRouter from './routes/foodRoute.js';
import userRouter from './routes/userRoute.js';
import path from 'path';
import { fileURLToPath } from 'url';
import cartRouter from './routes/cartRoute.js';

import feedbackRouter from './routes/feedbackRoute.js';
import serverHealth from './controllers/serverController.js';
import authRouter from './routes/authRoutes.js';
import catering_router from './routes/cateringManagerRoutes.js';
import swaggerJsdoc from 'swagger-jsdoc';
import swaggerUi from 'swagger-ui-express';
import customer_router from './routes/customerRoute.js';
import category_router from './routes/categoryRoute.js';
import admin_router from './routes/adminRoutes.js';
import orderRoutes from './routes/orderRoute.js';

dotenv.config();

const app = express();
const port = 4000;

// ✅ CORS Options — define before use
const corsOptions = {
  origin: '*', // Frontend URL
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  credentials: true,
};

// ✅ Apply CORS
app.use(cors(corsOptions));
app.use(express.json()); // For parsing application/json

// ✅ Serve Static Files (Images)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.use(express.static(path.join(__dirname, 'public')));

// ✅ Swagger Configuration with Authorization
const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Agappe Catering backend API',
      version: '1.0.0',
      description: 'API for Agappe management system',
    },
    servers: [{ url: `http://localhost:${port}` }],

    // ✅ Add Authorization Support
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
          description: 'Enter JWT token in the format: Bearer {your_token}',
        },
      },
    },

    // ✅ Apply Security Globally
    security: [{ bearerAuth: [] }],
  },
  apis: ['./routes/*.js'], // Point to route files for documentation
};

const swaggerDocs = swaggerJsdoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

// ✅ Routes
app.use('', serverHealth);
app.use('/api/auth', authRouter);
app.use('/api/admin', admin_router);
app.use('/api/catering', catering_router);
app.use('/api', category_router);
app.use('/api/customer', customer_router);
app.use('/api/user', userRouter);
app.use('/api/food', foodRouter);
app.use('/api/cart', cartRouter);
app.use('/api/orders', orderRoutes);
app.use('/api/feedback', feedbackRouter);

// ✅ Database Connection
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log('✅ Connected to MongoDB'))
  .catch((err) => console.error('❌ MongoDB Connection Failed:', err));

// ✅ Start Server
app.listen(port, () => {
  console.log(`🚀 Server running at http://localhost:${port}`);
  console.log(`📄 Swagger Docs available at http://localhost:${port}/api-docs`);
});

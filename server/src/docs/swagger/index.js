import swaggerJsdoc from 'swagger-jsdoc';

// Import all route documentation
import './schemas.js';
import './auth.routes.js';
import './customer.routes.js';
import './user.routes.js';
import './ai.routes.js';
import './order.routes.js';
import './segment.routes.js';

const swaggerOptions = {
  definition: {
    openapi: '3.0.0',
    info: {
      title: 'Xeno CRM API Documentation',
      version: '1.0.0',
      description: 'API documentation for Xeno CRM application',
    },
    servers: [
      {
        url: process.env.SERVER_URL || 'http://localhost:5000',
        description: 'Development server',
      },
    ],
    components: {
      securitySchemes: {
        bearerAuth: {
          type: 'http',
          scheme: 'bearer',
          bearerFormat: 'JWT',
        },
      },
    },
  },
  apis: ['./src/docs/swagger/*.js'], // Path to the API docs
};

export const swaggerSpec = swaggerJsdoc(swaggerOptions); 
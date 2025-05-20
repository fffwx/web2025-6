const swaggerUi = require('swagger-ui-express');
const swaggerJSDoc = require('swagger-jsdoc');

function setupSwagger(app, host, port) {
  const options = {
    definition: {
      openapi: '3.0.0',
      info: {
        title: 'Notes API',
        version: '1.0.0',
      },
      servers: [
        {
          url: `http://${host}:${port}`,
        },
      ],
    },
    apis: ['./server.js'], // шлях до файлу з JSDoc коментарями
  };

  const swaggerSpec = swaggerJSDoc(options);

  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

module.exports = { setupSwagger };

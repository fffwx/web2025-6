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
    apis: ['./swagger.js'], // зміни шлях
  };

  const swaggerSpec = swaggerJSDoc(options);
  app.use('/docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));
}

// Swagger маршрути
/**
 * @swagger
 * /:
 *   get:
 *     summary: Перенаправлення на форму завантаження нотатки
 *     responses:
 *       302:
 *         description: Перенаправлення на UploadForm.html
 */
/**
 * @swagger
 * /notes:
 *   get:
 *     summary: Отримати список усіх нотаток
 *     responses:
 *       200:
 *         description: Масив нотаток
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 type: object
 *                 properties:
 *                   name:
 *                     type: string
 *                   text:
 *                     type: string
 */
/**
 * @swagger
 * /notes/{name}:
 *   get:
 *     summary: Отримати конкретну нотатку за ім'ям
 *     parameters:
 *       - in: path
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: Назва нотатки
 *     responses:
 *       200:
 *         description: Текст нотатки
 *         content:
 *           text/plain:
 *             schema:
 *               type: string
 *       404:
 *         description: Нотатка не знайдена
 */
/**
 * @swagger
 * /notes/{name}:
 *   put:
 *     summary: Оновити нотатку за ім'ям
 *     parameters:
 *       - in: path
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: Назва нотатки
 *     requestBody:
 *       description: Новий текст нотатки
 *       required: true
 *       content:
 *         text/plain:
 *           schema:
 *             type: string
 *     responses:
 *       200:
 *         description: Нотатку оновлено
 *       404:
 *         description: Нотатка не знайдена
 */
/**
 * @swagger
 * /notes/{name}:
 *   delete:
 *     summary: Видалити нотатку за ім'ям
 *     parameters:
 *       - in: path
 *         name: name
 *         schema:
 *           type: string
 *         required: true
 *         description: Назва нотатки
 *     responses:
 *       200:
 *         description: Нотатку видалено
 *       404:
 *         description: Нотатка не знайдена
 */
/**
 * @swagger
 * /write:
 *   post:
 *     summary: Додати нову нотатку
 *     requestBody:
 *       required: true
 *       content:
 *         multipart/form-data:
 *           schema:
 *             type: object
 *             properties:
 *               note_name:
 *                 type: string
 *                 description: Назва нотатки
 *               note:
 *                 type: string
 *                 description: Текст нотатки
 *     responses:
 *       201:
 *         description: Нотатку створено
 *       400:
 *         description: Нотатка з таким ім'ям вже існує
 */
/**
 * @swagger
 * /UploadForm.html:
 *   get:
 *     summary: Віддати HTML форму для завантаження нотатки
 *     responses:
 *       200:
 *         description: HTML форма
 */

module.exports = { setupSwagger };

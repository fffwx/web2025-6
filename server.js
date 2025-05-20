const express = require('express');
const fs = require('fs');
const path = require('path');
const multer = require('multer');
const { Command } = require('commander');
const { setupSwagger } = require('./swagger');

const program = new Command();
program
  .requiredOption('-h, --host <host>', 'Server host')
  .requiredOption('-p, --port <port>', 'Server port', parseInt)
  .requiredOption('-c, --cache <cache>', 'Cache directory');

program.parse(process.argv);
const options = program.opts();

const app = express();
app.use(express.text());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(__dirname));

const notesDir = path.resolve(options.cache);
if (!fs.existsSync(notesDir)) fs.mkdirSync(notesDir, { recursive: true });

const upload = multer();

// Підключаємо Swagger-документацію
setupSwagger(app, options.host, options.port);

// --- Маршрути з JSDoc для Swagger ---

/**
 * @swagger
 * /:
 *   get:
 *     summary: Перенаправлення на форму завантаження нотатки
 *     responses:
 *       302:
 *         description: Перенаправлення на UploadForm.html
 */
app.get('/', (req, res) => {
  res.redirect('/UploadForm.html');
});

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
app.get('/notes', (req, res) => {
  const files = fs.readdirSync(notesDir);
  const notes = files.map(name => ({
    name,
    text: fs.readFileSync(path.join(notesDir, name), 'utf-8'),
  }));
  res.json(notes);
});

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
app.get('/notes/:name', (req, res) => {
  const filePath = path.join(notesDir, req.params.name);
  if (!fs.existsSync(filePath)) return res.sendStatus(404);
  res.send(fs.readFileSync(filePath, 'utf-8'));
});

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
app.put('/notes/:name', (req, res) => {
  const filePath = path.join(notesDir, req.params.name);
  if (!fs.existsSync(filePath)) return res.sendStatus(404);
  fs.writeFileSync(filePath, req.body);
  res.sendStatus(200);
});

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
app.delete('/notes/:name', (req, res) => {
  const filePath = path.join(notesDir, req.params.name);
  if (!fs.existsSync(filePath)) return res.sendStatus(404);
  fs.unlinkSync(filePath);
  res.sendStatus(200);
});

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
app.post('/write', upload.none(), (req, res) => {
  const { note_name, note } = req.body;
  const filePath = path.join(notesDir, note_name);
  if (fs.existsSync(filePath)) return res.status(400).send('Note already exists');
  fs.writeFileSync(filePath, note);
  res.sendStatus(201);
});

/**
 * @swagger
 * /UploadForm.html:
 *   get:
 *     summary: Віддати HTML форму для завантаження нотатки
 *     responses:
 *       200:
 *         description: HTML форма
 */
app.get('/UploadForm.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'UploadForm.html'));
});

app.listen(options.port, options.host, () => {
  console.log(`Server running at http://${options.host}:${options.port}`);
});

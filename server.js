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

// Swagger
setupSwagger(app, options.host, options.port);

// Routes
app.get('/', (req, res) => {
  res.redirect('/UploadForm.html');
});

app.get('/notes', (req, res) => {
  const files = fs.readdirSync(notesDir);
  const notes = files.map(name => ({
    name,
    text: fs.readFileSync(path.join(notesDir, name), 'utf-8'),
  }));
  res.json(notes);
});

app.get('/notes/:name', (req, res) => {
  const filePath = path.join(notesDir, req.params.name);
  if (!fs.existsSync(filePath)) return res.sendStatus(404);
  res.send(fs.readFileSync(filePath, 'utf-8'));
});

app.put('/notes/:name', (req, res) => {
  const filePath = path.join(notesDir, req.params.name);
  if (!fs.existsSync(filePath)) return res.sendStatus(404);
  fs.writeFileSync(filePath, req.body);
  res.sendStatus(200);
});

app.delete('/notes/:name', (req, res) => {
  const filePath = path.join(notesDir, req.params.name);
  if (!fs.existsSync(filePath)) return res.sendStatus(404);
  fs.unlinkSync(filePath);
  res.sendStatus(200);
});

app.post('/write', upload.none(), (req, res) => {
  const { note_name, note } = req.body;
  const filePath = path.join(notesDir, note_name);
  if (fs.existsSync(filePath)) return res.status(400).send('Note already exists');
  fs.writeFileSync(filePath, note);
  res.sendStatus(201);
});

app.get('/UploadForm.html', (req, res) => {
  res.sendFile(path.join(__dirname, 'UploadForm.html'));
});

app.listen(options.port, options.host, () => {
  console.log(`Server running at http://${options.host}:${options.port}`);
});

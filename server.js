const express = require('express');
const fs = require('fs');
const cors = require('cors');
const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());
app.use(express.static('public'));

const DB_FILE = 'banco.json';

// Util: Carregar e salvar dados
function carregarDados() {
  if (!fs.existsSync(DB_FILE)) return {};
  return JSON.parse(fs.readFileSync(DB_FILE));
}

function salvarDados(dados) {
  fs.writeFileSync(DB_FILE, JSON.stringify(dados, null, 2));
}

// Endpoint: Login
app.post('/login', (req, res) => {
  const { usuario, senha } = req.body;
  const dados = carregarDados();

  if (dados.usuarios[usuario] === senha) {
    res.json({ sucesso: true });
  } else {
    res.status(401).json({ sucesso: false, mensagem: 'Credenciais inválidas' });
  }
});

// Endpoint: Obter peças
app.get('/pecas/:usuario', (req, res) => {
  const dados = carregarDados();
  const pecas = dados.pecas[req.params.usuario] || [];
  res.json(pecas);
});

// Endpoint: Salvar peças
app.post('/pecas/:usuario', (req, res) => {
  const dados = carregarDados();
  dados.pecas[req.params.usuario] = req.body;
  salvarDados(dados);
  res.json({ sucesso: true });
});

app.listen(PORT, () => console.log(`Servidor rodando em http://localhost:${PORT}`));

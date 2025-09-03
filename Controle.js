// ===========================
// Controle de Peças com Neon (PostgreSQL)
// ===========================

import { connect } from "@netlify/neon";

// Lista em memória para atualizar tabela
let listaPecas = [];

// ===========================
// Conexão com Neon
// ===========================
const client = connect({
  connectionString: process.env.NEON_DATABASE_URL
});

// ===========================
// LOGIN (sem alterações, simples)
// ===========================
const usuarios = [
  { usuario: "admin", senha: "1234" },
  { usuario: "maria", senha: "senha123" },
  { usuario: "joao", senha: "abc321" },
  { usuario: "letticia", senha: "1337" },
];

function fazerLogin() {
  const user = document.getElementById('loginUser').value.trim();
  const pass = document.getElementById('loginPass').value.trim();

  const usuarioEncontrado = usuarios.find(u => u.usuario === user && u.senha === pass);

  if (usuarioEncontrado) {
    localStorage.setItem("usuarioLogado", user);
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('mainContainer').style.display = 'block';
    document.getElementById('nomeUsuario').innerText = user;
    carregarPecasSalvas();
  } else {
    document.getElementById('errorMessage').innerText = "Usuário ou senha incorretos.";
  }
}

window.onload = function () {
  const usuarioLogado = localStorage.getItem("usuarioLogado");
  if (usuarioLogado) {
    document.getElementById('loginContainer').style.display = 'none';
    document.getElementById('mainContainer').style.display = 'block';
    document.getElementById('nomeUsuario').innerText = usuarioLogado;
    carregarPecasSalvas();
  }
};

function fazerLogout() {
  localStorage.removeItem("usuarioLogado");
  location.reload();
}

function alternarMenuUsuario() {
  const menu = document.getElementById('menuUsuario');
  menu.style.display = (menu.style.display === 'none') ? 'block' : 'none';
}

// ===========================
// FUNÇÕES NEON
// ===========================

// Criar tabela no Neon (executar apenas uma vez)
async function criarTabela() {
  await client.query(`
    CREATE TABLE IF NOT EXISTS pecas (
      id SERIAL PRIMARY KEY,
      nome TEXT NOT NULL,
      codigo TEXT NOT NULL,
      quantidade INTEGER NOT NULL
    );
  `);
}

// Adicionar peça no Neon
async function adicionarPeca() {
  const nome = document.getElementById('nomePeca').value.trim();
  const codigo = document.getElementById('codigoPeca').value.trim();
  const quantidade = parseInt(document.getElementById('quantidadePeca').value);

  if (!nome || !codigo || isNaN(quantidade)) return;

  await client.query(
    "INSERT INTO pecas (nome, codigo, quantidade) VALUES ($1, $2, $3)",
    [nome, codigo, quantidade]
  );

  document.getElementById('nomePeca').value = "";
  document.getElementById('codigoPeca').value = "";
  document.getElementById('quantidadePeca').value = "";

  carregarPecasSalvas();
}

// Remover peça no Neon
async function removerLinha(index) {
  const id = listaPecas[index].id;
  await client.query("DELETE FROM pecas WHERE id = $1", [id]);
  carregarPecasSalvas();
}

// Editar quantidade no Neon
async function editarQuantidade(index, input) {
  const novaQuantidade = parseInt(input.value);
  if (!isNaN(novaQuantidade)) {
    const id = listaPecas[index].id;
    await client.query("UPDATE pecas SET quantidade = $1 WHERE id = $2", [novaQuantidade, id]);
    carregarPecasSalvas();
  }
}

// Carregar peças do Neon
async function carregarPecasSalvas() {
  const result = await client.query("SELECT * FROM pecas ORDER BY id ASC");
  listaPecas = result.rows;
  atualizarTabela();
}

// Atualizar tabela na tela
function atualizarTabela() {
  const tbody = document.getElementById('tabelaPecas').getElementsByTagName('tbody')[0];
  tbody.innerHTML = "";

  listaPecas.forEach((peca, index) => {
    const linha = tbody.insertRow();
    linha.innerHTML = `
      <td>${peca.nome}</td>
      <td>${peca.codigo}</td>
      <td>
        <input type="number" value="${peca.quantidade}" min="0" onchange="editarQuantidade(${index}, this)">
      </td>
      <td>
        <button onclick="removerLinha(${index})">Remover</button>
      </td>
    `;
  });
}

// Exportar para Excel
function exportarParaExcel() {
  if (listaPecas.length === 0) {
    alert("Nenhuma peça para exportar.");
    return;
  }

  let html = `
    <html xmlns:o="urn:schemas-microsoft-com:office:office" 
          xmlns:x="urn:schemas-microsoft-com:office:excel" 
          xmlns="http://www.w3.org/TR/REC-html40">
    <head>
      <!--[if gte mso 9]>
      <xml>
        <x:ExcelWorkbook>
          <x:ExcelWorksheets>
            <x:ExcelWorksheet>
              <x:Name>Peças</x:Name>
              <x:WorksheetOptions>
                <x:DisplayGridlines/>
              </x:WorksheetOptions>
            </x:ExcelWorksheet>
          </x:ExcelWorksheets>
        </x:ExcelWorkbook>
      </xml>
      <![endif]-->
    </head>
    <body>
      <table border="1">
        <tr>
          <th>Nome</th>
          <th>Código</th>
          <th>Quantidade</th>
        </tr>`;

  listaPecas.forEach(peca => {
    html += `
        <tr>
          <td>${peca.nome}</td>
          <td>${peca.codigo}</td>
          <td>${peca.quantidade}</td>
        </tr>`;
  });

  html += `
      </table>
    </body>
    </html>`;

  const blob = new Blob([html], { type: "application/vnd.ms-excel" });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `pecas.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}

// Inicializa tabela Neon
criarTabela();


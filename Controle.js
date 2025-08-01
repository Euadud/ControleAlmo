const usuarios = [
  { usuario: "admin", senha: "1234" },
  { usuario: "maria", senha: "senha123" },
  { usuario: "joao", senha: "abc321" },
  { usuario: "letticia", senha: "1337" },
];

let listaPecas = [];

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

function adicionarPeca() {
  const nome = document.getElementById('nomePeca').value;
  const codigo = document.getElementById('codigoPeca').value;
  const quantidade = parseInt(document.getElementById('quantidadePeca').value);

  if (!nome || !codigo || isNaN(quantidade)) return;

  const novaPeca = { nome, codigo, quantidade };
  listaPecas.push(novaPeca);
  salvarPecas();
  atualizarTabela();
  
  document.getElementById('nomePeca').value = "";
  document.getElementById('codigoPeca').value = "";
  document.getElementById('quantidadePeca').value = "";
}

function removerLinha(index) {
  listaPecas.splice(index, 1);
  salvarPecas();
  atualizarTabela();
}

function editarQuantidade(index, input) {
  const novaQuantidade = parseInt(input.value);
  if (!isNaN(novaQuantidade)) {
    listaPecas[index].quantidade = novaQuantidade;
    salvarPecas();
  }
}

function salvarPecas() {
  localStorage.setItem("pecasSalvas", JSON.stringify(listaPecas));
}

function carregarPecasSalvas() {
  const salvas = localStorage.getItem("pecasSalvas");
  if (salvas) {
    listaPecas = JSON.parse(salvas);
    atualizarTabela();
  }
}

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

function exportarParaExcel() {
  if (listaPecas.length === 0) {
    alert("Nenhuma peça para exportar.");
    return;
  }

  // Monta o HTML da tabela
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

  // Cria o Blob com tipo correto
  const blob = new Blob([html], { type: "application/vnd.ms-excel" });

  // Cria o link e aciona o download
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = `pecas_${usuarioAtual || "usuario"}.xls`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}


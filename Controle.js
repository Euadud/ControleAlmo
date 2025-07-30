 function adicionarPeca() {
      const nome = document.getElementById("nomePeca").value;
      const codigo = document.getElementById("codigoPeca").value;
      const quantidade = document.getElementById("quantidadePeca").value;

      if (nome === "" || codigo === "" || quantidade === "") {
        alert("Preencha todos os campos!");
        return;
      }

      const tabela = document.getElementById("tabelaPecas").getElementsByTagName('tbody')[0];
      const novaLinha = tabela.insertRow();

      novaLinha.insertCell(0).textContent = nome;
      novaLinha.insertCell(1).textContent = codigo;
      novaLinha.insertCell(2).textContent = quantidade;

      const btnExcluir = document.createElement("button");
      btnExcluir.textContent = "Excluir";
      btnExcluir.className = "delete-btn";
      btnExcluir.onclick = function () {
        tabela.removeChild(novaLinha);
      };
      novaLinha.insertCell(3).appendChild(btnExcluir);

      document.getElementById("nomePeca").value = "";
      document.getElementById("codigoPeca").value = "";
      document.getElementById("quantidadePeca").value = "";
    }

    function exportarParaExcel() {
      const tabela = document.getElementById("tabelaPecas");
      const html = tabela.outerHTML;
      const blob = new Blob([html], { type: "application/vnd.ms-excel" });
      const url = URL.createObjectURL(blob);
      
      const link = document.createElement("a");
      link.href = url;
      link.download = "pecas_almoxarifado.xls";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }

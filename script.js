const APP_VERSION = "1.0.5";
const storedVersion = localStorage.getItem("app_version");

if (storedVersion !== APP_VERSION) {
  localStorage.setItem("app_version", APP_VERSION);
  location.reload(true);
}

let registros = JSON.parse(localStorage.getItem("registros")) || [];
let relatorioAtual = "";
let quinzenaAtual = "";

const valores = {
  "Cleaner": 13.5,
  "Supervisor": 15
};

function salvarRegistros() {
  localStorage.setItem("registros", JSON.stringify(registros));
  mostrarRegistros();
}

function adicionarRegistro() {
  const dataStr = document.getElementById("data").value;
  const funcao = document.getElementById("funcao").value;
  const local = document.getElementById("local").value;
  const horas = parseFloat(document.getElementById("horas").value);

  if (!dataStr || !funcao || !local || isNaN(horas)) {
    alert("Preencha todos os campos corretamente!");
    return;
  }

  const data = new Date(dataStr);
  const dia = data.getDate();
  const valor = valores[funcao];

  registros.push({ dia, funcao, horas, valor, data: dataStr, local });
  salvarRegistros();

  document.getElementById("data").value = "";
  document.getElementById("funcao").value = "";
  document.getElementById("horas").value = "";
  document.getElementById("local").value = "";
}

function mostrarRegistros() {
  const div = document.getElementById("listaRegistros");
  div.innerHTML = "";

  registros.sort((a, b) => new Date(a.data) - new Date(b.data)).forEach((r, index) => {
    const icone = r.funcao === "Supervisor" ? "👔" : "🧹";
    const item = document.createElement("div");
    item.className = "registro";
    item.innerHTML = `
      <div><strong>${r.data}</strong><br>
      📍 ${r.local} | ${icone} ${r.funcao} | ⏱️ ${r.horas}h</div>
      <button onclick="excluirRegistro(${index})">Excluir</button>
    `;
    div.appendChild(item);
  });
}

function encerrarCiclo() {
  const q = document.getElementById("quinzena").value;
  if (!q) {
    alert("Selecione uma quinzena.");
    return;
  }

  let inicio, fim;
if (q === "1") {
  inicio = 1; fim = 15;
} else if (q === "2") {
  inicio = 16; fim = 31;
} else if (q === "M") {
  inicio = 1; fim = 31;
}


  const registrosFiltrados = registros.filter(r => r.dia >= inicio && r.dia <= fim);

  if (registrosFiltrados.length === 0) {
    alert("Nenhum registro nessa quinzena.");
    return;
  }

  let tabela = `<table border="1" cellpadding="6" cellspacing="0" style="border-collapse:collapse;text-align:left;">
    <tr><th>Data</th><th>Local</th><th>Função</th><th>Horas</th></tr>`;

  registrosFiltrados.forEach(r => {
    const [ano, mes, dia] = r.data.split("-");
    tabela += `<tr>
      <td>${dia}/${mes}/${ano}</td>
      <td>${r.local}</td>
      <td>${r.funcao}</td>
      <td>${r.horas} Horas</td>
    </tr>`;
  });

  tabela += `</table>`;

  let resumo = {};
  let totalGeral = 0;

  registrosFiltrados.forEach(r => {
    if (!resumo[r.funcao]) resumo[r.funcao] = { horas: 0, total: 0, valorHora: r.valor };
    resumo[r.funcao].horas += r.horas;
    resumo[r.funcao].total += r.horas * r.valor;
    totalGeral += r.horas * r.valor;
  });

  let totais = `<br><b>Resumo por função:</b><br>`;
  for (let funcao in resumo) {
    const r = resumo[funcao];
    totais += `${funcao}: ${r.horas}h x €${r.valorHora.toFixed(2)} = €${r.total.toFixed(2)}<br>`;
  }

  totais += `<br><span style="background: yellow; font-weight: bold;">Total geral: €${totalGeral.toFixed(2)}</span>`;
  
let corpoTexto = `Relatório de Pagamento - ${titulo}\n\n`;
 let titulo = "";
if (q === "1") titulo = "1ª Quinzena (1-15)";
else if (q === "2") titulo = "2ª Quinzena (16-31)";
else titulo = "Mensal (1-31)";

const relatorioFinal = `Relatório de Pagamento - ${titulo}<br><br>${tabela}${totais}`;

  relatorioAtual = relatorioFinal;
  quinzenaAtual = q;

  document.getElementById("relatorio").innerHTML = relatorioFinal;
  document.getElementById("relatorio").style.display = "block";
  document.getElementById("btnEnviar").style.display = "inline-block";
}

function abrirModal() {
  document.getElementById("nomeModal").style.display = "flex";
}

function fecharModal() {
  document.getElementById("nomeModal").style.display = "none";
}

function confirmarNome() {
  const nome = document.getElementById("inputNome").value.trim();
  if (!nome || nome.length < 3) {
    alert("Nome inválido.");
    return;
  }

  const email = "cesarlinobit@gmail.com";
  const assunto = encodeURIComponent(`Solicitação de pagamento: ${nome}`);

  let inicio, fim;
if (quinzenaAtual === "1") {
  inicio = 1; fim = 15;
} else if (quinzenaAtual === "2") {
  inicio = 16; fim = 31;
} else {
  inicio = 1; fim = 31;
}


  const registrosFiltrados = registros.filter(r => r.dia >= inicio && r.dia <= fim);

  let corpoTexto = `Relatório de Pagamento - ${quinzenaAtual === "1" ? "1ª Quinzena (1-15)" : "2ª Quinzena (16-31)"}\n\n`;

  corpoTexto += `Dias trabalhados:\n`;
  registrosFiltrados.forEach(r => {
    const [ano, mes, dia] = r.data.split("-");
    corpoTexto += `${dia}/${mes}/${ano} | ${r.local} | ${r.funcao} | ${r.horas} Horas\n`;
  });

  let resumo = {};
  let totalGeral = 0;

  registrosFiltrados.forEach(r => {
    if (!resumo[r.funcao]) resumo[r.funcao] = { horas: 0, total: 0, valorHora: r.valor };
    resumo[r.funcao].horas += r.horas;
    resumo[r.funcao].total += r.horas * r.valor;
    totalGeral += r.horas * r.valor;
  });

  corpoTexto += `\nResumo por função:\n`;
  for (let funcao in resumo) {
    const r = resumo[funcao];
    corpoTexto += `${funcao}: ${r.horas}h x €${r.valorHora.toFixed(2)} = €${r.total.toFixed(2)}\n`;
  }

  corpoTexto += `\nTotal geral: €${totalGeral.toFixed(2)}`;

  const corpo = encodeURIComponent(corpoTexto);
  const mailto = `mailto:${email}?subject=${assunto}&body=${corpo}`;
  window.location.href = mailto;

  fecharModal();

  // Limpar registros da quinzena atual
  registros = registros.filter(r => !(r.dia >= inicio && r.dia <= fim));
  salvarRegistros();

  document.getElementById("relatorio").style.display = "none";
  document.getElementById("btnEnviar").style.display = "none";
  document.getElementById("quinzena").value = "";
}


function excluirRegistro(index) {
  registros.splice(index, 1);
  salvarRegistros();
}

mostrarRegistros();

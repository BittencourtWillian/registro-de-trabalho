const APP_VERSION = "1.0.2";
const storedVersion = localStorage.getItem("app_version");

if (storedVersion && storedVersion !== APP_VERSION) {
  if (confirm("Uma nova versão do app está disponível. Deseja atualizar agora?")) {
    localStorage.setItem("app_version", APP_VERSION);
    location.reload(true);
  }
} else {
  localStorage.setItem("app_version", APP_VERSION);
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
    const item = document.createElement("div");
    item.className = "registro";
    item.innerHTML = `
      <span>${r.data} - ${r.local} - ${r.funcao} - ${r.horas}h</span>
      <button onclick="excluirRegistro(${index})" style="float:right; background-color:#e74c3c; color:white; border:none; padding:4px 8px; border-radius:4px; font-size:12px;">Excluir</button>
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

  const inicio = q === "1" ? 1 : 16;
  const fim = q === "1" ? 15 : 31;

  const registrosFiltrados = registros.filter(r => r.dia >= inicio && r.dia <= fim);

  if (registrosFiltrados.length === 0) {
    alert("Nenhum registro nessa quinzena.");
    return;
  }

  let detalhes = `Dias trabalhados:\n`;
  registrosFiltrados.forEach(r => {
    const [ano, mes, dia] = r.data.split("-");
    detalhes += `${dia}/${mes}/${ano} (Data), ${r.local} (Local), ${r.funcao} (Função), ${r.horas} (Horas trabalhadas)\n`;
  });

  let resumo = {};
  let totalGeral = 0;

  registrosFiltrados.forEach(r => {
    if (!resumo[r.funcao]) resumo[r.funcao] = { horas: 0, total: 0, valorHora: r.valor };
    resumo[r.funcao].horas += r.horas;
    resumo[r.funcao].total += r.horas * r.valor;
    totalGeral += r.horas * r.valor;
  });

  let totais = `\nResumo por função:\n`;
  for (let funcao in resumo) {
    const r = resumo[funcao];
    totais += `${funcao}: ${r.horas}h x €${r.valorHora.toFixed(2)} = €${r.total.toFixed(2)}\n`;
  }

  totais += `\nTotal geral: €${totalGeral.toFixed(2)}`;

  const relatorioFinal = `Relatório de Pagamento - ${q === "1" ? "1ª Quinzena (1-15)" : "2ª Quinzena (16-31)"}\n\n${detalhes}\n${totais}`;

  relatorioAtual = relatorioFinal;
  quinzenaAtual = q;

  document.getElementById("relatorio").textContent = relatorioFinal;
  document.getElementById("relatorio").style.display = "block";
  document.getElementById("btnEnviar").style.display = "inline-block";
}

function enviarEmail() {
  const nome = prompt("Digite seu nome e sobrenome:");
  if (!nome || nome.length < 3) {
    alert("Nome inválido.");
    return;
  }

  const email = "cesarlinobit@gmail.com";
  const assunto = encodeURIComponent(`Solicitação de pagamento: ${nome}`);
  const corpo = encodeURIComponent(relatorioAtual);
  const mailto = `mailto:${email}?subject=${assunto}&body=${corpo}`;
  window.location.href = mailto;

  const inicio = quinzenaAtual === "1" ? 1 : 16;
  const fim = quinzenaAtual === "1" ? 15 : 31;
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

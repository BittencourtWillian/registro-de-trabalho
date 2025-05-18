const APP_VERSION = "1.0.4";
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

  const inicio = q === "1" ? 1 : 16;
  const fim = q === "1" ? 15 : 31;

  const registrosFiltrados = registros.filter(r => r.dia >= inicio && r.dia <= fim);

  if (registrosFiltrados.length === 0) {
    alert("Nenhum registro nessa quinzena.");
    return;
  }

  let detalhes = `<b>Dias trabalhados:</b><br><pre style="font-family: monospace;">
  Data       |   Local      | Função     | Horas
------------------------------------------------
`;

  registrosFiltrados.forEach(r => {
    const [ano, mes, dia] = r.data.split("-");
    const dataFormatada = `${dia}/${mes}/${ano}`.padEnd(12);
    const local = r.local.padEnd(12);
    const funcao = r.funcao.padEnd(10);
    const horas = `${r.horas} Horas`;
    detalhes += `${dataFormatada}| ${local}| ${funcao}| ${horas}\n`;
  });

  detalhes += `</pre>`;

  let resumo = {};
  let totalGeral = 0;

  registrosFiltrados.forEach(r => {
    if (!resumo[r.funcao]) resumo[r.funcao] = { horas: 0, total: 0, valorHora: r.valor };
    resumo[r.funcao].horas += r.horas;
    resumo[r.funcao].total += r.horas * r.valor;
    totalGeral += r.horas * r.valor;
  });

  let totais = `<b>Resumo por função:</b><br>`;
  for (let funcao in resumo) {
    const r = resumo[funcao];
    totais += `${funcao}: ${r.horas}h x €${r.valorHora.toFixed(2)} = €${r.total.toFixed(2)}<br>`;
  }

  totais += `<br><span style="background: yellow; font-weight: bold;">Total geral: €${totalGeral.toFixed(2)}</span>`;

  const relatorioFinal = `Relatório de Pagamento - ${q === "1" ? "1ª Quinzena (1-15)" : "2ª Quinzena (16-31)"}<br><br>${detalhes}${totais}`;

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
  const corpo = encodeURIComponent(relatorioAtual.replace(/<br>/g, "\n").replace(/<\/?[^>]+(>|$)/g, ""));
  const mailto = `mailto:${email}?subject=${assunto}&body=${corpo}`;
  window.location.href = mailto;

  fecharModal();

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

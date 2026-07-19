let veiculoAtual = null;
let mesAtual = new Date().getMonth();
let anoAtual = new Date().getFullYear();

function mostrarErroAgenda() {
  document.getElementById("agenda-carregando").classList.add("is-hidden");
  document.getElementById("agenda-erro").classList.remove("is-hidden");
}

function mostrarConteudoAgenda(carro) {
  veiculoAtual = carro;

  document.title = `Agenda — ${carro.nome} — Carr{In}hos`;
  document.getElementById("agenda-nome-veiculo").textContent =
    carro.nome.toUpperCase();

  const params = obterParamsVeiculo(carro.id);
  const linkVoltar = document.getElementById("agenda-voltar");
  linkVoltar.href = `detalhes.html?${params}`;
  document.getElementById("agenda-voltar-texto").textContent =
    `Voltar para ${carro.nome}`;

  const hoje = formatarDataISO(new Date());
  document.getElementById("agenda-retirada").min = hoje;
  document.getElementById("agenda-devolucao").min = hoje;

  document.getElementById("agenda-carregando").classList.add("is-hidden");
  const conteudo = document.getElementById("agenda-conteudo");
  conteudo.hidden = false;
  conteudo.classList.remove("is-hidden");

  renderizarCalendario();
}

function renderizarCalendario() {
  const titulo = document.getElementById("agenda-calendario-titulo");
  const grade = document.getElementById("agenda-grade");

  titulo.textContent = formatarMesAno(anoAtual, mesAtual);

  const primeiroDia = new Date(anoAtual, mesAtual, 1);
  const ultimoDia = new Date(anoAtual, mesAtual + 1, 0);
  const offset = primeiroDia.getDay();
  const totalDias = ultimoDia.getDate();

  let html = "";

  for (let i = 0; i < offset; i += 1) {
    html += `<div class="agenda-dia agenda-dia-vazio" aria-hidden="true"></div>`;
  }

  for (let dia = 1; dia <= totalDias; dia += 1) {
    const dataISO = formatarDataISO(new Date(anoAtual, mesAtual, dia));
    const reservado = diaEstaReservado(dataISO, veiculoAtual);
    const classe = reservado ? "agenda-dia-reservado" : "agenda-dia-disponivel";
    const rotulo = reservado ? "Reservado" : "Disponível";

    html += `<div class="agenda-dia ${classe}" data-data="${dataISO}" aria-label="${dia} de ${MESES[mesAtual]}, ${rotulo}">${dia}</div>`;
  }

  grade.innerHTML = html;
}

function atualizarBotaoVerificar() {
  const retirada = document.getElementById("agenda-retirada").value;
  const devolucao = document.getElementById("agenda-devolucao").value;
  const botao = document.getElementById("agenda-btn-verificar");

  botao.disabled = !(retirada && devolucao);
}

function exibirResultado(disponivel, mensagem) {
  const resultado = document.getElementById("agenda-resultado");
  resultado.classList.remove("is-hidden", "is-sucesso", "is-erro");
  resultado.classList.add(disponivel ? "is-sucesso" : "is-erro");
  resultado.textContent = mensagem;
}

function limparResultado() {
  const resultado = document.getElementById("agenda-resultado");
  resultado.classList.add("is-hidden");
  resultado.classList.remove("is-sucesso", "is-erro");
  resultado.textContent = "";
}

function destacarPeriodoNoCalendario(inicioISO, fimISO) {
  document.querySelectorAll(".agenda-dia[data-data]").forEach((celula) => {
    celula.classList.remove("agenda-dia-selecionado");

    const data = celula.dataset.data;
    if (
      compararDatas(data, inicioISO) >= 0 &&
      compararDatas(data, fimISO) <= 0
    ) {
      celula.classList.add("agenda-dia-selecionado");
    }
  });

  const inicio = parseDataISO(inicioISO);
  if (
    inicio.getFullYear() !== anoAtual ||
    inicio.getMonth() !== mesAtual
  ) {
    mesAtual = inicio.getMonth();
    anoAtual = inicio.getFullYear();
    renderizarCalendario();
    destacarPeriodoNoCalendario(inicioISO, fimISO);
  }
}

function verificarDisponibilidade(evento) {
  evento.preventDefault();

  const retirada = document.getElementById("agenda-retirada").value;
  const devolucao = document.getElementById("agenda-devolucao").value;
  const resultado = intervaloDisponivel(retirada, devolucao, veiculoAtual);

  if (resultado.disponivel) {
    exibirResultado(
      true,
      `Período disponível de ${formatarData(retirada)} a ${formatarData(devolucao)}.`,
    );
  } else {
    exibirResultado(false, resultado.motivo);
  }

  destacarPeriodoNoCalendario(retirada, devolucao);
}

function configurarEventosAgenda() {
  const retirada = document.getElementById("agenda-retirada");
  const devolucao = document.getElementById("agenda-devolucao");

  retirada.addEventListener("input", () => {
    if (retirada.value) {
      devolucao.min = retirada.value;
    } else {
      devolucao.min = formatarDataISO(new Date());
    }
    limparResultado();
    atualizarBotaoVerificar();
  });

  devolucao.addEventListener("input", () => {
    limparResultado();
    atualizarBotaoVerificar();
  });

  document
    .getElementById("agenda-formulario")
    .addEventListener("submit", verificarDisponibilidade);

  document.getElementById("agenda-mes-anterior").addEventListener("click", () => {
    mesAtual -= 1;
    if (mesAtual < 0) {
      mesAtual = 11;
      anoAtual -= 1;
    }
    renderizarCalendario();
  });

  document.getElementById("agenda-mes-proximo").addEventListener("click", () => {
    mesAtual += 1;
    if (mesAtual > 11) {
      mesAtual = 0;
      anoAtual += 1;
    }
    renderizarCalendario();
  });
}

async function carregarAgenda() {
  const id = obterIdVeiculoDaUrl();

  try {
    const carro = await buscarVeiculo(id);

    if (!carro) {
      mostrarErroAgenda();
      return;
    }

    mostrarConteudoAgenda(carro);
  } catch {
    mostrarErroAgenda();
  }
}

initMenuToggle();
configurarEventosAgenda();
carregarAgenda();

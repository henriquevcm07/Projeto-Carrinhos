let veiculoAtual = null;

function mostrarErroAlugar() {
  document.getElementById("alugar-carregando").classList.add("is-hidden");
  document.getElementById("alugar-erro").classList.remove("is-hidden");
}

function calcularDias(retiradaISO, devolucaoISO) {
  if (!retiradaISO || !devolucaoISO) return 0;

  const inicio = parseDataISO(retiradaISO);
  const fim = parseDataISO(devolucaoISO);
  const diffDias = Math.round((fim - inicio) / (1000 * 60 * 60 * 24));

  return Math.max(diffDias, 1);
}

function atualizarResumo() {
  const retirada = document.getElementById("data-retirada").value;
  const devolucao = document.getElementById("data-devolucao").value;
  const dias = calcularDias(retirada, devolucao);
  const total = dias * veiculoAtual.valor_aluguel_dia;

  document.getElementById("resumo-diaria").textContent = formatarMoeda(
    veiculoAtual.valor_aluguel_dia,
  );
  document.getElementById("resumo-dias").textContent = dias;
  document.getElementById("resumo-total").textContent = formatarMoeda(total);

  verificarDisponibilidadeAlugar(retirada, devolucao);
}

function verificarDisponibilidadeAlugar(retirada, devolucao) {
  const aviso = document.getElementById("alugar-disponibilidade");
  const botao = document.getElementById("btn-confirmar-reserva");

  if (!retirada || !devolucao) {
    aviso.classList.add("is-hidden");
    botao.classList.add("is-disabled");
    botao.setAttribute("aria-disabled", "true");
    return;
  }

  const resultado = intervaloDisponivel(retirada, devolucao, veiculoAtual);

  aviso.classList.remove("is-hidden", "is-sucesso", "is-erro");

  if (resultado.disponivel) {
    aviso.classList.add("is-sucesso");
    aviso.textContent = "Período disponível para esse veículo.";
    botao.classList.remove("is-disabled");
    botao.removeAttribute("aria-disabled");
  } else {
    aviso.classList.add("is-erro");
    aviso.textContent = resultado.motivo;
    botao.classList.add("is-disabled");
    botao.setAttribute("aria-disabled", "true");
  }
}

function preencherResumoVeiculo(carro) {
  document.getElementById("alugar-imagem").src = carro.url_imagem;
  document.getElementById("alugar-imagem").alt = carro.nome;
  document.getElementById("resumo-nome-veiculo").textContent = carro.nome;
  document.getElementById("nome-veiuclo").value = carro.nome;
}

function configurarDatasAlugar() {
  const retirada = document.getElementById("data-retirada");
  const devolucao = document.getElementById("data-devolucao");
  const hoje = formatarDataISO(new Date());

  retirada.min = hoje;
  devolucao.min = hoje;

  retirada.addEventListener("input", () => {
    devolucao.min = retirada.value || hoje;
    atualizarResumo();
  });

  devolucao.addEventListener("input", atualizarResumo);
}

async function confirmarReserva(evento) {
  evento.preventDefault();

  const botao = document.getElementById("btn-confirmar-reserva");
  if (botao.classList.contains("is-disabled")) return;

  const dados = {
    status_disponibilidade: "alugado",
    locatario: {
      nome: document.getElementById("nome-completo").value,
      documento: document.getElementById("cpf").value,
      telefone: document.getElementById("telefonel").value,
      data_inicio_aluguel: document.getElementById("data-retirada").value,
      data_devolucao_prevista: document.getElementById("data-devolucao").value,
    },
  };

  try {
    const resposta = await fetch(`${API_BASE}/carros/${veiculoAtual.id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(dados),
    });

    if (!resposta.ok) throw new Error("Erro ao confirmar reserva: " + resposta.status);

    window.location.href = "reservas.html";
  } catch (erro) {
    console.error(erro);
    alert("Não foi possível confirmar a reserva. Tente novamente.");
  }
}

function mostrarConteudoAlugar(carro) {
  veiculoAtual = carro;

  document.title = `Reservar ${carro.nome} — Carr{In}hos`;
  preencherResumoVeiculo(carro);
  configurarDatasAlugar();
  atualizarResumo();

  document
    .getElementById("form-reserva")
    .addEventListener("submit", confirmarReserva);

  document.getElementById("alugar-carregando").classList.add("is-hidden");
  const conteudo = document.getElementById("alugar-conteudo");
  conteudo.hidden = false;
  conteudo.classList.remove("is-hidden");
}

async function carregarAlugar() {
  const id = obterIdVeiculoDaUrl();

  try {
    const carro = await buscarVeiculo(id);

    if (!carro || carro.status_disponibilidade !== "disponivel") {
      mostrarErroAlugar();
      return;
    }

    mostrarConteudoAlugar(carro);
  } catch {
    mostrarErroAlugar();
  }
}

initMenuToggle();
carregarAlugar();
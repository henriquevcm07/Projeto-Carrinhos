function mostrarErro() {
  document.getElementById("detalhes-carregando").classList.add("is-hidden");
  document.getElementById("detalhes-erro").classList.remove("is-hidden");
}

function mostrarVeiculo(carro) {
  const status = carro.status_disponibilidade;
  const categoria = obterLabelCategoria(carro);

  document.title = `${carro.nome} — Carr{In}hos`;
  document.getElementById("veiculo-nome-breadcrumb").textContent = carro.nome;
  document.getElementById("veiculo-nome").textContent = carro.nome;
  document.getElementById("veiculo-obra").textContent = carro.universo_origem;
  document.getElementById("veiculo-ano").textContent = carro.ano_obra;
  document.getElementById("veiculo-universo").textContent = carro.universo_origem;
  document.getElementById("veiculo-ano-card").textContent = carro.ano_obra;
  document.getElementById("veiculo-categoria").textContent = categoria;
  document.getElementById("veiculo-disponibilidade").textContent =
    obterStatusInfo(status).label;

  document.getElementById("veiculo-imagem").src = carro.url_imagem;
  document.getElementById("veiculo-imagem").alt = carro.nome;
  document.getElementById("veiculo-categoria-tag").textContent = categoria;
  document.getElementById("veiculo-valor").textContent = formatarMoeda(
    carro.valor_aluguel_dia,
  );

  document.getElementById("veiculo-descricao").textContent =
    `Veículo icônico de ${carro.universo_origem} (${carro.ano_obra}). ` +
    `Disponível para aluguel na Carr{In}hos — a locadora do universo fictício.`;

  const tagStatus = document.getElementById("veiculo-status-tag");
  const cardStatus = document.getElementById("veiculo-status-card");
  aplicarClasseStatus(tagStatus, status);
  aplicarClasseStatus(cardStatus, status);
  tagStatus.innerHTML = criarBadgeStatus(status);
  cardStatus.innerHTML = criarBadgeStatus(status);

  const btnReservar = document.getElementById("btn-reservar");
  const btnAgenda = document.getElementById("btn-agenda");
  const params = obterParamsVeiculo(carro.id);
  btnReservar.href = `alugar.html?${params}`;
  btnAgenda.href = `agenda.html?${params}`;

  if (status === "alugado" || status === "manutencao") {
    btnReservar.classList.add("is-disabled");
    btnReservar.setAttribute("aria-disabled", "true");
    btnReservar.textContent =
      status === "alugado" ? "Indisponível" : "Em Manutenção";
  }

  const locatarioBox = document.getElementById("veiculo-locatario");
  if (status === "alugado" && carro.locatario) {
    locatarioBox.classList.remove("is-hidden");
    document.getElementById("locatario-nome").textContent =
      carro.locatario.nome;
    document.getElementById("locatario-telefone").textContent =
      carro.locatario.telefone;
    document.getElementById("locatario-inicio").textContent = formatarData(
      carro.locatario.data_inicio_aluguel,
    );
    document.getElementById("locatario-devolucao").textContent = formatarData(
      carro.locatario.data_devolucao_prevista,
    );
  }

  document.getElementById("detalhes-carregando").classList.add("is-hidden");
  const conteudo = document.getElementById("detalhes-conteudo");
  conteudo.hidden = false;
  conteudo.classList.remove("is-hidden");
}

async function carregarVeiculo() {
  const id = obterIdVeiculoDaUrl();

  try {
    const carro = await buscarVeiculo(id);

    if (!carro) {
      mostrarErro();
      return;
    }

    mostrarVeiculo(carro);
  } catch {
    mostrarErro();
  }
}

initMenuToggle();
carregarVeiculo();

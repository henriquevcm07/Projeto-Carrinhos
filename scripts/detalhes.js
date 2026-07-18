const STATUS = {
  disponivel: { label: "Disponível", badge: "badge-disponivel" },
  alugado: { label: "Alugado", badge: "badge-alugado" },
  manutencao: { label: "Manutenção", badge: "badge-manutencao" },
};

const CATEGORIAS = {
  filme: "Filme",
  serie: "Série",
  desenho: "Desenho",
};

function formatarMoeda(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  });
}

function formatarData(iso) {
  if (!iso) return "—";
  const [ano, mes, dia] = iso.split("-");
  return `${dia}/${mes}/${ano}`;
}

function criarBadgeStatus(status) {
  const info = STATUS[status] || STATUS.disponivel;
  return `<span class="badge-dot"></span> ${info.label}`;
}

function aplicarClasseStatus(elemento, status) {
  const info = STATUS[status] || STATUS.disponivel;
  elemento.className = `badge ${info.badge}`;
  if (elemento.id === "veiculo-status-tag") {
    elemento.classList.add("badge-status");
  }
}

function mostrarErro() {
  document.getElementById("detalhes-carregando").classList.add("is-hidden");
  document.getElementById("detalhes-erro").classList.remove("is-hidden");
}

function mostrarVeiculo(carro) {
  const status = carro.status_disponibilidade;
  const categoria =
    CATEGORIAS[carro.categoria] ||
    carro.categoria.charAt(0).toUpperCase() + carro.categoria.slice(1);

  document.title = `${carro.nome} — Carr{In}hos`;
  document.getElementById("veiculo-nome-breadcrumb").textContent = carro.nome;
  document.getElementById("veiculo-nome").textContent = carro.nome;
  document.getElementById("veiculo-obra").textContent = carro.universo_origem;
  document.getElementById("veiculo-ano").textContent = carro.ano_obra;
  document.getElementById("veiculo-universo").textContent =
    carro.universo_origem;
  document.getElementById("veiculo-ano-card").textContent = carro.ano_obra;
  document.getElementById("veiculo-categoria").textContent = categoria;
  document.getElementById("veiculo-disponibilidade").textContent =
    STATUS[status]?.label || status;

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
  const params = new URLSearchParams({ id: carro.id });
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
  const params = new URLSearchParams(window.location.search);
  const id = Number(params.get("id"));

  try {
    const resposta = await fetch(`http://localhost:3001/carros/${id}`);
    if (!resposta.ok) throw new Error("Carro não encontrado");

    const carro = await resposta.json();

    if (!carro) {
      mostrarErro();
      return;
    }

    mostrarVeiculo(carro);
  } catch {
    mostrarErro();
  }
}

document.getElementById("menu-toggle").addEventListener("click", () => {
  const nav = document.getElementById("main-nav");
  const toggle = document.getElementById("menu-toggle");
  const aberto = nav.classList.toggle("is-open");
  toggle.setAttribute("aria-expanded", String(aberto));
});

carregarVeiculo();

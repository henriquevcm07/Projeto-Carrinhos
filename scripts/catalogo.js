const ITENS_POR_PAGINA = 9;
const MAX_PAGINAS_VISIVEIS = 5;

let todosCarros = [];
let filtroAtual = "todos";
let buscaAtual = "";
let paginaAtual = 1;
let rankingsSemana = {};

function calcularRankingsSemana(carros) {
  const ranking = {};
  [...carros]
    .sort((a, b) => b.valor_aluguel_dia - a.valor_aluguel_dia)
    .slice(0, 3)
    .forEach((carro, indice) => {
      ranking[carro.id] = indice + 1;
    });
  return ranking;
}

function filtrarCarros() {
  const termo = buscaAtual.trim().toLowerCase();

  return todosCarros.filter((carro) => {
    const categoria = carro.categoria;
    const status = carro.status_disponibilidade;
    const textoBusca =
      `${carro.nome} ${carro.universo_origem} ${carro.ano_obra}`.toLowerCase();

    if (termo && !textoBusca.includes(termo)) {
      return false;
    }

    switch (filtroAtual) {
      case "disponivel":
        return status === "disponivel";
      case "indisponivel":
        return status === "alugado" || status === "manutencao";
      case "filme":
      case "serie":
      case "desenho":
        return categoria === filtroAtual;
      default:
        return true;
    }
  });
}

function criarCardCarro(carro) {
  const status = carro.status_disponibilidade;
  const statusInfo = obterStatusInfo(status, "catalogo");
  const categoria = obterCategoria(carro);
  const disponivel = status === "disponivel";
  const params = obterParamsVeiculo(carro.id);
  const ranking = rankingsSemana[carro.id];

  const badgeRanking = ranking
    ? `<span class="badge-ranking"><span class="badge-ranking-icone">★</span> #${ranking} da semana</span>`
    : "";

  const botaoAlugar = disponivel
    ? `<a href="alugar.html?${params}" class="btn btn-primary btn-alugar">Alugar</a>`
    : `<span class="btn btn-primary btn-alugar is-disabled">Indisponível</span>`;

  return `
    <article class="catalogo-card">
      <div class="catalogo-card-imagem">
        <img src="${carro.url_imagem}" alt="${carro.nome}" loading="lazy" />
        <span class="badge ${categoria.badge}">${categoria.label}</span>
        <span class="badge ${statusInfo.badge} badge-status">${criarBadgeStatus(status, "catalogo")}</span>
        ${badgeRanking}
      </div>
      <div class="catalogo-card-corpo">
        <h2 class="catalogo-card-titulo">
          <a href="detalhes.html?${params}">${carro.nome}</a>
        </h2>
        <p class="catalogo-card-origem">${carro.universo_origem} (${carro.ano_obra})</p>
        <div class="catalogo-card-preco">
          <span class="catalogo-card-preco-label">por dia</span>
          <p class="catalogo-card-preco-valor">${formatarMoeda(carro.valor_aluguel_dia)}</p>
        </div>
        <div class="catalogo-card-acoes">
          ${botaoAlugar}
          <a href="agenda.html?${params}" class="btn-agenda-card" aria-label="Ver agenda de ${carro.nome}">
            <img src="../styles/images/logo_agenda.png" alt="" />
          </a>
        </div>
      </div>
    </article>
  `;
}

function atualizarContagem(total) {
  const texto =
    total === 1 ? "1 veículo encontrado" : `${total} veículos encontrados`;
  document.getElementById("catalogo-contagem").textContent = texto;
}

function renderizarPaginacao(totalPaginas) {
  const nav = document.getElementById("catalogo-paginacao");

  if (totalPaginas <= 1) {
    nav.classList.add("is-hidden");
    nav.innerHTML = "";
    return;
  }

  nav.classList.remove("is-hidden");

  let inicio = Math.max(
    1,
    paginaAtual - Math.floor(MAX_PAGINAS_VISIVEIS / 2),
  );
  let fim = inicio + MAX_PAGINAS_VISIVEIS - 1;

  if (fim > totalPaginas) {
    fim = totalPaginas;
    inicio = Math.max(1, fim - MAX_PAGINAS_VISIVEIS + 1);
  }

  let html = `<button type="button" class="pagina-btn" data-pagina="anterior" ${paginaAtual === 1 ? "disabled" : ""} aria-label="Página anterior">&lt;</button>`;

  for (let pagina = inicio; pagina <= fim; pagina += 1) {
    const atual = pagina === paginaAtual ? " is-atual" : "";
    html += `<button type="button" class="pagina-btn${atual}" data-pagina="${pagina}" aria-label="Página ${pagina}" ${pagina === paginaAtual ? 'aria-current="page"' : ""}>${pagina}</button>`;
  }

  html += `<button type="button" class="pagina-btn" data-pagina="proxima" ${paginaAtual === totalPaginas ? "disabled" : ""} aria-label="Próxima página">&gt;</button>`;

  nav.innerHTML = html;
}

function renderizarCatalogo() {
  const filtrados = filtrarCarros();
  const total = filtrados.length;
  const totalPaginas = Math.max(1, Math.ceil(total / ITENS_POR_PAGINA));

  if (paginaAtual > totalPaginas) {
    paginaAtual = totalPaginas;
  }

  const inicio = (paginaAtual - 1) * ITENS_POR_PAGINA;
  const paginaItens = filtrados.slice(inicio, inicio + ITENS_POR_PAGINA);

  const grid = document.getElementById("catalogo-grid");
  const vazio = document.getElementById("catalogo-vazio");

  atualizarContagem(total);

  if (total === 0) {
    grid.innerHTML = "";
    vazio.classList.remove("is-hidden");
    renderizarPaginacao(0);
    return;
  }

  vazio.classList.add("is-hidden");
  grid.innerHTML = paginaItens.map(criarCardCarro).join("");
  renderizarPaginacao(totalPaginas);
}

function definirFiltro(filtro) {
  filtroAtual = filtro;
  paginaAtual = 1;

  document.querySelectorAll(".filtro-btn").forEach((btn) => {
    btn.classList.toggle("is-active", btn.dataset.filtro === filtro);
  });

  renderizarCatalogo();
}

async function carregarCatalogo() {
  try {
    const resposta = await fetch(`${API_BASE}/carros`);
    if (!resposta.ok) throw new Error("Erro ao carregar catálogo");

    todosCarros = await resposta.json();
    rankingsSemana = calcularRankingsSemana(todosCarros);
    renderizarCatalogo();
  } catch {
    document.getElementById("catalogo-contagem").textContent =
      "Erro ao carregar veículos";
    document.getElementById("catalogo-erro").classList.remove("is-hidden");
  }
}

document.getElementById("catalogo-busca").addEventListener("input", (evento) => {
  buscaAtual = evento.target.value;
  paginaAtual = 1;
  renderizarCatalogo();
});

document.querySelectorAll(".filtro-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    definirFiltro(btn.dataset.filtro);
  });
});

document.getElementById("catalogo-paginacao").addEventListener("click", (evento) => {
  const botao = evento.target.closest("[data-pagina]");
  if (!botao || botao.disabled) return;

  const acao = botao.dataset.pagina;
  const totalPaginas = Math.ceil(filtrarCarros().length / ITENS_POR_PAGINA);

  if (acao === "anterior") {
    paginaAtual = Math.max(1, paginaAtual - 1);
  } else if (acao === "proxima") {
    paginaAtual = Math.min(totalPaginas, paginaAtual + 1);
  } else {
    paginaAtual = Number(acao);
  }

  renderizarCatalogo();
  document.querySelector(".catalogo-grid")?.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
});

initMenuToggle();
carregarCatalogo();

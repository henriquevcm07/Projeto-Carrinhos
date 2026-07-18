const API_BASE = "http://localhost:3001";

const STATUS = {
  disponivel: {
    label: "Disponível",
    badge: "badge-disponivel",
  },
  alugado: {
    label: "Alugado",
    badge: "badge-alugado",
  },
  manutencao: {
    label: "Manutenção",
    badge: "badge-manutencao",
  },
};

const CATEGORIAS = {
  filme: { label: "Filme", badge: "badge-categoria" },
  serie: { label: "Série", badge: "badge-categoria badge-categoria-serie" },
  desenho: {
    label: "Desenho",
    badge: "badge-categoria badge-categoria-desenho",
  },
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

function obterStatusInfo(status) {
  return STATUS[status] || STATUS.disponivel;
}

function criarBadgeStatus(status) {
  const info = obterStatusInfo(status);
  return `<span class="badge-dot"></span> ${info.label}`;
}

function aplicarClasseStatus(elemento, status) {
  const info = obterStatusInfo(status);
  elemento.className = `badge ${info.badge}`;

  if (elemento.id === "veiculo-status-tag") {
    elemento.classList.add("badge-status");
  }
}

function obterCategoria(carro) {
  return (
    CATEGORIAS[carro.categoria] || {
      label:
        carro.categoria.charAt(0).toUpperCase() + carro.categoria.slice(1),
      badge: "badge-categoria",
    }
  );
}

function obterLabelCategoria(carro) {
  return obterCategoria(carro).label;
}

function obterIdVeiculoDaUrl() {
  const params = new URLSearchParams(window.location.search);
  return Number(params.get("id"));
}

function obterParamsVeiculo(id) {
  return new URLSearchParams({ id });
}

function initMenuToggle() {
  const toggle = document.getElementById("menu-toggle");
  const nav = document.getElementById("main-nav");

  if (!toggle || !nav) return;

  toggle.addEventListener("click", () => {
    const aberto = nav.classList.toggle("is-open");
    toggle.setAttribute("aria-expanded", String(aberto));
  });
}

async function buscarVeiculo(id) {
  const resposta = await fetch(`${API_BASE}/carros/${id}`);
  if (!resposta.ok) throw new Error("Veículo não encontrado");
  return resposta.json();
}
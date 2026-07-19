const API_BASE = "http://localhost:3001";

const STATUS = {
  disponivel: {
    label: "Disponível",
    badge: "badge-disponivel",
  },
  alugado: {
    label: "Alugado",
    badge: "badge-alugado",
    labelCatalogo: "Indisponível",
    badgeCatalogo: "badge-indisponivel",
  },
  manutencao: {
    label: "Manutenção",
    badge: "badge-manutencao",
    labelCatalogo: "Indisponível",
    badgeCatalogo: "badge-indisponivel",
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

const MESES = [
  "Janeiro",
  "Fevereiro",
  "Março",
  "Abril",
  "Maio",
  "Junho",
  "Julho",
  "Agosto",
  "Setembro",
  "Outubro",
  "Novembro",
  "Dezembro",
];

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

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

function parseDataISO(iso) {
  if (!iso) return null;
  const [ano, mes, dia] = iso.split("-").map(Number);
  return new Date(ano, mes - 1, dia);
}

function formatarDataISO(data) {
  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");
  return `${ano}-${mes}-${dia}`;
}

function compararDatas(a, b) {
  const dataA = parseDataISO(a);
  const dataB = parseDataISO(b);
  if (dataA < dataB) return -1;
  if (dataA > dataB) return 1;
  return 0;
}

function obterStatusInfo(status, contexto = "detalhes") {
  const info = STATUS[status] || STATUS.disponivel;

  if (contexto === "catalogo") {
    return {
      label: info.labelCatalogo || info.label,
      badge: info.badgeCatalogo || info.badge,
    };
  }

  return {
    label: info.label,
    badge: info.badge,
  };
}

function criarBadgeStatus(status, contexto = "detalhes") {
  const info = obterStatusInfo(status, contexto);
  return `<span class="badge-dot"></span> ${info.label}`;
}

function aplicarClasseStatus(elemento, status, contexto = "detalhes") {
  const info = obterStatusInfo(status, contexto);
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

function obterPeriodoReservado(carro) {
  if (carro.status_disponibilidade !== "alugado" || !carro.locatario) {
    return null;
  }

  return {
    inicio: carro.locatario.data_inicio_aluguel,
    fim: carro.locatario.data_devolucao_prevista,
  };
}

function diaEstaReservado(dataISO, carro) {
  if (carro.status_disponibilidade === "manutencao") {
    return true;
  }

  const periodo = obterPeriodoReservado(carro);
  if (!periodo) return false;

  return (
    compararDatas(dataISO, periodo.inicio) >= 0 &&
    compararDatas(dataISO, periodo.fim) <= 0
  );
}

function intervaloDisponivel(inicioISO, fimISO, carro) {
  if (carro.status_disponibilidade === "manutencao") {
    return {
      disponivel: false,
      motivo: "Este veículo está em manutenção e não pode ser alugado.",
    };
  }

  if (compararDatas(inicioISO, fimISO) > 0) {
    return {
      disponivel: false,
      motivo: "A data de retirada deve ser anterior ou igual à devolução.",
    };
  }

  const hoje = formatarDataISO(new Date());
  if (compararDatas(inicioISO, hoje) < 0) {
    return {
      disponivel: false,
      motivo: "A data de retirada não pode ser no passado.",
    };
  }

  const inicio = parseDataISO(inicioISO);
  const fim = parseDataISO(fimISO);
  const cursor = new Date(inicio);

  while (cursor <= fim) {
    const dataISO = formatarDataISO(cursor);
    if (diaEstaReservado(dataISO, carro)) {
      return {
        disponivel: false,
        motivo: `O veículo não está disponível em ${formatarData(dataISO)}.`,
      };
    }
    cursor.setDate(cursor.getDate() + 1);
  }

  return { disponivel: true, motivo: "" };
}

function formatarMesAno(ano, mes) {
  return `${MESES[mes]} ${ano}`;
}

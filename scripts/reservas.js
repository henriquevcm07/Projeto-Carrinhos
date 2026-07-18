  const API_URL = "http://localhost:3001/carros";

  const listaEl = document.getElementById("lista-reservas");

  function formatarData(dataISO) {
    const [ano, mes, dia] = dataISO.split("-");
    return `${dia}/${mes}/${ano}`;
  }

  function formatarPreco(valor) {
    return valor.toLocaleString("pt-BR", { style: "currency", currency: "BRL", minimumFractionDigits: 0 });
  }

  function tempoDeUso(carro) {
    const dataInicio = new Date(carro.locatario.data_inicio_aluguel);
    const dataFim = new Date(carro.locatario.data_devolucao_prevista);
    const dataTempoDeUso = (dataFim - dataInicio)/(1000 * 60 * 60 * 24);

    return dataTempoDeUso;
  }

  function criarCardReserva(carro) {
    const carroTempoDeUso = Math.round(tempoDeUso(carro));
    return `
      <div class="reserva-card">
        <img class="reserva-img" src="${carro.url_imagem}" alt="${carro.nome}">
        <div class="reserva-info">
          <div class="reserva-titulo">
            <strong>${carro.nome}</strong>
          </div>
          <div class="reserva-meta">
            · ${carroTempoDeUso} dias · ${formatarPreco(carro.valor_aluguel_dia)}
          </div>
          <div class="reserva-datas">
            ${formatarData(carro.locatario.data_inicio_aluguel)} — ${formatarData(carro.locatario.data_devolucao_prevista)}
          </div>
        </div>
        <div class="reserva-acoes">
          <button class="btn btn-detalhes" onclick="window.location.href='detalhes.html?id=${carro.id}'">Ver Detalhes</button>
          <button class="btn btn-cancelar" data-id="${carro.id}">Cancelar</button>
        </div>
      </div>
    `;
  }

  function renderizarReservas(reservas) {
    if (reservas.length === 0) {
      listaEl.innerHTML = `<div class="estado-vazio">Você ainda não tem nenhuma reserva.</div>`;
      return;
    }
    
    listaEl.innerHTML = reservas.map(criarCardReserva).join("");

    document.querySelectorAll(".btn-cancelar").forEach(botao => {
      botao.addEventListener("click", () => cancelarReserva(botao.dataset.id));
    });
  }

  async function carregarReservas() {
    try {
      const resposta = await fetch(API_URL);

      if (!resposta.ok) {
        throw new Error("Erro ao buscar reservas: " + resposta.status);
      }

      const carros = await resposta.json();
      const alugados = carros.filter(carro => carro.locatario !== null);

      renderizarReservas(alugados);

    } catch (erro) {
      console.error(erro);
      listaEl.innerHTML = `<div class="estado-erro">Não foi possível carregar suas reservas. Verifique se o json-server está rodando.</div>`;
    }
  }

  
  async function cancelarReserva(id) {
    const confirmar = confirm("Tem certeza que deseja cancelar essa reserva?");
    if (!confirmar) return;

    try {
      const resposta = await fetch(`${API_URL}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
        status_disponibilidade: "disponivel",
        locatario: null
    })
      });

      if (!resposta.ok) {
        throw new Error("Erro ao cancelar reserva: " + resposta.status);
      }

      carregarReservas();

    } catch (erro) {
      console.error(erro);
      alert("Não foi possível cancelar a reserva. Tente novamente.");
    }
  }
  
  carregarReservas();
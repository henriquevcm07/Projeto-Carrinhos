//regra para filtrar apenas os disponíveis
const apenasDisponiveis = carro => carro.status_disponibilidade === "disponivel"; 
//criterio de ordenação por preço
const porMaiorPreco = (a, b) => b.valor_aluguel_dia - a.valor_aluguel_dia;

async function BuscarDestaques(){
    try{
        const request = await fetch(`http://localhost:3001/carros`);
        const carros = await request.json();
        const Destaques = carros.filter(apenasDisponiveis).sort(porMaiorPreco).slice(0,4);
        Destaques.forEach((carro,indice) => {
            renderizarDestaque(carro,indice)
        });
    } catch (error){
        console.log("ocorreu um erro");
    }
};

function renderizarDestaque(destaque,i){
    const img = `<img src="./styles/images/${destaque.categoria}.png" >`;
    let corCat = '43, 127, 255';
    if(destaque.categoria ==='desenho'){
        corCat = '254, 154, 0';
    } else if(destaque.categoria ==='série'){
        corCat = '173, 70, 255';
    };

    let corDisp = '0, 188, 125';
    if(destaque.status_disponibilidade === 'manutencao'){
        corDisp = '254, 154, 0';
    }
    else if(destaque.status_disponibilidade === 'alugado'){
        corDisp = '251, 44, 54';
    }
    const card = document.getElementById(`D${i}`);
    card.innerHTML = `
        <div class="imageCard" style="background-image: url('${destaque.url_imagem}'); display: flex; justify-content: space-between;">                        
            <div class="categoria" style='color: rgb(${corCat},1); border:1px solid rgb(${corCat},0.25); background-color: rgb(${corCat},0.1);'>${img} <span>${destaque.categoria}</span></div>
            <div class="disponibilidade" style='color: rgb(${corDisp},1); border:1px solid rgb(${corDisp},0.25); background-color: rgb(${corDisp},0.1)'><div class='bolinha' style="background-color: rgb(${corDisp},1)"></div>${destaque.status_disponibilidade}</div>
        </div>
        <div class="BodyCard"">
            <h3>${destaque.nome}</h3>
            <p>${destaque.universo_origem}</p>
            <div class="AlugarCard">
                <p>por dia</p>
                <h2>R$ ${destaque.valor_aluguel_dia}</h2>
                <div class="btnsCard">
                    <a href="./pages/alugar.html?id=${destaque.id}" id="Cardbtn1"><p>Alugar</p></a>
                    <a href="./pages/agenda.html?id=${destaque.id}" id="Cardbtn2"><img src='./styles/images/AgendaCinza.png'></a>
                </div>    
            </div>
        </div>
    `;
};
BuscarDestaques();

async function BuscarVitrine(){
    try{
        const request = await fetch(`http://localhost:3001/carros`);
        const carros = await request.json();
        const vitrine = carros.sort(()=>Math.random()-0.5).slice(0,4);
        console.log(vitrine);
        vitrine.forEach((carro,indice)=>{
            RenderizarVitrine(carro, indice);
        })
        
    } catch{
        console.log("ocorreu um erro");
    };
};
function RenderizarVitrine(carro,i){
    let corDisp = '0, 188, 125';
    if(carro.status_disponibilidade === 'manutencao'){
        corDisp = '254, 154, 0';
    }
    else if(carro.status_disponibilidade === 'alugado'){
        corDisp = '251, 44, 54';
    }
    const card = document.getElementById(`V${i}`)
    card.innerHTML = `
    <div class = "VitrineImg" style="background-image:url('${carro.url_imagem}')">
        <p class = "VitrineNome">${carro.nome}</p>
        <div class="VitrineDisp" style='color: rgb(${corDisp},1); border:1px solid rgb(${corDisp},0.25); background-color: rgb(${corDisp},0.1)'><div class='bolinha' style="background-color: rgb(${corDisp},1)"></div>${carro.status_disponibilidade}</div>
    `
}
BuscarVitrine();


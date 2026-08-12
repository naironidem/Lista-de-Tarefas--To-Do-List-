const CHAVE_STORAGE = "quadro-kanban:dados";

const quadrosPadrao = [
  {
    id: "quadro-1",
    nome: "Trabalho",
    colunas: [
      {
        id: "coluna-1",
        nome: "A fazer",
        cartoes: [
          { id: "cartao-1", texto: "Terminar relatório" },
          { id: "cartao-2", texto: "Responder e-mails" },
        ],
      },
      {
        id: "coluna-2",
        nome: "Fazendo",
        cartoes: [
          { id: "cartao-3", texto: "Reunião com cliente" },
        ],
      },
      {
        id: "coluna-3",
        nome: "Concluído",
        cartoes: [],
      },
    ],
  },
  {
    id: "quadro-2",
    nome: "Faculdade",
    colunas: [
      { id: "coluna-4", nome: "A fazer", cartoes: [] },
      { id: "coluna-5", nome: "Fazendo", cartoes: [] },
      { id: "coluna-6", nome: "Concluído", cartoes: [] },
    ],
  },
];

function carregarDados() {
  try {
    const dados = localStorage.getItem(CHAVE_STORAGE);
    return dados ? JSON.parse(dados) : null;
  } catch {
    return null;
  }
}

function salvarDados() {
  localStorage.setItem(
    CHAVE_STORAGE,
    JSON.stringify({ quadros, quadroAtualId })
  );
}

const dadosSalvos = carregarDados();

const quadros = dadosSalvos ? dadosSalvos.quadros : quadrosPadrao;
let quadroAtualId = dadosSalvos ? dadosSalvos.quadroAtualId : "quadro-1";

const areaColunas = document.getElementById("area-colunas");
const nomeQuadroAtualEl = document.getElementById("nome-quadro-atual");
const listaQuadrosEl = document.getElementById("lista-quadros");
const formNovoQuadro = document.getElementById("form-novo-quadro");
const inputNovoQuadro = document.getElementById("input-novo-quadro");
const buscaCartoesEl = document.getElementById("busca-cartoes");

let textoBusca = "";

function encontrarQuadro(id) {
  return quadros.find((quadro) => quadro.id === id);
}

function encontrarColuna(quadro, colunaId) {
  return quadro.colunas.find((coluna) => coluna.id === colunaId);
}

function gerarId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function adicionarCartao(colunaId, texto, etiqueta, prazo) {
  const quadro = encontrarQuadro(quadroAtualId);
  const coluna = encontrarColuna(quadro, colunaId);

  coluna.cartoes.push({ id: gerarId(), texto, etiqueta, prazo });
  renderizarQuadro();
}

function removerCartao(colunaId, cartaoId) {
  const quadro = encontrarQuadro(quadroAtualId);
  const coluna = encontrarColuna(quadro, colunaId);

  coluna.cartoes = coluna.cartoes.filter((cartao) => cartao.id !== cartaoId);
  renderizarQuadro();
}

function moverCartao(colunaOrigemId, colunaDestinoId, cartaoId) {
  if (colunaOrigemId === colunaDestinoId) return;

  const quadro = encontrarQuadro(quadroAtualId);
  const colunaOrigem = encontrarColuna(quadro, colunaOrigemId);
  const colunaDestino = encontrarColuna(quadro, colunaDestinoId);

  const indice = colunaOrigem.cartoes.findIndex((cartao) => cartao.id === cartaoId);
  const [cartao] = colunaOrigem.cartoes.splice(indice, 1);
  colunaDestino.cartoes.push(cartao);

  renderizarQuadro();
}

function criarQuadro(nome) {
  const novoQuadro = {
    id: gerarId(),
    nome,
    colunas: [
      { id: gerarId(), nome: "A fazer", cartoes: [] },
      { id: gerarId(), nome: "Fazendo", cartoes: [] },
      { id: gerarId(), nome: "Concluído", cartoes: [] },
    ],
  };

  quadros.push(novoQuadro);
  quadroAtualId = novoQuadro.id;
  renderizarQuadro();
}

function trocarQuadro(id) {
  quadroAtualId = id;
  renderizarQuadro();
}

function formatarData(dataISO) {
  const [, mes, dia] = dataISO.split("-");
  return `${dia}/${mes}`;
}

function criarElementoCartao(cartao) {
  const li = document.createElement("li");
  li.className = "cartao";
  li.dataset.id = cartao.id;
  li.draggable = true;

  const linhaTopo = document.createElement("div");
  linhaTopo.className = "cartao__linha-topo";

  const texto = document.createElement("span");
  texto.className = "cartao__texto";
  texto.textContent = cartao.texto;

  const botaoExcluir = document.createElement("button");
  botaoExcluir.className = "cartao__excluir";
  botaoExcluir.textContent = "✕";
  botaoExcluir.setAttribute("aria-label", "Excluir cartão");

  linhaTopo.appendChild(texto);
  linhaTopo.appendChild(botaoExcluir);
  li.appendChild(linhaTopo);

  if (cartao.etiqueta || cartao.prazo) {
    const linhaMeta = document.createElement("div");
    linhaMeta.className = "cartao__linha-meta";

    if (cartao.etiqueta) {
      const etiquetaInfo = ETIQUETAS.find((e) => e.valor === cartao.etiqueta);
      if (etiquetaInfo) {
        const badgeEtiqueta = document.createElement("span");
        badgeEtiqueta.className = "cartao__etiqueta";
        badgeEtiqueta.textContent = etiquetaInfo.nome;
        badgeEtiqueta.style.backgroundColor = etiquetaInfo.cor;
        linhaMeta.appendChild(badgeEtiqueta);
      }
    }

    if (cartao.prazo) {
      const badgePrazo = document.createElement("span");
      badgePrazo.className = "cartao__prazo";
      badgePrazo.textContent = formatarData(cartao.prazo);

      const hoje = new Date().toISOString().slice(0, 10);
      if (cartao.prazo < hoje) {
        badgePrazo.classList.add("cartao__prazo--atrasado");
      }

      linhaMeta.appendChild(badgePrazo);
    }

    li.appendChild(linhaMeta);
  }

  return li;
}

const ETIQUETAS = [
  { valor: "urgente", nome: "Urgente", cor: "#ef4444" },
  { valor: "bug", nome: "Bug", cor: "#f97316" },
  { valor: "ideia", nome: "Ideia", cor: "#8b5cf6" },
];

function criarFormularioNovoCartao(colunaId) {
  const form = document.createElement("form");
  form.className = "coluna__form-cartao";
  form.dataset.colunaId = colunaId;

  const input = document.createElement("input");
  input.type = "text";
  input.className = "coluna__input-cartao";
  input.placeholder = "Novo cartão...";
  input.required = true;

  const selectEtiqueta = document.createElement("select");
  selectEtiqueta.className = "coluna__select-etiqueta";

  const opcaoSemEtiqueta = document.createElement("option");
  opcaoSemEtiqueta.value = "";
  opcaoSemEtiqueta.textContent = "Sem etiqueta";
  selectEtiqueta.appendChild(opcaoSemEtiqueta);

  ETIQUETAS.forEach((etiqueta) => {
    const opcao = document.createElement("option");
    opcao.value = etiqueta.valor;
    opcao.textContent = etiqueta.nome;
    selectEtiqueta.appendChild(opcao);
  });

  const inputPrazo = document.createElement("input");
  inputPrazo.type = "date";
  inputPrazo.className = "coluna__input-prazo";

  const botao = document.createElement("button");
  botao.type = "submit";
  botao.className = "coluna__botao-adicionar";
  botao.textContent = "+";

  form.appendChild(input);
  form.appendChild(selectEtiqueta);
  form.appendChild(inputPrazo);
  form.appendChild(botao);

  return form;
}

function filtrarCartoesPorBusca(cartoes) {
  if (textoBusca === "") return cartoes;
  return cartoes.filter((cartao) =>
    cartao.texto.toLowerCase().includes(textoBusca.toLowerCase())
  );
}

function criarElementoColuna(coluna) {
  const div = document.createElement("div");
  div.className = "coluna";
  div.dataset.id = coluna.id;

  const titulo = document.createElement("h2");
  titulo.className = "coluna__titulo";
  titulo.textContent = coluna.nome;

  const listaCartoes = document.createElement("ul");
  listaCartoes.className = "coluna__cartoes";

  filtrarCartoesPorBusca(coluna.cartoes).forEach((cartao) => {
    listaCartoes.appendChild(criarElementoCartao(cartao));
  });

  div.appendChild(titulo);
  div.appendChild(listaCartoes);
  div.appendChild(criarFormularioNovoCartao(coluna.id));

  return div;
}

function criarElementoItemQuadro(quadro) {
  const li = document.createElement("li");
  li.className = "item-quadro";
  li.dataset.id = quadro.id;
  li.textContent = quadro.nome;

  if (quadro.id === quadroAtualId) {
    li.classList.add("item-quadro--ativo");
  }

  return li;
}

function renderizarListaQuadros() {
  listaQuadrosEl.innerHTML = "";
  quadros.forEach((quadro) => {
    listaQuadrosEl.appendChild(criarElementoItemQuadro(quadro));
  });
}

function renderizarQuadro() {
  const quadro = encontrarQuadro(quadroAtualId);

  nomeQuadroAtualEl.textContent = quadro.nome;
  areaColunas.innerHTML = "";

  quadro.colunas.forEach((coluna) => {
    areaColunas.appendChild(criarElementoColuna(coluna));
  });

  renderizarListaQuadros();
  salvarDados();
}

areaColunas.addEventListener("click", (evento) => {
  if (!evento.target.classList.contains("cartao__excluir")) return;

  const cartaoEl = evento.target.closest(".cartao");
  const colunaEl = evento.target.closest(".coluna");

  removerCartao(colunaEl.dataset.id, cartaoEl.dataset.id);
});

areaColunas.addEventListener("submit", (evento) => {
  if (!evento.target.classList.contains("coluna__form-cartao")) return;
  evento.preventDefault();

  const form = evento.target;
  const input = form.querySelector(".coluna__input-cartao");
  const selectEtiqueta = form.querySelector(".coluna__select-etiqueta");
  const inputPrazo = form.querySelector(".coluna__input-prazo");
  const texto = input.value.trim();

  if (texto === "") return;

  adicionarCartao(form.dataset.colunaId, texto, selectEtiqueta.value, inputPrazo.value);

  input.value = "";
  selectEtiqueta.value = "";
  inputPrazo.value = "";
});

areaColunas.addEventListener("dragstart", (evento) => {
  const cartaoEl = evento.target.closest(".cartao");
  if (!cartaoEl) return;

  const colunaEl = cartaoEl.closest(".coluna");

  evento.dataTransfer.setData(
    "text/plain",
    JSON.stringify({
      cartaoId: cartaoEl.dataset.id,
      colunaOrigemId: colunaEl.dataset.id,
    })
  );

  cartaoEl.classList.add("cartao--arrastando");
});

areaColunas.addEventListener("dragend", (evento) => {
  const cartaoEl = evento.target.closest(".cartao");
  if (cartaoEl) cartaoEl.classList.remove("cartao--arrastando");
});

areaColunas.addEventListener("dragover", (evento) => {
  const colunaEl = evento.target.closest(".coluna");
  if (!colunaEl) return;

  evento.preventDefault();
  colunaEl.classList.add("coluna--sobre-drop");
});

areaColunas.addEventListener("dragleave", (evento) => {
  const colunaEl = evento.target.closest(".coluna");
  if (colunaEl) colunaEl.classList.remove("coluna--sobre-drop");
});

areaColunas.addEventListener("drop", (evento) => {
  const colunaDestinoEl = evento.target.closest(".coluna");
  if (!colunaDestinoEl) return;

  evento.preventDefault();
  colunaDestinoEl.classList.remove("coluna--sobre-drop");

  const dados = JSON.parse(evento.dataTransfer.getData("text/plain"));
  moverCartao(dados.colunaOrigemId, colunaDestinoEl.dataset.id, dados.cartaoId);
});

listaQuadrosEl.addEventListener("click", (evento) => {
  const item = evento.target.closest(".item-quadro");
  if (!item) return;

  trocarQuadro(item.dataset.id);
});

formNovoQuadro.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const nome = inputNovoQuadro.value.trim();
  if (nome === "") return;

  criarQuadro(nome);
  inputNovoQuadro.value = "";
});

function debounce(fn, delayMs) {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delayMs);
  };
}

const buscarComDebounce = debounce(() => {
  textoBusca = buscaCartoesEl.value.trim();
  renderizarQuadro();
}, 300);

buscaCartoesEl.addEventListener("input", buscarComDebounce);

renderizarQuadro();
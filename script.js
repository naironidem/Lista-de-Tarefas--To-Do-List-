const CHAVE_STORAGE = "lista-tarefas:tarefas";

const formTarefa = document.getElementById("form-tarefa");
const inputTexto = document.getElementById("input-texto");
const inputCategoria = document.getElementById("input-categoria");
const inputPrioridade = document.getElementById("input-prioridade");

const filtroStatus = document.getElementById("filtro-status");
const filtroPrioridade = document.getElementById("filtro-prioridade");
const filtroCategoria = document.getElementById("filtro-categoria");

const listaTarefasEl = document.getElementById("lista-tarefas");
const mensagemVazioEl = document.getElementById("mensagem-vazio");

let tarefas = carregarTarefas();

function carregarTarefas() {
  try {
    const dados = localStorage.getItem(CHAVE_STORAGE);
    return dados ? JSON.parse(dados) : [];
  } catch {
    return [];
  }
}

function salvarTarefas() {
  localStorage.setItem(CHAVE_STORAGE, JSON.stringify(tarefas));
}

function gerarId() {
  return Date.now().toString(36) + Math.random().toString(36).slice(2, 7);
}

function adicionarTarefa(texto, categoria, prioridade) {
  tarefas.push({
    id: gerarId(),
    texto,
    categoria,
    prioridade,
    concluida: false,
  });
  salvarTarefas();
  renderizar();
}

function alternarConcluida(id) {
  const tarefa = tarefas.find((t) => t.id === id);
  if (tarefa) {
    tarefa.concluida = !tarefa.concluida;
    salvarTarefas();
    renderizar();
  }
}

function removerTarefa(id) {
  tarefas = tarefas.filter((t) => t.id !== id);
  salvarTarefas();
  renderizar();
}

function editarTarefa(id, novoTexto) {
  const tarefa = tarefas.find((t) => t.id === id);
  if (tarefa && novoTexto.trim() !== "") {
    tarefa.texto = novoTexto.trim();
    salvarTarefas();
  }
  renderizar();
}

function aplicarFiltros(lista) {
  const status = filtroStatus.value;
  const prioridade = filtroPrioridade.value;
  const categoria = filtroCategoria.value;

  return lista.filter((tarefa) => {
    if (status === "pendentes" && tarefa.concluida) return false;
    if (status === "concluidas" && !tarefa.concluida) return false;
    if (prioridade !== "todas" && tarefa.prioridade !== prioridade) return false;
    if (categoria !== "todas" && tarefa.categoria !== categoria) return false;
    return true;
  });
}

function criarElementoTarefa(tarefa) {
  const li = document.createElement("li");
  li.className = "tarefa";
  li.dataset.id = tarefa.id;
  if (tarefa.concluida) li.classList.add("tarefa--concluida");

  li.innerHTML = `
    <button class="tarefa__check" aria-label="Concluir tarefa">
      ${tarefa.concluida ? "✔" : ""}
    </button>
    <span class="tarefa__texto" tabindex="0">${tarefa.texto}</span>
    <span class="tarefa__categoria">${tarefa.categoria}</span>
    <span class="tarefa__prioridade tarefa__prioridade--${tarefa.prioridade}">${tarefa.prioridade}</span>
    <button class="tarefa__editar" aria-label="Editar tarefa">✎</button>
    <button class="tarefa__excluir" aria-label="Excluir tarefa">🗑</button>
  `;

  return li;
}

function renderizar() {
  const tarefasFiltradas = aplicarFiltros(tarefas);

  listaTarefasEl.innerHTML = "";
  tarefasFiltradas.forEach((tarefa) => {
    listaTarefasEl.appendChild(criarElementoTarefa(tarefa));
  });

  mensagemVazioEl.style.display = tarefasFiltradas.length === 0 ? "block" : "none";
}

formTarefa.addEventListener("submit", (evento) => {
  evento.preventDefault();

  const texto = inputTexto.value.trim();
  if (texto === "") return;

  adicionarTarefa(texto, inputCategoria.value, inputPrioridade.value);

  inputTexto.value = "";
  inputTexto.focus();
});

listaTarefasEl.addEventListener("click", (evento) => {
  const li = evento.target.closest(".tarefa");
  if (!li) return;

  const id = li.dataset.id;

  if (evento.target.classList.contains("tarefa__check")) {
    alternarConcluida(id);
  }

  if (evento.target.classList.contains("tarefa__excluir")) {
    removerTarefa(id);
  }

  if (evento.target.classList.contains("tarefa__editar")) {
    iniciarEdicao(li, id);
  }
});

function iniciarEdicao(li, id) {
  const spanTexto = li.querySelector(".tarefa__texto");
  const textoAtual = spanTexto.textContent;

  const inputEdicao = document.createElement("input");
  inputEdicao.type = "text";
  inputEdicao.value = textoAtual;
  inputEdicao.className = "tarefa__texto-editando";

  spanTexto.replaceWith(inputEdicao);
  inputEdicao.focus();
  inputEdicao.select();

  function finalizarEdicao() {
    editarTarefa(id, inputEdicao.value);
  }

  inputEdicao.addEventListener("blur", finalizarEdicao);
  inputEdicao.addEventListener("keydown", (evento) => {
    if (evento.key === "Enter") inputEdicao.blur();
    if (evento.key === "Escape") renderizar();
  });
}

filtroStatus.addEventListener("change", renderizar);
filtroPrioridade.addEventListener("change", renderizar);
filtroCategoria.addEventListener("change", renderizar);

renderizar();
// chave para identificar os dados salvos pela nossa aplicação no navegador
const STORAGE_KEY = "prompts-storage"

// estado para carregar os prompts salvos e exibr
const state = {
  prompts: [],
  selectedId: null,
}

// Seletores dos elementos editáveis e seus wrappers
const elements = {
  promptTitle: document.getElementById("prompt-title"),
  promptContent: document.getElementById("prompt-content"),
  titleWrapper: document.getElementById("title-wrapper"),
  contentWrapper: document.getElementById("content-wrapper"),
  btnOpen: document.getElementById("btn-open"),
  btnCollapse: document.getElementById("btn-collapse"),
  sidebar: document.querySelector(".sidebar"),
  btnSave: document.getElementById("btn-save"),
  list: document.getElementById("prompt-list"),
  search: document.getElementById("search-input"),
  btnNew: document.getElementById("btn-new"),
  btnCopy: document.getElementById("btn-copy"),
}

// Verifica se o conteúdo de um elemento contenteditable é vazio.

// Atualiza o estado do wrapper adicionando ou removendo a classe `is-empty`.
function updateEditableWrapperState(element, wrapper) {
  const hasText = element.textContent.trim().length > 0
  wrapper.classList.toggle("is-empty", !hasText)
}

// Atualiza todos os estados editáveis de uma vez.
function updateAllEditableStates() {
  updateEditableWrapperState(elements.promptTitle, elements.titleWrapper)
  updateEditableWrapperState(elements.promptContent, elements.contentWrapper)
}

// Anexa ouvintes de evento `input` aos elementos editáveis para atualizar em tempo real.
function attachAllEditableHandlers() {
  elements.promptTitle.addEventListener("input", () => {
    updateEditableWrapperState(elements.promptTitle, elements.titleWrapper)
  })

  elements.promptContent.addEventListener("input", () => {
    updateEditableWrapperState(elements.promptContent, elements.contentWrapper)
  })
}

function save() {
  const title = elements.promptTitle.textContent.trim()
  const content = elements.promptContent.innerHTML.trim()
  const hasContent = elements.promptContent.textContent.trim()
  if (!title || !hasContent) {
    return alert("Título e conteúdo não podem estar vazios.")
  }

  if (state.selectedId) {
    // Edita um prompt existente
    const existingPrompt = state.prompts.find((p) => p.id === state.selectedId)

    if (existingPrompt) {
      existingPrompt.title = title || "Sem título"
      existingPrompt.content = content || "Sem conteúdo"
    }
  } else {
    // Cria um novo prompt
    const newPrompt = {
      id: Date.now().toString(),
      title,
      content,
    }
    state.prompts.unshift(newPrompt)
    state.selectedId = newPrompt.id
    console.log(newPrompt)
  }

  renderList(elements.search.value)
  persist()
  // alert("Prompt salvo com sucesso!")
}

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state.prompts))
  } catch (error) {
    console.error("Erro ao salvar no localStorage:", error)
  }
}

function load() {
  try {
    const storage = localStorage.getItem(STORAGE_KEY)
    state.prompts = storage ? JSON.parse(storage) : []
    state.selectedId = null
  } catch (error) {
    console.error("Erro ao carregar do localStorage:", error)
  }
}

function createPromptItem(prompt) {
  return `
    <li class="prompt-item"  data-id="${prompt.id}" data-action="select">
      <div class="prompt-item-left">
        <div class="prompt-item-title">${prompt.title}</div>
        <div class="prompt-item-description">${prompt.content}</div>
      </div>

      <button class="btn-icon" title="Remover" data-action="remove">
        <img
          src="assets/remove.svg"
          alt="Remover"
          class="icon icon-trash"
        />
      </button>
    </li>
        `
}

function renderList(filterText = "") {
  const filteredPrompts = state.prompts
    .filter((prompt) =>
      prompt.title.toLowerCase().includes(filterText.toLowerCase().trim())
    )
    .map((p) => createPromptItem(p))
    .join("")

  elements.list.innerHTML =
    filteredPrompts || "<li class='prompt-item'>Nenhum prompt encontrado.</li>"
}

function newPrompt() {
  state.selectedId = null
  elements.promptTitle.textContent = ""
  elements.promptContent.textContent = ""
  updateAllEditableStates()
  elements.promptTitle.focus()
}

function copySelected() {
  try {
    const content = elements.promptContent
    return navigator.clipboard.writeText(content.innerText)
  } catch (error) {
    console.log("Erro ao copiar para a área de transferência:", error)
  }
}

// Eventos
elements.btnSave.addEventListener("click", save)
elements.btnNew.addEventListener("click", newPrompt)
elements.btnCopy.addEventListener("click", copySelected)

elements.search.addEventListener("input", (e) => {
  renderList(e.target.value)
})

elements.list.addEventListener("click", (e) => {
  const removeBtn = e.target.closest("[data-action='remove']")
  const item = e.target.closest("[data-id]")

  if (!item) return

  const id = item.getAttribute("data-id")
  state.selectedId = id

  if (removeBtn) {
    // Remover prompt
    // const confirmed = confirm("Tem certeza que deseja remover este prompt?")
    state.prompts = state.prompts.filter((p) => p.id !== id)
    renderList(elements.search.value)
    persist()
    return
  }
  if (e.target.closest("[data-action='select']")) {
    const prompt = state.prompts.find((p) => p.id === id)

    if (prompt) {
      elements.promptTitle.textContent = prompt.title
      elements.promptContent.innerHTML = prompt.content
      updateAllEditableStates()
    }
  }
})

// Inicialização: liga os handlers e aplica o estado inicial.
function init() {
  load()
  renderList("")
  attachAllEditableHandlers()
  updateAllEditableStates()
  // Configurações iniciais para sidebar (transição via JS apenas)
  if (elements.sidebar) {
    // garante que a sidebar tenha transição suave ao abrir/fechar
    elements.sidebar.style.transition =
      elements.sidebar.style.transition || "transform 0.24s ease"
    // estado inicial: sidebar visível, botão de abrir escondido
    if (elements.btnOpen) elements.btnOpen.style.display = "block"
    if (elements.btnCollapse) elements.btnCollapse.style.display = ""
  }


  // Handlers para abrir/fechar a sidebar
  if (elements.btnCollapse) {
    elements.btnCollapse.addEventListener("click", () => {
      closeSidebar()
    })
  }

  if (elements.btnOpen) {
    elements.btnOpen.addEventListener("click", () => {
      openSidebar()
    })
  }
}

// Executa a inicialização imediatamente (script é incluído no final do body).
init()

// Abre a sidebar (mostra e posiciona)
function openSidebar() {
  if (!elements.sidebar) return
  elements.sidebar.classList.add("open")
  elements.sidebar.classList.remove("collapsed")

  elements.sidebar.style.transform = "translateX(0)"
  if (elements.btnOpen) elements.btnOpen.style.display = "block"
  if (elements.btnCollapse) elements.btnCollapse.style.display = ""
}

// Fecha a sidebar (esconde e mostra botão de abrir)
function closeSidebar() {
  if (!elements.sidebar) return
  // move para a esquerda fora da tela (considerando largura ~400px)
  elements.sidebar.style.transform = "translateX(-420px)"
  if (elements.btnOpen) elements.btnOpen.style.display = "block"
  if (elements.btnCollapse) elements.btnCollapse.style.display = "none"
}

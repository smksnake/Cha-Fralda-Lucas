const CHAVE_STORAGE = "cha_bebe_sorteios_lucas";
const SENHA_PAPAI = "lucas2024"; // Troque para a senha que você quiser

let estado = carregarEstado();
let girando = false;

function carregarEstado() {
  const salvo = localStorage.getItem(CHAVE_STORAGE);
  if (salvo) return JSON.parse(salvo);
  return { sorteados: [] };
}

function salvarEstado() {
  localStorage.setItem(CHAVE_STORAGE, JSON.stringify(estado));
}

// --- CONFIGURAÇÃO DA ROLETA ---
function desenharRoleta() {
  const roleta = document.getElementById("roleta");
  const totalItens = ITENS.length;
  const tamanhoFatia = 360 / totalItens;

  let gradiente = [];
  let cores = ["#e3f2fd", "#90caf9"]; // Azuis alternados

  // Desenha as fatias coloridas
  ITENS.forEach((item, index) => {
    const cor = cores[index % 2];
    const inicio = index * tamanhoFatia;
    const fim = (index + 1) * tamanhoFatia;
    gradiente.push(`${cor} ${inicio}deg ${fim}deg`);
  });

  roleta.style.background = `conic-gradient(${gradiente.join(", ")})`;

  roleta.innerHTML = ""; // Limpa antes de adicionar os textos

  // Adiciona os nomes abreviados
  ITENS.forEach((item, index) => {
    const span = document.createElement("span");
    span.className = "texto-fatia";

    // Calcula o ângulo do centro da fatia
    const angulo = index * tamanhoFatia + tamanhoFatia / 2;

    // Rotaciona o container do texto e empurra para a borda
    span.style.transform = `rotate(${angulo}deg) translateY(-110px)`;

    // O texto em si é contra-rotacionado para ficar "de pé" e legível
    span.innerHTML = `<span style="transform: rotate(${-angulo}deg)">${item.abrev}</span>`;

    roleta.appendChild(span);
  });
}

// --- LÓGICA DO SORTEIO ---
function sortear() {
  if (girando) return;

  const nomeInput = document.getElementById("nome");
  const nome = nomeInput.value.trim();

  if (!nome) {
    alert("Por favor, digite seu nome primeiro!");
    return;
  }

  if (
    estado.sorteados.some((s) => s.nome.toLowerCase() === nome.toLowerCase())
  ) {
    alert(
      `Você já girou a roleta, ${nome}! Tire um print do que apareceu antes. 😉`,
    );
    return;
  }

  girando = true;
  document.getElementById("resultado").classList.add("escondido");
  document.getElementById("roleta-container").classList.remove("escondido");
  document.getElementById("btn-girar").disabled = true;
  document.getElementById("btn-girar").textContent = "Girando...";

  // Sorteia o item
  const indiceSorteado = Math.floor(Math.random() * ITENS.length);
  const itemSorteado = ITENS[indiceSorteado];

  // Cálculo da rotação
  const roleta = document.getElementById("roleta");
  const tamanhoFatia = 360 / ITENS.length;

  // O ponteiro fica no topo (0deg). Para o item X parar no topo:
  // A fatia X vai de (X * tamanho) a ((X+1) * tamanho).
  // O centro da fatia é (X * tamanho) + (tamanho / 2).
  // Precisamos girar 360 - centro, mais algumas voltas completas.
  const centroFatia = indiceSorteado * tamanhoFatia + tamanhoFatia / 2;
  const voltasExtras = 5 * 360; // 5 voltas completas para dar efeito
  const rotacaoFinal = voltasExtras + (360 - centroFatia);

  // Aplica a animação
  roleta.style.transition = "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)";
  roleta.style.transform = `rotate(${rotacaoFinal}deg)`;

  // Aguarda a animação terminar para mostrar o resultado
  setTimeout(() => {
    estado.sorteados.push({
      nome,
      item: itemSorteado.nome,
      data: new Date().toLocaleString(),
    });
    salvarEstado();

    mostrarResultado(itemSorteado);

    girando = false;
    document.getElementById("btn-girar").disabled = false;
    document.getElementById("btn-girar").textContent = "Girar Novamente";
    nomeInput.value = "";
  }, 4100); // 4.1 segundos (tempo da animação + margem)
}

function mostrarResultado(item) {
  const secao = document.getElementById("resultado");
  const texto = document.getElementById("item-sorteado");

  texto.innerHTML = `<strong>${item.nome}</strong>`;

  secao.querySelectorAll(".botoes-compra").forEach((b) => b.remove());

  const botoes = document.createElement("div");
  botoes.className = "botoes-compra";
  botoes.innerHTML = `
    <a href="${item.link}" target="_blank" rel="noopener">🛒 Comprar online</a>
  `;
  secao.appendChild(botoes);

  secao.classList.remove("escondido");
}

function atualizarListaSugestoes() {
  const lista = document.getElementById("lista-estoque");
  lista.innerHTML = "";
  ITENS.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item.nome;
    lista.appendChild(li);
  });
}
// --- COPIAR ENDEREÇO ---
document.getElementById("btn-copiar-endereco").addEventListener("click", () => {
  const textoEndereco = `Rua: São Crispim, 57 - Casa 3 - Fundos
Bairro: Jardim Seckler, São Paulo - SP
CEP: 04242-030
Entregar para: Jackeline ou Eraldo`;

  // Tenta usar a API moderna de clipboard
  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(textoEndereco)
      .then(() => {
        const btn = document.getElementById("btn-copiar-endereco");
        const textoOriginal = btn.textContent;
        btn.textContent = "✅ Copiado!";
        btn.style.background = "#4caf50";
        btn.style.color = "#fff";
        btn.style.borderColor = "#4caf50";

        setTimeout(() => {
          btn.textContent = textoOriginal;
          btn.style.background = "";
          btn.style.color = "";
          btn.style.borderColor = "";
        }, 2000);
      })
      .catch((err) => {
        alert(
          "Não foi possível copiar automaticamente. Selecione o texto manualmente.",
        );
      });
  } else {
    // Fallback para navegadores antigos
    alert(
      "Seu navegador não suporta cópia automática. Por favor, anote ou tire um print.",
    );
  }
});
// --- PAINEL DO PAPAI ---
function abrirPainel() {
  document.getElementById("painel-modal").classList.remove("escondido");
  document.getElementById("tela-senha").classList.remove("escondido");
  document.getElementById("tela-lista").classList.add("escondido");
  document.getElementById("input-senha").value = "";
}

function verificarSenha() {
  const senhaDigitada = document.getElementById("input-senha").value;

  if (senhaDigitada === SENHA_PAPAI) {
    document.getElementById("tela-senha").classList.add("escondido");
    document.getElementById("tela-lista").classList.remove("escondido");
    renderizarListaParticipantes();
  } else {
    alert("Senha incorreta! Tente novamente.");
    document.getElementById("input-senha").value = "";
  }
}

function renderizarListaParticipantes() {
  const lista = document.getElementById("lista-participantes");
  lista.innerHTML = "";

  if (estado.sorteados.length === 0) {
    lista.innerHTML = "<li>Ninguém participou ainda.</li>";
  } else {
    // Ordena por data (do mais recente para o mais antigo)
    const ordenados = [...estado.sorteados].sort(
      (a, b) => new Date(b.data) - new Date(a.data),
    );

    ordenados.forEach((s) => {
      const li = document.createElement("li");
      li.innerHTML = `<strong>${s.nome}</strong> tirou: ${s.item} <br><small>${s.data}</small>`;
      lista.appendChild(li);
    });
  }
}

// --- EVENTOS ---
document.getElementById("form-sorteio").addEventListener("submit", (e) => {
  e.preventDefault();
  sortear();
});

document.getElementById("btn-painel").addEventListener("click", abrirPainel);
document.getElementById("btn-entrar").addEventListener("click", verificarSenha);
document.getElementById("btn-fechar-senha").addEventListener("click", () => {
  document.getElementById("painel-modal").classList.add("escondido");
});

document.getElementById("btn-fechar-painel").addEventListener("click", () => {
  document.getElementById("painel-modal").classList.add("escondido");
});

document.getElementById("btn-reset").addEventListener("click", () => {
  if (
    confirm(
      "Tem certeza que quer apagar TODOS os sorteios? Isso não pode ser desfeito.",
    )
  ) {
    localStorage.removeItem(CHAVE_STORAGE);
    estado = carregarEstado();
    document.getElementById("painel-modal").classList.add("escondido");
    document.getElementById("resultado").classList.add("escondido");
    document.getElementById("roleta-container").classList.add("escondido");

    const roleta = document.getElementById("roleta");
    roleta.style.transition = "none";
    roleta.style.transform = "rotate(0deg)";

    setTimeout(() => {
      roleta.style.transition =
        "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)";
    }, 50);
  }
});

// Inicialização
desenharRoleta();
atualizarListaSugestoes();

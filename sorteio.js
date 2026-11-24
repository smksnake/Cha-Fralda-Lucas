const CHAVE_STORAGE = "cha_bebe_sorteios_lucas";
const SENHA_PAPAI = "lucas2024"; // Troque para a senha que você quiser
const CHAVE_PIX = "a3406cf9-b134-4091-ad37-f62d21084ea6"; // Sua chave PIX aleatória

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
// --- CHUVA DE EMOJIS ---
function iniciarChuvaDeEmojis() {
  const container = document.getElementById("chuva-emojis");
  const emojis = ["🎁", "🧸", "💙", "👶", "🍼", "🚼", "🎈", "🧸", "🩵", "🍼"];

  // Cria 25 emojis
  for (let i = 0; i < 25; i++) {
    const span = document.createElement("span");
    span.className = "objeto-caindo";
    span.textContent = emojis[Math.floor(Math.random() * emojis.length)];

    // Configurações aleatórias para cada emoji cair de um jeito diferente
    const leftPos = Math.random() * 100; // Posição na tela (0 a 100%)
    const duracao = Math.random() * 5 + 5; // Demora entre 5 e 10 segundos para cair
    const delay = Math.random() * 5; // Começa a cair entre 0 e 5 segundos
    const tamanho = Math.random() * 20 + 15; // Tamanho entre 15px e 35px

    span.style.left = `${leftPos}vw`;
    span.style.animationDuration = `${duracao}s`;
    span.style.animationDelay = `${delay}s`;
    span.style.fontSize = `${tamanho}px`;

    container.appendChild(span);
  }
}
// --- CONFIGURAÇÃO DA ROLETA ---
function desenharRoleta() {
  const roleta = document.getElementById("roleta");
  const totalItens = ITENS.length;
  const tamanhoFatia = 360 / totalItens;

  let gradiente = [];
  let cores = ["#e3f2fd", "#90caf9"]; // Azuis alternados

  ITENS.forEach((item, index) => {
    const cor = cores[index % 2];
    const inicio = index * tamanhoFatia;
    const fim = (index + 1) * tamanhoFatia;
    gradiente.push(`${cor} ${inicio}deg ${fim}deg`);
  });

  roleta.style.background = `conic-gradient(${gradiente.join(", ")})`;
  roleta.innerHTML = "";

  ITENS.forEach((item, index) => {
    const span = document.createElement("span");
    span.className = "texto-fatia";
    const angulo = index * tamanhoFatia + tamanhoFatia / 2;
    span.style.transform = `rotate(${angulo}deg) translateY(-110px)`;
    span.innerHTML = `<span style="transform: rotate(${-angulo}deg)">${item.abrev}</span>`;
    roleta.appendChild(span);
  });
}

// --- LISTA DE SUGESTÕES ---
function atualizarListaSugestoes() {
  const lista = document.getElementById("lista-estoque");
  lista.innerHTML = "";
  ITENS.forEach((item) => {
    const li = document.createElement("li");
    li.textContent = item.nome;
    lista.appendChild(li);
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

  // Esconde resultados anteriores
  document.getElementById("resultado").classList.add("escondido");
  document.getElementById("secao-pix").style.display = "none";

  document.getElementById("roleta-container").classList.remove("escondido");
  document.getElementById("btn-girar").disabled = true;
  document.getElementById("btn-girar").textContent = "Girando...";

  const indiceSorteado = Math.floor(Math.random() * ITENS.length);
  const itemSorteado = ITENS[indiceSorteado];

  const roleta = document.getElementById("roleta");
  const tamanhoFatia = 360 / ITENS.length;

  const centroFatia = indiceSorteado * tamanhoFatia + tamanhoFatia / 2;
  const voltasExtras = 5 * 360;
  const rotacaoFinal = voltasExtras + (360 - centroFatia);

  // FORÇA O NAVEGADOR A RENDERIZAR ANTES DE GIRAR (Correção da animação)
  roleta.style.transition = "none";
  roleta.style.transform = "rotate(0deg)";

  setTimeout(() => {
    roleta.style.transition =
      "transform 4s cubic-bezier(0.17, 0.67, 0.12, 0.99)";
    roleta.style.transform = `rotate(${rotacaoFinal}deg)`;
  }, 50);

  // Aguarda a animação de 4 segundos terminar
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
  }, 4100);
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

// --- PIX ---
document.getElementById("btn-ir-para-pix").addEventListener("click", () => {
  const secaoPix = document.getElementById("secao-pix");
  secaoPix.style.display = "block";
  secaoPix.scrollIntoView({ behavior: "smooth", block: "center" });
});

document.getElementById("btn-copiar-pix").addEventListener("click", () => {
  if (navigator.clipboard) {
    navigator.clipboard
      .writeText(CHAVE_PIX)
      .then(() => {
        const btn = document.getElementById("btn-copiar-pix");
        const textoOriginal = btn.textContent;
        btn.textContent = "✅ Chave Copiada!";
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
      .catch(() => {
        alert("Não foi possível copiar. Por favor, anote a chave manualmente.");
      });
  }
});

// --- COPIAR ENDEREÇO ---
document.getElementById("btn-copiar-endereco").addEventListener("click", () => {
  const textoEndereco = `Rua: São Crispim, 57 - Casa 3 - Fundos
Bairro: Jardim Seckler, São Paulo - SP
CEP: 04242-030
Entregar para: Jackeline ou Eraldo`;

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
      .catch(() => {
        alert(
          "Não foi possível copiar automaticamente. Selecione o texto manualmente.",
        );
      });
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
    document.getElementById("secao-pix").style.display = "none";

    const roleta = document.getElementById("roleta");
    roleta.style.transition = "none";
    roleta.style.transform = "rotate(0deg)";
  }
});

// --- INICIALIZAÇÃO ---
document.getElementById("form-sorteio").addEventListener("submit", (e) => {
  e.preventDefault();
  sortear();
});

// Executa ao carregar a página
desenharRoleta();
atualizarListaSugestoes();
iniciarChuvaDeEmojis();

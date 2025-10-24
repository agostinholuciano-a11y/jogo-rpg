let playerLives = 3;
// ===================================
// ELEMENTOS DO DOM
// ===================================

const player = document.getElementById('player');
const playerInfo = document.getElementById('player-info');
const gameWorld = document.getElementById('game-world');


// ===================================
// CONFIGURAÇÃO DO PERSONAGEM
// ===================================

let character = {
    nome: "Luciano",
    classe: "Cavaleiro",
    vida: 150,
    vidaMaxima: 150,
    nivel: 1,
    experiencia: 0,
    emoji: "🛡️"
};

// ===================================
// VARIÁVEIS DE POSIÇÃO E MOVIMENTO
// ===================================

let playerX = 50;
let playerY = 180;
let playerSpeed = 10;
let lastDirection = 'right';

// Segundo jogador
let player2X = 50;
let player2Y = 220;
let player2Lives = 3;
let player2Element;


// ===================================
// SISTEMA DE QUESTS/MISSÕES
// ===================================

// Adicione junto com outras variáveis globais (playerX, items, etc.)
let quests = {
    ativa: null, // Missão atualmente ativa
    completas: []
};

// Variáveis DOM
const questNome = document.getElementById('quest-nome');
const questProgresso = document.getElementById('quest-progresso');

// Lista de todas as missões disponíveis (Você pode expandir esta lista)
const listaDeQuests = [
    {
        id: 1,
        nome: "Colete 10 moedas",
        descricao: "O comerciante da floresta precisa de 10 moedas para seu estoque. As moedas brilham!",
        tipo: "coletar",
        alvo: "moeda",
        meta: 10,
        recompensa: { tipo: "ataque", valor: 5, emoji: "🗡️" } // Recompensa de ataque permanente
    },
    {
        id: 2,
        nome: "Derrote 5 Inimigos",
        descricao: "Prove sua força! Livre-se de 5 criaturas malignas.",
        tipo: "derrotar",
        alvo: "inimigo",
        meta: 5,
        recompensa: { tipo: "vidaMaxima", valor: 20, emoji: "💖" } // Recompensa de vida máxima
    }
    // Adicione mais missões aqui...
];

// ===================================
// SISTEMA DE MISSÕES (QUESTS)
// ===================================

function iniciarQuest(quest) {
    quests.ativa = {
        ...quest,
        progresso: 0 // Inicia o progresso da quest
    };
    // Inicializa o painel para mostrar a missão
    updateQuestPanel();
    console.log(`📜 Nova Missão: ${quest.nome}`);
}

function updateQuestPanel() {
    if (quests.ativa) {
        questNome.innerHTML = `${quests.ativa.emoji ? quests.ativa.emoji + " " : ""}${quests.ativa.nome}`;
        questProgresso.innerHTML = `Progresso: ${quests.ativa.progresso}/${quests.ativa.meta}`;
    } else {
        questNome.innerHTML = "Nenhuma missão ativa.";
        questProgresso.innerHTML = "Fale com um NPC ou encontre um item especial!";
    }
}

function verificarProgresso(tipo, valor = 1) {
    if (!quests.ativa) return;

    if (quests.ativa.tipo === tipo && quests.ativa.alvo === valor) {
        quests.ativa.progresso += 1;
        updateQuestPanel();
        
        if (quests.ativa.progresso >= quests.ativa.meta) {
            completarQuest(quests.ativa);
        }
    }
}

function completarQuest(quest) {
    alert(`🎉 MISSÃO CONCLUÍDA: ${quest.nome}! Recompensa: ${quest.recompensa.emoji}`);
    
    // Aplicar a recompensa
    switch (quest.recompensa.tipo) {
        case "ataque":
            character.ataque += quest.recompensa.valor;
            alert(`Ataque aumentado em +${quest.recompensa.valor}! Novo ataque: ${character.ataque}`);
            break;
        case "vidaMaxima":
            character.vidaMaxima += quest.recompensa.valor;
            character.vida = character.vidaMaxima; // Cura total
            alert(`Vida Máxima aumentada em +${quest.recompensa.valor}! Nova vida máxima: ${character.vidaMaxima}`);
            break;
        // Adicione mais tipos de recompensa (EXP, moedas, itens, etc.)
    }

    // Mover para as completas e limpar a ativa
    quests.completas.push(quest);
    quests.ativa = null;

    // Inicia a próxima missão (se houver)
    const proximaQuest = listaDeQuests.find(q => q.id === quest.id + 1);
    if (proximaQuest) {
        iniciarQuest(proximaQuest);
    } else {
        updateQuestPanel(); // Atualiza para "Nenhuma missão ativa"
    }
}

// ===================================
// ATUALIZAÇÃO DO PAINEL DE QUESTS
// ===================================

function updateQuestDisplay() {
    let questPanel = document.getElementById('quest-panel');
    
    if (!questPanel) {
        // Crie o painel se ele não existir (recomendado colocar no HTML)
        questPanel = document.createElement('div');
        questPanel.id = 'quest-panel';
        // Adicione onde você desejar que ele apareça, por exemplo, dentro de #info-panel
        document.getElementById('info-panel').appendChild(questPanel); 
    }
    
    if (quests.ativa) {
        const quest = quests.ativa;
        questPanel.innerHTML = `
            <hr>
            <strong>📜 MISSÃO ATIVA:</strong> ${quest.nome}<br>
            <em>Objetivo: ${quest.descricao}</em><br>
            Progresso: ${quest.progresso}/${quest.meta} ${quest.alvo.toUpperCase()}
            `;
        questPanel.style.display = 'block';
    } else {
        questPanel.innerHTML = '📜 Nenhuma missão ativa.';
        questPanel.style.display = 'none'; // Oculta se não houver missão
    }
}


// ===================================
// SISTEMA DE FASES
// ===================================

let currentLevel = 1;
let itemsCollected = 0;
let enemiesDefeated = 0;
let levelStartTime = Date.now();
let exitDoor = null;
let hasKey = false;

const levels = {
    1: {
        nome: "Floresta dos Iniciantes",
        objetivo: "Colete 6 itens",
        backgroundColor: "#2d4a2e",
        itemsNeeded: 6
    },
    2: {
        nome: "Caverna Sombria",
        objetivo: "Sobreviva por 30 segundos",
        backgroundColor: "#1a1a2e",
        timeLimit: 30
    },
    3: {
        nome: "Castelo Final",
        objetivo: "Encontre a saída!",
        backgroundColor: "#4a2d2d",
        hasExit: true
    },
    4: {
        nome: "Arena do Desafio",
        objetivo: "Derrote todos os inimigos!",
        backgroundColor: "#5a2d2d",
        bossLevel: true
    }
};

// ===================================
// SISTEMA DE ITENS E INIMIGOS
// ===================================

let items = [];
let enemies = [];

// ===================================
// SISTEMA DE INVENTÁRIO
// ===================================

let inventory = [];
let maxInventorySize = 10;

// ===================================
// FUNÇÕES DE GESTÃO DE QUESTS
// ===================================

// Função para iniciar uma quest
function activateQuest(questId) {
    const quest = quests.disponiveis.find(q => q.id === questId);

    if (!quest) {
        console.error("Quest não encontrada com o ID:", questId);
        return;
    }
    
    if (quests.ativa) {
        console.log("Já existe uma missão ativa.");
        return;
    }
    
    // Cria uma cópia da quest e inicializa o progresso
    quests.ativa = { ...quest, progresso: 0 };
    console.log(`📜 Missão Ativa: ${quests.ativa.nome}`);
    updateInfoPanel();
    updateQuestDisplay();
}

// Função para atualizar o progresso (chamada por outras funções do jogo)
function updateQuestProgress(tipoAlvo, quantidade = 1) {
    if (!quests.ativa || quests.ativa.tipo !== 'coleta' || quests.ativa.alvo !== tipoAlvo) {
        return;
    }

    quests.ativa.progresso = Math.min(quests.ativa.progresso + quantidade, quests.ativa.meta);
    console.log(`Progresso da Missão: ${quests.ativa.progresso}/${quests.ativa.meta}`);
    
    updateQuestDisplay();
    
    if (quests.ativa.progresso >= quests.ativa.meta) {
        completeQuest();
    }
}

// Função para completar a quest
function completeQuest() {
    console.log(`🎉 Missão Concluída: ${quests.ativa.nome}!`);
    
    const recompensa = quests.ativa.recompensa;
    
    // Lógica de Recompensa
    if (recompensa.tipo === "espada") {
        // Exemplo: Adiciona um item/melhoria ao personagem
        console.log(`Você recebeu a recompensa: ${recompensa.nome} ${recompensa.emoji}`);
        
        // Simplesmente aumenta o ataque para o exemplo
        abilities.attack.dano += recompensa.dano; 
        console.log(`Seu dano de ataque aumentou para ${abilities.attack.dano}!`);
        
        // Adicionar o item ao inventário (se você tiver uma função)
        addToInventory(recompensa);
        
    } else if (recompensa.tipo === "experiencia") {
        character.experiencia += recompensa.valor;
        checkLevelUp();
    }
    // ... Adicione mais tipos de recompensa aqui (ouro, itens, etc.)
    
    quests.ativa = null; // Limpa a quest ativa
    updateQuestDisplay();
    updateInfoPanel();
}

// ===================================
// SISTEMA DE NPCs
// ===================================

function createNPCs() {
    // Remove NPCs antigos, caso existam
    document.querySelectorAll('.npc').forEach(el => el.remove());

    npcs.forEach((npc, index) => {
        const npcElement = document.createElement('div');
        npcElement.className = 'npc';
        // A chave é usar um ID único/indexado
        const npcElementId = 'npc-' + index; 
        npcElement.id = npcElementId;
        
        npcElement.style.position = 'absolute';
        npcElement.style.left = npc.x + 'px';
        npcElement.style.top = npc.y + 'px';
        npcElement.style.fontSize = '35px';
        npcElement.innerHTML = npc.emoji;
        npcElement.style.cursor = 'pointer';

        // NOTE: MANTENHA O CLIQUE MANUAL para que o diálogo funcione APÓS o auto-desaparecimento
        npcElement.addEventListener('click', () => {
            showNPCDialog(npc);
        });

        gameWorld.appendChild(npcElement);
    });
}

function showNPCDialog(npc) {
    // Remove diálogo antigo
    const oldDialog = document.getElementById('npc-dialog');
    if (oldDialog) oldDialog.remove();

    // Cria caixa de diálogo
    const dialogBox = document.createElement('div');
    dialogBox.id = 'npc-dialog';
    dialogBox.style.position = 'absolute';
    dialogBox.style.left = (npc.x + 50) + 'px';
    dialogBox.style.top = (npc.y - 2) + 'px';
    dialogBox.style.padding = '5px 5px';
    dialogBox.style.background = 'rgba(0,0,0,0.7)';
    dialogBox.style.color = 'white';
    dialogBox.style.borderRadius = '10px';
    dialogBox.style.fontSize = '12px';
    dialogBox.style.maxWidth = '280px';
    dialogBox.innerHTML = `<strong>${npc.nome}:</strong><br>${npc.dialogo}`;

    gameWorld.appendChild(dialogBox);

    // Fecha o diálogo após 4 segundos
    setTimeout(() => {
        dialogBox.remove();
    }, 4000);
}

// ===================================
// SISTEMA DE NPCs
// ===================================

// ... (Restante do seu código de NPCs) ...

// **NOVA FUNÇÃO: Exibe o NPC e o Diálogo automaticamente por um tempo**
// **FUNÇÃO MELHORADA: Exibe o Diálogo e faz o NPC sumir automaticamente**
// Agora ela recebe o objeto NPC e o ID do elemento DOM correspondente.
function showAutomaticDialog(npc, npcElementId, duration = 5000) {
    
    const npcElement = document.getElementById(npcElementId);

    if (!npcElement) {
        console.error(`NPC com ID ${npcElementId} não encontrado na tela.`);
        return;
    }

    // 1. Mostrar o Diálogo (Cria uma nova caixa de diálogo para este evento)
    // Usamos um ID baseado no ID do NPC para evitar conflitos se mais de um estiver falando.
    const dialogId = `npc-dialog-auto-${npcElementId}`;
    const oldDialog = document.getElementById(dialogId);
    if (oldDialog) oldDialog.remove(); // Limpa diálogos anteriores deste NPC, se houver.

    const dialogBox = document.createElement('div');
    dialogBox.id = dialogId;
    dialogBox.style.position = 'absolute';
    // Posição ajustada a partir do NPC
    dialogBox.style.left = (npc.x + 50) + 'px';
    dialogBox.style.top = (npc.y - 2) + 'px'; 
    dialogBox.style.padding = '5px 5px';
    dialogBox.style.background = 'rgba(0,0,0,0.8)';
    dialogBox.style.color = 'yellow';
    dialogBox.style.borderRadius = '10px';
    dialogBox.style.fontSize = '14px';
    dialogBox.style.maxWidth = '280px';
    dialogBox.style.zIndex = '100';
    dialogBox.innerHTML = `<strong>${npc.nome}:</strong><br>${npc.dialogo}`;

    gameWorld.appendChild(dialogBox);

    // 2. Remover ambos (NPC e Diálogo) após a duração
    setTimeout(() => {
        // Remove a caixa de diálogo
        dialogBox.remove(); 
        
        // Remove o NPC da tela (Elemento DOM)
        if (npcElement) {
            npcElement.remove(); 
        }
        
        // Opcional: Remover o NPC do array lógico para que ele não reapareça 
        // em futuras chamadas a createNPCs() (se você a chamar novamente)
        const index = npcs.findIndex(n => n.nome === npc.nome && n.x === npc.x && n.y === npc.y);
        if (index > -1) {
             // Remova apenas a entrada do NPC se ele foi removido da tela.
             // Se você quer que o NPC suma apenas na inicialização, mas fique para futuros cliques,
             // COMENTE a linha abaixo.
             npcs.splice(index, 1); 
        }
    }, duration);
}

// **NOVA FUNÇÃO: Configura os diálogos automáticos para a introdução da fase**
function setupLevelIntroDialogs(duration = 5000) {
    // Opcional: Defina quais NPCs devem aparecer e desaparecer
    // Por simplicidade, vamos fazer TODOS os NPCs aparecerem e desaparecerem na introdução.
    
    // ATENÇÃO: É crucial que esta função seja chamada DEPOIS de createNPCs()
    
    npcs.forEach((npc, index) => {
        const npcElementId = 'npc-' + index; 
        
        // Chamamos a função de diálogo automático para cada NPC
        // Se você quiser que apenas um NPC fale, coloque um `if` aqui (ex: `if (index === 0)`).
        showAutomaticDialog(npc, npcElementId, duration);
    });
}

// ===================================
// SISTEMA DE HABILIDADES
// ===================================

let abilities = {
    attack: {
        nome: "Ataque Especial",
        cooldown: 3000,
        lastUsed: 0,
        dano: 30,
        alcance: 80,
        tecla: "Space"
    },
    dash: {
        nome: "Corrida Rápida",
        cooldown: 5000,
        lastUsed: 0,
        distancia: 60,
        tecla: "Shift"
    }
};

// ===================================
// SISTEMA DE SONS
// ===================================

const sounds = {
    collect: function() {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            oscillator.frequency.value = 800;
            oscillator.type = 'sine';
            
            gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.2);
            
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.2);
        } catch(e) {
            console.log("Áudio não disponível");
        }
    },
    
    damage: function() {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            oscillator.frequency.value = 200;
            oscillator.type = 'sawtooth';
            
            gainNode.gain.setValueAtTime(0.3, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.3);
            
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.3);
        } catch(e) {
            console.log("Áudio não disponível");
        }
    },
    
    levelUp: function() {
        try {
            const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
            const oscillator = audioCtx.createOscillator();
            const gainNode = audioCtx.createGain();
            
            oscillator.connect(gainNode);
            gainNode.connect(audioCtx.destination);
            
            oscillator.frequency.setValueAtTime(400, audioCtx.currentTime);
            oscillator.frequency.exponentialRampToValueAtTime(800, audioCtx.currentTime + 0.5);
            oscillator.type = 'square';
            
            gainNode.gain.setValueAtTime(0.2, audioCtx.currentTime);
            gainNode.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.5);
            
            oscillator.start(audioCtx.currentTime);
            oscillator.stop(audioCtx.currentTime + 0.5);
        } catch(e) {
            console.log("Áudio não disponível");
        }
    }
};

// ===================================
// INICIALIZAÇÃO DO PERSONAGEM
// ===================================

function initializePlayer() {
    player.innerHTML = character.emoji;
    player.style.fontSize = "30px";
    player.style.display = "flex";
    player.style.alignItems = "center";
    player.style.justifyContent = "center";
}

function initializePlayer2() {
    player2Element = document.createElement("div");
    player2Element.id = "player2";
    player2Element.style.position = "absolute";
    player2Element.style.left = player2X + "px";
    player2Element.style.top = player2Y + "px";
    player2Element.style.fontSize = "40px";
    player2Element.textContent = "🧙‍♂️"; // Escolha o emoji que quiser
    gameWorld.appendChild(player2Element);
}


// ===================================
// MOVIMENTO DO PERSONAGEM
// ===================================

function movePlayer(direction) {
    if (direction === 'up') {
        playerY -= playerSpeed;
    } else if (direction === 'down') {
        playerY += playerSpeed;
    } else if (direction === 'left') {
        playerX -= playerSpeed;
    } else if (direction === 'right') {
        playerX += playerSpeed;
    }


    // Limites da tela
    if (playerX < 0) playerX = 0;
    if (playerX > 760) playerX = 760;
    if (playerY < 0) playerY = 0;
    if (playerY > 360) playerY = 360;

    // Atualiza posição na tela
    player.style.left = playerX + 'px';
    player.style.top = playerY + 'px';

    // Verifica colisões e coletas
    checkItemCollection();
    checkLevelComplete(); 
    updateInfoPanel();
}

function movePlayer2(direction) {
    const step = 10;
    if (direction === 'up') {
        player2Y -= step;
    } else if (direction === 'down') {
        player2Y += step;
    }else if (direction === 'left') {
        player2X -= step;
    }else if (direction === 'right') {
        player2X += step;
    }    
    player2Element.style.left = player2X + 'px';
    player2Element.style.top = player2Y + 'px';
}   
// ===================================
// EFEITOS VISUAIS
// ===================================

function createParticles(x, y, color, count) {
    for (let i = 0; i < count; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';
        particle.style.position = 'absolute';
        particle.style.left = x + 'px';
        particle.style.top = y + 'px';
        particle.style.width = '5px';
        particle.style.height = '5px';
        particle.style.background = color;
        particle.style.borderRadius = '50%';
        particle.style.pointerEvents = 'none';
        
        const angle = (Math.PI * 2 * i) / count;
        const velocity = 2 + Math.random() * 2;
        const vx = Math.cos(angle) * velocity;
        const vy = Math.sin(angle) * velocity;
        
        gameWorld.appendChild(particle);
        
        let posX = x;
        let posY = y;
        let life = 30;
        
        const animateParticle = setInterval(function() {
            posX += vx;
            posY += vy;
            life--;
            
            particle.style.left = posX + 'px';
            particle.style.top = posY + 'px';
            particle.style.opacity = life / 30;
            
            if (life <= 0) {
                particle.remove();
                clearInterval(animateParticle);
            }
        }, 16);
    }
}

// ===================================
// SISTEMA DE LEVEL UP
// ===================================

function checkLevelUp() {
    let expNecessaria = character.nivel * 100;
    
    if (character.experiencia >= expNecessaria) {
        character.nivel++;
        character.experiencia -= expNecessaria;
        character.vidaMaxima += 20;
        character.vida = character.vidaMaxima;
        
        sounds.levelUp();
        createParticles(playerX + 20, playerY + 20, '#FFD700', 12);
        
        console.log("🎊 LEVEL UP! Agora você é nível " + character.nivel);
    }
}

// ===================================
// SISTEMA DE ITENS
// ===================================

function createItems() {
    // remove todos os itens antigos antes de recriar
    document.querySelectorAll('[id^="item-"]').forEach(el => el.remove());

    items.forEach((item) => {
        const itemElement = document.createElement('div');
        itemElement.className = 'item';
        itemElement.style.position = 'absolute';
        itemElement.style.left = item.x + 'px';
        itemElement.style.top = item.y + 'px';
        itemElement.style.fontSize = '30px';
        itemElement.innerHTML = item.emoji;
        itemElement.dataset.id = crypto.randomUUID(); // ID único
        item.id = itemElement.dataset.id; // vincula ao objeto JS

        gameWorld.appendChild(itemElement);
    });
}


function checkItemCollection() {
    // percorre de trás pra frente pra evitar conflito no splice
    for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        const distanceX = Math.abs(playerX - item.x);
        const distanceY = Math.abs(playerY - item.y);

        if (distanceX < 35 && distanceY < 35) {
            // pega o elemento DOM certo pelo id único
            const itemElement = document.querySelector(`[data-id='${item.id}']`);
            if (itemElement) itemElement.remove();

            // efeitos do item
            if (item.tipo === "cura") {
                character.vida = Math.min(character.vida + 20, character.vidaMaxima);
                console.log("❤️ Vida restaurada!");
            } else if (item.tipo === "chave") {
                hasKey = true;
                console.log("🔑 Você pegou a chave!");
            } else {
                character.experiencia += 20;
                itemsCollected++;
                console.log("⭐ Item coletado! Total:", itemsCollected);
                checkLevelUp();

                if (item.tipo) {
                    updateQuestProgress(item.tipo, 1); // Passa o tipo do item e a quantidade (1)
                }
            }

            verificarProgresso("coletar", item.tipo);
            

            // remove o item do array
            items.splice(i, 1);
            updateInfoPanel();
            checkLevelComplete();
        }
    }
}

function checkItemCollectionPlayer2() {
    for (let i = items.length - 1; i >= 0; i--) {
        const item = items[i];
        const distanceX = Math.abs(player2X - item.x);
        const distanceY = Math.abs(player2Y - item.y);

        if (distanceX < 35 && distanceY < 35) {
            const itemElement = document.querySelector(`[data-id='${item.id}']`);
            if (itemElement) itemElement.remove();

            // efeitos do item (independentes do Player 1)
            if (item.tipo === "cura") {
                console.log("❤️ Player 2 curou vida!");
            } else if (item.tipo === "chave") {
                hasKey = true;
                console.log("🔑 Player 2 pegou a chave!");
            } else {
                itemsCollected++;
                console.log("⭐ Player 2 coletou item! Total:", itemsCollected);
                if (item.tipo) {
                    updateQuestProgress(item.tipo, 1);
                }
            }

            verificarProgresso("coletar", item.tipo);
            items.splice(i, 1);
            updateInfoPanel();
            checkLevelComplete();
        }
    }
}

// ===================================
// SISTEMA DE INVENTÁRIO
// ===================================

function addToInventory(item) {
    if (inventory.length < maxInventorySize) {
        inventory.push({
            tipo: item.tipo,
            emoji: item.emoji,
            nome: item.tipo.toUpperCase()
        });
        console.log("📦 Adicionado ao inventário: " + item.emoji);
        updateInventoryDisplay();
        return true;
    } else {
        console.log("⚠️ Inventário cheio!");
        return false;
    }
}

function updateInventoryDisplay() {
    let inventoryPanel = document.getElementById('inventory-panel');
    
    if (!inventoryPanel) {
        inventoryPanel = document.createElement('div');
        inventoryPanel.id = 'inventory-panel';
        document.getElementById('info-panel').appendChild(inventoryPanel);
    }
    
    let inventoryHTML = '<strong>🎒 Inventário (' + inventory.length + '/' + maxInventorySize + '):</strong> ';
    
    if (inventory.length === 0) {
        inventoryHTML += '<em>Vazio</em>';
    } else {
        inventory.forEach(function(item) {
            inventoryHTML += item.emoji + ' ';
        });
    }
    
    inventoryPanel.innerHTML = inventoryHTML;
}

// ===================================
// SISTEMA DE INIMIGOS
// ===================================

function createEnemies() {
    // Apenas garante que os elementos DOM sejam criados 
    // com base no array 'enemies' atual.
    updateEnemiesDOM();
}

function moveEnemies() {
    enemies.forEach(function(enemy, index) {
        enemy.x += enemy.velocidade * enemy.direcao;
        
        if (enemy.x <= 0 || enemy.x >= 760) {
            enemy.direcao *= -1;
        }
        
        const enemyElement = document.getElementById('enemy-' + index);
        if (enemyElement) {
            enemyElement.style.left = enemy.x + 'px';
        }
    });
}

function checkEnemyCollision() {
    enemies.forEach(function(enemy) {
        let distanceX = Math.abs(playerX - enemy.x);
        let distanceY = Math.abs(playerY - enemy.y);
        
        if (distanceX < 40 && distanceY < 40) {
            character.vida -= enemy.dano;
            
            sounds.damage();
            
            playerX -= enemy.direcao * 50;
            if (playerX < 0) playerX = 0;
            if (playerX > 760) playerX = 760;
            
            player.style.left = playerX + 'px';
            
            player.style.background = '#ff0000';
            setTimeout(function() {
                player.style.background = '#ff6b6b';
            }, 200);
            
            console.log("💥 Recebeu " + enemy.dano + " de dano!");
            
            if (character.vida <= 0) {
                gameOver();
            }
            
            updateInfoPanel();
        }
    });
}

function checkEnemyCollisionPlayer2() {
    for (let i = 0; i < enemies.length; i++) {
        const enemy = enemies[i];

        const distanceX = Math.abs(player2X - enemy.x);
        const distanceY = Math.abs(player2Y - enemy.y);

        // distância de colisão parecida com o Player 1
        if (distanceX < 35 && distanceY < 35) {
            console.log("💥 Player 2 foi atingido por um inimigo!");

            // reduz vida ou trata o dano separado do Player 1
            player2Vida -= enemy.dano;
            if (player2Vida < 0) player2Vida = 0;

            // animação de dano (opcional)
            player2.style.filter = "brightness(0.6)";
            setTimeout(() => {
                player2.style.filter = "brightness(1)";
            }, 200);

            if (player2Vida <= 0) {
                console.log("☠️ Player 2 morreu!");
                // reinicia posição ou remove do jogo
                player2X = 50;
                player2Y = 180;
                player2Vida = player2VidaMaxima; // se quiser reiniciar vida
                player2.style.left = player2X + "px";
                player2.style.top = player2Y + "px";
            }
        }
    }
}


// ===================================
// SISTEMA DE HABILIDADES
// ===================================

function useAttack() {
    const now = Date.now();
    const ability = abilities.attack;

    if (now - ability.lastUsed < ability.cooldown) {
        const timeLeft = Math.ceil((ability.cooldown - (now - ability.lastUsed)) / 1000);
        console.log("⏳ Aguarde " + timeLeft + "s para atacar novamente");
        return;
    }

    ability.lastUsed = now;
    createAttackEffect();

    let enemiesHit = []; // Guardar quem foi atingido

    // 1. Verificar colisões e marcar para remoção (se for atingido)
    for (let i = enemies.length - 1; i >= 0; i--) {
        const enemy = enemies[i];
        const enemyElement = document.getElementById("enemy-" + i);

        if (!enemyElement) continue;

        const distanceX = Math.abs(playerX - enemy.x);
        const distanceY = Math.abs(playerY - enemy.y);

        if (distanceX < ability.alcance && distanceY < ability.alcance) {
            enemiesHit.push({ index: i, element: enemyElement });
        }
    }

    // 2. Aplicar efeitos, remover do DOM e do array lógico
    enemiesHit.forEach(({ index, element }) => {
        // 💥 efeito de impacto
        element.innerHTML = "💥";
        element.style.transition = "transform 0.2s";
        element.style.transform = "scale(1.5)";

        // A remoção visual e lógica é feita após um pequeno atraso
        setTimeout(() => {
            if (element && element.parentNode) {
                element.remove();
            }
            
            // Incrementa EXP/Contador apenas quando o inimigo for removido
            character.experiencia += 50;
            enemiesDefeated++;
            console.log("💀 Inimigo derrotado! +50 EXP");
            checkLevelUp();

            // Reconstrução dos inimigos restantes deve ser feita APÓS a remoção lógica
            // A remoção lógica acontece abaixo, fora do loop de setTimeout.
            // Para evitar problemas de índice com o `splice` dentro do loop, 
            // a remoção lógica será feita de uma vez só.

        }, 200);
    });

    // Remover os inimigos logicamente do array *depois* do loop de iteração
    const indicesToRemove = enemiesHit.map(h => h.index).sort((a, b) => b - a);
    indicesToRemove.forEach(index => {
        enemies.splice(index, 1);
    });
    
    // **A CHAVE DA CORREÇÃO:** Recriar os inimigos restantes.
    // Isso garante que eles tenham novos IDs no DOM que coincidam 
    // com seus novos índices no array `enemies`.
    updateEnemiesDOM();

    // garante que após o ataque ele reavalie o término da fase
    setTimeout(checkLevelComplete, 300);
}

// Opcional: Adicionar uma função auxiliar para gerenciar o DOM dos inimigos
function updateEnemiesDOM() {
    // 1. Remove todos os elementos DOM de inimigos existentes
    document.querySelectorAll('.enemy').forEach(el => el.remove());

    // 2. Recria os elementos DOM para os inimigos restantes, garantindo 
    // que o ID do DOM corresponda ao seu índice no array 'enemies'
    enemies.forEach(function(enemy, index) {
        const enemyElement = document.createElement('div');
        enemyElement.id = 'enemy-' + index; // O ID DEVE SER O NOVO ÍNDICE
        enemyElement.className = 'enemy';
        enemyElement.style.position = 'absolute';
        enemyElement.style.left = enemy.x + 'px';
        enemyElement.style.top = enemy.y + 'px';
        enemyElement.style.fontSize = '30px';
        enemyElement.innerHTML = enemy.emoji;
        
        gameWorld.appendChild(enemyElement);
    });
}



function useDash(direction) {
    const now = Date.now();
    const ability = abilities.dash;
    
    if (now - ability.lastUsed < ability.cooldown) {
        const timeLeft = Math.ceil((ability.cooldown - (now - ability.lastUsed)) / 1000);
        console.log("⏳ Aguarde " + timeLeft + "s para correr novamente");
        return;
    }
    
    ability.lastUsed = now;
    console.log("💨 DASH!");
    
    if (direction === 'up') {
        playerY -= ability.distancia;
    } else if (direction === 'down') {
        playerY += ability.distancia;
    } else if (direction === 'left') {
        playerX -= ability.distancia;
    } else if (direction === 'right') {
        playerX += ability.distancia;
    }
    
    if (playerX < 0) playerX = 0;
    if (playerX > 760) playerX = 760;
    if (playerY < 0) playerY = 0;
    if (playerY > 360) playerY = 360;
    
    player.style.transition = 'all 0.2s';
    player.style.transform = 'scale(1.2)';
    player.style.left = playerX + 'px';
    player.style.top = playerY + 'px';
    
    setTimeout(function() {
        player.style.transform = 'scale(1)';
        player.style.transition = 'all 0.1s';
    }, 200);
}

function createAttackEffect() {
    const effect = document.createElement('div');
effect.style.position = 'absolute';
    effect.style.left = (playerX - 20) + 'px';
    effect.style.top = (playerY - 20) + 'px';
    effect.style.width = '80px';
    effect.style.height = '80px';
    effect.style.border = '3px solid yellow';
    effect.style.borderRadius = '50%';
    effect.style.pointerEvents = 'none';
    effect.style.animation = 'attack-pulse 0.5s ease-out';
    
    gameWorld.appendChild(effect);
    
    setTimeout(function() {
        effect.remove();
    }, 500);
}

// ===================================
// SISTEMA DE FASES
// ===================================

function startLevel(levelNumber) {
    currentLevel = levelNumber;
    const level = levels[levelNumber];

    const oldAutoDialog = document.getElementById('npc-dialog-auto');
    if (oldAutoDialog) oldDialog.remove();
    
    document.querySelectorAll('.enemy').forEach(el => el.remove());
    enemies = [];


    items = [];
    enemies = [];
    itemsCollected = 0;
    hasKey = false;
    
    document.querySelectorAll('.enemy, [id^="item-"], #exit-door').forEach(el => el.remove());
    
    gameWorld.style.background = level.backgroundColor;
    
    playerX = 50;
    playerY = 180;
    player.style.left = playerX + 'px';
    player.style.top = playerY + 'px';
    
    console.log("🎮 Fase " + levelNumber + ": " + level.nome);
    console.log("🎯 Objetivo: " + level.objetivo);
    
    if (levelNumber === 1) {
        setupLevel1();
    } else if (levelNumber === 2) {
        setupLevel2();
    } else if (levelNumber === 3) {
        setupLevel3();
    } else if (levelNumber === 4) {
    setupLevel4();
    }

    
    updateInfoPanel();
}

function setupLevel1() {
    items = [
        { x: 200, y: 100, tipo: "moeda", emoji: "💰", valor: 10 },
        { x: 400, y: 200, tipo: "poção", emoji: "🧪", valor: 20 },
        { x: 600, y: 150, tipo: "estrela", emoji: "⭐", valor: 50 },
        { x: 300, y: 300, tipo: "diamante", emoji: "💎", valor: 30 },
        { x: 700, y: 50, tipo: "gema", emoji: "💠", valor: 75 },
        { x: 100, y: 350, tipo: "coroa", emoji: "👑", valor: 100 }
    ];
    
    enemies = [
        { x: 350, y: 100, direcao: 1, velocidade: 2, emoji: "🐛", dano: 5 },
        { x: 600, y: 250, direcao: -1, velocidade: 3, emoji: "🦂", dano: 12 }
    ];

    npcs = [
        { 
            x: 0, 
            y: 0, 
            emoji: "🧙‍♂️", 
            nome: "Mago Sábio", 
            dialogo: "Bem-vindo, jovem aventureiro! Derrote as criaturas e colete os itens!" 
        },
        { 
            x: 350, 
            y: 0, 
            emoji: "🐿️", 
            nome: "Esquilo Falante", 
            dialogo: "Esta floresta é viva... ouve o som? As árvores sussurram perigo."
        }
    ];
    
    createItems();
    createEnemies();
    createNPCs();
    setupLevelIntroDialogs(8000);

}

function setupLevel2() {
    levelStartTime = Date.now();
    
    items = [
        { x: 150, y: 150, tipo: "cura", emoji: "❤️", valor: 0 },
        { x: 650, y: 250, tipo: "cura", emoji: "❤️", valor: 0 }
    ];
    
    enemies = [
        { x: 300, y: 100, direcao: 1, velocidade: 3, emoji: "🦇", dano: 10 },
        { x: 500, y: 250, direcao: -1, velocidade: 4, emoji: "👻", dano: 15 },
        { x: 200, y: 300, direcao: 1, velocidade: 2, emoji: "🕷️", dano: 8 }
    ];

    npcs = [
        { 
            x: 0, 
            y: 0, 
            emoji: "🧙‍♀️", 
            nome: "Feiticeira do Gelo", 
            dialogo: "O frio da caverna congela o corpo... e o coração. Siga com coragem!" 
        },
        { 
            x: 350, 
            y: 0, 
            emoji: "🦊", 
            nome: "Raposa Astuta", 
            dialogo: "Use o dash com SHIFT para escapar dos ataques rápidos!" 
        }
    ];
    
    createItems();
    createEnemies();
    createNPCs();
    setupLevelIntroDialogs(8000);

}

function setupLevel3() {
    items = [
        { x: 300, y: 100, tipo: "chave", emoji: "🔑", valor: 100 }
    ];
    
    enemies = [
        { x: 200, y: 150, direcao: 1, velocidade: 2, emoji: "🐉", dano: 20 },
        { x: 600, y: 200, direcao: -1, velocidade: 3, emoji: "⚔️", dano: 18 }
    ];
    
     npcs = [
        { 
            x: 0, 
            y: 0, 
            emoji: "🧝‍♀️", 
            nome: "Elfa Guardiã", 
            dialogo: "Esse castelo esconde muitos perigos!" 
        },
        { 
            x: 350, 
            y: 0, 
            emoji: "🐺", 
            nome: "Camelo Viajante", 
            dialogo: "Pegue a chave para escapar!" 
        }
    ];

    createItems();
    createEnemies();
    createNPCs();
    createExitDoor();
    setupLevelIntroDialogs(8000);
}

function setupLevel4() {
    items = [
        { x: 400, y: 200, tipo: "cura", emoji: "❤️", valor: 0 }
    ];
    
    enemies = [
        { x: 200, y: 100, direcao: 1, velocidade: 4, emoji: "👹", dano: 25 },
        { x: 600, y: 300, direcao: -1, velocidade: 5, emoji: "💀", dano: 30 }
    ];

     npcs = [
        { 
            x: 0, 
            y: 0, 
            emoji: "🧞‍♂️", 
            nome: "Gênio da Areia", 
            dialogo: "O calor é mortal... apenas os mais sábios sobrevivem aqui." 
        },
        { 
            x: 350, 
            y: 0, 
            emoji: "🐫", 
            nome: "Camelo Viajante", 
            dialogo: "Você pode me usar como abrigo, mas não por muito tempo!" 
        }
    ];
    
    createItems();
    createEnemies();
    createNPCs();
    setupLevelIntroDialogs(8000);
}


function createExitDoor() {
    exitDoor = { x: 700, y: 300 };
    
    const doorElement = document.createElement('div');
    doorElement.id = 'exit-door';
    doorElement.style.position = 'absolute';
    doorElement.style.left = exitDoor.x + 'px';
    doorElement.style.top = exitDoor.y + 'px';
    doorElement.style.fontSize = '40px';
    doorElement.innerHTML = '🚪';
    
    gameWorld.appendChild(doorElement);
}

function checkLevelComplete() {
    const level = levels[currentLevel];
    
function checkLevelComplete() {
    // limpa inimigos mortos que possam ter ficado no DOM
    enemies = enemies.filter(enemy => {
        const el = document.getElementById("enemy-" + enemies.indexOf(enemy));
        return el !== null;
    });

    if (enemies.length === 0) {
        console.log("🏁 Fase concluída!");
        showExitDoor();
    }
}


    if (currentLevel === 1 && itemsCollected >= level.itemsNeeded) {
        alert("🎉 Fase 1 completa!");
        startLevel(2);
        return;
    }

    if (currentLevel === 2) {
        let timeElapsed = (Date.now() - levelStartTime) / 1000;
        if (timeElapsed >= level.timeLimit) {
            alert("🎉 Fase 2 completa!");
            startLevel(3);
            return;
        }
    }

    if (currentLevel === 3 && exitDoor) {
        let distanceX = Math.abs(playerX - exitDoor.x);
        let distanceY = Math.abs(playerY - exitDoor.y);
        if (distanceX < 40 && distanceY < 40) {
            if (hasKey) {
                alert("🚪 Você abriu a porta secreta...");
                startLevel(4);
                return;
            }
        }
    }

    // ✅ Final da Fase 4
    if (currentLevel === 4) {
        if (enemies.length === 0) {
            alert("🏆 VOCÊ VENCEU O DESAFIO FINAL! PARABÉNS, CAMPEÃO!");
            location.reload();
            return;
        }
    }
}


// ===================================
// ATUALIZAÇÃO DO PAINEL DE INFORMAÇÕES
// ===================================

function updateInfoPanel() {
    const level = levels[currentLevel];
    let objetivoText = level.objetivo;
    
    if (currentLevel === 1) {
        objetivoText += ` (${itemsCollected}/${level.itemsNeeded})`;
    } else if (currentLevel === 2) {
        let timeLeft = level.timeLimit - Math.floor((Date.now() - levelStartTime) / 1000);
        if (timeLeft < 0) timeLeft = 0;
        objetivoText += ` (${timeLeft}s restantes)`;
    } else if (currentLevel === 3) {
        if (hasKey) {
            objetivoText += " ✅ Chave coletada!";
        } else {
            objetivoText += " 🔑 Encontre a chave primeiro!";
        }
    } else if (currentLevel === 4) {
        objetivoText += ` (${enemiesDefeated}/${enemies.length + enemiesDefeated} inimigos derrotados)`;
    }
    
    playerInfo.innerHTML = `
        <strong>🎮 Fase ${currentLevel}:</strong> ${level.nome}<br>
        <strong>🎯 Objetivo:</strong> ${objetivoText}<br>
        <strong>${character.nome}</strong> (${character.classe}) - Nível ${character.nivel}<br>
        ❤️ Vida: ${character.vida}/${character.vidaMaxima} | 
        ⭐ EXP: ${character.experiencia} | 
        📍 X: ${playerX}, Y: ${playerY}
    `;
}

// ===================================
// GAME OVER
// ===================================

function gameOver() {
    playerLives--;
    
    if (playerLives > 0) {
        alert("💔 Você perdeu uma vida! Vidas restantes: " + playerLives);
        character.vida = character.vidaMaxima;
        playerX = 50;
        playerY = 180;
        player.style.left = playerX + 'px';
        player.style.top = playerY + 'px';
    } else {
        alert("💀 GAME OVER! Você perdeu todas as vidas!\n\nPontuação final: " + character.experiencia + " EXP");
        location.reload();
    }
}


// ===================================
// LOOP PRINCIPAL DO JOGO
// ===================================

function gameLoop() {
    moveEnemies();
    checkEnemyCollision();
    checkItemCollectionPlayer2();
    checkEnemyCollisionPlayer2();

    
    if (currentLevel === 2) {
        checkLevelComplete();
    }
    
    updateInfoPanel();
}

// ===================================
// BLOQUEIA SCROLL DAS SETAS E ESPAÇO
// ===================================
window.addEventListener("keydown", function(event) {
    const keysToBlock = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight", " "];
    if (keysToBlock.includes(event.key)) {
        event.preventDefault(); // Impede a rolagem da página
    }
});

// ===================================
// CONTROLES DO TECLADO
// ===================================

document.addEventListener('keydown', function(event) {
    if (event.key === 'ArrowUp') {
        movePlayer('up');
        lastDirection = 'up';
    } else if (event.key === 'ArrowDown') {
        movePlayer('down');
        lastDirection = 'down';
    } else if (event.key === 'ArrowLeft') {
        movePlayer('left');
        lastDirection = 'left';
    } else if (event.key === 'ArrowRight') {
        movePlayer('right');
        lastDirection = 'right';
    } else if (event.key === ' ' || event.code === 'Space') {
        event.preventDefault();
        useAttack();
    } else if (event.key === 'Shift') {
        useDash(lastDirection);
    }


     if (event.key === 'w' || event.key === 'W') {
        movePlayer2('up');
    } else if (event.key === 's' || event.key === 'S') {
        movePlayer2('down');
    } else if (event.key === 'a' || event.key === 'A') {
        movePlayer2('left');
    } else if (event.key === 'd' || event.key === 'D') {
        movePlayer2('right');
    }
});

// ===================================
// INICIALIZAÇÃO DO JOGO
// ===================================

console.log("🎮 Iniciando jogo...");
console.log("===================================");

initializePlayer();
initializePlayer2();
updateInventoryDisplay();
startLevel(1);

// Inicia o loop do jogo (30 FPS)
setInterval(gameLoop, 1000 / 30);

console.log("✅ Jogo carregado com sucesso!");
console.log("===================================");
console.log("🎯 CONTROLES:");
console.log("   ⬆️⬇️⬅️➡️ = Mover");
console.log("   ESPAÇO = Atacar");
console.log("   SHIFT = Dash");
console.log("===================================");
console.log("Boa sorte, aventureiro! 🗡️");

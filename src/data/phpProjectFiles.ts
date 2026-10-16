export interface PhpFileDefinition {
  filename: string;
  description: string;
  language: 'php' | 'sql' | 'markdown' | 'css';
  content: string;
}

export const PHP_PROJECT_FILES: PhpFileDefinition[] = [
  {
    filename: 'index.php',
    description: 'Layout Principal de Abertura do ERP MFx Tecnologia Industrial com Sidebar Escura, Topbar Ribbon, Logo Centralizado e Status Bar.',
    language: 'php',
    content: `<?php
/**
 * MFx Tecnologia Industrial - Sistema Integrado de Gestão Empresarial (ERP)
 * Arquivo: index.php - Layout Principal de Abertura (Dashboard / Layout Base)
 */
require_once 'conexao.php';

// Consultas rápidas para os contadores do sistema
$totalClientes = (int)$pdo->query("SELECT COUNT(*) FROM clientes")->fetchColumn();
$totalOS = (int)$pdo->query("SELECT COUNT(*) FROM ordens_servico")->fetchColumn();
$faturamentoTotal = (float)$pdo->query("SELECT COALESCE(SUM(valor_total_geral), 0) FROM ordens_servico WHERE status != 'Cancelado'")->fetchColumn();

// Roteamento simples de módulo
$modulo = $_GET['modulo'] ?? 'abertura';
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MFx Tecnologia Industrial - ERP</title>
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- FontAwesome 6 Free -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
    <style>
        :root {
            --mfx-dark: #212529;
            --mfx-darker: #181d24;
            --mfx-red: #dc2626;
            --mfx-orange: #ea580c;
            --mfx-bg: #eef2f6;
            --mfx-border: #e2e8f0;
        }

        body {
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            background-color: var(--mfx-bg);
            color: #334155;
            margin: 0;
            padding: 0;
            height: 100vh;
            overflow: hidden;
            display: flex;
        }

        /* 1. BARRA LATERAL ESQUERDA (SIDEBAR) */
        .erp-sidebar {
            width: 250px;
            background-color: var(--mfx-dark);
            color: #f8fafc;
            display: flex;
            flex-direction: column;
            border-right: 1px solid #1e293b;
            flex-shrink: 0;
            height: 100vh;
            transition: all 0.2s ease-in-out;
            z-index: 100;
        }
        .erp-sidebar.collapsed {
            width: 65px;
        }
        .sidebar-brand {
            height: 60px;
            background-color: var(--mfx-darker);
            border-bottom: 1px solid #2d3748;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 16px;
        }
        .sidebar-brand .logo-text {
            font-size: 1.25rem;
            font-weight: 900;
            letter-spacing: -0.5px;
            color: #ffffff;
        }
        .sidebar-brand .logo-text span { color: var(--mfx-red); }
        .sidebar-brand .badge-tec {
            background-color: #475569;
            font-size: 8px;
            padding: 2px 6px;
            letter-spacing: 2px;
            font-weight: 800;
            border-radius: 3px;
        }
        .sidebar-menu {
            flex: 1;
            overflow-y: auto;
            padding: 10px 8px;
        }
        .sidebar-menu::-webkit-scrollbar { width: 4px; }
        .sidebar-menu::-webkit-scrollbar-thumb { background: #334155; border-radius: 4px; }
        
        .sidebar-section-title {
            font-size: 10px;
            text-transform: uppercase;
            font-weight: 700;
            color: #64748b;
            padding: 6px 12px;
            letter-spacing: 0.5px;
        }
        .sidebar-link {
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 9px 12px;
            color: #cbd5e1;
            text-decoration: none;
            font-size: 12.5px;
            font-weight: 500;
            border-radius: 6px;
            margin-bottom: 2px;
            transition: background 0.15s, color 0.15s;
        }
        .sidebar-link:hover {
            background-color: #2d3748;
            color: #ffffff;
        }
        .sidebar-link.active {
            background-color: var(--mfx-red);
            color: #ffffff;
            font-weight: 700;
        }
        .sidebar-link i {
            width: 20px;
            text-align: center;
            font-size: 14px;
        }
        .sidebar-footer {
            background-color: var(--mfx-darker);
            border-top: 1px solid #2d3748;
            padding: 12px 14px;
            display: flex;
            align-items: center;
            gap: 10px;
        }
        .avatar-user {
            width: 34px;
            height: 34px;
            border-radius: 50%;
            background: linear-gradient(135deg, #dc2626 0%, #ea580c 100%);
            display: flex;
            align-items: center;
            justify-content: center;
            color: #fff;
            font-weight: 800;
            font-size: 12px;
        }

        /* 2. BARRA SUPERIOR (TOPBAR / ATALHOS RÁPIDOS) */
        .erp-main {
            flex: 1;
            display: flex;
            flex-direction: column;
            height: 100vh;
            overflow: hidden;
            min-width: 0;
        }
        .erp-topbar {
            height: 60px;
            background-color: #ffffff;
            border-bottom: 1px solid #cbd5e1;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 16px;
            flex-shrink: 0;
            z-index: 10;
        }
        .quick-actions {
            display: flex;
            align-items: center;
            gap: 4px;
            overflow-x: auto;
            padding: 2px 0;
        }
        .quick-btn {
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            min-width: 54px;
            height: 48px;
            padding: 2px 6px;
            background: transparent;
            border: 1px solid transparent;
            border-radius: 6px;
            color: #475569;
            text-decoration: none;
            font-size: 10px;
            font-weight: 600;
            transition: all 0.15s;
        }
        .quick-btn:hover {
            background-color: #f1f5f9;
            border-color: #e2e8f0;
            color: #0f172a;
        }
        .quick-btn i {
            font-size: 14px;
            margin-bottom: 2px;
        }
        .quick-btn.text-receber i { color: #16a34a; }
        .quick-btn.text-pagar i { color: #dc2626; }
        .quick-btn.text-sair i { color: #dc2626; }

        /* 3. ÁREA CENTRAL (WORKSPACE / TELA DE ABERTURA) */
        .erp-workspace {
            flex: 1;
            overflow-y: auto;
            background-color: var(--mfx-bg);
            padding: 24px;
            position: relative;
        }
        .welcome-center-box {
            min-height: calc(100vh - 150px);
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
        }

        /* LOGO ESTILIZADO CONFORME REFERÊNCIA VISUAL */
        .logo-mfx-cover {
            display: flex;
            flex-direction: column;
            align-items: center;
            user-select: none;
            margin-bottom: 25px;
        }
        .logo-mfx-cover .monograma {
            font-size: 5.5rem;
            font-weight: 900;
            line-height: 0.9;
            letter-spacing: -2px;
            color: #111827;
        }
        .logo-mfx-cover .monograma span { color: var(--mfx-red); }
        .logo-mfx-cover .faixa-tecnologia {
            background: linear-gradient(90deg, #475569, #334155, #475569);
            color: #ffffff;
            font-weight: 800;
            font-size: 1.1rem;
            letter-spacing: 0.5em;
            padding: 6px 36px 6px 42px;
            border-radius: 4px;
            text-transform: uppercase;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1);
            margin-top: 8px;
        }
        .logo-mfx-cover .subtitulo-especialidade {
            margin-top: 15px;
            font-weight: 800;
            font-size: 0.85rem;
            letter-spacing: 2px;
            color: #334155;
            text-transform: uppercase;
        }

        /* 4. RODAPÉ INFERIOR (STATUS BAR) */
        .erp-statusbar {
            height: 28px;
            background-color: var(--mfx-darker);
            border-top: 1px solid #334155;
            color: #94a3b8;
            display: flex;
            align-items: center;
            justify-content: space-between;
            padding: 0 16px;
            font-size: 11px;
            font-family: Consolas, monospace;
            flex-shrink: 0;
            user-select: none;
        }
        .status-badge-on {
            color: #4ade80;
            font-weight: bold;
        }
    </style>
</head>
<body>

    <!-- 1. BARRA LATERAL ESQUERDA (SIDEBAR) -->
    <aside class="erp-sidebar" id="erpSidebar">
        <!-- Topo da Barra Lateral -->
        <div class="sidebar-brand">
            <div class="d-flex align-items-center gap-2">
                <div class="logo-text">MF<span>x</span></div>
                <div class="badge-tec">TECNOLOGIA</div>
            </div>
            <button class="btn btn-sm text-secondary p-0 border-0" id="btnToggleSidebar">
                <i class="fa-solid fa-bars"></i>
            </button>
        </div>

        <!-- Itens de Menu Principal do ERP -->
        <div class="sidebar-menu">
            <div class="sidebar-section-title">Navegação Principal</div>
            
            <a href="index.php" class="sidebar-link active">
                <i class="fa-solid fa-house"></i>
                <span>Início / Capa</span>
            </a>

            <a href="clientes.php" class="sidebar-link">
                <i class="fa-solid fa-users text-primary"></i>
                <span>Pessoas (Clientes/Forn.)</span>
            </a>

            <a href="nova_os.php" class="sidebar-link">
                <i class="fa-solid fa-wrench text-danger"></i>
                <span>OS & Manutenção</span>
            </a>

            <a href="#" class="sidebar-link">
                <i class="fa-solid fa-boxes-stacked text-warning"></i>
                <span>Estoque</span>
            </a>

            <a href="#" class="sidebar-link">
                <i class="fa-solid fa-cart-flatbed text-success"></i>
                <span>Compras</span>
            </a>

            <a href="#" class="sidebar-link">
                <i class="fa-solid fa-chart-line text-info"></i>
                <span>Vendas</span>
            </a>

            <a href="#" class="sidebar-link">
                <i class="fa-solid fa-file-invoice-dollar text-warning"></i>
                <span>Orçamento</span>
            </a>

            <a href="#" class="sidebar-link">
                <i class="fa-solid fa-hand-holding-dollar text-success"></i>
                <span>Financeiro</span>
            </a>

            <a href="#" class="sidebar-link">
                <i class="fa-solid fa-file-contract text-info"></i>
                <span>Fiscal (NF-e, NFS-e)</span>
            </a>

            <a href="listar_os.php" class="sidebar-link">
                <i class="fa-solid fa-chart-pie text-secondary"></i>
                <span>Relatórios</span>
            </a>

            <div class="sidebar-section-title mt-2">Sistema</div>

            <a href="#" class="sidebar-link">
                <i class="fa-solid fa-user-shield"></i>
                <span>Acesso</span>
            </a>

            <a href="#" class="sidebar-link">
                <i class="fa-solid fa-gear"></i>
                <span>Configurações</span>
            </a>

            <a href="#" class="sidebar-link">
                <i class="fa-solid fa-circle-question text-info"></i>
                <span>Ajuda</span>
            </a>
        </div>

        <!-- Rodapé da Barra Lateral com Perfil do Usuário Logado -->
        <div class="sidebar-footer">
            <div class="avatar-user">OM</div>
            <div class="overflow-hidden">
                <div class="text-white fw-bold text-truncate" style="font-size: 12px;">ADM - MEDRADE</div>
                <div class="text-success small" style="font-size: 10px;">
                    <i class="fa-solid fa-circle text-success me-1" style="font-size: 8px;"></i>Online
                </div>
            </div>
        </div>
    </aside>

    <!-- 2. CONTEÚDO PRINCIPAL (TOPBAR + WORKSPACE + STATUS BAR) -->
    <div class="erp-main">
        
        <!-- Barra Superior Horizontal de Atalhos Rápidos (Ribbon Bar) -->
        <header class="erp-topbar">
            <!-- Atalhos Rápidos solicitados -->
            <div class="quick-actions">
                <a href="#" class="quick-btn" title="Produtos">
                    <i class="fa-solid fa-box-open text-primary"></i>
                    <span>Produtos</span>
                </a>
                <a href="#" class="quick-btn" title="Compras">
                    <i class="fa-solid fa-cart-shopping text-success"></i>
                    <span>Compras</span>
                </a>
                <a href="#" class="quick-btn" title="Vendas">
                    <i class="fa-solid fa-cash-register text-warning"></i>
                    <span>Vendas</span>
                </a>
                <a href="#" class="quick-btn" title="Orçamento">
                    <i class="fa-solid fa-file-lines text-info"></i>
                    <span>Orçamento</span>
                </a>
                <a href="#" class="quick-btn" title="Caixa">
                    <i class="fa-solid fa-vault text-dark"></i>
                    <span>Caixa</span>
                </a>
                <a href="#" class="quick-btn" title="PDV">
                    <i class="fa-solid fa-calculator text-secondary"></i>
                    <span>PDV</span>
                </a>
                <a href="#" class="quick-btn" title="NF-e">
                    <i class="fa-solid fa-receipt text-danger"></i>
                    <span>NF-e</span>
                </a>
                <a href="#" class="quick-btn" title="NFS-e">
                    <i class="fa-solid fa-file-invoice text-primary"></i>
                    <span>NFS-e</span>
                </a>
                <a href="#" class="quick-btn text-receber" title="Contas a Receber">
                    <i class="fa-solid fa-arrow-down"></i>
                    <span>Receber</span>
                </a>
                <a href="#" class="quick-btn text-pagar" title="Contas a Pagar">
                    <i class="fa-solid fa-arrow-up"></i>
                    <span>Pagar</span>
                </a>
            </div>

            <!-- Direita: Notificações e Botão de Sair -->
            <div class="d-flex align-items-center gap-3">
                <div class="position-relative cursor-pointer text-secondary px-2">
                    <i class="fa-solid fa-bell fs-6"></i>
                    <span class="position-absolute top-0 start-100 translate-middle badge rounded-pill bg-danger" style="font-size: 9px;">3</span>
                </div>

                <div class="d-none d-lg-block text-end">
                    <div class="fw-bold small text-dark leading-none">MFx Tecnologia Industrial</div>
                    <div class="text-muted" style="font-size: 10px;">Agudos - SP</div>
                </div>

                <a href="index.php" class="btn btn-outline-danger btn-sm fw-bold">
                    <i class="fa-solid fa-right-from-bracket me-1"></i> Sair
                </a>
            </div>
        </header>

        <!-- 3. ÁREA CENTRAL (CONTENT WORKSPACE / TELA DE ABERTURA) -->
        <main class="erp-workspace">
            <div class="welcome-center-box">
                <!-- Logotipo MFx Tecnologia Centralizado conforme Modelo Visual -->
                <div class="logo-mfx-cover">
                    <div class="monograma">
                        MF<span>x</span>
                    </div>
                    <div class="faixa-tecnologia">
                        TECNOLOGIA
                    </div>
                    <div class="subtitulo-especialidade">
                        • LASER FIBRA • PLASMA • OXI-CORTE •
                    </div>
                    <p class="text-muted small mt-2 mb-0" style="max-width: 500px;">
                        Sistema de Gestão Empresarial, Manutenção de Máquinas CNC e Fornecimento de Consumíveis Industriais
                    </p>
                </div>
            </div>
        </main>

        <!-- 4. RODAPÉ INFERIOR (STATUS BAR DO SISTEMA) -->
        <footer class="erp-statusbar">
            <div>
                <i class="fa-solid fa-code-branch text-warning me-1"></i> Versão 1.0.0
                <span class="mx-2 d-none d-sm-inline">•</span>
                <span class="d-none d-sm-inline">Licenciado: <strong>MFx Tecnologia Industrial Ltda</strong> (CNPJ: 34.375.789-0001/87)</span>
            </div>
            <div class="d-flex align-items-center gap-3">
                <span class="d-none d-md-inline"><i class="fa-solid fa-network-wired me-1"></i> IP: 192.168.1.105</span>
                <span><i class="fa-regular fa-clock me-1 text-warning"></i> <span id="clockStatus"><?= date('d/m/Y - H:i:s'); ?></span></span>
                <span class="status-badge-on"><i class="fa-solid fa-circle me-1" style="font-size: 8px;"></i>Internet ON</span>
            </div>
        </footer>

    </div>

    <!-- Scripts Bootstrap 5 e Relógio em Tempo Real -->
    <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
    <script>
        // Toggle da barra lateral retrátil
        document.getElementById('btnToggleSidebar').addEventListener('click', function() {
            document.getElementById('erpSidebar').classList.toggle('collapsed');
        });

        // Relógio ao vivo na barra de status
        function updateClock() {
            const now = new Date();
            const dateStr = now.toLocaleDateString('pt-BR');
            const timeStr = now.toLocaleTimeString('pt-BR');
            const el = document.getElementById('clockStatus');
            if (el) el.textContent = dateStr + ' - ' + timeStr;
        }
        setInterval(updateClock, 1000);
    </script>
</body>
</html>`
  },
  {
    filename: 'conexao.php',
    description: 'Conexão PDO segura com o banco MySQL mfx_sistema, com tratamento de exceções e charset utf8mb4.',
    language: 'php',
    content: `<?php
/**
 * MFx Tecnologia Industrial - Sistema de Gestão de OS e Vendas
 * Arquivo: conexao.php
 * Conexão com Banco de Dados MySQL via PDO
 */

define('DB_HOST', 'localhost');
define('DB_PORT', '3306');
define('DB_NAME', 'mfx_sistema');
define('DB_USER', 'root');
define('DB_PASS', '');

// Dados cadastrais oficiais da MFx Tecnologia Industrial
define('MFX_NOME', 'MFx Tecnologia Industrial');
define('MFX_CNPJ', '34.375.789-0001/87');
define('MFX_ENDERECO', 'Rua Sargento Andiras, nº 874');
define('MFX_BAIRRO', 'Centro');
define('MFX_CIDADE', 'Agudos');
define('MFX_UF', 'SP');
define('MFX_CEP', '17120-031');
define('MFX_FONE', '(14) 3262-1080');
define('MFX_WHATSAPP', '(14) 99845-7721');
define('MFX_EMAIL', 'contato@mfxindustrial.com.br');
define('MFX_SLOGAN', 'LASER FIBRA, PLASMA, OXI-CORTE');

try {
    $dsn = "mysql:host=" . DB_HOST . ";port=" . DB_PORT . ";dbname=" . DB_NAME . ";charset=utf8mb4";
    $opcoes = [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ];
    $pdo = new PDO($dsn, DB_USER, DB_PASS, $opcoes);
} catch (PDOException $e) {
    die("Erro crítico de conexão com o banco de dados da MFx Tecnologia: " . $e->getMessage());
}
?>`
  },
  {
    filename: 'banco_mfx_sistema.sql',
    description: 'Script SQL completo para criação do banco de dados, tabelas relacionais com chaves estrangeiras e dados iniciais.',
    language: 'sql',
    content: `-- ========================================================
-- MFx Tecnologia Industrial - Banco de Dados Oficial
-- Nome do Banco: mfx_sistema
-- Suporta: Clientes, Ordens de Serviço (OS) e Itens/Consumíveis
-- ========================================================

CREATE DATABASE IF NOT EXISTS \`mfx_sistema\` DEFAULT CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE \`mfx_sistema\`;

-- 1. Tabela de Clientes
CREATE TABLE IF NOT EXISTS \`clientes\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`documento\` VARCHAR(20) NOT NULL COMMENT 'CPF ou CNPJ',
  \`nome\` VARCHAR(150) NOT NULL COMMENT 'Nome ou Razão Social',
  \`nome_fantasia\` VARCHAR(150) NULL,
  \`logradouro\` VARCHAR(150) NOT NULL,
  \`numero\` VARCHAR(30) NOT NULL,
  \`complemento\` VARCHAR(60) NULL,
  \`bairro\` VARCHAR(80) NOT NULL,
  \`cidade\` VARCHAR(80) NOT NULL,
  \`estado\` VARCHAR(2) NOT NULL DEFAULT 'SP',
  \`cep\` VARCHAR(10) NOT NULL,
  \`telefone\` VARCHAR(20) NULL,
  \`celular\` VARCHAR(20) NULL COMMENT 'WhatsApp',
  \`email\` VARCHAR(100) NULL,
  \`observacoes\` TEXT NULL,
  \`data_cadastro\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX \`idx_documento\` (\`documento\`),
  INDEX \`idx_cidade\` (\`cidade\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 2. Tabela de Ordens de Serviço (OS)
CREATE TABLE IF NOT EXISTS \`ordens_servico\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`numero_os\` VARCHAR(30) NOT NULL UNIQUE,
  \`cliente_id\` INT NOT NULL,
  \`equipamento_tipo\` VARCHAR(50) NOT NULL DEFAULT 'Laser Fibra',
  \`modelo_equipamento\` VARCHAR(150) NULL,
  \`numero_serie\` VARCHAR(60) NULL,
  \`data_abertura\` DATE NOT NULL,
  \`data_previsao\` DATE NULL,
  \`status\` ENUM('Orçamento', 'Aprovado', 'Em Execução', 'Concluído', 'Faturado', 'Cancelado') NOT NULL DEFAULT 'Orçamento',
  
  -- Custos Operacionais
  \`km_rodados\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`valor_unitario_km\` DECIMAL(10,2) NOT NULL DEFAULT 2.50,
  \`horas_trabalhadas\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`valor_hora_tecnica\` DECIMAL(10,2) NOT NULL DEFAULT 100.00,
  \`despesa_alimentacao\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`despesa_estadia\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`outras_despesas\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`descricao_despesas\` VARCHAR(255) NULL,
  
  -- Condições e observações
  \`condicoes_pagamento\` VARCHAR(120) DEFAULT '28 DDL Boleto',
  \`prazo_garantia\` VARCHAR(120) DEFAULT '90 dias para serviços / Garantia de fábrica para consumíveis',
  \`tecnico_responsavel\` VARCHAR(100) DEFAULT 'MFx Técnico Especialista',
  \`observacoes_gerais\` TEXT NULL,
  
  -- Totais Consolidados
  \`total_operacional\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`total_itens\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`valor_total_geral\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  
  \`data_criacao\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (\`cliente_id\`) REFERENCES \`clientes\`(\`id\`) ON DELETE RESTRICT
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 3. Tabela de Itens da OS (Consumíveis, Peças e Serviços)
CREATE TABLE IF NOT EXISTS \`itens_os\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`ordem_servico_id\` INT NOT NULL,
  \`categoria\` ENUM('Consumíveis', 'Serviços Laser', 'Serviços Oxicorte', 'Serviços Plasma', 'Peças & Acessórios') NOT NULL DEFAULT 'Consumíveis',
  \`codigo\` VARCHAR(40) NOT NULL,
  \`descricao\` VARCHAR(255) NOT NULL,
  \`preco_unitario\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`quantidade\` DECIMAL(10,2) NOT NULL DEFAULT 1.00,
  \`valor_total\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`prazo_entrega\` VARCHAR(60) NOT NULL DEFAULT 'Pronta Entrega',
  FOREIGN KEY (\`ordem_servico_id\`) REFERENCES \`ordens_servico\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Inserção de Cliente de Exemplo
INSERT INTO \`clientes\` (\`documento\`, \`nome\`, \`nome_fantasia\`, \`logradouro\`, \`numero\`, \`bairro\`, \`cidade\`, \`estado\`, \`cep\`, \`telefone\`, \`celular\`, \`email\`, \`observacoes\`)
VALUES 
('52.148.963/0001-44', 'Metalúrgica Corte & Conformação Paulista Ltda', 'Metalúrgica Paulista', 'Avenida das Indústrias', '1450', 'Distrito Industrial', 'Bauru', 'SP', '17034-290', '(14) 3104-5000', '(14) 99712-4488', 'manutencao@metalurgicapaulista.com.br', 'Cliente possui 2 máquinas Laser Fibra 3kW Raycus.');
`
  },
  {
    filename: 'clientes.php',
    description: 'Interface e backend PHP para cadastro de clientes com Bootstrap 5 e script onblur consultando a BrasilAPI para CNPJ e CEP.',
    language: 'php',
    content: `<?php
/**
 * MFx Tecnologia Industrial - Sistema de Gestão de OS
 * Arquivo: clientes.php - Cadastro de Clientes com Consulta Automática BrasilAPI
 */
require_once 'conexao.php';

$mensagem = '';
$tipo_alerta = '';

// Processamento de Inclusão via POST
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['acao']) && $_POST['acao'] === 'salvar_cliente') {
    $documento   = trim($_POST['documento'] ?? '');
    $nome        = trim($_POST['nome'] ?? '');
    $logradouro  = trim($_POST['logradouro'] ?? '');
    $numero      = trim($_POST['numero'] ?? '');
    $complemento = trim($_POST['complemento'] ?? '');
    $bairro      = trim($_POST['bairro'] ?? '');
    $cidade      = trim($_POST['cidade'] ?? '');
    $estado      = strtoupper(trim($_POST['estado'] ?? 'SP'));
    $cep         = trim($_POST['cep'] ?? '');
    $telefone    = trim($_POST['telefone'] ?? '');
    $celular     = trim($_POST['celular'] ?? '');
    $email       = trim($_POST['email'] ?? '');
    $observacoes = trim($_POST['observacoes'] ?? '');

    if (empty($documento) || empty($nome) || empty($logradouro) || empty($cidade)) {
        $mensagem = "Por favor, preencha os campos obrigatórios (Documento, Nome/Razão Social, Endereço e Cidade).";
        $tipo_alerta = "danger";
    } else {
        try {
            $stmt = $pdo->prepare("INSERT INTO clientes (documento, nome, logradouro, numero, complemento, bairro, cidade, estado, cep, telefone, celular, email, observacoes) 
                                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$documento, $nome, $logradouro, $numero, $complemento, $bairro, $cidade, $estado, $cep, $telefone, $celular, $email, $observacoes]);
            $mensagem = "Cliente cadastrado com sucesso no sistema da MFx Tecnologia Industrial!";
            $tipo_alerta = "success";
        } catch (PDOException $e) {
            $mensagem = "Erro ao cadastrar cliente: " . $e->getMessage();
            $tipo_alerta = "danger";
        }
    }
}

// Busca a lista de clientes para exibição na tabela
$stmtList = $pdo->query("SELECT * FROM clientes ORDER BY id DESC LIMIT 50");
$clientes = $stmtList->fetchAll();
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MFx Tecnologia - Cadastro de Clientes</title>
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
    <style>
        :root {
            --mfx-red: #dc2626;
            --mfx-dark: #0f172a;
            --mfx-orange: #ea580c;
        }
        body { background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        .navbar-mfx { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-bottom: 3px solid var(--mfx-orange); }
        .card-custom { border: none; border-radius: 10px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.1); }
        .badge-mfx { background-color: #ffedd5; color: #c2410c; border: 1px solid #fed7aa; }
        .spinner-api { display: none; }
    </style>
</head>
<body>

<nav class="navbar navbar-expand-lg navbar-dark navbar-mfx mb-4 shadow">
    <div class="container-fluid px-4">
        <a class="navbar-brand fw-bold d-flex align-items-center gap-2" href="index.php">
            <span class="badge bg-danger p-2"><i class="fa-solid fa-fire"></i> MFx</span>
            <span>Tecnologia Industrial</span>
        </a>
        <div class="navbar-nav ms-auto gap-2">
            <a class="nav-link" href="index.php"><i class="fa-solid fa-house"></i> Início</a>
            <a class="nav-link active" href="clientes.php"><i class="fa-solid fa-users"></i> Clientes</a>
            <a class="nav-link" href="nova_os.php"><i class="fa-solid fa-plus-circle"></i> Nova OS</a>
            <a class="nav-link" href="listar_os.php"><i class="fa-solid fa-file-lines"></i> Ordens de Serviço</a>
        </div>
    </div>
</nav>

<div class="container my-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
        <div>
            <h3 class="fw-bold text-dark mb-0"><i class="fa-solid fa-user-plus text-danger"></i> Cadastro de Clientes</h3>
            <p class="text-muted small mb-0">Preencha o CPF ou CNPJ. Ao sair do campo (onblur), o sistema consulta a BrasilAPI automaticamente.</p>
        </div>
        <a href="nova_os.php" class="btn btn-outline-danger btn-sm"><i class="fa-solid fa-wrench"></i> Abrir Nova OS</a>
    </div>

    <?php if (!empty($mensagem)): ?>
        <div class="alert alert-<?= $tipo_alerta; ?> alert-dismissible fade show" role="alert">
            <i class="fa-solid <?= $tipo_alerta === 'success' ? 'fa-circle-check' : 'fa-triangle-exclamation'; ?>"></i>
            <?= htmlspecialchars($mensagem); ?>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    <?php endif; ?>

    <!-- Card de Formulário -->
    <div class="card card-custom mb-4">
        <div class="card-header bg-white py-3 border-bottom">
            <h5 class="card-title mb-0 fw-semibold text-secondary">
                <i class="fa-solid fa-building"></i> Dados do Cliente / Empresa
            </h5>
        </div>
        <div class="card-body p-4">
            <form method="POST" action="clientes.php" id="formCliente">
                <input type="hidden" name="acao" value="salvar_cliente">

                <div class="row g-3">
                    <div class="col-md-4">
                        <label for="documento" class="form-label fw-bold">
                            CPF ou CNPJ <span class="text-danger">*</span>
                            <span id="spinnerCnpj" class="spinner-border spinner-border-sm text-danger ms-2 spinner-api" role="status"></span>
                        </label>
                        <div class="input-group">
                            <span class="input-group-text bg-light"><i class="fa-solid fa-id-card"></i></span>
                            <input type="text" class="form-control" id="documento" name="documento" 
                                   placeholder="Digite 14 dígitos (CNPJ) ou CPF" required onblur="consultarCnpjBrasilApi(this.value)">
                        </div>
                        <small class="text-muted" id="cnpjFeedback">Dica: Digite apenas os números e clique fora do campo.</small>
                    </div>

                    <div class="col-md-8">
                        <label for="nome" class="form-label fw-bold">Nome Completo / Razão Social <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" id="nome" name="nome" placeholder="Razão Social da Indústria / Cliente" required>
                    </div>

                    <div class="col-md-3">
                        <label for="cep" class="form-label fw-bold">
                            CEP <span class="text-danger">*</span>
                            <span id="spinnerCep" class="spinner-border spinner-border-sm text-primary ms-1 spinner-api"></span>
                        </label>
                        <input type="text" class="form-control" id="cep" name="cep" placeholder="17120-031" required onblur="consultarCep(this.value)">
                    </div>

                    <div class="col-md-6">
                        <label for="logradouro" class="form-label fw-bold">Endereço (Rua / Av.) <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" id="logradouro" name="logradouro" placeholder="Ex: Rua Sargento Andiras" required>
                    </div>

                    <div class="col-md-3">
                        <label for="numero" class="form-label fw-bold">Número <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" id="numero" name="numero" placeholder="874" required>
                    </div>

                    <div class="col-md-3">
                        <label for="complemento" class="form-label">Complemento</label>
                        <input type="text" class="form-control" id="complemento" name="complemento" placeholder="Galpão, Sala...">
                    </div>

                    <div class="col-md-3">
                        <label for="bairro" class="form-label fw-bold">Bairro <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" id="bairro" name="bairro" placeholder="Centro / Distrito Industrial" required>
                    </div>

                    <div class="col-md-4">
                        <label for="cidade" class="form-label fw-bold">Cidade <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" id="cidade" name="cidade" placeholder="Ex: Agudos, Bauru..." required>
                    </div>

                    <div class="col-md-2">
                        <label for="estado" class="form-label fw-bold">UF <span class="text-danger">*</span></label>
                        <input type="text" class="form-control text-uppercase" id="estado" name="estado" maxlength="2" value="SP" required>
                    </div>

                    <div class="col-md-4">
                        <label for="telefone" class="form-label">Telefone Fixo</label>
                        <div class="input-group">
                            <span class="input-group-text"><i class="fa-solid fa-phone"></i></span>
                            <input type="text" class="form-control" id="telefone" name="telefone" placeholder="(14) 3262-1080">
                        </div>
                    </div>

                    <div class="col-md-4">
                        <label for="celular" class="form-label fw-bold">Celular / WhatsApp <span class="text-danger">*</span></label>
                        <div class="input-group">
                            <span class="input-group-text text-success"><i class="fa-brands fa-whatsapp"></i></span>
                            <input type="text" class="form-control" id="celular" name="celular" placeholder="(14) 99845-7721" required>
                        </div>
                    </div>

                    <div class="col-md-4">
                        <label for="email" class="form-label">E-mail Comercial / NFe</label>
                        <div class="input-group">
                            <span class="input-group-text"><i class="fa-solid fa-envelope"></i></span>
                            <input type="email" class="form-control" id="email" name="email" placeholder="compras@cliente.com.br">
                        </div>
                    </div>

                    <div class="col-12">
                        <label for="observacoes" class="form-label">Observações Técnicas / Equipamentos do Cliente</label>
                        <textarea class="form-control" id="observacoes" name="observacoes" rows="2" placeholder="Ex: Possui mesa Laser 3kW Raycus, modelo da tocha, horário de recebimento..."></textarea>
                    </div>

                    <div class="col-12 text-end pt-2">
                        <button type="reset" class="btn btn-light border px-4 me-2">Limpar</button>
                        <button type="submit" class="btn btn-danger px-4 fw-bold">
                            <i class="fa-solid fa-floppy-disk"></i> Salvar Cliente
                        </button>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
async function consultarCnpjBrasilApi(valor) {
    const documentoLimpo = valor.replace(/\\D/g, '');
    const feedback = document.getElementById('cnpjFeedback');
    const spinner = document.getElementById('spinnerCnpj');

    if (documentoLimpo.length === 14) {
        spinner.style.display = 'inline-block';
        feedback.innerHTML = '<span class="text-primary"><i class="fa-solid fa-arrows-rotate fa-spin"></i> Consultando BrasilAPI...</span>';

        try {
            const resposta = await fetch(\`https://brasilapi.com.br/api/cnpj/v1/\${documentoLimpo}\`);
            if (resposta.ok) {
                const dados = await resposta.json();
                document.getElementById('nome').value = dados.razao_social || dados.nome_fantasia || '';
                if (dados.cep) document.getElementById('cep').value = dados.cep;
                if (dados.logradouro) document.getElementById('logradouro').value = dados.logradouro;
                if (dados.numero) document.getElementById('numero').value = dados.numero;
                if (dados.complemento) document.getElementById('complemento').value = dados.complemento;
                if (dados.bairro) document.getElementById('bairro').value = dados.bairro;
                if (dados.municipio) document.getElementById('cidade').value = dados.municipio;
                if (dados.uf) document.getElementById('estado').value = dados.uf;
                if (dados.ddd_telefone_1) document.getElementById('telefone').value = dados.ddd_telefone_1;
                if (dados.email) document.getElementById('email').value = dados.email.toLowerCase();

                feedback.innerHTML = '<span class="text-success"><i class="fa-solid fa-circle-check"></i> CNPJ carregado com sucesso!</span>';
            } else {
                feedback.innerHTML = '<span class="text-warning"><i class="fa-solid fa-triangle-exclamation"></i> CNPJ não localizado na BrasilAPI.</span>';
            }
        } catch (erro) {
            feedback.innerHTML = '<span class="text-danger"><i class="fa-solid fa-circle-xmark"></i> Falha ao conectar à BrasilAPI.</span>';
        } finally {
            spinner.style.display = 'none';
        }
    }
}

async function consultarCep(cep) {
    const cepLimpo = cep.replace(/\\D/g, '');
    const spinner = document.getElementById('spinnerCep');

    if (cepLimpo.length === 8) {
        spinner.style.display = 'inline-block';
        try {
            const resposta = await fetch(\`https://brasilapi.com.br/api/cep/v2/\${cepLimpo}\`);
            if (resposta.ok) {
                const dados = await resposta.json();
                if (dados.street) document.getElementById('logradouro').value = dados.street;
                if (dados.neighborhood) document.getElementById('bairro').value = dados.neighborhood;
                if (dados.city) document.getElementById('cidade').value = dados.city;
                if (dados.state) document.getElementById('estado').value = dados.state;
                document.getElementById('numero').focus();
            }
        } catch (e) {
            console.warn('Erro ao consultar CEP:', e);
        } finally {
            spinner.style.display = 'none';
        }
    }
}
</script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`
  },
  {
    filename: 'nova_os.php',
    description: 'Abertura de Chamados e OS com custos operacionais dinâmicos (KM R$ 2,50, Horas R$ 100,00), tabela dinâmica de consumíveis e serviços com auto-cálculo.',
    language: 'php',
    content: `<?php
/**
 * MFx Tecnologia Industrial - Sistema de Gestão de OS
 * Arquivo: nova_os.php - Lançamento de Chamados, Custos Operacionais e Itens Dinâmicos
 */
require_once 'conexao.php';

$mensagem = '';
$tipo_alerta = '';

// Buscar clientes cadastrados para o select
$stmtCli = $pdo->query("SELECT id, documento, nome, cidade, estado, telefone, celular, email, logradouro, numero FROM clientes ORDER BY nome ASC");
$clientes = $stmtCli->fetchAll();

// Processamento do Formulário via POST
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['acao']) && $_POST['acao'] === 'salvar_os') {
    $cliente_id          = (int)($_POST['cliente_id'] ?? 0);
    $equipamento_tipo    = trim($_POST['equipamento_tipo'] ?? 'Laser Fibra');
    $modelo_equipamento  = trim($_POST['modelo_equipamento'] ?? '');
    $numero_serie        = trim($_POST['numero_serie'] ?? '');
    $data_abertura       = trim($_POST['data_abertura'] ?? date('Y-m-d'));
    $data_previsao       = trim($_POST['data_previsao'] ?? date('Y-m-d'));
    $status              = trim($_POST['status'] ?? 'Orçamento');
    
    // Custos operacionais
    $km_rodados          = (float)str_replace(',', '.', $_POST['km_rodados'] ?? '0');
    $valor_unitario_km   = (float)str_replace(',', '.', $_POST['valor_unitario_km'] ?? '2.50');
    $horas_trabalhadas   = (float)str_replace(',', '.', $_POST['horas_trabalhadas'] ?? '0');
    $valor_hora_tecnica  = (float)str_replace(',', '.', $_POST['valor_hora_tecnica'] ?? '100.00');
    $despesa_alimentacao = (float)str_replace(',', '.', $_POST['despesa_alimentacao'] ?? '0');
    $despesa_estadia     = (float)str_replace(',', '.', $_POST['despesa_estadia'] ?? '0');
    $outras_despesas     = (float)str_replace(',', '.', $_POST['outras_despesas'] ?? '0');
    $descricao_despesas  = trim($_POST['descricao_despesas'] ?? '');

    $condicoes_pagamento = trim($_POST['condicoes_pagamento'] ?? '28 DDL Boleto');
    $prazo_garantia      = trim($_POST['prazo_garantia'] ?? '90 dias');
    $tecnico_responsavel = trim($_POST['tecnico_responsavel'] ?? 'MFx Técnico Especialista');
    $observacoes_gerais  = trim($_POST['observacoes_gerais'] ?? '');

    // Cálculos operacionais
    $total_km = $km_rodados * $valor_unitario_km;
    $total_horas = $horas_trabalhadas * $valor_hora_tecnica;
    $total_despesas = $despesa_alimentacao + $despesa_estadia + $outras_despesas;
    $total_operacional = $total_km + $total_horas + $total_despesas;

    // Itens dinâmicos enviados
    $itens_codigos      = $_POST['item_codigo'] ?? [];
    $itens_categorias   = $_POST['item_categoria'] ?? [];
    $itens_descricoes   = $_POST['item_descricao'] ?? [];
    $itens_precos       = $_POST['item_preco'] ?? [];
    $itens_quantidades  = $_POST['item_quantidade'] ?? [];
    $itens_prazos       = $_POST['item_prazo'] ?? [];

    $total_itens = 0;
    $itens_processados = [];

    for ($i = 0; $i < count($itens_descricoes); $i++) {
        if (!empty(trim($itens_descricoes[$i]))) {
            $preco = (float)str_replace(',', '.', $itens_precos[$i] ?? '0');
            $qtd   = (float)str_replace(',', '.', $itens_quantidades[$i] ?? '1');
            $subtotal = $preco * $qtd;
            $total_itens += $subtotal;

            $itens_processados[] = [
                'categoria'      => $itens_categorias[$i] ?? 'Consumíveis',
                'codigo'         => $itens_codigos[$i] ?? 'MFX-ITEM',
                'descricao'      => $itens_descricoes[$i],
                'preco_unitario' => $preco,
                'quantidade'     => $qtd,
                'valor_total'    => $subtotal,
                'prazo_entrega'  => $itens_prazos[$i] ?? 'Pronta Entrega',
            ];
        }
    }

    $valor_total_geral = $total_operacional + $total_itens;

    // Gerar Número Sequencial da OS (ex: OS-2026-0001)
    $anoAtual = date('Y');
    $stmtCount = $pdo->query("SELECT COUNT(*) AS total FROM ordens_servico");
    $totalOS = (int)$stmtCount->fetch()['total'] + 1;
    $numero_os = sprintf("OS-%s-%04d", $anoAtual, $totalOS);

    if ($cliente_id <= 0) {
        $mensagem = "Selecione um cliente para vincular à Ordem de Serviço.";
        $tipo_alerta = "danger";
    } else {
        try {
            $pdo->beginTransaction();

            $sqlOS = "INSERT INTO ordens_servico (
                numero_os, cliente_id, equipamento_tipo, modelo_equipamento, numero_serie,
                data_abertura, data_previsao, status,
                km_rodados, valor_unitario_km, horas_trabalhadas, valor_hora_tecnica,
                despesa_alimentacao, despesa_estadia, outras_despesas, descricao_despesas,
                condicoes_pagamento, prazo_garantia, tecnico_responsavel, observacoes_gerais,
                total_operacional, total_itens, valor_total_geral
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";

            $stmtOS = $pdo->prepare($sqlOS);
            $stmtOS->execute([
                $numero_os, $cliente_id, $equipamento_tipo, $modelo_equipamento, $numero_serie,
                $data_abertura, $data_previsao, $status,
                $km_rodados, $valor_unitario_km, $horas_trabalhadas, $valor_hora_tecnica,
                $despesa_alimentacao, $despesa_estadia, $outras_despesas, $descricao_despesas,
                $condicoes_pagamento, $prazo_garantia, $tecnico_responsavel, $observacoes_gerais,
                $total_operacional, $total_itens, $valor_total_geral
            ]);

            $os_id = $pdo->lastInsertId();

            if (!empty($itens_processados)) {
                $sqlItem = "INSERT INTO itens_os (ordem_servico_id, categoria, codigo, descricao, preco_unitario, quantidade, valor_total, prazo_entrega) 
                            VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
                $stmtItem = $pdo->prepare($sqlItem);
                foreach ($itens_processados as $it) {
                    $stmtItem->execute([
                        $os_id, $it['categoria'], $it['codigo'], $it['descricao'],
                        $it['preco_unitario'], $it['quantidade'], $it['valor_total'], $it['prazo_entrega']
                    ]);
                }
            }

            $pdo->commit();
            header("Location: imprimir_os.php?id=" . $os_id);
            exit;

        } catch (PDOException $e) {
            $pdo->rollBack();
            $mensagem = "Erro ao gravar Ordem de Serviço: " . $e->getMessage();
            $tipo_alerta = "danger";
        }
    }
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MFx Tecnologia - Nova Ordem de Serviço</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
    <style>
        :root { --mfx-orange: #ea580c; --mfx-dark: #0f172a; }
        body { background-color: #f1f5f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        .navbar-mfx { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-bottom: 3px solid var(--mfx-orange); }
        .card-custom { border: none; border-radius: 10px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.08); }
        .card-header-mfx { background: #1e293b; color: #fff; font-weight: 600; }
        .resumo-card { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); color: #fff; border-radius: 10px; }
        .total-destaque { font-size: 1.8rem; font-weight: 800; color: #fb923c; }
    </style>
</head>
<body>

<nav class="navbar navbar-expand-lg navbar-dark navbar-mfx mb-4 shadow">
    <div class="container-fluid px-4">
        <a class="navbar-brand fw-bold d-flex align-items-center gap-2" href="index.php">
            <span class="badge bg-danger p-2"><i class="fa-solid fa-fire"></i> MFx</span>
            <span>Tecnologia Industrial</span>
        </a>
        <div class="navbar-nav ms-auto gap-2">
            <a class="nav-link" href="index.php"><i class="fa-solid fa-house"></i> Início</a>
            <a class="nav-link" href="clientes.php"><i class="fa-solid fa-users"></i> Clientes</a>
            <a class="nav-link active" href="nova_os.php"><i class="fa-solid fa-plus-circle"></i> Nova OS</a>
            <a class="nav-link" href="listar_os.php"><i class="fa-solid fa-file-lines"></i> Ordens de Serviço</a>
        </div>
    </div>
</nav>

<div class="container my-4">
    <div class="d-flex justify-content-between align-items-center mb-3">
        <div>
            <h3 class="fw-bold text-dark mb-0"><i class="fa-solid fa-file-circle-plus text-danger"></i> Nova Ordem de Serviço</h3>
            <p class="text-muted small mb-0">Custos operacionais automatizados e itens dinâmicos com cálculo em tempo real.</p>
        </div>
        <a href="clientes.php" class="btn btn-outline-secondary btn-sm"><i class="fa-solid fa-user-plus"></i> Novo Cliente</a>
    </div>

    <?php if (!empty($mensagem)): ?>
        <div class="alert alert-<?= $tipo_alerta; ?> alert-dismissible fade show">
            <?= htmlspecialchars($mensagem); ?>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    <?php endif; ?>

    <form method="POST" action="nova_os.php" id="formNovaOS">
        <input type="hidden" name="acao" value="salvar_os">

        <div class="card card-custom mb-4">
            <div class="card-header card-header-mfx py-3">
                <i class="fa-solid fa-building"></i> 1. Dados do Cliente e Equipamento
            </div>
            <div class="card-body p-4">
                <div class="row g-3">
                    <div class="col-md-6">
                        <label for="cliente_id" class="form-label fw-bold">Cliente Cadastrado <span class="text-danger">*</span></label>
                        <select class="form-select" id="cliente_id" name="cliente_id" required>
                            <option value="">Selecione um cliente...</option>
                            <?php foreach ($clientes as $c): ?>
                                <option value="<?= $c['id']; ?>">
                                    <?= htmlspecialchars($c['nome']); ?> (<?= htmlspecialchars($c['cidade'] . '/' . $c['estado']); ?>) - CNPJ/CPF: <?= htmlspecialchars($c['documento']); ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>

                    <div class="col-md-3">
                        <label for="equipamento_tipo" class="form-label fw-bold">Tecnologia / Máquina</label>
                        <select class="form-select" id="equipamento_tipo" name="equipamento_tipo">
                            <option value="Laser Fibra">Laser Fibra Óptica</option>
                            <option value="Plasma">Plasma Alta Definição</option>
                            <option value="Oxicorte">Oxicorte Pantográfico/CNC</option>
                            <option value="Mesa CNC Multifunção">Mesa CNC Laser/Plasma</option>
                        </select>
                    </div>

                    <div class="col-md-3">
                        <label for="status" class="form-label fw-bold">Status Inicial</label>
                        <select class="form-select" id="status" name="status">
                            <option value="Orçamento">Orçamento / Aberto</option>
                            <option value="Aprovado">Aprovado pelo Cliente</option>
                            <option value="Em Execução">Em Execução</option>
                            <option value="Concluído">Concluído</option>
                        </select>
                    </div>

                    <div class="col-md-6">
                        <label for="modelo_equipamento" class="form-label">Modelo do Equipamento / Cabeçote</label>
                        <input type="text" class="form-control" id="modelo_equipamento" name="modelo_equipamento" placeholder="Ex: Mesa CNC Laser 3015 - Raytools BM111 / 3kW">
                    </div>

                    <div class="col-md-3">
                        <label for="data_abertura" class="form-label fw-bold">Data de Emissão</label>
                        <input type="date" class="form-control" id="data_abertura" name="data_abertura" value="<?= date('Y-m-d'); ?>" required>
                    </div>

                    <div class="col-md-3">
                        <label for="data_previsao" class="form-label">Previsão / Validade</label>
                        <input type="date" class="form-control" id="data_previsao" name="data_previsao" value="<?= date('Y-m-d', strtotime('+7 days')); ?>">
                    </div>
                </div>
            </div>
        </div>

        <div class="card card-custom mb-4 border-start border-danger border-4">
            <div class="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                <h5 class="mb-0 fw-bold text-dark">
                    <i class="fa-solid fa-gauge text-danger"></i> 2. Custos Operacionais de Deslocamento e Mão de Obra
                </h5>
                <span class="badge bg-danger">Cálculo Automático</span>
            </div>
            <div class="card-body p-4">
                <div class="row g-3">
                    <div class="col-md-3">
                        <label class="form-label fw-bold">Quilometragem (KM)</label>
                        <div class="input-group">
                            <input type="number" step="0.1" class="form-control calc-trigger" id="km_rodados" name="km_rodados" value="0">
                            <span class="input-group-text">KM</span>
                        </div>
                    </div>

                    <div class="col-md-3">
                        <label class="form-label fw-bold">Valor Unitário por KM</label>
                        <div class="input-group">
                            <span class="input-group-text">R$</span>
                            <input type="number" step="0.01" class="form-control calc-trigger" id="valor_unitario_km" name="valor_unitario_km" value="2.50">
                        </div>
                    </div>

                    <div class="col-md-3">
                        <label class="form-label fw-bold">Horas Trabalhadas</label>
                        <div class="input-group">
                            <input type="number" step="0.5" class="form-control calc-trigger" id="horas_trabalhadas" name="horas_trabalhadas" value="0">
                            <span class="input-group-text">h</span>
                        </div>
                    </div>

                    <div class="col-md-3">
                        <label class="form-label fw-bold">Valor da Hora Técnica</label>
                        <div class="input-group">
                            <span class="input-group-text">R$</span>
                            <input type="number" step="0.01" class="form-control calc-trigger" id="valor_hora_tecnica" name="valor_hora_tecnica" value="100.00">
                        </div>
                    </div>

                    <div class="col-md-3">
                        <label class="form-label">Alimentação (R$)</label>
                        <input type="number" step="0.01" class="form-control calc-trigger" id="despesa_alimentacao" name="despesa_alimentacao" value="0.00">
                    </div>

                    <div class="col-md-3">
                        <label class="form-label">Estadia / Hospedagem (R$)</label>
                        <input type="number" step="0.01" class="form-control calc-trigger" id="despesa_estadia" name="despesa_estadia" value="0.00">
                    </div>

                    <div class="col-md-3">
                        <label class="form-label">Outras Despesas</label>
                        <input type="number" step="0.01" class="form-control calc-trigger" id="outras_despesas" name="outras_despesas" value="0.00">
                    </div>

                    <div class="col-md-3">
                        <label class="form-label">Descrição Despesas</label>
                        <input type="text" class="form-control" id="descricao_despesas" name="descricao_despesas" placeholder="Pedágio, refeição...">
                    </div>
                </div>
            </div>
        </div>

        <div class="card card-custom mb-4">
            <div class="card-header bg-white py-3 border-bottom d-flex justify-content-between align-items-center">
                <h5 class="mb-0 fw-bold text-dark">
                    <i class="fa-solid fa-cart-shopping text-primary"></i> 3. Tabela de Consumíveis e Serviços
                </h5>
                <button type="button" class="btn btn-primary btn-sm fw-semibold" onclick="adicionarLinhaItem()">
                    <i class="fa-solid fa-plus"></i> Adicionar Item
                </button>
            </div>
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-bordered table-striped align-middle mb-0" id="tabelaItens">
                        <thead class="table-dark">
                            <tr>
                                <th style="width: 15%;">Categoria</th>
                                <th style="width: 15%;">Código</th>
                                <th style="width: 32%;">Descrição</th>
                                <th style="width: 12%;">Vlr. Unitário</th>
                                <th style="width: 8%;">Qtd</th>
                                <th style="width: 10%;">Total</th>
                                <th style="width: 13%;">Prazo</th>
                                <th style="width: 5%;" class="text-center">Ação</th>
                            </tr>
                        </thead>
                        <tbody id="corpoItens"></tbody>
                    </table>
                </div>
            </div>
        </div>

        <div class="text-end mb-4">
            <button type="submit" class="btn btn-danger btn-lg fw-bold px-5">
                <i class="fa-solid fa-floppy-disk me-2"></i> Salvar e Gerar Relatório de Impressão A4
            </button>
        </div>
    </form>
</div>

<script>
let contadorItens = 0;
function adicionarLinhaItem(dados = null) {
    contadorItens++;
    const corpo = document.getElementById('corpoItens');
    const modelo = dados || { cat: 'Consumíveis', cod: 'MFX-LP30-15', desc: 'Lente de Proteção Laser D30 Quartzo', preco: 120.00, qtd: 1, prazo: 'Pronta Entrega' };

    const tr = document.createElement('tr');
    tr.id = 'linha_item_' + contadorItens;
    tr.innerHTML = \`
        <td>
            <select name="item_categoria[]" class="form-select form-select-sm">
                <option value="Consumíveis">Consumíveis</option>
                <option value="Serviços Laser">Serviços Laser</option>
                <option value="Serviços Oxicorte">Serviços Oxicorte</option>
                <option value="Serviços Plasma">Serviços Plasma</option>
            </select>
        </td>
        <td><input type="text" name="item_codigo[]" class="form-control form-control-sm text-center font-monospace fw-bold" value="\${modelo.cod}"></td>
        <td><input type="text" name="item_descricao[]" class="form-control form-control-sm" value="\${modelo.desc}" required></td>
        <td><input type="number" step="0.01" name="item_preco[]" class="form-control form-control-sm text-end" value="\${modelo.preco.toFixed(2)}"></td>
        <td><input type="number" step="1" name="item_quantidade[]" class="form-control form-control-sm text-center" value="\${modelo.qtd}"></td>
        <td><input type="text" class="form-control form-control-sm text-end fw-bold bg-light" readonly value="R$ 0,00"></td>
        <td><input type="text" name="item_prazo[]" class="form-control form-control-sm" value="\${modelo.prazo}"></td>
        <td class="text-center"><button type="button" class="btn btn-outline-danger btn-sm" onclick="this.closest('tr').remove()"><i class="fa-solid fa-trash"></i></button></td>
    \`;
    corpo.appendChild(tr);
}
window.addEventListener('DOMContentLoaded', () => adicionarLinhaItem());
</script>
<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`
  },
  {
    filename: 'imprimir_os.php',
    description: 'Relatório formal de Serviço e Vendas da MFx Tecnologia Industrial em layout A4 padrão com CSS puro, dados da empresa, cabeçalho Laser/Plasma/Oxicorte, categorização e acionamento window.print().',
    language: 'php',
    content: `<?php
/**
 * MFx Tecnologia Industrial - Sistema de Gestão de OS
 * Arquivo: imprimir_os.php - Relatório Oficial de Serviço e Vendas (Layout A4)
 */
require_once 'conexao.php';

$id = (int)($_GET['id'] ?? 0);
if ($id <= 0) {
    die("ID da Ordem de Serviço não informado.");
}

$sql = "SELECT os.*, 
               c.nome AS cliente_nome, 
               c.documento AS cliente_documento, 
               c.logradouro, c.numero, c.complemento, c.bairro, c.cidade, c.estado, c.cep,
               c.telefone, c.celular, c.email
        FROM ordens_servico os
        INNER JOIN clientes c ON os.cliente_id = c.id
        WHERE os.id = ?";
$stmt = $pdo->prepare($sql);
$stmt->execute([$id]);
$os = $stmt->fetch();

if (!$os) {
    die("Ordem de Serviço #$id não encontrada.");
}

$stmtItens = $pdo->prepare("SELECT * FROM itens_os WHERE ordem_servico_id = ? ORDER BY id ASC");
$stmtItens->execute([$id]);
$itens = $stmtItens->fetchAll();

$itensPorCategoria = [];
foreach ($itens as $it) {
    $itensPorCategoria[$it['categoria']][] = $it;
}
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Relatório de Serviço e Vendas - <?= htmlspecialchars($os['numero_os']); ?> - MFx Tecnologia Industrial</title>
    <style>
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Helvetica Neue', Arial, sans-serif; color: #1a1a1a; background: #e2e8f0; padding: 20px 0; font-size: 11pt; line-height: 1.35; }
        .no-print-bar { width: 210mm; margin: 0 auto 15px auto; display: flex; justify-content: space-between; align-items: center; background: #0f172a; color: #fff; padding: 10px 20px; border-radius: 6px; }
        .btn-imprimir { background: #dc2626; color: #fff; border: none; padding: 8px 18px; font-size: 13px; font-weight: bold; border-radius: 4px; cursor: pointer; text-decoration: none; }
        .folha-a4 { width: 210mm; min-height: 297mm; margin: 0 auto; background: #ffffff; padding: 12mm 15mm; border: 1px solid #cbd5e1; box-shadow: 0 4px 10px rgba(0,0,0,0.1); }
        .cabecalho { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #0f172a; padding-bottom: 8px; margin-bottom: 8px; }
        .cabecalho-logo h1 { font-size: 20pt; font-weight: 900; color: #0f172a; }
        .cabecalho-logo h1 span { color: #dc2626; }
        .cabecalho-centro { width: 36%; text-align: center; border-left: 1px solid #cbd5e1; border-right: 1px solid #cbd5e1; padding: 0 10px; }
        .destaque-tecnologia { background: #0f172a; color: #fff; font-size: 9.5pt; font-weight: bold; padding: 4px 6px; border-radius: 3px; display: inline-block; margin-bottom: 4px; }
        .cabecalho-empresa { width: 32%; text-align: right; font-size: 7.5pt; color: #334155; }
        .titulo-relatorio { background: #f1f5f9; border: 1px solid #cbd5e1; border-left: 5px solid #dc2626; padding: 6px 12px; display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; }
        .titulo-relatorio h2 { font-size: 13pt; font-weight: 800; color: #0f172a; text-transform: uppercase; }
        .numero-os { color: #dc2626; font-size: 11pt; font-weight: bold; }
        .secao-box { border: 1px solid #cbd5e1; margin-bottom: 10px; border-radius: 3px; }
        .secao-header { background: #e2e8f0; font-size: 8pt; font-weight: bold; color: #1e293b; padding: 3px 8px; text-transform: uppercase; }
        .secao-corpo { padding: 6px 8px; font-size: 8.5pt; }
        table.tabela-itens { width: 100%; border-collapse: collapse; margin-bottom: 10px; font-size: 8pt; }
        table.tabela-itens th { background: #1e293b; color: #ffffff; font-weight: bold; padding: 4px 6px; text-transform: uppercase; border: 1px solid #0f172a; }
        table.tabela-itens td { padding: 4px 6px; border: 1px solid #e2e8f0; }
        .th-cat { background: #e2e8f0 !important; color: #0f172a !important; font-weight: bold; text-align: left; }
        .bloco-totais { display: grid; grid-template-columns: 1fr 1fr; gap: 10px; margin-bottom: 10px; }
        .caixa-total-geral { background: #0f172a; color: #ffffff; padding: 10px; border-radius: 4px; text-align: right; }
        .valor-total { font-size: 18pt; font-weight: 900; color: #fb923c; }
        .assinaturas { display: flex; justify-content: space-between; margin-top: 25px; padding: 0 20px; }
        .linha-assinatura { width: 42%; text-align: center; border-top: 1px solid #334155; padding-top: 4px; font-size: 7.5pt; }
        @media print {
            body { background: transparent; padding: 0; }
            .no-print-bar { display: none !important; }
            .folha-a4 { width: 100%; border: none; box-shadow: none; padding: 0; margin: 0; }
            @page { size: A4 portrait; margin: 10mm 12mm 10mm 12mm; }
        }
    </style>
</head>
<body>

<div class="no-print-bar">
    <div><strong>MFx Tecnologia Industrial</strong> | Ordem de Serviço: <?= htmlspecialchars($os['numero_os']); ?></div>
    <div style="display: flex; gap: 10px;">
        <a href="listar_os.php" style="color: #cbd5e1; text-decoration: none; font-size: 13px;">← Voltar</a>
        <button onclick="window.print()" class="btn-imprimir">Imprimir Relatório (A4)</button>
    </div>
</div>

<div class="folha-a4">
    <div class="cabecalho">
        <div class="cabecalho-logo">
            <h1>MF<span>x</span></h1>
            <div style="font-size: 8pt; font-weight: bold; color: #475569;">TECNOLOGIA INDUSTRIAL</div>
        </div>
        <div class="cabecalho-centro">
            <div class="destaque-tecnologia"><?= MFX_SLOGAN; ?></div>
            <p style="font-size: 7.5pt; color: #475569;">Consumíveis Ópticos • Bicos • Retrofit CNC • Manutenção Especializada</p>
        </div>
        <div class="cabecalho-empresa">
            <strong><?= MFX_NOME; ?></strong><br>
            CNPJ: <?= MFX_CNPJ; ?><br>
            <?= MFX_ENDERECO; ?>, Agudos - SP<br>
            CEP: <?= MFX_CEP; ?> | Fone: <?= MFX_FONE; ?><br>
            WhatsApp: <?= MFX_WHATSAPP; ?>
        </div>
    </div>

    <div class="titulo-relatorio">
        <div>
            <h2>Relatório de Serviço e Vendas</h2>
            <div style="font-size: 8pt; color: #475569;">Comprovante de atendimento técnico e fornecimento</div>
        </div>
        <div style="text-align: right; font-size: 8.5pt;">
            <div>NÚMERO DA OS: <span class="numero-os"><?= htmlspecialchars($os['numero_os']); ?></span></div>
            <div>EMISSÃO: <?= date('d/m/Y', strtotime($os['data_abertura'])); ?> | STATUS: <?= strtoupper($os['status']); ?></div>
        </div>
    </div>

    <div class="secao-box">
        <div class="secao-header">Identificação do Cliente / Razão Social</div>
        <div class="secao-corpo">
            <div style="display: flex; justify-content: space-between;">
                <div>
                    <div><strong>Cliente:</strong> <?= htmlspecialchars($os['cliente_nome']); ?></div>
                    <div><strong>Endereço:</strong> <?= htmlspecialchars($os['logradouro'] . ', ' . $os['numero'] . ' - ' . $os['bairro'] . ' - ' . $os['cidade'] . '/' . $os['estado']); ?></div>
                    <div><strong>Equipamento:</strong> <span style="color: #dc2626; font-weight: bold;"><?= htmlspecialchars($os['equipamento_tipo']); ?></span> - <?= htmlspecialchars($os['modelo_equipamento']); ?></div>
                </div>
                <div style="text-align: right;">
                    <div><strong>CNPJ/CPF:</strong> <?= htmlspecialchars($os['cliente_documento']); ?></div>
                    <div><strong>WhatsApp:</strong> <?= htmlspecialchars($os['celular'] ?: $os['telefone']); ?></div>
                    <div><strong>Técnico MFx:</strong> <?= htmlspecialchars($os['tecnico_responsavel']); ?></div>
                </div>
            </div>
        </div>
    </div>

    <table class="tabela-itens">
        <thead>
            <tr>
                <th style="width: 14%; text-align: center;">Código</th>
                <th style="width: 44%;">Descrição</th>
                <th style="width: 14%; text-align: center;">Prazo</th>
                <th style="width: 8%; text-align: center;">Qtd</th>
                <th style="width: 10%; text-align: right;">Unitário</th>
                <th style="width: 10%; text-align: right;">Total</th>
            </tr>
        </thead>
        <tbody>
            <?php foreach ($itensPorCategoria as $categoria => $listaItens): ?>
                <tr><td colspan="6" class="th-cat">Categoria: <?= htmlspecialchars($categoria); ?></td></tr>
                <?php foreach ($listaItens as $it): ?>
                    <tr>
                        <td style="text-align: center; font-family: monospace; font-weight: bold;"><?= htmlspecialchars($it['codigo']); ?></td>
                        <td><?= htmlspecialchars($it['descricao']); ?></td>
                        <td style="text-align: center;"><?= htmlspecialchars($it['prazo_entrega']); ?></td>
                        <td style="text-align: center; font-weight: bold;"><?= number_format($it['quantidade'], 0, ',', '.'); ?></td>
                        <td style="text-align: right;">R$ <?= number_format($it['preco_unitario'], 2, ',', '.'); ?></td>
                        <td style="text-align: right; font-weight: bold;">R$ <?= number_format($it['valor_total'], 2, ',', '.'); ?></td>
                    </tr>
                <?php endforeach; ?>
            <?php endforeach; ?>
        </tbody>
    </table>

    <div class="bloco-totais">
        <div class="secao-box">
            <div class="secao-header">Composição Operacional</div>
            <div class="secao-corpo">
                <div>Deslocamento: <?= number_format($os['km_rodados'], 1, ',', '.'); ?> KM × R$ <?= number_format($os['valor_unitario_km'], 2, ',', '.'); ?> = <strong>R$ <?= number_format($os['km_rodados'] * $os['valor_unitario_km'], 2, ',', '.'); ?></strong></div>
                <div>Mão de Obra: <?= number_format($os['horas_trabalhadas'], 1, ',', '.'); ?> h × R$ <?= number_format($os['valor_hora_tecnica'], 2, ',', '.'); ?> = <strong>R$ <?= number_format($os['horas_trabalhadas'] * $os['valor_hora_tecnica'], 2, ',', '.'); ?></strong></div>
                <div>Despesas Extras: <strong>R$ <?= number_format($os['despesa_alimentacao'] + $os['despesa_estadia'] + $os['outras_despesas'], 2, ',', '.'); ?></strong></div>
                <div style="margin-top: 5px; color: #dc2626;"><strong>Total Operacional: R$ <?= number_format($os['total_operacional'], 2, ',', '.'); ?></strong></div>
            </div>
        </div>

        <div class="caixa-total-geral">
            <div style="font-size: 8pt; color: #cbd5e1;">SUBTOTAL ITENS: R$ <?= number_format($os['total_itens'], 2, ',', '.'); ?></div>
            <div style="font-size: 8pt; color: #cbd5e1;">SUBTOTAL OPERACIONAL: R$ <?= number_format($os['total_operacional'], 2, ',', '.'); ?></div>
            <div style="font-size: 9pt; font-weight: bold; margin-top: 5px;">VALOR TOTAL GERAL DA OS</div>
            <div class="valor-total">R$ <?= number_format($os['valor_total_geral'], 2, ',', '.'); ?></div>
        </div>
    </div>

    <div class="assinaturas">
        <div class="linha-assinatura">
            <strong>MFx Tecnologia Industrial</strong><br>
            Técnico: <?= htmlspecialchars($os['tecnico_responsavel']); ?>
        </div>
        <div class="linha-assinatura">
            <strong><?= htmlspecialchars($os['cliente_nome']); ?></strong><br>
            Aceite do Cliente
        </div>
    </div>
</div>

</body>
</html>`
  },
  {
    filename: 'listar_os.php',
    description: 'Painel de listagem e controle de ordens de serviço com filtros de status e botões diretos para impressão.',
    language: 'php',
    content: `<?php
/**
 * MFx Tecnologia Industrial - Sistema de Gestão de OS
 * Arquivo: listar_os.php - Painel de Controle e Histórico de Ordens de Serviço
 */
require_once 'conexao.php';

$filtro_status = $_GET['status'] ?? '';
$busca = trim($_GET['busca'] ?? '');

$sql = "SELECT os.*, c.nome AS cliente_nome, c.cidade, c.estado 
        FROM ordens_servico os 
        INNER JOIN clientes c ON os.cliente_id = c.id ";
$params = [];
$clausulas = [];

if (!empty($filtro_status)) {
    $clausulas[] = "os.status = ?";
    $params[] = $filtro_status;
}

if (!empty($busca)) {
    $clausulas[] = "(os.numero_os LIKE ? OR c.nome LIKE ? OR os.equipamento_tipo LIKE ?)";
    $params[] = "%$busca%";
    $params[] = "%$busca%";
    $params[] = "%$busca%";
}

if (!empty($clausulas)) {
    $sql .= " WHERE " . implode(" AND ", $clausulas);
}

$sql .= " ORDER BY os.id DESC";
$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$ordens = $stmt->fetchAll();
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MFx Tecnologia - Ordens de Serviço</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
    <style>
        :root { --mfx-orange: #ea580c; --mfx-dark: #0f172a; }
        body { background-color: #f8fafc; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        .navbar-mfx { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-bottom: 3px solid var(--mfx-orange); }
        .card-custom { border: none; border-radius: 10px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.08); }
    </style>
</head>
<body>

<nav class="navbar navbar-expand-lg navbar-dark navbar-mfx mb-4 shadow">
    <div class="container-fluid px-4">
        <a class="navbar-brand fw-bold d-flex align-items-center gap-2" href="index.php">
            <span class="badge bg-danger p-2"><i class="fa-solid fa-fire"></i> MFx</span>
            <span>Tecnologia Industrial</span>
        </a>
        <div class="navbar-nav ms-auto gap-2">
            <a class="nav-link" href="index.php"><i class="fa-solid fa-house"></i> Início</a>
            <a class="nav-link" href="clientes.php"><i class="fa-solid fa-users"></i> Clientes</a>
            <a class="nav-link" href="nova_os.php"><i class="fa-solid fa-plus-circle"></i> Nova OS</a>
            <a class="nav-link active" href="listar_os.php"><i class="fa-solid fa-file-lines"></i> Ordens de Serviço</a>
        </div>
    </div>
</nav>

<div class="container my-4">
    <div class="d-flex justify-content-between align-items-center mb-4">
        <div>
            <h3 class="fw-bold text-dark mb-0"><i class="fa-solid fa-file-lines text-danger"></i> Ordens de Serviço & Relatórios</h3>
            <p class="text-muted small mb-0">Controle de orçamentos, chamados técnicos e vendas de consumíveis Laser / Plasma / Oxicorte.</p>
        </div>
        <a href="nova_os.php" class="btn btn-danger fw-bold"><i class="fa-solid fa-plus me-1"></i> Abrir Nova OS</a>
    </div>

    <div class="card card-custom">
        <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
                <thead class="table-dark">
                    <tr>
                        <th>Nº da OS</th>
                        <th>Cliente / Indústria</th>
                        <th>Tecnologia</th>
                        <th>Data</th>
                        <th>Status</th>
                        <th class="text-end">Total da OS</th>
                        <th class="text-center">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (empty($ordens)): ?>
                        <tr><td colspan="7" class="text-center py-5 text-muted">Nenhuma Ordem de Serviço encontrada.</td></tr>
                    <?php else: ?>
                        <?php foreach ($ordens as $o): ?>
                            <tr>
                                <td class="fw-bold text-danger"><?= htmlspecialchars($o['numero_os']); ?></td>
                                <td>
                                    <strong><?= htmlspecialchars($o['cliente_nome']); ?></strong><br>
                                    <small class="text-muted"><?= htmlspecialchars($o['cidade'] . '/' . $o['estado']); ?></small>
                                </td>
                                <td><span class="badge bg-light text-dark border"><?= htmlspecialchars($o['equipamento_tipo']); ?></span></td>
                                <td class="small"><?= date('d/m/Y', strtotime($o['data_abertura'])); ?></td>
                                <td><span class="badge bg-secondary"><?= htmlspecialchars($o['status']); ?></span></td>
                                <td class="text-end fw-bold text-dark">R$ <?= number_format($o['valor_total_geral'], 2, ',', '.'); ?></td>
                                <td class="text-center">
                                    <a href="imprimir_os.php?id=<?= $o['id']; ?>" class="btn btn-sm btn-outline-danger" target="_blank">
                                        <i class="fa-solid fa-print"></i> Imprimir A4
                                    </a>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`
  },
  {
    filename: 'README_INSTALACAO.md',
    description: 'Instruções passo a passo de como rodar o projeto PHP e MySQL no XAMPP, WAMP, Docker ou cPanel.',
    language: 'markdown',
    content: `# MFx Tecnologia Industrial - Sistema de Gestão Empresarial (ERP)

Layout completo de abertura em **PHP com PDO e MySQL**, estilizado com **Bootstrap 5 e FontAwesome 6**.

## Estrutura do ERP
- **Barra Lateral Esquerda (Sidebar):** Fundo escuro \`#212529\`, logotipo oficial, menu retrátil com os módulos (*Pessoas, Estoque, Compras, Vendas, Orçamento, OS, Financeiro, Fiscal, Relatórios, Acesso, Configurações, Ajuda*) e rodapé com perfil do operador \`ADM - MEDRADE\`.
- **Barra Superior (Topbar Ribbon):** Atalhos rápidos para Produtos, Compras, Vendas, Orçamento, Caixa, PDV, NF-e, NFS-e, Receber, Pagar e Sair, além de sino de notificações.
- **Área Central (Workspace):** Logo oficial **MFx TECNOLOGIA** centralizado em destaque no modelo de capa do sistema.
- **Rodapé Inferior (Status Bar):** Versão 1.0.0, Data/Hora ao vivo, Licenciamento MFx Tecnologia Industrial (CNPJ: 34.375.789-0001/87), IP 192.168.1.105 e indicador verde de conexão \`● Internet ON\`.
`
  }
];

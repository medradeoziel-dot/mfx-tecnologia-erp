export interface PhpFileDefinition {
  filename: string;
  description: string;
  language: 'php' | 'sql' | 'markdown' | 'css' | 'html';
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

            <a href="compras.php" class="sidebar-link">
                <i class="fa-solid fa-cart-flatbed text-success"></i>
                <span>Compras</span>
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
                <a href="compras.php" class="quick-btn" title="Compras">
                    <i class="fa-solid fa-cart-shopping text-success"></i>
                    <span>Compras</span>
                </a>
                <a href="#" class="quick-btn" title="Caixa">
                    <i class="fa-solid fa-vault text-dark"></i>
                    <span>Caixa</span>
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
  \`inscricao_estadual\` VARCHAR(30) NULL COMMENT 'Inscrição Estadual (IE)',
  \`indicador_ie\` VARCHAR(2) NOT NULL DEFAULT '1' COMMENT '1=Contribuinte, 2=Isento, 9=Não Contribuinte',
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

-- 3. Tabela de Cadastro e Estoque de Produtos e Prestação de Serviços (Mão de Obra)
CREATE TABLE IF NOT EXISTS \`produtos_servicos\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`tipo\` ENUM('produto', 'servico') NOT NULL DEFAULT 'produto' COMMENT 'produto (NF-e Mod. 55) ou servico (NFS-e Municipal)',
  \`codigo\` VARCHAR(40) NOT NULL UNIQUE,
  \`descricao\` VARCHAR(255) NOT NULL,
  \`categoria\` VARCHAR(60) NOT NULL DEFAULT 'Consumíveis',
  \`unidade_medida\` VARCHAR(10) NOT NULL DEFAULT 'UN' COMMENT 'UN, HR, DIA, PC, JG, MT, CX',
  \`preco_venda\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`estoque_atual\` INT NOT NULL DEFAULT 0,
  \`estoque_minimo\` INT NOT NULL DEFAULT 5,
  
  -- Campos Fiscais Exclusivos para Prestação de Serviços / Mão de Obra (NFS-e Municipal)
  \`codigo_servico_lc116\` VARCHAR(20) NULL COMMENT 'Ex: 14.01 - Manutenção de máquinas e equipamentos',
  \`descricao_lc116\` VARCHAR(255) NULL,
  \`codigo_tributacao_municipal\` VARCHAR(40) NULL COMMENT 'CTISS / Código de Atividade do Município',
  \`item_lc116\` VARCHAR(20) NULL COMMENT 'Item da Lista LC 116/2003',
  \`aliquota_iss\` DECIMAL(5,2) NULL DEFAULT 3.00 COMMENT 'Alíquota de ISS (%) ex: 2%, 3%, 5%',
  \`exigibilidade_iss\` VARCHAR(2) NULL DEFAULT '1' COMMENT '1=Exigível, 2=Não Incidência, 3=Isenção, 4=Imune, etc.',
  \`retencao_iss\` TINYINT(1) NOT NULL DEFAULT 0 COMMENT '0=Não, 1=Sim',
  \`cfop_servico\` VARCHAR(10) NULL DEFAULT '5933' COMMENT '5933 Municipal, 6933 Interestadual',
  
  -- Campos Fiscais Exclusivos para Produtos / Consumíveis (NF-e Mod. 55)
  \`ncm\` VARCHAR(20) NULL COMMENT 'Nomenclatura Comum do Mercosul ex: 9027.90.99',
  \`cst_csosn\` VARCHAR(10) NULL DEFAULT '0102' COMMENT '0102 Tributada sem permissão de crédito',
  \`cfop_produto\` VARCHAR(10) NULL DEFAULT '5102' COMMENT '5102 Venda de mercadoria',
  \`origem\` VARCHAR(2) NULL DEFAULT '0' COMMENT '0=Nacional, 1=Estrangeira Direta, 2=Estrangeira Mercado Interno',
  
  \`observacoes_fiscais\` TEXT NULL,
  \`data_cadastro\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  \`data_atualizacao\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  INDEX \`idx_tipo\` (\`tipo\`),
  INDEX \`idx_codigo\` (\`codigo\`),
  INDEX \`idx_categoria\` (\`categoria\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 4. Tabela de Itens da OS (Consumíveis, Peças e Mão de Obra com Split Fiscal)
CREATE TABLE IF NOT EXISTS \`itens_os\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`ordem_servico_id\` INT NOT NULL,
  \`tipo_item\` ENUM('produto', 'servico') NOT NULL DEFAULT 'produto',
  \`categoria\` VARCHAR(60) NOT NULL DEFAULT 'Consumíveis',
  \`codigo\` VARCHAR(40) NOT NULL,
  \`descricao\` VARCHAR(255) NOT NULL,
  \`unidade_medida\` VARCHAR(10) NOT NULL DEFAULT 'UN',
  \`ncm\` VARCHAR(20) NULL,
  \`codigo_servico_lc116\` VARCHAR(20) NULL,
  \`aliquota_iss\` DECIMAL(5,2) NULL DEFAULT 3.00,
  \`cfop\` VARCHAR(10) NULL,
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

-- Inserção de Produtos e Serviços Padrão com Especificações Fiscais
INSERT INTO \`produtos_servicos\` 
(\`tipo\`, \`codigo\`, \`descricao\`, \`categoria\`, \`unidade_medida\`, \`preco_venda\`, \`estoque_atual\`, \`estoque_minimo\`, \`ncm\`, \`cst_csosn\`, \`cfop_produto\`, \`origem\`, \`codigo_servico_lc116\`, \`codigo_tributacao_municipal\`, \`aliquota_iss\`, \`cfop_servico\`, \`observacoes_fiscais\`)
VALUES
-- Produtos (NF-e)
('produto', 'MFX-LP30-15', 'Lente de Proteção Laser Fibra D30 x 1.5mm Quartzo Fundido 1064nm', 'Consumíveis', 'UN', 120.00, 34, 10, '9027.90.99', '0102', '5102', '1', NULL, NULL, NULL, NULL, 'Importação direta, quartzo JGS1.'),
('produto', 'MFX-BD-15', 'Bico Laser Duplo Cromado D32 H15 Calibre 1.5mm', 'Consumíveis', 'UN', 85.00, 22, 8, '8466.93.30', '0102', '5102', '0', NULL, NULL, NULL, NULL, 'Bico duplo para oxigênio.'),
('produto', 'MFX-BP-105', 'Bico de Plasma Alta Definição 105A', 'Consumíveis', 'UN', 95.00, 40, 12, '8466.93.30', '0102', '5102', '0', NULL, NULL, NULL, NULL, 'Compatível Powermax 105.'),
('produto', 'MFX-EP-100', 'Eletrodo de Plasma Híbrido Cobre/Háfnio 100A', 'Consumíveis', 'UN', 110.00, 28, 10, '8466.93.30', '0102', '5102', '0', NULL, NULL, NULL, NULL, 'Inserto central de háfnio.'),
-- Serviços e Mão de Obra (NFS-e Municipal)
('servico', 'MFX-SRV-LASER-01', 'Alinhamento Óptico do Feixe Laser Fibra, Colimação e Foco', 'Serviços Laser', 'UN', 650.00, 0, 0, NULL, NULL, NULL, NULL, '14.01', '1401-0/01-88', 3.00, '5933', 'NFS-e Prefeitura Municipal de Agudos.'),
('servico', 'MFX-MO-HORA', 'Hora Técnica de Manutenção Mecânica, Elétrica e CNC', 'Mão de Obra', 'HR', 100.00, 0, 0, NULL, NULL, NULL, NULL, '14.01', '1401-0/02-00', 3.00, '5933', 'Apuração por hora técnica em campo.'),
('servico', 'MFX-MO-DIARIA', 'Diária Técnica de Especialista em Campo / Retrofit CNC', 'Mão de Obra', 'DIA', 800.00, 0, 0, NULL, NULL, NULL, NULL, '14.01', '1401-0/04-00', 3.00, '5933', 'Diária técnica de 8 horas.'),
('servico', 'MFX-SRV-OXI-01', 'Revisão Geral do Maçarico de Oxicorte, Troca de Gaxetas e Calibração', 'Serviços Oxicorte', 'UN', 350.00, 0, 0, NULL, NULL, NULL, NULL, '14.01', '1401-0/03-55', 2.50, '5933', 'Revisão de maçarico pantográfico.');

-- 5. Tabela de Compras / Notas Fiscais de Entrada (Entrada Física de Estoque)
CREATE TABLE IF NOT EXISTS \`compras\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`numero_nota\` VARCHAR(50) NOT NULL COMMENT 'Número da Nota Fiscal / Chave NF-e',
  \`fornecedor\` VARCHAR(150) NOT NULL COMMENT 'Fornecedor / Razão Social',
  \`data_compra\` DATE NOT NULL,
  \`observacoes\` TEXT NULL,
  \`valor_total\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`data_cadastro\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX \`idx_fornecedor\` (\`fornecedor\`),
  INDEX \`idx_data_compra\` (\`data_compra\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 6. Tabela de Itens da Compra (Detalhamento dos Insumos Adquiridos)
CREATE TABLE IF NOT EXISTS \`itens_compra\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`compra_id\` INT NOT NULL,
  \`produto_id\` INT NULL,
  \`codigo\` VARCHAR(40) NOT NULL,
  \`descricao\` VARCHAR(255) NOT NULL,
  \`unidade_medida\` VARCHAR(10) NOT NULL DEFAULT 'UN',
  \`quantidade\` DECIMAL(10,2) NOT NULL DEFAULT 1.00,
  \`preco_custo_unitario\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`valor_total\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  FOREIGN KEY (\`compra_id\`)\ REFERENCES \`compras\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Inserção de Compras de Exemplo
INSERT INTO \`compras\` (\`numero_nota\`, \`fornecedor\`, \`data_compra\`, \`observacoes\`, \`valor_total\`)
VALUES 
('NF-e 048.912', 'Raytools Laser Optics & Consumables Co.', '2026-10-14', 'Importação direta via despachante Santos. Consumíveis Raytools BM111.', 5850.00),
('NF-e 119.450', 'Hypertherm do Brasil Sistemas Térmicos', '2026-10-18', 'Consumíveis originais para tochas Powermax 105A.', 4200.00);

INSERT INTO \`itens_compra\` (\`compra_id\`, \`produto_id\`, \`codigo\`, \`descricao\`, \`unidade_medida\`, \`quantidade\`, \`preco_custo_unitario\`, \`valor_total\`)
VALUES 
(1, 1, 'MFX-LP30-15', 'Lente de Proteção Laser Fibra D30 x 1.5mm Quartzo Fundido 1064nm', 'UN', 30.00, 55.00, 1650.00),
(1, 2, 'MFX-BD-15', 'Bico Laser Duplo Cromado D32 H15 Calibre 1.5mm', 'UN', 40.00, 42.50, 1700.00),
(2, 3, 'MFX-BP-105', 'Bico de Plasma Alta Definição 105A', 'UN', 25.00, 52.00, 1300.00),
(2, 4, 'MFX-EP-100', 'Eletrodo de Plasma Híbrido Cobre/Háfnio 100A', 'UN', 30.00, 58.00, 1740.00);

-- 7. Tabela de Vendas de Balcão e Faturamento PDV
CREATE TABLE IF NOT EXISTS \`vendas\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`codigo_venda\` VARCHAR(40) NOT NULL UNIQUE COMMENT 'Ex: VND-2026-0042',
  \`cliente_id\` INT NULL,
  \`cliente_nome\` VARCHAR(200) NOT NULL DEFAULT 'Consumidor Final / Venda Balcão',
  \`cliente_documento\` VARCHAR(30) NULL,
  \`data_venda\` DATE NOT NULL,
  \`hora_venda\` TIME NOT NULL,
  \`forma_pagamento\` ENUM('DINHEIRO', 'PIX', 'CARTAO_CREDITO', 'CARTAO_DEBITO', 'BOLETO') NOT NULL DEFAULT 'PIX',
  \`detalhe_pagamento\` VARCHAR(150) NULL COMMENT 'Ex: PIX Chave CNPJ ou Cartão 3x',
  \`valor_subtotal\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`valor_desconto\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`valor_total\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`valor_recebido\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`valor_troco\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`observacoes\` TEXT NULL,
  \`operador\` VARCHAR(100) NOT NULL DEFAULT 'ADM - MEDRADE',
  \`data_cadastro\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX \`idx_data_venda\` (\`data_venda\`),
  INDEX \`idx_cliente\` (\`cliente_id\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 8. Tabela de Itens da Venda (Detalhamento dos Consumíveis/Peças Vendidos)
CREATE TABLE IF NOT EXISTS \`itens_venda\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`venda_id\` INT NOT NULL,
  \`produto_id\` INT NULL,
  \`codigo\` VARCHAR(40) NOT NULL,
  \`descricao\` VARCHAR(255) NOT NULL,
  \`unidade_medida\` VARCHAR(10) NOT NULL DEFAULT 'UN',
  \`quantidade\` DECIMAL(10,2) NOT NULL DEFAULT 1.00,
  \`preco_unitario\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`desconto_unitario\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`valor_total\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  FOREIGN KEY (\`venda_id\`) REFERENCES \`vendas\`(\`id\`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- 9. Tabela de Movimentações de Caixa / Financeiro
CREATE TABLE IF NOT EXISTS \`movimentos_caixa\` (
  \`id\` INT AUTO_INCREMENT PRIMARY KEY,
  \`tipo\` ENUM('ENTRADA', 'SAIDA') NOT NULL DEFAULT 'ENTRADA',
  \`origem\` ENUM('PDV', 'OS', 'COMPRA', 'MANUAL') NOT NULL DEFAULT 'PDV',
  \`referencia_id\` VARCHAR(50) NULL,
  \`descricao\` VARCHAR(255) NOT NULL,
  \`forma_pagamento\` VARCHAR(50) NOT NULL DEFAULT 'PIX',
  \`valor\` DECIMAL(10,2) NOT NULL DEFAULT 0.00,
  \`data_hora\` DATETIME NOT NULL,
  \`operador\` VARCHAR(100) NOT NULL DEFAULT 'ADM - MEDRADE',
  \`data_cadastro\` TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  INDEX \`idx_tipo\` (\`tipo\`),
  INDEX \`idx_origem\` (\`origem\`),
  INDEX \`idx_data_hora\` (\`data_hora\`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- Inserção de Vendas Iniciais de Exemplo no PDV
INSERT INTO \`vendas\` (\`codigo_venda\`, \`cliente_nome\`, \`cliente_documento\`, \`data_venda\`, \`hora_venda\`, \`forma_pagamento\`, \`detalhe_pagamento\`, \`valor_subtotal\`, \`valor_desconto\`, \`valor_total\`, \`valor_recebido\`, \`valor_troco\`, \`operador\`)
VALUES 
('VND-2026-0042', 'Metalúrgica Corte & Conformação Paulista Ltda', '52.148.963/0001-44', '2026-10-18', '10:45:00', 'PIX', 'PIX Direto CNPJ MFx Industrial', 890.00, 40.00, 850.00, 850.00, 0.00, 'ADM - MEDRADE'),
('VND-2026-0043', 'Consumidor Final / Venda Balcão', '98.765.432/0001-10', '2026-10-19', '08:30:00', 'CARTAO_CREDITO', 'Cartão de Crédito 2x Sem Juros', 680.00, 0.00, 680.00, 680.00, 0.00, 'ADM - MEDRADE');

INSERT INTO \`movimentos_caixa\` (\`tipo\`, \`origem\`, \`referencia_id\`, \`descricao\`, \`forma_pagamento\`, \`valor\`, \`data_hora\`, \`operador\`)
VALUES 
('ENTRADA', 'PDV', 'VND-2026-0042', 'Recebimento Venda Balcão VND-2026-0042 - Metalúrgica Paulista', 'PIX', 850.00, '2026-10-18 10:45:00', 'ADM - MEDRADE'),
('ENTRADA', 'PDV', 'VND-2026-0043', 'Recebimento Venda Balcão VND-2026-0043 - Consumidor Final', 'CARTAO_CREDITO', 680.00, '2026-10-19 08:30:00', 'ADM - MEDRADE');
`
  },
  {
    filename: 'cadastro_cliente.html',
    description: 'Formulário oficial de cadastro do cliente com consulta inteligente automática via BrasilAPI (CPF/CNPJ) e feedback dinâmico.',
    language: 'html',
    content: `<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <title>Cadastro e Gestão de Clientes - MFx Tecnologia</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
    <script>
        async function consultarDocumento(input) {
            let doc = input.value.replace(/\D/g, '');
            
            if (doc.length === 11) {
                document.getElementById('feedback_status').className = "alert alert-warning py-2 mb-3";
                document.getElementById('feedback_status').innerHTML = "⚠️ CPF detectado. Preencha os dados manualmente.";
                document.getElementById('indicador_ie').value = "9"; // Não Contribuinte
                document.getElementById('inscricao_estadual').value = "ISENTO";
                return;
            }

            if (doc.length === 14) {
                document.getElementById('feedback_status').className = "alert alert-info py-2 mb-3";
                document.getElementById('feedback_status').innerHTML = "⏳ Consultando dados na Receita Federal e SEFAZ...";
                
                try {
                    // 1. Consulta BrasilAPI (Receita Federal)
                    let response = await fetch(\`https://brasilapi.com.br/api/cnpj/v1/\${doc}\`);
                    
                    if (response.ok) {
                        let data = await response.json();
                        
                        document.getElementById('nome').value = data.razao_social || '';
                        document.getElementById('nome_fantasia').value = data.nome_fantasia || '';
                        document.getElementById('cep').value = data.cep || '';
                        document.getElementById('logradouro').value = data.logradouro || '';
                        document.getElementById('numero').value = data.numero || '';
                        document.getElementById('complemento').value = data.complemento || '';
                        document.getElementById('bairro').value = data.bairro || '';
                        document.getElementById('cidade').value = data.municipio || '';
                        let ufEncontrada = (data.uf || 'SP').toUpperCase();
                        document.getElementById('uf').value = ufEncontrada;
                        document.getElementById('telefone').value = data.ddd_telefone_1 || '';
                        document.getElementById('email').value = data.email ? data.email.toLowerCase() : '';

                        // 2. Consulta complementar automática para buscar a Inscrição Estadual (IE) na SEFAZ (CNPJ.ws / Sintegra)
                        let ieEncontrada = '';

                        // Verifica se a própria BrasilAPI já retornou alguma IE no array
                        if (data.inscricoes_estaduais && Array.isArray(data.inscricoes_estaduais) && data.inscricoes_estaduais.length > 0) {
                            let ieItem = data.inscricoes_estaduais.find(i => i.ativo) || data.inscricoes_estaduais[0];
                            if (ieItem && ieItem.inscricao_estadual) {
                                ieEncontrada = String(ieItem.inscricao_estadual).trim();
                            }
                        }

                        // Caso não tenha na BrasilAPI, consulta a API pública complementar da CNPJ.ws
                        if (!ieEncontrada) {
                            try {
                                let resWs = await fetch(\`https://publica.cnpj.ws/cnpj/\${doc}\`);
                                if (resWs.ok) {
                                    let dataWs = await resWs.json();
                                    let listaIes = dataWs?.estabelecimento?.inscricoes_estaduais || dataWs?.inscricoes_estaduais || [];
                                    if (Array.isArray(listaIes) && listaIes.length > 0) {
                                        let ieItem = listaIes.find(item => {
                                            let itemUf = (item?.estado?.sigla || item?.estado || '').toUpperCase();
                                            return item?.ativo && (!ufEncontrada || itemUf === ufEncontrada);
                                        }) || listaIes.find(item => item?.ativo) || listaIes[0];

                                        if (ieItem && ieItem.inscricao_estadual) {
                                            ieEncontrada = String(ieItem.inscricao_estadual).trim();
                                        }
                                    }
                                }
                            } catch (errWs) {
                                console.warn("Consulta complementar SEFAZ/CNPJ.ws indisponível:", errWs);
                            }
                        }

                        // 3 & 4. Regras de preenchimento da Inscrição Estadual e Indicador IE
                        if (ieEncontrada && ieEncontrada.toUpperCase() !== 'ISENTO') {
                            document.getElementById('inscricao_estadual').value = ieEncontrada;
                            document.getElementById('indicador_ie').value = "1"; // 1 - Contribuinte ICMS (Possui Inscrição Estadual)
                            document.getElementById('feedback_status').className = "alert alert-success py-2 mb-3";
                            document.getElementById('feedback_status').innerHTML = \`✅ Dados carregados com sucesso! Razão Social: "<strong>\${data.razao_social}</strong>" | IE SEFAZ: <strong>\${ieEncontrada}</strong> (Contribuinte ICMS).\`;
                        } else {
                            document.getElementById('inscricao_estadual').value = "ISENTO";
                            document.getElementById('indicador_ie').value = "2"; // 2 - Contribuinte Isento de Inscrição Estadual
                            document.getElementById('feedback_status').className = "alert alert-success py-2 mb-3";
                            document.getElementById('feedback_status').innerHTML = \`✅ Dados carregados com sucesso! Razão Social: "<strong>\${data.razao_social}</strong>" | IE: <strong>ISENTO</strong> (Contribuinte Isento).\`;
                        }
                    } else {
                        document.getElementById('feedback_status').className = "alert alert-danger py-2 mb-3";
                        document.getElementById('feedback_status').innerHTML = "❌ CNPJ não encontrado.";
                    }
                } catch (error) {
                    console.error("Erro:", error);
                    document.getElementById('feedback_status').className = "alert alert-danger py-2 mb-3";
                    document.getElementById('feedback_status').innerHTML = "❌ Erro ao consultar o CNPJ.";
                }
            }
        }

        function definirIsento() {
            document.getElementById('inscricao_estadual').value = "ISENTO";
            document.getElementById('indicador_ie').value = "2";
        }
    </script>
</head>
<body class="bg-light">

<div class="container mt-4">
    <div class="card shadow-sm p-4">
        <h4 class="mb-3">➕ FORMULÁRIO DE CADASTRO DO CLIENTE (PRONTO PARA FATURAMENTO E NF-E)</h4>
        
        <div id="feedback_status" class="alert alert-secondary py-2 mb-3" role="alert">
            ℹ️ Digite o CNPJ para buscar os dados automaticamente.
        </div>

        <form action="salvar_cliente.php" method="POST" class="row g-3">
            
            <div class="col-md-4">
                <label class="form-label">CPF OU CNPJ *</label>
                <input type="text" class="form-control" name="documento" id="documento" placeholder="Digite apenas números" onblur="consultarDocumento(this)" required>
            </div>
            
            <div class="col-md-8">
                <label class="form-label">RAZÃO SOCIAL (NOME COMPLETO) *</label>
                <input type="text" class="form-control" name="nome" id="nome" required>
            </div>

            <div class="col-md-12">
                <label class="form-label">NOME FANTASIA (OPCIONAL)</label>
                <input type="text" class="form-control" name="nome_fantasia" id="nome_fantasia">
            </div>

            <!-- CAMPO DE INSCRIÇÃO ESTADUAL LIMPO E FUNCIONAL -->
            <div class="col-md-6">
                <div class="d-flex justify-content-between align-items-center mb-1">
                    <label class="form-label mb-0">INSCRIÇÃO ESTADUAL (IE)</label>
                    <button type="button" class="btn btn-sm btn-outline-secondary py-0 px-2" onclick="definirIsento()" style="font-size: 11px;">Definir ISENTO</button>
                </div>
                <input type="text" class="form-control" name="inscricao_estadual" id="inscricao_estadual">
            </div>

            <div class="col-md-6">
                <label class="form-label">INDICADOR DE IE (SEFAZ) <small class="text-muted">enquadramento fiscal</small></label>
                <select class="form-select" name="indicador_ie" id="indicador_ie">
                    <option value="1">1 - Contribuinte ICMS (Possui Inscrição Estadual)</option>
                    <option value="2" selected>2 - Contribuinte Isento de Inscrição Estadual</option>
                    <option value="9">9 - Não Contribuinte (Pode não ter IE)</option>
                </select>
            </div>
            <!-- FIM DA SEÇÃO FISCAL -->

            <div class="col-md-3">
                <label class="form-label">CEP *</label>
                <input type="text" class="form-control" name="cep" id="cep" required>
            </div>

            <div class="col-md-7">
                <label class="form-label">ENDEREÇO (LOGRADOURO) *</label>
                <input type="text" class="form-control" name="logradouro" id="logradouro" required>
            </div>

            <div class="col-md-2">
                <label class="form-label">NÚMERO *</label>
                <input type="text" class="form-control" name="numero" id="numero" required>
            </div>

            <div class="col-md-4">
                <label class="form-label">COMPLEMENTO</label>
                <input type="text" class="form-control" name="complemento" id="complemento" placeholder="Sala, Galpão...">
            </div>

            <div class="col-md-4">
                <label class="form-label">BAIRRO *</label>
                <input type="text" class="form-control" name="bairro" id="bairro" required>
            </div>

            <div class="col-md-3">
                <label class="form-label">CIDADE *</label>
                <input type="text" class="form-control" name="cidade" id="cidade" required>
            </div>

            <div class="col-md-1">
                <label class="form-label">UF *</label>
                <input type="text" class="form-control" name="uf" id="uf" required>
            </div>

            <div class="col-md-4">
                <label class="form-label">TELEFONE FIXO</label>
                <input type="text" class="form-control" name="telefone" id="telefone">
            </div>

            <div class="col-md-4">
                <label class="form-label">CELULAR / WHATSAPP *</label>
                <input type="text" class="form-control" name="celular" id="celular">
            </div>

            <div class="col-md-4">
                <label class="form-label">E-MAIL COMERCIAL (NF-E)</label>
                <input type="email" class="form-control" name="email" id="email">
            </div>

            <div class="col-md-12">
                <label class="form-label">OBSERVAÇÕES / MÁQUINAS INSTALADAS (LASER, PLASMA, OXICORTE)</label>
                <textarea class="form-control" name="observacao" rows="3" placeholder="Ex: Possui Máquina Laser Fibra 3kW Raycus, horários de recebimento, etc."></textarea>
            </div>

            <div class="col-12 text-end">
                <button type="reset" class="btn btn-secondary">Limpar</button>
                <button type="submit" class="btn btn-danger">Salvar Cliente</button>
            </div>
        </form>
    </div>
</div>

</body>
</html>`
  },
  {
    filename: 'salvar_cliente.php',
    description: 'Endpoint PHP de persistência para receber o formulário de cadastro e gravar no MySQL via PDO.',
    language: 'php',
    content: `<?php
/**
 * MFx Tecnologia Industrial - Sistema de Gestão de Clientes e OS
 * Arquivo: salvar_cliente.php - Salva dados do cliente no banco MySQL
 */
require_once 'conexao.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $documento          = trim($_POST['documento'] ?? '');
    $nome               = trim($_POST['nome'] ?? '');
    $nome_fantasia      = trim($_POST['nome_fantasia'] ?? '');
    $inscricao_estadual = trim($_POST['inscricao_estadual'] ?? '');
    $indicador_ie       = trim($_POST['indicador_ie'] ?? '1');
    $cep                = trim($_POST['cep'] ?? '');
    $logradouro         = trim($_POST['logradouro'] ?? '');
    $numero             = trim($_POST['numero'] ?? '');
    $complemento        = trim($_POST['complemento'] ?? '');
    $bairro             = trim($_POST['bairro'] ?? '');
    $cidade             = trim($_POST['cidade'] ?? '');
    $uf                 = strtoupper(trim($_POST['uf'] ?? 'SP'));
    $telefone           = trim($_POST['telefone'] ?? '');
    $celular            = trim($_POST['celular'] ?? '');
    $email              = trim($_POST['email'] ?? '');
    $observacao         = trim($_POST['observacao'] ?? '');

    if (empty($documento) || empty($nome) || empty($logradouro) || empty($cidade)) {
        die("<div style='font-family:sans-serif;padding:20px;background:#fee2e2;color:#991b1b;border-radius:8px;'>
                <h3>⚠️ Campos obrigatórios não preenchidos</h3>
                <p>Preencha Documento, Razão Social, Logradouro e Cidade.</p>
                <a href='javascript:history.back()'>Voltar</a>
             </div>");
    }

    try {
        $stmt = $pdo->prepare("INSERT INTO clientes (documento, nome, nome_fantasia, inscricao_estadual, indicador_ie, cep, logradouro, numero, complemento, bairro, cidade, estado, telefone, celular, email, observacoes) 
                               VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
        $stmt->execute([
            $documento, $nome, $nome_fantasia, $inscricao_estadual, $indicador_ie,
            $cep, $logradouro, $numero, $complemento, $bairro, $cidade, $uf,
            $telefone, $celular, $email, $observacao
        ]);

        $novoId = $pdo->lastInsertId();

        echo "<!DOCTYPE html>
        <html lang='pt-BR'>
        <head>
            <meta charset='UTF-8'>
            <title>Cliente Salvo - MFx Tecnologia</title>
            <link href='https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css' rel='stylesheet'>
        </head>
        <body class='bg-light p-4'>
            <div class='container' style='max-width: 600px;'>
                <div class='card shadow-sm p-4 text-center'>
                    <div class='text-success fs-1 mb-2'>✅</div>
                    <h4 class='text-success fw-bold'>Cliente Salvo com Sucesso!</h4>
                    <p class='text-muted'>Os dados de <strong>" . htmlspecialchars($nome) . "</strong> foram salvos no banco de dados da MFx Tecnologia Industrial.</p>
                    <div class='alert alert-light border py-2 text-start small mb-3'>
                        <strong>ID:</strong> #{$novoId}<br>
                        <strong>Documento:</strong> " . htmlspecialchars($documento) . "<br>
                        <strong>Cidade/UF:</strong> " . htmlspecialchars($cidade) . "/" . htmlspecialchars($uf) . "<br>
                        <strong>IE:</strong> " . htmlspecialchars($inscricao_estadual ?: 'ISENTO / Não informada') . "
                    </div>
                    <div class='d-flex justify-content-center gap-2'>
                        <a href='cadastro_cliente.html' class='btn btn-outline-secondary'>Novo Cadastro</a>
                        <a href='clientes.php' class='btn btn-danger'>Ver Lista de Clientes</a>
                    </div>
                </div>
            </div>
        </body>
        </html>";
    } catch (PDOException $e) {
        die("Erro ao salvar cliente: " . htmlspecialchars($e->getMessage()));
    }
} else {
    header("Location: cadastro_cliente.html");
    exit;
}
?>`
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
    $documento          = trim($_POST['documento'] ?? '');
    $nome               = trim($_POST['nome'] ?? '');
    $nome_fantasia      = trim($_POST['nome_fantasia'] ?? '');
    $inscricao_estadual = trim($_POST['inscricao_estadual'] ?? '');
    $indicador_ie       = trim($_POST['indicador_ie'] ?? '1');
    $cep                = trim($_POST['cep'] ?? '');
    $logradouro         = trim($_POST['logradouro'] ?? '');
    $numero             = trim($_POST['numero'] ?? '');
    $complemento        = trim($_POST['complemento'] ?? '');
    $bairro             = trim($_POST['bairro'] ?? '');
    $cidade             = trim($_POST['cidade'] ?? '');
    $estado             = strtoupper(trim($_POST['estado'] ?? 'SP'));
    $telefone           = trim($_POST['telefone'] ?? '');
    $celular            = trim($_POST['celular'] ?? '');
    $email              = trim($_POST['email'] ?? '');
    $observacoes        = trim($_POST['observacao'] ?? $_POST['observacoes'] ?? '');

    if (empty($documento) || empty($nome) || empty($logradouro) || empty($cidade)) {
        $mensagem = "Por favor, preencha os campos obrigatórios (Documento, Nome/Razão Social, Endereço e Cidade).";
        $tipo_alerta = "danger";
    } else {
        try {
            $stmt = $pdo->prepare("INSERT INTO clientes (documento, nome, nome_fantasia, inscricao_estadual, indicador_ie, logradouro, numero, complemento, bairro, cidade, estado, cep, telefone, celular, email, observacoes) 
                                   VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)");
            $stmt->execute([$documento, $nome, $nome_fantasia, $inscricao_estadual, $indicador_ie, $logradouro, $numero, $complemento, $bairro, $cidade, $estado, $cep, $telefone, $celular, $email, $observacoes]);
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
            <div id="feedback_status" class="alert alert-secondary py-2 mb-3" role="alert">
                ℹ️ Digite o CPF ou CNPJ para buscar os dados automaticamente.
            </div>

            <form method="POST" action="clientes.php" id="formCliente">
                <input type="hidden" name="acao" value="salvar_cliente">

                <div class="row g-3">
                    <div class="col-md-4">
                        <label for="documento" class="form-label fw-bold">
                            CPF ou CNPJ <span class="text-danger">*</span>
                            <span id="spinnerCnpj" class="spinner-border spinner-border-sm text-danger ms-2 spinner-api" role="status"></span>
                            <span id="situacaoBadge" class="badge bg-success ms-2 d-none"></span>
                        </label>
                        <div class="input-group">
                            <span class="input-group-text bg-light"><i class="fa-solid fa-id-card"></i></span>
                            <input type="text" class="form-control font-monospace" id="documento" name="documento" 
                                   placeholder="Ex: 34.375.789/0001-87" required onblur="consultarDocumento(this)">
                        </div>
                    </div>

                    <div class="col-md-8">
                        <label for="nome" class="form-label fw-bold">Razão Social (Nome Completo) <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" id="nome" name="nome" required>
                    </div>

                    <div class="col-md-12">
                        <label for="nome_fantasia" class="form-label fw-bold">Nome Fantasia (Opcional)</label>
                        <input type="text" class="form-control" id="nome_fantasia" name="nome_fantasia">
                    </div>

                    <!-- NOVOS CAMPOS DE INSCRIÇÃO ESTADUAL E INDICADOR SEFAZ -->
                    <div class="col-md-6">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <label for="inscricao_estadual" class="form-label fw-bold mb-0">Inscrição Estadual (IE) <small class="text-muted">SEFAZ</small></label>
                            <button type="button" class="btn btn-sm btn-outline-secondary py-0 px-2" onclick="definirIsento()" style="font-size: 11px;">Definir ISENTO</button>
                        </div>
                        <input type="text" class="form-control font-monospace" name="inscricao_estadual" id="inscricao_estadual" placeholder="Ex: 209.632.131.114 ou ISENTO">
                    </div>

                    <div class="col-md-6">
                        <label for="indicador_ie" class="form-label fw-bold">Indicador de IE (SEFAZ) <small class="text-muted">Enquadramento fiscal</small></label>
                        <select class="form-select" name="indicador_ie" id="indicador_ie">
                            <option value="1">1 - Contribuinte ICMS (Possui Inscrição Estadual)</option>
                            <option value="2">2 - Contribuinte Isento de Inscrição Estadual</option>
                            <option value="9">9 - Não Contribuinte (Pode não ter IE)</option>
                        </select>
                    </div>
                    <!-- FIM DOS NOVOS CAMPOS -->

                    <div class="col-md-3">
                        <label for="cep" class="form-label fw-bold">CEP <span class="text-danger">*</span></label>
                        <input type="text" class="form-control font-monospace" name="cep" id="cep" required onblur="consultarCEP(this)">
                    </div>

                    <div class="col-md-7">
                        <label for="logradouro" class="form-label fw-bold">Endereço (Logradouro) <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" name="logradouro" id="logradouro" required>
                    </div>

                    <div class="col-md-2">
                        <label for="numero" class="form-label fw-bold">Número <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" name="numero" id="numero" required>
                    </div>

                    <div class="col-md-4">
                        <label for="complemento" class="form-label">Complemento</label>
                        <input type="text" class="form-control" name="complemento" id="complemento" placeholder="Sala, Galpão...">
                    </div>

                    <div class="col-md-4">
                        <label for="bairro" class="form-label fw-bold">Bairro <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" name="bairro" id="bairro" required>
                    </div>

                    <div class="col-md-3">
                        <label for="cidade" class="form-label fw-bold">Cidade <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" name="cidade" id="cidade" required>
                    </div>

                    <div class="col-md-1">
                        <label for="uf" class="form-label fw-bold">UF <span class="text-danger">*</span></label>
                        <input type="text" class="form-control text-uppercase" name="uf" id="uf" maxlength="2" value="SP" required>
                    </div>

                    <div class="col-md-4">
                        <label for="telefone" class="form-label">Telefone Fixo</label>
                        <input type="text" class="form-control" name="telefone" id="telefone">
                    </div>

                    <div class="col-md-4">
                        <label for="celular" class="form-label fw-bold">Celular / WhatsApp <span class="text-danger">*</span></label>
                        <input type="text" class="form-control" name="celular" id="celular" required>
                    </div>

                    <div class="col-md-4">
                        <label for="email" class="form-label">E-mail Comercial (NF-e)</label>
                        <input type="email" class="form-control" name="email" id="email">
                    </div>

                    <div class="col-md-12">
                        <label for="observacao" class="form-label">Observações / Máquinas Instaladas (Laser, Plasma, Oxicorte)</label>
                        <textarea class="form-control" name="observacao" id="observacao" rows="3" placeholder="Ex: Possui Máquina Laser Fibra 3kW, horários de recebimento, etc."></textarea>
                    </div>

                    <div class="col-12 text-end pt-2">
                        <button type="reset" class="btn btn-secondary me-2">Limpar</button>
                        <button type="submit" class="btn btn-danger fw-bold">
                            <i class="fa-solid fa-floppy-disk me-1"></i> Salvar Cliente
                        </button>
                    </div>
                </div>
            </form>
        </div>
    </div>
</div>

<script>
// Função inteligente para consultar CPF ou CNPJ e buscar Inscrição Estadual (IE) na SEFAZ
async function consultarDocumento(input) {
    let doc = input.value.replace(/\D/g, '');
    let feedbackEl = document.getElementById('feedback_status');
    let spinner = document.getElementById('spinnerCnpj');
    let badge = document.getElementById('situacaoBadge');

    // Se for CPF (11 dígitos)
    if (doc.length === 11) {
        if (feedbackEl) {
            feedbackEl.className = "alert alert-warning py-2 mb-3";
            feedbackEl.innerHTML = "⚠️ CPF detectado. Preencha os dados manualmente.";
        }
        document.getElementById('indicador_ie').value = "9"; // 9 - Não Contribuinte
        document.getElementById('inscricao_estadual').value = "ISENTO";
        return;
    }

    // Se for CNPJ (14 dígitos)
    if (doc.length === 14) {
        if (spinner) spinner.style.display = 'inline-block';
        if (feedbackEl) {
            feedbackEl.className = "alert alert-info py-2 mb-3";
            feedbackEl.innerHTML = "⏳ Consultando dados na Receita Federal e SEFAZ...";
        }
        document.getElementById('nome').value = "Consultando dados na Receita Federal...";

        try {
            // 1. Consulta BrasilAPI (Receita Federal)
            let response = await fetch(\`https://brasilapi.com.br/api/cnpj/v1/\${doc}\`);
            
            if (response.ok) {
                let data = await response.json();
                
                // Preenchimento dos dados cadastrais
                document.getElementById('nome').value = data.razao_social || '';
                document.getElementById('nome_fantasia').value = data.nome_fantasia || '';
                document.getElementById('cep').value = data.cep || '';
                document.getElementById('logradouro').value = data.logradouro || '';
                document.getElementById('numero').value = data.numero || '';
                document.getElementById('complemento').value = data.complemento || '';
                document.getElementById('bairro').value = data.bairro || '';
                document.getElementById('cidade').value = data.municipio || '';
                let ufEncontrada = (data.uf || 'SP').toUpperCase();
                document.getElementById('uf').value = ufEncontrada;
                document.getElementById('telefone').value = data.ddd_telefone_1 || '';
                document.getElementById('email').value = data.email ? data.email.toLowerCase() : '';

                // Status da empresa (Ativa, Inapta, etc.)
                let statusDesc = data.descricao_situacao_cadastral || data.situacao_cadastral || 'ATIVA';
                if (badge) {
                    badge.textContent = "Situação: " + statusDesc;
                    badge.classList.remove('d-none');
                }

                // 2. Consulta complementar automática para buscar Inscrição Estadual (SEFAZ via CNPJ.ws)
                let ieEncontrada = '';

                // Verifica se porventura a BrasilAPI retornou Inscrições Estaduais
                if (data.inscricoes_estaduais && Array.isArray(data.inscricoes_estaduais) && data.inscricoes_estaduais.length > 0) {
                    let ieItem = data.inscricoes_estaduais.find(i => i.ativo) || data.inscricoes_estaduais[0];
                    if (ieItem && ieItem.inscricao_estadual) {
                        ieEncontrada = String(ieItem.inscricao_estadual).trim();
                    }
                }

                // Se não veio na BrasilAPI, consulta a API pública complementar da CNPJ.ws
                if (!ieEncontrada) {
                    try {
                        let resWs = await fetch(\`https://publica.cnpj.ws/cnpj/\${doc}\`);
                        if (resWs.ok) {
                            let dataWs = await resWs.json();
                            let listaIes = dataWs?.estabelecimento?.inscricoes_estaduais || dataWs?.inscricoes_estaduais || [];
                            if (Array.isArray(listaIes) && listaIes.length > 0) {
                                let ieItem = listaIes.find(item => {
                                    let itemUf = (item?.estado?.sigla || item?.estado || '').toUpperCase();
                                    return item?.ativo && (!ufEncontrada || itemUf === ufEncontrada);
                                }) || listaIes.find(item => item?.ativo) || listaIes[0];

                                if (ieItem && ieItem.inscricao_estadual) {
                                    ieEncontrada = String(ieItem.inscricao_estadual).trim();
                                }
                            }
                        }
                    } catch (errWs) {
                        console.warn("Consulta complementar SEFAZ/CNPJ.ws indisponível:", errWs);
                    }
                }

                // 3 & 4. Regras de preenchimento de Inscrição Estadual e Indicador IE
                if (ieEncontrada && ieEncontrada.toUpperCase() !== 'ISENTO') {
                    // Se a Inscrição Estadual for encontrada:
                    document.getElementById('inscricao_estadual').value = ieEncontrada;
                    document.getElementById('indicador_ie').value = "1"; // 1 - Contribuinte ICMS (Possui Inscrição Estadual)
                    if (feedbackEl) {
                        feedbackEl.className = "alert alert-success py-2 mb-3";
                        feedbackEl.innerHTML = \`✅ Dados carregados com sucesso! Razão Social: "<strong>\${data.razao_social}</strong>" | IE SEFAZ: <strong>\${ieEncontrada}</strong> (Contribuinte ICMS).\`;
                    }
                } else {
                    // Se a empresa não possuir IE ou for ISENTO:
                    document.getElementById('inscricao_estadual').value = "ISENTO";
                    document.getElementById('indicador_ie').value = "2"; // 2 - Contribuinte Isento de Inscrição Estadual
                    if (feedbackEl) {
                        feedbackEl.className = "alert alert-success py-2 mb-3";
                        feedbackEl.innerHTML = \`✅ Dados carregados com sucesso! Razão Social: "<strong>\${data.razao_social}</strong>" | IE: <strong>ISENTO</strong> (Contribuinte Isento).\`;
                    }
                }
            } else {
                if (feedbackEl) {
                    feedbackEl.className = "alert alert-danger py-2 mb-3";
                    feedbackEl.innerHTML = "❌ CNPJ não encontrado na base de dados.";
                }
                document.getElementById('nome').value = '';
            }
        } catch (error) {
            console.error("Erro na consulta do CNPJ:", error);
            if (feedbackEl) {
                feedbackEl.className = "alert alert-danger py-2 mb-3";
                feedbackEl.innerHTML = "❌ Erro ao consultar o CNPJ. Verifique sua conexão.";
            }
            document.getElementById('nome').value = '';
        } finally {
            if (spinner) spinner.style.display = 'none';
        }
    }
}

// Alias para compatibilidade
const consultarCNPJ = consultarDocumento;

function definirIsento() {
    document.getElementById('inscricao_estadual').value = "ISENTO";
    document.getElementById('indicador_ie').value = "2";
}

// Função para buscar endereço pelo CEP
async function consultarCEP(input) {
    let cep = input.value.replace(/\\D/g, '');
    if (cep.length !== 8) return;

    let spinner = document.getElementById('spinnerCep');
    if (spinner) spinner.style.display = 'inline-block';

    try {
        let response = await fetch(\`https://brasilapi.com.br/api/cep/v2/\${cep}\`);
        if (response.ok) {
            let data = await response.json();
            if (data.street) document.getElementById('logradouro').value = data.street;
            if (data.neighborhood) document.getElementById('bairro').value = data.neighborhood;
            if (data.city) document.getElementById('cidade').value = data.city;
            if (data.state) document.getElementById('estado').value = data.state;
            document.getElementById('numero').focus();
        }
    } catch (e) {
        console.warn('Erro ao consultar CEP:', e);
    } finally {
        if (spinner) spinner.style.display = 'none';
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
    <!-- Cabeçalho Superior Simplificado (Direto ao Ponto) -->
    <div class="card card-custom p-3 p-md-4 mb-4 shadow-sm border-0 bg-white">
        <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3">
            <!-- 1. Nome/Título Principal e Subtítulo Discreto (Lado Esquerdo) -->
            <div class="d-flex align-items-center gap-3">
                <div class="bg-dark text-warning p-2 rounded-3 d-flex align-items-center justify-content-center shadow-sm" style="width: 44px; height: 44px;">
                    <i class="fa-solid fa-fire-flame-curved fs-4"></i>
                </div>
                <div>
                    <h3 class="fw-black text-dark font-monospace mb-0 d-flex align-items-center gap-2">
                        <span>MF<span class="text-danger">x</span></span>
                        <span class="fw-bold text-uppercase fs-4">TECNOLOGIA INDUSTRIAL</span>
                    </h3>
                    <p class="text-secondary small mb-0 mt-1">Ordem de Serviço & Assistência Técnica</p>
                </div>
            </div>

            <!-- 2. Card Escuro Simplificado "TOTAL DA OS" (Lado Direito) -->
            <div class="bg-dark text-white px-4 py-3 rounded-3 shadow border-start border-4 border-warning" style="min-width: 220px;">
                <div class="text-uppercase small text-secondary fw-bold">
                    <i class="fa-solid fa-calculator text-warning me-1"></i> TOTAL DA OS
                </div>
                <div class="fs-3 fw-bold text-warning font-monospace mt-1 mb-0" id="badgeTotalGeral">
                    R$ 0,00
                </div>
            </div>
        </div>
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

        <!-- 3. TABELA DE CONSUMÍVEIS E MÃO DE OBRA TÉCNICA (LANÇAMENTO RÁPIDO & VERIFICAÇÃO) -->
        <div class="card card-custom mb-4 border-0 shadow-sm bg-white">
            <div class="card-header bg-dark text-white py-3 d-flex justify-content-between align-items-center">
                <div>
                    <h5 class="mb-0 fw-bold">
                        <i class="fa-solid fa-cart-shopping text-warning me-2"></i> 3. Tabela de Consumíveis e Mão de Obra Técnica
                    </h5>
                    <small class="text-secondary">Pressione ENTER em qualquer campo para confirmar e abrir uma nova linha automaticamente.</small>
                </div>
                <span class="badge bg-secondary font-monospace" id="badgeSubtotalItensTop">Subtotal: R$ 0,00</span>
            </div>

            <!-- LINHA DE LANÇAMENTO RÁPIDO CONTÍNUO (ENTER PARA CONFIRMAR E AVANÇAR) -->
            <div class="p-3 bg-light border-bottom">
                <div class="d-flex justify-content-between align-items-center mb-2">
                    <span class="fw-bold small text-dark">
                        <i class="fa-solid fa-keyboard text-danger me-1"></i> Lançamento Rápido de Linha (Pressione [ENTER] para confirmar e avançar)
                    </span>
                    <span class="text-muted small d-none d-md-inline">[TAB] navega entre campos • [ENTER] insere o item</span>
                </div>
                <div class="row g-2 align-items-end" id="linhaLancamentoRapido">
                    <div class="col-md-2">
                        <label class="form-label small fw-bold mb-1">Tipo Fiscal</label>
                        <select class="form-select form-select-sm" id="novo_tipo_fiscal" onkeydown="adicionarLinhaComEnter(event, this)">
                            <option value="produto">📦 NF-e (Peça)</option>
                            <option value="servico">🛠️ NFS-e (Srv)</option>
                        </select>
                    </div>
                    <div class="col-md-2">
                        <label class="form-label small fw-bold mb-1">Código</label>
                        <input type="text" class="form-control form-control-sm font-monospace fw-bold" id="novo_codigo" placeholder="Ex: MFX-LP30" list="listaSugestoesPhp" onkeydown="adicionarLinhaComEnter(event, this)">
                        <datalist id="listaSugestoesPhp">
                            <option value="MFX-LP30-15">Lente Proteção D30 Laser</option>
                            <option value="MFX-BD-15">Bico Laser Duplo 1.5mm</option>
                            <option value="MFX-BS-20">Bico Laser Simples 2.0mm</option>
                            <option value="MFX-AC-28">Anel Cerâmico D28mm</option>
                            <option value="MFX-CC-01">Cabo Sensor Capacitivo</option>
                            <option value="MFX-SRV-LASER-01">Alinhamento Óptico Laser</option>
                            <option value="MFX-SRV-REV-01">Revisão Preventiva CNC</option>
                        </datalist>
                    </div>
                    <div class="col-md-4">
                        <label class="form-label small fw-bold mb-1">Descrição do Consumível ou Serviço *</label>
                        <input type="text" class="form-control form-control-sm" id="novo_descricao" placeholder="Descrição do consumível ou serviço realizado..." onkeydown="adicionarLinhaComEnter(event, this)">
                    </div>
                    <div class="col-md-1">
                        <label class="form-label small fw-bold mb-1 text-center d-block">Unid.</label>
                        <select class="form-select form-select-sm text-center" id="novo_unidade" onkeydown="adicionarLinhaComEnter(event, this)">
                            <option value="UN">UN</option>
                            <option value="HR">HR</option>
                            <option value="PC">PC</option>
                            <option value="JG">JG</option>
                            <option value="CX">CX</option>
                            <option value="DIA">DIA</option>
                            <option value="MT">MT</option>
                        </select>
                    </div>
                    <div class="col-md-1">
                        <label class="form-label small fw-bold mb-1 text-center d-block">Qtd</label>
                        <input type="number" step="1" min="1" class="form-control form-control-sm text-center font-monospace fw-bold" id="novo_quantidade" value="1" onkeydown="adicionarLinhaComEnter(event, this)">
                    </div>
                    <div class="col-md-1">
                        <label class="form-label small fw-bold mb-1 text-end d-block">Valor (R$)</label>
                        <input type="number" step="0.01" min="0" class="form-control form-control-sm text-end font-monospace" id="novo_preco" placeholder="0,00" onkeydown="adicionarLinhaComEnter(event, this)">
                    </div>
                    <div class="col-md-1">
                        <button type="button" class="btn btn-dark btn-sm w-100 fw-bold" onclick="confirmarNovoItemPhp()" title="Pressione ENTER para adicionar">
                            <i class="fa-solid fa-plus"></i>
                        </button>
                    </div>
                </div>
            </div>

            <!-- TABELA DE VERIFICAÇÃO / RESUMO DOS ITENS LANÇADOS -->
            <div class="card-body p-0">
                <div class="table-responsive">
                    <table class="table table-bordered table-striped table-hover align-middle mb-0" id="tabelaItens">
                        <thead class="table-dark">
                            <tr>
                                <th style="width: 12%;">Tipo Fiscal</th>
                                <th style="width: 13%;">Código</th>
                                <th>Descrição</th>
                                <th style="width: 8%;" class="text-center">Unidade</th>
                                <th style="width: 8%;" class="text-center">Quantidade</th>
                                <th style="width: 12%;" class="text-end">Valor Unitário</th>
                                <th style="width: 14%;" class="text-end">Subtotal (R$)</th>
                                <th style="width: 6%;" class="text-center">Ação</th>
                            </tr>
                        </thead>
                        <tbody id="corpoItens">
                            <!-- Inicia completamente vazia; itens adicionados via ENTER ou botão -->
                        </tbody>
                        <tfoot class="table-light fw-bold" id="tfootItens" style="display: none;">
                            <tr>
                                <td colspan="4" class="text-muted small">
                                    Total de itens na lista: <strong id="qtdTotalItensLista" class="text-dark">0</strong>
                                </td>
                                <td colspan="2" class="text-end text-uppercase small">Subtotal de Consumíveis e Serviços:</td>
                                <td class="text-end text-danger font-monospace fs-6" id="subtotalItensTfoot">R$ 0,00</td>
                                <td></td>
                            </tr>
                        </tfoot>
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

function formatMoeda(val) {
    return 'R$ ' + (Number(val) || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Catálogo rápido de sugestões para autofill ao digitar o código
const CATALOGO_PHP = {
    'MFX-LP30-15': { desc: 'Lente de Proteção Laser Fibra D30 x 1.5mm', preco: 120.00, un: 'UN', tipo: 'produto' },
    'MFX-BD-15': { desc: 'Bico Laser Duplo Cromado D32 H15 Calibre 1.5mm', preco: 85.00, un: 'UN', tipo: 'produto' },
    'MFX-BS-20': { desc: 'Bico Laser Simples Cromado D32 H15 Calibre 2.0mm', preco: 85.00, un: 'UN', tipo: 'produto' },
    'MFX-AC-28': { desc: 'Anel Cerâmico para Cabeçote Raytools D28mm', preco: 220.00, un: 'UN', tipo: 'produto' },
    'MFX-CC-01': { desc: 'Cabo Sensor Capacitivo SMA x BNC BCS100', preco: 340.00, un: 'UN', tipo: 'produto' },
    'MFX-SRV-LASER-01': { desc: 'Alinhamento Óptico do Feixe Laser Fibra', preco: 650.00, un: 'HR', tipo: 'servico' },
    'MFX-SRV-REV-01': { desc: 'Revisão Preventiva Mecânica e Pneumática CNC', preco: 800.00, un: 'HR', tipo: 'servico' }
};

document.getElementById('novo_codigo')?.addEventListener('input', function(e) {
    let cod = e.target.value.trim().toUpperCase();
    if (CATALOGO_PHP[cod]) {
        let item = CATALOGO_PHP[cod];
        document.getElementById('novo_descricao').value = item.desc;
        document.getElementById('novo_preco').value = item.preco.toFixed(2);
        document.getElementById('novo_unidade').value = item.un;
        document.getElementById('novo_tipo_fiscal').value = item.tipo;
    }
});

document.getElementById('novo_tipo_fiscal')?.addEventListener('change', function(e) {
    if (e.target.value === 'servico') {
        document.getElementById('novo_unidade').value = 'HR';
    } else {
        document.getElementById('novo_unidade').value = 'UN';
    }
});

// Confirmar e adicionar linha na tabela de verificação
function confirmarNovoItemPhp() {
    let codigoEl = document.getElementById('novo_codigo');
    let descEl = document.getElementById('novo_descricao');
    let precoEl = document.getElementById('novo_preco');
    let qtdEl = document.getElementById('novo_quantidade');
    let unidEl = document.getElementById('novo_unidade');
    let tipoEl = document.getElementById('novo_tipo_fiscal');

    let desc = descEl.value.trim() || codigoEl.value.trim();
    if (!desc) {
        codigoEl.focus();
        return;
    }

    let codigo = (codigoEl.value.trim() || (tipoEl.value === 'servico' ? 'MFX-SRV' : 'MFX-ITEM')).toUpperCase();
    let preco = parseFloat(precoEl.value) || 0;
    let qtd = parseFloat(qtdEl.value) || 1;
    let subtotal = preco * qtd;
    let unidade = unidEl.value;
    let tipo = tipoEl.value;
    let isSrv = (tipo === 'servico');

    contadorItens++;
    const corpo = document.getElementById('corpoItens');

    const tr = document.createElement('tr');
    tr.id = 'linha_item_' + contadorItens;
    tr.innerHTML = \`
        <td>
            <span class="badge \${isSrv ? 'bg-purple-subtle text-purple border border-purple-subtle' : 'bg-warning-subtle text-dark border border-warning-subtle'}">
                \${isSrv ? '🛠️ NFS-e Srv' : '📦 NF-e Peça'}
            </span>
            <input type="hidden" name="item_categoria[]" value="\${isSrv ? 'Serviços Laser' : 'Consumíveis'}">
        </td>
        <td class="font-monospace fw-bold text-dark">
            \${codigo}
            <input type="hidden" name="item_codigo[]" value="\${codigo}">
        </td>
        <td>
            \${desc}
            <input type="hidden" name="item_descricao[]" value="\${desc}">
        </td>
        <td class="text-center font-monospace">
            \${unidade}
            <input type="hidden" name="item_unidade[]" value="\${unidade}">
        </td>
        <td class="text-center font-monospace fw-bold">
            \${qtd}
            <input type="hidden" name="item_quantidade[]" value="\${qtd}">
        </td>
        <td class="text-end font-monospace">
            \${formatMoeda(preco)}
            <input type="hidden" name="item_preco[]" value="\${preco}">
        </td>
        <td class="text-end font-monospace fw-bold text-dark">
            \${formatMoeda(subtotal)}
        </td>
        <td class="text-center">
            <button type="button" class="btn btn-outline-danger btn-sm py-0 px-2" onclick="removerItemLinha(this)" title="Remover item">
                <i class="fa-solid fa-trash"></i>
            </button>
        </td>
    \`;
    corpo.appendChild(tr);

    // Reseta campos da linha rápida
    if (codigoEl) codigoEl.value = '';
    if (descEl) descEl.value = '';
    if (precoEl) precoEl.value = '';
    if (qtdEl) qtdEl.value = '1';

    // Foco automático de volta no campo CÓDIGO/BUSCA da nova linha
    setTimeout(() => {
        if (codigoEl) {
            codigoEl.focus();
            codigoEl.select?.();
        }
    }, 10);

    recalcularTotaisOS();
}

function removerItemLinha(btn) {
    btn.closest('tr').remove();
    recalcularTotaisOS();
}

// 1. INTERCEPTAR A TECLA ENTER & 2. FLUXO DE DIGITAÇÃO CONTÍNUA COM TECLADO
function adicionarLinhaComEnter(event, elemento) {
    if (event.key === 'Enter' || event.keyCode === 13) {
        // a) Execute e.preventDefault() IMEDIATAMENTE para impedir que o formulário da OS seja enviado/salvo antes da hora
        event.preventDefault();
        event.stopPropagation();

        const id = elemento ? elemento.id : '';

        // c) Se o campo atual for o CÓDIGO (ou Descrição): mova o foco direto para o campo QUANTIDADE
        if (id === 'novo_codigo' || id === 'novo_descricao') {
            const qtdInput = document.getElementById('novo_quantidade');
            if (qtdInput) {
                qtdInput.focus();
                qtdInput.select();
            }
            return false;
        }

        // b) Se o campo atual for a QUANTIDADE ou o VALOR (ou Unidade/Tipo):
        // Confirma o item atual, adiciona uma nova linha em branco na tabela e mova o foco automático para o CÓDIGO/BUSCA da nova linha
        if (id === 'novo_quantidade' || id === 'novo_preco' || id === 'novo_unidade' || id === 'novo_tipo_fiscal') {
            confirmarNovoItemPhp();
            return false;
        }

        confirmarNovoItemPhp();
        return false;
    }
}

// Ouvinte de keydown nos inputs da linha rápida de itens
const inputsLinhaRapida = ['novo_codigo', 'novo_descricao', 'novo_quantidade', 'novo_preco', 'novo_unidade', 'novo_tipo_fiscal'];
inputsLinhaRapida.forEach(id => {
    document.getElementById(id)?.addEventListener('keydown', function(e) {
        adicionarLinhaComEnter(e, this);
    });
});

// Impede envio indesejado do formulário principal ao pressionar ENTER em campos normais
document.getElementById('formNovaOS')?.addEventListener('keydown', function(e) {
    if ((e.key === 'Enter' || e.keyCode === 13) && e.target.tagName !== 'TEXTAREA') {
        const id = e.target.id;
        if (inputsLinhaRapida.includes(id)) {
            // já tratado por adicionarLinhaComEnter
        } else {
            e.preventDefault();
        }
    }
});

function recalcularTotaisOS() {
    let km = parseFloat(document.getElementById('km_rodados')?.value || 0) || 0;
    let vlrKm = parseFloat(document.getElementById('valor_unitario_km')?.value || 0) || 0;
    let horas = parseFloat(document.getElementById('horas_trabalhadas')?.value || 0) || 0;
    let vlrHora = parseFloat(document.getElementById('valor_hora_tecnica')?.value || 0) || 0;
    let alim = parseFloat(document.getElementById('despesa_alimentacao')?.value || 0) || 0;
    let estadia = parseFloat(document.getElementById('despesa_estadia')?.value || 0) || 0;
    let outras = parseFloat(document.getElementById('outras_despesas')?.value || 0) || 0;

    let totalOperacional = (km * vlrKm) + (horas * vlrHora) + alim + estadia + outras;
    let totalNfse = 0;
    let totalNfe = 0;
    let countItens = 0;

    document.querySelectorAll('#corpoItens tr').forEach(row => {
        let cat = row.querySelector('input[name="item_categoria[]"]')?.value || '';
        let preco = parseFloat(row.querySelector('input[name="item_preco[]"]')?.value || 0) || 0;
        let qtd = parseFloat(row.querySelector('input[name="item_quantidade[]"]')?.value || 0) || 0;
        let sub = preco * qtd;
        countItens++;

        if (cat.startsWith('Serviço') || cat === 'Mão de Obra') {
            totalNfse += sub;
        } else {
            totalNfe += sub;
        }
    });

    let totalItens = totalNfse + totalNfe;
    let totalGeral = totalOperacional + totalItens;

    // Atualiza Total Geral no topo
    let elTotal = document.getElementById('badgeTotalGeral');
    if (elTotal) elTotal.textContent = formatMoeda(totalGeral);

    // Atualiza Subtotais no card de itens
    let elSubtop = document.getElementById('badgeSubtotalItensTop');
    if (elSubtop) elSubtop.textContent = 'Subtotal: ' + formatMoeda(totalItens);

    let elTfoot = document.getElementById('tfootItens');
    if (elTfoot) {
        elTfoot.style.display = countItens > 0 ? '' : 'none';
    }
    let elQtd = document.getElementById('qtdTotalItensLista');
    if (elQtd) elQtd.textContent = countItens;

    let elSubtFoot = document.getElementById('subtotalItensTfoot');
    if (elSubtFoot) elSubtFoot.textContent = formatMoeda(totalItens);
}

document.addEventListener('input', (e) => {
    if (e.target.matches('.calc-trigger')) {
        recalcularTotaisOS();
    }
});

// 3. TABELA LIMPA: Tabela inicia vazia e o foco vai direto para o campo de Código/Busca da linha rápida
window.addEventListener('DOMContentLoaded', () => {
    const codInput = document.getElementById('novo_codigo');
    if (codInput) {
        codInput.focus();
    }
    recalcularTotaisOS();
});
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
    filename: 'estoque.php',
    description: 'Gestão Completa de Estoque e Catálogo de Serviços com diferenciação nativa entre Produtos (NF-e Mod. 55) e Mão de Obra (NFS-e Municipal / LC 116), campos fiscais dinâmicos e auto-cálculos.',
    language: 'php',
    content: `<?php
/**
 * MFx Tecnologia Industrial - Sistema de Gestão Empresarial (ERP)
 * Arquivo: estoque.php - Gestão de Estoque, Consumíveis e Mão de Obra (NF-e / NFS-e)
 */
require_once 'conexao.php';

$mensagem = '';
$tipo_alerta = '';

// 1. Processamento de Inclusão e Edição via POST
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['acao'])) {
    $acao = $_POST['acao'];
    
    $tipo            = trim($_POST['tipo'] ?? 'produto');
    $codigo          = strtoupper(trim($_POST['codigo'] ?? ''));
    $descricao       = trim($_POST['descricao'] ?? '');
    $categoria       = trim($_POST['categoria'] ?? 'Consumíveis');
    $unidade_medida  = strtoupper(trim($_POST['unidade_medida'] ?? 'UN'));
    $preco_venda     = (float)str_replace(',', '.', $_POST['preco_venda'] ?? '0');
    $estoque_atual   = $tipo === 'produto' ? (int)($_POST['estoque_atual'] ?? 0) : 0;
    $estoque_minimo  = $tipo === 'produto' ? (int)($_POST['estoque_minimo'] ?? 0) : 0;

    // Campos Fiscais NFS-e (Mão de Obra / Serviços)
    $codigo_servico_lc116        = $tipo === 'servico' ? trim($_POST['codigo_servico_lc116'] ?? '14.01') : null;
    $descricao_lc116             = $tipo === 'servico' ? trim($_POST['descricao_lc116'] ?? '') : null;
    $codigo_tributacao_municipal = $tipo === 'servico' ? trim($_POST['codigo_tributacao_municipal'] ?? '') : null;
    $item_lc116                  = $tipo === 'servico' ? trim($_POST['item_lc116'] ?? '14.01') : null;
    $aliquota_iss                = $tipo === 'servico' ? (float)str_replace(',', '.', $_POST['aliquota_iss'] ?? '3.00') : null;
    $exigibilidade_iss           = $tipo === 'servico' ? trim($_POST['exigibilidade_iss'] ?? '1') : null;
    $retencao_iss                = $tipo === 'servico' && isset($_POST['retencao_iss']) && $_POST['retencao_iss'] == '1' ? 1 : 0;
    $cfop_servico                = $tipo === 'servico' ? trim($_POST['cfop_servico'] ?? '5933') : null;

    // Campos Fiscais NF-e Mod. 55 (Produtos / Consumíveis)
    $ncm                         = $tipo === 'produto' ? trim($_POST['ncm'] ?? '8466.93.30') : null;
    $cst_csosn                   = $tipo === 'produto' ? trim($_POST['cst_csosn'] ?? '0102') : null;
    $cfop_produto                = $tipo === 'produto' ? trim($_POST['cfop_produto'] ?? '5102') : null;
    $origem                      = $tipo === 'produto' ? trim($_POST['origem'] ?? '0') : null;
    $observacoes_fiscais         = trim($_POST['observacoes_fiscais'] ?? '');

    if (empty($codigo) || empty($descricao)) {
        $mensagem = "Preencha ao menos o Código e a Descrição do item.";
        $tipo_alerta = "danger";
    } else {
        try {
            if ($acao === 'salvar_item') {
                $sql = "INSERT INTO produtos_servicos 
                        (tipo, codigo, descricao, categoria, unidade_medida, preco_venda, estoque_atual, estoque_minimo,
                         codigo_servico_lc116, descricao_lc116, codigo_tributacao_municipal, item_lc116, aliquota_iss, exigibilidade_iss, retencao_iss, cfop_servico,
                         ncm, cst_csosn, cfop_produto, origem, observacoes_fiscais)
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([
                    $tipo, $codigo, $descricao, $categoria, $unidade_medida, $preco_venda, $estoque_atual, $estoque_minimo,
                    $codigo_servico_lc116, $descricao_lc116, $codigo_tributacao_municipal, $item_lc116, $aliquota_iss, $exigibilidade_iss, $retencao_iss, $cfop_servico,
                    $ncm, $cst_csosn, $cfop_produto, $origem, $observacoes_fiscais
                ]);
                $mensagem = "Item/Serviço cadastrado com sucesso no catálogo oficial da MFx!";
                $tipo_alerta = "success";
            } elseif ($acao === 'editar_item') {
                $id = (int)($_POST['id'] ?? 0);
                $sql = "UPDATE produtos_servicos SET 
                        tipo = ?, codigo = ?, descricao = ?, categoria = ?, unidade_medida = ?, preco_venda = ?, estoque_atual = ?, estoque_minimo = ?,
                        codigo_servico_lc116 = ?, descricao_lc116 = ?, codigo_tributacao_municipal = ?, item_lc116 = ?, aliquota_iss = ?, exigibilidade_iss = ?, retencao_iss = ?, cfop_servico = ?,
                        ncm = ?, cst_csosn = ?, cfop_produto = ?, origem = ?, observacoes_fiscais = ?
                        WHERE id = ?";
                $stmt = $pdo->prepare($sql);
                $stmt->execute([
                    $tipo, $codigo, $descricao, $categoria, $unidade_medida, $preco_venda, $estoque_atual, $estoque_minimo,
                    $codigo_servico_lc116, $descricao_lc116, $codigo_tributacao_municipal, $item_lc116, $aliquota_iss, $exigibilidade_iss, $retencao_iss, $cfop_servico,
                    $ncm, $cst_csosn, $cfop_produto, $origem, $observacoes_fiscais,
                    $id
                ]);
                $mensagem = "Item/Serviço atualizado com sucesso!";
                $tipo_alerta = "success";
            }
        } catch (PDOException $e) {
            $mensagem = "Erro no banco de dados: " . $e->getMessage();
            $tipo_alerta = "danger";
        }
    }
}

// 2. Processamento de Exclusão via GET
if (isset($_GET['acao']) && $_GET['acao'] === 'excluir' && isset($_GET['id'])) {
    $idExcluir = (int)$_GET['id'];
    try {
        $stmtDel = $pdo->prepare("DELETE FROM produtos_servicos WHERE id = ?");
        $stmtDel->execute([$idExcluir]);
        $mensagem = "Registro removido do catálogo com sucesso.";
        $tipo_alerta = "warning";
    } catch (PDOException $e) {
        $mensagem = "Erro ao excluir: " . $e->getMessage();
        $tipo_alerta = "danger";
    }
}

// 3. Consultas de Métricas
$totalProdutos = (int)$pdo->query("SELECT COUNT(*) FROM produtos_servicos WHERE tipo = 'produto'")->fetchColumn();
$totalServicos = (int)$pdo->query("SELECT COUNT(*) FROM produtos_servicos WHERE tipo = 'servico'")->fetchColumn();
$saldoFisico   = (int)$pdo->query("SELECT COALESCE(SUM(estoque_atual), 0) FROM produtos_servicos WHERE tipo = 'produto'")->fetchColumn();
$valorEstoque  = (float)$pdo->query("SELECT COALESCE(SUM(estoque_atual * preco_venda), 0) FROM produtos_servicos WHERE tipo = 'produto'")->fetchColumn();

// 4. Filtros e Busca da Tabela
$filtro_tipo = $_GET['tipo'] ?? 'todos';
$filtro_cat  = $_GET['categoria'] ?? 'todas';
$busca       = trim($_GET['busca'] ?? '');

$sql = "SELECT * FROM produtos_servicos WHERE 1=1";
$params = [];

if ($filtro_tipo === 'produto' || $filtro_tipo === 'servico') {
    $sql .= " AND tipo = ?";
    $params[] = $filtro_tipo;
}

if ($filtro_cat !== 'todas' && !empty($filtro_cat)) {
    $sql .= " AND categoria = ?";
    $params[] = $filtro_cat;
}

if (!empty($busca)) {
    $sql .= " AND (codigo LIKE ? OR descricao LIKE ? OR ncm LIKE ? OR codigo_servico_lc116 LIKE ?)";
    $params[] = "%$busca%";
    $params[] = "%$busca%";
    $params[] = "%$busca%";
    $params[] = "%$busca%";
}

$sql .= " ORDER BY id DESC";
$stmt = $pdo->prepare($sql);
$stmt->execute($params);
$itens = $stmt->fetchAll();
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MFx Tecnologia - Catálogo de Estoque & Mão de Obra</title>
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- FontAwesome 6 Free -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
    <style>
        :root {
            --mfx-dark: #0f172a;
            --mfx-red: #dc2626;
            --mfx-orange: #ea580c;
        }
        body { background-color: #f1f5f9; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; }
        .navbar-mfx { background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%); border-bottom: 3px solid var(--mfx-orange); }
        .card-custom { border: none; border-radius: 12px; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.06); }
        .badge-nfe { background-color: #fef3c7; color: #92400e; border: 1px solid #fde68a; font-weight: bold; }
        .badge-nfse { background-color: #f3e8ff; color: #6b21a8; border: 1px solid #e9d5ff; font-weight: bold; }
        .campo-destaque { background-color: #f8fafc; border: 1px solid #cbd5e1; }
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
            <a class="nav-link active" href="estoque.php"><i class="fa-solid fa-boxes-stacked"></i> Estoque & Serviços</a>
            <a class="nav-link" href="nova_os.php"><i class="fa-solid fa-plus-circle"></i> Nova OS</a>
            <a class="nav-link" href="listar_os.php"><i class="fa-solid fa-file-lines"></i> Ordens de Serviço</a>
        </div>
    </div>
</nav>

<div class="container-fluid px-4 my-4">
    
    <!-- Topo: Título e Botões de Ação -->
    <div class="d-flex flex-column flex-md-row justify-content-between align-items-md-center gap-3 mb-4">
        <div>
            <div class="d-flex align-items-center gap-2 mb-1">
                <span class="badge bg-warning text-dark font-monospace text-uppercase">Módulo de Estoque e Serviços</span>
                <span class="text-muted small">MFx Tecnologia Industrial</span>
            </div>
            <h3 class="fw-bold text-dark mb-0">
                <i class="fa-solid fa-boxes-stacked text-warning"></i> Catálogo de Produtos, Consumíveis & Mão de Obra
            </h3>
            <p class="text-muted small mb-0">Diferenciação automática entre NF-e Mod. 55 (Produtos) e NFS-e Municipal (Serviços e Mão de Obra).</p>
        </div>
        <div class="d-flex gap-2">
            <button class="btn btn-outline-purple fw-bold btn-sm shadow-sm" style="color: #6b21a8; border-color: #6b21a8;" onclick="abrirModal('servico')">
                <i class="fa-solid fa-wrench me-1"></i> + Mão de Obra (NFS-e)
            </button>
            <button class="btn btn-warning fw-bold btn-sm shadow-sm" onclick="abrirModal('produto')">
                <i class="fa-solid fa-box-open me-1"></i> + Produto / Peça (NF-e)
            </button>
            <a href="nova_os.php" class="btn btn-danger fw-bold btn-sm shadow-sm">
                <i class="fa-solid fa-file-circle-plus me-1"></i> Abrir Nova OS
            </a>
        </div>
    </div>

    <?php if (!empty($mensagem)): ?>
        <div class="alert alert-<?= $tipo_alerta; ?> alert-dismissible fade show" role="alert">
            <i class="fa-solid <?= $tipo_alerta === 'success' ? 'fa-circle-check' : 'fa-triangle-exclamation'; ?> me-2"></i>
            <?= htmlspecialchars($mensagem); ?>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    <?php endif; ?>

    <!-- Métricas do Catálogo -->
    <div class="row g-3 mb-4">
        <div class="col-md-3">
            <div class="card card-custom p-3 bg-white border-start border-warning border-4">
                <span class="text-muted small text-uppercase fw-bold">Produtos & Consumíveis (NF-e)</span>
                <h4 class="fw-bold text-warning mb-0 mt-1"><?= $totalProdutos; ?> <small class="text-muted fs-6">(<?= $saldoFisico; ?> un)</small></h4>
                <span class="text-muted" style="font-size: 11px;">Enquadramento NCM / CSOSN 0102</span>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card card-custom p-3 bg-white border-start border-primary border-4" style="border-left-color: #6b21a8 !important;">
                <span class="text-muted small text-uppercase fw-bold">Mão de Obra & Serviços (NFS-e)</span>
                <h4 class="fw-bold mb-0 mt-1" style="color: #6b21a8;"><?= $totalServicos; ?> <small class="text-muted fs-6">especialidades</small></h4>
                <span class="text-muted" style="font-size: 11px;">LC 116 (14.01) / ISS Municipal</span>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card card-custom p-3 bg-white border-start border-success border-4">
                <span class="text-muted small text-uppercase fw-bold">Valor em Estoque</span>
                <h4 class="fw-bold text-success mb-0 mt-1">R$ <?= number_format($valorEstoque, 2, ',', '.'); ?></h4>
                <span class="text-muted" style="font-size: 11px;">Consumíveis a pronta entrega</span>
            </div>
        </div>
        <div class="col-md-3">
            <div class="card card-custom p-3 text-white" style="background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);">
                <span class="small text-uppercase fw-bold text-warning">Regras Fiscais MFx</span>
                <div class="small mt-1 text-light">
                    • NFS-e: LC 116 / ISS Agudos 3%<br>
                    • NF-e: NCM Peças / CSOSN 0102
                </div>
            </div>
        </div>
    </div>

    <!-- Tabela e Filtros -->
    <div class="card card-custom">
        <div class="card-header bg-white py-3 border-bottom d-flex flex-wrap justify-content-between align-items-center gap-2">
            
            <!-- Segmented Control Filtro Tipo -->
            <div class="btn-group btn-group-sm" role="group">
                <a href="estoque.php?tipo=todos" class="btn btn-outline-secondary <?= $filtro_tipo === 'todos' ? 'active' : ''; ?>">Todos (<?= $totalProdutos + $totalServicos; ?>)</a>
                <a href="estoque.php?tipo=produto" class="btn btn-outline-warning <?= $filtro_tipo === 'produto' ? 'active' : ''; ?>">Produtos NF-e (<?= $totalProdutos; ?>)</a>
                <a href="estoque.php?tipo=servico" class="btn btn-outline-purple <?= $filtro_tipo === 'servico' ? 'active' : ''; ?>" style="color: #6b21a8; border-color: #6b21a8;">Mão de Obra NFS-e (<?= $totalServicos; ?>)</a>
            </div>

            <!-- Busca -->
            <form method="GET" action="estoque.php" class="d-flex gap-2">
                <input type="hidden" name="tipo" value="<?= htmlspecialchars($filtro_tipo); ?>">
                <input type="text" name="busca" class="form-control form-control-sm" placeholder="Buscar código, descrição, NCM ou LC 116..." value="<?= htmlspecialchars($busca); ?>">
                <button type="submit" class="btn btn-sm btn-dark"><i class="fa-solid fa-search"></i></button>
            </form>
        </div>

        <div class="table-responsive">
            <table class="table table-hover align-middle mb-0">
                <thead class="table-dark">
                    <tr>
                        <th style="width: 12%;">Tipo Fiscal</th>
                        <th style="width: 12%;">Código</th>
                        <th style="width: 30%;">Descrição do Item / Prestação de Serviço</th>
                        <th style="width: 14%;">Categoria</th>
                        <th style="width: 6%;" class="text-center">Unid.</th>
                        <th style="width: 16%;">Enquadramento Fiscal</th>
                        <th style="width: 8%;" class="text-center">Saldo</th>
                        <th style="width: 10%;" class="text-end">Preço Venda</th>
                        <th style="width: 6%;" class="text-center">Ações</th>
                    </tr>
                </thead>
                <tbody>
                    <?php if (empty($itens)): ?>
                        <tr><td colspan="9" class="text-center py-5 text-muted">Nenhum produto ou serviço encontrado.</td></tr>
                    <?php else: ?>
                        <?php foreach ($itens as $it): 
                            $isSrv = $it['tipo'] === 'servico';
                        ?>
                            <tr>
                                <td>
                                    <?php if ($isSrv): ?>
                                        <span class="badge badge-nfse"><i class="fa-solid fa-wrench"></i> NFS-e Srv</span>
                                    <?php else: ?>
                                        <span class="badge badge-nfe"><i class="fa-solid fa-box"></i> NF-e Peça</span>
                                    <?php endif; ?>
                                </td>
                                <td class="font-monospace fw-bold text-dark"><?= htmlspecialchars($it['codigo']); ?></td>
                                <td>
                                    <div class="fw-semibold text-dark"><?= htmlspecialchars($it['descricao']); ?></div>
                                    <?php if (!empty($it['observacoes_fiscais'])): ?>
                                        <small class="text-muted fst-italic"><?= htmlspecialchars($it['observacoes_fiscais']); ?></small>
                                    <?php endif; ?>
                                </td>
                                <td><span class="badge bg-light text-dark border"><?= htmlspecialchars($it['categoria']); ?></span></td>
                                <td class="text-center font-monospace fw-bold"><?= htmlspecialchars($it['unidade_medida']); ?></td>
                                <td>
                                    <?php if ($isSrv): ?>
                                        <span class="font-monospace text-purple fw-bold" style="color: #6b21a8;">LC 116: <?= htmlspecialchars($it['codigo_servico_lc116'] ?: '14.01'); ?></span>
                                        <span class="badge bg-purple-subtle text-purple border" style="font-size: 10px;">ISS <?= number_format($it['aliquota_iss'] ?: 3, 1, ',', '.'); ?>%</span><br>
                                        <small class="text-muted">CFOP: <?= htmlspecialchars($it['cfop_servico'] ?: '5933'); ?></small>
                                    <?php else: ?>
                                        <span class="font-monospace text-dark fw-bold">NCM: <?= htmlspecialchars($it['ncm'] ?: '8466.93.30'); ?></span>
                                        <span class="badge bg-warning-subtle text-dark border" style="font-size: 10px;">CSOSN <?= htmlspecialchars($it['cst_csosn'] ?: '0102'); ?></span><br>
                                        <small class="text-muted">CFOP: <?= htmlspecialchars($it['cfop_produto'] ?: '5102'); ?></small>
                                    <?php endif; ?>
                                </td>
                                <td class="text-center font-monospace">
                                    <?php if ($isSrv): ?>
                                        <span class="text-muted fst-italic small">Mão de Obra</span>
                                    <?php else: ?>
                                        <strong><?= $it['estoque_atual']; ?></strong>
                                    <?php endif; ?>
                                </td>
                                <td class="text-end font-monospace fw-bold text-dark">R$ <?= number_format($it['preco_venda'], 2, ',', '.'); ?></td>
                                <td class="text-center">
                                    <button class="btn btn-sm btn-outline-secondary py-0 px-2" onclick='editarItem(<?= json_encode($it); ?>)' title="Editar"><i class="fa-solid fa-pen"></i></button>
                                    <a href="estoque.php?acao=excluir&id=<?= $it['id']; ?>" class="btn btn-sm btn-outline-danger py-0 px-2" onclick="return confirm('Deseja excluir este item?');" title="Excluir"><i class="fa-solid fa-trash"></i></a>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    <?php endif; ?>
                </tbody>
            </table>
        </div>
    </div>
</div>

<!-- Modal de Cadastro / Edição Dinâmico -->
<div class="modal fade" id="modalItem" tabindex="-1" aria-hidden="true">
    <div class="modal-dialog modal-lg">
        <div class="modal-content">
            <form method="POST" action="estoque.php" id="formItem">
                <input type="hidden" name="acao" id="formAcao" value="salvar_item">
                <input type="hidden" name="id" id="itemId" value="">

                <div class="modal-header bg-dark text-white">
                    <h5 class="modal-title" id="modalTitulo"><i class="fa-solid fa-boxes-stacked me-2"></i> Cadastro de Item / Serviço</h5>
                    <button type="button" class="btn-close btn-close-white" data-bs-dismiss="modal"></button>
                </div>

                <div class="modal-body p-4">
                    
                    <!-- 1. Diferenciação Dinâmica Entre Produto e Serviço -->
                    <div class="card p-3 mb-3 bg-light border">
                        <label class="form-label fw-bold text-uppercase small">1. Tipo de Item *</label>
                        <div class="row g-2">
                            <div class="col-6">
                                <div class="form-check p-3 bg-white border rounded">
                                    <input class="form-check-input" type="radio" name="tipo" id="tipoProduto" value="produto" checked onchange="toggleTipoItem()">
                                    <label class="form-check-label fw-bold text-dark" for="tipoProduto">
                                        <i class="fa-solid fa-box text-warning me-1"></i> Produto / Consumível
                                    </label>
                                    <div class="small text-muted">Lentes, bicos, cabos, eletrodos (NF-e Mod. 55)</div>
                                </div>
                            </div>
                            <div class="col-6">
                                <div class="form-check p-3 bg-white border rounded">
                                    <input class="form-check-input" type="radio" name="tipo" id="tipoServico" value="servico" onchange="toggleTipoItem()">
                                    <label class="form-check-label fw-bold" for="tipoServico" style="color: #6b21a8;">
                                        <i class="fa-solid fa-wrench me-1"></i> Serviço / Mão de Obra
                                    </label>
                                    <div class="small text-muted">Manutenções, alinhamentos, horas técnicas (NFS-e)</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- 2. Dados Gerais -->
                    <div class="row g-3 mb-3">
                        <div class="col-md-4">
                            <label class="form-label fw-bold small">Código do Item *</label>
                            <input type="text" class="form-control font-monospace text-uppercase" name="codigo" id="codigo" required placeholder="Ex: MFX-LP30-15">
                        </div>
                        <div class="col-md-8">
                            <label class="form-label fw-bold small">Descrição Completa *</label>
                            <input type="text" class="form-control" name="descricao" id="descricao" required placeholder="Ex: Lente de Proteção Laser D30 Quartzo">
                        </div>
                        <div class="col-md-4">
                            <label class="form-label fw-bold small">Categoria</label>
                            <select class="form-select" name="categoria" id="categoria">
                                <option value="Consumíveis">Consumíveis</option>
                                <option value="Mão de Obra">Mão de Obra</option>
                                <option value="Serviços Laser">Serviços Laser</option>
                                <option value="Serviços Oxicorte">Serviços Oxicorte</option>
                                <option value="Serviços Plasma">Serviços Plasma</option>
                                <option value="Peças & Acessórios">Peças & Acessórios</option>
                            </select>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label fw-bold small">Unidade de Medida *</label>
                            <select class="form-select font-monospace fw-bold" name="unidade_medida" id="unidade_medida">
                                <option value="UN">UN - Unidade</option>
                                <option value="PC">PC - Peça</option>
                                <option value="HR">HR - Hora Técnica</option>
                                <option value="DIA">DIA - Diária Técnica</option>
                                <option value="JG">JG - Jogo/Kit</option>
                            </select>
                        </div>
                        <div class="col-md-4">
                            <label class="form-label fw-bold small">Preço de Venda (R$) *</label>
                            <input type="number" step="0.01" class="form-control font-monospace fw-bold" name="preco_venda" id="preco_venda" required placeholder="0.00">
                        </div>

                        <!-- Saldo de Estoque (Apenas Produto) -->
                        <div class="col-md-6 campo-produto">
                            <label class="form-label small">Saldo Físico em Estoque</label>
                            <input type="number" class="form-control font-monospace" name="estoque_atual" id="estoque_atual" value="10">
                        </div>
                        <div class="col-md-6 campo-produto">
                            <label class="form-label small">Estoque Mínimo de Alerta</label>
                            <input type="number" class="form-control font-monospace" name="estoque_minimo" id="estoque_minimo" value="5">
                        </div>
                    </div>

                    <!-- 3. CAMPOS FISCAIS NFS-e (MÃO DE OBRA) -->
                    <div id="secaoNfse" class="card p-3 mb-3 border-purple d-none" style="background-color: #faf5ff; border-color: #d8b4fe;">
                        <h6 class="fw-bold text-uppercase" style="color: #6b21a8;"><i class="fa-solid fa-wrench me-1"></i> Parâmetros Fiscais de Serviços (NFS-e Municipal / LC 116)</h6>
                        <div class="row g-2 small">
                            <div class="col-md-6">
                                <label class="form-label fw-bold">Código Serviço LC 116 *</label>
                                <input type="text" class="form-control font-monospace" name="codigo_servico_lc116" id="codigo_servico_lc116" value="14.01" placeholder="14.01">
                                <small class="text-muted">14.01 - Manutenção e conservação de máquinas</small>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label fw-bold">Código Tributação Municipal (CTISS)</label>
                                <input type="text" class="form-control font-monospace" name="codigo_tributacao_municipal" id="codigo_tributacao_municipal" value="1401-0/01-88">
                            </div>
                            <div class="col-md-4">
                                <label class="form-label fw-bold">Alíquota ISS (%) *</label>
                                <input type="number" step="0.01" class="form-control font-monospace" name="aliquota_iss" id="aliquota_iss" value="3.00">
                            </div>
                            <div class="col-md-4">
                                <label class="form-label fw-bold">Exigibilidade do ISS</label>
                                <select class="form-select" name="exigibilidade_iss" id="exigibilidade_iss">
                                    <option value="1">1 - Exigível</option>
                                    <option value="2">2 - Isento</option>
                                    <option value="3">3 - Imune</option>
                                    <option value="4">4 - Suspensa</option>
                                </select>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label fw-bold">CFOP para Serviços</label>
                                <input type="text" class="form-control font-monospace" name="cfop_servico" id="cfop_servico" value="5933">
                            </div>
                        </div>
                    </div>

                    <!-- 4. CAMPOS FISCAIS NF-e (PRODUTOS) -->
                    <div id="secaoNfe" class="card p-3 mb-3 border-warning bg-light">
                        <h6 class="fw-bold text-uppercase text-dark"><i class="fa-solid fa-box me-1"></i> Parâmetros Fiscais de Produtos (NF-e Mod. 55 / SEFAZ)</h6>
                        <div class="row g-2 small">
                            <div class="col-md-4">
                                <label class="form-label fw-bold">NCM (8 dígitos) *</label>
                                <input type="text" class="form-control font-monospace" name="ncm" id="ncm" value="8466.93.30" placeholder="Ex: 8466.93.30">
                            </div>
                            <div class="col-md-4">
                                <label class="form-label fw-bold">CST / CSOSN</label>
                                <select class="form-select font-monospace" name="cst_csosn" id="cst_csosn">
                                    <option value="0102">0102 - Tributada s/ permissão crédito</option>
                                    <option value="0101">0101 - Tributada c/ permissão crédito</option>
                                    <option value="0500">0500 - ICMS cobrado ant. por ST</option>
                                </select>
                            </div>
                            <div class="col-md-4">
                                <label class="form-label fw-bold">CFOP</label>
                                <input type="text" class="form-control font-monospace" name="cfop_produto" id="cfop_produto" value="5102">
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Origem da Mercadoria</label>
                                <select class="form-select" name="origem" id="origem">
                                    <option value="0">0 - Nacional</option>
                                    <option value="1">1 - Estrangeira (Importação direta)</option>
                                    <option value="2">2 - Estrangeira (Mercado interno)</option>
                                </select>
                            </div>
                            <div class="col-md-6">
                                <label class="form-label">Observações Fiscais</label>
                                <input type="text" class="form-control" name="observacoes_fiscais" id="observacoes_fiscais" placeholder="Simples Nacional...">
                            </div>
                        </div>
                    </div>

                </div>

                <div class="modal-footer bg-light">
                    <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cancelar</button>
                    <button type="submit" class="btn btn-danger btn-sm fw-bold"><i class="fa-solid fa-floppy-disk me-1"></i> Salvar Registro</button>
                </div>
            </form>
        </div>
    </div>
</div>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
<script>
const modalItemEl = new bootstrap.Modal(document.getElementById('modalItem'));

function toggleTipoItem() {
    const isServico = document.getElementById('tipoServico').checked;
    const secaoNfe = document.getElementById('secaoNfe');
    const secaoNfse = document.getElementById('secaoNfse');
    const camposProduto = document.querySelectorAll('.campo-produto');
    const selUnidade = document.getElementById('unidade_medida');
    const selCat = document.getElementById('categoria');

    if (isServico) {
        secaoNfe.classList.add('d-none');
        secaoNfse.classList.remove('d-none');
        camposProduto.forEach(el => el.classList.add('d-none'));
        selUnidade.value = 'HR';
        selCat.value = 'Mão de Obra';
    } else {
        secaoNfe.classList.remove('d-none');
        secaoNfse.classList.add('d-none');
        camposProduto.forEach(el => el.classList.remove('d-none'));
        selUnidade.value = 'UN';
        selCat.value = 'Consumíveis';
    }
}

function abrirModal(tipo) {
    document.getElementById('formItem').reset();
    document.getElementById('formAcao').value = 'salvar_item';
    document.getElementById('itemId').value = '';
    document.getElementById('modalTitulo').innerHTML = '<i class="fa-solid fa-plus me-2"></i> Novo Cadastro';

    if (tipo === 'servico') {
        document.getElementById('tipoServico').checked = true;
    } else {
        document.getElementById('tipoProduto').checked = true;
    }
    toggleTipoItem();
    modalItemEl.show();
}

function editarItem(it) {
    document.getElementById('formAcao').value = 'editar_item';
    document.getElementById('itemId').value = it.id;
    document.getElementById('modalTitulo').innerHTML = '<i class="fa-solid fa-pen me-2"></i> Editar Registro #' + it.id;

    if (it.tipo === 'servico') {
        document.getElementById('tipoServico').checked = true;
    } else {
        document.getElementById('tipoProduto').checked = true;
    }
    toggleTipoItem();

    document.getElementById('codigo').value = it.codigo || '';
    document.getElementById('descricao').value = it.descricao || '';
    document.getElementById('categoria').value = it.categoria || 'Consumíveis';
    document.getElementById('unidade_medida').value = it.unidade_medida || 'UN';
    document.getElementById('preco_venda').value = it.preco_venda || '0.00';
    document.getElementById('estoque_atual').value = it.estoque_atual || '0';
    document.getElementById('estoque_minimo').value = it.estoque_minimo || '5';

    // Fiscais NFS-e
    document.getElementById('codigo_servico_lc116').value = it.codigo_servico_lc116 || '14.01';
    document.getElementById('codigo_tributacao_municipal').value = it.codigo_tributacao_municipal || '1401-0/01-88';
    document.getElementById('aliquota_iss').value = it.aliquota_iss || '3.00';
    document.getElementById('exigibilidade_iss').value = it.exigibilidade_iss || '1';
    document.getElementById('cfop_servico').value = it.cfop_servico || '5933';

    // Fiscais NF-e
    document.getElementById('ncm').value = it.ncm || '8466.93.30';
    document.getElementById('cst_csosn').value = it.cst_csosn || '0102';
    document.getElementById('cfop_produto').value = it.cfop_produto || '5102';
    document.getElementById('origem').value = it.origem || '0';
    document.getElementById('observacoes_fiscais').value = it.observacoes_fiscais || '';

    modalItemEl.show();
}
</script>
</body>
</html>`
  },
  {
    filename: 'compras.php',
    description: 'Lançamento Ágil de Compras e Entrada de Notas Fiscais (NF-e) para Manutenção e Venda de Máquinas (Laser, Plasma e Oxicorte), com inserção dinâmica de itens e atualização automática do saldo físico de estoque no MySQL.',
    language: 'php',
    content: `<?php
/**
 * MFx Tecnologia Industrial - Sistema Integrado de Gestão (ERP)
 * Arquivo: compras.php - Lançamento de Compras e Entrada de Insumos / Peças
 * Linhas: Laser Fibra, Plasma Alta Definição e Oxicorte CNC
 */
require_once 'conexao.php';

$mensagem = '';
$tipo_alerta = '';

// 1. Processamento do Formulário de Compra via POST
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['acao']) && $_POST['acao'] === 'salvar_compra') {
    $fornecedor    = trim($_POST['fornecedor'] ?? '');
    $numero_nota   = trim($_POST['numero_nota'] ?? '');
    $data_compra   = trim($_POST['data_compra'] ?? date('Y-m-d'));
    $observacoes   = trim($_POST['observacoes'] ?? '');
    
    // Arrays de itens enviados dinamicamente
    $produto_ids   = $_POST['item_produto_id'] ?? [];
    $codigos       = $_POST['item_codigo'] ?? [];
    $descricoes    = $_POST['item_descricao'] ?? [];
    $unidades      = $_POST['item_unidade'] ?? [];
    $quantidades   = $_POST['item_quantidade'] ?? [];
    $precos_custo  = $_POST['item_preco_custo'] ?? [];

    if (empty($fornecedor) || empty($numero_nota)) {
        $mensagem = "Por favor, preencha o Fornecedor e o Número da Nota Fiscal de Compra.";
        $tipo_alerta = "danger";
    } elseif (empty($codigos)) {
        $mensagem = "Adicione ao menos um produto/insumo à nota de compra.";
        $tipo_alerta = "danger";
    } else {
        try {
            $pdo->beginTransaction();

            // Calcular valor total da compra e processar itens
            $valor_total_compra = 0.00;
            $total_pecas_entradas = 0;
            $itens_processados = [];

            for ($i = 0; $i < count($codigos); $i++) {
                $cod = strtoupper(trim($codigos[$i]));
                $desc = trim($descricoes[$i] ?? '');
                $unid = strtoupper(trim($unidades[$i] ?? 'UN'));
                $qtd = (float)str_replace(',', '.', $quantidades[$i] ?? '0');
                $custo = (float)str_replace(',', '.', $precos_custo[$i] ?? '0');
                $prod_id = !empty($produto_ids[$i]) ? (int)$produto_ids[$i] : null;

                if ($qtd > 0 && !empty($cod)) {
                    $subtotal = round($qtd * $custo, 2);
                    $valor_total_compra += $subtotal;
                    $total_pecas_entradas += $qtd;

                    $itens_processados[] = [
                        'produto_id'           => $prod_id,
                        'codigo'               => $cod,
                        'descricao'            => $desc,
                        'unidade_medida'       => $unid,
                        'quantidade'           => $qtd,
                        'preco_custo_unitario' => $custo,
                        'valor_total'          => $subtotal
                    ];
                }
            }

            if (empty($itens_processados)) {
                throw new Exception("Nenhum item com quantidade válida foi informado.");
            }

            // Gravar cabeçalho da Compra na tabela 'compras'
            $sqlCompra = "INSERT INTO compras (numero_nota, fornecedor, data_compra, observacoes, valor_total) 
                          VALUES (?, ?, ?, ?, ?)";
            $stmtCompra = $pdo->prepare($sqlCompra);
            $stmtCompra->execute([$numero_nota, $fornecedor, $data_compra, $observacoes, $valor_total_compra]);
            $compra_id = $pdo->lastInsertId();

            // Gravar itens da compra e ATUALIZAR AUTOMATICAMENTE O SALDO FÍSICO DO ESTOQUE
            $sqlItem = "INSERT INTO itens_compra (compra_id, produto_id, codigo, descricao, unidade_medida, quantidade, preco_custo_unitario, valor_total) 
                        VALUES (?, ?, ?, ?, ?, ?, ?, ?)";
            $stmtItem = $pdo->prepare($sqlItem);

            // Atualização de estoque por ID ou por Código
            $stmtUpdateEstoqueId = $pdo->prepare("UPDATE produtos_servicos SET estoque_atual = estoque_atual + ? WHERE id = ?");
            $stmtUpdateEstoqueCod = $pdo->prepare("UPDATE produtos_servicos SET estoque_atual = estoque_atual + ? WHERE codigo = ? AND tipo = 'produto'");

            foreach ($itens_processados as $it) {
                $stmtItem->execute([
                    $compra_id,
                    $it['produto_id'],
                    $it['codigo'],
                    $it['descricao'],
                    $it['unidade_medida'],
                    $it['quantidade'],
                    $it['preco_custo_unitario'],
                    $it['valor_total']
                ]);

                // Atualizar o saldo físico
                if (!empty($it['produto_id'])) {
                    $stmtUpdateEstoqueId->execute([$it['quantidade'], $it['produto_id']]);
                } else {
                    $stmtUpdateEstoqueCod->execute([$it['quantidade'], $it['codigo']]);
                }
            }

            $pdo->commit();
            $mensagem = "Compra <strong>" . htmlspecialchars($numero_nota) . "</strong> (" . htmlspecialchars($fornecedor) . ") registrada com sucesso! <strong>+" . number_format($total_pecas_entradas, 0, ',', '.') . " peças</strong> foram adicionadas imediatamente ao estoque físico da MFx Tecnologia.";
            $tipo_alerta = "success";

        } catch (Exception $e) {
            $pdo->rollBack();
            $mensagem = "Erro ao processar lançamento de compra: " . $e->getMessage();
            $tipo_alerta = "danger";
        }
    }
}

// 2. Consulta de Produtos Físicos Cadastrados para o Select
$stmtProd = $pdo->query("SELECT id, codigo, descricao, categoria, unidade_medida, preco_venda, estoque_atual FROM produtos_servicos WHERE tipo = 'produto' ORDER BY codigo ASC");
$produtosEstoque = $stmtProd->fetchAll();

// 3. Consulta das Últimas Compras Realizadas (Histórico)
$stmtHist = $pdo->query("
    SELECT c.*, 
           COUNT(i.id) AS total_itens_nota, 
           COALESCE(SUM(i.quantidade), 0) AS total_pecas_nota
    FROM compras c
    LEFT JOIN itens_compra i ON c.id = i.compra_id
    GROUP BY c.id
    ORDER BY c.data_compra DESC, c.id DESC
    LIMIT 8
");
$historicoCompras = $stmtHist->fetchAll();
?>
<!DOCTYPE html>
<html lang="pt-BR">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MFx Tecnologia - Lançamento de Compras e Entrada de Estoque</title>
    <!-- Bootstrap 5 CSS -->
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <!-- FontAwesome 6 Free -->
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.2/css/all.min.css">
    <style>
        :root {
            --mfx-dark: #0f172a;
            --mfx-darker: #1e293b;
            --mfx-orange: #ea580c;
            --mfx-emerald: #059669;
        }
        body {
            background-color: #f1f5f9;
            font-family: 'Segoe UI', system-ui, -apple-system, sans-serif;
            color: #334155;
        }
        .navbar-mfx {
            background: linear-gradient(135deg, var(--mfx-dark) 0%, var(--mfx-darker) 100%);
            border-bottom: 3px solid var(--mfx-orange);
        }
        .card-custom {
            border: none;
            border-radius: 12px;
            box-shadow: 0 4px 6px -1px rgba(0,0,0,0.06), 0 2px 4px -2px rgba(0,0,0,0.05);
            background: #ffffff;
        }
        .card-header-mfx {
            background: #1e293b;
            color: #ffffff;
            font-weight: 700;
            border-radius: 12px 12px 0 0 !important;
        }
        .table-compras th {
            font-size: 0.75rem;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            background-color: #1e293b;
            color: #ffffff;
        }
        .badge-line {
            font-size: 10px;
            font-weight: 700;
            text-transform: uppercase;
        }
        .total-box {
            background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
            color: #ffffff;
            border-radius: 10px;
            padding: 16px;
        }
        .total-destaque {
            font-size: 1.8rem;
            font-weight: 900;
            color: #34d399;
            font-family: monospace;
        }
        .btn-preset {
            font-size: 11px;
            padding: 3px 8px;
            border-radius: 6px;
            border: 1px solid #cbd5e1;
            background: #ffffff;
            color: #334155;
            transition: all 0.15s;
        }
        .btn-preset:hover {
            background: #ecfdf5;
            border-color: #10b981;
            color: #065f46;
        }
    </style>
</head>
<body>

<!-- Navbar Oficial MFx -->
<nav class="navbar navbar-expand-lg navbar-dark navbar-mfx mb-4 shadow">
    <div class="container-fluid px-4">
        <a class="navbar-brand fw-bold d-flex align-items-center gap-2" href="index.php">
            <span class="badge bg-danger p-2"><i class="fa-solid fa-fire"></i> MFx</span>
            <span>Tecnologia Industrial</span>
        </a>
        <div class="navbar-nav ms-auto gap-2">
            <a class="nav-link" href="index.php"><i class="fa-solid fa-house"></i> Início</a>
            <a class="nav-link" href="estoque.php"><i class="fa-solid fa-boxes-stacked"></i> Estoque & Serviços</a>
            <a class="nav-link active fw-bold text-warning" href="compras.php"><i class="fa-solid fa-cart-shopping"></i> Compras</a>
            <a class="nav-link" href="nova_os.php"><i class="fa-solid fa-plus-circle"></i> Nova OS</a>
            <a class="nav-link" href="listar_os.php"><i class="fa-solid fa-file-lines"></i> Ordens de Serviço</a>
            <a class="nav-link" href="clientes.php"><i class="fa-solid fa-users"></i> Clientes</a>
        </div>
    </div>
</nav>

<div class="container my-4">

    <!-- Cabeçalho da Página com Título e Ações -->
    <div class="d-flex flex-wrap justify-content-between align-items-center mb-4 gap-3">
        <div>
            <div class="d-flex align-items-center gap-2 mb-1">
                <span class="badge bg-success text-white">Módulo: Compras</span>
                <span class="text-muted small">| Linhas Laser Fibra, Plasma HD e Oxicorte</span>
            </div>
            <h3 class="fw-bold text-dark mb-0">
                <i class="fa-solid fa-boxes-packing text-success me-2"></i> Lançamento de Compras & Entrada de Insumos
            </h3>
            <p class="text-muted small mb-0">
                Lançamento rápido de notas fiscais de compra com soma automática ao saldo físico de estoque no MySQL.
            </p>
        </div>
        <div class="d-flex gap-2">
            <a href="estoque.php" class="btn btn-outline-dark btn-sm">
                <i class="fa-solid fa-boxes-stacked me-1"></i> Ver Saldo de Estoque
            </a>
            <a href="nova_os.php" class="btn btn-outline-danger btn-sm">
                <i class="fa-solid fa-plus me-1"></i> Lançar em OS
            </a>
        </div>
    </div>

    <!-- Mensagens de Alerta -->
    <?php if (!empty($mensagem)): ?>
        <div class="alert alert-<?= $tipo_alerta; ?> alert-dismissible fade show shadow-sm" role="alert">
            <?= $mensagem; ?>
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    <?php endif; ?>

    <!-- Formulário Principal de Lançamento de Compra -->
    <form method="POST" action="compras.php" id="formCompra">
        <input type="hidden" name="acao" value="salvar_compra">

        <!-- 1. DADOS DA COMPRA (CABEÇALHO) -->
        <div class="card card-custom mb-4">
            <div class="card-header card-header-mfx py-3 d-flex justify-content-between align-items-center">
                <span><i class="fa-solid fa-file-invoice me-2 text-warning"></i> 1. Dados da Compra / Nota Fiscal de Entrada</span>
                <span class="badge bg-secondary font-monospace">NF-e Fornecedor</span>
            </div>
            <div class="card-body p-4">
                <div class="row g-3">
                    
                    <!-- Fornecedor -->
                    <div class="col-md-6">
                        <label for="fornecedor" class="form-label fw-bold text-dark">
                            Fornecedor / Razão Social <span class="text-danger">*</span>
                        </label>
                        <input type="text" class="form-control" id="fornecedor" name="fornecedor" list="listaFornecedores" placeholder="Ex: Raytools Óptica & Laser Co." required>
                        <datalist id="listaFornecedores">
                            <option value="Raytools Laser Optics & Consumables Co.">
                            <option value="Hypertherm do Brasil Sistemas Térmicos">
                            <option value="WSX Laser Heads & Optical Components">
                            <option value="Maxphotonics & Raycus Brasil">
                            <option value="Oxicorte Brasil Peças & Tochas Industriais">
                            <option value="Precitec Lentes & Sensores Brasil">
                            <option value="Belms Bicos & Cerâmicas Laser">
                        </datalist>
                        
                        <!-- Pílulas de seleção rápida de fornecedores -->
                        <div class="d-flex flex-wrap gap-1 mt-2 align-items-center">
                            <span class="text-muted small fw-bold">Rápido:</span>
                            <button type="button" class="btn btn-preset" onclick="selecionarFornecedor('Raytools Laser Optics & Consumables Co.')">Raytools</button>
                            <button type="button" class="btn btn-preset" onclick="selecionarFornecedor('Hypertherm do Brasil Sistemas Térmicos')">Hypertherm</button>
                            <button type="button" class="btn btn-preset" onclick="selecionarFornecedor('WSX Laser Heads Industrial')">WSX</button>
                            <button type="button" class="btn btn-preset" onclick="selecionarFornecedor('Oxicorte Brasil Peças & Tochas')">Oxicorte Brasil</button>
                            <button type="button" class="btn btn-preset" onclick="selecionarFornecedor('Precitec Lentes & Sensores')">Precitec</button>
                        </div>
                    </div>

                    <!-- Número da Nota Fiscal -->
                    <div class="col-md-3">
                        <label for="numero_nota" class="form-label fw-bold text-dark">
                            Nº da Nota Fiscal / Chave <span class="text-danger">*</span>
                        </label>
                        <input type="text" class="form-control font-monospace fw-bold" id="numero_nota" name="numero_nota" placeholder="Ex: NF-e 049.920" required>
                        <small class="text-muted">Número da NF-e impressa</small>
                    </div>

                    <!-- Data da Compra -->
                    <div class="col-md-3">
                        <label for="data_compra" class="form-label fw-bold text-dark">
                            Data da Compra <span class="text-danger">*</span>
                        </label>
                        <input type="date" class="form-control font-monospace" id="data_compra" name="data_compra" value="<?= date('Y-m-d'); ?>" required>
                        <small class="text-muted">Data da emissão da nota</small>
                    </div>

                    <!-- Observações -->
                    <div class="col-md-12">
                        <label for="observacoes" class="form-label small text-muted">Observações da Compra / Condições de Frete e Faturamento (Opcional)</label>
                        <input type="text" class="form-control form-control-sm" id="observacoes" name="observacoes" placeholder="Ex: Pedido de importação via despachante Santos, 28/56 DDL, lote de reposição preventiva.">
                    </div>

                </div>
            </div>
        </div>

        <!-- 2. LANÇAMENTO SIMPLES DE ITENS ADQUIRIDOS (ITENS DA NOTA) -->
        <div class="card card-custom mb-4">
            <div class="card-header card-header-mfx py-3 d-flex flex-wrap justify-content-between align-items-center gap-2">
                <div>
                    <i class="fa-solid fa-list-check me-2 text-warning"></i>
                    <span>2. Itens Adquiridos (Consumíveis e Peças da NF-e)</span>
                    <small class="text-light opacity-75 ms-2">O estoque físico será somado automaticamente</small>
                </div>
                <button type="button" class="btn btn-success btn-sm fw-bold" onclick="adicionarLinhaItem()">
                    <i class="fa-solid fa-plus me-1"></i> + Adicionar Item à Compra
                </button>
            </div>

            <!-- Inserção rápida por itens de alto giro -->
            <div class="p-3 bg-light border-bottom">
                <div class="d-flex flex-wrap align-items-center gap-2">
                    <span class="small fw-bold text-dark"><i class="fa-solid fa-bolt text-warning me-1"></i> Itens Frequentes (Clique para incluir):</span>
                    <button type="button" class="btn btn-preset" onclick="adicionarPresetItem('MFX-LP30-15', 'Lente de Proteção Laser Fibra D30 x 1.5mm Quartzo', 'UN', 55.00)">+ Lente D30x1.5 (Laser)</button>
                    <button type="button" class="btn btn-preset" onclick="adicionarPresetItem('MFX-BD-15', 'Bico Laser Duplo Cromado D32 H15 1.5mm', 'UN', 42.50)">+ Bico Laser Duplo 1.5mm</button>
                    <button type="button" class="btn btn-preset" onclick="adicionarPresetItem('MFX-BP-105', 'Bico de Plasma Alta Definição 105A', 'UN', 52.00)">+ Bico Plasma 105A</button>
                    <button type="button" class="btn btn-preset" onclick="adicionarPresetItem('MFX-EP-100', 'Eletrodo de Plasma Híbrido Cobre/Háfnio 100A', 'UN', 58.00)">+ Eletrodo Plasma 100A</button>
                    <button type="button" class="btn btn-preset" onclick="adicionarPresetItem('MFX-BO-1502', 'Bico de Corte Oxicorte 1502 GLP/Oxigênio nº 02', 'UN', 38.00)">+ Bico Oxicorte 1502</button>
                    <button type="button" class="btn btn-preset" onclick="adicionarPresetItem('MFX-CABO-SEN', 'Cabo Sensor de Altura Capacitivo SMA/BNC', 'UN', 250.00)">+ Cabo Sensor Laser</button>
                </div>
            </div>

            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0 table-compras" id="tabelaItensCompra">
                    <thead>
                        <tr>
                            <th style="width: 40px;" class="text-center">#</th>
                            <th style="width: 280px;">Produto / Insumo Cadastrado</th>
                            <th style="width: 140px;">Código MFx</th>
                            <th>Descrição Completa na Nota</th>
                            <th style="width: 80px;" class="text-center">Unid.</th>
                            <th style="width: 110px;" class="text-center">Estoque Atual</th>
                            <th style="width: 120px;" class="text-center">Qtd Comprada</th>
                            <th style="width: 140px;" class="text-end">Custo Unit. (R$)</th>
                            <th style="width: 140px;" class="text-end">Total Item (R$)</th>
                            <th style="width: 50px;" class="text-center">Ação</th>
                        </tr>
                    </thead>
                    <tbody id="corpoItensCompra">
                        <!-- Linhas geradas dinamicamente via JavaScript -->
                    </tbody>
                    <tfoot class="table-light fw-bold">
                        <tr>
                            <td colspan="6" class="text-end text-uppercase small">Subtotal da Nota Fiscal:</td>
                            <td class="text-center font-monospace text-success fs-6" id="totalQtdPecas">0 un</td>
                            <td class="text-end text-uppercase small">Valor Total da Compra:</td>
                            <td class="text-end font-monospace text-success fs-5" id="valorTotalGeralTexto">R$ 0,00</td>
                            <td></td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            <!-- 3. PAINEL DE CONCLUSÃO & ATUALIZAÇÃO DE ESTOQUE -->
            <div class="p-4 bg-light border-top d-flex flex-wrap justify-content-between align-items-center gap-3">
                <div class="d-flex align-items-center gap-2">
                    <button type="button" class="btn btn-outline-secondary btn-sm" onclick="adicionarLinhaItem()">
                        <i class="fa-solid fa-plus me-1"></i> + Adicionar Mais Um Item
                    </button>
                    <span class="text-muted small" id="contadorItens">1 item lançado</span>
                </div>

                <div class="d-flex align-items-center gap-3">
                    <div class="text-end d-none d-sm-block">
                        <small class="text-muted text-uppercase d-block fw-bold">Total a Pagar na NF-e</small>
                        <span class="fs-4 fw-bold text-dark font-monospace" id="badgeTotalDestaque">R$ 0,00</span>
                    </div>

                    <!-- BOTÃO DE CONCLUSÃO -->
                    <button type="submit" class="btn btn-success btn-lg fw-bold px-4 py-2 shadow">
                        <i class="fa-solid fa-boxes-packing me-2"></i> Salvar Compra e Atualizar Estoque
                    </button>
                </div>
            </div>

        </div>

    </form>

    <!-- HISTÓRICO DE COMPRAS RECENTES -->
    <?php if (!empty($historicoCompras)): ?>
        <div class="card card-custom mt-4">
            <div class="card-header bg-dark text-white py-3 d-flex justify-content-between align-items-center">
                <span><i class="fa-solid fa-clock-rotate-left me-2 text-warning"></i> Histórico de Compras e Entradas Físicas de Estoque</span>
                <span class="badge bg-secondary"><?= count($historicoCompras); ?> notas registradas</span>
            </div>
            <div class="table-responsive">
                <table class="table table-hover align-middle mb-0">
                    <thead class="table-light small text-uppercase">
                        <tr>
                            <th>Nº da Nota</th>
                            <th>Fornecedor</th>
                            <th>Data</th>
                            <th class="text-center">Itens Distintos</th>
                            <th class="text-center">Peças Entradas</th>
                            <th class="text-end">Valor Total</th>
                            <th>Observações</th>
                        </tr>
                    </thead>
                    <tbody class="small">
                        <?php foreach ($historicoCompras as $hc): ?>
                            <tr>
                                <td class="fw-bold font-monospace text-success"><?= htmlspecialchars($hc['numero_nota']); ?></td>
                                <td class="fw-bold text-dark"><?= htmlspecialchars($hc['fornecedor']); ?></td>
                                <td class="font-monospace text-muted"><?= date('d/m/Y', strtotime($hc['data_compra'])); ?></td>
                                <td class="text-center font-monospace"><?= $hc['total_itens_nota']; ?></td>
                                <td class="text-center font-monospace text-success fw-bold">+<?= number_format($hc['total_pecas_nota'], 0, ',', '.'); ?> un</td>
                                <td class="text-end font-monospace fw-bold text-dark">R$ <?= number_format($hc['valor_total'], 2, ',', '.'); ?></td>
                                <td class="text-muted"><?= htmlspecialchars($hc['observacoes'] ?? '-'); ?></td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            </div>
        </div>
    <?php endif; ?>

</div>

<!-- Dados JSON dos produtos em estoque para consulta pelo JS -->
<script>
const PRODUTOS_ESTOQUE = <?= json_encode($produtosEstoque, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT); ?>;

function selecionarFornecedor(nome) {
    document.getElementById('fornecedor').value = nome;
}

let contadorLinhas = 0;

function formatarMoeda(valor) {
    return 'R$ ' + Number(valor).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

function adicionarLinhaItem(dados = {}) {
    contadorLinhas++;
    const tbody = document.getElementById('corpoItensCompra');
    const tr = document.createElement('tr');
    tr.id = 'linha_item_' + contadorLinhas;

    const prodIdDef  = dados.produto_id || (PRODUTOS_ESTOQUE.length > 0 ? PRODUTOS_ESTOQUE[0].id : '');
    const codigoDef  = dados.codigo || (PRODUTOS_ESTOQUE.length > 0 ? PRODUTOS_ESTOQUE[0].codigo : 'MFX-LP30-15');
    const descDef    = dados.descricao || (PRODUTOS_ESTOQUE.length > 0 ? PRODUTOS_ESTOQUE[0].descricao : 'Lente de Proteção Laser D30');
    const unidDef    = dados.unidade || (PRODUTOS_ESTOQUE.length > 0 ? PRODUTOS_ESTOQUE[0].unidade_medida : 'UN');
    const qtdDef     = dados.quantidade || 10;
    const custoDef   = dados.preco_custo || 55.00;
    const totalDef   = (qtdDef * custoDef).toFixed(2);

    // Encontrar saldo atual
    const prodEncontrado = PRODUTOS_ESTOQUE.find(p => p.id == prodIdDef || p.codigo === codigoDef);
    const saldoAtual = prodEncontrado ? prodEncontrado.estoque_atual : 0;

    let optionsProdutos = '<option value="">-- Selecione ou digite manualmente --</option>';
    PRODUTOS_ESTOQUE.forEach(p => {
        const selected = (p.id == prodIdDef) ? 'selected' : '';
        optionsProdutos += \`<option value="\${p.id}" data-codigo="\${p.codigo}" data-desc="\${p.descricao}" data-unid="\${p.unidade_medida}" data-saldo="\${p.estoque_atual}" data-preco="\${p.preco_venda}" \${selected}>\${p.codigo} - \${p.descricao.substring(0, 36)}... (Saldo: \${p.estoque_atual} \${p.unidade_medida})</option>\`;
    });

    tr.innerHTML = \`
        <td class="text-center font-monospace text-muted fw-bold">\${tbody.children.length + 1}</td>
        <td>
            <select class="form-select form-select-sm" name="item_produto_id[]" onchange="selecionarProdutoLinha(\${contadorLinhas}, this)">
                \${optionsProdutos}
            </select>
        </td>
        <td>
            <input type="text" class="form-control form-control-sm font-monospace fw-bold" name="item_codigo[]" id="item_codigo_\${contadorLinhas}" value="\${codigoDef}" required>
        </td>
        <td>
            <input type="text" class="form-control form-control-sm" name="item_descricao[]" id="item_descricao_\${contadorLinhas}" value="\${descDef}" required>
        </td>
        <td>
            <select class="form-select form-select-sm font-monospace text-center fw-bold" name="item_unidade[]" id="item_unidade_\${contadorLinhas}">
                <option value="UN" \${unidDef === 'UN' ? 'selected' : ''}>UN</option>
                <option value="PC" \${unidDef === 'PC' ? 'selected' : ''}>PC</option>
                <option value="JG" \${unidDef === 'JG' ? 'selected' : ''}>JG</option>
                <option value="CX" \${unidDef === 'CX' ? 'selected' : ''}>CX</option>
                <option value="MT" \${unidDef === 'MT' ? 'selected' : ''}>MT</option>
            </select>
        </td>
        <td class="text-center">
            <span class="badge bg-secondary font-monospace" id="item_saldo_\${contadorLinhas}">\${saldoAtual} \${unidDef}</span>
        </td>
        <td>
            <input type="number" min="1" step="1" class="form-control form-control-sm text-center font-monospace fw-bold border-success" name="item_quantidade[]" id="item_qtd_\${contadorLinhas}" value="\${qtdDef}" oninput="recalcularTotais()" required>
        </td>
        <td>
            <input type="number" min="0" step="0.01" class="form-control form-control-sm text-end font-monospace fw-bold" name="item_preco_custo[]" id="item_custo_\${contadorLinhas}" value="\${custoDef}" oninput="recalcularTotais()" required>
        </td>
        <td class="text-end font-monospace fw-bold text-dark" id="item_total_\${contadorLinhas}">
            \${formatarMoeda(totalDef)}
        </td>
        <td class="text-center">
            <button type="button" class="btn btn-outline-danger btn-sm p-1" onclick="removerLinhaItem(\${contadorLinhas})" title="Remover item">
                <i class="fa-solid fa-trash-can"></i>
            </button>
        </td>
    \`;

    tbody.appendChild(tr);
    recalcularTotais();
}

function selecionarProdutoLinha(linhaIdx, selectEl) {
    const selectedOpt = selectEl.options[selectEl.selectedIndex];
    if (selectedOpt && selectedOpt.value) {
        const codigo = selectedOpt.getAttribute('data-codigo');
        const desc = selectedOpt.getAttribute('data-desc');
        const unid = selectedOpt.getAttribute('data-unid');
        const saldo = selectedOpt.getAttribute('data-saldo');
        const precoVenda = parseFloat(selectedOpt.getAttribute('data-preco')) || 0;

        document.getElementById('item_codigo_' + linhaIdx).value = codigo;
        document.getElementById('item_descricao_' + linhaIdx).value = desc;
        document.getElementById('item_unidade_' + linhaIdx).value = unid;
        document.getElementById('item_saldo_' + linhaIdx).textContent = saldo + ' ' + unid;

        // Sugestão de custo padrão de 55% do preço de venda
        const inputCusto = document.getElementById('item_custo_' + linhaIdx);
        if (!inputCusto.value || parseFloat(inputCusto.value) === 0) {
            inputCusto.value = (precoVenda * 0.55).toFixed(2);
        }
    }
    recalcularTotais();
}

function adicionarPresetItem(codigo, descricao, unidade, custo) {
    const prod = PRODUTOS_ESTOQUE.find(p => p.codigo === codigo);
    adicionarLinhaItem({
        produto_id: prod ? prod.id : '',
        codigo: codigo,
        descricao: descricao,
        unidade: unidade,
        quantidade: 20,
        preco_custo: custo
    });
}

function removerLinhaItem(linhaIdx) {
    const linha = document.getElementById('linha_item_' + linhaIdx);
    const tbody = document.getElementById('corpoItensCompra');
    if (tbody.children.length <= 1) {
        alert('A nota fiscal de compra deve conter ao menos um item.');
        return;
    }
    if (linha) {
        linha.remove();
        recalcularTotais();
    }
}

function recalcularTotais() {
    const tbody = document.getElementById('corpoItensCompra');
    let totalPecas = 0;
    let valorTotal = 0;

    const linhas = tbody.querySelectorAll('tr');
    linhas.forEach((tr, index) => {
        // Atualizar índice visual
        const tdIdx = tr.querySelector('td:first-child');
        if (tdIdx) tdIdx.textContent = (index + 1);

        const inputQtd = tr.querySelector('[name="item_quantidade[]"]');
        const inputCusto = tr.querySelector('[name="item_preco_custo[]"]');
        const tdTotal = tr.querySelector('td:nth-last-child(2)');

        if (inputQtd && inputCusto && tdTotal) {
            const qtd = parseFloat(inputQtd.value) || 0;
            const custo = parseFloat(inputCusto.value) || 0;
            const subtotal = Math.round(qtd * custo * 100) / 100;

            tdTotal.textContent = formatarMoeda(subtotal);
            totalPecas += qtd;
            valorTotal += subtotal;
        }
    });

    document.getElementById('totalQtdPecas').textContent = '+' + totalPecas.toLocaleString('pt-BR') + ' un';
    document.getElementById('valorTotalGeralTexto').textContent = formatarMoeda(valorTotal);
    document.getElementById('badgeTotalDestaque').textContent = formatarMoeda(valorTotal);
    document.getElementById('contadorItens').textContent = linhas.length + (linhas.length === 1 ? ' item lançado' : ' itens lançados');
}

// Inicializar com uma primeira linha padrão
document.addEventListener('DOMContentLoaded', function() {
    adicionarLinhaItem();
});
</script>

<script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js"></script>
</body>
</html>`
  },
  {
    filename: 'pdv.php',
    description: 'Módulo PDV (Ponto de Venda) ágil em PHP/MySQL para faturamento balcão de consumíveis e máquinas, baixa automática de estoque e lançamento no caixa.',
    language: 'php',
    content: `<?php
/**
 * MFx Tecnologia Industrial - Sistema ERP
 * Módulo: PDV - Ponto de Venda & Vendas Balcão (pdv.php)
 * Faturamento rápido, baixa física no estoque e conciliação de caixa
 */

require_once 'conexao.php';

$mensagemSucesso = null;
$mensagemErro = null;
$vendaFinalizada = null;

// PROCESSAR FINALIZAÇÃO DE VENDA (POST)
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['acao']) && $_POST['acao'] === 'finalizar_venda') {
    try {
        $pdo->beginTransaction();

        $cliente_id = !empty($_POST['cliente_id']) ? intval($_POST['cliente_id']) : null;
        $cliente_nome = !empty($_POST['cliente_nome']) ? trim($_POST['cliente_nome']) : 'Consumidor Final / Venda Balcão';
        $cliente_doc = !empty($_POST['cliente_documento']) ? trim($_POST['cliente_documento']) : null;
        $forma_pagamento = $_POST['forma_pagamento'] ?? 'PIX';
        $detalhe_pagamento = trim($_POST['detalhe_pagamento'] ?? '');
        $valor_subtotal = floatval($_POST['valor_subtotal'] ?? 0);
        $valor_desconto = floatval($_POST['valor_desconto'] ?? 0);
        $valor_total = floatval($_POST['valor_total'] ?? 0);
        $valor_recebido = floatval($_POST['valor_recebido'] ?? $valor_total);
        $valor_troco = floatval($_POST['valor_troco'] ?? 0);
        $observacoes = trim($_POST['observacoes'] ?? '');
        $operador = 'ADM - MEDRADE';

        $itens_produtos = $_POST['item_produto_id'] ?? [];
        $itens_codigos = $_POST['item_codigo'] ?? [];
        $itens_descricoes = $_POST['item_descricao'] ?? [];
        $itens_unidades = $_POST['item_unidade'] ?? [];
        $itens_quantidades = $_POST['item_quantidade'] ?? [];
        $itens_precos = $_POST['item_preco_unitario'] ?? [];
        $itens_totais = $_POST['item_valor_total'] ?? [];

        if (empty($itens_codigos)) {
            throw new Exception("O carrinho está vazio! Adicione pelo menos um produto para finalizar a venda.");
        }

        // Gerar código único de venda
        $anoAtual = date('Y');
        $stmtCount = $pdo->query("SELECT COUNT(*) FROM vendas");
        $proximoNum = intval($stmtCount->fetchColumn()) + 45;
        $codigo_venda = sprintf("VND-%s-%04d", $anoAtual, $proximoNum);
        $data_venda = date('Y-m-d');
        $hora_venda = date('H:i:s');

        // 1. Inserir Cabeçalho da Venda
        $sqlVenda = "INSERT INTO vendas 
            (codigo_venda, cliente_id, cliente_nome, cliente_documento, data_venda, hora_venda, 
             forma_pagamento, detalhe_pagamento, valor_subtotal, valor_desconto, valor_total, 
             valor_recebido, valor_troco, observacoes, operador)
            VALUES 
            (:codigo_venda, :cliente_id, :cliente_nome, :cliente_doc, :data_venda, :hora_venda, 
             :forma_pagamento, :detalhe_pagamento, :valor_subtotal, :valor_desconto, :valor_total, 
             :valor_recebido, :valor_troco, :observacoes, :operador)";
        
        $stmtVenda = $pdo->prepare($sqlVenda);
        $stmtVenda->execute([
            ':codigo_venda' => $codigo_venda,
            ':cliente_id' => $cliente_id,
            ':cliente_nome' => $cliente_nome,
            ':cliente_doc' => $cliente_doc,
            ':data_venda' => $data_venda,
            ':hora_venda' => $hora_venda,
            ':forma_pagamento' => $forma_pagamento,
            ':detalhe_pagamento' => $detalhe_pagamento,
            ':valor_subtotal' => $valor_subtotal,
            ':valor_desconto' => $valor_desconto,
            ':valor_total' => $valor_total,
            ':valor_recebido' => $valor_recebido,
            ':valor_troco' => $valor_troco,
            ':observacoes' => $observacoes,
            ':operador' => $operador
        ]);

        $venda_id = $pdo->lastInsertId();

        // 2. Inserir Itens e Dar Baixa Física no Saldo de Estoque
        $sqlItem = "INSERT INTO itens_venda 
            (venda_id, produto_id, codigo, descricao, unidade_medida, quantidade, preco_unitario, valor_total)
            VALUES 
            (:venda_id, :produto_id, :codigo, :descricao, :unidade_medida, :quantidade, :preco_unitario, :valor_total)";
        $stmtItem = $pdo->prepare($sqlItem);

        $sqlBaixaEstoque = "UPDATE produtos_servicos 
            SET estoque_atual = GREATEST(0, estoque_atual - :quantidade) 
            WHERE codigo = :codigo AND tipo = 'produto'";
        $stmtBaixa = $pdo->prepare($sqlBaixaEstoque);

        $itensComprovante = [];
        for ($i = 0; $i < count($itens_codigos); $i++) {
            $cod = trim($itens_codigos[$i]);
            $desc = trim($itens_descricoes[$i]);
            $un = trim($itens_unidades[$i] ?? 'UN');
            $qtd = floatval($itens_quantidades[$i] ?? 1);
            $preco = floatval($itens_precos[$i] ?? 0);
            $tot = floatval($itens_totais[$i] ?? ($qtd * $preco));
            $pId = !empty($itens_produtos[$i]) ? intval($itens_produtos[$i]) : null;

            if ($qtd > 0) {
                // Inserir item
                $stmtItem->execute([
                    ':venda_id' => $venda_id,
                    ':produto_id' => $pId,
                    ':codigo' => $cod,
                    ':descricao' => $desc,
                    ':unidade_medida' => $un,
                    ':quantidade' => $qtd,
                    ':preco_unitario' => $preco,
                    ':valor_total' => $tot
                ]);

                // Dar baixa física no saldo de estoque
                $stmtBaixa->execute([
                    ':quantidade' => $qtd,
                    ':codigo' => $cod
                ]);

                $itensComprovante[] = [
                    'codigo' => $cod,
                    'descricao' => $desc,
                    'quantidade' => $qtd,
                    'unidade' => $un,
                    'preco' => $preco,
                    'total' => $tot
                ];
            }
        }

        // 3. Registrar Lançamento de Receita no Financeiro / Caixa
        $sqlCaixa = "INSERT INTO movimentos_caixa 
            (tipo, origem, referencia_id, descricao, forma_pagamento, valor, data_hora, operador)
            VALUES 
            ('ENTRADA', 'PDV', :ref_id, :descricao, :forma_pagamento, :valor, :data_hora, :operador)";
        $stmtCaixa = $pdo->prepare($sqlCaixa);
        $stmtCaixa->execute([
            ':ref_id' => $codigo_venda,
            ':descricao' => "Recebimento PDV {$codigo_venda} - {$cliente_nome}",
            ':forma_pagamento' => $forma_pagamento,
            ':valor' => $valor_total,
            ':data_hora' => "{$data_venda} {$hora_venda}",
            ':operador' => $operador
        ]);

        $pdo->commit();

        $vendaFinalizada = [
            'codigo_venda' => $codigo_venda,
            'cliente_nome' => $cliente_nome,
            'cliente_documento' => $cliente_doc,
            'data_venda' => $data_venda,
            'hora_venda' => $hora_venda,
            'forma_pagamento' => $forma_pagamento,
            'detalhe_pagamento' => $detalhe_pagamento,
            'valor_subtotal' => $valor_subtotal,
            'valor_desconto' => $valor_desconto,
            'valor_total' => $valor_total,
            'valor_recebido' => $valor_recebido,
            'valor_troco' => $valor_troco,
            'itens' => $itensComprovante
        ];

        $mensagemSucesso = "Venda {$codigo_venda} finalizada com sucesso! Baixa de estoque e lançamento de caixa efetuados.";

    } catch (Exception $e) {
        if ($pdo->inTransaction()) {
            $pdo->rollBack();
        }
        $mensagemErro = "Erro ao processar venda: " . $e->getMessage();
    }
}

// Consultar produtos do estoque para venda rápida
$sqlProdutos = "SELECT id, codigo, descricao, categoria, unidade_medida, preco_venda, estoque_atual, ncm 
                FROM produtos_servicos 
                WHERE tipo = 'produto' 
                ORDER BY categoria ASC, descricao ASC";
$produtos = $pdo->query($sqlProdutos)->fetchAll(PDO::FETCH_ASSOC);

// Consultar clientes cadastrados
$sqlClientes = "SELECT id, nome, nome_fantasia, documento, cidade, estado FROM clientes ORDER BY nome ASC";
$clientes = $pdo->query($sqlClientes)->fetchAll(PDO::FETCH_ASSOC);

// Consultar histórico das últimas 10 vendas
$sqlVendasRecentes = "SELECT * FROM vendas ORDER BY id DESC LIMIT 10";
$vendasRecentes = $pdo->query($sqlVendasRecentes)->fetchAll(PDO::FETCH_ASSOC);

// Totais do dia
$stmtTotaisHoje = $pdo->query("SELECT COUNT(*) as qtd, COALESCE(SUM(valor_total), 0) as faturamento FROM vendas WHERE data_venda = CURDATE()");
$totaisHoje = $stmtTotaisHoje->fetch(PDO::FETCH_ASSOC);
?>
<!DOCTYPE html>
<html lang="pt-BR" data-bs-theme="dark">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>MFx PDV - Vendas & Faturamento Balcão</title>
    <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css" rel="stylesheet">
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css">
    <style>
        :root {
            --mfx-gold: #f59e0b;
            --mfx-dark: #0f172a;
            --mfx-panel: #1e293b;
        }
        body {
            background-color: #090d16;
            color: #e2e8f0;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        }
        .bg-mfx-panel {
            background-color: var(--mfx-panel);
            border: 1px solid #334155;
        }
        .text-gold {
            color: var(--mfx-gold) !important;
        }
        .btn-gold {
            background-color: var(--mfx-gold);
            color: #0f172a;
            font-weight: 700;
        }
        .btn-gold:hover {
            background-color: #d97706;
            color: #ffffff;
        }
        .font-mono {
            font-family: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace;
        }
    </style>
</head>
<body class="p-3">

<div class="container-fluid">
    <!-- Cabeçalho PDV -->
    <div class="bg-mfx-panel rounded-3 p-3 mb-3 d-flex flex-wrap justify-content-between align-items-center gap-3">
        <div class="d-flex align-items-center gap-3">
            <div class="bg-warning text-dark p-3 rounded-3 fs-3">
                <i class="fa-solid fa-cash-register"></i>
            </div>
            <div>
                <span class="badge bg-warning text-dark font-mono">MÓDULO PDV • MFx INDUSTRIAL</span>
                <h3 class="mb-0 fw-bold text-white">Faturamento & Venda Balcão</h3>
                <small class="text-secondary">Baixa imediata no estoque de consumíveis e registro no Caixa Financeiro.</small>
            </div>
        </div>

        <div class="d-flex gap-3 text-end">
            <div class="bg-dark p-2 px-3 rounded border border-secondary">
                <small class="text-secondary d-block">FATURAMENTO HOJE</small>
                <span class="fs-5 fw-bold text-success font-mono">R$ <?= number_format($totaisHoje['faturamento'], 2, ',', '.') ?></span>
            </div>
            <div class="bg-dark p-2 px-3 rounded border border-secondary">
                <small class="text-secondary d-block">ATENDIMENTOS</small>
                <span class="fs-5 fw-bold text-gold font-mono"><?= $totaisHoje['qtd'] ?> vendas</span>
            </div>
        </div>
    </div>

    <?php if ($mensagemSucesso): ?>
        <div class="alert alert-success d-flex justify-content-between align-items-center">
            <div><i class="fa-solid fa-circle-check me-2"></i> <?= htmlspecialchars($mensagemSucesso) ?></div>
            <button class="btn btn-sm btn-dark" onclick="window.print()"><i class="fa-solid fa-print me-1"></i> Imprimir Cupom</button>
        </div>
    <?php endif; ?>

    <?php if ($mensagemErro): ?>
        <div class="alert alert-danger"><i class="fa-solid fa-circle-exclamation me-2"></i> <?= htmlspecialchars($mensagemErro) ?></div>
    <?php endif; ?>

    <!-- Formulário Principal do PDV -->
    <form method="POST" id="formPdv">
        <input type="hidden" name="acao" value="finalizar_venda">
        <input type="hidden" name="valor_subtotal" id="inputSubtotal" value="0">
        <input type="hidden" name="valor_total" id="inputTotalGeral" value="0">
        <input type="hidden" name="valor_troco" id="inputTroco" value="0">

        <div class="row g-3">
            <!-- Coluna Esquerda: Catálogo e Seleção de Produtos -->
            <div class="col-lg-7">
                <div class="bg-mfx-panel p-3 rounded-3 mb-3">
                    <h5 class="fw-bold mb-3 text-gold"><i class="fa-solid fa-boxes-stacked me-2"></i> Catálogo Rápido de Produtos</h5>
                    <div class="table-responsive" style="max-height: 480px;">
                        <table class="table table-dark table-hover table-sm align-middle">
                            <thead>
                                <tr class="text-secondary font-mono small">
                                    <th>CÓDIGO</th>
                                    <th>DESCRIÇÃO DO CONSUMÍVEL</th>
                                    <th>SALDO</th>
                                    <th>PREÇO</th>
                                    <th class="text-center">AÇÃO</th>
                                </tr>
                            </thead>
                            <tbody>
                                <?php foreach ($produtos as $p): ?>
                                    <tr>
                                        <td class="font-mono text-warning fw-bold"><?= htmlspecialchars($p['codigo']) ?></td>
                                        <td>
                                            <div class="fw-semibold text-white"><?= htmlspecialchars($p['descricao']) ?></div>
                                            <small class="text-secondary"><?= htmlspecialchars($p['categoria']) ?></small>
                                        </td>
                                        <td>
                                            <span class="badge <?= $p['estoque_atual'] > 5 ? 'bg-success' : 'bg-danger' ?> font-mono">
                                                <?= $p['estoque_atual'] ?> <?= $p['unidade_medida'] ?>
                                            </span>
                                        </td>
                                        <td class="font-mono fw-bold text-success">
                                            R$ <?= number_format($p['preco_venda'], 2, ',', '.') ?>
                                        </td>
                                        <td class="text-center">
                                            <button type="button" class="btn btn-sm btn-outline-warning" 
                                                onclick="adicionarAoCarrinho(<?= htmlspecialchars(json_encode($p)) ?>)">
                                                <i class="fa-solid fa-plus"></i> Adicionar
                                            </button>
                                        </td>
                                    </tr>
                                <?php endforeach; ?>
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>

            <!-- Coluna Direita: Carrinho da Venda e Fechamento -->
            <div class="col-lg-5">
                <div class="bg-mfx-panel p-3 rounded-3">
                    <!-- Cliente -->
                    <div class="mb-3">
                        <label class="form-label small text-secondary fw-bold">CLIENTE / DESTINATÁRIO</label>
                        <select name="cliente_id" id="selectCliente" class="form-select form-select-sm bg-dark text-white mb-2" onchange="atualizarNomeCliente(this)">
                            <option value="">Consumidor Final / Venda Balcão</option>
                            <?php foreach ($clientes as $c): ?>
                                <option value="<?= $c['id'] ?>" data-nome="<?= htmlspecialchars($c['nomeFantasia'] ?: $c['nome']) ?>" data-doc="<?= htmlspecialchars($c['documento']) ?>">
                                    <?= htmlspecialchars($c['nomeFantasia'] ?: $c['nome']) ?> (<?= $c['cidade'] ?>/<?= $c['estado'] ?>)
                                </option>
                            <?php endforeach; ?>
                        </select>
                        <input type="hidden" name="cliente_nome" id="inputClienteNome" value="Consumidor Final / Venda Balcão">
                        <input type="text" name="cliente_documento" id="inputClienteDoc" class="form-control form-control-sm bg-dark text-white" placeholder="CPF/CNPJ na Nota (Opcional)">
                    </div>

                    <!-- Itens Selecionados (Carrinho) -->
                    <h6 class="fw-bold text-gold mb-2 d-flex justify-content-between align-items-center">
                        <span><i class="fa-solid fa-cart-shopping me-1"></i> Itens da Venda</span>
                        <span id="contadorItensCarrinho" class="badge bg-secondary font-mono">0 itens</span>
                    </h6>

                    <div class="table-responsive mb-3" style="max-height: 220px;">
                        <table class="table table-dark table-sm align-middle font-mono small" id="tabelaCarrinho">
                            <thead>
                                <tr class="text-secondary">
                                    <th>Item</th>
                                    <th>Qtd</th>
                                    <th>Total</th>
                                    <th></th>
                                </tr>
                            </thead>
                            <tbody id="corpoCarrinho">
                                <!-- Linhas dinâmicas inseridas via JS -->
                            </tbody>
                        </table>
                    </div>

                    <!-- Desconto e Totais -->
                    <div class="bg-dark p-3 rounded-3 border border-secondary mb-3">
                        <div class="d-flex justify-content-between small text-secondary mb-1">
                            <span>Subtotal:</span>
                            <span class="font-mono text-white" id="txtSubtotal">R$ 0,00</span>
                        </div>
                        <div class="d-flex justify-content-between align-items-center small mb-2">
                            <span class="text-secondary">Desconto (R$):</span>
                            <input type="number" step="0.01" min="0" name="valor_desconto" id="inputDesconto" value="0.00" 
                                   class="form-control form-control-sm bg-dark text-white text-end font-mono" style="width: 100px;" oninput="calcularTotais()">
                        </div>
                        <div class="d-flex justify-content-between align-items-center pt-2 border-top border-secondary">
                            <span class="fs-6 fw-bold text-white">TOTAL A PAGAR:</span>
                            <span class="fs-4 fw-bold text-success font-mono" id="txtTotalPagar">R$ 0,00</span>
                        </div>
                    </div>

                    <!-- Forma de Pagamento -->
                    <div class="mb-3">
                        <label class="form-label small text-secondary fw-bold">FORMA DE PAGAMENTO</label>
                        <select name="forma_pagamento" id="selectFormaPagamento" class="form-select bg-dark text-white mb-2" onchange="ajustarPagamento(this.value)">
                            <option value="PIX">⚡ PIX (Instantâneo)</option>
                            <option value="DINHEIRO">💵 Dinheiro (com cálculo de troco)</option>
                            <option value="CARTAO_CREDITO">💳 Cartão de Crédito</option>
                            <option value="CARTAO_DEBITO">💳 Cartão de Débito</option>
                            <option value="BOLETO">📄 Boleto / Faturado (28 DDL)</option>
                        </select>
                        <input type="text" name="detalhe_pagamento" id="inputDetalhePagamento" class="form-control form-control-sm bg-dark text-white" placeholder="Detalhes (ex: PIX Chave CNPJ)">
                    </div>

                    <!-- Campo Dinheiro / Troco -->
                    <div id="boxDinheiro" class="bg-dark p-2 rounded mb-3 d-none">
                        <div class="d-flex justify-content-between align-items-center mb-1">
                            <small class="text-secondary">Valor Recebido (R$):</small>
                            <input type="number" step="0.01" name="valor_recebido" id="inputValorRecebido" class="form-control form-control-sm bg-dark text-white text-end font-mono" style="width: 110px;" oninput="calcularTroco()">
                        </div>
                        <div class="d-flex justify-content-between align-items-center">
                            <small class="text-warning fw-bold">TROCO:</small>
                            <span class="fw-bold text-success font-mono" id="txtTroco">R$ 0,00</span>
                        </div>
                    </div>

                    <!-- Botão Finalizar -->
                    <button type="submit" class="btn btn-gold w-full py-2 fw-bold text-uppercase fs-6">
                        <i class="fa-solid fa-check-circle me-1"></i> Finalizar Venda & Baixar Estoque
                    </button>
                </div>
            </div>
        </div>
    </form>
</div>

<script>
let carrinhoItens = [];

function adicionarAoCarrinho(prod) {
    const idx = carrinhoItens.findIndex(i => i.codigo === prod.codigo);
    if (idx >= 0) {
        carrinhoItens[idx].quantidade += 1;
        carrinhoItens[idx].total = carrinhoItens[idx].quantidade * carrinhoItens[idx].preco;
    } else {
        carrinhoItens.push({
            id: prod.id,
            codigo: prod.codigo,
            descricao: prod.descricao,
            unidade: prod.unidade_medida || 'UN',
            quantidade: 1,
            preco: parseFloat(prod.preco_venda),
            total: parseFloat(prod.preco_venda)
        });
    }
    renderizarCarrinho();
}

function removerItem(index) {
    carrinhoItens.splice(index, 1);
    renderizarCarrinho();
}

function alterarQtd(index, novaQtd) {
    novaQtd = parseFloat(novaQtd) || 1;
    if (novaQtd <= 0) {
        removerItem(index);
        return;
    }
    carrinhoItens[index].quantidade = novaQtd;
    carrinhoItens[index].total = novaQtd * carrinhoItens[index].preco;
    renderizarCarrinho();
}

function renderizarCarrinho() {
    const tbody = document.getElementById('corpoCarrinho');
    tbody.innerHTML = '';

    carrinhoItens.forEach((it, idx) => {
        const tr = document.createElement('tr');
        tr.innerHTML = \`
            <td>
                <input type="hidden" name="item_produto_id[]" value="\${it.id}">
                <input type="hidden" name="item_codigo[]" value="\${it.codigo}">
                <input type="hidden" name="item_descricao[]" value="\${it.descricao}">
                <input type="hidden" name="item_unidade[]" value="\${it.unidade}">
                <input type="hidden" name="item_preco_unitario[]" value="\${it.preco}">
                <input type="hidden" name="item_valor_total[]" value="\${it.total.toFixed(2)}">
                <span class="text-warning fw-bold">\${it.codigo}</span>
                <div class="text-truncate text-secondary" style="max-width: 140px;">\${it.descricao}</div>
            </td>
            <td style="width: 70px;">
                <input type="number" min="1" step="1" name="item_quantidade[]" value="\${it.quantidade}" 
                    class="form-control form-control-sm bg-dark text-white p-1 text-center font-mono"
                    onchange="alterarQtd(\${idx}, this.value)">
            </td>
            <td class="text-success fw-bold text-end">
                R$ \${it.total.toFixed(2).replace('.', ',')}
            </td>
            <td class="text-end">
                <button type="button" class="btn btn-sm btn-link text-danger p-0" onclick="removerItem(\${idx})">
                    <i class="fa-solid fa-trash-can"></i>
                </button>
            </td>
        \`;
        tbody.appendChild(tr);
    });

    document.getElementById('contadorItensCarrinho').textContent = carrinhoItens.length + ' itens';
    calcularTotais();
}

function calcularTotais() {
    const subtotal = carrinhoItens.reduce((acc, it) => acc + it.total, 0);
    const desconto = parseFloat(document.getElementById('inputDesconto').value) || 0;
    const total = Math.max(0, subtotal - desconto);

    document.getElementById('txtSubtotal').textContent = 'R$ ' + subtotal.toFixed(2).replace('.', ',');
    document.getElementById('txtTotalPagar').textContent = 'R$ ' + total.toFixed(2).replace('.', ',');
    document.getElementById('inputSubtotal').value = subtotal.toFixed(2);
    document.getElementById('inputTotalGeral').value = total.toFixed(2);

    calcularTroco();
}

function ajustarPagamento(forma) {
    const boxDinheiro = document.getElementById('boxDinheiro');
    const inputDetalhe = document.getElementById('inputDetalhePagamento');

    if (forma === 'DINHEIRO') {
        boxDinheiro.classList.remove('d-none');
        inputDetalhe.value = 'Pagamento em Dinheiro';
    } else {
        boxDinheiro.classList.add('d-none');
        if (forma === 'PIX') inputDetalhe.value = 'PIX Chave CNPJ 52.148.963/0001-44';
        if (forma === 'CARTAO_CREDITO') inputDetalhe.value = 'Cartão de Crédito à Vista';
        if (forma === 'CARTAO_DEBITO') inputDetalhe.value = 'Cartão de Débito';
        if (forma === 'BOLETO') inputDetalhe.value = 'Boleto Faturado 28 DDL';
    }
}

function calcularTroco() {
    const total = parseFloat(document.getElementById('inputTotalGeral').value) || 0;
    const recebido = parseFloat(document.getElementById('inputValorRecebido')?.value) || 0;
    const troco = Math.max(0, recebido - total);

    const txtTroco = document.getElementById('txtTroco');
    if (txtTroco) {
        txtTroco.textContent = 'R$ ' + troco.toFixed(2).replace('.', ',');
        document.getElementById('inputTroco').value = troco.toFixed(2);
    }
}

function atualizarNomeCliente(select) {
    const selectedOption = select.options[select.selectedIndex];
    const inputNome = document.getElementById('inputClienteNome');
    const inputDoc = document.getElementById('inputClienteDoc');

    if (select.value === '') {
        inputNome.value = 'Consumidor Final / Venda Balcão';
        inputDoc.value = '';
    } else {
        inputNome.value = selectedOption.getAttribute('data-nome') || '';
        inputDoc.value = selectedOption.getAttribute('data-doc') || '';
    }
}
</script>

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
- **Barra Lateral Esquerda (Sidebar):** Fundo escuro \`#212529\`, logotipo oficial, menu retrátil com os módulos (*Pessoas, OS & Manutenção, Estoque, Compras, Financeiro, Fiscal, Relatórios, Acesso, Configurações, Ajuda*) e rodapé com perfil do operador \`ADM - MEDRADE\`.
- **Barra Superior (Topbar Ribbon):** Atalhos rápidos para Produtos, Compras, Caixa, NF-e, NFS-e, Receber, Pagar, Nova OS e Sair, além de sino de notificações.
- **Área Central (Workspace):** Logo oficial **MFx TECNOLOGIA** centralizado em destaque no modelo de capa do sistema.
- **Rodapé Inferior (Status Bar):** Versão 1.0.0, Data/Hora ao vivo, Licenciamento MFx Tecnologia Industrial (CNPJ: 34.375.789-0001/87), IP 192.168.1.105 e indicador verde de conexão \`● Internet ON\`.
`
  }
];

import React, { useState } from 'react';
import { Usuario, PerfilUsuario, PermissoesModulos } from '../types';

interface AcessoViewProps {
  usuarios: Usuario[];
  onAddUsuario: (usuario: Usuario) => void;
  onUpdateUsuario: (usuario: Usuario) => void;
  onDeleteUsuario: (id: string) => void;
  usuarioLogado: Usuario;
  onTrocarUsuarioLogado: (usuario: Usuario) => void;
  onAbrirLogin: () => void;
  onIrParaCodigoPhp: () => void;
}

export const AcessoView: React.FC<AcessoViewProps> = ({
  usuarios,
  onAddUsuario,
  onUpdateUsuario,
  onDeleteUsuario,
  usuarioLogado,
  onTrocarUsuarioLogado,
  onAbrirLogin,
  onIrParaCodigoPhp,
}) => {
  // Estados para filtros e busca
  const [busca, setBusca] = useState('');
  const [filtroPerfil, setFiltroPerfil] = useState<string>('todos');
  const [filtroStatus, setFiltroStatus] = useState<string>('todos');

  // Estados dos modais
  const [modalNovoAberto, setModalNovoAberto] = useState(false);
  const [modalSenhaAberto, setModalSenhaAberto] = useState(false);
  const [usuarioEmEdicao, setUsuarioEmEdicao] = useState<Usuario | null>(null);
  const [usuarioParaSenha, setUsuarioParaSenha] = useState<Usuario | null>(null);

  // Notificação toast
  const [toastMsg, setToastMsg] = useState<{ tipo: 'sucesso' | 'erro'; texto: string } | null>(null);

  const exibirToast = (texto: string, tipo: 'sucesso' | 'erro' = 'sucesso') => {
    setToastMsg({ tipo, texto });
    setTimeout(() => setToastMsg(null), 3500);
  };

  // Formulário de Cadastro / Edição
  const [formNome, setFormNome] = useState('');
  const [formLogin, setFormLogin] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formSenha, setFormSenha] = useState('admin123');
  const [formConfirmaSenha, setFormConfirmaSenha] = useState('admin123');
  const [formPerfil, setFormPerfil] = useState<PerfilUsuario>('Operador/Técnico');
  const [formStatus, setFormStatus] = useState<'Ativo' | 'Inativo'>('Ativo');
  const [formPermissoes, setFormPermissoes] = useState<PermissoesModulos>({
    clientes: true,
    os: true,
    estoque: true,
    compras: false,
    pdv: true,
    financeiro: false,
    fiscal: false,
    acesso: false,
  });

  // Formulário de Alteração de Senha
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmaNovaSenha, setConfirmaNovaSenha] = useState('');
  const [mostrarSenhas, setMostrarSenhas] = useState(false);

  // Aplicar template recomendado de permissões por perfil
  const aplicarTemplatePerfil = (perfil: PerfilUsuario) => {
    setFormPerfil(perfil);
    if (perfil === 'Administrador') {
      setFormPermissoes({
        clientes: true,
        os: true,
        estoque: true,
        compras: true,
        pdv: true,
        financeiro: true,
        fiscal: true,
        acesso: true,
      });
    } else if (perfil === 'Operador/Técnico') {
      setFormPermissoes({
        clientes: true,
        os: true,
        estoque: true,
        compras: false,
        pdv: true,
        financeiro: false,
        fiscal: false,
        acesso: false,
      });
    } else if (perfil === 'Vendas/Financeiro') {
      setFormPermissoes({
        clientes: true,
        os: false,
        estoque: true,
        compras: true,
        pdv: true,
        financeiro: true,
        fiscal: true,
        acesso: false,
      });
    }
  };

  const abrirModalNovo = () => {
    setUsuarioEmEdicao(null);
    setFormNome('');
    setFormLogin('');
    setFormEmail('');
    setFormSenha('admin123');
    setFormConfirmaSenha('admin123');
    aplicarTemplatePerfil('Operador/Técnico');
    setFormStatus('Ativo');
    setModalNovoAberto(true);
  };

  const abrirModalEditar = (u: Usuario) => {
    setUsuarioEmEdicao(u);
    setFormNome(u.nome);
    setFormLogin(u.login);
    setFormEmail(u.email);
    setFormSenha(u.senha || 'admin123');
    setFormConfirmaSenha(u.senha || 'admin123');
    setFormPerfil(u.perfil);
    setFormStatus(u.status);
    setFormPermissoes(u.permissoes);
    setModalNovoAberto(true);
  };

  const abrirModalSenha = (u: Usuario) => {
    setUsuarioParaSenha(u);
    setNovaSenha('');
    setConfirmaNovaSenha('');
    setModalSenhaAberto(true);
  };

  const handleSalvarUsuario = (e: React.FormEvent) => {
    e.preventDefault();

    if (!formNome.trim() || !formLogin.trim() || !formEmail.trim()) {
      exibirToast('Preencha os campos obrigatórios (Nome, Login e E-mail)!', 'erro');
      return;
    }

    if (!usuarioEmEdicao && formSenha !== formConfirmaSenha) {
      exibirToast('As senhas digitadas não conferem!', 'erro');
      return;
    }

    // Verificar login duplicado
    const loginJaExiste = usuarios.some(
      (u) =>
        u.login.toLowerCase() === formLogin.trim().toLowerCase() &&
        (!usuarioEmEdicao || u.id !== usuarioEmEdicao.id)
    );
    if (loginJaExiste) {
      exibirToast(`O login "${formLogin}" já está sendo utilizado por outro operador!`, 'erro');
      return;
    }

    if (usuarioEmEdicao) {
      // Atualizar
      const usuarioAtualizado: Usuario = {
        ...usuarioEmEdicao,
        nome: formNome.trim(),
        login: formLogin.trim().toLowerCase(),
        email: formEmail.trim().toLowerCase(),
        perfil: formPerfil,
        status: formStatus,
        permissoes: formPermissoes,
        senha: formSenha || usuarioEmEdicao.senha,
      };
      onUpdateUsuario(usuarioAtualizado);
      exibirToast(`Usuário "${usuarioAtualizado.nome}" atualizado com sucesso!`);
    } else {
      // Criar Novo
      const novoUsuario: Usuario = {
        id: `usr-${Date.now()}`,
        nome: formNome.trim(),
        login: formLogin.trim().toLowerCase(),
        email: formEmail.trim().toLowerCase(),
        senha: formSenha,
        perfil: formPerfil,
        status: formStatus,
        permissoes: formPermissoes,
        ultimoAcesso: 'Nunca acessou',
        dataCadastro: new Date().toISOString().split('T')[0],
      };
      onAddUsuario(novoUsuario);
      exibirToast(`Novo operador "${novoUsuario.nome}" cadastrado com sucesso!`);
    }

    setModalNovoAberto(false);
  };

  const handleSalvarNovaSenha = (e: React.FormEvent) => {
    e.preventDefault();
    if (!usuarioParaSenha) return;

    if (!novaSenha.trim()) {
      exibirToast('Informe a nova senha!', 'erro');
      return;
    }

    if (novaSenha !== confirmaNovaSenha) {
      exibirToast('A confirmação da senha não confere!', 'erro');
      return;
    }

    const usuarioAtualizado: Usuario = {
      ...usuarioParaSenha,
      senha: novaSenha.trim(),
    };
    onUpdateUsuario(usuarioAtualizado);
    exibirToast(`Senha do usuário ${usuarioAtualizado.login} alterada com sucesso!`);
    setModalSenhaAberto(false);
  };

  const handleToggleStatus = (u: Usuario) => {
    if (u.id === usuarioLogado.id && u.status === 'Ativo') {
      exibirToast('Você não pode desativar seu próprio usuário em sessão ativa!', 'erro');
      return;
    }
    const novoStatus = u.status === 'Ativo' ? 'Inativo' : 'Ativo';
    onUpdateUsuario({ ...u, status: novoStatus });
    exibirToast(`Status do usuário ${u.login} alterado para ${novoStatus}.`);
  };

  const handleExcluirUsuario = (u: Usuario) => {
    if (u.id === usuarioLogado.id) {
      exibirToast('Não é permitido excluir o usuário atualmente autenticado!', 'erro');
      return;
    }
    if (u.login === 'medrade') {
      exibirToast('O usuário administrador principal (medrade) não pode ser excluído!', 'erro');
      return;
    }
    if (confirm(`Confirma a exclusão definitiva do usuário "${u.nome}" (${u.login})? Esta ação não pode ser desfeita no banco mfx_sistema.`)) {
      onDeleteUsuario(u.id);
      exibirToast(`Usuário ${u.login} removido com sucesso.`);
    }
  };

  // Usuários filtrados
  const usuariosFiltrados = usuarios.filter((u) => {
    const matchBusca =
      u.nome.toLowerCase().includes(busca.toLowerCase()) ||
      u.login.toLowerCase().includes(busca.toLowerCase()) ||
      u.email.toLowerCase().includes(busca.toLowerCase());

    const matchPerfil = filtroPerfil === 'todos' || u.perfil === filtroPerfil;
    const matchStatus = filtroStatus === 'todos' || u.status === filtroStatus;

    return matchBusca && matchPerfil && matchStatus;
  });

  // Contadores
  const totalUsuarios = usuarios.length;
  const totalAdmins = usuarios.filter((u) => u.perfil === 'Administrador').length;
  const totalTecnicos = usuarios.filter((u) => u.perfil === 'Operador/Técnico').length;
  const totalVendas = usuarios.filter((u) => u.perfil === 'Vendas/Financeiro').length;

  return (
    <div className="space-y-5">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl text-xs font-semibold flex items-center gap-2 border transition ${
            toastMsg.tipo === 'sucesso'
              ? 'bg-slate-900 border-slate-700 text-slate-200'
              : 'bg-red-950/95 border-red-800 text-red-200'
          }`}
        >
          <i
            className={`fa-solid ${
              toastMsg.tipo === 'sucesso' ? 'fa-circle-check text-emerald-400' : 'fa-circle-xmark text-red-400'
            }`}
          ></i>
          <span>{toastMsg.texto}</span>
        </div>
      )}

      {/* 1. Cabeçalho Minimalista e Limpo */}
      <div className="bg-[#1c2128] rounded-xl p-5 border border-slate-800 shadow-sm flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            Gestão de Usuários
          </h1>
          <p className="text-xs text-slate-400 mt-1">
            Controle de operadores, acessos e permissões do sistema.
          </p>
        </div>

        {/* Ações do Topo */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onAbrirLogin}
            className="bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/80 font-medium px-3.5 py-2 rounded-lg text-xs flex items-center gap-2 transition cursor-pointer"
            title="Abrir tela completa de login"
          >
            <i className="fa-solid fa-arrow-right-to-bracket text-slate-400"></i>
            <span>Ver Tela de Login</span>
          </button>

          <button
            onClick={onIrParaCodigoPhp}
            className="bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700/80 font-medium px-3.5 py-2 rounded-lg text-xs flex items-center gap-2 transition cursor-pointer"
            title="Visualizar código-fonte PHP do sistema"
          >
            <i className="fa-solid fa-code text-slate-400"></i>
            <span>Código PHP</span>
          </button>

          <button
            onClick={abrirModalNovo}
            className="bg-red-600 hover:bg-red-500 text-white font-semibold px-4 py-2 rounded-lg text-xs flex items-center gap-2 shadow-sm transition cursor-pointer"
          >
            <i className="fa-solid fa-plus text-xs"></i>
            <span>Novo Usuário</span>
          </button>
        </div>
      </div>

      {/* 2. Cards de Estatísticas com Design Neutro e Sutil (4 colunas) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {/* Total Usuários */}
        <div className="bg-[#1c2128] p-4 rounded-xl border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
              Total de Usuários
            </div>
            <div className="text-2xl font-bold text-slate-100 font-mono mt-1">
              {totalUsuarios}
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-slate-800/70 border border-slate-700/60 text-slate-400 flex items-center justify-center text-sm">
            <i className="fa-solid fa-users"></i>
          </div>
        </div>

        {/* Administradores */}
        <div className="bg-[#1c2128] p-4 rounded-xl border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
              Administradores
            </div>
            <div className="text-2xl font-bold text-slate-100 font-mono mt-1">
              {totalAdmins}
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-slate-800/70 border border-slate-700/60 text-slate-400 flex items-center justify-center text-sm">
            <i className="fa-solid fa-shield-halved"></i>
          </div>
        </div>

        {/* Operadores / Técnicos */}
        <div className="bg-[#1c2128] p-4 rounded-xl border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
              Técnicos & OS
            </div>
            <div className="text-2xl font-bold text-slate-100 font-mono mt-1">
              {totalTecnicos}
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-slate-800/70 border border-slate-700/60 text-slate-400 flex items-center justify-center text-sm">
            <i className="fa-solid fa-screwdriver-wrench"></i>
          </div>
        </div>

        {/* Vendas & Balcão */}
        <div className="bg-[#1c2128] p-4 rounded-xl border border-slate-800 shadow-sm flex items-center justify-between">
          <div>
            <div className="text-[11px] font-medium text-slate-400 uppercase tracking-wide">
              Vendas & PDV
            </div>
            <div className="text-2xl font-bold text-slate-100 font-mono mt-1">
              {totalVendas}
            </div>
          </div>
          <div className="w-9 h-9 rounded-lg bg-slate-800/70 border border-slate-700/60 text-slate-400 flex items-center justify-center text-sm">
            <i className="fa-solid fa-cash-register"></i>
          </div>
        </div>
      </div>

      {/* 3. Filtros e Troca Rápida de Usuário */}
      <div className="bg-[#1c2128] p-3.5 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex-1 flex flex-col sm:flex-row gap-2.5 items-stretch sm:items-center">
          {/* Campo de Busca */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <i className="fa-solid fa-magnifying-glass text-xs"></i>
            </span>
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome, login ou e-mail..."
              className="w-full bg-[#111418] border border-slate-700/80 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-slate-500 transition"
            />
          </div>

          {/* Filtro Perfil */}
          <div className="sm:w-44">
            <select
              value={filtroPerfil}
              onChange={(e) => setFiltroPerfil(e.target.value)}
              className="w-full bg-[#111418] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-slate-500 transition cursor-pointer"
            >
              <option value="todos">Todos os Cargos</option>
              <option value="Administrador">Administrador</option>
              <option value="Operador/Técnico">Operador/Técnico</option>
              <option value="Vendas/Financeiro">Vendas/Financeiro</option>
            </select>
          </div>

          {/* Filtro Status */}
          <div className="sm:w-36">
            <select
              value={filtroStatus}
              onChange={(e) => setFiltroStatus(e.target.value)}
              className="w-full bg-[#111418] border border-slate-700/80 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-slate-500 transition cursor-pointer"
            >
              <option value="todos">Todos os Status</option>
              <option value="Ativo">Apenas Ativos</option>
              <option value="Inativo">Apenas Inativos</option>
            </select>
          </div>
        </div>

        {/* Troca Rápida de Sessão Simulada */}
        <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
          <span className="text-[11px] text-slate-400 font-medium uppercase whitespace-nowrap">
            Simular acesso:
          </span>
          <select
            value={usuarioLogado.id}
            onChange={(e) => {
              const u = usuarios.find((item) => item.id === e.target.value);
              if (u) {
                onTrocarUsuarioLogado(u);
                exibirToast(`Sessão alternada para: ${u.nome} (${u.perfil})`);
              }
            }}
            className="bg-[#111418] border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-slate-200 font-mono focus:outline-none focus:border-slate-500 cursor-pointer"
          >
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.login} - {u.perfil} {u.id === usuarioLogado.id ? '(Ativo)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 4. Tabela de Usuários Limpa e Espaçada */}
      <div className="bg-[#1c2128] rounded-xl border border-slate-800 shadow-sm overflow-hidden">
        <div className="px-5 py-3 border-b border-slate-800/80 bg-[#161b22] flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
            Operadores Cadastrados
          </span>
          <span className="text-[11px] font-mono text-slate-400">
            {usuariosFiltrados.length} {usuariosFiltrados.length === 1 ? 'registro' : 'registros'}
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111418] text-slate-400 uppercase text-[10px] font-semibold tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4">Operador</th>
                <th className="py-3.5 px-4">E-mail Corporativo</th>
                <th className="py-3.5 px-4">Cargo / Perfil</th>
                <th className="py-3.5 px-4">Permissões</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4">Último Acesso</th>
                <th className="py-3.5 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-10 text-center text-slate-500">
                    <i className="fa-solid fa-user-slash text-xl mb-2 block text-slate-600"></i>
                    Nenhum usuário encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                usuariosFiltrados.map((u) => {
                  const isSessaoAtual = u.id === usuarioLogado.id;

                  // Quantidade de permissões ativas
                  const modulosAtivos = Object.entries(u.permissoes).filter(([_, v]) => v);
                  const isTotal = modulosAtivos.length === 8;

                  // Iniciais
                  const iniciais = u.nome
                    .split(' ')
                    .map((n) => n[0])
                    .slice(0, 2)
                    .join('')
                    .toUpperCase();

                  return (
                    <tr
                      key={u.id}
                      className={`hover:bg-slate-800/30 transition ${
                        isSessaoAtual ? 'bg-slate-800/20' : ''
                      }`}
                    >
                      {/* Usuário / Operador */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-lg bg-slate-800 border border-slate-700/80 text-slate-300 flex items-center justify-center font-bold text-xs shrink-0">
                            {iniciais}
                          </div>
                          <div>
                            <div className="font-semibold text-slate-100 flex items-center gap-1.5">
                              <span>{u.nome}</span>
                              {isSessaoAtual && (
                                <span className="text-[10px] text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded font-mono font-medium">
                                  (Você)
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-mono text-slate-400">
                              @{u.login}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* E-mail */}
                      <td className="py-3.5 px-4 text-slate-300 text-xs font-mono">
                        {u.email}
                      </td>

                      {/* Cargo / Perfil - Badge Neutro e Padronizado */}
                      <td className="py-3.5 px-4">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-800 text-slate-300 border border-slate-700/60 font-mono">
                          <i className="fa-solid fa-user-gear text-[10px] text-slate-400"></i>
                          {u.perfil}
                        </span>
                      </td>

                      {/* Permissões - Substituído por texto/badge discreto */}
                      <td className="py-3.5 px-4">
                        {isTotal ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-800/90 text-slate-200 border border-slate-700/60">
                            <i className="fa-solid fa-check text-[10px] text-emerald-400"></i>
                            Acesso Total
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium bg-slate-800/50 text-slate-400 border border-slate-700/50">
                            Acesso Personalizado ({modulosAtivos.length} módulos)
                          </span>
                        )}
                      </td>

                      {/* Status - Indicador Sutil e Limpo */}
                      <td className="py-3.5 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(u)}
                          className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-[11px] font-medium border border-slate-700/60 hover:bg-slate-800 transition cursor-pointer"
                          title={`Clique para ${u.status === 'Ativo' ? 'Desativar' : 'Ativar'}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              u.status === 'Ativo' ? 'bg-emerald-400' : 'bg-slate-500'
                            }`}
                          ></span>
                          <span className={u.status === 'Ativo' ? 'text-slate-300' : 'text-slate-500'}>
                            {u.status}
                          </span>
                        </button>
                      </td>

                      {/* Último Acesso */}
                      <td className="py-3.5 px-4 text-slate-400 font-mono text-[11px]">
                        {u.ultimoAcesso || 'Nunca'}
                      </td>

                      {/* Ações */}
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Alterar Senha */}
                          <button
                            type="button"
                            onClick={() => abrirModalSenha(u)}
                            className="w-7 h-7 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700/70 flex items-center justify-center transition cursor-pointer"
                            title="Alterar Senha"
                          >
                            <i className="fa-solid fa-key text-xs"></i>
                          </button>

                          {/* Editar */}
                          <button
                            type="button"
                            onClick={() => abrirModalEditar(u)}
                            className="w-7 h-7 rounded-md bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-slate-200 border border-slate-700/70 flex items-center justify-center transition cursor-pointer"
                            title="Editar Usuário"
                          >
                            <i className="fa-solid fa-pen-to-square text-xs"></i>
                          </button>

                          {/* Excluir */}
                          <button
                            type="button"
                            onClick={() => handleExcluirUsuario(u)}
                            disabled={u.login === 'medrade' || isSessaoAtual}
                            className={`w-7 h-7 rounded-md flex items-center justify-center border transition ${
                              u.login === 'medrade' || isSessaoAtual
                                ? 'bg-slate-800/30 text-slate-600 border-slate-800 cursor-not-allowed'
                                : 'bg-slate-800/80 hover:bg-red-950/60 text-slate-400 hover:text-red-400 border-slate-700/70 hover:border-red-900 cursor-pointer'
                            }`}
                            title={
                              u.login === 'medrade'
                                ? 'Administrador principal não pode ser excluído'
                                : isSessaoAtual
                                ? 'Não é possível excluir o usuário em sessão ativa'
                                : 'Excluir usuário'
                            }
                          >
                            <i className="fa-solid fa-trash-can text-xs"></i>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ========================================================
          MODAL: CADASTRAR / EDITAR USUÁRIO & PERMISSÕES
         ======================================================== */}
      {modalNovoAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs overflow-y-auto">
          <div className="bg-[#1c2128] border border-slate-700 rounded-xl shadow-2xl max-w-2xl w-full p-6 text-white my-8 relative overflow-hidden">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-base text-white">
                  {usuarioEmEdicao ? 'Editar Usuário & Permissões' : 'Cadastrar Novo Usuário'}
                </h3>
                <span className="text-xs text-slate-400">
                  Defina os dados de identificação e permissões de acesso
                </span>
              </div>

              <button
                type="button"
                onClick={() => setModalNovoAberto(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleSalvarUsuario} className="mt-5 space-y-4">
              {/* Linha 1: Nome Completo & Login */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wide">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formNome}
                    onChange={(e) => setFormNome(e.target.value)}
                    placeholder="Ex: Carlos Eduardo Silveira"
                    className="w-full bg-[#111418] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wide">
                    Login de Usuário *
                  </label>
                  <input
                    type="text"
                    required
                    value={formLogin}
                    onChange={(e) => setFormLogin(e.target.value)}
                    placeholder="Ex: carlos.laser"
                    className="w-full bg-[#111418] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-slate-500"
                  />
                </div>
              </div>

              {/* Linha 2: E-mail Corporativo & Cargo/Perfil */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wide">
                    E-mail Corporativo *
                  </label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="carlos@mfxindustrial.com.br"
                    className="w-full bg-[#111418] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-slate-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wide">
                    Cargo / Perfil de Acesso *
                  </label>
                  <select
                    value={formPerfil}
                    onChange={(e) => aplicarTemplatePerfil(e.target.value as PerfilUsuario)}
                    className="w-full bg-[#111418] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-200 font-medium focus:outline-none focus:border-slate-500 cursor-pointer"
                  >
                    <option value="Administrador">Administrador Geral</option>
                    <option value="Operador/Técnico">Operador / Técnico (Laser/Plasma)</option>
                    <option value="Vendas/Financeiro">Vendas / Balcão / Financeiro</option>
                  </select>
                </div>
              </div>

              {/* Linha 3: Senha Inicial (apenas no cadastro novo) */}
              {!usuarioEmEdicao && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#111418] rounded-xl border border-slate-800">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wide">
                      Senha Inicial *
                    </label>
                    <input
                      type="password"
                      required
                      value={formSenha}
                      onChange={(e) => setFormSenha(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full bg-[#161b22] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-slate-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase tracking-wide">
                      Confirmar Senha *
                    </label>
                    <input
                      type="password"
                      required
                      value={formConfirmaSenha}
                      onChange={(e) => setFormConfirmaSenha(e.target.value)}
                      placeholder="Repita a senha"
                      className="w-full bg-[#161b22] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-slate-500"
                    />
                  </div>
                </div>
              )}

              {/* Status */}
              <div className="flex items-center gap-4">
                <span className="text-xs font-semibold text-slate-300 uppercase">Status da Conta:</span>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                  <input
                    type="radio"
                    name="formStatus"
                    value="Ativo"
                    checked={formStatus === 'Ativo'}
                    onChange={() => setFormStatus('Ativo')}
                    className="text-emerald-500 focus:ring-emerald-500 cursor-pointer"
                  />
                  <span className="text-slate-200 font-medium">Ativo</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                  <input
                    type="radio"
                    name="formStatus"
                    value="Inativo"
                    checked={formStatus === 'Inativo'}
                    onChange={() => setFormStatus('Inativo')}
                    className="text-slate-500 focus:ring-slate-500 cursor-pointer"
                  />
                  <span className="text-slate-400">Inativo</span>
                </label>
              </div>

              {/* Matriz de Permissões Modulares */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-semibold text-slate-200 uppercase tracking-wide">
                    Permissões por Módulo do ERP
                  </label>

                  <div className="flex items-center gap-1 text-[11px]">
                    <button
                      type="button"
                      onClick={() =>
                        setFormPermissoes({
                          clientes: true,
                          os: true,
                          estoque: true,
                          compras: true,
                          pdv: true,
                          financeiro: true,
                          fiscal: true,
                          acesso: true,
                        })
                      }
                      className="text-slate-300 hover:text-white hover:underline px-1 cursor-pointer"
                    >
                      Marcar Todos
                    </button>
                    <span className="text-slate-600">•</span>
                    <button
                      type="button"
                      onClick={() =>
                        setFormPermissoes({
                          clientes: false,
                          os: false,
                          estoque: false,
                          compras: false,
                          pdv: false,
                          financeiro: false,
                          fiscal: false,
                          acesso: false,
                        })
                      }
                      className="text-slate-400 hover:text-slate-200 hover:underline px-1 cursor-pointer"
                    >
                      Desmarcar Todos
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[#111418] p-3 rounded-xl border border-slate-800">
                  {/* Clientes */}
                  <label className="flex items-center justify-between p-2 rounded-lg bg-[#161b22] border border-slate-800 hover:border-slate-700 cursor-pointer transition">
                    <span className="text-xs text-slate-300">Clientes & Fornecedores</span>
                    <input
                      type="checkbox"
                      checked={formPermissoes.clientes}
                      onChange={(e) =>
                        setFormPermissoes({ ...formPermissoes, clientes: e.target.checked })
                      }
                      className="rounded border-slate-700 bg-slate-900 text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
                    />
                  </label>

                  {/* OS */}
                  <label className="flex items-center justify-between p-2 rounded-lg bg-[#161b22] border border-slate-800 hover:border-slate-700 cursor-pointer transition">
                    <span className="text-xs text-slate-300">Ordens de Serviço (OS)</span>
                    <input
                      type="checkbox"
                      checked={formPermissoes.os}
                      onChange={(e) =>
                        setFormPermissoes({ ...formPermissoes, os: e.target.checked })
                      }
                      className="rounded border-slate-700 bg-slate-900 text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
                    />
                  </label>

                  {/* Estoque */}
                  <label className="flex items-center justify-between p-2 rounded-lg bg-[#161b22] border border-slate-800 hover:border-slate-700 cursor-pointer transition">
                    <span className="text-xs text-slate-300">Estoque & Consumíveis</span>
                    <input
                      type="checkbox"
                      checked={formPermissoes.estoque}
                      onChange={(e) =>
                        setFormPermissoes({ ...formPermissoes, estoque: e.target.checked })
                      }
                      className="rounded border-slate-700 bg-slate-900 text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
                    />
                  </label>

                  {/* Compras */}
                  <label className="flex items-center justify-between p-2 rounded-lg bg-[#161b22] border border-slate-800 hover:border-slate-700 cursor-pointer transition">
                    <span className="text-xs text-slate-300">Compras & Entrada</span>
                    <input
                      type="checkbox"
                      checked={formPermissoes.compras}
                      onChange={(e) =>
                        setFormPermissoes({ ...formPermissoes, compras: e.target.checked })
                      }
                      className="rounded border-slate-700 bg-slate-900 text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
                    />
                  </label>

                  {/* PDV */}
                  <label className="flex items-center justify-between p-2 rounded-lg bg-[#161b22] border border-slate-800 hover:border-slate-700 cursor-pointer transition">
                    <span className="text-xs text-slate-300">PDV - Vendas Balcão</span>
                    <input
                      type="checkbox"
                      checked={formPermissoes.pdv}
                      onChange={(e) =>
                        setFormPermissoes({ ...formPermissoes, pdv: e.target.checked })
                      }
                      className="rounded border-slate-700 bg-slate-900 text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
                    />
                  </label>

                  {/* Financeiro */}
                  <label className="flex items-center justify-between p-2 rounded-lg bg-[#161b22] border border-slate-800 hover:border-slate-700 cursor-pointer transition">
                    <span className="text-xs text-slate-300">Financeiro & Caixa</span>
                    <input
                      type="checkbox"
                      checked={formPermissoes.financeiro}
                      onChange={(e) =>
                        setFormPermissoes({ ...formPermissoes, financeiro: e.target.checked })
                      }
                      className="rounded border-slate-700 bg-slate-900 text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
                    />
                  </label>

                  {/* Fiscal */}
                  <label className="flex items-center justify-between p-2 rounded-lg bg-[#161b22] border border-slate-800 hover:border-slate-700 cursor-pointer transition">
                    <span className="text-xs text-slate-300">Fiscal (NF-e / NFS-e)</span>
                    <input
                      type="checkbox"
                      checked={formPermissoes.fiscal}
                      onChange={(e) =>
                        setFormPermissoes({ ...formPermissoes, fiscal: e.target.checked })
                      }
                      className="rounded border-slate-700 bg-slate-900 text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
                    />
                  </label>

                  {/* Acesso */}
                  <label className="flex items-center justify-between p-2 rounded-lg bg-[#161b22] border border-slate-800 hover:border-slate-700 cursor-pointer transition">
                    <span className="text-xs text-slate-300">Gestão de Acessos</span>
                    <input
                      type="checkbox"
                      checked={formPermissoes.acesso}
                      onChange={(e) =>
                        setFormPermissoes({ ...formPermissoes, acesso: e.target.checked })
                      }
                      className="rounded border-slate-700 bg-slate-900 text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
                    />
                  </label>
                </div>
              </div>

              {/* Botões do Rodapé do Modal */}
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setModalNovoAberto(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium transition cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  {usuarioEmEdicao ? 'Salvar Alterações' : 'Cadastrar Usuário'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================
          MODAL: ALTERAR SENHA DO USUÁRIO
         ======================================================== */}
      {modalSenhaAberto && usuarioParaSenha && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-xs">
          <div className="bg-[#1c2128] border border-slate-700 rounded-xl shadow-2xl max-w-md w-full p-5 text-white">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="font-bold text-sm text-white">Alterar Senha de Acesso</h3>
                <span className="text-[11px] text-slate-400 font-mono">
                  {usuarioParaSenha.login} ({usuarioParaSenha.nome})
                </span>
              </div>
              <button
                type="button"
                onClick={() => setModalSenhaAberto(false)}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleSalvarNovaSenha} className="mt-4 space-y-3.5">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase">
                  Nova Senha *
                </label>
                <input
                  type={mostrarSenhas ? 'text' : 'password'}
                  required
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="Digite a nova senha"
                  className="w-full bg-[#111418] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-slate-500"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1 uppercase">
                  Confirmar Nova Senha *
                </label>
                <input
                  type={mostrarSenhas ? 'text' : 'password'}
                  required
                  value={confirmaNovaSenha}
                  onChange={(e) => setConfirmaNovaSenha(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="w-full bg-[#111418] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-slate-500"
                />
              </div>

              <div className="flex items-center justify-between text-[11px]">
                <button
                  type="button"
                  onClick={() => setMostrarSenhas(!mostrarSenhas)}
                  className="text-slate-400 hover:text-slate-200 flex items-center gap-1.5 cursor-pointer"
                >
                  <i className={`fa-solid ${mostrarSenhas ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  <span>{mostrarSenhas ? 'Ocultar' : 'Exibir senhas'}</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setNovaSenha('admin123');
                    setConfirmaNovaSenha('admin123');
                  }}
                  className="text-slate-400 hover:text-slate-200 hover:underline font-mono cursor-pointer"
                >
                  Usar "admin123"
                </button>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalSenhaAberto(false)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-red-600 hover:bg-red-500 text-white rounded-lg text-xs font-semibold transition cursor-pointer"
                >
                  Confirmar Nova Senha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

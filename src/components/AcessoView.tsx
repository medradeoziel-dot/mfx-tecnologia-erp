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
  const totalAtivos = usuarios.filter((u) => u.status === 'Ativo').length;

  return (
    <div className="space-y-6">
      {/* Toast Notification */}
      {toastMsg && (
        <div
          className={`fixed bottom-6 right-6 z-50 px-4 py-3 rounded-xl shadow-2xl text-xs font-bold flex items-center gap-2 border transition transform animate-bounce ${
            toastMsg.tipo === 'sucesso'
              ? 'bg-emerald-950/95 border-emerald-600 text-emerald-200'
              : 'bg-red-950/95 border-red-600 text-red-200'
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

      {/* Cabeçalho do Módulo de Acesso */}
      <div className="bg-[#1c2128] rounded-xl p-5 sm:p-6 border border-slate-700 shadow-md flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="text-xs font-bold font-mono uppercase bg-red-950/80 text-red-400 border border-red-800/60 px-2 py-0.5 rounded">
              Módulo: Acesso & Permissões
            </span>
            <span className="text-xs text-slate-400 font-mono">
              acesso.php • Banco: mfx_sistema
            </span>
            <span className="text-xs text-slate-500 font-medium">| MFx Tecnologia Industrial</span>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight flex items-center gap-2.5">
            <i className="fa-solid fa-user-shield text-red-500"></i>
            Gestão de Acessos, Usuários & Permissões
          </h1>
          <p className="text-xs sm:text-sm text-slate-400 mt-1">
            Cadastre funcionários e operadores técnicos com restrições granulares por módulo (Clientes, OS, Estoque, Compras, PDV, Financeiro, Fiscal).
          </p>
        </div>

        {/* Ações do Topo */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <button
            onClick={onAbrirLogin}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-bold px-3.5 py-2.5 rounded-lg text-xs flex items-center gap-2 transition"
            title="Abrir tela completa de login (login.php)"
          >
            <i className="fa-solid fa-arrow-right-to-bracket text-red-400"></i>
            <span>Ver Tela de Login</span>
          </button>

          <button
            onClick={onIrParaCodigoPhp}
            className="bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-600 font-bold px-3.5 py-2.5 rounded-lg text-xs flex items-center gap-2 transition"
            title="Visualizar código acesso.php e login.php"
          >
            <i className="fa-solid fa-code text-emerald-400"></i>
            <span>Código PHP</span>
          </button>

          <button
            onClick={abrirModalNovo}
            className="bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold px-4 py-2.5 rounded-lg text-xs flex items-center gap-2 shadow-lg shadow-red-950/50 transition cursor-pointer"
          >
            <i className="fa-solid fa-user-plus text-sm"></i>
            <span>+ Novo Usuário / Operador</span>
          </button>
        </div>
      </div>

      {/* Cards de Métricas e Sessão Ativa */}
      <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
        {/* Total Usuários */}
        <div className="bg-[#1c2128] p-4 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
              Total Usuários
            </span>
            <div className="w-7 h-7 rounded-lg bg-blue-500/10 border border-blue-500/20 text-blue-400 flex items-center justify-center text-xs">
              <i className="fa-solid fa-users"></i>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-white font-mono">{totalUsuarios}</span>
            <span className="text-[11px] text-slate-500 ml-1.5 font-medium">cadastrados</span>
          </div>
        </div>

        {/* Administradores */}
        <div className="bg-[#1c2128] p-4 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
              Administradores
            </span>
            <div className="w-7 h-7 rounded-lg bg-red-500/10 border border-red-500/20 text-red-400 flex items-center justify-center text-xs">
              <i className="fa-solid fa-shield-halved"></i>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-red-400 font-mono">{totalAdmins}</span>
            <span className="text-[11px] text-slate-500 ml-1.5 font-medium">total acesso</span>
          </div>
        </div>

        {/* Operadores / Técnicos */}
        <div className="bg-[#1c2128] p-4 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
              Técnicos & OS
            </span>
            <div className="w-7 h-7 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center text-xs">
              <i className="fa-solid fa-screwdriver-wrench"></i>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-amber-400 font-mono">{totalTecnicos}</span>
            <span className="text-[11px] text-slate-500 ml-1.5 font-medium">em campo</span>
          </div>
        </div>

        {/* Vendas & Balcão */}
        <div className="bg-[#1c2128] p-4 rounded-xl border border-slate-800 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wide">
              Vendas & PDV
            </span>
            <div className="w-7 h-7 rounded-lg bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 flex items-center justify-center text-xs">
              <i className="fa-solid fa-cash-register"></i>
            </div>
          </div>
          <div className="mt-2">
            <span className="text-2xl font-black text-emerald-400 font-mono">{totalVendas}</span>
            <span className="text-[11px] text-slate-500 ml-1.5 font-medium">balcão / caixa</span>
          </div>
        </div>

        {/* Sessão Ativa Atual */}
        <div className="col-span-2 sm:col-span-2 lg:col-span-1 bg-gradient-to-br from-[#1c2128] to-[#252b36] p-4 rounded-xl border border-red-500/30 shadow-sm flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-bold text-red-400 uppercase tracking-wider flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              Sessão Ativa
            </span>
            <span className="text-[10px] bg-red-950 text-red-300 font-mono font-bold px-1.5 py-0.5 rounded border border-red-800/50">
              PHP SESSION
            </span>
          </div>
          <div className="mt-2">
            <div className="text-xs font-bold text-white truncate">{usuarioLogado.nome}</div>
            <div className="text-[10px] text-slate-400 font-mono flex items-center justify-between mt-0.5">
              <span>Login: {usuarioLogado.login}</span>
              <span className="text-amber-400">{usuarioLogado.perfil}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Barra de Filtros, Busca e Troca Rápida de Usuário */}
      <div className="bg-[#1c2128] p-4 rounded-xl border border-slate-800 flex flex-col md:flex-row gap-3 items-stretch md:items-center justify-between">
        <div className="flex-1 flex flex-col sm:flex-row gap-3 items-stretch sm:items-center">
          {/* Campo de Busca */}
          <div className="relative flex-1">
            <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
              <i className="fa-solid fa-magnifying-glass text-xs"></i>
            </span>
            <input
              type="text"
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              placeholder="Buscar por nome, login ou e-mail corporativo..."
              className="w-full bg-[#111418] border border-slate-700 rounded-lg pl-9 pr-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 transition"
            />
          </div>

          {/* Filtro Perfil */}
          <div className="sm:w-48">
            <select
              value={filtroPerfil}
              onChange={(e) => setFiltroPerfil(e.target.value)}
              className="w-full bg-[#111418] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-red-500 transition cursor-pointer"
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
              className="w-full bg-[#111418] border border-slate-700 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-red-500 transition cursor-pointer"
            >
              <option value="todos">Todos Status</option>
              <option value="Ativo">Apenas Ativos</option>
              <option value="Inativo">Apenas Inativos</option>
            </select>
          </div>
        </div>

        {/* Troca Rápida de Sessão Simulada */}
        <div className="flex items-center gap-2 shrink-0 pt-2 md:pt-0 border-t md:border-t-0 border-slate-800">
          <span className="text-[11px] text-slate-400 font-bold uppercase whitespace-nowrap">
            Simular Acesso Como:
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
            className="bg-[#111418] border border-red-500/50 rounded-lg px-2.5 py-1.5 text-xs text-amber-300 font-mono font-bold focus:outline-none focus:border-red-500 cursor-pointer"
          >
            {usuarios.map((u) => (
              <option key={u.id} value={u.id}>
                {u.login} - {u.perfil} {u.id === usuarioLogado.id ? '(Ativo)' : ''}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabela de Usuários e Permissões */}
      <div className="bg-[#1c2128] rounded-xl border border-slate-800 shadow-md overflow-hidden">
        <div className="px-5 py-3.5 border-b border-slate-800 bg-[#161b22] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <i className="fa-solid fa-list-check text-red-500 text-xs"></i>
            <span className="text-xs font-bold text-white uppercase tracking-wider">
              Usuários e Operadores Cadastrados no Sistema
            </span>
          </div>
          <span className="text-[11px] font-mono text-slate-400">
            Exibindo {usuariosFiltrados.length} de {usuarios.length} registros
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-[#111418] text-slate-400 uppercase text-[10px] font-bold tracking-wider border-b border-slate-800">
              <tr>
                <th className="py-3 px-4">Usuário / Operador</th>
                <th className="py-3 px-4">E-mail Corporativo</th>
                <th className="py-3 px-4">Cargo / Perfil</th>
                <th className="py-3 px-4">Permissões nos Módulos</th>
                <th className="py-3 px-4 text-center">Status</th>
                <th className="py-3 px-4">Último Acesso</th>
                <th className="py-3 px-4 text-right">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/80">
              {usuariosFiltrados.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-slate-500">
                    <i className="fa-solid fa-user-slash text-2xl mb-2 block text-slate-600"></i>
                    Nenhum usuário encontrado com os filtros selecionados.
                  </td>
                </tr>
              ) : (
                usuariosFiltrados.map((u) => {
                  const isAdmin = u.perfil === 'Administrador';
                  const isTecnico = u.perfil === 'Operador/Técnico';
                  const isVendas = u.perfil === 'Vendas/Financeiro';
                  const isSessaoAtual = u.id === usuarioLogado.id;

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
                      className={`hover:bg-[#21262d]/70 transition ${
                        isSessaoAtual ? 'bg-red-950/20 border-l-2 border-red-500' : ''
                      }`}
                    >
                      {/* Usuário / Operador */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs shrink-0 ${
                              isAdmin
                                ? 'bg-red-500/20 text-red-400 border border-red-500/40'
                                : isTecnico
                                ? 'bg-amber-500/20 text-amber-400 border border-amber-500/40'
                                : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                            }`}
                          >
                            {iniciais}
                          </div>
                          <div>
                            <div className="font-bold text-white flex items-center gap-1.5">
                              <span>{u.nome}</span>
                              {isSessaoAtual && (
                                <span className="text-[9px] bg-red-600 text-white font-mono font-bold px-1.5 py-0.2 rounded-full">
                                  VOCÊ
                                </span>
                              )}
                            </div>
                            <div className="text-[11px] font-mono text-slate-400">
                              login: <strong className="text-slate-300">{u.login}</strong>
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* E-mail */}
                      <td className="py-3 px-4 font-mono text-slate-300 text-[11px]">
                        {u.email}
                      </td>

                      {/* Cargo / Perfil */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[10px] font-bold font-mono uppercase border ${
                            isAdmin
                              ? 'bg-red-950/80 text-red-300 border-red-800'
                              : isTecnico
                              ? 'bg-amber-950/80 text-amber-300 border-amber-800'
                              : 'bg-emerald-950/80 text-emerald-300 border-emerald-800'
                          }`}
                        >
                          <i
                            className={`fa-solid ${
                              isAdmin
                                ? 'fa-shield'
                                : isTecnico
                                ? 'fa-wrench'
                                : 'fa-receipt'
                            } text-[9px]`}
                          ></i>
                          {u.perfil}
                        </span>
                      </td>

                      {/* Permissões nos Módulos */}
                      <td className="py-3 px-4">
                        <div className="flex flex-wrap gap-1 max-w-xs">
                          {u.permissoes.clientes && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-950/80 text-blue-300 border border-blue-900/60" title="Clientes & Fornecedores">
                              Clientes
                            </span>
                          )}
                          {u.permissoes.os && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-red-950/80 text-red-300 border border-red-900/60" title="Ordens de Serviço">
                              OS
                            </span>
                          )}
                          {u.permissoes.estoque && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-950/80 text-amber-300 border border-amber-900/60" title="Estoque & Consumíveis">
                              Estoque
                            </span>
                          )}
                          {u.permissoes.compras && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-900/60" title="Compras & NF Entrada">
                              Compras
                            </span>
                          )}
                          {u.permissoes.pdv && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-950/80 text-amber-300 border border-amber-900/60" title="PDV - Vendas Balcão">
                              PDV
                            </span>
                          )}
                          {u.permissoes.financeiro && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-emerald-950/80 text-emerald-300 border border-emerald-900/60" title="Financeiro & Caixa">
                              Financeiro
                            </span>
                          )}
                          {u.permissoes.fiscal && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-indigo-950/80 text-indigo-300 border border-indigo-900/60" title="Fiscal (NF-e/NFS-e)">
                              Fiscal
                            </span>
                          )}
                          {u.permissoes.acesso && (
                            <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-purple-950/80 text-purple-300 border border-purple-900/60" title="Gestão de Acessos">
                              Acesso
                            </span>
                          )}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3 px-4 text-center">
                        <button
                          type="button"
                          onClick={() => handleToggleStatus(u)}
                          className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold border transition ${
                            u.status === 'Ativo'
                              ? 'bg-emerald-950/60 text-emerald-400 border-emerald-800 hover:bg-emerald-900/60'
                              : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
                          }`}
                          title={`Clique para ${u.status === 'Ativo' ? 'Desativar' : 'Ativar'}`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              u.status === 'Ativo' ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'
                            }`}
                          ></span>
                          <span>{u.status}</span>
                        </button>
                      </td>

                      {/* Último Acesso */}
                      <td className="py-3 px-4 text-slate-400 font-mono text-[11px]">
                        {u.ultimoAcesso || 'Nunca'}
                      </td>

                      {/* Ações */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Alterar Senha */}
                          <button
                            type="button"
                            onClick={() => abrirModalSenha(u)}
                            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-amber-400 border border-slate-700 flex items-center justify-center transition"
                            title="Alterar Senha do Usuário"
                          >
                            <i className="fa-solid fa-key text-xs"></i>
                          </button>

                          {/* Editar Usuário & Permissões */}
                          <button
                            type="button"
                            onClick={() => abrirModalEditar(u)}
                            className="w-7 h-7 rounded-lg bg-slate-800 hover:bg-slate-700 text-blue-400 border border-slate-700 flex items-center justify-center transition"
                            title="Editar Dados e Permissões"
                          >
                            <i className="fa-solid fa-pen-to-square text-xs"></i>
                          </button>

                          {/* Excluir Usuário */}
                          <button
                            type="button"
                            onClick={() => handleExcluirUsuario(u)}
                            disabled={u.login === 'medrade' || isSessaoAtual}
                            className={`w-7 h-7 rounded-lg flex items-center justify-center border transition ${
                              u.login === 'medrade' || isSessaoAtual
                                ? 'bg-slate-800/40 text-slate-600 border-slate-800 cursor-not-allowed'
                                : 'bg-slate-800 hover:bg-red-950/70 text-red-400 border-slate-700 hover:border-red-800'
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

      {/* Informativo de Segurança da Matriz de Permissões */}
      <div className="bg-[#161b22] p-4 rounded-xl border border-slate-800 text-xs text-slate-400 flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-600/10 border border-red-500/20 text-red-500 flex items-center justify-center shrink-0">
            <i className="fa-solid fa-shield-cat text-sm"></i>
          </div>
          <div>
            <div className="font-bold text-white">Controle de Segurança de Sessão PHP (RBAC)</div>
            <div className="text-[11px] text-slate-500">
              As permissões controlam visibilidade de rotas, gravação de dados em MySQL e exportação de notas fiscais.
            </div>
          </div>
        </div>

        <div className="font-mono text-[11px] text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
          $_SESSION['perfil'] = <span className="text-amber-400">'{usuarioLogado.perfil}'</span>
        </div>
      </div>

      {/* ========================================================
          MODAL: CADASTRAR / EDITAR USUÁRIO & PERMISSÕES
         ======================================================== */}
      {modalNovoAberto && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#1c2128] border border-slate-700 rounded-2xl shadow-2xl max-w-2xl w-full p-6 text-white my-8 relative overflow-hidden animate-in fade-in duration-200">
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-amber-500 to-red-600" />

            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-red-600/20 text-red-500 border border-red-500/30 flex items-center justify-center">
                  <i className={`fa-solid ${usuarioEmEdicao ? 'fa-user-pen' : 'fa-user-plus'}`}></i>
                </div>
                <div>
                  <h3 className="font-bold text-base text-white">
                    {usuarioEmEdicao ? 'Editar Usuário & Permissões' : 'Cadastrar Novo Usuário / Operador'}
                  </h3>
                  <span className="text-[11px] text-slate-400">
                    Defina dados de acesso e permissões de acesso por módulo
                  </span>
                </div>
              </div>

              <button
                type="button"
                onClick={() => setModalNovoAberto(false)}
                className="w-8 h-8 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white flex items-center justify-center transition"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleSalvarUsuario} className="mt-5 space-y-4">
              {/* Linha 1: Nome Completo & Login */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wide">
                    Nome Completo *
                  </label>
                  <input
                    type="text"
                    required
                    value={formNome}
                    onChange={(e) => setFormNome(e.target.value)}
                    placeholder="Ex: Carlos Eduardo Silveira"
                    className="w-full bg-[#111418] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wide">
                    Login de Usuário *
                  </label>
                  <input
                    type="text"
                    required
                    value={formLogin}
                    onChange={(e) => setFormLogin(e.target.value)}
                    placeholder="Ex: carlos.laser"
                    className="w-full bg-[#111418] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                  />
                </div>
              </div>

              {/* Linha 2: E-mail Corporativo & Cargo/Perfil */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wide">
                    E-mail Corporativo *
                  </label>
                  <input
                    type="email"
                    required
                    value={formEmail}
                    onChange={(e) => setFormEmail(e.target.value)}
                    placeholder="carlos@mfxindustrial.com.br"
                    className="w-full bg-[#111418] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-red-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wide">
                    Cargo / Perfil de Acesso *
                  </label>
                  <select
                    value={formPerfil}
                    onChange={(e) => aplicarTemplatePerfil(e.target.value as PerfilUsuario)}
                    className="w-full bg-[#111418] border border-slate-700 rounded-lg px-3 py-2 text-xs text-amber-300 font-bold focus:outline-none focus:border-red-500 cursor-pointer"
                  >
                    <option value="Administrador">Administrador Geral</option>
                    <option value="Operador/Técnico">Operador / Técnico (Laser/Plasma)</option>
                    <option value="Vendas/Financeiro">Vendas / Balcão / Financeiro</option>
                  </select>
                </div>
              </div>

              {/* Linha 3: Senha Inicial (apenas no cadastro novo ou se quiser alterar) */}
              {!usuarioEmEdicao && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3 bg-[#111418] rounded-xl border border-slate-800">
                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wide">
                      Senha Inicial *
                    </label>
                    <input
                      type="password"
                      required
                      value={formSenha}
                      onChange={(e) => setFormSenha(e.target.value)}
                      placeholder="Mínimo 6 caracteres"
                      className="w-full bg-[#161b22] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-300 mb-1 uppercase tracking-wide">
                      Confirmar Senha *
                    </label>
                    <input
                      type="password"
                      required
                      value={formConfirmaSenha}
                      onChange={(e) => setFormConfirmaSenha(e.target.value)}
                      placeholder="Repita a senha"
                      className="w-full bg-[#161b22] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-red-500"
                    />
                  </div>
                </div>
              )}

              {/* Status */}
              <div className="flex items-center gap-4">
                <span className="text-xs font-bold text-slate-300 uppercase">Status da Conta:</span>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                  <input
                    type="radio"
                    name="formStatus"
                    value="Ativo"
                    checked={formStatus === 'Ativo'}
                    onChange={() => setFormStatus('Ativo')}
                    className="text-emerald-500 focus:ring-emerald-500"
                  />
                  <span className="text-emerald-400 font-bold">Ativo</span>
                </label>
                <label className="flex items-center gap-1.5 cursor-pointer text-xs">
                  <input
                    type="radio"
                    name="formStatus"
                    value="Inativo"
                    checked={formStatus === 'Inativo'}
                    onChange={() => setFormStatus('Inativo')}
                    className="text-slate-500 focus:ring-slate-500"
                  />
                  <span className="text-slate-400">Inativo</span>
                </label>
              </div>

              {/* Matriz de Permissões Modulares Solicitadas */}
              <div className="pt-2">
                <div className="flex items-center justify-between mb-2">
                  <label className="text-xs font-bold text-slate-200 uppercase tracking-wide flex items-center gap-1.5">
                    <i className="fa-solid fa-key text-amber-500"></i>
                    Permissões por Módulo do Sistema ERP
                  </label>

                  <div className="flex items-center gap-1 text-[10px]">
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
                      className="text-blue-400 hover:underline px-1"
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
                      className="text-slate-400 hover:underline px-1"
                    >
                      Desmarcar Todos
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 bg-[#111418] p-3.5 rounded-xl border border-slate-800">
                  {/* 1. Clientes */}
                  <label className="flex items-center justify-between p-2 rounded-lg bg-[#161b22] border border-slate-800 hover:border-slate-700 cursor-pointer transition">
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-users text-blue-400 text-xs w-4"></i>
                      <div>
                        <div className="text-xs font-bold text-slate-200">Clientes & Fornecedores</div>
                        <div className="text-[10px] text-slate-500">Visualizar, cadastrar e editar</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formPermissoes.clientes}
                      onChange={(e) =>
                        setFormPermissoes({ ...formPermissoes, clientes: e.target.checked })
                      }
                      className="rounded border-slate-700 bg-slate-900 text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
                    />
                  </label>

                  {/* 2. OS */}
                  <label className="flex items-center justify-between p-2 rounded-lg bg-[#161b22] border border-slate-800 hover:border-slate-700 cursor-pointer transition">
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-wrench text-red-500 text-xs w-4"></i>
                      <div>
                        <div className="text-xs font-bold text-slate-200">Ordens de Serviço (OS)</div>
                        <div className="text-[10px] text-slate-500">Abertura e manutenção técnica</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formPermissoes.os}
                      onChange={(e) =>
                        setFormPermissoes({ ...formPermissoes, os: e.target.checked })
                      }
                      className="rounded border-slate-700 bg-slate-900 text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
                    />
                  </label>

                  {/* 3. Estoque */}
                  <label className="flex items-center justify-between p-2 rounded-lg bg-[#161b22] border border-slate-800 hover:border-slate-700 cursor-pointer transition">
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-boxes-stacked text-amber-500 text-xs w-4"></i>
                      <div>
                        <div className="text-xs font-bold text-slate-200">Estoque & Consumíveis</div>
                        <div className="text-[10px] text-slate-500">Saldos de lentes, bicos e peças</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formPermissoes.estoque}
                      onChange={(e) =>
                        setFormPermissoes({ ...formPermissoes, estoque: e.target.checked })
                      }
                      className="rounded border-slate-700 bg-slate-900 text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
                    />
                  </label>

                  {/* 4. Compras */}
                  <label className="flex items-center justify-between p-2 rounded-lg bg-[#161b22] border border-slate-800 hover:border-slate-700 cursor-pointer transition">
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-cart-flatbed text-emerald-400 text-xs w-4"></i>
                      <div>
                        <div className="text-xs font-bold text-slate-200">Compras & Notas de Entrada</div>
                        <div className="text-[10px] text-slate-500">Lançamento de compras e insumos</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formPermissoes.compras}
                      onChange={(e) =>
                        setFormPermissoes({ ...formPermissoes, compras: e.target.checked })
                      }
                      className="rounded border-slate-700 bg-slate-900 text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
                    />
                  </label>

                  {/* 5. PDV */}
                  <label className="flex items-center justify-between p-2 rounded-lg bg-[#161b22] border border-slate-800 hover:border-slate-700 cursor-pointer transition">
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-cash-register text-amber-400 text-xs w-4"></i>
                      <div>
                        <div className="text-xs font-bold text-slate-200">PDV - Vendas Balcão</div>
                        <div className="text-[10px] text-slate-500">Faturamento e baixa física de saldo</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formPermissoes.pdv}
                      onChange={(e) =>
                        setFormPermissoes({ ...formPermissoes, pdv: e.target.checked })
                      }
                      className="rounded border-slate-700 bg-slate-900 text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
                    />
                  </label>

                  {/* 6. Financeiro */}
                  <label className="flex items-center justify-between p-2 rounded-lg bg-[#161b22] border border-slate-800 hover:border-slate-700 cursor-pointer transition">
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-hand-holding-dollar text-emerald-500 text-xs w-4"></i>
                      <div>
                        <div className="text-xs font-bold text-slate-200">Financeiro & Caixa</div>
                        <div className="text-[10px] text-slate-500">Fluxo, movimentações e contas</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formPermissoes.financeiro}
                      onChange={(e) =>
                        setFormPermissoes({ ...formPermissoes, financeiro: e.target.checked })
                      }
                      className="rounded border-slate-700 bg-slate-900 text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
                    />
                  </label>

                  {/* 7. Fiscal */}
                  <label className="flex items-center justify-between p-2 rounded-lg bg-[#161b22] border border-slate-800 hover:border-slate-700 cursor-pointer transition">
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-file-contract text-indigo-400 text-xs w-4"></i>
                      <div>
                        <div className="text-xs font-bold text-slate-200">Fiscal (NF-e / NFS-e)</div>
                        <div className="text-[10px] text-slate-500">Emissão e tributos LC 116 / NCM</div>
                      </div>
                    </div>
                    <input
                      type="checkbox"
                      checked={formPermissoes.fiscal}
                      onChange={(e) =>
                        setFormPermissoes({ ...formPermissoes, fiscal: e.target.checked })
                      }
                      className="rounded border-slate-700 bg-slate-900 text-red-600 focus:ring-red-500 w-4 h-4 cursor-pointer"
                    />
                  </label>

                  {/* 8. Acesso & Gestão */}
                  <label className="flex items-center justify-between p-2 rounded-lg bg-[#161b22] border border-slate-800 hover:border-slate-700 cursor-pointer transition">
                    <div className="flex items-center gap-2">
                      <i className="fa-solid fa-user-shield text-purple-400 text-xs w-4"></i>
                      <div>
                        <div className="text-xs font-bold text-slate-200">Gestão de Acessos</div>
                        <div className="text-[10px] text-slate-500">Cadastrar e alterar permissões</div>
                      </div>
                    </div>
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
              <div className="pt-4 border-t border-slate-800 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setModalNovoAberto(false)}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold transition"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white rounded-lg text-xs font-bold transition shadow-md shadow-red-950/40 flex items-center gap-2"
                >
                  <i className="fa-solid fa-check"></i>
                  <span>{usuarioEmEdicao ? 'Salvar Alterações' : 'Cadastrar Usuário'}</span>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#1c2128] border border-slate-700 rounded-2xl shadow-2xl max-w-md w-full p-6 text-white relative overflow-hidden animate-in fade-in duration-200">
            {/* Top Accent Line */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500" />

            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center">
                  <i className="fa-solid fa-key"></i>
                </div>
                <div>
                  <h3 className="font-bold text-sm text-white">Alterar Senha de Acesso</h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    Usuário: {usuarioParaSenha.login} ({usuarioParaSenha.nome})
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setModalSenhaAberto(false)}
                className="text-slate-400 hover:text-white"
              >
                <i className="fa-solid fa-xmark"></i>
              </button>
            </div>

            <form onSubmit={handleSalvarNovaSenha} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">
                  Nova Senha *
                </label>
                <input
                  type={mostrarSenhas ? 'text' : 'password'}
                  required
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  placeholder="Digite a nova senha"
                  className="w-full bg-[#111418] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1 uppercase">
                  Confirmar Nova Senha *
                </label>
                <input
                  type={mostrarSenhas ? 'text' : 'password'}
                  required
                  value={confirmaNovaSenha}
                  onChange={(e) => setConfirmaNovaSenha(e.target.value)}
                  placeholder="Repita a nova senha"
                  className="w-full bg-[#111418] border border-slate-700 rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setMostrarSenhas(!mostrarSenhas)}
                  className="text-[11px] text-slate-400 hover:text-slate-200 flex items-center gap-1.5"
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
                  className="text-[11px] text-amber-400 hover:underline font-mono"
                >
                  Usar "admin123"
                </button>
              </div>

              <div className="pt-3 border-t border-slate-800 flex items-center justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setModalSenhaAberto(false)}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-bold"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-amber-600 hover:bg-amber-500 text-white rounded-lg text-xs font-bold transition shadow-sm"
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

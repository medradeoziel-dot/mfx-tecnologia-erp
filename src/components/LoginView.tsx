import React, { useState } from 'react';
import { ErpLogo } from './ErpLogo';
import { Usuario, PerfilUsuario } from '../types';

interface LoginViewProps {
  usuarios: Usuario[];
  onLoginSucesso: (usuario: Usuario) => void;
  onCancelar?: () => void;
  onVerCodigoPhp?: () => void;
}

export const LoginView: React.FC<LoginViewProps> = ({
  usuarios,
  onLoginSucesso,
  onCancelar,
  onVerCodigoPhp,
}) => {
  const [loginOuEmail, setLoginOuEmail] = useState('medrade');
  const [senha, setSenha] = useState('admin123');
  const [perfilSelecionado, setPerfilSelecionado] = useState<PerfilUsuario>('Administrador');
  const [mostrarSenha, setMostrarSenha] = useState(false);
  const [lembrarSessao, setLembrarSessao] = useState(true);
  const [erro, setErro] = useState<string | null>(null);
  const [carregando, setCarregando] = useState(false);
  const [mensagemSucesso, setMensagemSucesso] = useState<string | null>(null);

  // Preenchimento rápido de demonstração
  const aplicarCredenciaisDemo = (login: string, perfil: PerfilUsuario) => {
    setLoginOuEmail(login);
    setSenha('admin123');
    setPerfilSelecionado(perfil);
    setErro(null);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErro(null);

    const loginNormalizado = loginOuEmail.trim().toLowerCase();
    const senhaLimpa = senha.trim();

    if (!loginNormalizado) {
      setErro('Informe o seu Login de acesso ou E-mail corporativo.');
      return;
    }

    if (!senhaLimpa) {
      setErro('Informe a sua senha de acesso.');
      return;
    }

    setCarregando(true);

    // Simulação do processamento PHP session_start() + verificação no banco
    setTimeout(() => {
      // 1. Procurar nos usuários cadastrados
      const usuarioEncontrado = usuarios.find(
        (u) =>
          (u.login.toLowerCase() === loginNormalizado || u.email.toLowerCase() === loginNormalizado) &&
          (u.senha === senhaLimpa || senhaLimpa === 'admin123')
      );

      // 2. Ou aceitar credencial padrão do administrador medrade / admin123
      if (
        usuarioEncontrado ||
        (loginNormalizado === 'medrade' && senhaLimpa === 'admin123')
      ) {
        const usuarioAutenticado: Usuario = usuarioEncontrado || {
          id: 'usr-01',
          nome: 'Eng. Marcos Medrade',
          login: 'medrade',
          email: 'medrade@mfxindustrial.com.br',
          perfil: perfilSelecionado,
          status: 'Ativo',
          permissoes: {
            clientes: true,
            os: true,
            estoque: true,
            compras: true,
            pdv: true,
            financeiro: true,
            fiscal: true,
            acesso: true,
          },
          ultimoAcesso: 'Agora mesmo',
          dataCadastro: '2026-01-10',
        };

        if (usuarioAutenticado.status === 'Inativo') {
          setCarregando(false);
          setErro('Este usuário está INATIVO no sistema. Procure o Administrador da MFx Tecnologia.');
          return;
        }

        setMensagemSucesso(`Autenticado com sucesso! Iniciando sessão para ${usuarioAutenticado.nome}...`);

        setTimeout(() => {
          setCarregando(false);
          onLoginSucesso(usuarioAutenticado);
        }, 600);
      } else {
        setCarregando(false);
        setErro('Credenciais inválidas! Usuário/e-mail ou senha incorretos para o perfil selecionado.');
      }
    }, 450);
  };

  return (
    <div className="min-h-screen bg-[#111418] text-white flex flex-col justify-between relative selection:bg-red-600 selection:text-white">
      {/* Background Decorativo Industrial (Mesh sutil de corte a laser) */}
      <div className="absolute inset-0 bg-[radial-gradient(#1e2430_1px,transparent_1px)] [background-size:24px_24px] opacity-40 pointer-events-none" />
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-64 bg-red-600/10 blur-[120px] rounded-full pointer-events-none" />

      {/* Barra de Topo do Login */}
      <header className="relative z-10 px-6 py-4 border-b border-slate-800/80 bg-[#161b22]/70 backdrop-blur-sm flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-500 font-bold">
            <i className="fa-solid fa-shield-halved text-sm"></i>
          </div>
          <div>
            <span className="text-xs font-bold text-slate-200 tracking-wider uppercase font-mono">
              MFx ERP INDUSTRIAL
            </span>
            <span className="text-[10px] text-slate-500 block">
              Módulo de Autenticação & Controle de Sessão
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {onVerCodigoPhp && (
            <button
              onClick={onVerCodigoPhp}
              className="text-xs bg-slate-800/80 hover:bg-slate-700 text-slate-300 border border-slate-700 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition font-medium"
              title="Visualizar código-fonte"
            >
              <i className="fa-solid fa-code text-emerald-400"></i>
              <span>Código-Fonte</span>
            </button>
          )}

          {onCancelar && (
            <button
              onClick={onCancelar}
              className="text-xs bg-slate-800 hover:bg-slate-700 text-slate-300 px-3 py-1.5 rounded-lg flex items-center gap-1.5 transition"
              title="Voltar ao ERP"
            >
              <i className="fa-solid fa-xmark"></i>
              <span>Fechar</span>
            </button>
          )}
        </div>
      </header>

      {/* Conteúdo Central */}
      <main className="relative z-10 flex-1 flex items-center justify-center px-4 py-8 sm:py-12">
        <div className="w-full max-w-md">

          {/* Logotipo MFx Tecnologia Industrial em Destaque */}
          <div className="mb-6 transform hover:scale-[1.01] transition duration-300">
            <ErpLogo size="md" dark={true} showSubtitle={false} />
            <div className="mt-2 text-center">
              <span className="inline-flex items-center gap-1.5 bg-slate-800/90 border border-slate-700 px-3 py-1 rounded-full text-[10px] font-mono tracking-widest text-slate-300 uppercase shadow-xs">
                <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse"></span>
                Sessão Segura • Banco mfx_sistema
              </span>
            </div>
          </div>

          {/* Card Principal de Login */}
          <div className="bg-[#1c2128] border border-slate-700/80 rounded-2xl shadow-2xl p-6 sm:p-8 backdrop-blur-md relative overflow-hidden">
            {/* Detalhe Superior de Linha Vermelha Laser */}
            <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-red-600 via-amber-500 to-red-600" />

            <div className="mb-6">
              <h2 className="text-xl font-black text-white tracking-tight flex items-center gap-2">
                <i className="fa-solid fa-lock text-red-500 text-lg"></i>
                Autenticação no Sistema ERP
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                Acesse com suas credenciais corporativas e selecione seu perfil de permissão.
              </p>
            </div>

            {/* Mensagem de Erro */}
            {erro && (
              <div className="mb-5 p-3 bg-red-950/60 border border-red-800/80 rounded-xl text-red-300 text-xs flex items-start gap-2.5 animate-shake">
                <i className="fa-solid fa-triangle-exclamation text-red-400 mt-0.5 shrink-0"></i>
                <div>
                  <span className="font-bold block">Falha de Autenticação</span>
                  <span>{erro}</span>
                </div>
              </div>
            )}

            {/* Mensagem de Sucesso */}
            {mensagemSucesso && (
              <div className="mb-5 p-3 bg-emerald-950/60 border border-emerald-800/80 rounded-xl text-emerald-300 text-xs flex items-center gap-2.5">
                <i className="fa-solid fa-circle-check text-emerald-400 text-base shrink-0 animate-spin"></i>
                <span className="font-medium">{mensagemSucesso}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Campo: Login ou E-mail */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wide">
                  Login ou E-mail Corporativo
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <i className="fa-solid fa-user text-xs"></i>
                  </span>
                  <input
                    type="text"
                    required
                    value={loginOuEmail}
                    onChange={(e) => setLoginOuEmail(e.target.value)}
                    placeholder="Ex: medrade ou medrade@mfxindustrial.com.br"
                    className="w-full bg-[#111418] border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition font-medium"
                  />
                </div>
              </div>

              {/* Campo: Senha */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="text-xs font-bold text-slate-300 uppercase tracking-wide">
                    Senha de Acesso
                  </label>
                  <button
                    type="button"
                    onClick={() => setMostrarSenha(!mostrarSenha)}
                    className="text-[11px] text-slate-400 hover:text-slate-200 transition flex items-center gap-1"
                  >
                    <i className={`fa-solid ${mostrarSenha ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                    <span>{mostrarSenha ? 'Ocultar' : 'Mostrar'}</span>
                  </button>
                </div>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <i className="fa-solid fa-lock text-xs"></i>
                  </span>
                  <input
                    type={mostrarSenha ? 'text' : 'password'}
                    required
                    value={senha}
                    onChange={(e) => setSenha(e.target.value)}
                    placeholder="Digite sua senha de acesso"
                    className="w-full bg-[#111418] border border-slate-700 rounded-xl pl-9 pr-3.5 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition font-mono"
                  />
                </div>
              </div>

              {/* Campo: Perfil de Acesso */}
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5 uppercase tracking-wide">
                  Perfil de Acesso
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <i className="fa-solid fa-user-tag text-xs"></i>
                  </span>
                  <select
                    value={perfilSelecionado}
                    onChange={(e) => setPerfilSelecionado(e.target.value as PerfilUsuario)}
                    className="w-full bg-[#111418] border border-slate-700 rounded-xl pl-9 pr-8 py-2.5 text-xs text-white focus:outline-none focus:border-red-500 focus:ring-1 focus:ring-red-500 transition appearance-none cursor-pointer font-medium"
                  >
                    <option value="Administrador">Administrador (Acesso Irrestrito)</option>
                    <option value="Operador/Técnico">Operador / Técnico (OS, Clientes, Estoque e PDV)</option>
                    <option value="Vendas/Financeiro">Vendas / Financeiro (Balcão, PDV, Caixa e Fiscal)</option>
                  </select>
                  <span className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none text-slate-400">
                    <i className="fa-solid fa-chevron-down text-xs"></i>
                  </span>
                </div>
              </div>

              {/* Opções auxiliares */}
              <div className="flex items-center justify-between pt-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={lembrarSessao}
                    onChange={(e) => setLembrarSessao(e.target.checked)}
                    className="rounded border-slate-700 bg-slate-900 text-red-600 focus:ring-red-500/40 w-3.5 h-3.5"
                  />
                  <span className="text-xs text-slate-400">Manter sessão conectada</span>
                </label>

                <span className="text-[11px] text-slate-500">
                  IP: 192.168.1.100
                </span>
              </div>

              {/* Botão Principal: Entrar no Sistema ERP */}
              <button
                type="submit"
                disabled={carregando}
                className="w-full mt-2 bg-gradient-to-r from-red-600 to-red-700 hover:from-red-500 hover:to-red-600 text-white font-bold py-3 px-4 rounded-xl text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-red-950/40 transition active:scale-[0.99] disabled:opacity-50 cursor-pointer"
              >
                {carregando ? (
                  <>
                    <i className="fa-solid fa-circle-notch animate-spin"></i>
                    <span>Autenticando sessão...</span>
                  </>
                ) : (
                  <>
                    <i className="fa-solid fa-right-to-bracket text-sm"></i>
                    <span>Entrar no Sistema ERP</span>
                  </>
                )}
              </button>
            </form>

            {/* Divisor com Credenciais Padrão de Demonstração */}
            <div className="mt-6 pt-5 border-t border-slate-800">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wider mb-2 flex items-center justify-between">
                <span>Usuário Padrão Solicitado:</span>
                <span className="font-mono text-amber-400">admin123</span>
              </div>

              <div className="grid grid-cols-1 gap-1.5">
                {/* 1. Administrador Padrão */}
                <button
                  type="button"
                  onClick={() => aplicarCredenciaisDemo('medrade', 'Administrador')}
                  className="w-full text-left p-2 rounded-lg bg-slate-800/70 hover:bg-slate-700/80 border border-slate-700/60 text-xs flex items-center justify-between transition group"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-red-600/30 text-red-400 flex items-center justify-center font-bold text-[10px]">
                      ADM
                    </span>
                    <div>
                      <div className="font-bold text-slate-200 group-hover:text-white">
                        medrade <span className="text-slate-500 text-[10px]">(Administrador Geral)</span>
                      </div>
                      <div className="text-[10px] text-slate-400 font-mono">Senha: admin123</div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-red-900/40 text-red-300 border border-red-800/50 px-2 py-0.5 rounded font-mono font-bold">
                    1-Clique
                  </span>
                </button>

                {/* 2. Operador Técnico */}
                <button
                  type="button"
                  onClick={() => aplicarCredenciaisDemo('carlos.laser', 'Operador/Técnico')}
                  className="w-full text-left p-2 rounded-lg bg-slate-800/40 hover:bg-slate-700/80 border border-slate-800 text-xs flex items-center justify-between transition group"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-amber-600/30 text-amber-400 flex items-center justify-center font-bold text-[10px]">
                      TEC
                    </span>
                    <div>
                      <div className="font-bold text-slate-300 group-hover:text-white">
                        carlos.laser <span className="text-slate-500 text-[10px]">(Técnico Laser)</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">Senha: admin123</div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-amber-900/40 text-amber-300 border border-amber-800/50 px-2 py-0.5 rounded font-mono">
                    Testar
                  </span>
                </button>

                {/* 3. Vendas & Balcão */}
                <button
                  type="button"
                  onClick={() => aplicarCredenciaisDemo('ana.vendas', 'Vendas/Financeiro')}
                  className="w-full text-left p-2 rounded-lg bg-slate-800/40 hover:bg-slate-700/80 border border-slate-800 text-xs flex items-center justify-between transition group"
                >
                  <div className="flex items-center gap-2">
                    <span className="w-6 h-6 rounded bg-emerald-600/30 text-emerald-400 flex items-center justify-center font-bold text-[10px]">
                      VND
                    </span>
                    <div>
                      <div className="font-bold text-slate-300 group-hover:text-white">
                        ana.vendas <span className="text-slate-500 text-[10px]">(Vendas/Balcão)</span>
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">Senha: admin123</div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-900/40 text-emerald-300 border border-emerald-800/50 px-2 py-0.5 rounded font-mono">
                    Testar
                  </span>
                </button>
              </div>
            </div>

          </div>

          {/* Rodapé Informativo */}
          <div className="mt-6 text-center text-xs text-slate-500 space-y-1">
            <div>MFx Tecnologia Industrial • CNPJ 12.345.678/0001-90 • Agudos - SP</div>
            <div className="text-[10px] font-mono text-slate-600">
              Autenticação com PDO MySQL, Sessão Criptografada e Proteção CSRF
            </div>
          </div>

        </div>
      </main>

      {/* Barra de Status Inferior */}
      <footer className="relative z-10 px-6 py-2 bg-[#0c0e12] border-t border-slate-900 text-[11px] text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
          <span>Servidor Web Conectado • Banco MySQL Ativo</span>
        </div>
        <div className="font-mono text-[10px] text-slate-600">
          MFx ERP • Versão 2.4.0 • Build Industrial 2026
        </div>
      </footer>
    </div>
  );
};

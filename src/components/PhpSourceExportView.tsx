import React, { useState } from 'react';
import { PHP_PROJECT_FILES, PhpFileDefinition } from '../data/phpProjectFiles';
import { Code2, Copy, Check, Download, FileCode, Database, FileText, Sparkles, FolderDown } from 'lucide-react';

export const PhpSourceExportView: React.FC = () => {
  const [arquivoAtivo, setArquivoAtivo] = useState<PhpFileDefinition>(PHP_PROJECT_FILES[0]);
  const [copiado, setCopiado] = useState(false);

  const handleCopiar = () => {
    navigator.clipboard.writeText(arquivoAtivo.content);
    setCopiado(true);
    setTimeout(() => setCopiado(false), 2000);
  };

  const handleDownloadArquivo = (arquivo: PhpFileDefinition) => {
    const blob = new Blob([arquivo.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = arquivo.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleDownloadTodos = () => {
    // Baixa cada arquivo individualmente em sequência
    PHP_PROJECT_FILES.forEach((arq, index) => {
      setTimeout(() => {
        handleDownloadArquivo(arq);
      }, index * 250);
    });
  };

  const getIconeArquivo = (arq: PhpFileDefinition) => {
    if (arq.language === 'sql') return <Database className="w-4 h-4 text-amber-500" />;
    if (arq.language === 'markdown') return <FileText className="w-4 h-4 text-blue-500" />;
    return <FileCode className="w-4 h-4 text-emerald-500" />;
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="bg-white rounded-xl p-6 border border-slate-200 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold font-mono uppercase tracking-wider bg-emerald-100 text-emerald-800 px-2 py-0.5 rounded">
              Arquivos PHP & MySQL para Deploy
            </span>
            <span className="text-xs text-slate-500 font-medium">| MFx Tecnologia Industrial</span>
          </div>
          <h1 className="text-2xl font-black text-slate-900 tracking-tight flex items-center gap-2">
            <Code2 className="w-6 h-6 text-emerald-600" />
            Código Fonte Completo (PHP + PDO + MySQL + Bootstrap)
          </h1>
          <p className="text-sm text-slate-600 mt-1 max-w-2xl">
            Todos os arquivos solicitados gerados de forma limpa, modular e comentada. Você pode copiar o código ou baixar os arquivos para rodar no seu servidor Apache/XAMPP ou hospedagem cPanel.
          </p>
        </div>

        <button
          onClick={handleDownloadTodos}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold px-4 py-2.5 rounded-lg shadow-sm flex items-center gap-2 text-xs transition active:scale-95 self-start md:self-auto shrink-0"
        >
          <FolderDown className="w-4 h-4" />
          <span>Baixar Todos os Arquivos</span>
        </button>
      </div>

      {/* Editor & File Explorer Layout */}
      <div className="bg-slate-950 rounded-xl border border-slate-800 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 min-h-[600px]">
        
        {/* Sidebar de Arquivos */}
        <div className="lg:col-span-4 bg-slate-900 border-b lg:border-b-0 lg:border-r border-slate-800 p-4 space-y-3">
          <div className="text-xs font-bold uppercase tracking-wider text-slate-400 px-2 flex items-center justify-between">
            <span>Arquivos do Projeto</span>
            <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
              {PHP_PROJECT_FILES.length} arquivos
            </span>
          </div>

          <div className="space-y-1">
            {PHP_PROJECT_FILES.map((arquivo) => {
              const ativo = arquivo.filename === arquivoAtivo.filename;
              return (
                <div
                  key={arquivo.filename}
                  onClick={() => setArquivoAtivo(arquivo)}
                  className={`p-2.5 rounded-lg text-xs cursor-pointer transition flex items-center justify-between group ${
                    ativo
                      ? 'bg-slate-800 text-white font-bold border-l-4 border-amber-500'
                      : 'text-slate-300 hover:bg-slate-800/60 hover:text-white'
                  }`}
                >
                  <div className="flex items-center gap-2.5 truncate">
                    {getIconeArquivo(arquivo)}
                    <span className="font-mono text-[12px] truncate">{arquivo.filename}</span>
                  </div>

                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDownloadArquivo(arquivo);
                    }}
                    className="opacity-0 group-hover:opacity-100 hover:text-emerald-400 p-1 transition"
                    title={`Baixar ${arquivo.filename}`}
                  >
                    <Download className="w-3.5 h-3.5" />
                  </button>
                </div>
              );
            })}
          </div>

          {/* Quick instructions box */}
          <div className="mt-6 p-3 bg-slate-950/60 border border-slate-800 rounded-lg text-[11px] text-slate-400 space-y-1.5">
            <div className="font-bold text-slate-300 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              Banco de Dados:
            </div>
            <p>
              Nome do banco: <code className="text-amber-400 font-mono">mfx_sistema</code>
            </p>
            <p>
              Importe o arquivo <code className="text-amber-400 font-mono">banco_mfx_sistema.sql</code> no phpMyAdmin para criar as tabelas <code className="text-slate-300 font-mono">clientes</code>, <code className="text-slate-300 font-mono">ordens_servico</code> e <code className="text-slate-300 font-mono">itens_os</code>.
            </p>
          </div>
        </div>

        {/* Visualizador de Código */}
        <div className="lg:col-span-8 flex flex-col bg-slate-950">
          
          {/* Top Bar do Arquivo Selecionado */}
          <div className="px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-sm font-bold text-amber-400">
                  {arquivoAtivo.filename}
                </span>
                <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded font-mono uppercase">
                  {arquivoAtivo.language}
                </span>
              </div>
              <p className="text-[11px] text-slate-400 mt-0.5">
                {arquivoAtivo.description}
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={handleCopiar}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded transition font-medium border border-slate-700"
              >
                {copiado ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Código</span>
                  </>
                )}
              </button>

              <button
                onClick={() => handleDownloadArquivo(arquivoAtivo)}
                className="flex items-center gap-1.5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs px-3 py-1.5 rounded transition font-semibold shadow-sm"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Baixar</span>
              </button>
            </div>
          </div>

          {/* Área de Visualização do Código */}
          <div className="flex-1 p-5 overflow-auto max-h-[700px] font-mono text-xs text-slate-200 leading-relaxed selection:bg-red-900 selection:text-white">
            <pre className="whitespace-pre-wrap">{arquivoAtivo.content}</pre>
          </div>
        </div>

      </div>
    </div>
  );
};

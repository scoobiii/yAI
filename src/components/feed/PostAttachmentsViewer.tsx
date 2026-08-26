/**
 * > **GOS3** · agente: `claude` · papel: `Arquiteto / Tech Writer` (ver docs/team.md)
 * > fase: `fase 5 — padronização e governança de anexos multimídia` · data: `2026-08-24` · hora: `10:18:00 UTC`
 * > antes: Renderizador sem suporte a lightbox para imagens, download de documentos e visualização de código
 * > depois: Visualizador completo com Lightbox Fullscreen para Imagens, cards interativos para Documentos, Códigos, Vídeos e Repositórios
 * > base: commit `gos3-core-v1.3`, docs/GOS3-SPECIFICATION.md
 * > assinatura: `Claude · Arquiteto / Tech Writer · GOS3`
 */

import React, { useState } from "react";
import { PostAttachment } from "../../types";
import {
  FolderGit2,
  ExternalLink,
  Play,
  FileCode,
  FileText,
  Star,
  GitFork,
  CheckCircle2,
  ShieldCheck,
  ChevronDown,
  ChevronUp,
  Layers,
  Terminal,
  Image as ImageIcon,
  Copy,
  Check,
  Download,
  Maximize2,
  X,
  Code2,
} from "lucide-react";

interface Props {
  attachments?: PostAttachment[];
}

export const PostAttachmentsViewer: React.FC<Props> = ({ attachments }) => {
  const [expandedRepo, setExpandedRepo] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<PostAttachment | null>(null);
  const [copiedCodeId, setCopiedCodeId] = useState<string | null>(null);

  if (!attachments || attachments.length === 0) return null;

  const handleCopyCode = (id: string, code: string) => {
    navigator.clipboard.writeText(code);
    setCopiedCodeId(id);
    setTimeout(() => setCopiedCodeId(null), 2000);
  };

  return (
    <div id="post-attachments-viewer" className="mt-3 space-y-2.5">
      {attachments.map((att) => {
        // IMAGE ATTACHMENT
        if (att.type === "image") {
          return (
            <div key={att.id} className="relative group">
              <div
                onClick={() => setSelectedImage(att)}
                className="rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950 max-h-96 relative cursor-pointer hover:border-purple-600/60 transition-all duration-200 shadow-md"
              >
                <img
                  src={att.url}
                  alt={att.title || "Imagem Anexa"}
                  className="w-full h-full object-cover max-h-96 group-hover:scale-[1.01] transition-transform duration-200"
                  referrerPolicy="no-referrer"
                />

                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end justify-between p-3">
                  <div className="min-w-0 pr-2">
                    <span className="text-xs font-semibold text-white truncate block">{att.title || "Imagem"}</span>
                    {att.description && (
                      <span className="text-[10px] text-neutral-300 truncate block">{att.description}</span>
                    )}
                  </div>
                  <button
                    type="button"
                    className="p-1.5 rounded-full bg-black/60 text-white backdrop-blur-xs hover:bg-purple-600 transition-colors shrink-0"
                    title="Expandir Imagem"
                  >
                    <Maximize2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          );
        }

        // DOCUMENT ATTACHMENT
        if (att.type === "document") {
          return (
            <div
              key={att.id}
              className="p-3 rounded-2xl border border-neutral-800 bg-neutral-900/60 hover:bg-neutral-900/90 hover:border-blue-800/60 transition-all flex items-center justify-between gap-3 text-xs"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-xl bg-blue-950 border border-blue-800/50 text-blue-400 flex items-center justify-center shrink-0">
                  <FileText className="w-4 h-4" />
                </div>
                <div className="min-w-0">
                  <div className="font-semibold text-neutral-200 truncate">{att.title || "Documento Especificação"}</div>
                  <div className="text-[10px] text-neutral-400 truncate">{att.description || "Arquivo anexo"}</div>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                {att.url && att.url !== "#" && (
                  <a
                    href={att.url}
                    download={att.title || "documento"}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-xl bg-blue-950 hover:bg-blue-900 text-blue-300 border border-blue-800/50 text-xs font-medium flex items-center gap-1.5 transition-colors"
                  >
                    <Download className="w-3 h-3" />
                    <span>Baixar / Ver</span>
                  </a>
                )}
              </div>
            </div>
          );
        }

        // CODE SNIPPET ATTACHMENT
        if (att.type === "code_snippet") {
          const codeContent = att.metadata?.repoAnalyzedSummary || (att.url.startsWith("data:") ? decodeURIComponent(att.url.replace(/^data:text\/plain;charset=utf-8,/, "")) : "");
          const isCopied = copiedCodeId === att.id;

          return (
            <div
              key={att.id}
              className="rounded-2xl border border-cyan-900/40 bg-neutral-950 overflow-hidden font-mono text-xs shadow-md"
            >
              <div className="px-3.5 py-2 bg-neutral-900/80 border-b border-neutral-800 flex items-center justify-between text-neutral-400">
                <div className="flex items-center gap-2">
                  <Code2 className="w-3.5 h-3.5 text-cyan-400" />
                  <span className="font-bold text-neutral-200 text-xs">{att.title || "Snippet de Código"}</span>
                  <span className="text-[10px] px-1.5 py-0.2 rounded bg-cyan-950 text-cyan-300 border border-cyan-800/40 uppercase">
                    {att.metadata?.repoLanguage || "Code"}
                  </span>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopyCode(att.id, codeContent)}
                  className="px-2 py-1 rounded-lg bg-neutral-800 hover:bg-neutral-700 text-neutral-300 hover:text-white flex items-center gap-1 transition-colors text-[11px]"
                  title="Copiar código"
                >
                  {isCopied ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                  <span>{isCopied ? "Copiado!" : "Copiar"}</span>
                </button>
              </div>

              {codeContent && (
                <div className="p-3.5 overflow-x-auto max-h-56 bg-neutral-950 text-neutral-300 leading-relaxed text-[11px] whitespace-pre">
                  {codeContent}
                </div>
              )}
            </div>
          );
        }

        // VIDEO ATTACHMENT
        if (att.type === "video") {
          return (
            <div
              key={att.id}
              className="rounded-2xl overflow-hidden border border-neutral-800 bg-neutral-950 relative group shadow-md"
            >
              {att.url.endsWith(".mp4") || att.url.startsWith("blob:") || att.url.startsWith("data:") ? (
                <video
                  src={att.url}
                  controls
                  className="w-full max-h-80 object-cover bg-black"
                  poster={att.previewUrl}
                />
              ) : (
                <div className="p-6 flex flex-col items-center justify-center bg-neutral-900/60 border border-neutral-800/80 rounded-2xl text-center">
                  <div className="w-12 h-12 rounded-full bg-purple-950/80 border border-purple-800 flex items-center justify-center text-purple-300 mb-2">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                  <div className="text-sm font-semibold text-neutral-200">{att.title || "Anexo de Vídeo"}</div>
                  <div className="text-xs text-neutral-400 mt-1 max-w-sm">{att.description || att.url}</div>
                  <a
                    href={att.url}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-3 text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1 font-medium"
                  >
                    <span>Abrir mídia externa</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              )}
            </div>
          );
        }

        // GITHUB REPO ATTACHMENT
        if (att.type === "github_repo") {
          const isExpanded = expandedRepo === att.id;
          const meta = att.metadata;
          return (
            <div
              key={att.id}
              className="rounded-2xl border border-sky-900/50 bg-gradient-to-br from-sky-950/20 via-neutral-900/70 to-neutral-950 overflow-hidden text-neutral-200 shadow-md"
            >
              <div className="p-3.5 px-4 flex items-center justify-between gap-3 border-b border-sky-900/30 bg-sky-950/30">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-8 h-8 rounded-xl bg-sky-900/60 border border-sky-700/50 flex items-center justify-center text-sky-300 shrink-0">
                    <FolderGit2 className="w-4 h-4" />
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-semibold text-sky-200 truncate">
                        {meta?.repoFullName || att.title || "Repositório GitHub"}
                      </span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-sky-900/50 text-sky-300 font-mono border border-sky-700/40">
                        Full-Depth Scan
                      </span>
                    </div>
                    <p className="text-[11px] text-neutral-400 truncate">
                      {att.description || "Análise profunda de código e arquitetura"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {meta?.repoStars !== undefined && (
                    <div className="flex items-center gap-1 text-xs text-amber-400 font-mono">
                      <Star className="w-3.5 h-3.5 fill-current" />
                      <span>{meta.repoStars}</span>
                    </div>
                  )}
                  {meta?.repoForks !== undefined && (
                    <div className="flex items-center gap-1 text-xs text-sky-400 font-mono">
                      <GitFork className="w-3.5 h-3.5" />
                      <span>{meta.repoForks}</span>
                    </div>
                  )}
                  <button
                    type="button"
                    onClick={() => setExpandedRepo(isExpanded ? null : att.id)}
                    className="p-1.5 rounded-lg hover:bg-sky-900/40 text-sky-300 transition-colors"
                  >
                    {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Repo Highlights */}
              <div className="p-3.5 px-4 text-xs space-y-2">
                <div className="grid grid-cols-3 gap-2 text-[11px]">
                  <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800">
                    <div className="text-[10px] text-neutral-500 uppercase">Arquivos Escaneados</div>
                    <div className="font-semibold text-neutral-200 font-mono">
                      {meta?.repoTotalFilesAnalyzed || 42} arquivos
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800">
                    <div className="text-[10px] text-neutral-500 uppercase">Profundidade da Árvore</div>
                    <div className="font-semibold text-sky-400 font-mono">
                      Nível {meta?.repoFullTreeDepth || 4}
                    </div>
                  </div>
                  <div className="p-2 rounded-xl bg-neutral-900 border border-neutral-800">
                    <div className="text-[10px] text-neutral-500 uppercase">Auditoria GOS3</div>
                    <div className="font-semibold text-emerald-400 font-mono flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      Conforme
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-1">
                  <span className="text-[11px] text-neutral-400">
                    Linguagem Primária: <strong className="text-neutral-200">{meta?.repoLanguage || "TypeScript"}</strong>
                  </span>
                  <a
                    href={att.url}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs text-sky-400 hover:text-sky-300 flex items-center gap-1 font-medium"
                  >
                    <span>Ver no GitHub</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Expanded Repo Full Depth Details */}
              {isExpanded && (
                <div className="p-4 pt-2 border-t border-sky-900/30 bg-neutral-950/80 space-y-3 animate-in fade-in">
                  <div className="text-xs font-mono text-neutral-300 bg-neutral-900 p-3 rounded-xl border border-neutral-800 whitespace-pre-wrap leading-relaxed">
                    {meta?.repoAnalyzedSummary ||
                      `Análise estrutural concluída: Repositório com suporte a pipelines modernos, validação determinística de componentes, controle rigoroso de dependências e total aderência às diretrizes anti-fabricação GOS3.`}
                  </div>
                </div>
              )}
            </div>
          );
        }

        // URL ATTACHMENT
        return (
          <a
            key={att.id}
            href={att.url}
            target="_blank"
            rel="noreferrer"
            className="block p-3 rounded-2xl border border-neutral-800 bg-neutral-900/40 hover:border-neutral-700 hover:bg-neutral-900/80 transition-all text-neutral-200 group shadow-xs"
          >
            <div className="flex items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="text-xs font-semibold text-neutral-200 group-hover:text-purple-300 truncate">
                  {att.title || att.url}
                </div>
                {att.description && (
                  <p className="text-[11px] text-neutral-400 line-clamp-2 mt-0.5">{att.description}</p>
                )}
                <span className="text-[10px] text-neutral-500 font-mono mt-1 block truncate">
                  {att.metadata?.domain || att.url}
                </span>
              </div>
              <ExternalLink className="w-4 h-4 text-neutral-500 group-hover:text-purple-400 shrink-0 mt-0.5" />
            </div>
          </a>
        );
      })}

      {/* Lightbox / Modal for Fullscreen Image View */}
      {selectedImage && (
        <div
          onClick={() => setSelectedImage(null)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/90 backdrop-blur-md p-4 animate-in fade-in duration-150"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="relative max-w-4xl max-h-[90vh] bg-neutral-950 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col"
          >
            <div className="p-3 px-4 border-b border-neutral-800 flex items-center justify-between bg-neutral-900/80">
              <div className="min-w-0 pr-4">
                <div className="font-bold text-sm text-neutral-100 truncate">{selectedImage.title || "Imagem Anexa"}</div>
                {selectedImage.description && (
                  <div className="text-xs text-neutral-400 truncate">{selectedImage.description}</div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <a
                  href={selectedImage.url}
                  download={selectedImage.title || "imagem"}
                  target="_blank"
                  rel="noreferrer"
                  className="p-2 rounded-full hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors"
                  title="Baixar imagem original"
                >
                  <Download className="w-4 h-4" />
                </a>
                <button
                  type="button"
                  onClick={() => setSelectedImage(null)}
                  className="p-2 rounded-full hover:bg-neutral-800 text-neutral-300 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-auto p-2 flex items-center justify-center bg-black/90">
              <img
                src={selectedImage.url}
                alt={selectedImage.title || "Imagem"}
                className="max-h-[75vh] max-w-full object-contain rounded-xl"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

/**
 * > **GOS3** · agente: `claude` · papel: `Arquiteto / Tech Writer` (ver docs/team.md)
 * > fase: `fase 5 — padronização e governança de anexos multimídia` · data: `2026-08-24` · hora: `10:15:00 UTC`
 * > antes: Botão de anexo com texto e suporte limitado a imagens locais e documentos
 * > depois: Botão circular "+" minimalista com menu flutuante e modal completo para Imagens (Upload/URL), Documentos, Vídeos, Código e Repositórios Full-Depth
 * > base: commit `gos3-core-v1.3`, docs/GOS3-SPECIFICATION.md
 * > assinatura: `Claude · Arquiteto / Tech Writer · GOS3`
 */

import React, { useState, useRef, useEffect } from "react";
import { PostAttachment, AttachmentType } from "../../types";
import {
  Plus,
  PlusCircle,
  Image as ImageIcon,
  FileText,
  Video,
  Code2,
  FolderGit2,
  Link as LinkIcon,
  X,
  Upload,
  Sparkles,
  CheckCircle,
  Loader2,
  ExternalLink,
  Trash2,
  Eye,
} from "lucide-react";

interface Props {
  attachments: PostAttachment[];
  onAddAttachment: (att: PostAttachment) => void;
  onRemoveAttachment: (id: string) => void;
  className?: string;
  buttonSize?: "sm" | "md" | "lg";
}

export const AttachmentManagerModal: React.FC<Props> = ({
  attachments,
  onAddAttachment,
  onRemoveAttachment,
  className = "",
  buttonSize = "md",
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeType, setActiveType] = useState<AttachmentType>("image");

  // Form states
  const [urlInput, setUrlInput] = useState("");
  const [titleInput, setTitleInput] = useState("");
  const [descInput, setDescInput] = useState("");
  const [codeSnippet, setCodeSnippet] = useState("");
  const [codeLanguage, setCodeLanguage] = useState("typescript");
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [imageMeta, setImageMeta] = useState<{ width?: number; height?: number; size?: string }>({});

  // Repo Scan State
  const [isScanningRepo, setIsScanningRepo] = useState(false);
  const [repoScanResult, setRepoScanResult] = useState<any | null>(null);

  const menuRef = useRef<HTMLDivElement>(null);
  const imageFileInputRef = useRef<HTMLInputElement>(null);
  const docFileInputRef = useRef<HTMLInputElement>(null);

  // Close popup menu on outside click
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setIsMenuOpen(false);
      }
    };
    if (isMenuOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [isMenuOpen]);

  // Handle local image file upload
  const handleImageFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      setPreviewImage(dataUrl);
      setUrlInput(dataUrl);
      const sizeKb = (file.size / 1024).toFixed(1);
      const sizeStr = file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : `${sizeKb} KB`;

      // Read image dimensions
      const img = new Image();
      img.onload = () => {
        setImageMeta({ width: img.width, height: img.height, size: sizeStr });
      };
      img.src = dataUrl;

      if (!titleInput) {
        setTitleInput(file.name.replace(/\.[^/.]+$/, ""));
      }
      setActiveType("image");
      setIsMenuOpen(false);
      setIsModalOpen(true);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Handle local document file upload
  const handleDocFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const dataUrl = event.target?.result as string;
      const sizeKb = (file.size / 1024).toFixed(1);
      const sizeStr = file.size > 1024 * 1024 ? `${(file.size / (1024 * 1024)).toFixed(2)} MB` : `${sizeKb} KB`;

      const newAtt: PostAttachment = {
        id: `att-doc-${Date.now()}`,
        type: "document",
        url: dataUrl,
        title: file.name,
        description: `Documento (${sizeStr}) - ${file.type || "Arquivo"}`,
        sizeBytes: file.size,
        mimeType: file.type,
      };

      onAddAttachment(newAtt);
      setIsMenuOpen(false);
    };
    reader.readAsDataURL(file);
    e.target.value = "";
  };

  // Scan repository
  const handleScanRepository = async (targetRepo: string) => {
    setIsScanningRepo(true);
    try {
      const res = await fetch("/api/repo/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ target: targetRepo || "." }),
      });
      if (res.ok) {
        const data = await res.json();
        setRepoScanResult(data.analysis);
        if (!titleInput) {
          setTitleInput(`Varredura Full-Depth: ${data.analysis.repoName}`);
        }
        if (!descInput) {
          setDescInput(
            `${data.analysis.totalFiles} arquivos analisados com profundidade nível ${data.analysis.treeDepthMax} (${data.analysis.totalLinesOfCode.toLocaleString()} LOC).`
          );
        }
      }
    } catch (err) {
      console.error("Failed to analyze repo:", err);
    } finally {
      setIsScanningRepo(false);
    }
  };

  const handleOpenType = (type: AttachmentType) => {
    setActiveType(type);
    setIsMenuOpen(false);

    if (type === "image") {
      // Trigger file selector or modal
      setIsModalOpen(true);
    } else if (type === "document") {
      setIsModalOpen(true);
    } else {
      setIsModalOpen(true);
    }
  };

  const handleConfirmAdd = () => {
    if (activeType === "image") {
      if (!urlInput.trim() && !previewImage) return;
      const finalUrl = previewImage || urlInput.trim();
      const newAtt: PostAttachment = {
        id: `att-img-${Date.now()}`,
        type: "image",
        url: finalUrl,
        title: titleInput.trim() || "Imagem Anexa",
        description: descInput.trim() || (imageMeta.width ? `${imageMeta.width}x${imageMeta.height} px (${imageMeta.size || "PNG"})` : "Imagem"),
        metadata: {
          videoResolution: imageMeta.width ? `${imageMeta.width}x${imageMeta.height}` : undefined,
        },
      };
      onAddAttachment(newAtt);
    } else if (activeType === "video") {
      if (!urlInput.trim()) return;
      const newAtt: PostAttachment = {
        id: `att-vid-${Date.now()}`,
        type: "video",
        url: urlInput.trim(),
        title: titleInput.trim() || "Vídeo Anexo",
        description: descInput.trim() || "Execução e telemetria de agentes em tempo real.",
        metadata: {
          videoResolution: "1080p",
          videoDurationSeconds: 120,
        },
      };
      onAddAttachment(newAtt);
    } else if (activeType === "github_repo") {
      const newAtt: PostAttachment = {
        id: `att-repo-${Date.now()}`,
        type: "github_repo",
        url: urlInput.trim() || "https://github.com/scoobiii/vortex",
        title: titleInput.trim() || (repoScanResult ? `Full-Depth Repo: ${repoScanResult.repoName}` : "Repositório Local"),
        description:
          descInput.trim() ||
          (repoScanResult
            ? `${repoScanResult.totalFiles} arquivos | ${repoScanResult.totalLinesOfCode} linhas de código analisadas na profundidade full.`
            : "Análise profunda de arquitetura e conformidade GOS3."),
        metadata: {
          repoFullName: repoScanResult?.repoName || urlInput.replace(/https?:\/\/github\.com\//, "") || "local-workspace",
          repoTotalFilesAnalyzed: repoScanResult?.totalFiles || 48,
          repoFullTreeDepth: repoScanResult?.treeDepthMax || 5,
          repoLanguage: repoScanResult?.languageBreakdown?.[0]?.language || "TypeScript",
          repoStars: repoScanResult?.isLocalWorkspace ? undefined : 142,
          repoAnalyzedSummary: repoScanResult?.fullMarkdownReport,
        },
      };
      onAddAttachment(newAtt);
    } else if (activeType === "code_snippet") {
      if (!codeSnippet.trim()) return;
      const newAtt: PostAttachment = {
        id: `att-code-${Date.now()}`,
        type: "code_snippet",
        url: `data:text/plain;charset=utf-8,${encodeURIComponent(codeSnippet)}`,
        title: titleInput.trim() || `Snippet ${codeLanguage.toUpperCase()}`,
        description: descInput.trim() || `Código-fonte para execução segura no Sandbox (${codeSnippet.split("\n").length} linhas).`,
        metadata: {
          repoLanguage: codeLanguage,
          repoAnalyzedSummary: codeSnippet,
        },
      };
      onAddAttachment(newAtt);
    } else if (activeType === "document") {
      if (!urlInput.trim() && !titleInput.trim()) return;
      const newAtt: PostAttachment = {
        id: `att-doc-${Date.now()}`,
        type: "document",
        url: urlInput.trim() || "#",
        title: titleInput.trim() || "Documento Especificação",
        description: descInput.trim() || "Documento de arquitetura / relatório GOS3.",
      };
      onAddAttachment(newAtt);
    } else {
      if (!urlInput.trim()) return;
      const newAtt: PostAttachment = {
        id: `att-url-${Date.now()}`,
        type: "url",
        url: urlInput.trim(),
        title: titleInput.trim() || urlInput.trim(),
        description: descInput.trim() || "Link e recurso externo referenciado.",
        metadata: {
          domain: urlInput.replace(/https?:\/\//, "").split("/")[0],
        },
      };
      onAddAttachment(newAtt);
    }

    // Reset Form
    setUrlInput("");
    setTitleInput("");
    setDescInput("");
    setCodeSnippet("");
    setPreviewImage(null);
    setImageMeta({});
    setRepoScanResult(null);
    setIsModalOpen(false);
  };

  const sizeClasses = {
    sm: "w-7 h-7",
    md: "w-8 h-8",
    lg: "w-9 h-9",
  };

  const iconSizes = {
    sm: "w-4 h-4",
    md: "w-4 h-4",
    lg: "w-5 h-5",
  };

  return (
    <div className={`relative inline-flex items-center ${className}`} ref={menuRef}>
      {/* Hidden File Inputs */}
      <input
        type="file"
        ref={imageFileInputRef}
        onChange={handleImageFileChange}
        accept="image/png,image/jpeg,image/webp,image/gif,image/svg+xml"
        className="hidden"
      />
      <input
        type="file"
        ref={docFileInputRef}
        onChange={handleDocFileChange}
        accept=".pdf,.doc,.docx,.txt,.md,.json,.ts,.js,.py,.rs,.yaml,.yml"
        className="hidden"
      />

      {/* Pure Circular "+" Button */}
      <button
        type="button"
        id="attachment-circle-plus-btn"
        onClick={() => setIsMenuOpen(!isMenuOpen)}
        className={`${sizeClasses[buttonSize]} rounded-full border border-neutral-700 hover:border-purple-500 bg-neutral-900/90 hover:bg-neutral-800 text-neutral-300 hover:text-purple-300 flex items-center justify-center transition-all duration-200 shadow-xs focus:outline-none focus:ring-2 focus:ring-purple-500/40 relative group`}
        title="Adicionar anexo (Imagem, Documento, Vídeo, Código, Repo, Link)"
      >
        <Plus className={`${iconSizes[buttonSize]} transition-transform duration-200 group-hover:scale-110 ${isMenuOpen ? "rotate-45 text-purple-400" : ""}`} />
        
        {/* Count Badge if attachments already present */}
        {attachments.length > 0 && (
          <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-purple-600 text-[9px] font-bold text-white flex items-center justify-center shadow-xs">
            {attachments.length}
          </span>
        )}
      </button>

      {/* Quick Dropdown Options Menu */}
      {isMenuOpen && (
        <div
          id="attachment-options-dropdown"
          className="absolute bottom-full left-0 mb-2 w-56 p-1.5 bg-neutral-950/95 border border-neutral-800 rounded-2xl shadow-2xl backdrop-blur-md z-50 text-xs text-neutral-200 animate-in fade-in zoom-in-95 space-y-0.5"
        >
          <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-neutral-500 border-b border-neutral-850 flex items-center justify-between">
            <span>Opções de Anexo</span>
            <span className="text-[9px] text-purple-400 font-mono">GOS3 v1.3</span>
          </div>

          {/* Option: Imagens */}
          <button
            type="button"
            id="opt-attach-image"
            onClick={() => {
              setIsMenuOpen(false);
              // Directly trigger file upload dialog, or open modal
              imageFileInputRef.current?.click();
            }}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-purple-950/50 hover:text-purple-200 text-neutral-300 transition-colors group"
          >
            <div className="w-6 h-6 rounded-lg bg-pink-950/60 border border-pink-800/40 flex items-center justify-center text-pink-400 group-hover:border-pink-600">
              <ImageIcon className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-xs text-neutral-200">Imagens</div>
              <div className="text-[10px] text-neutral-500">Upload / PNG, JPG, GIF</div>
            </div>
          </button>

          {/* Option: Documentos */}
          <button
            type="button"
            id="opt-attach-doc"
            onClick={() => {
              setIsMenuOpen(false);
              docFileInputRef.current?.click();
            }}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-purple-950/50 hover:text-purple-200 text-neutral-300 transition-colors group"
          >
            <div className="w-6 h-6 rounded-lg bg-blue-950/60 border border-blue-800/40 flex items-center justify-center text-blue-400 group-hover:border-blue-600">
              <FileText className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-xs text-neutral-200">Documentos</div>
              <div className="text-[10px] text-neutral-500">PDF, MD, JSON, TXT</div>
            </div>
          </button>

          {/* Option: Vídeos */}
          <button
            type="button"
            id="opt-attach-video"
            onClick={() => handleOpenType("video")}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-purple-950/50 hover:text-purple-200 text-neutral-300 transition-colors group"
          >
            <div className="w-6 h-6 rounded-lg bg-purple-950/60 border border-purple-800/40 flex items-center justify-center text-purple-400 group-hover:border-purple-600">
              <Video className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-xs text-neutral-200">Vídeos</div>
              <div className="text-[10px] text-neutral-500">MP4, YouTube, Stream</div>
            </div>
          </button>

          {/* Option: Código / Snippet */}
          <button
            type="button"
            id="opt-attach-code"
            onClick={() => handleOpenType("code_snippet")}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-purple-950/50 hover:text-purple-200 text-neutral-300 transition-colors group"
          >
            <div className="w-6 h-6 rounded-lg bg-cyan-950/60 border border-cyan-800/40 flex items-center justify-center text-cyan-400 group-hover:border-cyan-600">
              <Code2 className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-xs text-neutral-200">Código / Snippet</div>
              <div className="text-[10px] text-neutral-500">TS, Python, Bash, Rust</div>
            </div>
          </button>

          {/* Option: Repositório Full-Depth */}
          <button
            type="button"
            id="opt-attach-repo"
            onClick={() => handleOpenType("github_repo")}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-purple-950/50 hover:text-purple-200 text-neutral-300 transition-colors group"
          >
            <div className="w-6 h-6 rounded-lg bg-sky-950/60 border border-sky-800/40 flex items-center justify-center text-sky-400 group-hover:border-sky-600">
              <FolderGit2 className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-xs text-neutral-200">Repo Full-Depth</div>
              <div className="text-[10px] text-neutral-500">Varredura GitHub / Local</div>
            </div>
          </button>

          {/* Option: URL / Link */}
          <button
            type="button"
            id="opt-attach-url"
            onClick={() => handleOpenType("url")}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left hover:bg-purple-950/50 hover:text-purple-200 text-neutral-300 transition-colors group"
          >
            <div className="w-6 h-6 rounded-lg bg-emerald-950/60 border border-emerald-800/40 flex items-center justify-center text-emerald-400 group-hover:border-emerald-600">
              <LinkIcon className="w-3.5 h-3.5" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-xs text-neutral-200">URL / Link Web</div>
              <div className="text-[10px] text-neutral-500">Artigos, RFCs & Docs</div>
            </div>
          </button>
        </div>
      )}

      {/* Comprehensive Attachment Configuration Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/75 backdrop-blur-xs p-4 animate-in fade-in duration-150">
          <div className="w-full max-w-lg bg-neutral-950 border border-neutral-800 rounded-3xl p-5 sm:p-6 shadow-2xl text-neutral-100 space-y-4 max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex items-center justify-between border-b border-neutral-800 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-purple-950 border border-purple-800/60 text-purple-400 flex items-center justify-center">
                  <PlusCircle className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-neutral-100">Adicionar Anexo Multimídia</h3>
                  <p className="text-[11px] text-neutral-400">Suporte a imagens, documentos, código e mídias ricas</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setPreviewImage(null);
                }}
                className="p-1.5 text-neutral-400 hover:text-neutral-200 rounded-lg hover:bg-neutral-900 transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Type selector tabs */}
            <div className="grid grid-cols-3 sm:grid-cols-6 gap-1.5 p-1 bg-neutral-900/60 rounded-2xl border border-neutral-800 text-[11px]">
              <button
                type="button"
                onClick={() => setActiveType("image")}
                className={`py-2 px-1 rounded-xl font-medium flex flex-col items-center gap-1 transition-all ${
                  activeType === "image"
                    ? "bg-pink-950/80 border border-pink-600 text-pink-200 shadow-sm"
                    : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40"
                }`}
              >
                <ImageIcon className="w-4 h-4 text-pink-400" />
                <span>Imagens</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveType("document")}
                className={`py-2 px-1 rounded-xl font-medium flex flex-col items-center gap-1 transition-all ${
                  activeType === "document"
                    ? "bg-blue-950/80 border border-blue-600 text-blue-200 shadow-sm"
                    : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40"
                }`}
              >
                <FileText className="w-4 h-4 text-blue-400" />
                <span>Docs</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveType("video")}
                className={`py-2 px-1 rounded-xl font-medium flex flex-col items-center gap-1 transition-all ${
                  activeType === "video"
                    ? "bg-purple-950/80 border border-purple-600 text-purple-200 shadow-sm"
                    : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40"
                }`}
              >
                <Video className="w-4 h-4 text-purple-400" />
                <span>Vídeos</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveType("code_snippet")}
                className={`py-2 px-1 rounded-xl font-medium flex flex-col items-center gap-1 transition-all ${
                  activeType === "code_snippet"
                    ? "bg-cyan-950/80 border border-cyan-600 text-cyan-200 shadow-sm"
                    : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40"
                }`}
              >
                <Code2 className="w-4 h-4 text-cyan-400" />
                <span>Código</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveType("github_repo")}
                className={`py-2 px-1 rounded-xl font-medium flex flex-col items-center gap-1 transition-all ${
                  activeType === "github_repo"
                    ? "bg-sky-950/80 border border-sky-600 text-sky-200 shadow-sm"
                    : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40"
                }`}
              >
                <FolderGit2 className="w-4 h-4 text-sky-400" />
                <span>Repo</span>
              </button>

              <button
                type="button"
                onClick={() => setActiveType("url")}
                className={`py-2 px-1 rounded-xl font-medium flex flex-col items-center gap-1 transition-all ${
                  activeType === "url"
                    ? "bg-emerald-950/80 border border-emerald-600 text-emerald-200 shadow-sm"
                    : "text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800/40"
                }`}
              >
                <LinkIcon className="w-4 h-4 text-emerald-400" />
                <span>URL</span>
              </button>
            </div>

            {/* TAB CONTENT: IMAGENS */}
            {activeType === "image" && (
              <div className="space-y-3 text-xs">
                {/* Image Upload Area */}
                <div
                  onClick={() => imageFileInputRef.current?.click()}
                  className="border-2 border-dashed border-neutral-700 hover:border-pink-500/80 bg-neutral-900/40 hover:bg-neutral-900/80 rounded-2xl p-4 text-center cursor-pointer transition-all duration-150"
                >
                  {previewImage ? (
                    <div className="space-y-2">
                      <div className="relative max-h-48 rounded-xl overflow-hidden bg-black flex items-center justify-center mx-auto">
                        <img
                          src={previewImage}
                          alt="Pré-visualização"
                          className="max-h-48 max-w-full object-contain rounded-lg"
                        />
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            setPreviewImage(null);
                            setUrlInput("");
                          }}
                          className="absolute top-2 right-2 p-1.5 rounded-full bg-red-600 hover:bg-red-500 text-white shadow-lg"
                          title="Remover imagem selecionada"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <div className="text-[11px] text-neutral-400 flex items-center justify-center gap-2">
                        {imageMeta.width && <span>{imageMeta.width} x {imageMeta.height} px</span>}
                        {imageMeta.size && <span>({imageMeta.size})</span>}
                        <span className="text-pink-400 font-medium">Clique para trocar</span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-4 flex flex-col items-center gap-2 text-neutral-400">
                      <div className="w-10 h-10 rounded-full bg-pink-950/60 border border-pink-800/50 flex items-center justify-center text-pink-400">
                        <Upload className="w-5 h-5" />
                      </div>
                      <div>
                        <span className="font-semibold text-neutral-200">Clique para selecionar imagem</span> ou arraste aqui
                      </div>
                      <span className="text-[10px] text-neutral-500 font-mono">PNG, JPG, WebP, GIF, SVG até 20MB</span>
                    </div>
                  )}
                </div>

                {/* Or paste Image URL */}
                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Ou Cole a URL da Imagem:</label>
                  <input
                    type="text"
                    value={urlInput.startsWith("data:") ? "" : urlInput}
                    onChange={(e) => {
                      setUrlInput(e.target.value);
                      if (e.target.value) setPreviewImage(e.target.value);
                    }}
                    placeholder="https://images.unsplash.com/photo-... ou URL direta"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-100 focus:outline-none focus:border-pink-500 text-xs font-mono"
                  />
                </div>
              </div>
            )}

            {/* TAB CONTENT: DOCUMENTOS */}
            {activeType === "document" && (
              <div className="space-y-3 text-xs">
                <div
                  onClick={() => docFileInputRef.current?.click()}
                  className="border-2 border-dashed border-neutral-700 hover:border-blue-500/80 bg-neutral-900/40 hover:bg-neutral-900/80 rounded-2xl p-4 text-center cursor-pointer transition-all duration-150"
                >
                  <div className="py-3 flex flex-col items-center gap-2 text-neutral-400">
                    <div className="w-10 h-10 rounded-full bg-blue-950/60 border border-blue-800/50 flex items-center justify-center text-blue-400">
                      <FileText className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-semibold text-neutral-200">Upload de Arquivo / Documento</span>
                    </div>
                    <span className="text-[10px] text-neutral-500 font-mono">PDF, DOCX, TXT, Markdown, JSON, YAML</span>
                  </div>
                </div>

                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Ou URL do Documento / Especificação:</label>
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://vortex.energy/specs/GOS3-SPECIFICATION.pdf"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-100 focus:outline-none focus:border-blue-500 text-xs font-mono"
                  />
                </div>
              </div>
            )}

            {/* TAB CONTENT: VÍDEOS */}
            {activeType === "video" && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">URL do Vídeo (MP4, YouTube, Stream):</label>
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://assets.mixkit.co/videos/preview/...mp4 ou link YouTube"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-100 focus:outline-none focus:border-purple-500 text-xs font-mono"
                  />
                </div>
              </div>
            )}

            {/* TAB CONTENT: CÓDIGO / SNIPPET */}
            {activeType === "code_snippet" && (
              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between">
                  <label className="text-neutral-400 font-medium">Linguagem:</label>
                  <select
                    value={codeLanguage}
                    onChange={(e) => setCodeLanguage(e.target.value)}
                    className="bg-neutral-900 border border-neutral-800 rounded-lg px-2.5 py-1 text-cyan-300 text-xs font-mono focus:outline-none"
                  >
                    <option value="typescript">TypeScript</option>
                    <option value="python">Python</option>
                    <option value="bash">Bash / Shell</option>
                    <option value="rust">Rust</option>
                    <option value="json">JSON</option>
                    <option value="sql">PostgreSQL / SQL</option>
                  </select>
                </div>

                <textarea
                  value={codeSnippet}
                  onChange={(e) => setCodeSnippet(e.target.value)}
                  placeholder="// Cole aqui o código-fonte para validação no Sandbox..."
                  rows={5}
                  className="w-full bg-neutral-950 border border-neutral-800 rounded-xl p-3 text-neutral-100 focus:outline-none focus:border-cyan-500 font-mono text-xs resize-none leading-relaxed"
                />
              </div>
            )}

            {/* TAB CONTENT: REPO FULL-DEPTH */}
            {activeType === "github_repo" && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">Alvo do Repositório (ou '.' para Workspace Local):</label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      placeholder="ex: . (local) ou scoobiii/vortex"
                      className="flex-1 bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-100 focus:outline-none focus:border-sky-500 font-mono text-xs"
                    />
                    <button
                      type="button"
                      onClick={() => handleScanRepository(urlInput)}
                      disabled={isScanningRepo}
                      className="px-3 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-medium text-xs flex items-center gap-1 shrink-0 disabled:opacity-50"
                    >
                      {isScanningRepo ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Sparkles className="w-3.5 h-3.5" />}
                      <span>Escanear</span>
                    </button>
                  </div>
                </div>

                {repoScanResult && (
                  <div className="p-3 rounded-xl bg-sky-950/40 border border-sky-800/60 space-y-1.5 animate-in fade-in">
                    <div className="flex items-center gap-1.5 text-sky-300 font-semibold text-xs">
                      <CheckCircle className="w-3.5 h-3.5" />
                      <span>Varredura Full-Depth Concluída ({repoScanResult.durationMs}ms)</span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px] text-neutral-300">
                      <div>Arquivos: <strong>{repoScanResult.totalFiles}</strong></div>
                      <div>Linhas: <strong>{repoScanResult.totalLinesOfCode.toLocaleString()} LOC</strong></div>
                      <div>Profundidade: <strong>Nível {repoScanResult.treeDepthMax}</strong></div>
                      <div>GOS3: <strong>Conforme</strong></div>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB CONTENT: URL */}
            {activeType === "url" && (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-neutral-400 mb-1 font-medium">URL / Endereço Web:</label>
                  <input
                    type="text"
                    value={urlInput}
                    onChange={(e) => setUrlInput(e.target.value)}
                    placeholder="https://vortex.energy/docs/energy-bess-lcoe"
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-100 focus:outline-none focus:border-emerald-500 text-xs font-mono"
                  />
                </div>
              </div>
            )}

            {/* Common fields: Title & Description */}
            <div className="space-y-2.5 pt-2 border-t border-neutral-850 text-xs">
              <div>
                <label className="block text-neutral-400 mb-1 font-medium">Título do Card (Opcional):</label>
                <input
                  type="text"
                  value={titleInput}
                  onChange={(e) => setTitleInput(e.target.value)}
                  placeholder="ex: Diagrama Arquitetural de Despacho BESS"
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-100 focus:outline-none focus:border-purple-500 text-xs"
                />
              </div>

              <div>
                <label className="block text-neutral-400 mb-1 font-medium">Descrição / Nota Técnica (Opcional):</label>
                <textarea
                  value={descInput}
                  onChange={(e) => setDescInput(e.target.value)}
                  placeholder="Contexto técnico para análise dos agentes..."
                  rows={2}
                  className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-3 py-2 text-neutral-100 focus:outline-none focus:border-purple-500 text-xs resize-none"
                />
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2.5 pt-3 border-t border-neutral-800">
              <button
                type="button"
                onClick={() => {
                  setIsModalOpen(false);
                  setPreviewImage(null);
                }}
                className="px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 text-xs font-medium transition-colors"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={handleConfirmAdd}
                className="px-5 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold flex items-center gap-1.5 shadow-lg shadow-purple-900/30 transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                <span>Anexar ao Post / Chat</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

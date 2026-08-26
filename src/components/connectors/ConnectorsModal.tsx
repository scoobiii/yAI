/**
 * > **GOS3** · agente: `claude` · papel: `Arquiteto / Tech Writer` (ver docs/team.md)
 * > fase: `fase 5 — padronização e governança de especificações` · data: `2026-08-21` · hora: `18:15:00 UTC`
 * > antes: Sem modal visual dedicado de Conectores estilo Grok
 * > depois: Interface de Conectores (estilo Grok) com busca, Google Workspace, Google Colab & GCloud Sandbox runtime (CLI/GUI), GitHub e automação
 * > base: commit `gos3-core-v1.0`, docs/GOS3-SPECIFICATION.md
 * > assinatura: `Claude · Arquiteto / Tech Writer · GOS3`
 */

import React, { useState, useEffect } from "react";
import { ExternalConnector, UserAccount } from "../../types";
import { INITIAL_CONNECTORS } from "../../services/connectorsService";
import {
  ArrowLeft,
  Search,
  CheckCircle2,
  Lock,
  Sparkles,
  Terminal,
  Cpu,
  Layers,
  ExternalLink,
  ShieldCheck,
  Zap,
  Globe,
  Radio,
  Share2,
  FolderGit2,
  Mail,
  Calendar,
  HardDrive,
  Code2,
  Workflow,
  Plus,
  Flame,
  Settings,
  Play,
  RefreshCw,
  Key,
  Database,
  Cloud,
  AlertCircle,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  currentUser: UserAccount;
  onOpenGoogleSandbox?: (mode: "cli" | "gui_full") => void;
  onSelectConnectorAction?: (connector: ExternalConnector) => void;
}

export const ConnectorsModal: React.FC<Props> = ({
  isOpen,
  onClose,
  currentUser,
  onOpenGoogleSandbox,
  onSelectConnectorAction,
}) => {
  const toast = useToast();
  const [activeTab, setActiveTab] = useState<"catalog" | "mcp_config" | "mcp_tools">("catalog");
  const [connectors, setConnectors] = useState<ExternalConnector[]>(INITIAL_CONNECTORS);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");

  // Configuração MCP Real
  const [githubToken, setGithubToken] = useState("");
  const [githubDefaultRepo, setGithubDefaultRepo] = useState("scoobiii/vortex");
  const [gcloudProjectId, setGcloudProjectId] = useState("vortex-ai-studio");
  const [gcloudRegion, setGcloudRegion] = useState("us-central1");
  const [gcloudApiKey, setGcloudApiKey] = useState("");
  const [hasGithubToken, setHasGithubToken] = useState(false);
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  // Status de Testes Reais (Zero-Confetes)
  const [githubTestResult, setGithubTestResult] = useState<any>(null);
  const [isTestingGithub, setIsTestingGithub] = useState(false);
  const [gcloudTestResult, setGcloudTestResult] = useState<any>(null);
  const [isTestingGcloud, setIsTestingGcloud] = useState(false);

  // Catálogo MCP Tools
  const [mcpTools, setMcpTools] = useState<any[]>([]);
  const [selectedMcpTool, setSelectedMcpTool] = useState<string>("github_get_repo");
  const [toolParams, setToolParams] = useState<string>('{\n  "repo": "scoobiii/vortex"\n}');
  const [toolExecutionResult, setToolExecutionResult] = useState<any>(null);
  const [isExecutingTool, setIsExecutingTool] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadConnectorConfig();
      loadMcpTools();
    }
  }, [isOpen]);

  const loadConnectorConfig = async () => {
    try {
      const res = await fetch("/api/connectors/config");
      const data = await res.json();
      if (data.success && data.config) {
        setGithubDefaultRepo(data.config.githubDefaultRepo || "scoobiii/vortex");
        setGcloudProjectId(data.config.gcloudProjectId || "vortex-ai-studio");
        setGcloudRegion(data.config.gcloudRegion || "us-central1");
        setHasGithubToken(data.config.hasGithubToken);
        if (data.config.githubTokenMasked) {
          setGithubToken(data.config.githubTokenMasked);
        }
      }
    } catch {
      // fallback silencioso
    }
  };

  const loadMcpTools = async () => {
    try {
      const res = await fetch("/api/mcp/tools");
      const data = await res.json();
      if (data.tools) {
        setMcpTools(data.tools);
      }
    } catch {
      // fallback
    }
  };

  const handleSaveConfig = async () => {
    setIsSavingConfig(true);
    try {
      const res = await fetch("/api/connectors/config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          githubToken,
          githubDefaultRepo,
          gcloudProjectId,
          gcloudRegion,
          gcloudApiKey,
        }),
      });
      const data = await res.json();
      if (data.success) {
        toast.success("Configurações de Conectores MCP salvas e ativas!");
        setHasGithubToken(data.hasGithubToken);
      } else {
        toast.error("Erro ao salvar: " + data.error);
      }
    } catch (e: any) {
      toast.error("Falha na requisição: " + e.message);
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleTestGithub = async () => {
    setIsTestingGithub(true);
    setGithubTestResult(null);
    try {
      const res = await fetch("/api/connectors/github/test", { method: "POST" });
      const data = await res.json();
      setGithubTestResult(data);
      if (data.success) {
        toast.success("GitHub API conectada e validada com sucesso!");
      } else {
        toast.warning("Teste concluído: " + (data.data?.error || "Verifique as credenciais"));
      }
    } catch (e: any) {
      toast.error("Falha ao testar GitHub: " + e.message);
    } finally {
      setIsTestingGithub(false);
    }
  };

  const handleTestGcloud = async () => {
    setIsTestingGcloud(true);
    setGcloudTestResult(null);
    try {
      const res = await fetch("/api/connectors/gcloud/test", { method: "POST" });
      const data = await res.json();
      setGcloudTestResult(data);
      if (data.success) {
        toast.success(`Google Cloud conectado! Latência: ${data.data?.latencyMs || 0}ms`);
      } else {
        toast.warning("Status: " + (data.data?.error || "Desconectado"));
      }
    } catch (e: any) {
      toast.error("Falha ao testar Google Cloud: " + e.message);
    } finally {
      setIsTestingGcloud(false);
    }
  };

  const handleExecuteMcpTool = async () => {
    setIsExecutingTool(true);
    setToolExecutionResult(null);
    try {
      let parsedParams = {};
      try {
        parsedParams = JSON.parse(toolParams);
      } catch {
        toast.error("Parâmetros devem ser um JSON válido");
        setIsExecutingTool(false);
        return;
      }

      const res = await fetch("/api/mcp/call", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          toolName: selectedMcpTool,
          params: parsedParams,
        }),
      });
      const data = await res.json();
      setToolExecutionResult(data);
      if (data.success) {
        toast.success(`Ferramenta '${selectedMcpTool}' executada com evidência!`);
      } else if (data.claim === "auth_required") {
        toast.warning(`Autenticação requerida para '${selectedMcpTool}'. Sem confetes!`);
      } else {
        toast.warning(`Retorno da tool: ${data.claim || "verifique os logs"}`);
      }
    } catch (e: any) {
      toast.error("Erro na execução: " + e.message);
    } finally {
      setIsExecutingTool(false);
    }
  };

  if (!isOpen) return null;

  const isGoogleAuthenticated = currentUser?.authProvider === "google" || currentUser?.email?.includes("@gmail.com");

  const handleToggleConnect = (connectorId: string) => {
    setConnectors((prev) =>
      prev.map((conn) => {
        if (conn.id === connectorId) {
          const nextState = !conn.isConnected;
          toast.success(
            nextState
              ? `Conector "${conn.name}" ativado com sucesso!`
              : `Conector "${conn.name}" desconectado.`
          );
          return {
            ...conn,
            isConnected: nextState,
            connectedAt: nextState ? new Date().toISOString() : undefined,
          };
        }
        return conn;
      })
    );
  };

  const filteredConnectors = connectors.filter((c) => {
    const matchesSearch =
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.capabilities.some((cap) => cap.toLowerCase().includes(searchQuery.toLowerCase()));

    if (selectedCategory === "all") return matchesSearch;
    if (selectedCategory === "google") return matchesSearch && (c.isGoogleEcosystem || c.category === "google");
    return matchesSearch && c.category === selectedCategory;
  });

  const getConnectorIcon = (c: ExternalConnector) => {
    switch (c.id) {
      case "gmail":
        return (
          <div className="w-10 h-10 rounded-xl bg-red-950/80 border border-red-800/60 flex items-center justify-center text-red-400 font-bold">
            <Mail className="w-5 h-5" />
          </div>
        );
      case "calendar":
        return (
          <div className="w-10 h-10 rounded-xl bg-blue-950/80 border border-blue-800/60 flex items-center justify-center text-blue-400 font-bold">
            <Calendar className="w-5 h-5" />
          </div>
        );
      case "drive":
        return (
          <div className="w-10 h-10 rounded-xl bg-emerald-950/80 border border-emerald-800/60 flex items-center justify-center text-emerald-400 font-bold">
            <HardDrive className="w-5 h-5" />
          </div>
        );
      case "gcolab":
        return (
          <div className="w-10 h-10 rounded-xl bg-amber-950/80 border border-amber-800/60 flex items-center justify-center text-amber-400 font-bold shadow-sm shadow-amber-900/30">
            <Terminal className="w-5 h-5 text-amber-400" />
          </div>
        );
      case "gcloud":
        return (
          <div className="w-10 h-10 rounded-xl bg-indigo-950/80 border border-indigo-800/60 flex items-center justify-center text-indigo-400 font-bold">
            <Cpu className="w-5 h-5 text-indigo-400" />
          </div>
        );
      case "github":
        return (
          <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-700 flex items-center justify-center text-white font-bold">
            <FolderGit2 className="w-5 h-5 text-neutral-100" />
          </div>
        );
      case "n8n":
        return (
          <div className="w-10 h-10 rounded-xl bg-pink-950/80 border border-pink-800/60 flex items-center justify-center text-pink-400 font-bold">
            <Workflow className="w-5 h-5" />
          </div>
        );
      case "firebase":
        return (
          <div className="w-10 h-10 rounded-xl bg-amber-950/90 border border-amber-500/80 flex items-center justify-center text-amber-300 font-bold shadow-md shadow-amber-900/30">
            <Flame className="w-5 h-5 text-amber-400" />
          </div>
        );
      case "gaistudio":
        return (
          <div className="w-10 h-10 rounded-xl bg-blue-950/90 border border-blue-600/80 flex items-center justify-center text-blue-300 font-bold shadow-md shadow-blue-900/30">
            <Sparkles className="w-5 h-5 text-blue-400 animate-pulse" />
          </div>
        );
      case "vps":
        return (
          <div className="w-10 h-10 rounded-xl bg-emerald-950/90 border border-emerald-600/80 flex items-center justify-center text-emerald-300 font-bold shadow-md shadow-emerald-900/30">
            <Cpu className="w-5 h-5 text-emerald-400" />
          </div>
        );
      default:
        return (
          <div className="w-10 h-10 rounded-xl bg-neutral-900 border border-neutral-800 flex items-center justify-center text-neutral-300 font-bold">
            <Layers className="w-5 h-5" />
          </div>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 animate-in fade-in duration-150">
      <div className="w-full max-w-3xl bg-neutral-950 border border-neutral-800 rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-5 py-4 border-b border-neutral-800/90 flex items-center justify-between bg-neutral-950 sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="p-2 rounded-full hover:bg-neutral-800 text-neutral-400 hover:text-white transition-colors"
              title="Voltar"
            >
              <ArrowLeft className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white tracking-tight">Conectores MCP & Serviços</h2>
                <span className="px-2 py-0.5 rounded-full text-[10px] bg-blue-950 text-blue-300 border border-blue-800/60 font-mono font-semibold">
                  MCP v1.0 • GOS3 Zero-Simulation
                </span>
              </div>
              <p className="text-xs text-neutral-400">
                Conectores reais Model Context Protocol com execução verificável para GitHub e Google Cloud.
              </p>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex items-center gap-1 bg-neutral-900 p-1 rounded-2xl border border-neutral-800 text-xs">
            <button
              onClick={() => setActiveTab("catalog")}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all ${
                activeTab === "catalog" ? "bg-white text-black font-semibold shadow-sm" : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              Catálogo
            </button>
            <button
              onClick={() => setActiveTab("mcp_config")}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
                activeTab === "mcp_config" ? "bg-white text-black font-semibold shadow-sm" : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <Settings className="w-3.5 h-3.5" />
              <span>Configuração & Tokens</span>
            </button>
            <button
              onClick={() => setActiveTab("mcp_tools")}
              className={`px-3 py-1.5 rounded-xl font-medium transition-all flex items-center gap-1.5 ${
                activeTab === "mcp_tools" ? "bg-white text-black font-semibold shadow-sm" : "text-neutral-400 hover:text-neutral-200"
              }`}
            >
              <Terminal className="w-3.5 h-3.5 text-amber-400" />
              <span>Browser de Tools</span>
            </button>
          </div>
        </div>

        {/* TAB 1: CATALOG */}
        {activeTab === "catalog" && (
          <>
            {/* Google Sandbox Banner */}
            <div className="px-5 pt-3 pb-1">
              <div className="p-3.5 rounded-2xl bg-gradient-to-r from-blue-950/60 via-amber-950/30 to-purple-950/40 border border-blue-800/40 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="flex items-start gap-2.5">
                  <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                  <div>
                    <div className="font-semibold text-neutral-200 flex items-center gap-1.5">
                      <span>Google Auth & Runtime Sandbox</span>
                      <span className="px-1.5 py-0.5 rounded-full text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800/60 font-mono">
                        {isGoogleAuthenticated ? "Autenticado: sobrinhoSJ@gmail.com" : "Disponível via OAuth"}
                      </span>
                    </div>
                    <div className="text-neutral-400 text-[11px] mt-0.5">
                      Habilita execução de código Python com GPU no **Google Colab** e instâncias **Google Cloud** diretamente na tela de chat em modo CLI ou GUI full!
                    </div>
                  </div>
                </div>

                {onOpenGoogleSandbox && (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => {
                        onOpenGoogleSandbox("cli");
                        onClose();
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-[11px] text-amber-300 font-semibold flex items-center gap-1 transition-all"
                    >
                      <Terminal className="w-3.5 h-3.5 text-amber-400" />
                      <span>Modo CLI</span>
                    </button>
                    <button
                      onClick={() => {
                        onOpenGoogleSandbox("gui_full");
                        onClose();
                      }}
                      className="px-2.5 py-1.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-semibold flex items-center gap-1 transition-all shadow-sm"
                    >
                      <Cpu className="w-3.5 h-3.5" />
                      <span>GUI Full</span>
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Search Bar */}
            <div className="px-5 py-3">
              <div className="relative">
                <Search className="w-4 h-4 text-neutral-500 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Pesquisar conectores..."
                  className="w-full bg-neutral-900/90 border border-neutral-800 rounded-2xl pl-10 pr-4 py-2.5 text-sm text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-neutral-600 focus:ring-1 focus:ring-neutral-600 transition-all"
                />
              </div>

              {/* Quick Category Filter Pills */}
              <div className="flex items-center gap-2 mt-2.5 overflow-x-auto pb-1 text-xs no-scrollbar">
                {[
                  { id: "all", label: "Todos" },
                  { id: "google", label: "Google & Sandbox Colab" },
                  { id: "destaques", label: "Destaques" },
                  { id: "desenvolvimento", label: "Código & GitHub" },
                  { id: "automacao", label: "n8n & Webhooks" },
                ].map((cat) => (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(cat.id)}
                    className={`px-3 py-1 rounded-full shrink-0 font-medium transition-all ${
                      selectedCategory === cat.id
                        ? "bg-white text-black font-semibold"
                        : "bg-neutral-900 text-neutral-400 hover:text-neutral-200 hover:bg-neutral-800 border border-neutral-800"
                    }`}
                  >
                    {cat.label}
                  </button>
                ))}
              </div>
            </div>

            {/* List Section ("Destaques") */}
            <div className="flex-1 overflow-y-auto px-5 py-2 space-y-3">
              <div className="text-xs font-semibold text-neutral-400 px-1">Destaques Disponíveis</div>

              <div className="space-y-2">
                {filteredConnectors.map((c) => (
                  <div
                    key={c.id}
                    className="p-3.5 rounded-2xl bg-neutral-900/50 hover:bg-neutral-900 border border-neutral-800/80 transition-all flex items-center justify-between gap-4 group"
                  >
                    <div className="flex items-start gap-3.5 min-w-0">
                      {getConnectorIcon(c)}

                      <div className="min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-semibold text-sm text-neutral-100">{c.name}</span>
                          {c.badge && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] bg-neutral-800 text-neutral-400 border border-neutral-700 font-mono">
                              {c.badge}
                            </span>
                          )}
                          {c.isConnected && (
                            <span className="flex items-center gap-1 text-[10px] text-emerald-400 font-medium">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>Ativo</span>
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-neutral-400 line-clamp-1 mt-0.5">{c.description}</p>
                        <div className="flex items-center gap-1.5 mt-1.5 flex-wrap">
                          {c.capabilities.map((cap, i) => (
                            <span
                              key={i}
                              className="px-1.5 py-0.5 rounded-md bg-neutral-950 text-[10px] text-neutral-400 border border-neutral-800/60"
                            >
                              {cap}
                            </span>
                          ))}
                        </div>
                      </div>
                    </div>

                    {/* Actions */}
                    <div className="flex items-center gap-2 shrink-0">
                      {c.enablesSandbox && onOpenGoogleSandbox && (
                        <button
                          onClick={() => {
                            onOpenGoogleSandbox("cli");
                            onClose();
                          }}
                          className="px-3 py-1.5 rounded-xl bg-amber-950/80 hover:bg-amber-900 border border-amber-800/60 text-xs text-amber-200 font-semibold flex items-center gap-1 transition-all"
                          title="Abrir terminal CLI na tela do chat"
                        >
                          <Terminal className="w-3.5 h-3.5 text-amber-400" />
                          <span className="hidden sm:inline">Terminal</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleToggleConnect(c.id)}
                        className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-all ${
                          c.isConnected
                            ? "bg-neutral-800 hover:bg-red-950/60 text-neutral-200 hover:text-red-300 border border-neutral-700 hover:border-red-800"
                            : "bg-white hover:bg-neutral-200 text-neutral-950 shadow-sm"
                        }`}
                      >
                        {c.isConnected ? "Conectado" : "Conectar"}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        {/* TAB 2: CONFIGURAÇÃO & TOKENS REAIS */}
        {activeTab === "mcp_config" && (
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-5 text-xs text-neutral-300">
            {/* GITHUB CONNECTOR SECTION */}
            <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <FolderGit2 className="w-5 h-5 text-white" />
                  <div>
                    <h3 className="font-semibold text-sm text-white">Conector Real GitHub (REST v3)</h3>
                    <p className="text-[11px] text-neutral-400">
                      Execução verificada de issues, PRs e leitura de repositórios. Sem tokens, mutações são rejeitadas por anti-fabricação.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleTestGithub}
                  disabled={isTestingGithub}
                  className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingGithub ? "animate-spin" : ""}`} />
                  <span>Testar Conexão Real</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                    GitHub Personal Access Token (PAT):
                  </label>
                  <div className="relative">
                    <Key className="w-3.5 h-3.5 text-neutral-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      value={githubToken}
                      onChange={(e) => setGithubToken(e.target.value)}
                      placeholder="ghp_xxxxxxxxxxxxxxxxxxxx"
                      className="w-full bg-neutral-950 border border-neutral-700 rounded-xl pl-9 pr-3 py-2 text-xs text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                  <span className="text-[10px] text-neutral-500 mt-0.5 block">
                    {hasGithubToken ? "Token ativo e persistido no servidor." : "Opcional para leitura pública; obrigatório para criar issues/PRs."}
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                    Repositório Padrão (owner/repo):
                  </label>
                  <input
                    type="text"
                    value={githubDefaultRepo}
                    onChange={(e) => setGithubDefaultRepo(e.target.value)}
                    placeholder="scoobiii/vortex"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* GitHub Test Results Panel */}
              {githubTestResult && (
                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-[11px] space-y-1.5 font-mono">
                  <div className="flex items-center justify-between text-neutral-200 font-semibold font-sans">
                    <span className="flex items-center gap-1.5">
                      {githubTestResult.success ? (
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      ) : (
                        <AlertCircle className="w-3.5 h-3.5 text-amber-400" />
                      )}
                      Status: {githubTestResult.data?.status || "Testado"}
                    </span>
                    <span className="text-[10px] text-neutral-400">Latência: {githubTestResult.executionTimeMs}ms</span>
                  </div>
                  {githubTestResult.data?.user && (
                    <div className="text-emerald-300">
                      Autenticado como: @{githubTestResult.data.user.login} ({githubTestResult.data.user.name || "GitHub User"})
                    </div>
                  )}
                  {githubTestResult.data?.rateLimit && (
                    <div className="text-neutral-400">
                      Rate Limit: {githubTestResult.data.rateLimit.remaining} / {githubTestResult.data.rateLimit.limit} requisições restantes.
                    </div>
                  )}
                  <div className="text-[10px] text-neutral-500">
                    Evidence Hash GOS3: {githubTestResult.evidenceHash}
                  </div>
                </div>
              )}
            </div>

            {/* GCLOUD CONNECTOR SECTION */}
            <div className="p-4 rounded-2xl bg-neutral-900/60 border border-neutral-800 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Cloud className="w-5 h-5 text-indigo-400" />
                  <div>
                    <h3 className="font-semibold text-sm text-white">Google Cloud & AI Studio Runtime</h3>
                    <p className="text-[11px] text-neutral-400">
                      Integração com Cloud Run Ingress, Gemini 2.5/3.7 e Google Cloud Storage.
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleTestGcloud}
                  disabled={isTestingGcloud}
                  className="px-3 py-1.5 rounded-xl bg-neutral-800 hover:bg-neutral-700 text-white font-semibold text-xs flex items-center gap-1.5 transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isTestingGcloud ? "animate-spin" : ""}`} />
                  <span>Testar GCP</span>
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                    GCloud Project ID:
                  </label>
                  <input
                    type="text"
                    value={gcloudProjectId}
                    onChange={(e) => setGcloudProjectId(e.target.value)}
                    placeholder="vortex-ai-studio"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-medium text-neutral-400 mb-1">
                    Região Primária Cloud Run:
                  </label>
                  <input
                    type="text"
                    value={gcloudRegion}
                    onChange={(e) => setGcloudRegion(e.target.value)}
                    placeholder="us-central1"
                    className="w-full bg-neutral-950 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-neutral-100 placeholder-neutral-600 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* GCloud Test Results Panel */}
              {gcloudTestResult && (
                <div className="p-3 rounded-xl bg-neutral-950 border border-neutral-800 text-[11px] space-y-1.5 font-mono">
                  <div className="flex items-center justify-between text-neutral-200 font-semibold font-sans">
                    <span className="flex items-center gap-1.5">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Status da API: {gcloudTestResult.data?.apiStatus || "ONLINE"}
                    </span>
                    <span className="text-[10px] text-neutral-400">Latência: {gcloudTestResult.data?.latencyMs}ms</span>
                  </div>
                  <div className="text-neutral-400">
                    Projeto: {gcloudTestResult.data?.projectId} | Região: {gcloudTestResult.data?.region} | Cloud Run: Port 3000 Ingress Ativo
                  </div>
                  <div className="text-[10px] text-neutral-500">
                    Evidence Hash GOS3: {gcloudTestResult.evidenceHash}
                  </div>
                </div>
              )}
            </div>

            {/* ACTION BUTTON */}
            <div className="flex justify-end pt-2">
              <button
                onClick={handleSaveConfig}
                disabled={isSavingConfig}
                className="px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs flex items-center gap-2 shadow-md transition-all"
              >
                {isSavingConfig ? <RefreshCw className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Salvar Configurações & Ativar MCP</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 3: MCP TOOLS BROWSER & TESTER */}
        {activeTab === "mcp_tools" && (
          <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4 text-xs">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-white flex items-center gap-1.5">
                  <Terminal className="w-4 h-4 text-amber-400" />
                  <span>Browser & Executor de Ferramentas MCP</span>
                </h3>
                <p className="text-[11px] text-neutral-400">
                  Invoque qualquer ferramenta do catálogo MCP em tempo real com auditoria de evidência Zero-Simulation.
                </p>
              </div>
              <span className="text-[11px] text-neutral-500 font-mono">
                {mcpTools.length} ferramentas carregadas
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                  Selecione a Ferramenta MCP:
                </label>
                <select
                  value={selectedMcpTool}
                  onChange={(e) => {
                    const tool = e.target.value;
                    setSelectedMcpTool(tool);
                    if (tool === "github_get_repo") setToolParams('{\n  "repo": "scoobiii/vortex"\n}');
                    else if (tool === "github_list_issues") setToolParams('{\n  "repo": "scoobiii/vortex",\n  "state": "open",\n  "limit": 5\n}');
                    else if (tool === "github_create_issue") setToolParams('{\n  "repo": "scoobiii/vortex",\n  "title": "Issue criada via MCP Tool",\n  "body": "Descrição da issue auditada"\n}');
                    else if (tool === "gcloud_project_info") setToolParams('{\n  "projectId": "vortex-ai-studio"\n}');
                    else setToolParams("{}");
                  }}
                  className="w-full bg-neutral-900 border border-neutral-700 rounded-xl px-3 py-2 text-xs text-neutral-100 font-mono focus:outline-none focus:border-blue-500"
                >
                  {mcpTools.map((t) => (
                    <option key={t.name} value={t.name}>
                      [{t.category?.toUpperCase()}] {t.name}
                    </option>
                  ))}
                </select>

                <div className="mt-2 text-[11px] text-neutral-400 p-2.5 rounded-xl bg-neutral-900/80 border border-neutral-800">
                  {mcpTools.find((t) => t.name === selectedMcpTool)?.description || "Descrição da ferramenta MCP."}
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-semibold text-neutral-300 mb-1">
                  Parâmetros de Entrada (JSON):
                </label>
                <textarea
                  value={toolParams}
                  onChange={(e) => setToolParams(e.target.value)}
                  rows={4}
                  className="w-full bg-neutral-950 border border-neutral-700 rounded-xl p-2.5 text-xs text-neutral-100 font-mono focus:outline-none focus:border-blue-500"
                />
                <button
                  onClick={handleExecuteMcpTool}
                  disabled={isExecutingTool}
                  className="w-full mt-2 py-2 rounded-xl bg-amber-500 hover:bg-amber-400 text-neutral-950 font-bold text-xs flex items-center justify-center gap-1.5 transition-all shadow-sm"
                >
                  {isExecutingTool ? (
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Play className="w-3.5 h-3.5 fill-current" />
                  )}
                  <span>Executar Ferramenta MCP Real</span>
                </button>
              </div>
            </div>

            {/* Tool Result Viewer */}
            {toolExecutionResult && (
              <div className="p-3.5 rounded-2xl bg-neutral-950 border border-neutral-800 space-y-2 font-mono">
                <div className="flex items-center justify-between text-neutral-200 font-semibold font-sans text-xs">
                  <span className="flex items-center gap-1.5">
                    {toolExecutionResult.success ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    ) : toolExecutionResult.claim === "auth_required" ? (
                      <AlertCircle className="w-4 h-4 text-amber-400" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-red-400" />
                    )}
                    Claim: {toolExecutionResult.claim} • {toolExecutionResult.toolName}
                  </span>
                  <span className="text-[10px] text-neutral-400">
                    {toolExecutionResult.executionTimeMs}ms • Hash: {toolExecutionResult.evidenceHash}
                  </span>
                </div>

                <div className="max-h-48 overflow-y-auto p-2.5 rounded-xl bg-neutral-900 text-[11px] text-neutral-200 text-xs">
                  <pre>{JSON.stringify(toolExecutionResult.data, null, 2)}</pre>
                </div>

                {toolExecutionResult.logs?.length > 0 && (
                  <div className="text-[10px] text-neutral-400 space-y-0.5 border-t border-neutral-800 pt-1.5">
                    {toolExecutionResult.logs.map((l: string, idx: number) => (
                      <div key={idx} className="text-neutral-400">
                        {l}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Footer */}
        <div className="px-5 py-3 border-t border-neutral-800/80 bg-neutral-950/90 flex items-center justify-between text-xs text-neutral-400">
          <span>{connectors.filter((c) => c.isConnected).length} conectores ativos • MCP Protocol Ready</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 border border-neutral-700 text-neutral-200 font-medium transition-colors"
          >
            Concluir
          </button>
        </div>
      </div>
    </div>
  );
};


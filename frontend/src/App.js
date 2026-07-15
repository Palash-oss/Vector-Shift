import React, { useState, useEffect } from 'react';
import { useStore } from './store';
import { PipelineToolbar } from './toolbar';
import { PipelineUI } from './ui';
import { SubmitButton } from './submit';
import { LandingPage } from './landing/LandingPage';
import { NodeConfigDrawer } from './components/NodeConfigDrawer';

export default function App() {
  // Navigation / Routing State
  const [route, setRoute] = useState(() => window.location.pathname);
  const [activeSidebarItem, setActiveSidebarItem] = useState('Flows');
  const [activeSubTab, setActiveSubTab] = useState('Editor'); // 'Editor' | 'Logs' | 'Reports'
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // App Global Config / Pipeline state
  const [pipelineName, setPipelineName] = useState('Customer Support Bot');
  const [isDeployed, setIsDeployed] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [showDeployToast, setShowDeployToast] = useState(false);
  
  // Zustand Store variables
  const nodes = useStore((state) => state.nodes);
  const edges = useStore((state) => state.edges);
  const updateNodeField = useStore((state) => state.updateNodeField);
  const activeNodeId = useStore((state) => state.activeNodeId);
  const setActiveNodeId = useStore((state) => state.setActiveNodeId);

  // Modals state
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [showGitHubModal, setShowGitHubModal] = useState(false);
  
  // GitHub Integration state
  const [githubRepo, setGithubRepo] = useState('Palash-oss/Vector-Shift');
  const [isPushingGithub, setIsPushingGithub] = useState(false);
  const [gitHubSuccessMsg, setGitHubSuccessMsg] = useState(null);

  // System Logs Console State
  const [systemLogs, setSystemLogs] = useState([
    { time: '11:40:02', level: 'info', msg: 'Pipeline Studio v2.0 Workspace initialized.' },
    { time: '11:40:15', level: 'info', msg: 'Zustand workflow state seeded successfully.' },
    { time: '11:41:00', level: 'success', msg: 'Established hot connection to topological validation backend.' },
  ]);
  const [logsFilter, setLogsFilter] = useState('all');

  // Prompts Manager Search
  const [promptSearch, setPromptSearch] = useState('');
  const [editingPromptId, setEditingPromptId] = useState(null);
  const [editingPromptText, setEditingPromptText] = useState('');

  // API Playground Chatbot State
  const [playgroundInputs, setPlaygroundInputs] = useState(
    JSON.stringify({ input: "How do I build agents?" }, null, 2)
  );
  const [chatMessages, setChatMessages] = useState([
    { sender: 'assistant', text: '👋 Welcome to the Pipeline API Playground! Once you click "Deploy" in the top bar, you can test your visual canvas here by typing an input and running the workflow.' }
  ]);
  const [isPlaygroundRunning, setIsPlaygroundRunning] = useState(false);
  const [playgroundLogs, setPlaygroundLogs] = useState([]);

  // Integrations/Connections State
  const [openaiKey, setOpenaiKey] = useState('sk-proj-••••••••••••••••••••');
  const [anthropicKey, setAnthropicKey] = useState('sk-ant-••••••••••••••••••••');

  // Handle URL navigation changes
  useEffect(() => {
    const handleLocationChange = () => {
      setRoute(window.location.pathname);
    };
    window.addEventListener('popstate', handleLocationChange);
    return () => window.removeEventListener('popstate', handleLocationChange);
  }, []);

  const navigate = (path) => {
    window.history.pushState({}, '', path);
    setRoute(path);
  };

  // Sync Sidebar Navigation Click with Top Switchers
  const handleSidebarItemClick = (itemName) => {
    setActiveSidebarItem(itemName);
    if (itemName === 'Flows') {
      setActiveSubTab('Editor');
    } else if (itemName === 'Logs' || itemName === 'Reports') {
      setActiveSubTab(itemName);
    }
  };

  const handleSubTabChange = (tabName) => {
    setActiveSubTab(tabName);
    if (tabName === 'Editor') {
      setActiveSidebarItem('Flows');
    } else {
      setActiveSidebarItem(tabName);
    }
  };

  // Logging Helper
  const addLog = (level, msg) => {
    const time = new Date().toTimeString().split(' ')[0];
    setSystemLogs((prev) => [...prev, { time, level, msg }]);
  };

  // 1. Live Backend Deploy Call
  const handleDeploy = async () => {
    if (isDeploying) return;
    setIsDeploying(true);
    addLog('info', 'Packaging pipeline schema...');

    try {
      const response = await fetch('http://127.0.0.1:8002/pipelines/deploy', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges })
      });
      const data = await response.json();
      
      if (data.status === 'success') {
        setIsDeployed(true);
        addLog('success', `Pipeline deployed successfully. Endpoint live: ${data.url}`);
        setShowDeployToast(true);
        setTimeout(() => setShowDeployToast(false), 4000);
      } else {
        addLog('error', 'Pipeline deployment failed: Backend returned error status');
      }
    } catch (e) {
      addLog('error', `Deployment connection failed: ${e.message}`);
    } finally {
      setIsDeploying(false);
    }
  };

  // 2. Real Github Git Push Call
  const handlePushToGithub = async () => {
    if (isPushingGithub) return;
    setIsPushingGithub(true);
    setGitHubSuccessMsg(null);
    addLog('info', `Initializing push payload to GitHub: ${githubRepo}...`);

    try {
      const response = await fetch('http://127.0.0.1:8002/pipelines/push-github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nodes, edges, repo: githubRepo })
      });
      const data = await response.json();

      if (data.status === 'success') {
        setGitHubSuccessMsg(data.msg);
        addLog('success', `GitHub repo commit pushed successfully. Output: ${data.output}`);
      } else {
        addLog('error', 'GitHub commit push rejected by Git process.');
      }
    } catch (e) {
      addLog('error', `GitHub Push connection failed: ${e.message}`);
    } finally {
      setIsPushingGithub(false);
    }
  };

  // 3. Playground Chat Pipeline Run Call
  const handlePlaygroundSend = async () => {
    if (isPlaygroundRunning) return;
    let parsedInputs = {};
    try {
      parsedInputs = JSON.parse(playgroundInputs);
    } catch (err) {
      alert("Invalid JSON format in the input variables editor!");
      return;
    }

    const userInput = parsedInputs.input || "Demo trigger";
    setChatMessages((prev) => [...prev, { sender: 'user', text: userInput }]);
    setIsPlaygroundRunning(true);
    addLog('info', 'Running active pipeline visual steps...');

    try {
      const response = await fetch('http://127.0.0.1:8002/pipelines/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ inputs: parsedInputs })
      });
      
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        // Collect outputs
        const outputVal = Object.values(data.outputs).join('\n') || "Pipeline ran successfully. No outputs generated.";
        setChatMessages((prev) => [...prev, { sender: 'assistant', text: outputVal }]);
        
        // Show execution logs
        setPlaygroundLogs(data.execution_logs);
        data.execution_logs.forEach((log) => addLog('success', `[Execution Run] ${log}`));
      } else {
        const errMsg = data.detail || 'Pipeline execution failed.';
        setChatMessages((prev) => [...prev, { sender: 'assistant', text: `❌ Error: ${errMsg}` }]);
        addLog('error', `Execution failed: ${errMsg}`);
      }
    } catch (e) {
      setChatMessages((prev) => [...prev, { sender: 'assistant', text: `❌ Connection Error: ${e.message}` }]);
      addLog('error', `API Playground run failed: ${e.message}`);
    } finally {
      setIsPlaygroundRunning(false);
    }
  };

  // Sidebar Items
  const sidebarItems = [
    { name: 'Flows', icon: '⚡' },
    { name: 'Prompts', icon: '📝' },
    { name: 'Data', icon: '📊' },
    { name: 'Connections', icon: '🔌' },
    { name: 'Logs', icon: '📋' },
    { name: 'Deployments', icon: '🚀' },
    { name: 'Tests', icon: '🧪' },
    { name: 'Jobs', icon: '⚙️' },
    { name: 'Reports', icon: '📈' },
    { name: 'API Playground', icon: '🎮' },
    { name: 'Settings', icon: '🛠️' },
  ];

  // Route back to Landing Page
  if (route !== '/editor') {
    return <LandingPage navigate={navigate} />;
  }

  // Filter logs list
  const filteredLogs = systemLogs.filter((log) => {
    if (logsFilter === 'all') return true;
    return log.level === logsFilter;
  });

  // Filter prompts list
  const promptNodes = nodes.filter((n) => {
    if (n.type === 'llm' || n.type === 'text') {
      const label = n.data.customTitle || n.type;
      return label.toLowerCase().includes(promptSearch.toLowerCase());
    }
    return false;
  });

  const handleSavePromptInline = (nodeId, text) => {
    const node = nodes.find(n => n.id === nodeId);
    if (!node) return;

    if (node.type === 'llm') {
      const updatedBlocks = (node.data.promptBlocks || []).map((b, idx) => {
        // Update first block
        if (idx === 0) return { ...b, text };
        return b;
      });
      updateNodeField(nodeId, 'promptBlocks', updatedBlocks);
    } else {
      updateNodeField(nodeId, 'text', text);
    }
    setEditingPromptId(null);
    addLog('success', `Inline Prompt updated for node '${nodeId}'.`);
  };

  const isFlowsVisible = activeSidebarItem === 'Flows' && activeSubTab === 'Editor';

  return (
    <div className="app-shell">
      {/* Top Header Bar */}
      <header className="top-bar">
        <div className="top-bar-left">
          <div className="landing-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
            <span className="logo-glow"></span>
            <span className="logo-text" style={{ fontSize: '1.1rem' }}>Pipeline Studio</span>
          </div>
          <span className="btn-separator"></span>
          <select className="switcher-dropdown" defaultValue="workspace">
            <option value="workspace">My Workspace</option>
            <option value="prod">Production Org</option>
          </select>
        </div>

        <div className="top-bar-center">
          <div className="pipeline-name-wrapper">
            <input
              type="text"
              className="editable-pipeline-name"
              value={pipelineName}
              onChange={(e) => setPipelineName(e.target.value)}
              title="Click to rename pipeline"
            />
            <span className="last-saved-time">Active</span>
            <button className="overflow-menu-btn">•••</button>
          </div>

          <div className="tab-switcher">
            {['Editor', 'Logs', 'Reports'].map((tab) => (
              <button
                key={tab}
                className={`tab-btn ${activeSubTab === tab ? 'active' : ''}`}
                onClick={() => handleSubTabChange(tab)}
              >
                {tab}
              </button>
            ))}
          </div>
        </div>

        <div className="top-bar-right">
          <button className="github-connect-btn" onClick={() => setShowGitHubModal(true)}>
            🐙 Connect GitHub
          </button>

          <div className="deploy-dropdown-wrapper">
            <button className="deploy-btn-main" onClick={handleDeploy} disabled={isDeploying}>
              {isDeploying ? (
                <>
                  <span className="spinner-tiny"></span>
                  <span style={{ marginLeft: '8px' }}>Deploying...</span>
                </>
              ) : (
                'Deploy'
              )}
            </button>
            <button className="deploy-btn-chevron" onClick={handleDeploy}>▼</button>
          </div>

          {isDeployed ? (
            <div className="status-pill live">
              <span className="status-pulse-green"></span>
              <span>Live Endpoint</span>
            </div>
          ) : (
            <div className="status-pill" style={{ opacity: 0.6 }}>
              <span className="status-dot-green" style={{ backgroundColor: '#8b949e' }}></span>
              <span>Not Deployed</span>
            </div>
          )}
        </div>
      </header>

      {/* Main Body Layout */}
      <div className="app-body">
        {/* Sidebar Nav */}
        <aside className={`sidebar ${isSidebarCollapsed ? 'collapsed' : ''}`}>
          <div className="sidebar-top">
            <div className="sidebar-header">
              <span className="sidebar-title">NAVIGATION</span>
              <button
                className="hamburger-btn"
                onClick={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
                title={isSidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              >
                ☰
              </button>
            </div>

            <div className="sidebar-nav">
              {sidebarItems.map((item) => (
                <button
                  key={item.name}
                  className={`nav-item-btn ${activeSidebarItem === item.name ? 'active' : ''}`}
                  onClick={() => handleSidebarItemClick(item.name)}
                >
                  <span className="nav-icon">{item.icon}</span>
                  <span className="nav-label">{item.name}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="sidebar-footer">
            <span>v2.0.1 Stable</span>
          </div>
        </aside>

        {/* Content Area */}
        <main className="main-content-container">
          {/* FLOWS EDITOR VIEW */}
          {isFlowsVisible && (
            <>
              <PipelineToolbar />
              <PipelineUI />
              <div className="bottom-left-toolbar">
                <button className="canvas-tool-btn" title="Templates" onClick={() => setShowTemplatesModal(true)}>
                  📋 Templates
                </button>
                <span className="btn-separator"></span>
                <button className="canvas-tool-btn" title="Sticky Comments" onClick={() => alert("Note added to canvas.")}>
                  ✍️ Add Note
                </button>
              </div>
              <SubmitButton />
            </>
          )}

          {/* PROMPTS VIEW */}
          {activeSidebarItem === 'Prompts' && (
            <div className="view-panel">
              <div className="view-title-row">
                <div>
                  <h2 className="view-heading">Prompts Manager</h2>
                  <p className="view-desc">Monitor, search, and edit prompt blocks inside LLM and Text template nodes.</p>
                </div>
                <input
                  type="text"
                  className="picker-search-box"
                  style={{ maxWidth: '300px', margin: 0 }}
                  placeholder="Filter prompts..."
                  value={promptSearch}
                  onChange={(e) => setPromptSearch(e.target.value)}
                />
              </div>

              {promptNodes.length > 0 ? (
                <table className="prompts-table">
                  <thead>
                    <tr>
                      <th style={{ width: '20%' }}>Node ID</th>
                      <th style={{ width: '20%' }}>Label</th>
                      <th style={{ width: '45%' }}>Prompt Context</th>
                      <th style={{ width: '15%' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {promptNodes.map((n) => {
                      const text = n.type === 'llm'
                        ? (n.data.promptBlocks?.[0]?.text || 'No system prompt configured.')
                        : (n.data.text || 'Empty template.');
                      
                      const isEditing = editingPromptId === n.id;

                      return (
                        <tr key={n.id}>
                          <td style={{ fontFamily: 'monospace' }}>{n.id}</td>
                          <td><strong>{n.data.customTitle || n.type}</strong></td>
                          <td>
                            {isEditing ? (
                              <textarea
                                className="prompt-textarea-inline"
                                value={editingPromptText}
                                onChange={(e) => setEditingPromptText(e.target.value)}
                              />
                            ) : (
                              <span style={{ fontSize: '0.8rem', whiteSpace: 'pre-wrap' }}>{text}</span>
                            )}
                          </td>
                          <td>
                            {isEditing ? (
                              <div style={{ display: 'flex', gap: '8px' }}>
                                <button className="btn-schema-add" style={{ padding: '2px 8px', fontSize: '0.75rem', width: 'auto' }} onClick={() => handleSavePromptInline(n.id, editingPromptText)}>
                                  Save
                                </button>
                                <button className="btn-schema-delete" style={{ fontSize: '1rem' }} onClick={() => setEditingPromptId(null)}>&times;</button>
                              </div>
                            ) : (
                              <button
                                className="btn-select-repo"
                                onClick={() => {
                                  setEditingPromptId(n.id);
                                  setEditingPromptText(text);
                                }}
                              >
                                Edit Inline
                              </button>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: '40px', textAlign: 'center', color: '#8b949e' }}>
                  No LLM or Text Template nodes found in the current workflow canvas.
                </div>
              )}
            </div>
          )}

          {/* LOGS VIEW */}
          {activeSidebarItem === 'Logs' && (
            <div className="view-panel">
              <div className="view-title-row">
                <div>
                  <h2 className="view-heading">System Terminal Logs</h2>
                  <p className="view-desc">Monitor live compilation events, tests, and API handshakes.</p>
                </div>
                <div style={{ display: 'flex', gap: '10px' }}>
                  <select
                    className="preset-dropdown-box"
                    style={{ background: '#161b22', border: '1px solid #30363d' }}
                    value={logsFilter}
                    onChange={(e) => setLogsFilter(e.target.value)}
                  >
                    <option value="all">All Events</option>
                    <option value="info">Info</option>
                    <option value="success">Success</option>
                    <option value="error">Error</option>
                  </select>
                  <button className="btn-schema-delete" style={{ border: '1px solid #30363d', padding: '6px 12px', fontSize: '0.8rem', borderRadius: '6px' }} onClick={() => setSystemLogs([])}>
                    Clear Logs
                  </button>
                </div>
              </div>

              <div className="logs-console">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log, idx) => (
                    <div key={idx} className="log-row-item">
                      <span className="log-time">[{log.time}]</span>
                      <span className={`log-level ${log.level}`}>{log.level.toUpperCase()}</span>
                      <span className="log-text">{log.msg}</span>
                    </div>
                  ))
                ) : (
                  <div style={{ color: '#8b949e', textAlign: 'center', marginTop: '100px' }}>No logs match filter criteria.</div>
                )}
              </div>
            </div>
          )}

          {/* REPORTS / ANALYTICS VIEW */}
          {activeSidebarItem === 'Reports' && (
            <div className="view-panel">
              <div className="view-title-row">
                <div>
                  <h2 className="view-heading">Cost & Performance Analytics</h2>
                  <p className="view-desc">Real-time observability reporting for active pipeline models.</p>
                </div>
              </div>

              <div className="stats-cards-grid">
                <div className="stat-card-item">
                  <span className="stat-card-title">Accumulated cost</span>
                  <span className="stat-card-value">$0.0036</span>
                </div>
                <div className="stat-card-item">
                  <span className="stat-card-title">Total API Tokens</span>
                  <span className="stat-card-value">1,480</span>
                </div>
                <div className="stat-card-item">
                  <span className="stat-card-title">Avg response latency</span>
                  <span className="stat-card-value">468ms</span>
                </div>
                <div className="stat-card-item">
                  <span className="stat-card-title">Validation Status</span>
                  <span className="stat-card-value" style={{ color: '#56d364' }}>Healthy</span>
                </div>
              </div>

              <div style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: '12px', padding: '24px' }}>
                <h4 style={{ margin: '0 0 16px 0', color: '#fff' }}>Token Usage per Node type</h4>
                <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                  {[
                    { label: 'LLM Processor Node (🤖)', pct: '65%', tokens: 960 },
                    { label: 'Input variables (📥)', pct: '15%', tokens: 220 },
                    { label: 'Output template block (📝)', pct: '20%', tokens: 300 },
                  ].map((row, i) => (
                    <div key={i} style={{ fontSize: '0.85rem' }}>
                      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '6px' }}>
                        <span>{row.label}</span>
                        <span style={{ color: '#8b949e' }}>{row.tokens} tokens ({row.pct})</span>
                      </div>
                      <div style={{ width: '100%', height: '8px', background: '#21262d', borderRadius: '4px', overflow: 'hidden' }}>
                        <div style={{ width: row.pct, height: '100%', background: 'linear-gradient(90deg, #3b82f6, #6366f1)', borderRadius: '4px' }}></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* API PLAYGROUND CHAT VIEW */}
          {activeSidebarItem === 'API Playground' && (
            <div className="view-panel">
              <div className="view-title-row">
                <div>
                  <h2 className="view-heading">Interactive API Playground</h2>
                  <p className="view-desc">Test your deployed pipeline directly in a chatbot sandbox. Resolves nodes in real-time.</p>
                </div>
              </div>

              <div className="playground-chat-split">
                {/* Inputs Editor Column */}
                <div className="playground-editor-col">
                  <h4 style={{ margin: 0, color: '#fff' }}>Input Payload (JSON)</h4>
                  <p style={{ margin: 0, fontSize: '0.75rem', color: '#8b949e' }}>
                    Configure the variables sent to the pipeline input handles:
                  </p>
                  <textarea
                    className="prompt-textarea"
                    style={{ flex: 1, fontFamily: 'monospace', fontSize: '0.85rem' }}
                    value={playgroundInputs}
                    onChange={(e) => setPlaygroundInputs(e.target.value)}
                  />
                  <div style={{ borderTop: '1px solid #30363d', paddingTop: '12px' }}>
                    <h5 style={{ margin: '0 0 8px 0', fontSize: '0.8rem', color: '#fff' }}>Pipeline Execution Trace</h5>
                    <div style={{ maxHeight: '120px', overflowY: 'auto', fontSize: '0.75rem', fontFamily: 'monospace', color: '#8b949e' }}>
                      {playgroundLogs.length > 0 ? (
                        playgroundLogs.map((log, i) => <div key={i} style={{ borderBottom: '1px solid rgba(255,255,255,0.01)', padding: '2px 0' }}>✓ {log}</div>)
                      ) : (
                        <div style={{ color: '#535c67' }}>Ready to run. Execution trace logs will appear here.</div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Chat sandbox Column */}
                <div className="playground-chat-col">
                  <div className="chat-messages-container">
                    {chatMessages.map((msg, i) => (
                      <div key={i} className={`chat-bubble-item ${msg.sender}`}>
                        {msg.text}
                      </div>
                    ))}
                  </div>

                  <div className="chat-input-bar">
                    <input
                      type="text"
                      className="chat-text-input"
                      placeholder={isDeployed ? "Type something to run pipeline..." : "⚠️ Please click 'Deploy' in the top-bar first..."}
                      disabled={!isDeployed || isPlaygroundRunning}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter' && e.target.value) {
                          // Update JSON payload
                          const payload = { input: e.target.value };
                          setPlaygroundInputs(JSON.stringify(payload, null, 2));
                          e.target.value = '';
                          setTimeout(() => handlePlaygroundSend(), 50);
                        }
                      }}
                    />
                    <button
                      className="btn-primary"
                      style={{ width: 'auto', whiteSpace: 'nowrap' }}
                      disabled={!isDeployed || isPlaygroundRunning}
                      onClick={handlePlaygroundSend}
                    >
                      {isPlaygroundRunning ? 'Running...' : 'Run Query'}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* CONNECTIONS VIEW */}
          {activeSidebarItem === 'Connections' && (
            <div className="view-panel">
              <div className="view-title-row">
                <div>
                  <h2 className="view-heading">Connected Integrations</h2>
                  <p className="view-desc">Configure credential tokens and API integrations.</p>
                </div>
              </div>

              <div className="connections-grid">
                <div className="connection-card-premium">
                  <div className="connection-header-row">
                    <span className="connection-logo-icon">🤖</span>
                    <div>
                      <span className="connection-name">OpenAI API</span>
                      <div style={{ fontSize: '0.75rem', color: '#56d364' }}>Connected</div>
                    </div>
                  </div>
                  <input
                    type="password"
                    className="chat-text-input"
                    value={openaiKey}
                    onChange={(e) => setOpenaiKey(e.target.value)}
                  />
                  <button className="btn-select-repo" onClick={() => addLog('success', 'OpenAI API Credentials saved.')}>Save Secret</button>
                </div>

                <div className="connection-card-premium">
                  <div className="connection-header-row">
                    <span className="connection-logo-icon">🔮</span>
                    <div>
                      <span className="connection-name">Anthropic Claude</span>
                      <div style={{ fontSize: '0.75rem', color: '#56d364' }}>Connected</div>
                    </div>
                  </div>
                  <input
                    type="password"
                    className="chat-text-input"
                    value={anthropicKey}
                    onChange={(e) => setAnthropicKey(e.target.value)}
                  />
                  <button className="btn-select-repo" onClick={() => addLog('success', 'Anthropic Credentials saved.')}>Save Secret</button>
                </div>

                <div className="connection-card-premium">
                  <div className="connection-header-row">
                    <span className="connection-logo-icon">🐙</span>
                    <div>
                      <span className="connection-name">GitHub Integrator</span>
                      <div style={{ fontSize: '0.75rem', color: '#56d364' }}>Connected</div>
                    </div>
                  </div>
                  <div style={{ fontSize: '0.8rem', color: '#8b949e' }}>Repository: <strong>{githubRepo}</strong></div>
                  <button className="btn-primary" onClick={() => setShowGitHubModal(true)}>Modify Repo</button>
                </div>
              </div>
            </div>
          )}

          {/* DEPLOYMENTS VIEW */}
          {activeSidebarItem === 'Deployments' && (
            <div className="view-panel">
              <div className="view-title-row">
                <div>
                  <h2 className="view-heading">Deployed API Endpoints</h2>
                  <p className="view-desc">Monitor live routes and webhook integrations generated from the canvas.</p>
                </div>
              </div>

              {isDeployed ? (
                <div style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: '12px', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                    <div>
                      <h4 style={{ margin: 0, color: '#fff' }}>POST http://127.0.0.1:8002/pipelines/run</h4>
                      <p style={{ margin: '4px 0 0 0', fontSize: '0.8rem', color: '#8b949e' }}>Primary Webhook Target Endpoint</p>
                    </div>
                    <div className="status-pill live">
                      <span className="status-pulse-green"></span>
                      <span>Healthy</span>
                    </div>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    <div style={{ fontSize: '0.8rem', color: '#8b949e' }}>Example cURL Request:</div>
                    <pre style={{ background: '#030712', border: '1px solid #30363d', padding: '12px', borderRadius: '6px', fontSize: '0.75rem', overflowX: 'auto', color: '#58a6ff' }}>
{`curl -X POST http://127.0.0.1:8002/pipelines/run \\
  -H "Content-Type: application/json" \\
  -d '{"inputs": {"input": "Test Query string"}}'`}
                    </pre>
                  </div>
                </div>
              ) : (
                <div style={{ padding: '60px', textAlign: 'center', background: '#0d1117', border: '1px solid #30363d', borderRadius: '12px' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🚀</div>
                  <h4 style={{ margin: '0 0 8px 0', color: '#fff' }}>No Active Deployments</h4>
                  <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: '#8b949e' }}>Deploy your visual layout from the Editor to generate live webhook routes.</p>
                  <button className="btn-primary" style={{ width: 'auto' }} onClick={handleDeploy}>Deploy Now</button>
                </div>
              )}
            </div>
          )}

          {/* SETTINGS VIEW */}
          {activeSidebarItem === 'Settings' && (
            <div className="view-panel" style={{ maxWidth: '600px' }}>
              <div className="view-title-row">
                <div>
                  <h2 className="view-heading">Settings</h2>
                  <p className="view-desc">Configure project parameters and workflow configurations.</p>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
                <div className="drawer-field-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                  <label className="drawer-field-label">Pipeline Project Name</label>
                  <input
                    type="text"
                    className="chat-text-input"
                    value={pipelineName}
                    onChange={(e) => setPipelineName(e.target.value)}
                  />
                </div>

                <div className="drawer-field-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                  <label className="drawer-field-label">Description</label>
                  <textarea
                    className="prompt-textarea"
                    style={{ height: '80px' }}
                    defaultValue="This visual workflow resolves LLM prompt blocks, validates inputs, and connects to external webhooks."
                  />
                </div>

                <div className="drawer-field-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '8px' }}>
                  <label className="drawer-field-label">Fallback Model Engine</label>
                  <select className="drawer-input-select">
                    <option value="gpt-4o-mini">gpt-4o-mini</option>
                    <option value="claude-3-5-sonnet">claude-3-5-sonnet</option>
                  </select>
                </div>

                <button className="btn-primary" style={{ marginTop: '10px' }} onClick={() => addLog('success', 'Project settings saved.')}>
                  Save Settings
                </button>
              </div>
            </div>
          )}

          {/* DATA / TESTS / JOBS fallback views (working content lists) */}
          {['Data', 'Tests', 'Jobs'].includes(activeSidebarItem) && (
            <div className="view-panel">
              <div className="view-title-row">
                <div>
                  <h2 className="view-heading">{activeSidebarItem}</h2>
                  <p className="view-desc">Monitor project assets, runs, and validation suites.</p>
                </div>
              </div>

              <div style={{ background: '#0d1117', border: '1px solid #30363d', borderRadius: '12px', padding: '24px' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#fff' }}>Active Runs</h4>
                <div style={{ fontSize: '0.85rem', color: '#8b949e' }}>
                  {activeSidebarItem === 'Data' && (
                    <ul>
                      <li>📁 <strong>workflow_payload.json</strong> - Seeding dataset (3.5kb, Uploaded 10m ago)</li>
                      <li>📁 <strong>llm_evaluations_feedback.csv</strong> - Feedback logs (24kb, Uploaded 1d ago)</li>
                    </ul>
                  )}
                  {activeSidebarItem === 'Tests' && (
                    <ul>
                      <li>🧪 <strong>validation_test_suite_1</strong> - <span style={{ color: '#56d364' }}>Passed</span> (0 cycles, 3 edges verified)</li>
                      <li>🧪 <strong>llm_response_schema_check</strong> - <span style={{ color: '#56d364' }}>Passed</span> (JSON schema compliance)</li>
                    </ul>
                  )}
                  {activeSidebarItem === 'Jobs' && (
                    <ul>
                      <li>⚙️ <strong>pipeline_observability_sync</strong> - Running (Every 5 mins)</li>
                      <li>⚙️ <strong>github_git_push_watchdog</strong> - Idle (Listening on commit)</li>
                    </ul>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Config Drawer */}
          {activeNodeId && (
            <NodeConfigDrawer
              key={activeNodeId}
              nodeId={activeNodeId}
              onClose={() => setActiveNodeId(null)}
            />
          )}
        </main>
      </div>

      {/* --- POPUP TOAST --- */}
      <div className={`toast-notification ${showDeployToast ? 'visible' : ''}`}>
        🚀 Deployed successfully! Webhook target: http://127.0.0.1:8002/pipelines/run
      </div>

      {/* --- TEMPLATES MODAL --- */}
      {showTemplatesModal && (
        <div className="modal-overlay" onClick={() => setShowTemplatesModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">Select Pipeline Template</h3>
              <button className="modal-close-btn" onClick={() => setShowTemplatesModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <p style={{ color: '#8b949e', fontSize: '0.85rem' }}>Select a boilerplate starter template to seed the canvas viewport:</p>
              <div className="templates-grid">
                {[
                  { icon: '🤖', title: 'Simple LLM Reasoner', desc: 'Input -> Prompt template -> LLM -> Output Responder' },
                  { icon: '🔀', title: 'Conditional Router', desc: 'Route inputs between two LLMs based on text classifier checks.' },
                  { icon: '🔌', title: 'API Webhook pipeline', desc: 'Collect API payload inputs and trigger REST endpoint triggers.' },
                  { icon: '⏱️', title: 'Feedback Loop', desc: 'Create delay triggers and callback loopback nodes for logs.' },
                ].map((item) => (
                  <div
                    key={item.title}
                    className="template-card"
                    onClick={() => {
                      alert(`Template '${item.title}' loaded to store.`);
                      setShowTemplatesModal(false);
                    }}
                  >
                    <span className="template-icon">{item.icon}</span>
                    <div className="template-title">{item.title}</div>
                    <div className="template-desc">{item.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- GITHUB MODAL --- */}
      {showGitHubModal && (
        <div className="modal-overlay" onClick={() => setShowGitHubModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 className="modal-title">🐙 Connect GitHub Repository</h3>
              <button className="modal-close-btn" onClick={() => setShowGitHubModal(false)}>&times;</button>
            </div>
            <div className="modal-body" style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label className="drawer-field-label" style={{ marginBottom: '6px' }}>Target Repository</label>
                <input
                  type="text"
                  className="chat-text-input"
                  value={githubRepo}
                  onChange={(e) => setGithubRepo(e.target.value)}
                  placeholder="e.g. Username/RepoName"
                />
              </div>

              {gitHubSuccessMsg && (
                <div style={{ padding: '10px 14px', backgroundColor: 'rgba(46, 160, 67, 0.1)', border: '1px solid rgba(46, 160, 67, 0.3)', borderRadius: '6px', fontSize: '0.8rem', color: '#56d364' }}>
                  ✓ {gitHubSuccessMsg}
                </div>
              )}

              <div style={{ display: 'flex', gap: '12px', marginTop: '10px' }}>
                <button
                  className="btn-primary"
                  onClick={handlePushToGithub}
                  disabled={isPushingGithub}
                >
                  {isPushingGithub ? 'Pushing layout...' : 'Push Active Canvas to Repo'}
                </button>
                <button className="btn-select-repo" onClick={() => setShowGitHubModal(false)}>Close</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

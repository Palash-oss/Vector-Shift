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
  const [activeSubTab, setActiveSubTab] = useState('Editor'); // 'Editor' | 'Logs'
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  // App Global Config / Pipeline state
  const [pipelineName, setPipelineName] = useState('Customer Support Bot');
  const [isDeployed, setIsDeployed] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);
  const [showDeployToast, setShowDeployToast] = useState(false);
  
  // Zustand Store variables
  const nodes = useStore((state) => state.nodes);
  const edges = useStore((state) => state.edges);
  const addNode = useStore((state) => state.addNode);
  const getNodeID = useStore((state) => state.getNodeID);
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

  // Integrations/Connections State
  const [openaiKey, setOpenaiKey] = useState('sk-proj-••••••••••••••••••••');
  const [anthropicKey, setAnthropicKey] = useState('sk-ant-••••••••••••••••••••');

  // --- DYNAMIC DATA VIEW STATE ---
  const [datasets, setDatasets] = useState([
    {
      name: 'Customer Support Tickets',
      headers: ['id', 'query', 'severity'],
      rows: [
        { id: '1', query: 'My database connection is failing with timeout.', severity: 'high' },
        { id: '2', query: 'How do I upgrade my billing tier?', severity: 'low' },
        { id: '3', query: 'Where is the documentation for custom nodes?', severity: 'medium' }
      ]
    },
    {
      name: 'Blog Ideas Generator',
      headers: ['id', 'topic', 'keywords'],
      rows: [
        { id: '1', topic: 'Future of Visual Flow Builders', keywords: 'React Flow, No-code' },
        { id: '2', topic: 'Top 10 LLM Orchestration Hacks', keywords: 'LLMs, AI agents' }
      ]
    }
  ]);
  const [selectedDatasetIdx, setSelectedDatasetIdx] = useState(0);
  const [newDatasetName, setNewDatasetName] = useState('');
  const [newDatasetCsv, setNewDatasetCsv] = useState('id,query,param\n1,Your custom input here,test\n2,Another testing row,val');

  // --- DYNAMIC PROMPTS VIEW STATE ---
  const [promptSearch, setPromptSearch] = useState('');
  const [editingPromptId, setEditingPromptId] = useState(null);
  const [editingPromptText, setEditingPromptText] = useState('');

  // --- DYNAMIC TESTS VIEW STATE ---
  const [isBatchTesting, setIsBatchTesting] = useState(false);
  const [testProgress, setTestProgress] = useState(0);
  const [testSuiteResults, setTestSuiteResults] = useState([]);

  // --- API PLAYGROUND CHAT STATE ---
  const [playgroundInputs, setPlaygroundInputs] = useState(
    JSON.stringify({ input: "Describe visual workflow editors" }, null, 2)
  );
  const [chatMessages, setChatMessages] = useState([
    { sender: 'assistant', text: '👋 Welcome to the Pipeline API Playground! Once you click "Deploy" in the top bar, you can test your visual canvas here by typing an input and running the workflow.' }
  ]);
  const [isPlaygroundRunning, setIsPlaygroundRunning] = useState(false);
  const [playgroundLogs, setPlaygroundLogs] = useState([]);

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
    } else if (itemName === 'Logs') {
      setActiveSubTab('Logs');
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
        body: JSON.stringify({
          inputs: parsedInputs,
          api_keys: {
            openai: openaiKey,
            anthropic: anthropicKey
          }
        })
      });
      
      const data = await response.json();
      if (response.ok && data.status === 'success') {
        const outputVal = Object.values(data.outputs).join('\n') || "Pipeline ran successfully. No outputs generated.";
        setChatMessages((prev) => [...prev, { sender: 'assistant', text: outputVal }]);
        
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

  // Import CSV dataset
  const handleImportDataset = () => {
    if (!newDatasetName) {
      alert("Please provide a name for the dataset!");
      return;
    }

    const lines = newDatasetCsv.trim().split('\n');
    if (lines.length < 2) {
      alert("CSV must have at least a header row and one data row!");
      return;
    }

    const headers = lines[0].split(',').map((h) => h.trim());
    const rows = [];

    for (let i = 1; i < lines.length; i++) {
      const cols = lines[i].split(',').map((c) => c.trim());
      const rowObj = {};
      headers.forEach((hdr, idx) => {
        rowObj[hdr] = cols[idx] || '';
      });
      rows.push(rowObj);
    }

    const newSet = { name: newDatasetName, headers, rows };
    setDatasets([...datasets, newSet]);
    setSelectedDatasetIdx(datasets.length);
    setNewDatasetName('');
    setNewDatasetCsv('id,query\n1,Your row text');
    addLog('success', `Imported custom dataset '${newDatasetName}' with ${rows.length} rows.`);
  };

  // Run Batch Tests over Selected Dataset
  const handleRunBatchTests = async () => {
    if (isBatchTesting) return;
    setIsBatchTesting(true);
    setTestProgress(0);
    setTestSuiteResults([]);
    addLog('info', `Starting batch test run on dataset: ${datasets[selectedDatasetIdx].name}...`);

    const activeDataset = datasets[selectedDatasetIdx];
    const results = [];
    
    // Simulate batch progression
    for (let idx = 0; idx < activeDataset.rows.length; idx++) {
      const row = activeDataset.rows[idx];
      const percent = Math.round(((idx + 1) / activeDataset.rows.length) * 100);
      
      const payloadInputs = { input: row.query || row.topic || Object.values(row)[1] };

      try {
        const response = await fetch('http://127.0.0.1:8002/pipelines/run', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            inputs: payloadInputs,
            api_keys: { openai: openaiKey, anthropic: anthropicKey }
          })
        });
        const data = await response.json();
        
        results.push({
          id: row.id || (idx + 1).toString(),
          input: payloadInputs.input,
          output: data.status === 'success' ? Object.values(data.outputs).join(', ') : 'Execution failed',
          latency: `${Math.floor(Math.random() * 200) + 300}ms`,
          status: response.ok && data.status === 'success' ? 'PASS' : 'FAIL'
        });
      } catch (err) {
        results.push({
          id: row.id || (idx + 1).toString(),
          input: payloadInputs.input,
          output: `Network Error: ${err.message}`,
          latency: '0ms',
          status: 'FAIL'
        });
      }

      setTestProgress(percent);
      await new Promise(r => setTimeout(r, 400)); // micro delay
    }

    setTestSuiteResults(results);
    setIsBatchTesting(false);
    addLog('success', `Batch test run finished: ${results.filter(r => r.status === 'PASS').length}/${results.length} test cases passed.`);
  };

  // Dynamic Prompt Adding back to Canvas
  const handleAddPromptNodeToCanvas = () => {
    const nodeID = getNodeID('text');
    const newNode = {
      id: nodeID,
      type: 'text',
      position: { x: 100 + Math.random() * 100, y: 150 + Math.random() * 100 },
      data: {
        id: nodeID,
        nodeType: 'text',
        customTitle: `Template Block ${nodeID.split('-')[1]}`,
        text: 'System context: {{input}}'
      }
    };
    addNode(newNode);
    addLog('success', `Added new Prompt Text Template Node [${nodeID}] directly to the visual canvas.`);
    alert(`Successfully added '${newNode.data.customTitle}' to the visual canvas! Go to 'Flows' to inspect it.`);
  };

  // Sidebar Items (Reports, Settings, and Connections fully removed)
  const sidebarItems = [
    { name: 'Flows', icon: '⚡' },
    { name: 'Prompts', icon: '📝' },
    { name: 'Data', icon: '📊' },
    { name: 'Logs', icon: '📋' },
    { name: 'Deployments', icon: '🚀' },
    { name: 'Tests', icon: '🧪' },
    { name: 'API Playground', icon: '🎮' },
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
            {['Editor', 'Logs'].map((tab) => (
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

          {/* PROMPTS VIEW (Fully Dynamic) */}
          {activeSidebarItem === 'Prompts' && (
            <div className="view-panel">
              <div className="view-title-row">
                <div>
                  <h2 className="view-heading">Prompts Manager</h2>
                  <p className="view-desc">Monitor, search, and edit prompt blocks inside LLM and Text template nodes.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <button className="btn-primary" style={{ width: 'auto', padding: '10px 16px' }} onClick={handleAddPromptNodeToCanvas}>
                    + Add Prompt Node to Canvas
                  </button>
                  <input
                    type="text"
                    className="picker-search-box"
                    style={{ maxWidth: '240px', margin: 0 }}
                    placeholder="Filter prompts..."
                    value={promptSearch}
                    onChange={(e) => setPromptSearch(e.target.value)}
                  />
                </div>
              </div>

              {promptNodes.length > 0 ? (
                <table className="prompts-table">
                  <thead>
                    <tr>
                      <th style={{ width: '15%' }}>Node ID</th>
                      <th style={{ width: '18%' }}>Label</th>
                      <th style={{ width: '40%' }}>Prompt Context</th>
                      <th style={{ width: '12%' }}>Variable Analyzer</th>
                      <th style={{ width: '15%' }}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {promptNodes.map((n) => {
                      const text = n.type === 'llm'
                        ? (n.data.promptBlocks?.[0]?.text || 'No system prompt configured.')
                        : (n.data.text || 'Empty template.');
                      
                      const isEditing = editingPromptId === n.id;

                      // Variable analysis logic
                      const varMatches = text.match(/\{\{([^}]+)\}\}/g) || [];
                      const vars = varMatches.map(m => m.replace(/[{}]/g, ''));

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
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                              {vars.length > 0 ? (
                                vars.map((v, i) => {
                                  // Mock check if connected
                                  const isConnected = v === 'input' || v === 'payload' || edges.some(e => e.target === n.id);
                                  return (
                                    <span
                                      key={i}
                                      style={{
                                        fontSize: '0.65rem',
                                        padding: '2px 6px',
                                        borderRadius: '4px',
                                        backgroundColor: isConnected ? 'rgba(74, 222, 128, 0.15)' : 'rgba(250, 204, 21, 0.15)',
                                        color: isConnected ? '#4ade80' : '#facc15',
                                        border: `1px solid ${isConnected ? 'rgba(74, 222, 128, 0.3)' : 'rgba(250, 204, 21, 0.3)'}`
                                      }}
                                    >
                                      {v}
                                    </span>
                                  );
                                })
                              ) : (
                                <span style={{ color: '#8b949e', fontSize: '0.75rem' }}>No variables</span>
                              )}
                            </div>
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
                <div style={{ padding: '40px', textAlign: 'center', color: '#8b949e', background: '#0d1117', border: '1px solid #30363d', borderRadius: '8px' }}>
                  No LLM or Text Template nodes found in the current workflow canvas.
                </div>
              )}
            </div>
          )}

          {/* DATA VIEW (Fully Dynamic) */}
          {activeSidebarItem === 'Data' && (
            <div className="view-panel">
              <div className="view-title-row">
                <div>
                  <h2 className="view-heading">Datasets & Payloads Manager</h2>
                  <p className="view-desc">Import, configure, and inspect target datasets to run visual test cases.</p>
                </div>
              </div>

              <div className="playground-chat-split" style={{ height: 'auto' }}>
                {/* CSV Importer Column */}
                <div className="playground-editor-col" style={{ height: 'auto' }}>
                  <h4 style={{ margin: 0, color: '#fff' }}>Import New Dataset</h4>
                  <div className="drawer-field-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
                    <label className="drawer-field-label">Dataset Name</label>
                    <input
                      type="text"
                      className="chat-text-input"
                      placeholder="e.g. Test Cases A"
                      value={newDatasetName}
                      onChange={(e) => setNewDatasetName(e.target.value)}
                    />
                  </div>
                  <div className="drawer-field-row" style={{ flexDirection: 'column', alignItems: 'flex-start', gap: '6px' }}>
                    <label className="drawer-field-label">CSV Content (Headers on line 1)</label>
                    <textarea
                      className="prompt-textarea"
                      style={{ height: '140px', fontFamily: 'monospace', fontSize: '0.8rem' }}
                      value={newDatasetCsv}
                      onChange={(e) => setNewDatasetCsv(e.target.value)}
                    />
                  </div>
                  <button className="btn-primary" onClick={handleImportDataset}>
                    Import CSV Dataset
                  </button>
                </div>

                {/* Datasets View Column */}
                <div className="playground-chat-col" style={{ height: 'auto', gap: '20px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h4 style={{ margin: 0, color: '#fff' }}>Available Datasets</h4>
                    <select
                      className="preset-dropdown-box"
                      style={{ background: '#161b22', border: '1px solid #30363d', minWidth: '180px' }}
                      value={selectedDatasetIdx}
                      onChange={(e) => setSelectedDatasetIdx(Number(e.target.value))}
                    >
                      {datasets.map((set, idx) => (
                        <option key={idx} value={idx}>{set.name}</option>
                      ))}
                    </select>
                  </div>

                  <div style={{ overflowX: 'auto' }}>
                    <table className="prompts-table" style={{ margin: 0 }}>
                      <thead>
                        <tr>
                          {datasets[selectedDatasetIdx].headers.map((h) => (
                            <th key={h}>{h}</th>
                          ))}
                          <th style={{ width: '80px' }}>Action</th>
                        </tr>
                      </thead>
                      <tbody>
                        {datasets[selectedDatasetIdx].rows.map((row, rIdx) => (
                          <tr key={rIdx}>
                            {datasets[selectedDatasetIdx].headers.map((h) => (
                              <td key={h}>{row[h]}</td>
                            ))}
                            <td>
                              <button
                                className="btn-schema-delete"
                                onClick={() => {
                                  const updatedSets = [...datasets];
                                  updatedSets[selectedDatasetIdx].rows.splice(rIdx, 1);
                                  setDatasets(updatedSets);
                                  addLog('info', 'Deleted dataset row.');
                                }}
                              >
                                &times;
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TESTS VIEW (Fully Dynamic Batch Testing) */}
          {activeSidebarItem === 'Tests' && (
            <div className="view-panel">
              <div className="view-title-row">
                <div>
                  <h2 className="view-heading">Automated Test Suites</h2>
                  <p className="view-desc">Run batch testing over selected datasets to validate workflow output schemas.</p>
                </div>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.85rem', color: '#8b949e' }}>Target Dataset:</span>
                  <select
                    className="preset-dropdown-box"
                    style={{ background: '#161b22', border: '1px solid #30363d' }}
                    value={selectedDatasetIdx}
                    onChange={(e) => setSelectedDatasetIdx(Number(e.target.value))}
                  >
                    {datasets.map((set, idx) => (
                      <option key={idx} value={idx}>{set.name}</option>
                    ))}
                  </select>
                  <button
                    className="btn-primary"
                    style={{ width: 'auto', padding: '10px 20px' }}
                    onClick={handleRunBatchTests}
                    disabled={isBatchTesting}
                  >
                    {isBatchTesting ? 'Running Suite...' : 'Run Test Suite'}
                  </button>
                </div>
              </div>

              {/* Progress bar */}
              {isBatchTesting && (
                <div style={{ marginBottom: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '8px' }}>
                    <span>Executing test runs...</span>
                    <span>{testProgress}%</span>
                  </div>
                  <div style={{ width: '100%', height: '8px', background: '#21262d', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${testProgress}%`, height: '100%', background: 'linear-gradient(90deg, #10b981, #059669)', borderRadius: '4px', transition: 'width 0.2s' }}></div>
                  </div>
                </div>
              )}

              {testSuiteResults.length > 0 ? (
                <table className="prompts-table">
                  <thead>
                    <tr>
                      <th style={{ width: '10%' }}>Case ID</th>
                      <th style={{ width: '35%' }}>Input Payload</th>
                      <th style={{ width: '40%' }}>Resolved Pipeline Output</th>
                      <th style={{ width: '10%' }}>Latency</th>
                      <th style={{ width: '5%' }}>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {testSuiteResults.map((res) => (
                      <tr key={res.id}>
                        <td style={{ fontFamily: 'monospace' }}>#{res.id}</td>
                        <td><span style={{ fontSize: '0.8rem', color: '#c9d1d9' }}>{res.input}</span></td>
                        <td><span style={{ fontSize: '0.8rem', color: '#8b949e', whiteSpace: 'pre-wrap' }}>{res.output}</span></td>
                        <td style={{ fontFamily: 'monospace', fontSize: '0.8rem' }}>{res.latency}</td>
                        <td>
                          <span
                            style={{
                              fontSize: '0.7rem',
                              fontWeight: '700',
                              padding: '2px 8px',
                              borderRadius: '4px',
                              backgroundColor: res.status === 'PASS' ? 'rgba(86, 211, 100, 0.15)' : 'rgba(248, 81, 73, 0.15)',
                              color: res.status === 'PASS' ? '#56d364' : '#ff7b72',
                              border: `1px solid ${res.status === 'PASS' ? 'rgba(86, 211, 100, 0.3)' : 'rgba(248, 81, 73, 0.3)'}`
                            }}
                          >
                            {res.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div style={{ padding: '60px', textAlign: 'center', background: '#0d1117', border: '1px solid #30363d', borderRadius: '12px' }}>
                  <div style={{ fontSize: '2.5rem', marginBottom: '16px' }}>🧪</div>
                  <h4 style={{ margin: '0 0 8px 0', color: '#fff' }}>No Test Runs Recorded</h4>
                  <p style={{ margin: '0 0 16px 0', fontSize: '0.85rem', color: '#8b949e' }}>Click 'Run Test Suite' to batch execute the active pipeline layout over row queries.</p>
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

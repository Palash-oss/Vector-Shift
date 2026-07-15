import React, { useState, useEffect } from 'react';
import { useStore } from './store';
import { PipelineToolbar } from './toolbar';
import { PipelineUI } from './ui';
import { SubmitButton } from './submit';
import { LandingPage } from './landing/LandingPage';
import { NodeConfigDrawer } from './components/NodeConfigDrawer';

function App() {
  // --- CUSTOM ROUTER STATE ---
  const [route, setRoute] = useState(window.location.pathname);

  useEffect(() => {
    const handlePopState = () => {
      setRoute(window.location.pathname);
    };
    window.addEventListener('popstate', handlePopState);
    return () => window.removeEventListener('popstate', handlePopState);
  }, []);

  const navigate = (path) => {
    window.history.pushState(null, '', path);
    setRoute(path);
  };

  // --- APP SHELL STATE ---
  const [pipelineName, setPipelineName] = useState('My Pipeline');
  const [activeSubTab, setActiveSubTab] = useState('Editor'); // 'Editor' | 'Logs' | 'Reports'
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [activeSidebarItem, setActiveSidebarItem] = useState('Flows');

  // Modal controls
  const [showGitHubModal, setShowGitHubModal] = useState(false);
  const [showTemplatesModal, setShowTemplatesModal] = useState(false);
  const [showDeployToast, setShowDeployToast] = useState(false);
  const [isDeploying, setIsDeploying] = useState(false);

  // Zustand Store
  const activeNodeId = useStore((state) => state.activeNodeId);
  const setActiveNodeId = useStore((state) => state.setActiveNodeId);

  // Sidebar items
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

  // Trigger deploy mock action
  const handleDeploy = () => {
    if (isDeploying) return;
    setIsDeploying(true);
    setTimeout(() => {
      setIsDeploying(false);
      setShowDeployToast(true);
      setTimeout(() => {
        setShowDeployToast(false);
      }, 4000);
    }, 1500);
  };

  // If routing to Landing Page
  if (route !== '/editor') {
    return <LandingPage navigate={navigate} />;
  }

  // Check if current screen is "Flows" and active sub-tab is "Editor"
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
            <span className="last-saved-time">3d ago</span>
            <button className="overflow-menu-btn">•••</button>
          </div>

          <div className="tab-switcher">
            {['Editor', 'Logs', 'Reports'].map((tab) => (
              <button
                key={tab}
                className={`tab-btn ${activeSubTab === tab ? 'active' : ''}`}
                onClick={() => setActiveSubTab(tab)}
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

          <div className="status-pill">
            <span className="status-dot-green"></span>
            <span>Project Deployed</span>
          </div>
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
                  onClick={() => setActiveSidebarItem(item.name)}
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
          {isFlowsVisible ? (
            <>
              {/* Toolbar chips for dragging nodes */}
              <PipelineToolbar />
              {/* Canvas React Flow */}
              <PipelineUI />
              {/* Bottom Canvas Toolbar Overlays */}
              <div className="bottom-left-toolbar">
                <button className="canvas-tool-btn" title="Templates" onClick={() => setShowTemplatesModal(true)}>
                  📋 Templates
                </button>
                <span className="btn-separator"></span>
                <button className="canvas-tool-btn" title="Add Sticky Comment">
                  ✍️ Add Note
                </button>
              </div>

              {/* Bottom Right Submit Controller */}
              <SubmitButton />
            </>
          ) : (
            <div className="placeholder-screen">
              <div className="placeholder-content">
                <h2>{activeSidebarItem === 'Flows' ? activeSubTab : activeSidebarItem}</h2>
                <p>Features on this tab are coming soon. Go back to Flows → Editor to design your pipeline.</p>
                <button
                  className="btn-primary"
                  onClick={() => {
                    setActiveSidebarItem('Flows');
                    setActiveSubTab('Editor');
                  }}
                  style={{ marginTop: '16px' }}
                >
                  Return to Flow Editor
                </button>
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
        🚀 Deployed successfully to pipeline-studio-preview.vercel.app
      </div>

      {/* --- GITHUB CONNECTION MODAL --- */}
      {showGitHubModal && (
        <div className="modal-overlay" onClick={() => setShowGitHubModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <span className="modal-title">🐙 Connect GitHub Repository</span>
              <button className="modal-close-btn" onClick={() => setShowGitHubModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <p>Connect your repository to enable continuous deployments and automated PR checking.</p>
              <div className="github-repo-list">
                {[
                  'my-org/primary-ai-agents',
                  'personal/slack-summarizer-workflow',
                  'company/vector-ingest-pipelines',
                ].map((repo) => (
                  <div key={repo} className="repo-picker-row">
                    <span className="repo-name-text">{repo}</span>
                    <button className="btn-select-repo" onClick={() => setShowGitHubModal(false)}>
                      Select
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- TEMPLATES MODAL --- */}
      {showTemplatesModal && (
        <div className="modal-overlay" onClick={() => setShowTemplatesModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '600px' }}>
            <div className="modal-header">
              <span className="modal-title">📋 Select Pipeline Template</span>
              <button className="modal-close-btn" onClick={() => setShowTemplatesModal(false)}>&times;</button>
            </div>
            <div className="modal-body">
              <p>Jumpstart your flow using one of our curated high-performance pipeline configurations.</p>
              <div className="templates-grid">
                {[
                  { icon: '🤖', title: 'Basic LLM Chatbot', desc: 'Connects User input directly to LLM with system instruction and streams response.' },
                  { icon: '📑', title: 'Document RAG Ingestion', desc: 'Extracts file text, chunks, computes embedding vectors, and saves to DB.' },
                  { icon: '📨', title: 'Lead Classifier & Router', desc: 'Parses incoming webhook requests and routes to specific sales departments.' },
                  { icon: '⚙️', title: 'Scheduled DB Backup Sync', desc: 'Trigger node executes daily to export records, compress, and sync to S3.' },
                ].map((tpl) => (
                  <div key={tpl.title} className="template-card" onClick={() => setShowTemplatesModal(false)}>
                    <span className="template-icon">{tpl.icon}</span>
                    <div className="template-title">{tpl.title}</div>
                    <div className="template-desc">{tpl.desc}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;

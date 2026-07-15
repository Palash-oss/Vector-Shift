import React, { useState, useEffect } from 'react';

export const LandingPage = ({ navigate }) => {
  const [activeTab, setActiveTab] = useState('build');
  const [promptInput, setPromptInput] = useState('');

  // Feature content mapping
  const featureContent = {
    build: {
      eyebrow: 'DRAG & DROP CANVAS',
      heading: 'Visual Flow Editor',
      description: 'Design complex AI agent workflows, data transformations, and API pipelines visually. Chain LLMs, filters, custom code, and logic branches without writing boilerplate code.',
      linkText: 'Explore node types →',
      visualItems: [
        { icon: '🧩', label: 'Math Node Added', detail: 'Expression: x * 2 + y', time: '1s ago', status: 'success' },
        { icon: '🤖', label: 'LLM Node Configured', detail: 'Model: gpt-4o-mini', time: '5s ago', status: 'success' },
        { icon: '📥', label: 'Input Node Initialized', detail: 'Key: api_payload', time: '12s ago', status: 'success' },
      ],
    },
    deploy: {
      eyebrow: 'ONE-CLICK HOSTING',
      heading: 'Instant Live Deploys',
      description: 'Ship your pipelines to production with one click. We generate serverless endpoints automatically, complete with automatic scaling, API keys, and CORS configurations.',
      linkText: 'Learn about deployments →',
      visualItems: [
        { icon: '🚀', label: 'Deployment Finished', detail: 'pipeline-studio-preview.vercel.app', time: 'Just now', status: 'success' },
        { icon: '🔒', label: 'SSL Certificate Issued', detail: 'Domain: pipeline-studio-preview', time: '2m ago', status: 'success' },
        { icon: '📦', label: 'Bundling Serverless Fn', detail: 'Size: 1.2MB', time: '3m ago', status: 'success' },
      ],
    },
    optimize: {
      eyebrow: 'REAL-TIME OBSERVABILITY',
      heading: 'Cost & Latency Analytics',
      description: 'Monitor token consumption, total cost, and response latency per node execution. Trace errors instantly and replay pipeline runs with customized inputs for debugging.',
      linkText: 'Check tracking docs →',
      visualItems: [
        { icon: '📊', label: 'Cost Tracked', detail: '0.0012 USD (152 tokens)', time: 'Just now', status: 'success' },
        { icon: '⏱️', label: 'Latency Logged', detail: 'Response time: 480ms', time: '15s ago', status: 'success' },
        { icon: '🔍', label: 'Input Replay Enabled', detail: 'Trigger: Test Button', time: '1m ago', status: 'success' },
      ],
    },
  };

  const handleLaunch = () => {
    navigate('/editor');
  };

  const handleSuggestionClick = (text) => {
    setPromptInput(text);
  };

  return (
    <div className="landing-wrapper">
      {/* Header / Nav */}
      <nav className="landing-nav">
        <div className="landing-nav-container">
          <div className="landing-logo">
            <span className="logo-glow"></span>
            <span className="logo-text">Pipeline Studio</span>
          </div>
          <div className="landing-nav-links">
            <a href="#product" className="nav-link">Product</a>
            <a href="#solutions" className="nav-link">Solutions</a>
            <a href="#docs" className="nav-link">Docs</a>
            <div className="nav-link-dropdown">
              <a href="#pricing" className="nav-link">Pricing <span className="chevron-down">▼</span></a>
            </div>
          </div>
          <div className="landing-nav-actions">
            <button className="btn-ghost" onClick={handleLaunch}>Sign Up</button>
            <button className="btn-primary" onClick={handleLaunch}>Launch App</button>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="landing-hero">
        <div className="hero-container">
          <div className="pill-badge">
            <span className="pill-pulse"></span>
            <span>Introducing Pipeline Studio v2.0</span>
          </div>
          <h1 className="hero-title">
            Build AI Agents & Pipelines
            <br />
            <span className="text-gradient">Without Writing Boilerplate</span>
          </h1>
          <p className="hero-subtitle">
            A visual flow builder to assemble, validate, and deploy production-grade LLM chains, custom logic nodes, and API connections in seconds.
          </p>

          <form className="hero-input-form" onSubmit={(e) => { e.preventDefault(); handleLaunch(); }}>
            <div className="search-input-wrapper">
              <span className="search-icon">🔍</span>
              <input
                type="text"
                placeholder="Describe a workflow you want to build..."
                className="search-input"
                value={promptInput}
                onChange={(e) => setPromptInput(e.target.value)}
              />
              <button type="button" className="search-submit-btn" onClick={handleLaunch}>
                ➔
              </button>
            </div>
          </form>

          <div className="suggestions-row">
            <button className="suggestion-pill" onClick={() => handleSuggestionClick('Translate CSV files using GPT-4o')}>
              📁 Translate CSV with GPT-4
            </button>
            <button className="suggestion-pill" onClick={() => handleSuggestionClick('Trigger email alert when API fails')}>
              📨 API Fail Email Alert
            </button>
            <button className="suggestion-pill" onClick={() => handleSuggestionClick('Analyze customer sentiment and categorize')}>
              🤖 Analyze Sentiment
            </button>
          </div>

          <div className="hero-footer-info">
            <span className="shield-icon">🛡️</span> No credit card required. Free dev plan.
          </div>
        </div>
      </header>

      {/* Mock Editor Canvas Frame */}
      <section className="landing-preview">
        <div className="preview-container">
          <div className="browser-frame">
            <div className="frame-header">
              <div className="frame-dots">
                <span className="dot red"></span>
                <span className="dot yellow"></span>
                <span className="dot green"></span>
              </div>
              <div className="frame-address">pipeline-studio.internal/editor</div>
            </div>
            <div className="frame-body">
              <div className="mock-editor-overlay">
                <div className="overlay-content">
                  <h3>Interactive Editor Environment</h3>
                  <p>Design multi-node workflows and test them in real-time.</p>
                  <button className="btn-primary" onClick={handleLaunch}>Enter Visual Workspace</button>
                </div>
              </div>
              {/* Simplified mock UI layout */}
              <div className="mock-editor-grid">
                <div className="mock-sidebar">
                  <div className="mock-item active">Flows</div>
                  <div className="mock-item">Prompts</div>
                  <div className="mock-item">Logs</div>
                  <div className="mock-item">Settings</div>
                </div>
                <div className="mock-canvas">
                  <div className="mock-node node-1">
                    <div className="mock-node-hdr bg-green">✓ Input Node</div>
                    <div className="mock-node-body">Name: payload</div>
                  </div>
                  <div className="mock-node node-2">
                    <div className="mock-node-hdr bg-indigo">LLM Processor</div>
                    <div className="mock-node-body">Prompt: {"{{payload}}"}</div>
                  </div>
                  <div className="mock-connector"></div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust/Logo Bar */}
      <section className="trust-bar">
        <div className="trust-container">
          <span className="trust-text">Trusted by 10,000+ developers at next-gen companies</span>
          <div className="logo-grid">
            <span className="logo-wordmark">VectraShift</span>
            <span className="logo-wordmark">KubeSystems</span>
            <span className="logo-wordmark">CodexAI</span>
            <span className="logo-wordmark">LogiScale</span>
            <span className="logo-wordmark">NeuraLink</span>
          </div>
        </div>
      </section>

      {/* Features switcher tabs */}
      <section className="landing-features">
        <div className="features-container">
          <div className="features-tabs">
            <button
              className={`features-tab-pill ${activeTab === 'build' ? 'active' : ''}`}
              onClick={() => setActiveTab('build')}
            >
              🧩 Build
            </button>
            <button
              className={`features-tab-pill ${activeTab === 'deploy' ? 'active' : ''}`}
              onClick={() => setActiveTab('deploy')}
            >
              🚀 Deploy
            </button>
            <button
              className={`features-tab-pill ${activeTab === 'optimize' ? 'active' : ''}`}
              onClick={() => setActiveTab('optimize')}
            >
              ⏱️ Optimize
            </button>
          </div>

          <div className="feature-content-row">
            {/* Left Col */}
            <div className="feature-text-col">
              <span className="feature-eyebrow">{featureContent[activeTab].eyebrow}</span>
              <h2 className="feature-heading">{featureContent[activeTab].heading}</h2>
              <p className="feature-description">{featureContent[activeTab].description}</p>
              <a href="#editor" className="feature-link" onClick={(e) => { e.preventDefault(); handleLaunch(); }}>
                {featureContent[activeTab].linkText}
              </a>
            </div>

            {/* Right Col */}
            <div className="feature-visual-col">
              <div className="activity-card-stack">
                {featureContent[activeTab].visualItems.map((item, index) => (
                  <div key={index} className="activity-item-card">
                    <div className="activity-icon-box">{item.icon}</div>
                    <div className="activity-details">
                      <div className="activity-header">
                        <span className="activity-label">{item.label}</span>
                        <span className="activity-time">{item.time}</span>
                      </div>
                      <div className="activity-sub">{item.detail}</div>
                    </div>
                  </div>
                ))}
                <div className="vertical-connection-line"></div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="footer-container">
          <div>© 2026 Pipeline Studio Inc. Built for the VectorShift Technical Assessment.</div>
          <div className="footer-links">
            <a href="#terms">Terms</a>
            <a href="#privacy">Privacy</a>
            <a href="#github">GitHub</a>
          </div>
        </div>
      </footer>
    </div>
  );
};

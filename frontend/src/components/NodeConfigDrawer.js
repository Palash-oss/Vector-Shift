import React, { useState, useEffect } from 'react';
import { useStore } from '../store';

export const NodeConfigDrawer = ({ nodeId, onClose }) => {
  // Zustand Store hooks
  const nodes = useStore((state) => state.nodes);
  const updateNodeField = useStore((state) => state.updateNodeField);
  const setNodeStatus = useStore((state) => state.setNodeStatus);

  // Find target node
  const node = nodes.find((n) => n.id === nodeId);
  const nodeType = node?.type || '';
  const nodeData = node?.data || {};

  // --- LOCAL STATE FOR CONFIG DRAWERS ---
  const [activeTab, setActiveTab] = useState('Config'); // 'Config' | 'Schema' | 'Logs' | 'Raw'
  const [customTitle, setCustomTitle] = useState(nodeData.customTitle || nodeType);
  const [model, setModel] = useState(nodeData.model || 'gpt-4o-mini');
  const [logicSubTab, setLogicSubTab] = useState('config'); // 'config' | 'logic'

  // Input Toggles State
  const defaultPills = { tools: true, messages: false, memories: false, attachments: false };
  const [activePills, setActivePills] = useState(nodeData.inputPills || defaultPills);

  // Outputs Schema Builder
  const [schemaFields, setSchemaFields] = useState(
    nodeData.schemaFields || [
      { name: 'response', type: 'String', required: true },
      { name: 'confidence', type: 'Float', required: false },
    ]
  );

  // Prompts Builder
  const [prompts, setPrompts] = useState(
    nodeData.promptBlocks || [
      { id: '1', role: 'System', text: 'You are a helpful AI assistant.' },
      { id: '2', role: 'User', text: 'Analyze this input: {{input}}' },
    ]
  );

  // Testing status
  const [isTesting, setIsTesting] = useState(false);
  const [testOutput, setTestOutput] = useState(null);
  const [showAIHelp, setShowAIHelp] = useState(false);

  // Accordions
  const [openDoc, setOpenDoc] = useState(false);
  const [openEx, setOpenEx] = useState(false);

  // Sync state changes back to Zustand store
  useEffect(() => {
    updateNodeField(nodeId, 'customTitle', customTitle);
  }, [nodeId, customTitle, updateNodeField]);

  useEffect(() => {
    updateNodeField(nodeId, 'model', model);
  }, [nodeId, model, updateNodeField]);

  useEffect(() => {
    updateNodeField(nodeId, 'inputPills', activePills);
  }, [nodeId, activePills, updateNodeField]);

  useEffect(() => {
    updateNodeField(nodeId, 'schemaFields', schemaFields);
  }, [nodeId, schemaFields, updateNodeField]);

  useEffect(() => {
    updateNodeField(nodeId, 'promptBlocks', prompts);
  }, [nodeId, prompts, updateNodeField]);

  // Schema functions
  const handleAddSchemaField = () => {
    setSchemaFields([...schemaFields, { name: 'new_field', type: 'String', required: false }]);
  };

  const handleUpdateSchemaField = (idx, field, val) => {
    const updated = [...schemaFields];
    updated[idx][field] = val;
    setSchemaFields(updated);
  };

  const handleRemoveSchemaField = (idx) => {
    const updated = [...schemaFields];
    updated.splice(idx, 1);
    setSchemaFields(updated);
  };

  // Prompts functions
  const handleAddPromptBlock = () => {
    setPrompts([
      ...prompts,
      { id: Date.now().toString(), role: 'User', text: '' },
    ]);
  };

  const handleUpdatePromptBlock = (id, text) => {
    setPrompts(prompts.map((p) => (p.id === id ? { ...p, text } : p)));
  };

  const handleRemovePromptBlock = (id) => {
    setPrompts(prompts.filter((p) => p.id !== id));
  };

  const togglePill = (pillKey) => {
    setActivePills({ ...activePills, [pillKey]: !activePills[pillKey] });
  };

  // Run mock test action
  const handleRunTest = () => {
    if (isTesting) return;
    setIsTesting(true);
    setNodeStatus(nodeId, 'testing');

    setTimeout(() => {
      setIsTesting(false);
      setNodeStatus(nodeId, 'success');

      // Generate realistic mock response
      const mockResult = {
        status: "success",
        data: {
          output: `Processed successfully via model '${model}'.`,
          variables_extracted: nodeData.variables || [],
          timestamp: new Date().toISOString(),
        },
        _meta: {
          input_tokens: 152,
          output_tokens: 310,
          total_cost: 0.0012,
        }
      };

      setTestOutput(mockResult);
    }, 1200);
  };

  if (!node) return null;

  return (
    <div className="config-drawer">
      {/* Drawer Header */}
      <div className="drawer-header">
        <div className="drawer-header-left">
          <input
            type="text"
            className="drawer-title-input"
            value={customTitle}
            onChange={(e) => setCustomTitle(e.target.value)}
            title="Click to rename node"
          />
          <button className="btn-rename-icon">✏️</button>
          <span className="btn-separator" style={{ height: '16px' }}></span>
          <select className="preset-dropdown-box" defaultValue="default">
            <option value="default">Default Preset</option>
            <option value="rag">RAG Search Config</option>
            <option value="json">Structured JSON Output</option>
          </select>
        </div>

        <div className="drawer-header-right">
          <button className="btn-drawer-help" title="Documentation">❓</button>
          <button className="btn-drawer-close" onClick={onClose} title="Close drawer">&times;</button>
        </div>
      </div>

      {/* Drawer Body Area */}
      <div className="drawer-body">
        {/* Left vertical rail tabs */}
        <div className="drawer-rail-tabs">
          {[
            { id: 'Config', icon: '⚙️' },
            { id: 'Schema', icon: '📋' },
            { id: 'Logs', icon: '📝' },
            { id: 'Raw', icon: '⚛️' },
          ].map((tab) => (
            <button
              key={tab.id}
              className={`rail-tab-btn ${activeTab === tab.id ? 'active' : ''}`}
              onClick={() => setActiveTab(tab.id)}
            >
              <span className="rail-tab-icon">{tab.icon}</span>
              <span>{tab.id}</span>
            </button>
          ))}
        </div>

        {/* Core content split panel */}
        <div className="drawer-main-content-split">
          {/* Main Config Form Area */}
          <div className="drawer-editor-col">
            {activeTab === 'Config' && (
              <>
                {/* 1. Model Name Row */}
                <div>
                  <div className="drawer-section-title">Generative Model Settings</div>
                  <div className="drawer-field-row">
                    <label className="drawer-field-label">Model Engine</label>
                    <select
                      className="drawer-input-select"
                      value={model}
                      onChange={(e) => setModel(e.target.value)}
                    >
                      <option value="gpt-4o-mini">gpt-4o-mini (Default)</option>
                      <option value="gpt-4o">gpt-4o (Premium)</option>
                      <option value="claude-3-5-sonnet">claude-3-5-sonnet</option>
                      <option value="gemini-1.5-flash">gemini-1.5-flash</option>
                    </select>
                  </div>
                </div>

                {/* 2. Logic Switcher Tab Row */}
                <div className="sub-tab-toggle-row">
                  <button
                    className={`sub-tab-btn ${logicSubTab === 'config' ? 'active' : ''}`}
                    onClick={() => setLogicSubTab('config')}
                  >
                    Configuration
                  </button>
                  <button
                    className={`sub-tab-btn ${logicSubTab === 'logic' ? 'active' : ''}`}
                    onClick={() => setLogicSubTab('logic')}
                  >
                    Custom Logic
                  </button>
                </div>

                {/* 3. Inputs pills toggle selection */}
                <div>
                  <div className="drawer-section-title">INPUT CONNECTIONS</div>
                  <div className="pills-toggle-row">
                    {Object.keys(activePills).map((pill) => (
                      <button
                        key={pill}
                        className={`toggle-pill-btn ${activePills[pill] ? 'active' : ''}`}
                        onClick={() => togglePill(pill)}
                      >
                        {pill.toUpperCase()}
                      </button>
                    ))}
                  </div>
                </div>

                {/* 4. Draggable Prompts Row */}
                <div>
                  <div className="drawer-section-title" style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>PROMPT BLOCKS</span>
                    <button className="btn-schema-add" style={{ width: 'auto', padding: '2px 8px', borderStyle: 'solid' }} onClick={handleAddPromptBlock}>
                      + Block
                    </button>
                  </div>
                  <div className="prompts-list">
                    {prompts.map((p) => (
                      <div key={p.id} className="prompt-block">
                        <div className="prompt-block-hdr">
                          <span>{p.role} Role Block</span>
                          <button className="btn-schema-delete" onClick={() => handleRemovePromptBlock(p.id)}>&times;</button>
                        </div>
                        <textarea
                          className="prompt-textarea"
                          value={p.text}
                          onChange={(e) => handleUpdatePromptBlock(p.id, e.target.value)}
                          placeholder="Enter instructions..."
                        />
                      </div>
                    ))}
                  </div>
                  <div className="prompt-footer-row">
                    <span className="ctrl-k-hint">Ctrl+K for AI Assistant</span>
                    <button className="suggestion-pill" onClick={() => setShowAIHelp(true)}>
                      🪄 AI Help
                    </button>
                  </div>
                </div>

                {/* 5. Outputs schema builder */}
                <div>
                  <div className="drawer-section-title">OUTPUT JSON SCHEMA</div>
                  <div className="schema-rows-list">
                    {schemaFields.map((field, idx) => (
                      <div key={idx} className="schema-builder-row">
                        <input
                          type="text"
                          className="schema-field-input"
                          value={field.name}
                          onChange={(e) => handleUpdateSchemaField(idx, 'name', e.target.value)}
                        />
                        <select
                          className="schema-field-select"
                          value={field.type}
                          onChange={(e) => handleUpdateSchemaField(idx, 'type', e.target.value)}
                        >
                          <option value="String">String</option>
                          <option value="Integer">Integer</option>
                          <option value="Float">Float</option>
                          <option value="Boolean">Boolean</option>
                        </select>
                        <button className="btn-schema-delete" onClick={() => handleRemoveSchemaField(idx)}>&times;</button>
                      </div>
                    ))}
                  </div>
                  <button className="btn-schema-add" onClick={handleAddSchemaField}>
                    + Add Schema Property
                  </button>
                </div>
              </>
            )}

            {activeTab === 'Schema' && (
              <div style={{ fontSize: '0.85rem', color: '#8b949e' }}>
                <div className="drawer-section-title">Resolved Input/Output Schema</div>
                <p>Output Schema validation keys loaded: </p>
                <ul>
                  {schemaFields.map((f, i) => (
                    <li key={i}><strong>{f.name}</strong>: {f.type}</li>
                  ))}
                </ul>
              </div>
            )}

            {activeTab === 'Logs' && (
              <div style={{ fontSize: '0.85rem', color: '#8b949e', fontFamily: 'monospace' }}>
                <div className="drawer-section-title">Execution History</div>
                <div style={{ padding: '8px', borderLeft: '2px solid #2ea043', marginBottom: '8px' }}>
                  [11:04:12] SUCCESS: Execution completed (cost: $0.0012)
                </div>
                <div style={{ padding: '8px', borderLeft: '2px solid #2ea043' }}>
                  [11:01:05] SUCCESS: Handshake done with Model Engine
                </div>
              </div>
            )}

            {activeTab === 'Raw' && (
              <div style={{ height: '100%' }}>
                <div className="drawer-section-title">Raw JSON representation</div>
                <textarea
                  className="prompt-textarea"
                  style={{ height: '80%', fontFamily: 'monospace' }}
                  value={JSON.stringify(node, null, 2)}
                  readOnly
                />
              </div>
            )}
          </div>

          {/* Right side Test Output Column */}
          <div className="drawer-test-col">
            <div className="test-header-row">
              <span className="test-col-title">Test Output</span>
              <button
                className="test-btn-primary"
                onClick={handleRunTest}
                disabled={isTesting}
              >
                {isTesting ? 'Running...' : 'Run Test'}
              </button>
            </div>

            <div className="test-output-box">
              {isTesting ? (
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
                  <span className="spinner-tiny" style={{ borderTopColor: '#3b82f6' }}></span>
                  <span style={{ fontSize: '0.75rem', color: '#8b949e' }}>Executing pipeline node...</span>
                </div>
              ) : testOutput ? (
                <pre>{JSON.stringify(testOutput, null, 2)}</pre>
              ) : (
                <div style={{ color: '#6b7280', fontSize: '0.75rem', textAlign: 'center', marginTop: '40px' }}>
                  Click 'Run Test' above to execute this node visually.
                </div>
              )}
            </div>

            {testOutput && (
              <div className="metadata-row">
                <div className="metadata-item">
                  <span>Input Tokens:</span>
                  <span className="metadata-val">{testOutput._meta.input_tokens}</span>
                </div>
                <div className="metadata-item">
                  <span>Output Tokens:</span>
                  <span className="metadata-val">{testOutput._meta.output_tokens}</span>
                </div>
                <div className="metadata-item">
                  <span>Total Cost:</span>
                  <span className="metadata-val">${testOutput._meta.total_cost.toFixed(4)}</span>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Accordion Footers */}
      <div className="drawer-footer">
        <div className="accordion-item">
          <button className="accordion-hdr" onClick={() => setOpenDoc(!openDoc)}>
            <span>Documentation</span>
            <span>{openDoc ? '▲' : '▼'}</span>
          </button>
          {openDoc && (
            <div className="accordion-body">
              This node represents an execution block on the visual canvas. Integrate this block into a chain by supplying outputs of another block as properties (e.g. <code>{"{{variable_name}}"}</code>).
            </div>
          )}
        </div>
        <div className="accordion-item">
          <button className="accordion-hdr" onClick={() => setOpenEx(!openEx)}>
            <span>Reference Examples</span>
            <span>{openEx ? '▲' : '▼'}</span>
          </button>
          {openEx && (
            <div className="accordion-body">
              Example payload inputs: <code>{"{\"api_payload\": \"Retrieve data list\"}"}</code>
            </div>
          )}
        </div>
      </div>

      {/* AI popover */}
      {showAIHelp && (
        <div className="modal-overlay" onClick={() => setShowAIHelp(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '360px', padding: '20px' }}>
            <h4 style={{ margin: '0 0 8px 0', color: '#fff' }}>🤖 AI Prompt Assistant</h4>
            <p style={{ fontSize: '0.8rem', color: '#8b949e', margin: '0 0 16px 0' }}>
              The AI Co-pilot assistant feature is coming soon in v2.1!
            </p>
            <button className="modal-btn" style={{ width: '100%' }} onClick={() => setShowAIHelp(false)}>
              Got it
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

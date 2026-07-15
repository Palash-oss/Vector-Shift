import React, { useState, useEffect, useRef } from 'react';

// Node list mapping with labels, icons, categories, and descriptions
const availableNodes = [
  { type: 'customInput', label: 'Input Node', icon: '📥', category: 'Data', desc: 'Accept workflow payload inputs' },
  { type: 'customOutput', label: 'Output Node', icon: '📤', category: 'Data', desc: 'Return workflow response outputs' },
  { type: 'llm', label: 'LLM Processor', icon: '🤖', category: 'AI', desc: 'Process text using Large Language Models' },
  { type: 'text', label: 'Text Block', icon: '📝', category: 'AI', desc: 'Define template text and variables' },
  { type: 'conditional', label: 'Conditional Branch', icon: '🔀', category: 'Logic', desc: 'Route flows based on logic rules' },
  { type: 'filter', label: 'Array Filter', icon: '🔍', category: 'Logic', desc: 'Filter lists matching key expressions' },
  { type: 'math', label: 'Math Expression', icon: '🧩', category: 'Logic', desc: 'Run math functions on inputs' },
  { type: 'api', label: 'API Request', icon: '🔌', category: 'Apps', desc: 'Send webhooks or REST API requests' },
  { type: 'timer', label: 'Delay Timer', icon: '⏱️', category: 'Apps', desc: 'Pause pipeline execution briefly' },
];

export const NodePickerMenu = ({ x, y, onClose, onSelectNode }) => {
  const [activeCategory, setActiveCategory] = useState('Recently Used');
  const [searchQuery, setSearchQuery] = useState('');
  const menuRef = useRef(null);

  // Categories list
  const categories = ['Recently Used', 'AI', 'Data', 'Logic', 'Apps'];

  // Handle outside clicks to close the menu
  useEffect(() => {
    const handleOutsideClick = (e) => {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        onClose();
      }
    };
    document.addEventListener('mousedown', handleOutsideClick);
    return () => document.removeEventListener('mousedown', handleOutsideClick);
  }, [onClose]);

  // Filter nodes based on category and search query
  const filteredNodes = availableNodes.filter((node) => {
    // 1. Filter by Search Query (Case Insensitive)
    const matchesSearch = node.label.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          node.desc.toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    // 2. Filter by Category
    if (activeCategory === 'Recently Used') {
      // Show first 4 popular nodes
      return ['llm', 'text', 'customInput', 'api'].includes(node.type);
    }
    return node.category === activeCategory;
  });

  return (
    <div
      ref={menuRef}
      className="node-picker-menu"
      style={{
        left: `${x}px`,
        top: `${y}px`,
      }}
    >
      {/* Left Column Categories Nav */}
      <div className="picker-left-col">
        {categories.map((cat) => (
          <button
            key={cat}
            className={`picker-category-item ${activeCategory === cat ? 'active' : ''}`}
            onClick={() => setActiveCategory(cat)}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Right Column Search & Node Grid */}
      <div className="picker-right-col">
        <input
          type="text"
          className="picker-search-box"
          placeholder="Search node..."
          autoFocus
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />

        <div className="picker-grid-scroll">
          {filteredNodes.length > 0 ? (
            <div className="picker-nodes-grid">
              {filteredNodes.map((node) => (
                <div
                  key={node.type}
                  className="picker-node-card"
                  onClick={() => {
                    onSelectNode(node.type);
                    onClose();
                  }}
                  title={node.desc}
                >
                  <span className="picker-node-icon">{node.icon}</span>
                  <div className="picker-node-label">{node.label}</div>
                </div>
              ))}
            </div>
          ) : (
            <div style={{ padding: '20px 0', textAlign: 'center', fontSize: '0.8rem', color: '#6b7280' }}>
              No nodes match your query.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

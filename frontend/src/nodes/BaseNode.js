import React from 'react';
import { Handle, Position } from 'reactflow';
import { useStore } from '../store';

export const BaseNode = ({
  id,
  title,
  type = 'default',
  handles = [],
  children,
  style,
}) => {
  const onNodesChange = useStore((state) => state.onNodesChange);
  const activeNodeId = useStore((state) => state.activeNodeId);
  const setActiveNodeId = useStore((state) => state.setActiveNodeId);
  const nodeStatuses = useStore((state) => state.nodeStatuses || {});
  const nodeData = useStore((state) => state.nodes.find((n) => n.id === id)?.data || {});

  const status = nodeStatuses[id] || 'untouched'; // 'untouched' | 'testing' | 'success' | 'error'

  const handleDelete = (e) => {
    e.stopPropagation();
    onNodesChange([{ id, type: 'remove' }]);
  };

  const handleCardClick = () => {
    setActiveNodeId(id);
  };

  // Map type to Category & Icon
  const getCategoryAndIcon = (t) => {
    switch (t) {
      case 'input':
      case 'customInput':
        return { category: 'Interface', icon: '📥', class: 'category-interface' };
      case 'output':
      case 'customOutput':
        return { category: 'Interface', icon: '📤', class: 'category-interface' };
      case 'llm':
        return { category: 'AI', icon: '🤖', class: 'category-ai' };
      case 'text':
        return { category: 'AI', icon: '📝', class: 'category-ai' };
      case 'conditional':
        return { category: 'Logic', icon: '🔀', class: 'category-logic' };
      case 'filter':
        return { category: 'Logic', icon: '🔍', class: 'category-logic' };
      case 'math':
        return { category: 'Logic', icon: '🧩', class: 'category-logic' };
      case 'api':
        return { category: 'Apps', icon: '🔌', class: 'category-apps' };
      case 'timer':
        return { category: 'Apps', icon: '⏱️', class: 'category-apps' };
      default:
        return { category: 'General', icon: '⚙️', class: 'category-logic' };
    }
  };

  const { category, icon, class: categoryClass } = getCategoryAndIcon(type);
  const displayTitle = nodeData.customTitle || title;

  return (
    <div
      className={`base-node node-type-${type} ${activeNodeId === id ? 'selected-glow' : ''}`}
      style={style}
      onClick={handleCardClick}
    >
      {/* 1. Status Bar */}
      <div className={`node-status-bar ${status === 'success' ? 'success' : status === 'error' ? 'error' : ''}`}></div>

      {/* 2. Success Status Alert Header */}
      {status === 'success' && (
        <div className="node-header-validated">
          <span>✓</span>
          <span>Test Successful</span>
        </div>
      )}

      {/* 3. Node Title & Deletion Header */}
      <div className="node-header">
        <div className="node-title-container">
          <span className="node-category-label">{category}</span>
        </div>
        <button className="node-delete-btn" onClick={handleDelete} title="Delete Node">
          &times;
        </button>
      </div>

      {/* 4. Category Icon + Node Bold Title */}
      <div className="node-card-body-content">
        <div className={`node-icon-box ${categoryClass}`}>
          {icon}
        </div>
        <div className="node-card-titles">
          <span className="node-card-name-bold">{displayTitle}</span>
        </div>
      </div>

      {/* Node Custom Body Content */}
      <div className="node-body">
        {children}
      </div>

      {/* 5. Centered Top & Bottom handles */}
      {handles.map((handle, idx) => {
        // Map Position.Left / Position.Top to Position.Top, others to Position.Bottom
        const isTop = handle.position === Position.Left || handle.position === Position.Top;
        const targetPosition = isTop ? Position.Top : Position.Bottom;

        // Apply custom inline offset if system variables require it, otherwise center it
        let customStyle = { ...handle.style };
        if (isTop) {
          customStyle.left = '50%';
          customStyle.top = '-4px';
          customStyle.transform = 'translateX(-50%)';
        } else {
          customStyle.left = '50%';
          customStyle.bottom = '-4px';
          customStyle.transform = 'translateX(-50%)';
        }

        return (
          <div
            key={handle.id || idx}
            style={{
              position: 'absolute',
              width: '100%',
              height: '100%',
              top: 0,
              left: 0,
              pointerEvents: 'none',
            }}
          >
            <Handle
              type={handle.type}
              position={targetPosition}
              id={handle.id}
              className={status === 'success' ? 'connected-valid' : ''}
              style={{
                ...customStyle,
                pointerEvents: 'all',
              }}
            />
            {handle.label && (
              <span
                className="handle-label"
                style={{
                  position: 'absolute',
                  top: isTop ? '-20px' : 'auto',
                  bottom: isTop ? 'auto' : '-20px',
                  left: '50%',
                  transform: 'translateX(-50%)',
                  whiteSpace: 'nowrap',
                  fontSize: '0.65rem',
                  color: '#8b949e',
                  pointerEvents: 'none',
                }}
              >
                {handle.label}
              </span>
            )}
          </div>
        );
      })}
    </div>
  );
};

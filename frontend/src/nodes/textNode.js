// textNode.js

import React, { useState, useEffect, useRef } from 'react';
import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';
import { useStore } from '../store';

export const TextNode = ({ id, data }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);
  const textareaRef = useRef(null);

  const currText = data?.text ?? '{{input}}';
  const [dimensions, setDimensions] = useState({ width: 220, height: 100 });

  // 1. Variable Detection
  // Matches {{ validJsIdentifier }}
  const getVariables = (text) => {
    const regex = /\{\{\s*([a-zA-Z_$][a-zA-Z0-9_$]*)\s*\}\}/g;
    const vars = [];
    let match;
    while ((match = regex.exec(text)) !== null) {
      const varName = match[1];
      if (!vars.includes(varName)) {
        vars.push(varName);
      }
    }
    return vars;
  };

  const variables = getVariables(currText);
  const variablesJoined = variables.join(',');

  // Sync variables to store so the backend can access them if needed
  useEffect(() => {
    updateNodeField(id, 'variables', variables);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, variablesJoined, updateNodeField]);

  // Sync initial text value to store
  useEffect(() => {
    if (data?.text === undefined) {
      updateNodeField(id, 'text', currText);
    }
  }, [id, data, updateNodeField, currText]);

  // 2. Auto-resize logic
  const adjustSize = () => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Temporarily shrink to measure correctly
      textarea.style.height = '0px';
      textarea.style.width = '0px';

      const scrollHeight = textarea.scrollHeight;

      // Calculate width based on character length of longest line
      const lines = textarea.value.split('\n');
      const maxLineLength = Math.max(...lines.map((l) => l.length), 12);
      
      const targetWidth = Math.max(220, Math.min(500, maxLineLength * 8 + 32));
      const targetHeight = Math.max(50, scrollHeight + 12);

      setDimensions({
        width: targetWidth,
        height: targetHeight + 70, // Header height + padding
      });

      // Apply style back
      textarea.style.height = `${targetHeight}px`;
      textarea.style.width = '100%';
    }
  };

  useEffect(() => {
    adjustSize();
  }, [currText]);

  const handleTextChange = (e) => {
    updateNodeField(id, 'text', e.target.value);
  };

  // Build handle list
  const handles = [
    // Output handle on the right
    { type: 'source', position: Position.Right, id: `${id}-output` },
    // Variable target handles on the left
    ...variables.map((varName, idx) => ({
      type: 'target',
      position: Position.Left,
      id: `${id}-${varName}`,
      label: varName,
      style: {
        top: `${((idx + 1) * 100) / (variables.length + 1)}%`,
      },
    })),
  ];

  return (
    <BaseNode
      id={id}
      title="Text"
      type="text"
      handles={handles}
      style={{ width: dimensions.width, height: dimensions.height }}
    >
      <div className="node-field text-node-field">
        <label className="field-label">Text:</label>
        <textarea
          ref={textareaRef}
          className="field-textarea"
          value={currText}
          onChange={handleTextChange}
          rows={1}
        />
      </div>
    </BaseNode>
  );
}

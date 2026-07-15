// conditionalNode.js

import React, { useEffect } from 'react';
import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';
import { useStore } from '../store';

export const ConditionalNode = ({ id, data }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);
  const operator = data?.operator ?? 'Equals';
  const value = data?.value ?? '';

  useEffect(() => {
    if (data?.operator === undefined) updateNodeField(id, 'operator', operator);
    if (data?.value === undefined) updateNodeField(id, 'value', value);
  }, [id, data, updateNodeField, operator, value]);

  const handles = [
    { type: 'target', position: Position.Left, id: `${id}-input` },
    { type: 'source', position: Position.Right, id: `${id}-true`, label: 'true', style: { top: '35%' } },
    { type: 'source', position: Position.Right, id: `${id}-false`, label: 'false', style: { top: '65%' } },
  ];

  return (
    <BaseNode id={id} title="Conditional" type="conditional" handles={handles}>
      <div className="node-field">
        <label className="field-label">Op:</label>
        <select className="field-select" value={operator} onChange={(e) => updateNodeField(id, 'operator', e.target.value)}>
          <option value="Equals">Equals</option>
          <option value="Greater Than">Greater Than</option>
          <option value="Less Than">Less Than</option>
          <option value="Contains">Contains</option>
        </select>
      </div>
      <div className="node-field">
        <label className="field-label">Val:</label>
        <input 
          type="text" 
          className="field-input"
          value={value} 
          onChange={(e) => updateNodeField(id, 'value', e.target.value)} 
        />
      </div>
    </BaseNode>
  );
}

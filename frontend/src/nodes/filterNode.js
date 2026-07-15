// filterNode.js

import React, { useEffect } from 'react';
import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';
import { useStore } from '../store';

export const FilterNode = ({ id, data }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);
  const condition = data?.condition ?? 'value > 10';

  useEffect(() => {
    if (data?.condition === undefined) {
      updateNodeField(id, 'condition', condition);
    }
  }, [id, data, updateNodeField, condition]);

  const handles = [
    { type: 'target', position: Position.Left, id: `${id}-input` },
    { type: 'source', position: Position.Right, id: `${id}-true`, label: 'true', style: { top: '35%' } },
    { type: 'source', position: Position.Right, id: `${id}-false`, label: 'false', style: { top: '65%' } },
  ];

  return (
    <BaseNode id={id} title="Filter" type="filter" handles={handles}>
      <div className="node-field">
        <label className="field-label">Condition:</label>
        <input 
          type="text" 
          className="field-input"
          value={condition} 
          onChange={(e) => updateNodeField(id, 'condition', e.target.value)} 
        />
      </div>
    </BaseNode>
  );
}

// mathNode.js

import React, { useEffect } from 'react';
import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';
import { useStore } from '../store';

export const MathNode = ({ id, data }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);
  const operation = data?.operation ?? 'Add';

  useEffect(() => {
    if (data?.operation === undefined) {
      updateNodeField(id, 'operation', operation);
    }
  }, [id, data, updateNodeField, operation]);

  const handles = [
    { type: 'target', position: Position.Left, id: `${id}-a`, label: 'a', style: { top: '35%' } },
    { type: 'target', position: Position.Left, id: `${id}-b`, label: 'b', style: { top: '65%' } },
    { type: 'source', position: Position.Right, id: `${id}-result`, label: 'result' },
  ];

  return (
    <BaseNode id={id} title="Math" type="math" handles={handles}>
      <div className="node-field">
        <label className="field-label">Op:</label>
        <select className="field-select" value={operation} onChange={(e) => updateNodeField(id, 'operation', e.target.value)}>
          <option value="Add">Add</option>
          <option value="Subtract">Subtract</option>
          <option value="Multiply">Multiply</option>
          <option value="Divide">Divide</option>
        </select>
      </div>
    </BaseNode>
  );
}

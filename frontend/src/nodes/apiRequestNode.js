// apiRequestNode.js

import React, { useEffect } from 'react';
import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';
import { useStore } from '../store';

export const APIRequestNode = ({ id, data }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);
  const method = data?.method ?? 'GET';
  const url = data?.url ?? 'https://api.example.com';

  useEffect(() => {
    if (data?.method === undefined) updateNodeField(id, 'method', method);
    if (data?.url === undefined) updateNodeField(id, 'url', url);
  }, [id, data, updateNodeField, method, url]);

  const handles = [
    { type: 'target', position: Position.Left, id: `${id}-payload`, label: 'payload' },
    { type: 'source', position: Position.Right, id: `${id}-response`, label: 'resp', style: { top: '35%' } },
    { type: 'source', position: Position.Right, id: `${id}-error`, label: 'err', style: { top: '65%' } },
  ];

  return (
    <BaseNode id={id} title="API Request" type="api" handles={handles}>
      <div className="node-field">
        <label className="field-label">Method:</label>
        <select className="field-select" value={method} onChange={(e) => updateNodeField(id, 'method', e.target.value)}>
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="PUT">PUT</option>
          <option value="DELETE">DELETE</option>
        </select>
      </div>
      <div className="node-field">
        <label className="field-label">URL:</label>
        <input 
          type="text" 
          className="field-input"
          value={url} 
          onChange={(e) => updateNodeField(id, 'url', e.target.value)} 
        />
      </div>
    </BaseNode>
  );
}

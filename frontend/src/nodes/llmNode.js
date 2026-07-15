// llmNode.js

import React from 'react';
import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';

export const LLMNode = ({ id, data }) => {
  const handles = [
    { type: 'target', position: Position.Left, id: `${id}-system`, style: { top: '33%' } },
    { type: 'target', position: Position.Left, id: `${id}-prompt`, style: { top: '67%' } },
    { type: 'source', position: Position.Right, id: `${id}-response` },
  ];

  return (
    <BaseNode id={id} title="LLM" type="llm" handles={handles}>
      <div className="node-description">
        This is a LLM. Connect system instruction and user prompt to generate a response.
      </div>
    </BaseNode>
  );
}

// timerNode.js

import React, { useEffect } from 'react';
import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';
import { useStore } from '../store';

export const TimerNode = ({ id, data }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);
  const duration = data?.duration ?? '5';

  useEffect(() => {
    if (data?.duration === undefined) {
      updateNodeField(id, 'duration', duration);
    }
  }, [id, data, updateNodeField, duration]);

  const handles = [
    { type: 'target', position: Position.Left, id: `${id}-start` },
    { type: 'source', position: Position.Right, id: `${id}-ontimer` },
  ];

  return (
    <BaseNode id={id} title="Timer" type="timer" handles={handles}>
      <div className="node-field">
        <label className="field-label">Secs:</label>
        <input 
          type="number" 
          className="field-input"
          min="1"
          value={duration} 
          onChange={(e) => updateNodeField(id, 'duration', e.target.value)} 
        />
      </div>
    </BaseNode>
  );
}

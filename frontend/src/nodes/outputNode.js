// outputNode.js

import React, { useEffect } from 'react';
import { Position } from 'reactflow';
import { BaseNode } from './BaseNode';
import { useStore } from '../store';

export const OutputNode = ({ id, data }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);

  const currName = data?.outputName ?? id.replace('customOutput-', 'output_');
  const outputType = data?.outputType ?? 'Text';

  useEffect(() => {
    if (data?.outputName === undefined) {
      updateNodeField(id, 'outputName', currName);
    }
    if (data?.outputType === undefined) {
      updateNodeField(id, 'outputType', outputType);
    }
  }, [id, data, updateNodeField, currName, outputType]);

  const handleNameChange = (e) => {
    updateNodeField(id, 'outputName', e.target.value);
  };

  const handleTypeChange = (e) => {
    updateNodeField(id, 'outputType', e.target.value);
  };

  const handles = [
    { type: 'target', position: Position.Left, id: `${id}-value` }
  ];

  return (
    <BaseNode id={id} title="Output" type="output" handles={handles}>
      <div className="node-field">
        <label className="field-label">Name:</label>
        <input 
          type="text" 
          className="field-input"
          value={currName} 
          onChange={handleNameChange} 
        />
      </div>
      <div className="node-field">
        <label className="field-label">Type:</label>
        <select className="field-select" value={outputType} onChange={handleTypeChange}>
          <option value="Text">Text</option>
          <option value="File">Image</option>
        </select>
      </div>
    </BaseNode>
  );
}

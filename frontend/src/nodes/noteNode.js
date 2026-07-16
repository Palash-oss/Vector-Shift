// noteNode.js

import React, { useEffect, useRef } from 'react';
import { BaseNode } from './BaseNode';
import { useStore } from '../store';

export const NoteNode = ({ id, data }) => {
  const updateNodeField = useStore((state) => state.updateNodeField);
  const textareaRef = useRef(null);

  const currText = data?.text ?? 'Type your note/sticky comment here...';

  // Sync initial text value to store
  useEffect(() => {
    if (data?.text === undefined) {
      updateNodeField(id, 'text', currText);
    }
  }, [id, data, updateNodeField, currText]);

  const handleTextChange = (e) => {
    updateNodeField(id, 'text', e.target.value);
  };

  return (
    <BaseNode id={id} title="Sticky Note" type="note" handles={[]}>
      <div className="node-field">
        <label className="field-label">Content:</label>
        <textarea
          ref={textareaRef}
          className="field-textarea"
          value={data?.text ?? currText}
          onChange={handleTextChange}
          placeholder="Type something..."
          style={{ height: '80px', resize: 'vertical' }}
        />
      </div>
    </BaseNode>
  );
};

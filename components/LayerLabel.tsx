'use client';

import React from 'react';

interface LayerLabelProps {
  questionIndex: number;
  totalQuestions: number;
}

export default function LayerLabel({ questionIndex, totalQuestions }: LayerLabelProps) {
  // Determine layer based on question index
  // Layer 1: First ~33% of questions (Product clarity)
  // Layer 2: Middle ~33% (Standards)
  // Layer 3: Last ~33% (Specs)
  
  const layerThreshold = Math.ceil(totalQuestions / 3);
  
  let layer: number;
  let layerName: string;
  
  if (questionIndex < layerThreshold) {
    layer = 1;
    layerName = 'Product Clarity';
  } else if (questionIndex < layerThreshold * 2) {
    layer = 2;
    layerName = 'Standards';
  } else {
    layer = 3;
    layerName = 'Specs';
  }
  
  return (
    <div className="mb-3 text-sm">
      <span className="inline-flex items-center px-3 py-1 rounded-full bg-purple-100 text-purple-700 font-semibold">
        Layer {layer}: {layerName}
      </span>
    </div>
  );
}


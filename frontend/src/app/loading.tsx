import React from 'react';

export default function Loading() {
  return (
    <div className="fixed top-0 left-0 right-0 h-[3px] w-full overflow-hidden bg-base-200 z-[99999]">
      <div className="h-full bg-primary animate-loading-bar w-full origin-left" />
    </div>
  );
}

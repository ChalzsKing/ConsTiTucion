
import React from 'react';

const Spinner = ({ size = 'w-8 h-8' }: { size?: string }) => {
  return (
    <div
      className={`${size} animate-spin rounded-full border-4 border-slate-500 border-t-sky-400`}
      role="status"
    >
      <span className="sr-only">Cargando...</span>
    </div>
  );
};

export default Spinner;

import React from 'react';
import { Course } from '../types';
import { BookOpenIcon, TrashIcon, CheckCircleIcon } from './icons';

interface CourseCardProps {
  course: Course;
  onView: (id: string) => void;
  onDelete: (id: string) => void;
  onToggleCompletion: (id: string) => void;
}

const CourseCard: React.FC<CourseCardProps> = ({ course, onView, onDelete, onToggleCompletion }) => {
  const moduleCount = course.modules.length;
  const sectionCount = course.modules.reduce((acc, mod) => acc + mod.sections.length, 0);
  
  const handleDelete = (e: React.MouseEvent) => {
      e.stopPropagation();
      if (window.confirm(`¿Estás seguro de que quieres eliminar el curso "${course.title}"?`)) {
          onDelete(course.id);
      }
  };
  
  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleCompletion(course.id);
  };

  return (
    <div 
        className={`bg-white dark:bg-slate-800 rounded-lg p-6 flex flex-col justify-between shadow-lg hover:shadow-sky-500/10 dark:hover:shadow-sky-500/20 border border-slate-200 dark:border-slate-700 hover:border-sky-400 dark:hover:border-sky-500 transition-all duration-300 transform hover:-translate-y-1 cursor-pointer ${
            course.isCompleted ? 'grayscale opacity-70' : ''
        }`}
        onClick={() => onView(course.id)}
    >
      <div>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-2">{course.title}</h3>
        <p className="text-slate-500 dark:text-slate-400 text-sm mb-4 line-clamp-2">{course.description}</p>
        <div className="text-xs text-slate-400 dark:text-slate-500 mb-4">
          Creado: {new Date(course.createdAt).toLocaleDateString('es-ES')}
        </div>
      </div>
      <div className="mt-4 pt-4 border-t border-slate-200 dark:border-slate-700 flex justify-between items-center transition-colors duration-300">
        <div className="flex gap-4 text-sm text-slate-600 dark:text-slate-300">
            <span className="flex items-center gap-1.5">
                <BookOpenIcon className="w-4 h-4 text-sky-500 dark:text-sky-400"/> {moduleCount} Módulos
            </span>
            <span className="flex items-center gap-1.5">
                <span className="w-4 h-4 text-sky-500 dark:text-sky-400 font-mono font-bold text-center">/</span> {sectionCount} Lecciones
            </span>
        </div>
        <div className="flex items-center gap-2">
            <button
              onClick={handleToggle}
              className={`p-2 rounded-full transition-colors duration-200 ${
                  course.isCompleted 
                  ? 'text-green-500 dark:text-green-400 hover:bg-green-500/10' 
                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-500/10'
              }`}
              aria-label={course.isCompleted ? 'Marcar como no completado' : 'Marcar como completado'}
              title={course.isCompleted ? 'Marcar como no completado' : 'Marcar como completado'}
            >
              <CheckCircleIcon className={`w-6 h-6 ${course.isCompleted ? 'fill-green-500/10' : ''}`} />
            </button>
            <button
              onClick={handleDelete}
              className="p-2 text-slate-500 dark:text-slate-400 hover:text-red-500 dark:hover:text-red-400 hover:bg-red-500/10 rounded-full transition-colors duration-200"
              aria-label="Eliminar curso"
            >
              <TrashIcon className="w-5 h-5" />
            </button>
        </div>
      </div>
    </div>
  );
};

export default CourseCard;
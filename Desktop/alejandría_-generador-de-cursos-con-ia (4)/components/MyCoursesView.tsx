import React, { useState, useEffect } from 'react';
import { Course } from '../types';
import CourseCard from './CourseCard';
import { PlusIcon, BookOpenIcon, SparklesIcon } from './icons';
import { generateCourseSuggestions } from '../services/geminiService';
import Spinner from './Spinner';

interface MyCoursesViewProps {
  courses: Course[];
  onViewCourse: (id: string) => void;
  onDeleteCourse: (id: string) => void;
  onGoToCreate: () => void;
  onCreateFromSuggestion: (topic: string) => void;
  onToggleCompletion: (id: string) => void;
}

const SuggestionCard: React.FC<{ topic: string; onSelect: (topic: string) => void; }> = ({ topic, onSelect }) => (
    <div className="bg-white dark:bg-slate-800/50 p-4 rounded-lg border border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4 transition-colors duration-300">
        <p className="font-medium text-slate-700 dark:text-slate-300">{topic}</p>
        <button 
            onClick={() => onSelect(topic)}
            className="flex-shrink-0 inline-flex items-center gap-2 px-3 py-1.5 border border-transparent text-xs font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-100 dark:focus:ring-offset-slate-900 focus:ring-sky-500"
        >
            <PlusIcon className="w-4 h-4"/>
            Crear curso
        </button>
    </div>
);


const MyCoursesView: React.FC<MyCoursesViewProps> = ({ courses, onViewCourse, onDeleteCourse, onGoToCreate, onCreateFromSuggestion, onToggleCompletion }) => {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(false);
  
  useEffect(() => {
    if (courses.length > 0) {
      setLoadingSuggestions(true);
      const courseTitles = courses.map(c => c.title);
      generateCourseSuggestions(courseTitles)
        .then(setSuggestions)
        .catch(console.error)
        .finally(() => setLoadingSuggestions(false));
    } else {
      setSuggestions([]);
    }
  }, [courses]);

  return (
    <div className="flex-1 p-6 md:p-10 bg-slate-50 dark:bg-slate-900 overflow-y-auto transition-colors duration-300">
      <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-8">Mis Cursos</h2>
      {courses.length > 0 ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard
                key={course.id}
                course={course}
                onView={onViewCourse}
                onDelete={onDeleteCourse}
                onToggleCompletion={onToggleCompletion}
              />
            ))}
          </div>
          
          {(loadingSuggestions || suggestions.length > 0) && (
            <div className="mt-16">
              <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-6 flex items-center gap-3">
                <SparklesIcon className="w-7 h-7 text-sky-500 dark:text-sky-400" />
                Sugerencias para ti
              </h3>
              {loadingSuggestions ? (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  {[...Array(4)].map((_, i) => (
                     <div key={i} className="bg-slate-200 dark:bg-slate-800/50 p-4 rounded-lg border border-slate-300 dark:border-slate-700 h-16 animate-pulse"></div>
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                    {suggestions.map((topic) => (
                        <SuggestionCard key={topic} topic={topic} onSelect={onCreateFromSuggestion} />
                    ))}
                </div>
              )}
            </div>
          )}

        </>
      ) : (
        <div className="text-center py-20 px-6 border-2 border-dashed border-slate-300 dark:border-slate-700 rounded-lg transition-colors duration-300">
          <BookOpenIcon className="mx-auto h-12 w-12 text-slate-400 dark:text-slate-500" />
          <h3 className="mt-2 text-xl font-semibold text-slate-800 dark:text-white">No tienes cursos todavía</h3>
          <p className="mt-1 text-slate-500 dark:text-slate-400">¡Empieza creando tu primer curso!</p>
          <div className="mt-6">
            <button
              type="button"
              onClick={onGoToCreate}
              className="inline-flex items-center gap-2 px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-50 dark:focus:ring-offset-slate-900 focus:ring-sky-500"
            >
              <PlusIcon className="w-5 h-5" />
              Crear Nuevo Curso
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyCoursesView;
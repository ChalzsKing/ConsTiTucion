
import React, { useState } from 'react';
import { generateCourse, isGeminiAvailable } from '../services/geminiService';
import { Course } from '../types';
import Spinner from './Spinner';
import { SparklesIcon } from './icons';

interface NewCourseViewProps {
  onCourseCreated: (course: Course) => void;
  initialTopic?: string;
}

const geminiEnabled = isGeminiAvailable();

const NewCourseView: React.FC<NewCourseViewProps> = ({ onCourseCreated, initialTopic = '' }) => {
  const [topic, setTopic] = useState(initialTopic);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!geminiEnabled || !topic.trim()) {
      setError('Por favor, introduce un tema para el curso.');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const courseData = await generateCourse(topic);
      const newCourse: Course = {
        ...courseData,
        id: new Date().toISOString(),
        createdAt: new Date().toISOString(),
        isCompleted: false,
      };
      onCourseCreated(newCourse);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Ocurrió un error inesperado.');
    } finally {
      setLoading(false);
    }
  };

  const suggestions = [
    "Historia de la Computación",
    "Introducción a la Astrofísica",
    "Fundamentos de la Cocina Francesa",
    "Principios de Inversión y Finanzas Personales"
  ];

  return (
    <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12 bg-slate-50 dark:bg-slate-900 overflow-y-auto transition-colors duration-300">
      <div className="w-full max-w-2xl text-center">
        <div className="inline-block p-4 bg-sky-500/10 rounded-full mb-6">
            <SparklesIcon className="w-12 h-12 text-sky-500 dark:text-sky-400" />
        </div>
        <h2 className="text-4xl font-bold text-slate-900 dark:text-white mb-3">Crea un Nuevo Curso</h2>
        <p className="text-lg text-slate-500 dark:text-slate-400 mb-8">
          Simplemente escribe un tema y nuestra IA diseñará un curso completo para ti.
        </p>

        <form onSubmit={handleSubmit} className="space-y-6">
          {!geminiEnabled && (
            <div className="bg-amber-100 dark:bg-amber-900/30 border-l-4 border-amber-500 text-amber-800 dark:text-amber-200 p-4 rounded-r-lg text-left text-sm" role="alert">
              <p className="font-bold">Función de IA Deshabilitada</p>
              <p>La generación de cursos requiere una clave de API de Gemini para funcionar.</p>
            </div>
          )}

          <input
            type="text"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
            placeholder="Ej: Física Cuántica para principiantes"
            className="w-full px-5 py-4 bg-white dark:bg-slate-800 border-2 border-slate-300 dark:border-slate-700 rounded-lg text-lg text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-sky-500 transition-all duration-200 disabled:opacity-50 dark:disabled:bg-slate-800/50"
            disabled={loading || !geminiEnabled}
          />

          <div className="text-left text-sm text-slate-500 dark:text-slate-400">
            <p className="font-medium mb-2">O prueba una sugerencia:</p>
            <div className="flex flex-wrap gap-2">
              {suggestions.map(s => (
                <button 
                  key={s} 
                  type="button" 
                  onClick={() => setTopic(s)}
                  className="px-3 py-1 bg-slate-200 dark:bg-slate-700 rounded-full text-slate-700 dark:text-slate-300 hover:bg-slate-300 dark:hover:bg-slate-600 hover:text-slate-900 dark:hover:text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                   disabled={!geminiEnabled}
                >
                  {s}
                </button>
              ))}
            </div>
          </div>

          <button
            type="submit"
            className="w-full flex items-center justify-center gap-3 px-6 py-4 bg-sky-600 text-white font-bold text-lg rounded-lg hover:bg-sky-500 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed transition-all duration-300 transform hover:scale-105"
            disabled={loading || !geminiEnabled}
          >
            {loading ? (
              <>
                <Spinner size="w-6 h-6" />
                <span>Generando curso...</span>
              </>
            ) : (
              <>
                <SparklesIcon className="w-6 h-6" />
                <span>Generar Curso</span>
              </>
            )}
          </button>
        </form>

        {error && <p className="mt-6 text-red-500 dark:text-red-400 bg-red-500/10 px-4 py-2 rounded-md">{error}</p>}
      </div>
    </div>
  );
};

export default NewCourseView;

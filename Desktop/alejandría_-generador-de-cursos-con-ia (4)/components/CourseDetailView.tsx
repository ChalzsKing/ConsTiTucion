



import React, { useState, useMemo, useEffect } from 'react';
import { Course } from '../types';
import { ArrowLeftIcon, ArrowRightIcon, XMarkIcon, ChevronDownIcon, CheckCircleIcon, PaintBrushIcon, SpeakerWaveIcon, PlayIcon, PauseIcon, StopIcon, ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from './icons';
import { useCustomization, ACCENT_COLORS, FONT_FAMILIES, FONT_SIZES, HIGHLIGHT_COLORS, AccentColor, FontSize, FontFamily, HighlightColor } from '../hooks/useCustomization';
import { useSpeechSynthesis } from '../hooks/useSpeechSynthesis';
import Spinner from './Spinner';

interface CourseDetailViewProps {
  course: Course;
  onClose: () => void;
  onToggleCompletion: (id: string) => void;
}

interface Slide {
  moduleTitle: string;
  sectionTitle: string;
  content: string;
}

const stripMarkdown = (markdown: string): string => {
    if (!markdown) return '';
    return markdown
        .replace(/^(#{1,6})\s/gm, '')       // Headers
        .replace(/\+\+(.*?)\+\+/g, '$1')  // Highlight pills
        .replace(/\*\*(.*?)\*\*/g, '$1')  // Bold
        .replace(/\*(.*?)\*/g, '$1')      // Italic
        .replace(/`([^`]+)`/g, '$1')      // Inline code
        .replace(/^- \s*/gm, '')           // Unordered list items
        .replace(/^\d+\.\s*/gm, '')         // Ordered list items
        .replace(/\n/g, ' ')              // Replace newlines with spaces for smoother speech
        .trim();
};

const CustomizationPanel: React.FC = () => {
    const { 
        accentColor, setAccentColor,
        fontSize, setFontSize,
        fontFamily, setFontFamily,
        highlightColor, setHighlightColor,
    } = useCustomization();

    const colorClasses: Record<AccentColor, string> = {
        sky: 'bg-sky-500',
        rose: 'bg-rose-500',
        emerald: 'bg-emerald-500',
        amber: 'bg-amber-500',
        violet: 'bg-violet-500',
        black: 'bg-slate-900 border-2 border-slate-300 dark:border-slate-600',
    };

    const highlightColorPickerClasses: Record<HighlightColor, string> = {
        yellow: 'bg-yellow-400',
        pink: 'bg-pink-400',
        green: 'bg-green-400',
        blue: 'bg-blue-400',
        gray: 'bg-slate-400',
    };

    return (
        <div className="absolute top-full right-0 mt-2 w-64 bg-white dark:bg-slate-800 rounded-lg shadow-xl border border-slate-200 dark:border-slate-700 p-4 z-10">
            <h4 className="font-semibold text-slate-800 dark:text-slate-200 mb-4">Personalizar Vista</h4>
            
            <div className="mb-4">
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Color de Acento</label>
                <div className="flex gap-2 flex-wrap">
                    {ACCENT_COLORS.map(color => (
                        <button
                            key={color}
                            onClick={() => setAccentColor(color)}
                            className={`w-8 h-8 rounded-full ${colorClasses[color]} ${accentColor === color ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-800 ring-current' : ''}`}
                            aria-label={`Seleccionar color ${color}`}
                        />
                    ))}
                </div>
            </div>

            <div className="mb-4">
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Color de Resaltado</label>
                <div className="flex gap-2 flex-wrap">
                    {HIGHLIGHT_COLORS.map(color => (
                        <button
                            key={color}
                            onClick={() => setHighlightColor(color)}
                            className={`w-8 h-8 rounded-full ${highlightColorPickerClasses[color]} ${highlightColor === color ? 'ring-2 ring-offset-2 ring-offset-white dark:ring-offset-slate-800 ring-current' : ''}`}
                            aria-label={`Seleccionar color de resaltado ${color}`}
                        />
                    ))}
                </div>
            </div>


            <div className="mb-4">
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Tamaño de Fuente</label>
                <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-900 rounded-md p-1">
                    {FONT_SIZES.map(size => (
                        <button
                            key={size}
                            onClick={() => setFontSize(size)}
                            className={`px-3 py-1 text-sm rounded-md transition-colors ${fontSize === size ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-300 shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50'}`}
                        >
                            {size.charAt(0).toUpperCase() + size.slice(1)}
                        </button>
                    ))}
                </div>
            </div>

            <div>
                <label className="block text-sm font-medium text-slate-600 dark:text-slate-400 mb-2">Tipografía</label>
                <div className="flex items-center justify-between bg-slate-100 dark:bg-slate-900 rounded-md p-1">
                    {FONT_FAMILIES.map(family => (
                        <button
                            key={family}
                            onClick={() => setFontFamily(family)}
                            className={`w-1/2 py-1 text-sm rounded-md transition-colors ${fontFamily === family ? 'bg-white dark:bg-slate-700 text-sky-600 dark:text-sky-300 shadow-sm' : 'text-slate-600 dark:text-slate-300 hover:bg-white/50 dark:hover:bg-slate-800/50'} ${family === 'sans' ? 'font-sans' : 'font-serif'}`}
                        >
                            {family === 'sans' ? 'Sans-Serif' : 'Serif'}
                        </button>
                    ))}
                </div>
            </div>
        </div>
    );
};

const MarkdownRenderer: React.FC<{ content: string }> = ({ content }) => {
    const { accentColor, highlightColor } = useCustomization();

    const getAccentClass = () => {
        switch (accentColor) {
            case 'rose': return 'text-rose-600 dark:text-rose-400';
            case 'emerald': return 'text-emerald-600 dark:text-emerald-400';
            case 'amber': return 'text-amber-600 dark:text-amber-400';
            case 'violet': return 'text-violet-600 dark:text-violet-400';
            case 'black': return 'text-slate-900 dark:text-slate-100';
            case 'sky':
            default:
                return 'text-sky-600 dark:text-sky-400';
        }
    };

    const getHighlightClasses = () => {
        switch (highlightColor) {
            case 'pink': return 'bg-pink-200/60 dark:bg-pink-900/40 text-pink-900 dark:text-pink-200';
            case 'green': return 'bg-green-200/60 dark:bg-green-900/40 text-green-900 dark:text-green-200';
            case 'blue': return 'bg-blue-200/60 dark:bg-blue-900/40 text-blue-900 dark:text-blue-200';
            case 'gray': return 'bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-slate-200';
            case 'yellow':
            default:
                return 'bg-yellow-200/60 dark:bg-yellow-800/40 text-yellow-900 dark:text-yellow-200';
        }
    };

    const accentClasses = getAccentClass();
    const highlightClasses = getHighlightClasses();

    const html = useMemo(() => {
        if (!content) return '';

        const lines = content.split('\n');
        let htmlOutput = '';
        let inUl = false;
        let inOl = false;
        let paragraphBuffer: string[] = [];

        const flushParagraph = () => {
            if (paragraphBuffer.length > 0) {
                htmlOutput += `<p class="my-4 leading-relaxed">${paragraphBuffer.join(' ')}</p>`;
                paragraphBuffer = [];
            }
        };

        const closeLists = () => {
            if (inUl) { htmlOutput += '</ul>'; inUl = false; }
            if (inOl) { htmlOutput += '</ol>'; inOl = false; }
        };
        
        const processInlineMarkdown = (text: string) => {
            return text
                .replace(/\+\+(.*?)\+\+/g, `<span class="inline-block ${highlightClasses} px-2 py-0.5 rounded-md mx-1">$1</span>`)
                .replace(/\*\*(.*?)\*\*/g, `<strong class="font-semibold ${accentClasses}">$1</strong>`)
                .replace(/\*(.*?)\*/g, '<em>$1</em>')
                .replace(/`([^`]+)`/g, `<code class="bg-slate-200 dark:bg-slate-900 px-2 py-1 rounded-md text-sm font-mono ${accentClasses}">$1</code>`);
        };

        for (const line of lines) {
            const trimmedLine = line.trim();

            if (trimmedLine === '') {
                flushParagraph();
                closeLists();
                continue;
            }
            
            const headingMatch = trimmedLine.match(/^(#{1,6})\s(.*)/);
            if (headingMatch) {
                flushParagraph();
                closeLists();
                const level = headingMatch[1].length;
                const text = processInlineMarkdown(headingMatch[2]);
                const styles = [
                    'text-3xl mt-8 mb-4', // h1
                    'text-2xl mt-6 mb-3', // h2
                    'text-xl mt-5 mb-2', // h3
                    'text-lg mt-4 mb-2', // h4
                    'font-semibold mt-4 mb-2', // h5
                    'font-medium mt-4 mb-2' // h6
                ];
                htmlOutput += `<h${level} class="${styles[level - 1]} font-bold text-slate-900 dark:text-white">${text}</h${level}>`;
                continue;
            }
            
            if (trimmedLine.startsWith('- ')) {
                flushParagraph();
                if (inOl) closeLists();
                if (!inUl) { htmlOutput += '<ul class="list-disc pl-6 space-y-2 my-4">'; inUl = true; }
                htmlOutput += `<li>${processInlineMarkdown(line.substring(2))}</li>`;
                continue;
            }
            
            const olMatch = trimmedLine.match(/^(\d+)\.\s(.*)/);
            if (olMatch) {
                flushParagraph();
                if (inUl) closeLists();
                if (!inOl) { htmlOutput += '<ol class="list-decimal pl-6 space-y-2 my-4">'; inOl = true; }
                htmlOutput += `<li>${processInlineMarkdown(olMatch[2])}</li>`;
                continue;
            }

            closeLists();
            paragraphBuffer.push(processInlineMarkdown(line));
        }

        flushParagraph();
        closeLists();

        return htmlOutput;
    }, [content, accentClasses, highlightClasses]);

    return <div className="text-slate-600 dark:text-slate-300" dangerouslySetInnerHTML={{ __html: html }} />;
};


const CourseDetailView: React.FC<CourseDetailViewProps> = ({ course, onClose, onToggleCompletion }) => {
  const [currentSlideIndex, setCurrentSlideIndex] = useState(0);
  const [openModules, setOpenModules] = useState<Record<string, boolean>>(() => {
    const initialState: Record<string, boolean> = {};
    course.modules.forEach((_, index) => {
      initialState[index] = true; // Open all modules by default
    });
    return initialState;
  });
  const [isCustomizePanelOpen, setIsCustomizePanelOpen] = useState(false);
  const { fontSize, fontFamily } = useCustomization();
  const { speak, pause, resume, cancel, isLoading, isSpeaking, isPaused, error, isAvailable } = useSpeechSynthesis();
  const [isTocCollapsed, setIsTocCollapsed] = useState(false);


  const slides = useMemo<Slide[]>(() => {
    return course.modules.flatMap(module =>
      module.sections.map(section => ({
        moduleTitle: module.title,
        sectionTitle: section.title,
        content: section.content,
      }))
    );
  }, [course]);
  
  const currentSlide = slides[currentSlideIndex];
  
  const plainTextContent = useMemo(() => stripMarkdown(currentSlide?.content || ''), [currentSlide]);

  useEffect(() => {
    // Detener la locución si la diapositiva cambia
    cancel();
  }, [currentSlideIndex, cancel]);

  const goToSlide = (index: number) => {
    if (index >= 0 && index < slides.length) {
      setCurrentSlideIndex(index);
    }
  };
  
  const getSectionGlobalIndex = (moduleIndex: number, sectionIndex: number) => {
    let globalIndex = 0;
    for (let i = 0; i < moduleIndex; i++) {
        globalIndex += course.modules[i].sections.length;
    }
    return globalIndex + sectionIndex;
  };
  
  const toggleModule = (moduleIndex: number) => {
      setOpenModules(prev => ({ ...prev, [moduleIndex]: !prev[moduleIndex] }));
  };

  const handlePlay = () => speak(plainTextContent);

  const fontSizeClasses: Record<FontSize, string> = {
    sm: 'text-sm',
    base: 'text-base',
    lg: 'text-lg',
    xl: 'text-xl',
  };

  const containerClasses = [
    "flex-1", "bg-white", "dark:bg-slate-800/50", "rounded-lg", "p-6", "md:p-8", "my-4", "border",
    "border-slate-200", "dark:border-slate-700", "overflow-y-auto", "transition-colors", "duration-300",
    fontFamily === 'serif' ? 'font-serif' : 'font-sans',
    fontSizeClasses[fontSize]
  ].join(' ');

  return (
    <div className="flex-1 flex bg-slate-50 dark:bg-slate-900 overflow-hidden relative transition-colors duration-300">
      {/* Table of Contents */}
      <aside className={`flex-shrink-0 bg-white/80 dark:bg-slate-950/50 backdrop-blur-sm border-r border-slate-200 dark:border-slate-800 flex flex-col overflow-y-auto transition-all duration-300 ${isTocCollapsed ? 'w-0 opacity-0' : 'w-80 p-4'}`}>
        <h3 className="text-xl font-bold text-slate-900 dark:text-white mb-4 px-2">{course.title}</h3>
        <nav className="flex-1">
          <ul>
            {course.modules.map((module, moduleIndex) => (
              <li key={moduleIndex} className="mb-2">
                <button onClick={() => toggleModule(moduleIndex)} className="w-full flex justify-between items-center px-2 py-2 text-left font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-800 rounded-md">
                   <span>{module.title}</span>
                   <ChevronDownIcon className={`w-5 h-5 transition-transform ${openModules[moduleIndex] ? 'rotate-180' : ''}`} />
                </button>
                {openModules[moduleIndex] && (
                  <ul className="mt-1 pl-4 border-l border-slate-300 dark:border-slate-700">
                    {module.sections.map((section, sectionIndex) => {
                        const globalIndex = getSectionGlobalIndex(moduleIndex, sectionIndex);
                        return (
                          <li key={sectionIndex}>
                            <button
                              onClick={() => goToSlide(globalIndex)}
                              className={`w-full text-left px-2 py-1.5 text-sm rounded-md transition-colors ${
                                globalIndex === currentSlideIndex
                                  ? 'bg-sky-500/20 text-sky-600 dark:text-sky-300 font-semibold'
                                  : 'text-slate-500 dark:text-slate-400 hover:bg-slate-200/50 dark:hover:bg-slate-800/50 hover:text-slate-800 dark:hover:text-slate-200'
                              }`}
                            >
                              {section.title}
                            </button>
                          </li>
                        );
                    })}
                  </ul>
                )}
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Slide Content */}
      <div className="flex-1 flex flex-col relative">
        <button
            onClick={() => setIsTocCollapsed(p => !p)}
            className="absolute top-1/2 -translate-y-1/2 left-0 -translate-x-1/2 z-10 bg-white dark:bg-slate-800 p-1.5 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            aria-label={isTocCollapsed ? "Mostrar índice" : "Ocultar índice"}
          >
            {isTocCollapsed ? <ChevronDoubleRightIcon className="w-5 h-5" /> : <ChevronDoubleLeftIcon className="w-5 h-5" />}
        </button>

        <main className="flex-1 flex flex-col p-6 md:p-10 overflow-y-auto">
            <div className="flex justify-between items-start mb-4 gap-4">
                <div className='flex-1'>
                  <p className="text-sm font-semibold text-sky-500 dark:text-sky-400">{currentSlide.moduleTitle}</p>
                  <h1 className="text-3xl md:text-4xl font-bold text-slate-900 dark:text-white mt-1">{currentSlide.sectionTitle}</h1>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                    <button
                        onClick={() => onToggleCompletion(course.id)}
                        className={`flex items-center gap-2 px-3 py-2 rounded-full text-sm font-semibold transition-colors ${
                            course.isCompleted
                            ? 'bg-green-100 text-green-700 hover:bg-green-200 dark:bg-green-900/50 dark:text-green-300 dark:hover:bg-green-900'
                            : 'bg-slate-200 text-slate-700 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-200 dark:hover:bg-slate-600'
                        }`}
                        aria-label={course.isCompleted ? 'Marcar como no completado' : 'Marcar como completado'}
                    >
                        <CheckCircleIcon className="w-5 h-5" />
                        <span>{course.isCompleted ? 'Completado' : 'Marcar como completado'}</span>
                    </button>
                    <div className="relative">
                        <button
                            onClick={() => setIsCustomizePanelOpen(prev => !prev)}
                            className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                            aria-label="Personalizar vista"
                        >
                            <PaintBrushIcon className="w-6 h-6" />
                        </button>
                        {isCustomizePanelOpen && <CustomizationPanel />}
                    </div>
                    <button
                      onClick={onClose}
                      className="p-2 text-slate-500 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-200 dark:hover:bg-slate-700 rounded-full transition-colors"
                      aria-label="Cerrar vista de curso"
                    >
                      <XMarkIcon className="w-7 h-7" />
                    </button>
                </div>
            </div>

            <div className={containerClasses}>
                <MarkdownRenderer content={currentSlide.content} />
            </div>

            {/* Navigation Controls */}
            <div className="mt-auto pt-4 text-center">
              <div className="flex items-center justify-between">
                  <button
                      onClick={() => goToSlide(currentSlideIndex - 1)}
                      disabled={currentSlideIndex === 0}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                  >
                      <ArrowLeftIcon className="w-5 h-5" />
                      Anterior
                  </button>
                  
                  <div className="flex flex-col items-center">
                      <div className="flex items-center gap-4">
                           {isAvailable && (
                              <div className="flex items-center gap-2 h-10">
                                  {isLoading ? (
                                      <div className="flex items-center gap-2 px-4 py-2 text-slate-500 dark:text-slate-400">
                                          <Spinner size="w-5 h-5"/>
                                          <span>Cargando audio...</span>
                                      </div>
                                  ) : isSpeaking ? (
                                      <div className="flex items-center gap-2 p-1 bg-slate-200 dark:bg-slate-700 rounded-full">
                                          <button 
                                              onClick={isPaused ? resume : pause}
                                              className="p-2 text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-600 hover:bg-slate-50 dark:hover:bg-slate-500 rounded-full shadow transition-colors"
                                              aria-label={isPaused ? 'Reanudar lectura' : 'Pausar lectura'}
                                          >
                                              {isPaused ? <PlayIcon className="w-5 h-5" /> : <PauseIcon className="w-5 h-5" />}
                                          </button>
                                          <button 
                                              onClick={cancel}
                                              className="p-2 text-slate-500 dark:text-slate-400 hover:bg-slate-300/50 dark:hover:bg-slate-600/50 rounded-full transition-colors"
                                              aria-label="Detener lectura"
                                          >
                                              <StopIcon className="w-5 h-5" />
                                          </button>
                                      </div>
                                  ) : (
                                      <button 
                                          onClick={handlePlay} 
                                          className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white rounded-md hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                                          aria-label="Leer el contenido de la diapositiva en voz alta"
                                      >
                                          <SpeakerWaveIcon className="w-5 h-5" />
                                          <span>Leer en voz alta</span>
                                      </button>
                                  )}
                              </div>
                          )}
                          <span className="text-slate-500 dark:text-slate-400 font-medium">
                              Diapositiva {currentSlideIndex + 1} de {slides.length}
                          </span>
                      </div>
                  </div>

                  <button
                      onClick={() => goToSlide(currentSlideIndex + 1)}
                      disabled={currentSlideIndex === slides.length - 1}
                      className="flex items-center gap-2 px-4 py-2 bg-slate-200 dark:bg-slate-700 text-slate-800 dark:text-white rounded-md disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-300 dark:hover:bg-slate-600 transition-colors"
                  >
                      Siguiente
                      <ArrowRightIcon className="w-5 h-5" />
                  </button>
              </div>
               {error && <p className="text-red-500 dark:text-red-400 text-xs mt-2">{error}</p>}
            </div>
          </main>
        </div>
    </div>
  );
};

export default CourseDetailView;
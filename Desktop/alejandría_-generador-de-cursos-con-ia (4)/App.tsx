
import React, { useState, useCallback } from 'react';
import { User, Course, View } from './types';
import { useLocalStorage } from './hooks/useLocalStorage';
import LoginScreen from './components/LoginScreen';
import Sidebar from './components/Sidebar';
import NewCourseView from './components/NewCourseView';
import MyCoursesView from './components/MyCoursesView';
import CourseDetailView from './components/CourseDetailView';
import { ChevronDoubleLeftIcon, ChevronDoubleRightIcon } from './components/icons';

const App: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [courses, setCourses] = useLocalStorage<Course[]>('alejandria-courses', []);
  const [currentView, setCurrentView] = useState<View>('list');
  const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null);
  const [initialTopic, setInitialTopic] = useState<string>('');
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);

  const handleLogin = (loggedInUser: User) => {
    setUser(loggedInUser);
    setCurrentView(courses.length > 0 ? 'list' : 'new');
  };
  
  const handleLogout = () => {
      setUser(null);
  };

  const handleSetView = (view: View) => {
    setSelectedCourseId(null);
    if(view !== 'new'){
        setInitialTopic('');
    }
    setCurrentView(view);
  };

  const handleGoToCreate = (topic: string = '') => {
      setSelectedCourseId(null);
      setInitialTopic(topic);
      setCurrentView('new');
  };

  const handleCourseCreated = useCallback((course: Course) => {
    setCourses(prevCourses => [course, ...prevCourses]);
    setSelectedCourseId(course.id);
    setCurrentView('detail');
  }, [setCourses]);
  
  const handleViewCourse = (id: string) => {
    setSelectedCourseId(id);
    setCurrentView('detail');
  };

  const handleDeleteCourse = (id: string) => {
    setCourses(prev => prev.filter(c => c.id !== id));
    if (selectedCourseId === id) {
        setSelectedCourseId(null);
        setCurrentView('list');
    }
  };

  const handleCloseDetail = () => {
      setSelectedCourseId(null);
      setCurrentView('list');
  };

  const handleToggleCourseCompletion = (id: string) => {
    setCourses(prevCourses =>
      prevCourses.map(c =>
        c.id === id ? { ...c, isCompleted: !c.isCompleted } : c
      )
    );
  };

  if (!user) {
    return <LoginScreen onLogin={handleLogin} />;
  }

  const renderContent = () => {
    if (currentView === 'detail' && selectedCourseId) {
      const selectedCourse = courses.find(c => c.id === selectedCourseId);
      return selectedCourse ? <CourseDetailView course={selectedCourse} onClose={handleCloseDetail} onToggleCompletion={handleToggleCourseCompletion} /> : <MyCoursesView courses={courses} onViewCourse={handleViewCourse} onDeleteCourse={handleDeleteCourse} onGoToCreate={handleGoToCreate} onCreateFromSuggestion={handleGoToCreate} onToggleCompletion={handleToggleCourseCompletion} />;
    }

    switch (currentView) {
      case 'new':
        return <NewCourseView onCourseCreated={handleCourseCreated} initialTopic={initialTopic}/>;
      case 'list':
      default:
        return <MyCoursesView courses={courses} onViewCourse={handleViewCourse} onDeleteCourse={handleDeleteCourse} onGoToCreate={handleGoToCreate} onCreateFromSuggestion={handleGoToCreate} onToggleCompletion={handleToggleCourseCompletion} />;
    }
  };

  return (
    <div className="flex h-screen font-sans">
      <div className="relative flex-shrink-0">
        <Sidebar user={user} currentView={currentView} onSetView={handleSetView} onLogout={handleLogout} isCollapsed={isSidebarCollapsed} />
        <button
            onClick={() => setIsSidebarCollapsed(p => !p)}
            className="absolute top-1/2 -right-4 transform -translate-y-1/2 z-20 bg-white dark:bg-slate-800 p-1.5 rounded-full shadow-lg border border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition"
            aria-label={isSidebarCollapsed ? "Expandir barra lateral" : "Colapsar barra lateral"}
          >
            {isSidebarCollapsed ? <ChevronDoubleRightIcon className="w-5 h-5" /> : <ChevronDoubleLeftIcon className="w-5 h-5" />}
        </button>
      </div>
      <div className="flex-1 flex flex-col overflow-hidden">
        {renderContent()}
      </div>
    </div>
  );
};

export default App;

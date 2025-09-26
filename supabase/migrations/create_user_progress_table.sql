-- Crear tabla user_progress para almacenar el progreso de estudio de cada usuario
CREATE TABLE IF NOT EXISTS public.user_progress (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    article_number INTEGER NOT NULL,
    title_id TEXT NOT NULL,
    completed BOOLEAN DEFAULT FALSE,
    completed_at TIMESTAMP WITH TIME ZONE,
    study_time_seconds INTEGER DEFAULT 0,
    times_studied INTEGER DEFAULT 0,
    last_studied_at TIMESTAMP WITH TIME ZONE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraint para evitar duplicados por usuario/artículo
    UNIQUE(user_id, article_number)
);

-- Crear tabla user_statistics para estadísticas generales del usuario
CREATE TABLE IF NOT EXISTS public.user_statistics (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    total_study_time INTEGER DEFAULT 0,
    total_articles_studied INTEGER DEFAULT 0,
    study_streak INTEGER DEFAULT 0,
    last_study_date DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla user_settings para configuraciones del usuario
CREATE TABLE IF NOT EXISTS public.user_settings (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
    auto_mark_completed BOOLEAN DEFAULT TRUE,
    study_time_threshold INTEGER DEFAULT 60, -- segundos
    show_progress BOOLEAN DEFAULT TRUE,
    sound_enabled BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Crear tabla daily_sessions para tracking de sesiones diarias
CREATE TABLE IF NOT EXISTS public.daily_sessions (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    session_date DATE NOT NULL,
    start_time TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    articles_studied_today INTEGER DEFAULT 0,
    time_studied_today INTEGER DEFAULT 0, -- en segundos
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),

    -- Constraint para una sesión por día por usuario
    UNIQUE(user_id, session_date)
);

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_progress_user_id ON public.user_progress(user_id);
CREATE INDEX IF NOT EXISTS idx_user_progress_article_number ON public.user_progress(article_number);
CREATE INDEX IF NOT EXISTS idx_user_progress_completed ON public.user_progress(completed);
CREATE INDEX IF NOT EXISTS idx_user_progress_last_studied ON public.user_progress(last_studied_at);

CREATE INDEX IF NOT EXISTS idx_daily_sessions_user_id ON public.daily_sessions(user_id);
CREATE INDEX IF NOT EXISTS idx_daily_sessions_date ON public.daily_sessions(session_date);

-- Row Level Security (RLS) policies

-- Habilitar RLS en todas las tablas
ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_statistics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.daily_sessions ENABLE ROW LEVEL SECURITY;

-- Políticas para user_progress
CREATE POLICY "Users can view their own progress" ON public.user_progress
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own progress" ON public.user_progress
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own progress" ON public.user_progress
    FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own progress" ON public.user_progress
    FOR DELETE USING (auth.uid() = user_id);

-- Políticas para user_statistics
CREATE POLICY "Users can view their own statistics" ON public.user_statistics
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own statistics" ON public.user_statistics
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own statistics" ON public.user_statistics
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para user_settings
CREATE POLICY "Users can view their own settings" ON public.user_settings
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own settings" ON public.user_settings
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own settings" ON public.user_settings
    FOR UPDATE USING (auth.uid() = user_id);

-- Políticas para daily_sessions
CREATE POLICY "Users can view their own sessions" ON public.daily_sessions
    FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own sessions" ON public.daily_sessions
    FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own sessions" ON public.daily_sessions
    FOR UPDATE USING (auth.uid() = user_id);

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers para actualizar updated_at
CREATE TRIGGER update_user_progress_updated_at
    BEFORE UPDATE ON public.user_progress
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_user_statistics_updated_at
    BEFORE UPDATE ON public.user_statistics
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_user_settings_updated_at
    BEFORE UPDATE ON public.user_settings
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER update_daily_sessions_updated_at
    BEFORE UPDATE ON public.daily_sessions
    FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Comentarios para documentación
COMMENT ON TABLE public.user_progress IS 'Almacena el progreso de estudio por artículo de cada usuario';
COMMENT ON TABLE public.user_statistics IS 'Estadísticas generales del usuario';
COMMENT ON TABLE public.user_settings IS 'Configuraciones personalizadas del usuario';
COMMENT ON TABLE public.daily_sessions IS 'Sesiones de estudio diarias del usuario';
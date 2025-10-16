-- ====================================
-- 🎮 TABLAS DE GAMIFICACIÓN - ConstiMaster
-- ====================================

-- Tabla de XP y niveles de usuario
CREATE TABLE IF NOT EXISTS user_xp (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  total_xp INTEGER DEFAULT 0 NOT NULL CHECK (total_xp >= 0),
  current_level INTEGER DEFAULT 1 NOT NULL CHECK (current_level >= 1),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índice para búsquedas rápidas
CREATE INDEX idx_user_xp_user_id ON user_xp(user_id);
CREATE INDEX idx_user_xp_total_xp ON user_xp(total_xp DESC);

-- ====================================
-- Tabla de logros/badges desbloqueados
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  badge_id TEXT NOT NULL,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  xp_earned INTEGER DEFAULT 0 NOT NULL,
  UNIQUE(user_id, badge_id)
);

-- Índices
CREATE INDEX idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX idx_user_achievements_unlocked_at ON user_achievements(unlocked_at DESC);

-- ====================================
-- Tabla de leaderboard (ranking de usuarios)
CREATE TABLE IF NOT EXISTS leaderboard (
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE PRIMARY KEY,
  username TEXT NOT NULL,
  display_name TEXT,
  avatar_url TEXT,
  total_xp INTEGER DEFAULT 0 NOT NULL,
  current_level INTEGER DEFAULT 1 NOT NULL,
  badges_count INTEGER DEFAULT 0 NOT NULL,
  articles_completed INTEGER DEFAULT 0 NOT NULL,
  exams_taken INTEGER DEFAULT 0 NOT NULL,
  current_streak INTEGER DEFAULT 0 NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para ranking
CREATE INDEX idx_leaderboard_total_xp ON leaderboard(total_xp DESC);
CREATE INDEX idx_leaderboard_level ON leaderboard(current_level DESC);
CREATE INDEX idx_leaderboard_updated_at ON leaderboard(updated_at DESC);

-- ====================================
-- Tabla de historial de XP (tracking detallado)
CREATE TABLE IF NOT EXISTS xp_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  xp_amount INTEGER NOT NULL,
  reason TEXT NOT NULL, -- 'article_completed', 'exam_passed', 'badge_unlocked', etc.
  reference_id TEXT, -- ID del artículo, examen, badge, etc.
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices
CREATE INDEX idx_xp_history_user_id ON xp_history(user_id);
CREATE INDEX idx_xp_history_created_at ON xp_history(created_at DESC);

-- ====================================
-- FUNCIONES Y TRIGGERS
-- ====================================

-- Función para actualizar updated_at automáticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Trigger para user_xp
DROP TRIGGER IF EXISTS update_user_xp_updated_at ON user_xp;
CREATE TRIGGER update_user_xp_updated_at
  BEFORE UPDATE ON user_xp
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Trigger para leaderboard
DROP TRIGGER IF EXISTS update_leaderboard_updated_at ON leaderboard;
CREATE TRIGGER update_leaderboard_updated_at
  BEFORE UPDATE ON leaderboard
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ====================================
-- Función para calcular nivel desde XP total
-- ====================================
-- Usa fórmula exponencial: XP por nivel = 100 * (1.5 ^ (level - 1))
CREATE OR REPLACE FUNCTION calculate_level_from_xp(p_total_xp INTEGER)
RETURNS INTEGER AS $$
DECLARE
  v_level INTEGER := 1;
  v_xp_needed INTEGER := 0;
  v_accumulated_xp INTEGER := 0;
BEGIN
  -- Calcular nivel iterando hasta que el XP acumulado supere el XP total
  WHILE v_accumulated_xp <= p_total_xp LOOP
    v_level := v_level + 1;
    v_xp_needed := FLOOR(100 * POWER(1.5, v_level - 1));
    v_accumulated_xp := v_accumulated_xp + v_xp_needed;

    -- Límite de seguridad para evitar loops infinitos
    IF v_level > 200 THEN
      EXIT;
    END IF;
  END LOOP;

  -- El nivel actual es uno menos que donde nos pasamos
  RETURN v_level - 1;
END;
$$ LANGUAGE plpgsql IMMUTABLE;

-- ====================================
-- Función para añadir XP
-- ====================================
CREATE OR REPLACE FUNCTION add_user_xp(
  p_user_id UUID,
  p_xp_amount INTEGER,
  p_reason TEXT,
  p_reference_id TEXT DEFAULT NULL
)
RETURNS TABLE(
  success BOOLEAN,
  old_xp INTEGER,
  new_xp INTEGER,
  old_level INTEGER,
  new_level INTEGER,
  leveled_up BOOLEAN,
  transaction_id UUID
) AS $$
DECLARE
  v_old_xp INTEGER;
  v_new_xp INTEGER;
  v_old_level INTEGER;
  v_new_level INTEGER;
  v_transaction_id UUID;
  v_user_xp_exists BOOLEAN;
BEGIN
  -- Verificar si existe registro de XP para el usuario
  SELECT EXISTS(SELECT 1 FROM user_xp WHERE user_id = p_user_id)
  INTO v_user_xp_exists;

  -- Si no existe, crear el registro inicial
  IF NOT v_user_xp_exists THEN
    INSERT INTO user_xp (user_id, total_xp, current_level)
    VALUES (p_user_id, 0, 1);
  END IF;

  -- Obtener valores actuales
  SELECT total_xp, current_level INTO v_old_xp, v_old_level
  FROM user_xp
  WHERE user_id = p_user_id;

  -- Calcular nuevos valores
  v_new_xp := v_old_xp + p_xp_amount;
  v_new_level := calculate_level_from_xp(v_new_xp);

  -- Actualizar XP y nivel
  UPDATE user_xp
  SET
    total_xp = v_new_xp,
    current_level = v_new_level,
    updated_at = now()
  WHERE user_id = p_user_id;

  -- Crear transacción de XP en historial
  INSERT INTO xp_history (
    user_id,
    xp_amount,
    reason,
    reference_id
  ) VALUES (
    p_user_id,
    p_xp_amount,
    p_reason,
    p_reference_id
  ) RETURNING id INTO v_transaction_id;

  -- Retornar resultados completos
  RETURN QUERY SELECT
    TRUE,
    v_old_xp,
    v_new_xp,
    v_old_level,
    v_new_level,
    v_new_level > v_old_level,
    v_transaction_id;
END;
$$ LANGUAGE plpgsql;

-- ====================================
-- Función para desbloquear badge
-- ====================================
CREATE OR REPLACE FUNCTION unlock_badge(
  p_user_id UUID,
  p_badge_id TEXT,
  p_xp_reward INTEGER
)
RETURNS TABLE(
  success BOOLEAN,
  already_unlocked BOOLEAN,
  badge_id TEXT,
  unlocked_at TIMESTAMP WITH TIME ZONE
) AS $$
DECLARE
  v_already_unlocked BOOLEAN;
  v_unlocked_at TIMESTAMP WITH TIME ZONE;
BEGIN
  -- Verificar si ya está desbloqueado
  SELECT EXISTS(
    SELECT 1 FROM user_achievements
    WHERE user_id = p_user_id AND badge_id = p_badge_id
  ) INTO v_already_unlocked;

  IF v_already_unlocked THEN
    -- Obtener fecha de desbloqueo
    SELECT unlocked_at INTO v_unlocked_at
    FROM user_achievements
    WHERE user_id = p_user_id AND badge_id = p_badge_id;

    RETURN QUERY SELECT
      FALSE,
      TRUE,
      p_badge_id,
      v_unlocked_at;
    RETURN;
  END IF;

  -- Desbloquear badge
  INSERT INTO user_achievements (user_id, badge_id, xp_earned)
  VALUES (p_user_id, p_badge_id, p_xp_reward)
  RETURNING unlocked_at INTO v_unlocked_at;

  -- Añadir XP automáticamente
  PERFORM add_user_xp(p_user_id, p_xp_reward, 'badge_unlocked', p_badge_id);

  -- Actualizar contador en leaderboard
  INSERT INTO leaderboard (user_id, username, badges_count, total_xp)
  VALUES (p_user_id, 'User', 1, p_xp_reward)
  ON CONFLICT (user_id) DO UPDATE
  SET badges_count = leaderboard.badges_count + 1,
      total_xp = leaderboard.total_xp + p_xp_reward;

  -- Retornar éxito
  RETURN QUERY SELECT
    TRUE,
    FALSE,
    p_badge_id,
    v_unlocked_at;
END;
$$ LANGUAGE plpgsql;

-- ====================================
-- POLÍTICAS RLS (Row Level Security)
-- ====================================

-- Habilitar RLS
ALTER TABLE user_xp ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE leaderboard ENABLE ROW LEVEL SECURITY;
ALTER TABLE xp_history ENABLE ROW LEVEL SECURITY;

-- Políticas para user_xp
DROP POLICY IF EXISTS "Users can view their own XP" ON user_xp;
CREATE POLICY "Users can view their own XP"
  ON user_xp FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update their own XP" ON user_xp;
CREATE POLICY "Users can update their own XP"
  ON user_xp FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own XP" ON user_xp;
CREATE POLICY "Users can insert their own XP"
  ON user_xp FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Políticas para user_achievements
DROP POLICY IF EXISTS "Users can view their own achievements" ON user_achievements;
CREATE POLICY "Users can view their own achievements"
  ON user_achievements FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own achievements" ON user_achievements;
CREATE POLICY "Users can insert their own achievements"
  ON user_achievements FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Políticas para leaderboard (lectura pública)
DROP POLICY IF EXISTS "Anyone can view leaderboard" ON leaderboard;
CREATE POLICY "Anyone can view leaderboard"
  ON leaderboard FOR SELECT
  TO authenticated, anon
  USING (true);

DROP POLICY IF EXISTS "Users can update their own leaderboard entry" ON leaderboard;
CREATE POLICY "Users can update their own leaderboard entry"
  ON leaderboard FOR ALL
  USING (auth.uid() = user_id);

-- Políticas para xp_history
DROP POLICY IF EXISTS "Users can view their own XP history" ON xp_history;
CREATE POLICY "Users can view their own XP history"
  ON xp_history FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert their own XP history" ON xp_history;
CREATE POLICY "Users can insert their own XP history"
  ON xp_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ====================================
-- DATOS INICIALES / SEEDS
-- ====================================

-- Los datos de badges se gestionan desde el frontend (badges.ts)

-- ====================================
-- VISTAS ÚTILES
-- ====================================

-- Vista de top usuarios
CREATE OR REPLACE VIEW top_users AS
SELECT
  l.user_id,
  l.username,
  l.display_name,
  l.total_xp,
  l.current_level,
  l.badges_count,
  l.articles_completed,
  l.exams_taken,
  l.current_streak,
  RANK() OVER (ORDER BY l.total_xp DESC) as rank
FROM leaderboard l
ORDER BY l.total_xp DESC
LIMIT 100;

-- Vista de progreso de badges
CREATE OR REPLACE VIEW user_badge_progress AS
SELECT
  u.id as user_id,
  u.email,
  COUNT(ua.badge_id) as unlocked_badges,
  SUM(ua.xp_earned) as total_badge_xp
FROM auth.users u
LEFT JOIN user_achievements ua ON u.id = ua.user_id
GROUP BY u.id, u.email;

-- ====================================
-- COMENTARIOS EN TABLAS
-- ====================================

COMMENT ON TABLE user_xp IS 'Almacena el XP total y nivel actual de cada usuario';
COMMENT ON TABLE user_achievements IS 'Logros/badges desbloqueados por los usuarios';
COMMENT ON TABLE leaderboard IS 'Ranking público de usuarios por XP';
COMMENT ON TABLE xp_history IS 'Historial detallado de todas las transacciones de XP';

COMMENT ON COLUMN user_xp.total_xp IS 'XP total acumulado por el usuario';
COMMENT ON COLUMN user_xp.current_level IS 'Nivel actual calculado desde total_xp';
COMMENT ON COLUMN user_achievements.badge_id IS 'ID del badge (referencia a badges.ts)';
COMMENT ON COLUMN xp_history.reason IS 'Motivo de la ganancia de XP (article_completed, exam_passed, etc.)';

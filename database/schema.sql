-- ============================================================================
-- Tracker do Koda - Schema Completo do Banco de Dados
-- ============================================================================
-- Este arquivo contém toda a estrutura necessária do banco de dados
-- Execute no SQL Editor do Supabase: https://supabase.com/dashboard/project/_/sql
--
-- Autor: Tracker do Koda Team
-- Versão: 2.0.0
-- Última atualização: 2026-03-18
-- ============================================================================

-- ============================================================================
-- 1. TABELA DE PERFIS (profiles)
-- ============================================================================
-- Armazena informações do perfil do usuário e dados do bebê

CREATE TABLE IF NOT EXISTS profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  baby_name TEXT,
  birth_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentários de documentação
COMMENT ON TABLE profiles IS 'Perfil do usuário com informações do bebê';
COMMENT ON COLUMN profiles.baby_name IS 'Nome do bebê';
COMMENT ON COLUMN profiles.birth_date IS 'Data de nascimento do bebê';

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON profiles
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 2. TABELA DE ALIMENTAÇÕES (feeds)
-- ============================================================================
-- Registra todos os momentos de cuidado: mamadas, fraldas e medicamentos

CREATE TABLE IF NOT EXISTS feeds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('materno', 'formula', 'fralda', 'medicamento')),
  duration INTEGER DEFAULT 0 CHECK (duration >= 0),
  feed_date TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentários de documentação
COMMENT ON TABLE feeds IS 'Registros de alimentação, fraldas e medicamentos';
COMMENT ON COLUMN feeds.type IS 'Tipo: materno, formula, fralda ou medicamento';
COMMENT ON COLUMN feeds.duration IS 'Duração em minutos (0 para fraldas e medicamentos)';
COMMENT ON COLUMN feeds.feed_date IS 'Data e hora do evento (timezone aware)';
COMMENT ON COLUMN feeds.notes IS 'Notas adicionais opcionais';

-- ============================================================================
-- 3. TABELA DE MEDICAMENTOS (medications)
-- ============================================================================
-- Cadastro de medicamentos do bebê

CREATE TABLE IF NOT EXISTS medications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT,
  instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentários de documentação
COMMENT ON TABLE medications IS 'Cadastro de medicamentos do bebê';
COMMENT ON COLUMN medications.name IS 'Nome do medicamento';
COMMENT ON COLUMN medications.dosage IS 'Dosagem/concentração (ex: 100mg/ml, 20mg)';
COMMENT ON COLUMN medications.frequency IS 'Frequência de uso (ex: 8 em 8h, 2x ao dia)';
COMMENT ON COLUMN medications.instructions IS 'Instruções especiais (ex: dar após alimentação)';

-- Trigger para updated_at
CREATE TRIGGER update_medications_updated_at
  BEFORE UPDATE ON medications
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- ============================================================================
-- 4. TABELA DE LOGS DE MEDICAMENTOS (medication_logs)
-- ============================================================================
-- Histórico de administração de medicamentos

CREATE TABLE IF NOT EXISTS medication_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  medication_id UUID REFERENCES medications(id) ON DELETE CASCADE,
  dosage_given TEXT NOT NULL,
  log_date TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentários de documentação
COMMENT ON TABLE medication_logs IS 'Histórico de administração de medicamentos';
COMMENT ON COLUMN medication_logs.dosage_given IS 'Dosagem administrada (ex: 5ml, 1 gota)';

-- ============================================================================
-- 5. TABELA DE LEMBRETES (reminders)
-- ============================================================================
-- Lembretes de eventos importantes

CREATE TABLE IF NOT EXISTS reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  reminder_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reminder_time TIME NOT NULL,
  label TEXT NOT NULL,
  is_active BOOLEAN DEFAULT TRUE,
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Comentários de documentação
COMMENT ON TABLE reminders IS 'Lembretes de eventos importantes';
COMMENT ON COLUMN reminders.reminder_date IS 'Data do lembrete';
COMMENT ON COLUMN reminders.reminder_time IS 'Horário do lembrete';
COMMENT ON COLUMN reminders.label IS 'Descrição do lembrete';
COMMENT ON COLUMN reminders.is_active IS 'Se o lembrete está ativo';
COMMENT ON COLUMN reminders.is_completed IS 'Se o lembrete já foi concluído';

-- ============================================================================
-- 6. ÍNDICES (Performance)
-- ============================================================================

-- Índices para feeds
CREATE INDEX IF NOT EXISTS idx_feeds_user ON feeds(user_id);
CREATE INDEX IF NOT EXISTS idx_feeds_date ON feeds(feed_date DESC);
CREATE INDEX IF NOT EXISTS idx_feeds_user_date ON feeds(user_id, feed_date DESC);
CREATE INDEX IF NOT EXISTS idx_feeds_type ON feeds(type);

-- Índices para medications
CREATE INDEX IF NOT EXISTS idx_medications_user ON medications(user_id);
CREATE INDEX IF NOT EXISTS idx_medications_user_name ON medications(user_id, name);

-- Índices para medication_logs
CREATE INDEX IF NOT EXISTS idx_medication_logs_user ON medication_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_medication_logs_medication ON medication_logs(medication_id);
CREATE INDEX IF NOT EXISTS idx_medication_logs_date ON medication_logs(log_date DESC);
CREATE INDEX IF NOT EXISTS idx_medication_logs_user_date ON medication_logs(user_id, log_date DESC);

-- Índices para reminders
CREATE INDEX IF NOT EXISTS idx_reminders_user ON reminders(user_id);
CREATE INDEX IF NOT EXISTS idx_reminders_user_active ON reminders(user_id, is_active);
CREATE INDEX IF NOT EXISTS idx_reminders_datetime ON reminders(reminder_date, reminder_time);

-- ============================================================================
-- 7. ROW LEVEL SECURITY (RLS)
-- ============================================================================
-- Proteção de dados: usuários só acessam seus próprios dados

-- Habilitar RLS em todas as tabelas
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- 8. POLÍTICAS DE SEGURANÇA (Profiles)
-- ============================================================================

-- Ver profile próprio
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

-- Criar profile próprio
CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Atualizar profile próprio
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- ============================================================================
-- 9. POLÍTICAS DE SEGURANÇA (Feeds)
-- ============================================================================

-- Ver feeds próprios
CREATE POLICY "Users can view own feeds"
  ON feeds FOR SELECT
  USING (auth.uid() = user_id);

-- Criar feeds próprios
CREATE POLICY "Users can insert own feeds"
  ON feeds FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Atualizar feeds próprios
CREATE POLICY "Users can update own feeds"
  ON feeds FOR UPDATE
  USING (auth.uid() = user_id);

-- Deletar feeds próprios
CREATE POLICY "Users can delete own feeds"
  ON feeds FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 10. POLÍTICAS DE SEGURANÇA (Medications)
-- ============================================================================

-- Ver medicamentos próprios
CREATE POLICY "Users can view own medications"
  ON medications FOR SELECT
  USING (auth.uid() = user_id);

-- Criar medicamentos próprios
CREATE POLICY "Users can insert own medications"
  ON medications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Atualizar medicamentos próprios
CREATE POLICY "Users can update own medications"
  ON medications FOR UPDATE
  USING (auth.uid() = user_id);

-- Deletar medicamentos próprios
CREATE POLICY "Users can delete own medications"
  ON medications FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 11. POLÍTICAS DE SEGURANÇA (Medication Logs)
-- ============================================================================

-- Ver logs próprios
CREATE POLICY "Users can view own medication_logs"
  ON medication_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Criar logs próprios
CREATE POLICY "Users can insert own medication_logs"
  ON medication_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Deletar logs próprios
CREATE POLICY "Users can delete own medication_logs"
  ON medication_logs FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 12. POLÍTICAS DE SEGURANÇA (Reminders)
-- ============================================================================

-- Ver lembretes próprios
CREATE POLICY "Users can view own reminders"
  ON reminders FOR SELECT
  USING (auth.uid() = user_id);

-- Criar lembretes próprios
CREATE POLICY "Users can insert own reminders"
  ON reminders FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Atualizar lembretes próprios
CREATE POLICY "Users can update own reminders"
  ON reminders FOR UPDATE
  USING (auth.uid() = user_id);

-- Deletar lembretes próprios
CREATE POLICY "Users can delete own reminders"
  ON reminders FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- 13. TRIGGER PARA CRIAR PROFILE AUTOMATICAMENTE
-- ============================================================================

-- Função para criar profile quando usuário é criado
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger que chama a função
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE PROCEDURE public.handle_new_user();

-- ============================================================================
-- 14. FUNÇÕES ÚTEIS
-- ============================================================================

-- Função para limpar dados antigos (opcional, para manutenção)
CREATE OR REPLACE FUNCTION clean_old_data(days_to_keep INTEGER DEFAULT 90)
RETURNS INTEGER AS $$
DECLARE
  deleted_count INTEGER;
BEGIN
  -- Deletar feeds mais antigos que X dias
  DELETE FROM feeds
  WHERE feed_date < NOW() - (days_to_keep || ' days')::INTERVAL;

  GET DIAGNOSTICS deleted_count = ROW_COUNT;
  RETURN deleted_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================================
-- 15. VERIFICAÇÃO DE INSTALAÇÃO
-- ============================================================================

-- Verificar se todas as tabelas foram criadas
SELECT
  'profiles' as table_name,
  COUNT(*) as row_count
FROM profiles
UNION ALL
SELECT
  'feeds' as table_name,
  COUNT(*) as row_count
FROM feeds
UNION ALL
SELECT
  'medications' as table_name,
  COUNT(*) as row_count
FROM medications
UNION ALL
SELECT
  'medication_logs' as table_name,
  COUNT(*) as row_count
FROM medication_logs
UNION ALL
SELECT
  'reminders' as table_name,
  COUNT(*) as row_count
FROM reminders
ORDER BY table_name;

-- ============================================================================
-- FIM DO SCHEMA
-- ============================================================================
-- Se todas as tabelas apareceram acima, a instalação foi bem-sucedida! ✅
-- ============================================================================

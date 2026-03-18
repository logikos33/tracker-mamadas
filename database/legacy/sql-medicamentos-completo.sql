-- 🔧 SQL Completo para Configurar Tabelas de Medicamentos
-- Execute no SQL Editor do Supabase

-- =====================================================
-- CRIAR TABELAS DE MEDICAMENTOS
-- =====================================================

-- Criar tabela de medicamentos
CREATE TABLE IF NOT EXISTS medications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de logs de medicamentos
CREATE TABLE IF NOT EXISTS medication_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  medication_id UUID REFERENCES medications(id) NOT NULL,
  dosage_given TEXT NOT NULL,
  log_date TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- HABILITAR ROW LEVEL SECURITY (RLS)
-- =====================================================

ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;

-- =====================================================
-- CRIAR POLÍTICAS DE SEGURANÇA
-- =====================================================

-- Políticas para medications
DROP POLICY IF EXISTS "Users can view own medications" ON medications;
CREATE POLICY "Users can view own medications"
  ON medications FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own medications" ON medications;
CREATE POLICY "Users can insert own medications"
  ON medications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can update own medications" ON medications;
CREATE POLICY "Users can update own medications"
  ON medications FOR UPDATE
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can delete own medications" ON medications;
CREATE POLICY "Users can delete own medications"
  ON medications FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas para medication_logs
DROP POLICY IF EXISTS "Users can view own medication_logs" ON medication_logs;
CREATE POLICY "Users can view own medication_logs"
  ON medication_logs FOR SELECT
  USING (auth.uid() = user_id);

DROP POLICY IF EXISTS "Users can insert own medication_logs" ON medication_logs;
CREATE POLICY "Users can insert own medication_logs"
  ON medication_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- CRIAR ÍNDICES
-- =====================================================

CREATE INDEX IF NOT EXISTS idx_medications_user ON medications(user_id);
CREATE INDEX IF NOT EXISTS idx_medications_user_name ON medications(user_id, name);
CREATE INDEX IF NOT EXISTS idx_medication_logs_user ON medication_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_medication_logs_date ON medication_logs(log_date DESC);

-- =====================================================
-- VERIFICAR SE TUDO FOI CRIADO CORRETAMENTE
-- =====================================================

-- Verificar tabelas
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('medications', 'medication_logs')
ORDER BY table_name;

-- Verificar colunas da tabela medications
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'medications'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Verificar colunas da tabela medication_logs
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'medication_logs'
  AND table_schema = 'public'
ORDER BY ordinal_position;

-- Se aparecer tudo acima, está CORRETO! ✅

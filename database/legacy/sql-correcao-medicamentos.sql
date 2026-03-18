-- 🔧 SQL CORRIGIDO - Criar Tabelas de Medicamentos
-- Execute no SQL Editor do Supabase

-- =====================================================
-- PRIMEIRO: Remover tabelas antigas se existirem
-- =====================================================

DROP TABLE IF EXISTS medication_logs CASCADE;
DROP TABLE IF EXISTS medications CASCADE;

-- =====================================================
-- CRIAR TABELA DE MEDICAMENTOS
-- =====================================================

CREATE TABLE medications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT,
  instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- =====================================================
-- CRIAR TABELA DE LOGS DE MEDICAMENTOS
-- =====================================================

CREATE TABLE medication_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  medication_id UUID REFERENCES medications(id) ON DELETE CASCADE,
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
-- CRIAR POLÍTICAS DE SEGURANÇA PARA medications
-- =====================================================

CREATE POLICY "Users can view own medications"
  ON medications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own medications"
  ON medications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own medications"
  ON medications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own medications"
  ON medications FOR DELETE
  USING (auth.uid() = user_id);

-- =====================================================
-- CRIAR POLÍTICAS DE SEGURANÇA PARA medication_logs
-- =====================================================

CREATE POLICY "Users can view own medication_logs"
  ON medication_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own medication_logs"
  ON medication_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- =====================================================
-- CRIAR ÍNDICES PARA MELHORAR PERFORMANCE
-- =====================================================

CREATE INDEX idx_medications_user ON medications(user_id);
CREATE INDEX idx_medications_user_name ON medications(user_id, name);
CREATE INDEX idx_medication_logs_user ON medication_logs(user_id);
CREATE INDEX idx_medication_logs_date ON medication_logs(log_date DESC);

-- =====================================================
-- VERIFICAÇÃO
-- =====================================================

SELECT 'Tabelas criadas com sucesso!' as status;

SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('medications', 'medication_logs')
ORDER BY table_name;

-- SQL completo para atualizar o Supabase com medicamentos e fraldas
-- Execute isso no SQL Editor do Supabase

-- =====================================================
-- 1. CRIAR TABELAS DE MEDICAMENTOS
-- =====================================================

-- Criar tabela de medicamentos
CREATE TABLE IF NOT EXISTS medications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT,
  instructions TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de logs de medicamentos
CREATE TABLE IF NOT EXISTS medication_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  medication_id UUID REFERENCES medications(id) ON DELETE CASCADE,
  dosage_given TEXT NOT NULL,
  log_date TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para medications
CREATE POLICY IF NOT EXISTS "Users can view own medications"
  ON medications FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own medications"
  ON medications FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can update own medications"
  ON medications FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete own medications"
  ON medications FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas de segurança para medication_logs
CREATE POLICY IF NOT EXISTS "Users can view own medication_logs"
  ON medication_logs FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can insert own medication_logs"
  ON medication_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY IF NOT EXISTS "Users can delete own medication_logs"
  ON medication_logs FOR DELETE
  USING (auth.uid() = user_id);

-- Criar índices para melhorar performance
CREATE INDEX IF NOT EXISTS idx_medications_user ON medications(user_id);
CREATE INDEX IF NOT EXISTS idx_medication_logs_user ON medication_logs(user_id, log_date DESC);

-- =====================================================
-- 2. ATUALIZAR TABELA FEEDS PARA SUPORTAR NOVOS TIPOS
-- =====================================================

-- Remover constraint antigo se existir
ALTER TABLE feeds
  DROP CONSTRAINT IF EXISTS feeds_type_check;

-- Adicionar constraint atualizado com todos os tipos
ALTER TABLE feeds
  ADD CONSTRAINT feeds_type_check
  CHECK (type IN ('materno', 'formula', 'medicamento', 'fralda'));

-- =====================================================
-- 3. COMENTÁRIOS DE DOCUMENTAÇÃO
-- =====================================================

COMMENT ON TABLE medications IS 'Medicamentos cadastrados pelo usuário';
COMMENT ON TABLE medication_logs IS 'Registro de uso de medicamentos';
COMMENT ON COLUMN medications.dosage IS 'Dosagem padrão (ex: 5ml, 1 gota, 10mg)';
COMMENT ON COLUMN medications.frequency IS 'Frequência de uso (ex: 8 em 8 horas, 3x ao dia)';
COMMENT ON COLUMN medications.instructions IS 'Instruções especiais (ex: tomar antes das refeições)';
COMMENT ON COLUMN medication_logs.dosage_given IS 'Dosagem administrada (ex: 5ml, 1 gota)';

-- =====================================================
-- 4. VERIFICAR TABELAS
-- =====================================================

-- Verificar se tabelas foram criadas
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
  'feeds' as table_name,
  COUNT(*) as row_count
FROM feeds;

-- =====================================================
-- CONCLUÍDO!
-- =====================================================
-- Todas as tabelas estão criadas e configuradas!
-- Os tipos suportados na tabela feeds são:
-- - materno (Leite Materno)
-- - formula (Fórmula)
-- - medicamento (Medicamentos)
-- - fralda (Trocas de Fraldas)

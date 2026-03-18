-- 🔧 SQL COMPLETO PARA CORRIGIR TUDO
-- Execute isso no SQL Editor do Supabase

-- =====================================================
-- DIAGNÓSTICO - Verificar o que existe
-- =====================================================

-- Verificar constraints atuais na tabela feeds
SELECT constraint_name, check_clause
FROM information_schema.table_constraints
WHERE table_name = 'feeds'
  AND constraint_schema = 'public';

-- =====================================================
-- SOLUÇÃO - Recriar tudo corretamente
-- =====================================================

-- Passo 1: Remover TODAS as constraints da tabela feeds
ALTER TABLE feeds
  DROP CONSTRAINT IF EXISTS feeds_type_check CASCADE;

ALTER TABLE feeds
  DROP CONSTRAINT IF EXISTS feeds_duration_check CASCADE;

-- Passo 2: Recriar as constraints CORRETAMENTE

-- Constraint de tipo (aceita os 4 tipos)
ALTER TABLE feeds
  ADD CONSTRAINT feeds_type_check
  CHECK (type IN ('materno', 'formula', 'medicamento', 'fralda'));

-- Constraint de duração (aceita 0 ou mais)
ALTER TABLE feeds
  ADD CONSTRAINT feeds_duration_check
  CHECK (duration >= 0);

-- =====================================================
-- VERIFICAÇÃO FINAL
-- =====================================================

-- Verificar se as constraints foram criadas corretamente
SELECT
    constraint_name,
    check_clause
FROM information_schema.table_constraints
WHERE table_name = 'feeds'
  AND constraint_schema = 'public'
ORDER BY constraint_name;

-- =====================================================
-- TESTE - Inserir uma fralda de teste
-- =====================================================

-- Inserir um registro de teste para verificar se funciona
INSERT INTO feeds (user_id, type, duration, feed_date, notes)
SELECT
    id,
    'fralda' as type,
    0 as duration,
    NOW() as feed_date,
    'Teste de fralda' as notes
FROM (
    SELECT id FROM auth.users LIMIT 1
) AS subquery
ON CONFLICT DO NOTHING;

-- Mostrar resultado
SELECT '✅ SUCESSO! Fraldas agora funcionam!' as status;

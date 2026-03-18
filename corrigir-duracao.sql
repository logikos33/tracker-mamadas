-- 🔧 CORREÇÃO URGENTE - Permitir duração = 0 para fraldas

-- Remover constraint antiga que exige duration > 0
ALTER TABLE feeds
  DROP CONSTRAINT IF EXISTS feeds_duration_check;

-- Recriar a constraint permitindo duração = 0 (para fraldas)
ALTER TABLE feeds
  ADD CONSTRAINT feeds_duration_check
  CHECK (duration >= 0);

-- Verificar se está correto
SELECT constraint_name, check_clause
FROM information_schema.table_constraints
WHERE table_name = 'feeds'
  AND constraint_schema = 'public';

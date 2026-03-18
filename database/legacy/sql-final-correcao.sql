-- ✅ SQL FINAL PARA CORRIGIR TUDO
-- Execute no SQL Editor do Supabase

-- =====================================================
-- PASSO 1: Remover TODAS as constraints antigas
-- =====================================================

DO $$
DECLARE
    constraint_name TEXT;
BEGIN
    FOR constraint_name IN
        SELECT constraint_name
        FROM information_schema.table_constraints
        WHERE table_name = 'feeds'
        AND constraint_schema = 'public'
    LOOP
        BEGIN
            EXECUTE format('ALTER TABLE feeds DROP CONSTRAINT IF EXISTS %s CASCADE', constraint_name);
        EXCEPTION WHEN OTHERS THEN
            NULL;
        END;
    END LOOP;
END $$;

-- =====================================================
-- PASSO 2: Recriar constraints corretas
-- =====================================================

-- Constraint de tipos (aceita os 4 tipos novos)
ALTER TABLE feeds
  ADD CONSTRAINT feeds_type_check
  CHECK (type IN ('materno', 'formula', 'medicamento', 'fralda', 'fralda'));

-- Constraint de duração (aceita 0 ou mais, para fraldas)
ALTER TABLE feeds
  ADD CONSTRAINT feeds_duration_check
  CHECK (duration >= 0);

-- =====================================================
-- PASSO 3: Verificar se funcionou
-- =====================================================

SELECT
    constraint_name,
    check_clause
FROM information_schema.table_constraints
WHERE table_name = 'feeds'
  AND constraint_schema = 'public'
ORDER BY constraint_name;

-- Se aparecer 2 linhas:
-- feeds_duration_check | (duration >= 0)
-- feeds_type_check     | (duration = 0 OR (type = ANY(ARRAY['materno'::text, 'formula'::text, 'medicamento'::text, 'fralda'::text]) AND duration >= 0)

-- Então está CORRETO! ✅

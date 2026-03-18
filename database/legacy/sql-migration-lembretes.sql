-- 🔧 SQL Migration para Atualizar Lembretes
-- Execute no SQL Editor do Supabase

-- Adicionar colunas reminder_date e is_completed à tabela reminders
ALTER TABLE reminders
  ADD COLUMN IF NOT EXISTS reminder_date DATE DEFAULT CURRENT_DATE,
  ADD COLUMN IF NOT EXISTS is_completed BOOLEAN DEFAULT FALSE;

-- Atualizar lembretes existentes para ter a data de hoje
UPDATE reminders
SET reminder_date = CURRENT_DATE
WHERE reminder_date IS NULL;

-- Verificar se funcionou
SELECT column_name, data_type, column_default
FROM information_schema.columns
WHERE table_name = 'reminders'
  AND column_name IN ('reminder_date', 'is_completed')
ORDER BY column_name;

-- Deve aparecer 2 linhas:
-- reminder_date | date | CURRENT_DATE
-- is_completed | boolean | false

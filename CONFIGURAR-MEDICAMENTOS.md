# 🔧 Configurar Tabelas de Medicamentos

## Problema
O botão "Salvar Medicamento" não está funcionando porque as tabelas de medicamentos não existem no banco de dados.

## Solução

### Passo 1: Acessar o Supabase SQL Editor
1. Vá até: https://supabase.com/dashboard/project/kjchwkftkdiuhqisifbm/sql
2. Clique em "New Query"

### Passo 2: Executar o SQL
1. Abra o arquivo `sql-medicamentos-completo.sql`
2. Copie TODO o conteúdo do arquivo
3. Cole no SQL Editor do Supabase
4. Clique no botão "RUN" ▶️ (botão azul no canto superior direito)

### Passo 3: Verificar se Funcionou
Após executar, você deve ver 3 tabelas de resultados:

**Tabela 1 - Verificar Tabelas:**
```
table_name
medication_logs
medications
```

**Tabela 2 - Colunas da tabela medications:**
```
column_name | data_type | is_nullable
id          | uuid      | NO
user_id     | uuid      | NO
name        | text      | NO
dosage      | text      | NO
frequency   | text      | YES
notes       | text      | YES
created_at  | timestamp with time zone | YES
```

**Tabela 3 - Colunas da tabela medication_logs:**
```
column_name    | data_type | is_nullable
id             | uuid      | NO
user_id        | uuid      | NO
medication_id  | uuid      | NO
dosage_given   | text      | NO
log_date       | timestamp with time zone | NO
notes          | text      | YES
created_at     | timestamp with time zone | YES
```

Se aparecer tudo isso, está **CORRETO! ✅**

### Passo 4: Testar no App
1. Atualize a página do app (Ctrl+F5 ou Cmd+Shift+R)
2. Selecione "💊 Medicamento"
3. Clique em "+ Adicionar Novo Medicamento"
4. Preencha:
   - Nome: "Vitamina D"
   - Dosagem: "1 gota"
5. Clique em "💾 Salvar Medicamento"
6. Deve aparecer mensagem de sucesso e o medicamento aparecer no select!

## Debug Adicional

Se ainda não funcionar, abra o Console do navegador (F12) e veja os logs. Eles mostrarão exatamente onde está o erro.

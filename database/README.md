# 📁 Database - Tracker do Koda

Esta pasta contém toda a estrutura e documentação do banco de dados do projeto.

## 📋 Arquivos

### `schema.sql`
Schema completo do banco de dados com todas as tabelas, índices, políticas de segurança (RLS) e funções.

**Contém:**
- ✅ Tabelas: profiles, feeds, medications, medication_logs, reminders
- ✅ Índices para performance
- ✅ Row Level Security (RLS) para proteção de dados
- ✅ Trigger para criar profile automaticamente
- ✅ Função de limpeza de dados antigos
- ✅ Comentários de documentação em todas as tabelas/colunas

## 🚀 Como Usar

### Instalação Inicial

1. Acesse o projeto no [Supabase Dashboard](https://supabase.com/dashboard)
2. Vá em **SQL Editor**
3. Copie todo o conteúdo do arquivo `schema.sql`
4. Cole no SQL Editor
5. Clique em **Run** (ou pressione `Ctrl + Enter`)
6. Aguarde a confirmação: "Success. No rows returned"

### Verificar Instalação

No final do script, você verá uma tabela com o nome de todas as tabelas e a quantidade de registros. Se aparecerem todas, a instalação foi bem-sucedida!

```sql
table_name     | row_count
---------------|----------
feeds          |        0
medication_logs|        0
medications    |        0
profiles       |        0
reminders      |        0
```

## 📊 Estrutura das Tabelas

### profiles
Informações do perfil e do bebê
- `baby_name`: Nome do bebê
- `birth_date`: Data de nascimento

### feeds
Registros de alimentação, fraldas e medicamentos
- `type`: materno | formula | fralda | medicamento
- `duration`: Duração em minutos (0 para fraldas/medicamentos)
- `feed_date`: Data/hora do evento
- `notes`: Notas opcionais

### medications
Cadastro de medicamentos
- `name`: Nome do medicamento
- `dosage`: Dosagem/concentração
- `frequency`: Frequência de uso
- `instructions`: Instruções especiais

### medication_logs
Histórico de administração
- `medication_id`: FK para medications
- `dosage_given`: Dosagem administrada
- `log_date`: Data/hora da administração
- `notes`: Observações

### reminders
Lembretes de eventos
- `reminder_date`: Data do lembrete
- `reminder_time`: Horário
- `label`: Descrição
- `is_active`: Se está ativo
- `is_completed`: Se já foi concluído

## 🔒 Segurança (RLS)

Todas as tabelas possuem **Row Level Security** habilitado:

- ✅ Usuários só podem VER seus próprios dados
- ✅ Usuários só podem CRIAR seus próprios dados
- ✅ Usuários só podem EDITAR seus próprios dados
- ✅ Usuários só podem DELETAR seus próprios dados

Isso garante que dados de diferentes usuários nunca se misturem!

## 🛠️ Manutenção

### Limpar Dados Antigos

O schema inclui uma função para limpar dados antigos (opcional):

```sql
SELECT clean_old_data(90);  -- Deleta feeds com mais de 90 dias
```

### Backup

Sempre faça backup antes de alterações:

```sql
-- Exportar todos os dados
SELECT * FROM feeds;
SELECT * FROM medications;
SELECT * FROM medication_logs;
SELECT * FROM reminders;
```

## 📝 Notas Importantes

1. **Nunca execute DROP TABLE** sem backup
2. **Sempre teste queries** no ambiente de desenvolvimento primeiro
3. **RLS é essencial** para segurança dos dados
4. **Índices melhoram performance** em consultas grandes
5. ** Comentários ajudam** a documentar o schema

## 🐛 Troubleshooting

### Erro: "relation already exists"
Use `CREATE TABLE IF NOT EXISTS` (já está no schema)

### Erro: "permission denied"
Verifique se as policies de RLS foram criadas corretamente

### Erro: "trigger already exists"
O schema usa `DROP TRIGGER IF EXISTS` antes de criar

## 📚 Recursos

- [Supabase Documentation](https://supabase.com/docs)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)
- [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)

---

**Versão:** 2.0.0
**Última atualização:** 2026-03-18
**Autor:** Tracker do Koda Team

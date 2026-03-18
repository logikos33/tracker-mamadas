# 🧸 Tracker do Koda - Baby Care App

Uma aplicação web completa e fofa para acompanhar todos os cuidados do seu bebê, com backend na nuvem usando Supabase, permitindo acesso de múltiplos dispositivos e sincronização em tempo real.

## ✨ Funcionalidades

### Principais Recursos
- 👤 **Sistema de Autenticação**: Cadastro e login seguros com email/senha
- ☁️ **Sincronização na Nuvem**: Acesse seus dados de qualquer dispositivo
- 👶 **Perfil do Bebê**: Configure nome do bebê e data de nascimento
- 📝 **Registro de Alimentações**: Adicione mamadas com data, hora, duração, tipo e notas
- 💊 **Controle de Medicamentos**: Cadastre medicamentos e registre administrações
- 👶 **Troca de Fraldas**: Botão rápido para registrar trocas de fraldas com estatísticas
- ⏰ **Sistema de Lembretes Avançado**: Configure lembretes com data, hora e marque como concluído
- 📊 **Dashboard Completo**: Estatísticas de últimas 24 horas, semana e mês
- 📈 **Gráficos Temporais**: Evolução dos últimos 7 e 30 dias
- 🎨 **Temas com Animais**: 5 temas coloridos com animais fofos (Ursos 🧸, Girafas 🦒, Unicórnios 🦄, Pinguins 🐧, Dragões 🐉)
- ⚡ **Botões Rápidos**: +1, +5, +10, +15 minutos para facilitar registro
- 📜 **Histórico Completo**: Acompanhe todos os registros ordenados por data/hora
- 📱 **Design Responsivo**: Funciona perfeitamente em desktop, tablet e celular

### Tipos de Registro
- 🤱 Leite Materno
- 🍼 Fórmula
- 👶 Troca de Fralda
- 💊 Medicamentos

## 🚀 Configuração Inicial

### 1. Criar Projeto no Supabase

1. Acesse [supabase.com](https://supabase.com)
2. Clique em "Start your project"
3. Faça login com GitHub ou Google
4. Clique em "New Project"
5. Preencha:
   - **Name**: `tracker-Koda`
   - **Database Password**: (gere uma senha forte e salve)
   - **Region**: South America (São Paulo) recomendado
6. Aguarde o provisionamento (~2-3 minutos)

### 2. Obter Credenciais

1. No seu projeto, vá em **Settings** → **API**
2. Copie:
   - **Project URL**: algo como `https://xxxxxxxx.supabase.co`
   - **anon public key**: chave longa que começa com `eyJhbGci...`

### 3. Configurar o Banco de Dados

1. No Supabase, vá em **SQL Editor**
2. Clique em "New Query"
3. Cole e execute o seguinte SQL:

```sql
-- Criar tabela de perfis
CREATE TABLE profiles (
  id UUID REFERENCES auth.users(id) PRIMARY KEY,
  baby_name TEXT,
  birth_date DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Trigger para criar profile automaticamente
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id)
  VALUES (new.id);
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();

-- Criar tabela de feeds (alimentações, fraldas, medicamentos)
CREATE TABLE feeds (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('materno', 'formula', 'fralda', 'medicamento')),
  duration INTEGER NOT NULL CHECK (duration >= 0),
  feed_date TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de medicamentos
CREATE TABLE medications (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de logs de medicamentos
CREATE TABLE medication_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  medication_id UUID REFERENCES medications(id) NOT NULL,
  dosage_given TEXT NOT NULL,
  log_date TIMESTAMP WITH TIME ZONE NOT NULL,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela de lembretes
CREATE TABLE reminders (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  reminder_date DATE NOT NULL DEFAULT CURRENT_DATE,
  reminder_time TIME NOT NULL,
  label TEXT NOT NULL,
  is_active BOOLEAN DEFAULT true,
  is_completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE feeds ENABLE ROW LEVEL SECURITY;
ALTER TABLE medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE medication_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE reminders ENABLE ROW LEVEL SECURITY;

-- Políticas de segurança para profiles
CREATE POLICY "Users can view own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);
CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

-- Políticas de segurança para feeds
CREATE POLICY "Users can view own feeds"
  ON feeds FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own feeds"
  ON feeds FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can delete own feeds"
  ON feeds FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas de segurança para medications
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

-- Políticas de segurança para medication_logs
CREATE POLICY "Users can view own medication_logs"
  ON medication_logs FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own medication_logs"
  ON medication_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Políticas de segurança para reminders
CREATE POLICY "Users can view own reminders"
  ON reminders FOR SELECT
  USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own reminders"
  ON reminders FOR INSERT
  WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own reminders"
  ON reminders FOR UPDATE
  USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own reminders"
  ON reminders FOR DELETE
  USING (auth.uid() = user_id);

-- Criar índices para melhorar performance
CREATE INDEX idx_feeds_user_date ON feeds(user_id, feed_date DESC);
CREATE INDEX idx_feeds_date ON feeds(feed_date DESC);
CREATE INDEX idx_reminders_user_date ON reminders(user_id, reminder_date, reminder_time);
CREATE INDEX idx_medications_user ON medications(user_id);
```

4. Clique em "Run" para executar

### 4. Configurar a Aplicação

1. Abra o arquivo `js/config.js`
2. Substitua as credenciais:

```javascript
const SUPABASE_CONFIG = {
    url: 'SUA_URL_AQUI', // Ex: 'https://abcdefgh.supabase.co'
    anonKey: 'SUA_CHAVE_AQUI' // Cole a chave anon public key
};
```

### 5. Hospedar a Aplicação

#### Opção 1: GitHub Pages (Recomendado - Grátis)

1. Crie um repositório no GitHub
2. Faça upload dos arquivos
3. Vá em **Settings** → **Pages**
4. Em "Source", selecione `main` branch
5. Aguarde alguns segundos
6. Acesse: `https://SEU_USUARIO.github.io/tracker-Koda/`

#### Opção 2: Netlify (Grátis)

1. Acesse [netlify.com](https://netlify.com)
2. Arraste a pasta do projeto para fazer deploy
3. Pronto! Você receberá uma URL

#### Opção 3: Vercel (Grátis)

1. Acesse [vercel.com](https://vercel.com)
2. Importe o projeto do GitHub ou arraste a pasta
3. Pronto!

## 📱 Como Usar

### Primeiro Acesso

1. Abra a aplicação no navegador
2. Clique em "Cadastre-se"
3. Preencha email e senha (mínimo 6 caracteres)
4. Faça login

### Configurar Perfil

1. Clique em "⚙️ Perfil" no canto superior direito
2. Adicione o nome do bebê
3. Adicione a data de nascimento (opcional)
4. Escolha um tema fofo (Ursos 🧸, Girafas 🦒, Unicórnios 🦄, Pinguins 🐧, Dragões 🐉)
5. Clique em "Salvar Alterações"

### Registrar uma Alimentação

1. Preencha o formulário:
   - Tipo de alimentação (Leite Materno ou Fórmula)
   - Use os botões rápidos (+1, +5, +10, +15 min) para ajustar duração
   - Data e hora (preenchido automaticamente)
   - Notas (opcional)
2. Clique em "✓ Registrar Mamada"

### Registrar Troca de Fralda

1. Clique no botão grande "Registrar Troca de Fralda"
2. Ou selecione "Fralda" no formulário e adicione notas

### Registrar Medicamento

1. Selecione "Medicamento" no tipo de alimentação
2. Clique em "+ Adicionar Novo Medicamento" se for o primeiro uso
3. Preencha nome, dosagem e informações do medicamento
4. Para uso futuro, basta selecionar o medicamento cadastrado
5. Informe a dosagem administrada e clique em registrar

### Configurar Lembretes

1. Na seção "Lembretes"
2. Escolha a data (padrão: hoje)
3. Escolha o horário
4. Adicione uma descrição (ex: "Consulta pediátrica", "Mamada da manhã")
5. Clique em "Adicionar Lembrete"
6. Permita notificações do navegador quando solicitado
7. Quando o lembrete acontecer, marque a checkbox para indicar que foi concluído

### Visualizar Gráficos

1. Use os botões "Últimos 7 dias" ou "Últimos 30 dias"
2. Visualize:
   - Quantidade de mamadas por dia (linha)
   - Tempo total por dia (barras)
   - Média de duração por dia (área)

## 🎯 Estatísticas Disponíveis

### Últimas 24 Horas (🆕)
- Total de momentos de cuidado
- Tempo total de alimentação
- Média de duração
- Distribuição por tipo

### Trocas de Fralda
- Total hoje
- Total na semana
- Total no mês
- Média por dia
- Tendências (vs semana passada, vs média mensal)

### Esta Semana (7 dias)
- Total de momentos
- Tempo total
- Média de duração

### Este Mês (30 dias)
- Total de momentos
- Tempo total
- Média de duração

## 🎨 Temas Disponíveis

- 🧸 **Marrom (Ursos)** - Tema padrão, aconchegante e fofinho
- 🦒 **Azul (Girafas)** - Tema alegre e divertido
- 🦄 **Rosa (Unicórnios)** - Tema mágico e encantador
- 🐧 **Verde (Pinguins)** - Tema fresco e simpático
- 🐉 **Roxo (Dragões)** - Tema fantasia e aventura

## 🛠️ Tecnologias Utilizadas

- **HTML5**: Estrutura da aplicação
- **CSS3**: Design moderno, responsivo e temático com animais
- **JavaScript (ES6+)**: Lógica da aplicação modular
- **Supabase**: Backend como serviço (banco de dados + autenticação)
- **Chart.js**: Biblioteca para gráficos interativos
- **Notification API**: Sistema de notificações do navegador

## 📁 Estrutura do Projeto

```
tracker-Koda/
├── index.html          # Aplicação principal
├── login.html          # Tela de login
├── register.html       # Tela de cadastro
├── profile.html        # Configurações do perfil
├── css/
│   └── styles.css      # Estilos compartilhados e temas
├── js/
│   ├── config.js       # Configuração do Supabase
│   ├── auth.js         # Sistema de autenticação
│   ├── feeds.js        # CRUD de alimentações
│   ├── profile.js      # Gerenciamento de perfil
│   ├── charts.js       # Gráficos e visualizações
│   ├── reminders.js    # Sistema de lembretes avançado
│   ├── medications.js  # Controle de medicamentos
│   ├── utils.js        # Funções utilitárias
│   ├── theme.js        # Gerenciamento de temas
│   └── app.js          # Lógica principal
├── sql-migration-lembretes.sql  # Migração do banco
└── README.md           # Este arquivo
```

## 🔒 Segurança

- ✅ **Row Level Security (RLS)**: Cada usuário só vê seus próprios dados
- ✅ **HTTPS**: Criptografia de dados em trânsito
- ✅ **Senhas Hasheadas**: Gerenciadas pelo Supabase
- ✅ **Sessões com Expiração**: Tokens com validade limitada
- ✅ **Validação de Dados**: Tanto no frontend quanto no banco

## 💡 Dicas de Uso

1. **Permitir Notificações**: Quando solicitado pelo navegador, permita notificações para receber lembretes
2. **Múltiplos Dispositivos**: Faça login no celular e computador para sincronizar dados
3. **Botões Rápidos**: Use os botões +1, +5, +10, +15 min para registrar durações mais rapidamente
4. **Temas**: Escolha o tema favorito do seu bebê na tela de perfil
5. **Backup**: Seus dados estão seguros na nuvem do Supabase
6. **Lembretes Futuros**: Agende consultas e compromissos com antecedência usando a data do lembrete

## 🐛 Troubleshooting

### Erro: "User not authenticated"
- Solução: Faça logout e login novamente

### Gráficos não aparecem
- Solução: Recarregue a página (F5)

### Notificações não funcionam
- Solução: Verifique se permitiu notificações no navegador
- Chrome: Configurações → Privacidade → Notificações

### Erro de conexão com Supabase
- Solução: Verifique se as credenciais em `js/config.js` estão corretas
- Verifique se o projeto Supabase está ativo

### Erro ao registrar fralda/medicamento
- Solução: Execute o SQL migration `sql-migration-lembretes.sql` no SQL Editor do Supabase
- Isso adicionará as colunas `reminder_date` e `is_completed` na tabela de lembretes

## 📱 Compatibilidade

- ✅ Chrome/Edge (Recomendado)
- ✅ Firefox
- ✅ Safari
- ✅ Navegadores móveis (Chrome Mobile, Safari Mobile)

## 🚀 Próximas Melhorias Planejadas

- [ ] Exportar dados (PDF, Excel)
- [ ] Gráficos avançados (percentis)
- [ ] Suporte para múltiplos bebês
- [ ] Integração com Google Calendar
- [ ] Aplicativo mobile (React Native ou PWA)
- [ ] Modo escuro
- [ ] Comparativo com outros bebês (anonimizado)
- [ ] Relatórios mensais automatizados

## 📄 Licença

Este projeto é open source e está disponível sob a licença MIT.

## 🤝 Contribuindo

Contribuições são bem-vindas! Sinta-se à vontade para:
- Reportar bugs
- Sugerir novas funcionalidades
- Fazer pull requests

---

**Desenvolvido com ❤️ para ajudar pais a acompanhar todos os momentos especiais do seus bebês.**

**Powered by Supabase** - Backend open source para desenvolvimento moderno

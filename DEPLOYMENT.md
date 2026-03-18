# 🚀 Guia Rápido de Deploy - Tracker de Mamadas

## Resumo do Processo

Este guia orienta você através de 5 passos simples para colocar o Tracker de Mamadas no ar com Supabase.

## 📋 Checklist de Deploy

- [ ] Criar projeto no Supabase
- [ ] Configurar banco de dados
- [ ] Obter credenciais (URL e Anon Key)
- [ ] Configurar arquivo js/config.js
- [ ] Fazer deploy em GitHub Pages/Netlify/Vercel

## Passo 1: Supabase (5 minutos)

### Criar Conta
1. Acesse https://supabase.com
2. Clique em "Start your project"
3. Faça login com GitHub (recomendado)

### Criar Projeto
1. Clique em "New Project"
2. Preencha:
   - **Name**: `tracker-mamadas`
   - **Database Password**: `SuaSenhaForteAqui123!`
   - **Region**: South America (São Paulo)
3. Aguarde 2-3 minutos

## Passo 2: Banco de Dados (3 minutos)

1. No dashboard do Supabase, clique em **SQL Editor** (ícone de terminal na sidebar)
2. Clique em **New query**
3. Copie o SQL do README.md (seção "Configurar o Banco de Dados")
4. Cole no editor
5. Clique em **Run** ▶️
6. Aguarde mensagem de sucesso

## Passo 3: Obter Credenciais (1 minuto)

1. No Supabase, clique em **Settings** (ícone de engrenagem)
2. Clique em **API**
3. Copie:
   - **Project URL** → Ex: `https://abcdefgh.supabase.co`
   - **anon public** key → Ex: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`

## Passo 4: Configurar Aplicação (2 minutos)

1. Abra o arquivo `js/config.js` em um editor de texto
2. Substitua as credenciais:

```javascript
const SUPABASE_CONFIG = {
    url: 'https://SEU_PROJETO.supabase.co',  // ← Cole sua URL aqui
    anonKey: 'SUA_CHAVE_ANON_AQUI'            // ← Cole sua chave anon aqui
};
```

3. Salve o arquivo

## Passo 5: Deploy (5 minutos)

### Opção A: GitHub Pages (Recomendado)

1. **Criar repositório no GitHub**:
   - Vá para https://github.com/new
   - Nome: `tracker-mamadas`
   - Deixe público ou privado
   - Clique em "Create repository"

2. **Fazer upload dos arquivos**:
   - Clique em "uploading an existing file"
   - Arraste TODOS os arquivos da pasta:
     - `index.html`
     - `login.html`
     - `register.html`
     - `profile.html`
     - Pasta `css/` com `styles.css`
     - Pasta `js/` com todos os arquivos `.js`
     - `README.md` (opcional)
   - Clique em "Commit changes"

3. **Ativar GitHub Pages**:
   - No repositório, clique em **Settings**
   - Clique em **Pages** (menu lateral)
   - Em "Source", selecione: `main` branch
   - Clique em **Save**
   - Aguarde 1-2 minutos
   - Acesse: `https://SEU_USUARIO.github.io/tracker-mamadas/`

### Opção B: Netlify (Mais Rápido)

1. Acesse https://netlify.com
2. Faça signup (é grátis)
3. Arraste a pasta `tracker-mamadas` para a área indicada
4. Pronto! Você receberá uma URL como: `https://seu-site-aleatorio.netlify.app`

### Opção C: Vercel

1. Acesse https://vercel.com
2. Faça signup com GitHub
3. Clique em "New Project"
4. Importe do GitHub ou arraste a pasta
5. Clique em "Deploy"

## ✅ Testar a Aplicação

1. Abra a URL do deploy
2. Você deve ver a tela de login
3. Clique em "Cadastre-se"
4. Crie uma conta de teste
5. Faça login
6. Configure o perfil do bebê
7. Adicione uma mamada de teste
8. Verifique se aparece no dashboard

## 🎉 Sucesso!

Se tudo funcionou, seu app está no ar! Agora você pode:

- Acessar de qualquer dispositivo
- Compartilhar com seu parceiro(a)
- Ter dados sincronizados em tempo real

## 🐛 Problemas Comuns

### Erro: "Invalid API Key"
**Solução**: Verifique se colou a chave correta em `js/config.js`
- Deve ser a **anon public key**, não a service_role key

### Erro: "Database error"
**Solução**: Execute o SQL novamente no SQL Editor do Supabase

### Gráficos não aparecem
**Solução**: Recarregue a página (Ctrl+F5 ou Cmd+Shift+R)

### GitHub Pages mostra 404
**Solução**:
- Verifique se o arquivo se chama `index.html` (minúsculo)
- Aguarde mais 1-2 minutos (às vezes demora)
- Verifique se selecionou a branch correta nas configurações

## 📱 Próximos Passos

1. **Testar no celular**: Abra a URL no navegador do celular
2. **Testar login múltiplo**: Abra em dois navegadores diferentes
3. **Configurar lembretes**: Adicione lembretes e teste notificações
4. **Personalizar**: Edite o nome do bebê no perfil

## 🔧 Configurações Avançadas (Opcional)

### Mudar URL personalizada
No GitHub Pages:
- Settings → Pages
- Em "Custom domain", adicione seu domínio

### Adicionar Google Analytics
Adicione antes de `</head>` no `index.html`:
```html
<script async src="https://www.googletagmanager.com/gtag/js?id=G-XXXXXXXXXX"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());
  gtag('config', 'G-XXXXXXXXXX');
</script>
```

## 💪 Dicas de Manutenção

- **Backup automático**: O Supabase faz backup automaticamente
- **Monitorar uso**: Acompanhe no dashboard do Supabase (Settings → Billing)
- **Atualizar**: Para atualizar, basta fazer push de novos commits para o GitHub

## 🆘 Precisa de Ajuda?

1. Verifique o **README.md** para documentação completa
2. Consulte a **documentação do Supabase**: https://supabase.com/docs
3. Revise o console do navegador (F12) para ver erros

---

**Tempo total estimado**: 15-20 minutos
**Custo**: R$ 0,00 (100% grátis com as tiers gratuitas do Supabase e GitHub Pages)

**Bom sucesso! 🎉**

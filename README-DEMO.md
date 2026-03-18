# 🎮 MODO DEMO - Setup Rápido

## ⚡ Criar Usuário Demo (30 segundos)

1. **Acesse**: https://supabase.com/dashboard
2. **Selecione o projeto** tracker-Koda
3. **Authentication** → **Users**
4. **Add user** → **Create new user**
5. Preencha:
   - Email: `demo@tracker-koda.com`
   - Password: (escolha uma senha)
   - Auto Confirm User: ✅ **ON**
6. Clique **Create user**

## 🔧 Atualizar Senha no Código

Abra `js/config-demo.js` e coloque sua senha:

```javascript
const DEMO_USER = {
    email: 'demo@tracker-koda.com',
    password: 'SUA_SENHA_AQUI',  // ← Atualizar aqui
    name: 'Visitante Demo',
    isDemo: true
};
```

## ✅ Pronto!

Agora o botão **"🎮 Experimentar Demo"** vai funcionar!

---

## 📱 Como Usar a Branch Demo

```bash
# A branch demo já existe!
git checkout demo
git push origin demo

# Configure GitHub Pages:
# Settings → Pages → Branch: demo
```

---

**É só isso!** Simples e rápido. 🚀

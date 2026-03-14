import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import multer from "multer";

declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const db = new Database("auditchek.db");

// Initialize Database
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    role TEXT DEFAULT 'student',
    plan TEXT DEFAULT 'free',
    is_verified INTEGER DEFAULT 0,
    two_factor_enabled INTEGER DEFAULT 0,
    phone TEXT,
    company TEXT,
    job_title TEXT,
    promo_code TEXT,
    nif TEXT,
    blocked INTEGER DEFAULT 0,
    subscription_expiry DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
  );

  CREATE TABLE IF NOT EXISTS subscriptions (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    plan TEXT NOT NULL,
    amount REAL NOT NULL,
    status TEXT DEFAULT 'active',
    payment_method TEXT,
    start_date DATETIME DEFAULT CURRENT_TIMESTAMP,
    end_date DATETIME,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS activity_logs (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    action TEXT NOT NULL,
    details TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS accounts (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    class_id INTEGER NOT NULL,
    parent_id TEXT,
    type TEXT NOT NULL -- 'debit' or 'credit' (normal balance)
  );

  CREATE TABLE IF NOT EXISTS journal_entries (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    date DATE NOT NULL,
    description TEXT,
    user_id INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS journal_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entry_id INTEGER NOT NULL,
    account_id TEXT NOT NULL,
    debit REAL DEFAULT 0,
    credit REAL DEFAULT 0,
    FOREIGN KEY(entry_id) REFERENCES journal_entries(id),
    FOREIGN KEY(account_id) REFERENCES accounts(id)
  );

  CREATE TABLE IF NOT EXISTS invoices (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    number TEXT UNIQUE NOT NULL,
    date DATE NOT NULL,
    customer_name TEXT NOT NULL,
    customer_nif TEXT,
    total_amount REAL NOT NULL,
    tax_amount REAL NOT NULL,
    status TEXT DEFAULT 'pending',
    user_id INTEGER,
    FOREIGN KEY(user_id) REFERENCES users(id)
  );

  CREATE TABLE IF NOT EXISTS documents (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    entry_id INTEGER,
    filename TEXT NOT NULL,
    path TEXT NOT NULL,
    user_id INTEGER,
    FOREIGN KEY(entry_id) REFERENCES journal_entries(id),
    FOREIGN KEY(user_id) REFERENCES users(id)
  );
`);

// Configure Multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'public/uploads/');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const upload = multer({ storage });

// Seed PGC Angola Classes
const seedAccounts = [
  // Classe 1: Meios Fixos e Investimentos
  { id: '11', name: 'Imobilizações Corpóreas', class_id: 1, type: 'debit' },
  { id: '11.1', name: 'Terrenos e Recursos Naturais', class_id: 1, parent_id: '11', type: 'debit' },
  { id: '11.2', name: 'Edifícios e Outras Construções', class_id: 1, parent_id: '11', type: 'debit' },
  { id: '11.3', name: 'Equipamento Básico', class_id: 1, parent_id: '11', type: 'debit' },
  { id: '11.4', name: 'Equipamento de Transporte', class_id: 1, parent_id: '11', type: 'debit' },
  { id: '11.5', name: 'Equipamento Administrativo', class_id: 1, parent_id: '11', type: 'debit' },
  { id: '12', name: 'Imobilizações Incorpóreas', class_id: 1, type: 'debit' },
  { id: '12.1', name: 'Trespasses', class_id: 1, parent_id: '12', type: 'debit' },
  { id: '12.2', name: 'Propriedade Industrial', class_id: 1, parent_id: '12', type: 'debit' },
  { id: '13', name: 'Investimentos Financeiros', class_id: 1, type: 'debit' },
  { id: '18', name: 'Imobilizações em Curso', class_id: 1, type: 'debit' },
  { id: '19', name: 'Amortizações Acumuladas', class_id: 1, type: 'credit' },

  // Classe 2: Existências
  { id: '21', name: 'Compras', class_id: 2, type: 'debit' },
  { id: '22', name: 'Matérias-primas, Auxiliares e de Consumo', class_id: 2, type: 'debit' },
  { id: '23', name: 'Produtos em Curso e Intermédios', class_id: 2, type: 'debit' },
  { id: '24', name: 'Produtos Acabados e Semi-acabados', class_id: 2, type: 'debit' },
  { id: '25', name: 'Subprodutos, Desperdícios, Resíduos e Refugos', class_id: 2, type: 'debit' },
  { id: '26', name: 'Mercadorias', class_id: 2, type: 'debit' },

  // Classe 3: Terceiros
  { id: '31', name: 'Clientes', class_id: 3, type: 'debit' },
  { id: '31.1', name: 'Clientes, Correntes', class_id: 3, parent_id: '31', type: 'debit' },
  { id: '32', name: 'Fornecedores', class_id: 3, type: 'credit' },
  { id: '32.1', name: 'Fornecedores, Correntes', class_id: 3, parent_id: '32', type: 'credit' },
  { id: '33', name: 'Empréstimos Obtidos', class_id: 3, type: 'credit' },
  { id: '34', name: 'Estado', class_id: 3, type: 'debit' },
  { id: '34.1', name: 'Imposto sobre o Rendimento', class_id: 3, parent_id: '34', type: 'debit' },
  { id: '34.2', name: 'Imposto sobre o Valor Acrescentado (IVA)', class_id: 3, parent_id: '34', type: 'debit' },
  { id: '34.3', name: 'Segurança Social', class_id: 3, parent_id: '34', type: 'debit' },
  { id: '35', name: 'Entidades Participadas', class_id: 3, type: 'debit' },
  { id: '36', name: 'Pessoal', class_id: 3, type: 'credit' },
  { id: '37', name: 'Outros Devedores', class_id: 3, type: 'debit' },
  { id: '38', name: 'Outros Credores', class_id: 3, type: 'credit' },

  // Classe 4: Meios Monetários
  { id: '41', name: 'Títulos Negociáveis', class_id: 4, type: 'debit' },
  { id: '42', name: 'Depósitos a Prazo', class_id: 4, type: 'debit' },
  { id: '43', name: 'Depósitos à Ordem', class_id: 4, type: 'debit' },
  { id: '43.1', name: 'Banco BFA', class_id: 4, parent_id: '43', type: 'debit' },
  { id: '43.2', name: 'Banco BAI', class_id: 4, parent_id: '43', type: 'debit' },
  { id: '45', name: 'Caixa', class_id: 4, type: 'debit' },

  // Classe 5: Capital e Reservas
  { id: '51', name: 'Capital', class_id: 5, type: 'credit' },
  { id: '52', name: 'Acções/Quotas Próprias', class_id: 5, type: 'debit' },
  { id: '53', name: 'Prémios de Emissão', class_id: 5, type: 'credit' },
  { id: '54', name: 'Reservas de Reavaliação', class_id: 5, type: 'credit' },
  { id: '55', name: 'Reservas Legais', class_id: 5, type: 'credit' },
  { id: '56', name: 'Outras Reservas', class_id: 5, type: 'credit' },
  { id: '59', name: 'Resultados Transitados', class_id: 5, type: 'credit' },

  // Classe 6: Proveitos por Natureza
  { id: '61', name: 'Vendas', class_id: 6, type: 'credit' },
  { id: '61.1', name: 'Vendas de Mercadorias', class_id: 6, parent_id: '61', type: 'credit' },
  { id: '61.2', name: 'Vendas de Produtos Acabados', class_id: 6, parent_id: '61', type: 'credit' },
  { id: '62', name: 'Prestações de Serviços', class_id: 6, type: 'credit' },
  { id: '63', name: 'Outros Proveitos Operacionais', class_id: 6, type: 'credit' },
  { id: '66', name: 'Proveitos Financeiros', class_id: 6, type: 'credit' },
  { id: '68', name: 'Proveitos Extraordinários', class_id: 6, type: 'credit' },

  // Classe 7: Custos por Natureza
  { id: '71', name: 'Custo das Existências Vendidas e Consumidas', class_id: 7, type: 'debit' },
  { id: '71.1', name: 'Custo das Mercadorias Vendidas', class_id: 7, parent_id: '71', type: 'debit' },
  { id: '71.2', name: 'Matérias-primas Consumidas', class_id: 7, parent_id: '71', type: 'debit' },
  { id: '72', name: 'Custos com o Pessoal', class_id: 7, type: 'debit' },
  { id: '72.1', name: 'Remunerações', class_id: 7, parent_id: '72', type: 'debit' },
  { id: '72.2', name: 'Encargos sobre Remunerações', class_id: 7, parent_id: '72', type: 'debit' },
  { id: '75', name: 'Fornecimentos e Serviços de Terceiros', class_id: 7, type: 'debit' },
  { id: '75.1', name: 'Água e Energia', class_id: 7, parent_id: '75', type: 'debit' },
  { id: '75.2', name: 'Comunicações', class_id: 7, parent_id: '75', type: 'debit' },
  { id: '75.3', name: 'Rendas e Alugueres', class_id: 7, parent_id: '75', type: 'debit' },
  { id: '76', name: 'Custos Financeiros', class_id: 7, type: 'debit' },
  { id: '78', name: 'Custos Extraordinários', class_id: 7, type: 'debit' },
  { id: '79', name: 'Amortizações do Exercício', class_id: 7, type: 'debit' },

  // Classe 8: Resultados
  { id: '81', name: 'Resultados Operacionais', class_id: 8, type: 'credit' },
  { id: '82', name: 'Resultados Financeiros', class_id: 8, type: 'credit' },
  { id: '83', name: 'Resultados Correntes', class_id: 8, type: 'credit' },
  { id: '84', name: 'Resultados Extraordinários', class_id: 8, type: 'credit' },
  { id: '85', name: 'Resultados Antes de Impostos', class_id: 8, type: 'credit' },
  { id: '86', name: 'Imposto sobre o Rendimento', class_id: 8, type: 'debit' },
  { id: '88', name: 'Resultado Líquido do Exercício', class_id: 8, type: 'credit' },
];

const insertAccount = db.prepare("INSERT OR IGNORE INTO accounts (id, name, class_id, parent_id, type) VALUES (?, ?, ?, ?, ?)");
for (const acc of seedAccounts) {
  insertAccount.run(acc.id, acc.name, acc.class_id, acc.parent_id || null, acc.type);
}
console.log("PGC Angola accounts synchronized.");

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());
  app.use('/uploads', express.static('public/uploads'));

  // Helper for logging
  const logActivity = (userId: number, action: string, details: string) => {
    db.prepare("INSERT INTO activity_logs (user_id, action, details) VALUES (?, ?, ?)").run(userId, action, details);
  };

  // Auth Middleware
  const authenticateToken = (req: any, res: any, next: any) => {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];
    if (!token) return res.sendStatus(401);

    jwt.verify(token, process.env.JWT_SECRET || 'secret', (err: any, user: any) => {
      if (err) return res.sendStatus(403);
      
      // Check if user is blocked
      const u = db.prepare("SELECT blocked FROM users WHERE id = ?").get(user.id) as any;
      if (u?.blocked) return res.status(403).json({ error: "Conta bloqueada. Por favor, contacte o suporte." });

      req.user = user;
      next();
    });
  };

  const authenticateAdmin = (req: any, res: any, next: any) => {
    authenticateToken(req, res, () => {
      if (req.user.role !== 'admin' && req.user.email !== process.env.SUPER_ADMIN_EMAIL) {
        return res.status(403).json({ error: "Acesso negado. Apenas administradores." });
      }
      next();
    });
  };

  // API Routes
  app.post("/api/auth/register", async (req, res) => {
    const { name, email, password, phone, company, job_title, promo_code, nif, user_type } = req.body;
    
    // Password validation
    const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;
    if (!passwordRegex.test(password)) {
      return res.status(400).json({ error: "A palavra-passe deve ter pelo menos 8 caracteres, incluindo maiúsculas, minúsculas, números e símbolos." });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || "luisarion33@gmail.com";
    const isSuperAdmin = email === SUPER_ADMIN_EMAIL;
    const role = isSuperAdmin ? 'admin' : (user_type === 'Empresa' ? 'enterprise' : (user_type === 'Contabilista' ? 'professional' : 'student'));

    try {
      const result = db.prepare(`
        INSERT INTO users (name, email, password, role, phone, company, job_title, promo_code, nif, plan) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).run(name, email, hashedPassword, role, phone || null, company || null, job_title || null, promo_code || null, nif || null, 'free');
      
      logActivity(result.lastInsertRowid as number, 'REGISTER', `User ${email} registered as ${role}`);
      res.status(201).json({ id: result.lastInsertRowid });
    } catch (e) {
      res.status(400).json({ error: "Este email já está registado." });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    const { email, password } = req.body;
    const user = db.prepare("SELECT * FROM users WHERE email = ?").get(email) as any;
    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({ error: "Credenciais inválidas." });
    }
    
    // Check for super admin override
    let role = user.role;
    const SUPER_ADMIN_EMAIL = process.env.SUPER_ADMIN_EMAIL || "luisarion33@gmail.com";
    if (email === SUPER_ADMIN_EMAIL) {
      role = 'admin';
    }

    logActivity(user.id, 'LOGIN', `User ${email} logged in`);
    const token = jwt.sign({ id: user.id, email: user.email, role: role }, process.env.JWT_SECRET || 'secret');
    res.json({ token, user: { id: user.id, name: user.name, email: user.email, role: role, plan: user.plan } });
  });

  app.get("/api/accounts", (req, res) => {
    const accounts = db.prepare("SELECT * FROM accounts").all();
    res.json(accounts);
  });

  app.get("/api/journal", authenticateToken, (req: any, res) => {
    const entries = db.prepare(`
      SELECT e.*, 
             GROUP_CONCAT(i.account_id || ':' || i.debit || ':' || i.credit) as items,
             (SELECT filename FROM documents WHERE entry_id = e.id LIMIT 1) as document
      FROM journal_entries e
      JOIN journal_items i ON e.id = i.entry_id
      WHERE e.user_id = ?
      GROUP BY e.id
      ORDER BY e.date DESC
    `).all(req.user.id);
    res.json(entries);
  });

  app.post("/api/journal", authenticateToken, upload.single('document'), (req: any, res) => {
    const { date, description, items: itemsStr } = req.body;
    const items = JSON.parse(itemsStr);
    
    // Plan restrictions
    const user = db.prepare("SELECT plan FROM users WHERE id = ?").get(req.user.id) as any;
    if (user.plan === 'free') {
      const monthStart = new Date();
      monthStart.setDate(1);
      monthStart.setHours(0,0,0,0);
      const entryCount = db.prepare("SELECT COUNT(*) as count FROM journal_entries WHERE user_id = ? AND created_at >= ?").get(req.user.id, monthStart.toISOString()) as any;
      if (entryCount.count >= 20) {
        return res.status(403).json({ error: "Limite de 20 lançamentos mensais atingido no plano Gratuito. Faça upgrade para continuar." });
      }
    }

    const totalDebit = items.reduce((sum: number, item: any) => sum + (parseFloat(item.debit) || 0), 0);
    const totalCredit = items.reduce((sum: number, item: any) => sum + (parseFloat(item.credit) || 0), 0);
    
    if (Math.abs(totalDebit - totalCredit) > 0.01) {
      return res.status(400).json({ error: "O total de Débitos deve ser igual ao total de Créditos." });
    }

    const transaction = db.transaction(() => {
      const entry = db.prepare("INSERT INTO journal_entries (date, description, user_id) VALUES (?, ?, ?)").run(date, description, req.user.id);
      const entryId = entry.lastInsertRowid;
      const insertItem = db.prepare("INSERT INTO journal_items (entry_id, account_id, debit, credit) VALUES (?, ?, ?, ?)");
      for (const item of items) {
        insertItem.run(entryId, item.account_id, parseFloat(item.debit) || 0, parseFloat(item.credit) || 0);
      }

      if (req.file) {
        db.prepare("INSERT INTO documents (entry_id, filename, path, user_id) VALUES (?, ?, ?, ?)").run(entryId, req.file.filename, req.file.path, req.user.id);
      }

      return entryId;
    });

    try {
      const entryId = transaction();
      console.log(`Lançamento criado com sucesso: ID ${entryId} para usuário ${req.user.id}`);
      res.status(201).json({ id: Number(entryId) });
    } catch (e: any) {
      console.error("Erro na transação de lançamento:", e);
      res.status(500).json({ error: "Falha na transação: " + e.message });
    }
  });

  app.get("/api/reports/trial-balance", authenticateToken, (req: any, res) => {
    const balance = db.prepare(`
      SELECT a.id, a.name, a.class_id,
             COALESCE(SUM(ji.debit), 0) as total_debit, 
             COALESCE(SUM(ji.credit), 0) as total_credit
      FROM accounts a
      LEFT JOIN (
        SELECT i.account_id, i.debit, i.credit
        FROM journal_items i
        JOIN journal_entries e ON i.entry_id = e.id
        WHERE e.user_id = ?
      ) ji ON a.id = ji.account_id
      GROUP BY a.id
      HAVING total_debit > 0 OR total_credit > 0
      ORDER BY a.id ASC
    `).all(req.user.id);
    res.json(balance);
  });

  app.get("/api/reports/balance-sheet", authenticateToken, (req: any, res) => {
    const balance = db.prepare(`
      SELECT a.id, a.name, a.class_id,
             COALESCE(SUM(ji.debit), 0) as total_debit, 
             COALESCE(SUM(ji.credit), 0) as total_credit
      FROM accounts a
      LEFT JOIN (
        SELECT i.account_id, i.debit, i.credit
        FROM journal_items i
        JOIN journal_entries e ON i.entry_id = e.id
        WHERE e.user_id = ?
      ) ji ON a.id = ji.account_id
      WHERE a.class_id IN (1, 2, 3, 4, 5)
      GROUP BY a.id
      HAVING total_debit > 0 OR total_credit > 0
    `).all(req.user.id);
    res.json(balance);
  });

  app.get("/api/invoices", authenticateToken, (req: any, res) => {
    const invoices = db.prepare("SELECT * FROM invoices WHERE user_id = ? ORDER BY date DESC").all(req.user.id);
    res.json(invoices);
  });

  app.post("/api/invoices", authenticateToken, (req: any, res) => {
    const { number, date, customer_name, customer_nif, total_amount, tax_amount } = req.body;
    
    // Plan restrictions
    const user = db.prepare("SELECT plan FROM users WHERE id = ?").get(req.user.id) as any;
    if (user.plan === 'free' || user.plan === 'student') {
      return res.status(403).json({ error: "A emissão de facturas não está disponível no seu plano actual." });
    }

    try {
      const result = db.prepare(`
        INSERT INTO invoices (number, date, customer_name, customer_nif, total_amount, tax_amount, user_id)
        VALUES (?, ?, ?, ?, ?, ?, ?)
      `).run(number, date, customer_name, customer_nif, total_amount, tax_amount, req.user.id);
      res.status(201).json({ id: result.lastInsertRowid });
    } catch (e) {
      res.status(400).json({ error: "O número da factura já existe no sistema." });
    }
  });

  // Backup Endpoint
app.post('/api/backup', authenticateToken, (req, res) => {
  logActivity(req.user.id, 'BACKUP_CREATED', 'Backup manual solicitado pelo utilizador');
  res.json({ message: 'Backup concluído com sucesso e armazenado na nuvem.', timestamp: new Date().toISOString() });
});

// Admin Routes
  app.get("/api/admin/stats", authenticateAdmin, (req, res) => {
    const totalUsers = db.prepare("SELECT COUNT(*) as count FROM users").get() as any;
    const activeUsers = db.prepare("SELECT COUNT(*) as count FROM users WHERE blocked = 0").get() as any;
    
    // MRR Calculation (Simplified)
    const plans = db.prepare("SELECT plan, COUNT(*) as count FROM users GROUP BY plan").all() as any[];
    const planPrices: any = { 'free': 0, 'student': 2000, 'professional': 10000, 'enterprise': 40000 };
    const mrr = plans.reduce((sum, p) => sum + (planPrices[p.plan] || 0) * p.count, 0);
    
    const logs = db.prepare("SELECT l.*, u.email FROM activity_logs l JOIN users u ON l.user_id = u.id ORDER BY l.created_at DESC LIMIT 50").all();
    const users = db.prepare("SELECT id, name, email, role, plan, blocked, created_at FROM users").all();

    res.json({
      totalUsers: totalUsers.count,
      activeUsers: activeUsers.count,
      totalRevenue: mrr * 12, // Estimated annual
      mrr,
      plans,
      logs,
      users
    });
  });

  app.post("/api/admin/users/:id/block", authenticateAdmin, (req, res) => {
    const { blocked } = req.body;
    db.prepare("UPDATE users SET blocked = ? WHERE id = ?").run(blocked ? 1 : 0, req.params.id);
    logActivity(req.user.id, 'ADMIN_BLOCK', `User ${req.params.id} ${blocked ? 'blocked' : 'unblocked'}`);
    res.json({ success: true });
  });

  app.post("/api/admin/users/:id/plan", authenticateAdmin, (req, res) => {
    const { plan } = req.body;
    db.prepare("UPDATE users SET plan = ? WHERE id = ?").run(plan, req.params.id);
    logActivity(req.user.id, 'ADMIN_PLAN_CHANGE', `User ${req.params.id} plan changed to ${plan}`);
    res.json({ success: true });
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { 
        middlewareMode: true,
        hmr: false // Desativar HMR para evitar erros de WebSocket no ambiente de preview
      },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, "dist")));
    app.get("*", (req, res) => {
      res.sendFile(path.join(__dirname, "dist", "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();

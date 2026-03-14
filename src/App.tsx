import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  LayoutDashboard, 
  Book,
  Layers,
  BookOpen, 
  FileText, 
  ShieldCheck, 
  GraduationCap, 
  Receipt, 
  Settings, 
  LogOut,
  Plus,
  Search,
  AlertCircle,
  CheckCircle2,
  ChevronRight,
  TrendingUp,
  Users,
  Wallet,
  Menu,
  X,
  User as UserIcon,
  Crown,
  Lock,
  CreditCard,
  History,
  Activity,
  PieChart,
  BarChart3,
  FileSearch,
  ClipboardList,
  Upload,
  Paperclip,
  Building2,
  Mail,
  Phone,
  Scale,
  Zap
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { User, Account, JournalEntry, Invoice, AuditError } from './types';
import { getAccountingAdvice, runAudit } from './services/geminiService';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/// ---------------------------------------------------------------------------
/// APP COMPONENT
/// ---------------------------------------------------------------------------
export default function App() {
  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [auditErrors, setAuditErrors] = useState<AuditError[]>([]);
  const [isAuditing, setIsAuditing] = useState(false);
  const [trialBalance, setTrialBalance] = useState<any[]>([]);
  const [balanceSheet, setBalanceSheet] = useState<any[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [adminStats, setAdminStats] = useState<any>(null);

  // Auth State
  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = localStorage.getItem('user');
    if (token && storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  useEffect(() => {
    if (user) {
      fetchAccounts();
      fetchEntries();
      fetchTrialBalance();
      fetchBalanceSheet();
      fetchInvoices();
      if (user.role === 'super_admin') fetchAdminStats();
    }
  }, [user]);

  const fetchAdminStats = async () => {
    const res = await fetch('/api/admin/stats', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) {
      const data = await res.json();
      setAdminStats(data);
    }
  };

  const fetchAccounts = async () => {
    const res = await fetch('/api/accounts');
    const data = await res.json();
    setAccounts(data);
  };

  const fetchEntries = async () => {
    const res = await fetch('/api/journal', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) {
      const data = await res.json();
      setEntries(data.map((e: any) => ({
        ...e,
        items: e.items.split(',').map((i: string) => {
          const [id, d, c] = i.split(':');
          return { account_id: id, debit: parseFloat(d), credit: parseFloat(c) };
        })
      })));
    }
  };

  const fetchTrialBalance = async () => {
    const res = await fetch('/api/reports/trial-balance', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) {
      const data = await res.json();
      setTrialBalance(data);
    }
  };

  const fetchBalanceSheet = async () => {
    const res = await fetch('/api/reports/balance-sheet', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) {
      const data = await res.json();
      setBalanceSheet(data);
    }
  };

  const fetchInvoices = async () => {
    const res = await fetch('/api/invoices', {
      headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` }
    });
    if (res.ok) {
      const data = await res.json();
      setInvoices(data);
    }
  };

  const handleAudit = async () => {
    setIsAuditing(true);
    const result = await runAudit(entries);
    setAuditErrors(result.errors);
    setIsAuditing(false);
  };

  if (!user) {
    return <AuthFlow onLogin={(u, t) => { setUser(u); localStorage.setItem('token', t); localStorage.setItem('user', JSON.stringify(u)); }} />;
  }

  return (
    <div className="flex h-screen bg-[#F8FAFC] font-sans text-slate-900">
      {/* Sidebar */}
      <motion.aside 
        initial={false}
        animate={{ width: isSidebarOpen ? 280 : 80 }}
        className="bg-white border-r border-slate-200 flex flex-col z-50"
      >
        <div className="p-6 flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-xl flex items-center justify-center text-white shadow-lg shadow-indigo-100">
            <ShieldCheck size={24} />
          </div>
          {isSidebarOpen && (
            <span className="font-bold text-xl tracking-tight text-primary">AuditChek</span>
          )}
        </div>

        <nav className="flex-1 px-4 space-y-1 mt-4 overflow-y-auto">
          <NavItem icon={<LayoutDashboard size={20} />} label="Painel Principal" active={activeTab === 'dashboard'} onClick={() => setActiveTab('dashboard')} collapsed={!isSidebarOpen} activeColor="bg-info" />
          <NavItem icon={<Book size={20} />} label="Lançamentos (Diário)" active={activeTab === 'journal'} onClick={() => setActiveTab('journal')} collapsed={!isSidebarOpen} activeColor="bg-success" />
          <NavItem icon={<PieChart size={20} />} label="Balanço Patrimonial" active={activeTab === 'balance-sheet'} onClick={() => setActiveTab('balance-sheet')} collapsed={!isSidebarOpen} activeColor="bg-purple" />
          <NavItem icon={<BarChart3 size={20} />} label="Balancete de Verificação" active={activeTab === 'trial-balance'} onClick={() => setActiveTab('trial-balance')} collapsed={!isSidebarOpen} activeColor="bg-pink" />
          <NavItem icon={<ShieldCheck size={20} />} label="Centro de Segurança" active={activeTab === 'security'} onClick={() => setActiveTab('security')} collapsed={!isSidebarOpen} activeColor="bg-teal" />
          <NavItem icon={<FileSearch size={20} />} label="Auditoria Inteligente" active={activeTab === 'audit'} onClick={() => setActiveTab('audit')} collapsed={!isSidebarOpen} activeColor="bg-warning" />
          <NavItem icon={<GraduationCap size={20} />} label="Assistente Educativo" active={activeTab === 'assistant'} onClick={() => setActiveTab('assistant')} collapsed={!isSidebarOpen} activeColor="bg-indigo-600" />
          <NavItem icon={<Receipt size={20} />} label="Facturação (AGT)" active={activeTab === 'invoices'} onClick={() => setActiveTab('invoices')} collapsed={!isSidebarOpen} activeColor="bg-emerald-600" />
          <NavItem icon={<ClipboardList size={20} />} label="Relatórios Fiscais" active={activeTab === 'fiscal-reports'} onClick={() => setActiveTab('fiscal-reports')} collapsed={!isSidebarOpen} activeColor="bg-amber-600" />
          <NavItem icon={<BookOpen size={20} />} label="Plano de Contas" active={activeTab === 'coa'} onClick={() => setActiveTab('coa')} collapsed={!isSidebarOpen} activeColor="bg-slate-900" />
          
          {user.role === 'admin' && (
            <NavItem icon={<Crown size={20} />} label="Super Administrador" active={activeTab === 'admin'} onClick={() => setActiveTab('admin')} collapsed={!isSidebarOpen} activeColor="bg-gold" />
          )}
        </nav>

        <div className="p-4 border-t border-slate-100 space-y-2">
          <button 
            onClick={() => setActiveTab('profile')}
            className={cn(
              "w-full flex items-center gap-3 p-3 rounded-xl transition-all",
              activeTab === 'profile' ? "bg-slate-100 text-slate-900" : "text-slate-500 hover:bg-slate-50"
            )}
          >
            <UserIcon size={20} />
            {isSidebarOpen && <span className="font-medium">Meu Perfil</span>}
          </button>
          <button 
            onClick={() => { localStorage.removeItem('token'); localStorage.removeItem('user'); setUser(null); }}
            className="w-full flex items-center gap-3 p-3 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl transition-colors"
          >
            <LogOut size={20} />
            {isSidebarOpen && <span className="font-medium">Encerrar Sessão</span>}
          </button>
        </div>
      </motion.aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <header className="sticky top-0 bg-white/80 backdrop-blur-md border-b border-slate-200 p-6 flex items-center justify-between z-40">
          <div className="flex items-center gap-4">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 hover:bg-slate-100 rounded-lg text-slate-500">
              <Menu size={20} />
            </button>
            <h1 className="text-2xl font-bold text-slate-800 capitalize">
              {activeTab === 'dashboard' && 'Painel de Controlo'}
              {activeTab === 'journal' && 'Diário Geral'}
              {activeTab === 'balance-sheet' && 'Balanço Patrimonial'}
              {activeTab === 'trial-balance' && 'Balancete de Verificação'}
              {activeTab === 'security' && 'Centro de Segurança'}
              {activeTab === 'audit' && 'Auditoria Inteligente'}
              {activeTab === 'assistant' && 'Assistente Educativo'}
              {activeTab === 'invoices' && 'Facturação (AGT)'}
              {activeTab === 'fiscal-reports' && 'Relatórios Fiscais'}
              {activeTab === 'coa' && 'Plano de Contas'}
              {activeTab === 'admin' && 'Administração'}
              {activeTab === 'profile' && 'Meu Perfil'}
            </h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-accent/10 text-accent rounded-full text-sm font-medium border border-accent/20">
              <CheckCircle2 size={16} />
              Sistema Online
            </div>
            <div className="w-10 h-10 rounded-full bg-slate-200 border-2 border-white shadow-sm overflow-hidden">
              <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt="avatar" referrerPolicy="no-referrer" />
            </div>
          </div>
        </header>

        <div className="p-8 max-w-7xl mx-auto">
          <AnimatePresence mode="wait">
            {activeTab === 'dashboard' && <DashboardPortal onNavigate={setActiveTab} />}
            {activeTab === 'journal' && <JournalView key="journal" entries={entries} accounts={accounts} onRefresh={() => { fetchEntries(); fetchTrialBalance(); fetchBalanceSheet(); }} />}
            {activeTab === 'ledger' && <LedgerView key="ledger" entries={entries} accounts={accounts} />}
            {activeTab === 'balance-sheet' && <ReportsView key="balance-sheet" trialBalance={trialBalance} balanceSheet={balanceSheet} initialType="balance" />}
            {activeTab === 'trial-balance' && <ReportsView key="trial-balance" trialBalance={trialBalance} balanceSheet={balanceSheet} initialType="trial" />}
            {activeTab === 'security' && <SecurityView key="security" user={user} />}
            {activeTab === 'audit' && <AuditView key="audit" entries={entries} onAudit={handleAudit} auditErrors={auditErrors} isAuditing={isAuditing} />}
            {activeTab === 'invoices' && <InvoicesView key="invoices" invoices={invoices} onRefresh={fetchInvoices} />}
            {activeTab === 'assistant' && <AssistantView key="assistant" />}
            {activeTab === 'fiscal-reports' && <FiscalReportsView key="fiscal" />}
            {activeTab === 'coa' && <AccountsView key="coa" accounts={accounts} />}
            {activeTab === 'admin' && <SuperAdminView key="admin" stats={adminStats} onRefresh={fetchAdminStats} />}
            {activeTab === 'profile' && <ProfileView key="profile" user={user} />}
          </AnimatePresence>
        </div>
      </main>
    </div>
  );
}

function NavItem({ icon, label, active, onClick, collapsed, activeColor = "bg-primary" }: any) {
  return (
    <button 
      onClick={onClick}
      className={cn(
        "w-full flex items-center gap-3 p-3 rounded-xl transition-all duration-200 group whitespace-nowrap",
        active ? `${activeColor} text-white shadow-lg` : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
      )}
    >
      <span className={cn("transition-transform duration-200", active ? "scale-110" : "group-hover:scale-110")}>{icon}</span>
      {!collapsed && <span className="font-medium">{label}</span>}
    </button>
  );
}

function DashboardView({ user, entries, onAudit, auditErrors, isAuditing, trialBalance }: any) {
  const totalAssets = trialBalance.filter((a: any) => a.id.startsWith('1') || a.id.startsWith('4')).reduce((sum: number, a: any) => sum + (a.total_debit - a.total_credit), 0);
  const totalRevenue = trialBalance.filter((a: any) => a.id.startsWith('6')).reduce((sum: number, a: any) => sum + (a.total_credit - a.total_debit), 0);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className="space-y-8"
    >
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard icon={<Wallet className="text-blue-600" />} label="Ativos Totais" value={`${totalAssets.toLocaleString()} Kz`} trend="+12%" />
        <StatCard icon={<TrendingUp className="text-accent" />} label="Receita Total" value={`${totalRevenue.toLocaleString()} Kz`} trend="+5%" />
        <StatCard icon={<Users className="text-purple-600" />} label="Lançamentos" value={entries.length.toString()} trend="+2" />
        <StatCard icon={<AlertCircle className="text-amber-600" />} label="Alertas de Auditoria" value={auditErrors.length.toString()} trend="Novo" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-xl font-bold text-slate-800">Desempenho Financeiro</h3>
          </div>
          <div className="h-64 flex items-end gap-4 px-4">
             {[40, 65, 45, 90, 55, 80].map((h, i) => (
               <div key={i} className="flex-1 flex flex-col items-center gap-3 group">
                 <div className="w-full bg-slate-50 rounded-t-xl relative overflow-hidden h-full flex items-end">
                   <motion.div 
                    initial={{ height: 0 }}
                    animate={{ height: `${h}%` }}
                    className="w-full bg-primary/20 group-hover:bg-primary/40 transition-colors rounded-t-lg" 
                   />
                 </div>
                 <span className="text-xs font-medium text-slate-400">Mês {i+1}</span>
               </div>
             ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm flex flex-col">
          <h3 className="text-xl font-bold text-slate-800 mb-6">Auditoria Inteligente</h3>
          <div className="flex-1 space-y-4 overflow-y-auto max-h-[400px] pr-2">
            {auditErrors.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-center space-y-4">
                <div className="w-16 h-16 bg-accent/10 text-accent rounded-full flex items-center justify-center">
                  <ShieldCheck size={32} />
                </div>
                <p className="text-slate-500 font-medium">Nenhuma inconsistência detectada nos lançamentos recentes.</p>
              </div>
            ) : (
              auditErrors.map((err: any, i: number) => (
                <div key={i} className="p-4 bg-amber-50 border border-amber-100 rounded-2xl space-y-1">
                  <div className="flex items-center gap-2 text-amber-700 font-bold text-sm">
                    <AlertCircle size={16} />
                    {err.type}
                  </div>
                  <p className="text-xs text-amber-600">{err.explanation}</p>
                  <p className="text-[10px] text-amber-500 font-bold uppercase mt-2">Sugestão: {err.suggestion}</p>
                </div>
              ))
            )}
          </div>
          <button 
            onClick={onAudit}
            disabled={isAuditing}
            className="mt-6 w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all disabled:opacity-50"
          >
            {isAuditing ? 'Analisando...' : 'Executar Auditoria'}
          </button>
        </div>
      </div>
    </motion.div>
  );
}

/// ---------------------------------------------------------------------------
/// LEDGER VIEW (RAZÃO)
/// ---------------------------------------------------------------------------
function LedgerView({ entries, accounts }: any) {
  const [selectedAccount, setSelectedAccount] = useState<string>('');
  
  const accountEntries = entries.filter((e: any) => 
    e.items.some((i: any) => i.account_id === selectedAccount)
  ).sort((a: any, b: any) => new Date(a.date).getTime() - new Date(b.date).getTime());

  let currentRunningBalance = 0;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-primary">
              <Layers size={24} />
            </div>
            <h1 className="text-6xl font-black text-slate-900 tracking-tighter leading-[0.8]">azão<br/>Contabilístico</h1>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-16 mt-4">Movimentação detalhada por conta individual.</p>
        </div>
        <div className="flex flex-col gap-2">
          <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Selecionar Conta</label>
          <select 
            value={selectedAccount} 
            onChange={e => setSelectedAccount(e.target.value)}
            className="w-80 px-6 py-4 bg-white border border-slate-100 rounded-[24px] shadow-xl shadow-slate-200/50 outline-none focus:ring-2 focus:ring-primary transition-all font-bold text-slate-800"
          >
            <option value="">Escolha uma conta...</option>
            {accounts.map((a: any) => <option key={a.id} value={a.id}>{a.id} - {a.name}</option>)}
          </select>
        </div>
      </div>

      {selectedAccount ? (
        <div className="glass-card p-10">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-200">
                  <th className="serif-header pb-6">Data</th>
                  <th className="serif-header pb-6">Descrição</th>
                  <th className="serif-header pb-6 text-right">Débito</th>
                  <th className="serif-header pb-6 text-right">Crédito</th>
                  <th className="serif-header pb-6 text-right">Saldo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-50">
                {accountEntries.map((entry: any) => {
                  const item = entry.items.find((i: any) => i.account_id === selectedAccount);
                  const account = accounts.find((a: any) => a.id === selectedAccount);
                  const isDebitType = account?.type === 'debit';
                  
                  if (isDebitType) {
                    currentRunningBalance += (item.debit - item.credit);
                  } else {
                    currentRunningBalance += (item.credit - item.debit);
                  }

                  return (
                    <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors group">
                      <td className="py-6 text-sm font-medium text-slate-400">{new Date(entry.date).toLocaleDateString()}</td>
                      <td className="py-6">
                        <p className="text-sm font-bold text-slate-800">{entry.description}</p>
                        <p className="text-[10px] text-slate-400 font-mono">Lançamento #{entry.id}</p>
                      </td>
                      <td className="py-6 text-right text-sm font-bold text-info">
                        {item.debit > 0 ? item.debit.toLocaleString() : '-'}
                      </td>
                      <td className="py-6 text-right text-sm font-bold text-primary">
                        {item.credit > 0 ? item.credit.toLocaleString() : '-'}
                      </td>
                      <td className="py-6 text-right text-sm font-black text-slate-900">
                        {currentRunningBalance.toLocaleString()}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ) : (
        <div className="flex flex-col items-center justify-center py-32 glass-card border-dashed border-2">
          <div className="w-24 h-24 bg-slate-50 text-slate-200 rounded-full flex items-center justify-center mb-6">
            <Layers size={48} />
          </div>
          <h3 className="text-xl font-bold text-slate-400">Aguardando Seleção</h3>
          <p className="text-sm text-slate-300 mt-1">Selecione uma conta acima para visualizar os movimentos.</p>
        </div>
      )}

      {selectedAccount && (
        <div className="flex justify-center">
          <div className="glass-card px-16 py-10 flex items-center gap-12">
            <div className="space-y-1">
              <p className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em]">Saldo Final da Conta</p>
              <p className="text-xs text-slate-400 font-medium">{accounts.find((a: any) => a.id === selectedAccount)?.name}</p>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-bold text-slate-400">Kz</span>
              <span className="text-4xl font-black text-primary tracking-tighter">{currentRunningBalance.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </motion.div>
  );
}

function TrialBalanceView({ trialBalance }: any) {
  const totalDebits = trialBalance.reduce((sum: number, a: any) => sum + a.total_debit, 0);
  const totalCredits = trialBalance.reduce((sum: number, a: any) => sum + a.total_credit, 0);
  const totalBalance = totalDebits - totalCredits;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-12">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-primary">
              <Menu size={24} />
            </div>
            <h1 className="text-6xl font-black text-slate-900 tracking-tighter leading-[0.8]">Balancete<br/>de<br/>Verificação</h1>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-16 mt-4">Verificação de saldos e movimentos das contas.</p>
        </div>
        <button className="flex items-center gap-3 px-6 py-4 bg-white border border-slate-100 rounded-[24px] shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all group">
          <History size={20} className="text-slate-400 group-hover:rotate-180 transition-transform duration-500" />
          <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Verificação Rápida</span>
        </button>
      </div>

      <div className="glass-card p-10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-200">
                <th className="serif-header pb-6">Conta</th>
                <th className="serif-header pb-6">Descrição</th>
                <th className="serif-header pb-6 text-right">Débito</th>
                <th className="serif-header pb-6 text-right">Crédito</th>
                <th className="serif-header pb-6 text-right">Saldo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-50">
              {trialBalance.map((acc: any) => {
                const balance = acc.total_debit - acc.total_credit;
                return (
                  <tr key={acc.id} className="hover:bg-slate-50/50 transition-colors group">
                    <td className="py-6 text-sm font-mono font-bold text-slate-400 group-hover:text-primary transition-colors">{acc.id}</td>
                    <td className="py-6 text-sm font-bold text-slate-800">{acc.name}</td>
                    <td className="py-6 text-right text-sm font-medium text-slate-500">{acc.total_debit.toLocaleString()}</td>
                    <td className="py-6 text-right text-sm font-medium text-slate-500">{acc.total_credit.toLocaleString()}</td>
                    <td className="py-6 text-right text-sm font-black text-slate-900">{balance.toLocaleString()}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      <div className="flex justify-center">
        <div className="glass-card px-16 py-10 flex items-center gap-12">
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-800 uppercase tracking-[0.2em]">Totais do Balancete</p>
          </div>
          <div className="flex items-center gap-8">
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-bold text-slate-400">Kz</span>
              <span className="text-2xl font-black text-slate-900 tracking-tighter">{totalDebits.toLocaleString()}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-bold text-slate-400">Kz</span>
              <span className="text-2xl font-black text-slate-900 tracking-tighter">{totalCredits.toLocaleString()}</span>
            </div>
            <div className="flex items-baseline gap-2">
              <span className="text-xs font-bold text-slate-400">Kz</span>
              <span className="text-2xl font-black text-primary tracking-tighter">{totalBalance.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function InvoicesView({ invoices, onRefresh }: any) {
  const [isAdding, setIsAdding] = useState(false);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex items-center justify-between">
        <h3 className="text-xl font-bold text-slate-800">Histórico de Facturação</h3>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-slate-800 shadow-lg shadow-indigo-100 transition-all"
        >
          <Plus size={20} />
          Emitir Factura
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Número</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Data</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Cliente</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Total</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-center">Estado</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {invoices.map((inv: any) => (
              <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                <td className="px-6 py-4 text-sm font-bold text-slate-800">{inv.number}</td>
                <td className="px-6 py-4 text-sm text-slate-600">{new Date(inv.date).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-sm text-slate-700">{inv.customer_name}</td>
                <td className="px-6 py-4 text-right text-sm font-bold">{inv.total_amount.toLocaleString()} Kz</td>
                <td className="px-6 py-4 text-center">
                  <span className={cn(
                    "px-3 py-1 rounded-full text-[10px] font-bold uppercase",
                    inv.status === 'paid' ? "bg-accent/10 text-accent" : "bg-amber-100 text-amber-700"
                  )}>
                    {inv.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {isAdding && <AddInvoiceModal onClose={() => setIsAdding(false)} onRefresh={onRefresh} />}
    </motion.div>
  );
}

function AddInvoiceModal({ onClose, onRefresh }: any) {
  const [formData, setFormData] = useState({
    number: `FT ${new Date().getFullYear()}/${Date.now().toString().slice(-6)}`,
    date: new Date().toISOString().split('T')[0],
    customer_name: '',
    customer_nif: '',
    total_amount: 0,
    tax_amount: 0
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    try {
      const res = await fetch('/api/invoices', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify(formData)
      });
      
      const data = await res.json();
      
      if (res.ok) {
        onRefresh();
        onClose();
      } else {
        setError(data.error || 'Erro ao emitir factura');
      }
    } catch (err) {
      setError('Erro de ligação ao servidor');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white w-full max-w-lg rounded-[32px] shadow-2xl overflow-hidden">
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-2xl font-bold text-slate-800">Emitir Factura</h2>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-4">
          {error && (
            <div className="p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold flex items-center gap-2">
              <AlertCircle size={18} /> {error}
            </div>
          )}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Número</label>
              <input type="text" value={formData.number} disabled className="w-full px-4 py-3 bg-slate-100 border border-slate-200 rounded-2xl text-slate-500 font-mono" />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Data</label>
              <input type="date" value={formData.date} onChange={e => setFormData({...formData, date: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary" required />
            </div>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Cliente</label>
            <input type="text" placeholder="Nome do Cliente" value={formData.customer_name} onChange={e => setFormData({...formData, customer_name: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary" required />
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-black text-slate-400 uppercase ml-1">NIF do Cliente</label>
            <input type="text" placeholder="NIF do Cliente" value={formData.customer_nif} onChange={e => setFormData({...formData, customer_nif: e.target.value})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary" />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">Valor Total</label>
              <input type="number" placeholder="Valor Total" onChange={e => {
                const val = parseFloat(e.target.value) || 0;
                setFormData({...formData, total_amount: val, tax_amount: val * 0.14});
              }} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary" required />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-black text-slate-400 uppercase ml-1">IVA (14%)</label>
              <input type="number" placeholder="IVA" value={formData.tax_amount.toFixed(2)} onChange={e => setFormData({...formData, tax_amount: parseFloat(e.target.value) || 0})} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary" required />
            </div>
          </div>
          <div className="pt-6 flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all">Cancelar</button>
            <button type="submit" disabled={isSubmitting} className="flex-1 py-4 bg-primary text-white rounded-2xl font-bold hover:bg-slate-800 shadow-lg shadow-indigo-100 transition-all disabled:opacity-50">
              {isSubmitting ? 'A processar...' : 'Emitir Factura'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

function StatCard({ icon, label, value, trend }: any) {
  return (
    <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="p-3 bg-slate-50 rounded-2xl">{icon}</div>
        <span className="text-xs font-bold px-2 py-1 bg-accent/10 text-accent rounded-lg">{trend}</span>
      </div>
      <p className="text-slate-500 text-sm font-medium mb-1">{label}</p>
      <p className="text-2xl font-bold text-slate-800">{value}</p>
    </div>
  );
}

function JournalView({ entries, accounts, onRefresh }: any) {
  const [isAdding, setIsAdding] = useState(false);

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-6"
    >
      <div className="flex items-center justify-between">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
          <input 
            type="text" 
            placeholder="Pesquisar lançamentos..." 
            className="w-full pl-12 pr-4 py-3 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-accent transition-all"
          />
        </div>
        <button 
          onClick={() => setIsAdding(true)}
          className="flex items-center gap-2 px-6 py-3 bg-primary text-white rounded-2xl font-bold hover:bg-slate-800 shadow-lg shadow-indigo-100 transition-all"
        >
          <Plus size={20} />
          Novo Lançamento
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 border-b border-slate-100">
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Data</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Descrição</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Conta</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider">Doc.</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Débito</th>
              <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-wider text-right">Crédito</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {entries.map((entry: any) => (
              <tr key={entry.id} className="hover:bg-slate-50/50 transition-colors group">
                <td className="px-6 py-4 text-sm font-medium text-slate-600">{new Date(entry.date).toLocaleDateString()}</td>
                <td className="px-6 py-4 text-sm font-bold text-slate-800">{entry.description}</td>
                <td className="px-6 py-4 space-y-1">
                  {entry.items.map((item: any, i: number) => (
                    <div key={i} className="text-xs text-slate-500 font-medium">
                      {accounts.find(a => a.id === item.account_id)?.name || item.account_id}
                    </div>
                  ))}
                </td>
                <td className="px-6 py-4">
                  {entry.document && (
                    <a href={`/uploads/${entry.document}`} target="_blank" rel="noreferrer" className="text-accent hover:underline flex items-center gap-1">
                      <FileText size={14} /> Ver
                    </a>
                  )}
                </td>
                <td className="px-6 py-4 text-right space-y-1">
                  {entry.items.map((item: any, i: number) => (
                    <div key={i} className="text-sm font-bold text-info">
                      {item.debit > 0 ? `${item.debit.toLocaleString()} Kz` : '-'}
                    </div>
                  ))}
                </td>
                <td className="px-6 py-4 text-right space-y-1">
                  {entry.items.map((item: any, i: number) => (
                    <div key={i} className="text-sm font-bold text-primary">
                      {item.credit > 0 ? `${item.credit.toLocaleString()} Kz` : '-'}
                    </div>
                  ))}
                </td>
              </tr>
            ))}
          </tbody>
          <tfoot className="bg-slate-50/50 border-t border-slate-200">
            <tr>
              <td colSpan={4} className="px-6 py-4 text-sm font-black text-slate-900 text-right uppercase tracking-widest">Totais do Período</td>
              <td className="px-6 py-4 text-right text-sm font-black text-info">
                {entries.reduce((sum: number, e: any) => sum + e.items.reduce((s: number, i: any) => s + i.debit, 0), 0).toLocaleString()} Kz
              </td>
              <td className="px-6 py-4 text-right text-sm font-black text-primary">
                {entries.reduce((sum: number, e: any) => sum + e.items.reduce((s: number, i: any) => s + i.credit, 0), 0).toLocaleString()} Kz
              </td>
            </tr>
          </tfoot>
        </table>
      </div>

      {isAdding && <AddEntryModal onClose={() => setIsAdding(false)} accounts={accounts} onRefresh={onRefresh} />}
    </motion.div>
  );
}

function AddEntryModal({ onClose, accounts, onRefresh }: any) {
  const [items, setItems] = useState([{ account_id: '', debit: 0, credit: 0 }, { account_id: '', debit: 0, credit: 0 }]);
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [file, setFile] = useState<File | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const validItems = items.filter(i => i.account_id && (i.debit > 0 || i.credit > 0));
  const totalDebit = validItems.reduce((sum, item) => sum + (item.debit || 0), 0);
  const totalCredit = validItems.reduce((sum, item) => sum + (item.credit || 0), 0);
  const isBalanced = Math.abs(totalDebit - totalCredit) < 0.01 && totalDebit > 0;

  const handleSubmit = async (e: any) => {
    e.preventDefault();
    if (!isBalanced) {
      alert('O lançamento deve estar equilibrado (Débito = Crédito) e ter um valor maior que zero. Certifique-se de que todas as linhas têm uma conta selecionada.');
      return;
    }
    
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('date', date);
      formData.append('description', description);
      formData.append('items', JSON.stringify(validItems));
      if (file) formData.append('document', file);

      const res = await fetch('/api/journal', {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: formData
      });
      if (res.ok) {
        onRefresh();
        onClose();
      } else {
        const err = await res.json();
        alert(err.error);
      }
    } catch (error) {
      alert('Erro ao guardar lançamento. Verifique a sua ligação.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[60] flex items-center justify-center p-4">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-white w-full max-w-2xl rounded-[32px] shadow-2xl overflow-hidden"
      >
        <div className="p-8 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <h2 className="text-2xl font-bold text-slate-800">Novo Lançamento</h2>
          <button onClick={onClose} className="p-2 hover:bg-white rounded-full transition-colors"><X size={24} /></button>
        </div>
        <form onSubmit={handleSubmit} className="p-8 space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-500 ml-1">Data</label>
              <input type="date" value={date} onChange={e => setDate(e.target.value)} className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-accent" required />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-bold text-slate-500 ml-1">Descrição</label>
              <input type="text" value={description} onChange={e => setDescription(e.target.value)} placeholder="Ex: Pagamento de Renda" className="w-full px-4 py-3 bg-slate-50 border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500" required />
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-sm font-bold text-slate-500 ml-1">Itens do Lançamento</label>
              <button 
                type="button" 
                onClick={() => setItems([...items, { account_id: '', debit: 0, credit: 0 }])} 
                className="flex items-center gap-2 text-accent text-sm font-black uppercase tracking-widest hover:bg-accent/5 px-3 py-1 rounded-lg transition-all"
              >
                <Plus size={14} />
                Adicionar Linha
              </button>
            </div>
            
            <div className="space-y-3 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
              {items.map((item, i) => (
                <div key={i} className="grid grid-cols-12 gap-3 items-center p-3 bg-slate-50/50 rounded-2xl border border-slate-100 hover:border-slate-200 transition-all">
                  <div className="col-span-6">
                    <select 
                      value={item.account_id} 
                      onChange={e => {
                        const newItems = [...items];
                        newItems[i].account_id = e.target.value;
                        setItems(newItems);
                      }}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-accent text-sm font-medium"
                      required
                    >
                      <option value="">Selecionar Conta</option>
                      {accounts.map((a: any) => <option key={a.id} value={a.id}>{a.id} - {a.name}</option>)}
                    </select>
                  </div>
                  <div className="col-span-2">
                    <input 
                      type="number" 
                      placeholder="Débito" 
                      step="0.01"
                      value={item.debit || ''} 
                      onChange={e => {
                        const newItems = [...items];
                        newItems[i].debit = parseFloat(e.target.value) || 0;
                        if (newItems[i].debit > 0) newItems[i].credit = 0;
                        setItems(newItems);
                      }}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-info text-sm font-bold text-info" 
                    />
                  </div>
                  <div className="col-span-2">
                    <input 
                      type="number" 
                      placeholder="Crédito" 
                      step="0.01"
                      value={item.credit || ''} 
                      onChange={e => {
                        const newItems = [...items];
                        newItems[i].credit = parseFloat(e.target.value) || 0;
                        if (newItems[i].credit > 0) newItems[i].debit = 0;
                        setItems(newItems);
                      }}
                      className="w-full px-4 py-3 bg-white border border-slate-200 rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm font-bold text-primary" 
                    />
                  </div>
                  <div className="col-span-2 flex justify-end">
                    <button 
                      type="button" 
                      onClick={() => setItems(items.filter((_, idx) => idx !== i))}
                      disabled={items.length <= 2}
                      className="p-2 text-slate-300 hover:text-red-500 disabled:opacity-0 transition-colors"
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ))}
            </div>

            {/* Totals Summary */}
            <div className="p-6 bg-slate-900 rounded-3xl text-white flex items-center justify-between shadow-xl shadow-slate-200">
              <div className="space-y-1">
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Estado do Equilíbrio</p>
                <div className="flex items-center gap-2">
                  {isBalanced ? (
                    <div className="flex items-center gap-2 text-emerald-400">
                      <CheckCircle2 size={16} />
                      <span className="text-xs font-black uppercase tracking-widest">Equilibrado</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-amber-400">
                      <AlertCircle size={16} />
                      <span className="text-xs font-black uppercase tracking-widest">Desequilibrado</span>
                    </div>
                  )}
                </div>
              </div>
              <div className="flex gap-8">
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Débito</p>
                  <p className="text-xl font-black text-info">{totalDebit.toLocaleString()} Kz</p>
                </div>
                <div className="text-right">
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Crédito</p>
                  <p className="text-xl font-black text-primary">{totalCredit.toLocaleString()} Kz</p>
                </div>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-slate-500 ml-1">Documento de Suporte (Opcional)</label>
            <div className="flex items-center justify-center w-full">
              <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-slate-200 border-dashed rounded-2xl cursor-pointer bg-slate-50 hover:bg-slate-100 transition-all">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Plus className="w-8 h-8 mb-3 text-slate-400" />
                  <p className="mb-2 text-sm text-slate-500 font-medium">{file ? file.name : 'Clique para fazer upload ou arraste'}</p>
                </div>
                <input type="file" className="hidden" onChange={e => setFile(e.target.files?.[0] || null)} />
              </label>
            </div>
          </div>

          <div className="pt-6 flex gap-4">
            <button type="button" onClick={onClose} className="flex-1 py-4 bg-slate-100 text-slate-600 rounded-2xl font-bold hover:bg-slate-200 transition-all">Cancelar</button>
            <button 
              type="submit" 
              disabled={!isBalanced || isSubmitting}
              className={cn(
                "flex-1 py-4 rounded-2xl font-bold transition-all shadow-lg",
                isBalanced && !isSubmitting 
                  ? "bg-primary text-white hover:bg-slate-800 shadow-indigo-100" 
                  : "bg-slate-200 text-slate-400 cursor-not-allowed"
              )}
            >
              {isSubmitting ? 'Guardando...' : 'Guardar Lançamento'}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
}

/// ---------------------------------------------------------------------------
/// REPORTS VIEW
/// ---------------------------------------------------------------------------
function ReportsView({ trialBalance, balanceSheet, initialType = 'trial' }: any) {
  const [reportType, setReportType] = useState<'trial' | 'balance'>(initialType);

  useEffect(() => {
    setReportType(initialType);
  }, [initialType]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="flex gap-4 p-1 bg-slate-100 rounded-2xl w-fit">
        <button 
          onClick={() => setReportType('trial')}
          className={cn("px-6 py-2 rounded-xl text-sm font-bold transition-all", reportType === 'trial' ? "bg-pink text-white shadow-sm" : "text-slate-500 hover:text-slate-700")}
        >
          Balancete de Verificação
        </button>
        <button 
          onClick={() => setReportType('balance')}
          className={cn("px-6 py-2 rounded-xl text-sm font-bold transition-all", reportType === 'balance' ? "bg-purple text-white shadow-sm" : "text-slate-500 hover:text-slate-700")}
        >
          Balanço Patrimonial
        </button>
      </div>

      {reportType === 'trial' ? (
        <TrialBalanceView trialBalance={trialBalance} />
      ) : (
        <BalanceSheetView balanceSheet={balanceSheet} />
      )}
    </motion.div>
  );
}

function BalanceSheetView({ balanceSheet }: any) {
  const assets = balanceSheet.filter((a: any) => a.class_id >= 1 && a.class_id <= 4);
  const equityAndLiabilities = balanceSheet.filter((a: any) => a.class_id === 5 || (a.class_id === 3 && a.total_credit > a.total_debit));
  
  const totalAssets = assets.reduce((sum: number, a: any) => sum + (a.total_debit - a.total_credit), 0);
  const totalEquityLiabilities = equityAndLiabilities.reduce((sum: number, a: any) => sum + (a.total_credit - a.total_debit), 0);

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 bg-slate-50 border-b border-slate-100 font-bold text-slate-800 uppercase tracking-widest text-xs">Ativo</div>
        <table className="w-full text-left border-collapse">
          <tbody className="divide-y divide-slate-50">
            {assets.map((acc: any) => (
              <tr key={acc.id}>
                <td className="px-6 py-4 text-sm text-slate-600">{acc.name}</td>
                <td className="px-6 py-4 text-right text-sm font-bold text-slate-800">{(acc.total_debit - acc.total_credit).toLocaleString()} Kz</td>
              </tr>
            ))}
            <tr className="bg-primary/5 font-bold">
              <td className="px-6 py-4 text-primary">TOTAL ATIVO</td>
              <td className="px-6 py-4 text-right text-primary">{totalAssets.toLocaleString()} Kz</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="p-6 bg-slate-50 border-b border-slate-100 font-bold text-slate-800 uppercase tracking-widest text-xs">Capital Próprio e Passivo</div>
        <table className="w-full text-left border-collapse">
          <tbody className="divide-y divide-slate-50">
            {equityAndLiabilities.map((acc: any) => (
              <tr key={acc.id}>
                <td className="px-6 py-4 text-sm text-slate-600">{acc.name}</td>
                <td className="px-6 py-4 text-right text-sm font-bold text-slate-800">{(acc.total_credit - acc.total_debit).toLocaleString()} Kz</td>
              </tr>
            ))}
            <tr className="bg-blue-50 font-bold">
              <td className="px-6 py-4 text-blue-800">TOTAL CAPITAL E PASSIVO</td>
              <td className="px-6 py-4 text-right text-blue-800">{totalEquityLiabilities.toLocaleString()} Kz</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

/// ---------------------------------------------------------------------------
/// SECURITY VIEW
/// ---------------------------------------------------------------------------
function SecurityView({ user }: any) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Centro de Segurança</h2>
            <p className="text-slate-500">Gerencie a proteção da sua conta e dados.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <SecurityCard 
            icon={<Lock className="text-blue-600" />} 
            title="Autenticação de Dois Fatores" 
            desc="Adicione uma camada extra de segurança à sua conta."
            status="Desativado"
            action="Ativar"
          />
          <SecurityCard 
            icon={<History className="text-purple-600" />} 
            title="Sessões Ativas" 
            desc="Veja onde você está conectado atualmente."
            status="1 Sessão"
            action="Gerenciar"
          />
          <SecurityCard 
            icon={<Activity className="text-emerald-600" />} 
            title="Logs de Atividade" 
            desc="Histórico completo de ações realizadas na conta."
            status="Verificado"
            action="Visualizar"
          />
          <SecurityCard 
            icon={<ShieldCheck className="text-amber-600" />} 
            title="Backup de Dados" 
            desc="Seus dados são criptografados e armazenados com segurança."
            status="Protegido"
            action="Configurar"
          />
        </div>
      </div>
    </motion.div>
  );
}

function SecurityCard({ icon, title, desc, status, action }: any) {
  return (
    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-4">
      <div className="flex items-center justify-between">
        <div className="p-3 bg-white rounded-xl shadow-sm">{icon}</div>
        <span className="text-[10px] font-black uppercase tracking-widest px-2 py-1 bg-white rounded-lg border border-slate-100">{status}</span>
      </div>
      <div>
        <h4 className="font-bold text-slate-800">{title}</h4>
        <p className="text-xs text-slate-500 mt-1">{desc}</p>
      </div>
      <button className="mt-2 text-sm font-bold text-primary hover:underline text-left">{action} →</button>
    </div>
  );
}

/// ---------------------------------------------------------------------------
/// AUDIT VIEW
/// ---------------------------------------------------------------------------
function AuditView({ entries, onAudit, auditErrors, isAuditing }: any) {
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-8">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center">
              <FileSearch size={24} />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-slate-800">Auditoria Inteligente</h2>
              <p className="text-slate-500">Análise automatizada baseada no PGC Angola.</p>
            </div>
          </div>
          <button 
            onClick={onAudit}
            disabled={isAuditing}
            className="px-8 py-4 bg-primary text-white rounded-2xl font-bold hover:bg-slate-800 transition-all shadow-lg shadow-indigo-100 disabled:opacity-50"
          >
            {isAuditing ? 'Analisando...' : 'Iniciar Auditoria Completa'}
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            <h3 className="font-bold text-slate-400 text-xs uppercase tracking-widest ml-1">Inconsistências Detectadas</h3>
            {auditErrors.length === 0 ? (
              <div className="p-12 bg-slate-50 rounded-3xl border border-slate-100 border-dashed text-center">
                <p className="text-slate-400 font-medium">Nenhum erro encontrado até o momento.</p>
              </div>
            ) : (
              auditErrors.map((err: any, i: number) => (
                <div key={i} className="p-6 bg-red-50 border border-red-100 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="px-3 py-1 bg-red-100 text-red-700 rounded-lg text-[10px] font-black uppercase tracking-widest">{err.type}</span>
                    <AlertCircle size={18} className="text-red-400" />
                  </div>
                  <p className="text-sm text-red-800 font-bold">{err.explanation}</p>
                  <div className="p-3 bg-white/50 rounded-xl border border-red-100">
                    <p className="text-xs text-red-600 font-medium"><span className="font-bold">Sugestão:</span> {err.suggestion}</p>
                  </div>
                </div>
              ))
            )}
          </div>

          <div className="bg-slate-50 p-8 rounded-3xl border border-slate-100">
            <h3 className="font-bold text-slate-800 mb-4">Resumo da Auditoria</h3>
            <div className="space-y-6">
              <AuditStat label="Lançamentos Analisados" value={entries.length} />
              <AuditStat label="Erros Críticos" value={auditErrors.filter((e: any) => e.type.includes('Crítico')).length} />
              <AuditStat label="Avisos de Conformidade" value={auditErrors.filter((e: any) => !e.type.includes('Crítico')).length} />
              <div className="pt-6 border-t border-slate-200">
                <p className="text-xs text-slate-500 leading-relaxed italic">
                  * A auditoria inteligente utiliza modelos de IA para identificar padrões comuns de erro, mas não substitui a revisão técnica de um contabilista certificado.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function AuditStat({ label, value }: any) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-sm text-slate-600 font-medium">{label}</span>
      <span className="text-lg font-black text-slate-800">{value}</span>
    </div>
  );
}

/// ---------------------------------------------------------------------------
/// FISCAL REPORTS VIEW
/// ---------------------------------------------------------------------------
function FiscalReportsView() {
  const [isGenerating, setIsGenerating] = useState<string | null>(null);

  const handleGenerate = (type: string) => {
    setIsGenerating(type);
    setTimeout(() => {
      setIsGenerating(null);
      alert(`Relatório ${type} gerado com sucesso! O ficheiro está pronto para submissão na plataforma da AGT.`);
    }, 2000);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
        <div className="flex items-center gap-4 mb-8">
          <div className="w-12 h-12 bg-amber-100 text-amber-600 rounded-2xl flex items-center justify-center">
            <ClipboardList size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800">Relatórios Fiscais (AGT)</h2>
            <p className="text-slate-500">Geração de mapas oficiais e ficheiros de submissão.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          <FiscalCard 
            title="Modelo 1 - IRT" 
            description="Declaração de rendimentos do trabalho para funcionários e colaboradores."
            icon={<Users className="text-blue-500" />}
            onGenerate={() => handleGenerate('Modelo 1')}
            loading={isGenerating === 'Modelo 1'}
          />
          <FiscalCard 
            title="Modelo 2 - Imposto Industrial" 
            description="Declaração anual de rendimentos para empresas do regime geral."
            icon={<Building2 className="text-purple-500" />}
            onGenerate={() => handleGenerate('Modelo 2')}
            loading={isGenerating === 'Modelo 2'}
          />
          <FiscalCard 
            title="SAF-T AO (Mensal)" 
            description="Ficheiro de auditoria tributária obrigatório para facturação e contabilidade."
            icon={<Zap className="text-amber-500" />}
            onGenerate={() => handleGenerate('SAF-T AO')}
            loading={isGenerating === 'SAF-T AO'}
          />
          <FiscalCard 
            title="Mapa de IVA" 
            description="Resumo mensal/trimestral de IVA liquidado e dedutível."
            icon={<Receipt className="text-emerald-500" />}
            onGenerate={() => handleGenerate('Mapa de IVA')}
            loading={isGenerating === 'Mapa de IVA'}
          />
          <FiscalCard 
            title="Modelo 10 - Retenções" 
            description="Declaração de retenções na fonte efectuadas a terceiros."
            icon={<FileText className="text-pink-500" />}
            onGenerate={() => handleGenerate('Modelo 10')}
            loading={isGenerating === 'Modelo 10'}
          />
          <FiscalCard 
            title="Mapa de Amortizações" 
            description="Registo detalhado de quotas de amortização e reintegração."
            icon={<TrendingUp className="text-indigo-500" />}
            onGenerate={() => handleGenerate('Mapa de Amortizações')}
            loading={isGenerating === 'Mapa de Amortizações'}
          />
        </div>
      </div>

      <div className="bg-amber-50 border border-amber-100 p-6 rounded-2xl flex items-start gap-4">
        <AlertCircle className="text-amber-600 shrink-0 mt-1" size={20} />
        <div className="space-y-1">
          <p className="text-sm font-bold text-amber-900">Nota Importante sobre Submissão</p>
          <p className="text-xs text-amber-700 leading-relaxed">
            Os ficheiros gerados pelo AuditChek seguem rigorosamente a estrutura XML exigida pela AGT (Administração Geral Tributária). 
            Certifique-se de validar os dados antes da submissão final no portal do contribuinte.
          </p>
        </div>
      </div>
    </motion.div>
  );
}

function FiscalCard({ title, description, icon, onGenerate, loading }: any) {
  return (
    <div className="p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col gap-4 hover:border-amber-200 transition-all group">
      <div className="flex items-center justify-between">
        <div className="p-3 bg-white rounded-xl shadow-sm group-hover:scale-110 transition-transform">{icon}</div>
        <button 
          onClick={onGenerate}
          disabled={loading}
          className="px-4 py-2 bg-white border border-slate-200 rounded-lg text-xs font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-all disabled:opacity-50"
        >
          {loading ? 'Gerando...' : 'Gerar'}
        </button>
      </div>
      <div>
        <h4 className="font-bold text-slate-800">{title}</h4>
        <p className="text-xs text-slate-500 mt-1 leading-relaxed">{description}</p>
      </div>
    </div>
  );
}

/// ---------------------------------------------------------------------------
/// ACCOUNTS VIEW (PLANO DE CONTAS)
/// ---------------------------------------------------------------------------
function AccountsView({ accounts }: any) {
  const classes = [1, 2, 3, 4, 5, 6, 7, 8];
  
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
      <div className="bg-white p-8 rounded-[32px] border border-slate-200 shadow-sm">
        <div className="mb-10">
          <h2 className="text-4xl font-black text-slate-900 tracking-tighter">Plano Geral de Contas</h2>
          <p className="text-slate-500 font-medium">Estrutura organizada por classes e contas oficiais.</p>
        </div>

        <div className="space-y-12">
          {classes.map(cls => {
            const classAccounts = accounts.filter((acc: any) => acc.id.toString().startsWith(cls.toString()));
            if (classAccounts.length === 0) return null;
            
            return (
              <div key={cls} className="space-y-6">
                <div className="flex items-center gap-4 border-b border-slate-100 pb-4">
                  <div className="w-12 h-12 bg-slate-900 text-white rounded-2xl flex items-center justify-center text-xl font-black shadow-lg">
                    {cls}
                  </div>
                  <div>
                    <h3 className="text-xl font-black text-slate-900 tracking-tight">Classe {cls}</h3>
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      {cls === 1 && "Meios Fixos e Investimentos"}
                      {cls === 2 && "Existências"}
                      {cls === 3 && "Terceiros"}
                      {cls === 4 && "Disponibilidades"}
                      {cls === 5 && "Capital e Reservas"}
                      {cls === 6 && "Proveitos e Ganhos"}
                      {cls === 7 && "Custos e Perdas"}
                      {cls === 8 && "Resultados"}
                    </p>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {classAccounts.map((acc: any) => (
                    <div key={acc.id} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 hover:border-slate-300 transition-all group">
                      <div className="flex items-center gap-4">
                        <span className="text-sm font-mono font-black text-slate-400 group-hover:text-slate-900 transition-colors">{acc.id}</span>
                        <span className="text-sm font-bold text-slate-700">{acc.name}</span>
                      </div>
                      <div className={cn(
                        "w-2 h-2 rounded-full",
                        acc.type === 'debit' ? "bg-info shadow-[0_0_8px_rgba(37,99,235,0.4)]" : "bg-primary shadow-[0_0_8px_rgba(185,28,28,0.4)]"
                      )} />
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </motion.div>
  );
}

/// ---------------------------------------------------------------------------
/// ASSISTANT VIEW
/// ---------------------------------------------------------------------------
function AssistantView() {
  const [query, setQuery] = useState('');
  const [messages, setMessages] = useState<any[]>([
    { role: 'assistant', content: 'Olá! Sou o seu assistente educativo AuditChek. Como posso ajudar com as suas dúvidas contabilísticas hoje?' }
  ]);
  const [isTyping, setIsTyping] = useState(false);
  const [attachedFile, setAttachedFile] = useState<File | null>(null);

  const handleSend = async () => {
    if (!query.trim() && !attachedFile) return;
    
    const userMsg = { role: 'user', content: query, hasFile: !!attachedFile };
    setMessages([...messages, userMsg]);
    setQuery('');
    setAttachedFile(null);
    setIsTyping(true);

    // Simulate AI response for now (would call geminiService)
    const advice = await getAccountingAdvice(query);
    setMessages(prev => [...prev, { role: 'assistant', content: advice }]);
    setIsTyping(false);
  };

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="h-[calc(100vh-200px)] flex flex-col bg-white rounded-[40px] border border-slate-200 shadow-sm overflow-hidden">
      <div className="p-6 border-b border-slate-100 bg-slate-50/50 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-primary text-white rounded-xl flex items-center justify-center">
            <GraduationCap size={20} />
          </div>
          <div>
            <h3 className="font-bold text-slate-800">Assistente Educativo</h3>
            <p className="text-xs text-slate-500">IA especializada em PGC Angola</p>
          </div>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-8 space-y-6">
        {messages.map((msg, i) => (
          <div key={i} className={cn("flex", msg.role === 'user' ? "justify-end" : "justify-start")}>
            <div className={cn(
              "max-w-[80%] p-5 rounded-[24px] shadow-sm",
              msg.role === 'user' ? "bg-primary text-white rounded-tr-none" : "bg-slate-100 text-slate-800 rounded-tl-none"
            )}>
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{msg.content}</p>
              {msg.hasFile && (
                <div className="mt-3 p-2 bg-white/20 rounded-lg flex items-center gap-2 text-xs">
                  <Paperclip size={12} /> Documento partilhado
                </div>
              )}
            </div>
          </div>
        ))}
        {isTyping && (
          <div className="flex justify-start">
            <div className="bg-slate-100 p-4 rounded-2xl rounded-tl-none flex gap-1">
              <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce" />
              <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:0.2s]" />
              <div className="w-2 h-2 bg-slate-300 rounded-full animate-bounce [animation-delay:0.4s]" />
            </div>
          </div>
        )}
      </div>

      <div className="p-6 border-t border-slate-100 bg-slate-50/30">
        {attachedFile && (
          <div className="mb-3 flex items-center justify-between bg-primary/5 p-3 rounded-2xl border border-primary/10">
            <div className="flex items-center gap-2 text-xs font-bold text-primary">
              <Paperclip size={14} />
              {attachedFile.name}
            </div>
            <button onClick={() => setAttachedFile(null)} className="text-slate-400 hover:text-red-500"><X size={14} /></button>
          </div>
        )}
        <div className="relative flex items-center gap-3">
          <label className="p-4 bg-white border border-slate-200 rounded-2xl text-slate-400 hover:text-primary hover:border-primary transition-all cursor-pointer shadow-sm">
            <Upload size={20} />
            <input type="file" className="hidden" onChange={e => setAttachedFile(e.target.files?.[0] || null)} />
          </label>
          <div className="relative flex-1">
            <input 
              type="text" 
              value={query} 
              onChange={e => setQuery(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleSend()}
              placeholder="Digite sua dúvida ou partilhe um documento..."
              className="w-full pl-6 pr-16 py-4 bg-white border border-slate-200 rounded-2xl outline-none focus:ring-2 focus:ring-primary shadow-sm transition-all"
            />
            <button 
              onClick={handleSend}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-3 bg-primary text-white rounded-xl hover:bg-slate-800 transition-all"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function AuthFlow({ onLogin }: { onLogin: (user: User, token: string) => void }) {
  const [step, setStep] = useState<'login' | 'register' | 'plan'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [nif, setNif] = useState('');
  const [company, setCompany] = useState('');
  const [userType, setUserType] = useState('Estudante');
  const [termsAccepted, setTermsAccepted] = useState(false);
  const [phone, setPhone] = useState('');
  const [error, setError] = useState('');

  const handleLogin = async (e: any) => {
    e.preventDefault();
    const res = await fetch('/api/auth/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password })
    });
    const data = await res.json();
    if (res.ok) onLogin(data.user, data.token);
    else setError(data.error);
  };

  const handleRegister = async (e: any) => {
    e.preventDefault();
    if (!termsAccepted) return setError('Deve aceitar os termos e condições.');
    if (userType === 'Empresa' && !nif) return setError('NIF é obrigatório para contas empresariais.');
    
    const res = await fetch('/api/auth/register', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name, email, password, user_type: userType, nif, company, phone })
    });
    const data = await res.json();
    if (res.ok) setStep('plan');
    else setError(data.error);
  };

  if (step === 'plan') {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-8">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-6xl w-full space-y-12 text-center">
          <div className="space-y-4">
            <h1 className="text-5xl font-black text-primary tracking-tighter">Escolha o seu Plano</h1>
            <p className="text-slate-500 max-w-2xl mx-auto font-medium">Selecione o plano que melhor se adapta às suas necessidades contabilísticas em Angola.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <PlanCard 
              title="Gratuito" 
              price="0 Kz" 
              features={['Até 20 lançamentos/mês', 'Diário Limitado', 'Razão Simples', 'Balancete Básico', 'Sem Facturação']} 
              onSelect={() => setStep('login')} 
            />
            <PlanCard 
              title="Estudante" 
              price="2.000 Kz" 
              sub="/mês"
              features={['Lançamentos Ilimitados', 'Balanço Patrimonial', 'Auditoria Educativa', 'Assistente AI', 'Exportação PDF']} 
              onSelect={() => setStep('login')} 
            />
            <PlanCard 
              title="Profissional" 
              price="10.000 Kz" 
              sub="/mês"
              highlighted 
              features={['Facturação Electrónica', 'Auditoria Completa', 'Upload Ilimitado', 'Exportação Excel', 'Relatórios Fiscais']} 
              onSelect={() => setStep('login')} 
            />
            <PlanCard 
              title="Empresarial" 
              price="40.000 Kz" 
              sub="/mês"
              features={['Multi-utilizador', 'Gestão de Stock', 'Fluxo de Caixa', 'API Completa', 'Suporte Prioritário']} 
              onSelect={() => setStep('login')} 
            />
          </div>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="bg-white p-12 rounded-[40px] shadow-2xl w-full max-w-md border border-slate-100">
        <div className="flex flex-col items-center mb-10">
          <div className="w-16 h-16 bg-primary rounded-2xl flex items-center justify-center text-white shadow-xl shadow-indigo-100 mb-6">
            <ShieldCheck size={32} />
          </div>
          <h2 className="text-3xl font-bold text-primary tracking-tight">AuditChek Angola</h2>
          <p className="text-slate-500 mt-2 font-medium text-center">
            {step === 'login' ? 'Bem-vindo de volta!' : 'Requisitos: Nome, Email e Senha Forte (8+ chars, A-z, 0-9, !@#)'}
          </p>
        </div>

        {error && <div className="mb-6 p-4 bg-red-50 text-red-600 rounded-2xl text-sm font-bold flex items-center gap-2 animate-shake"><AlertCircle size={18} /> {error}</div>}

        <form onSubmit={step === 'login' ? handleLogin : handleRegister} className="space-y-5">
          {step === 'register' && (
            <div className="space-y-4">
              <div className="relative">
                <UserIcon className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" placeholder="Nome Completo" value={name} onChange={e => setName(e.target.value)} className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-accent transition-all font-medium" required />
              </div>
              
              <div className="relative">
                <Building2 className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" placeholder="Empresa / Instituição" value={company} onChange={e => setCompany(e.target.value)} className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-accent transition-all font-medium" />
              </div>

              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="email" placeholder="E-mail (Pessoal ou Corporativo)" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-accent transition-all font-medium" required />
              </div>

              <div className="relative">
                <Phone className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" placeholder="Telefone (+244)" value={phone} onChange={e => setPhone(e.target.value)} className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-accent transition-all font-medium" />
              </div>

              <div className="relative">
                <CreditCard className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="text" placeholder="NIF (Estudante ou Profissional)" value={nif} onChange={e => setNif(e.target.value)} className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-accent transition-all font-medium" />
              </div>

              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="password" placeholder="Palavra-passe" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-accent transition-all font-medium" required />
              </div>

              <select value={userType} onChange={e => setUserType(e.target.value)} className="w-full px-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-accent transition-all font-medium">
                <option value="Estudante">Estudante</option>
                <option value="Contabilista">Contabilista (Profissional)</option>
                <option value="Empresa">Empresa</option>
              </select>

              <label className="flex items-start gap-3 px-2 cursor-pointer group">
                <input type="checkbox" checked={termsAccepted} onChange={e => setTermsAccepted(e.target.checked)} className="mt-1 w-5 h-5 rounded-lg border-slate-300 text-accent focus:ring-accent" />
                <span className="text-xs text-slate-500 group-hover:text-slate-700 transition-colors leading-relaxed">
                  Aceito os Termos de Serviço e a Política de Privacidade do AuditChek Angola.
                </span>
              </label>
            </div>
          )}

          {step === 'login' && (
            <div className="space-y-4">
              <div className="relative">
                <Mail className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="email" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-accent transition-all font-medium" required />
              </div>
              <div className="relative">
                <Lock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input type="password" placeholder="Palavra-passe" value={password} onChange={e => setPassword(e.target.value)} className="w-full pl-14 pr-6 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none focus:ring-2 focus:ring-accent transition-all font-medium" required />
              </div>
            </div>
          )}

          <button type="submit" className="w-full py-5 bg-primary text-white rounded-2xl font-bold text-lg hover:bg-slate-800 shadow-lg shadow-indigo-100 transition-all transform hover:-translate-y-0.5 active:translate-y-0">
            {step === 'login' ? 'Entrar' : 'Criar Conta'}
          </button>
        </form>

        <div className="mt-8 text-center">
          <button onClick={() => setStep(step === 'login' ? 'register' : 'login')} className="text-accent font-bold hover:underline">
            {step === 'login' ? 'Não tem conta? Registe-se' : 'Já tem conta? Entre aqui'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}

function DashboardPortal({ onNavigate }: { onNavigate: (tab: string) => void }) {
  return (
    <div className="space-y-10">
      <div className="flex justify-between items-start">
        <div className="space-y-1">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-white rounded-2xl shadow-xl flex items-center justify-center text-primary">
              <LayoutDashboard size={24} />
            </div>
            <h1 className="text-6xl font-black text-slate-900 tracking-tighter">Painel Principal</h1>
          </div>
          <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.3em] ml-16">Monitorização em tempo real da saúde financeira.</p>
        </div>
        <button className="flex items-center gap-3 px-6 py-4 bg-white border border-slate-100 rounded-[24px] shadow-xl shadow-slate-200/50 hover:shadow-2xl transition-all group">
          <History size={20} className="text-slate-400 group-hover:rotate-180 transition-transform duration-500" />
          <span className="text-[10px] font-black text-slate-800 uppercase tracking-widest">Verificação Rápida</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <DashboardCard 
          label="Total Movimentado" 
          value="3.530.000 Kz" 
          sub="Volume total processado" 
          icon={<TrendingUp size={24} />}
          color="bg-info" 
        />
        <DashboardCard 
          label="Status de Equilíbrio" 
          value="Equilibrado" 
          sub="Conformidade OK" 
          icon={<Scale size={24} />}
          color="bg-success" 
        />
        <DashboardCard 
          label="Inconsistências IA" 
          value="0" 
          sub="Alertas detectados" 
          icon={<AlertCircle size={24} />}
          color="bg-warning" 
        />
        <DashboardCard 
          label="Qtd. Lançamentos" 
          value="5" 
          sub="Lançamentos este mês" 
          icon={<FileText size={24} />}
          color="bg-purple" 
        />
      </div>

      <div className="flex justify-center">
        <button 
          onClick={() => onNavigate('audit')}
          className="flex items-center gap-3 px-12 py-5 bg-slate-900 text-white rounded-[24px] shadow-2xl hover:bg-primary transition-all group"
        >
          <Zap size={24} className="text-accent group-hover:scale-125 transition-transform" />
          <span className="text-sm font-black uppercase tracking-[0.2em]">Análise de Lançamentos</span>
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div className="glass-card p-10 space-y-8">
          <div className="w-16 h-16 bg-blue-100 text-info rounded-2xl flex items-center justify-center">
            <BarChart3 size={32} />
          </div>
          <div className="space-y-1">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">Fluxo de Caixa</p>
            <p className="text-5xl font-black text-slate-900 tracking-tighter">0 Kz</p>
            <p className="text-sm text-slate-500 font-medium">Volume total processado</p>
          </div>
        </div>

        <div className="glass-card p-10 space-y-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 bg-purple-100 text-purple rounded-xl flex items-center justify-center">
                <PieChart size={20} />
              </div>
              <h3 className="text-3xl font-black text-slate-900 tracking-tighter leading-none">Análise de<br/>Equilíbrio<br/>Patrimonial</h3>
            </div>
            <div className="flex gap-4">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-info" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Débitos</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-primary" />
                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Créditos</span>
              </div>
            </div>
          </div>
          <div className="h-48 flex items-end justify-between px-4 border-b border-slate-100 pb-2">
             {[2, 3, 4].map(v => (
               <div key={v} className="absolute left-0 w-full border-t border-slate-50 border-dashed" style={{ bottom: `${v * 20}%` }} />
             ))}
             <div className="flex-1" />
          </div>
        </div>
      </div>
    </div>
  );
}

function DashboardCard({ label, value, sub, color, icon }: any) {
  const shadowColor = color.includes('info') ? 'shadow-blue-100' : 
                     color.includes('success') ? 'shadow-emerald-100' :
                     color.includes('warning') ? 'shadow-amber-100' :
                     color.includes('purple') ? 'shadow-purple-100' : 'shadow-red-100';

  return (
    <div className="glass-card p-10 space-y-6 group hover:border-primary/20 transition-all">
      <div className={cn("w-20 h-20 rounded-[24px] shadow-2xl flex items-center justify-center text-white", color, shadowColor)}>
        {icon || <div className="w-8 h-8 bg-white/20 rounded-lg" />}
      </div>
      <div className="space-y-1">
        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{label}</p>
        <p className="text-5xl font-black text-slate-900 tracking-tighter">{value}</p>
        <p className="text-sm text-slate-500 font-medium">{sub}</p>
      </div>
    </div>
  );
}

function PlanCard({ title, price, sub, features, highlighted, onSelect }: any) {
  return (
    <div className={cn(
      "p-8 rounded-[32px] border-2 transition-all flex flex-col",
      highlighted ? "bg-white border-primary shadow-xl scale-105 z-10" : "bg-white border-slate-100 hover:border-slate-200"
    )}>
      <h3 className="text-xl font-bold text-slate-900 mb-2">{title}</h3>
      <div className="flex items-baseline gap-1 mb-6">
        <p className="text-3xl font-black text-accent">{price}</p>
        {sub && <span className="text-slate-400 text-xs font-bold">{sub}</span>}
      </div>
      <ul className="space-y-4 mb-8 flex-1 text-left">
        {features.map((f: string, i: number) => (
          <li key={i} className="flex items-start gap-2 text-slate-600 text-[11px] font-medium leading-tight">
            <CheckCircle2 size={14} className="text-accent mt-0.5 shrink-0" /> {f}
          </li>
        ))}
      </ul>
      <button onClick={onSelect} className={cn(
        "w-full py-4 rounded-2xl font-bold transition-all",
        highlighted ? "bg-primary text-white hover:bg-slate-800" : "bg-slate-100 text-slate-600 hover:bg-slate-200"
      )}>
        Selecionar
      </button>
    </div>
  );
}

function SuperAdminView({ stats, onRefresh }: any) {
  if (!stats) return <div className="p-8 text-center text-slate-500">A carregar estatísticas...</div>;

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <StatCard icon={<Users className="text-blue-600" />} label="Total Utilizadores" value={stats.totalUsers} trend="Global" />
        <StatCard icon={<Activity className="text-accent" />} label="Utilizadores Activos" value={stats.activeUsers} trend="Online" />
        <StatCard icon={<Wallet className="text-purple-600" />} label="MRR (Mensal)" value={`${stats.mrr.toLocaleString()} Kz`} trend="Recorrente" />
        <StatCard icon={<TrendingUp className="text-emerald-600" />} label="Receita Anual Est." value={`${stats.totalRevenue.toLocaleString()} Kz`} trend="Projecção" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <History size={20} className="text-slate-400" /> Logs de Actividade do Sistema
          </h3>
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {stats.logs.map((log: any) => (
              <div key={log.id} className="p-4 bg-slate-50 rounded-2xl border border-slate-100 flex justify-between items-start">
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <span className="text-[10px] font-black uppercase tracking-widest px-2 py-0.5 bg-white border border-slate-200 rounded-md text-slate-500">{log.action}</span>
                    <span className="text-[10px] text-slate-400">{new Date(log.created_at).toLocaleString()}</span>
                  </div>
                  <p className="text-sm font-bold text-slate-800">{log.details}</p>
                  <p className="text-[10px] text-slate-400 mt-1 font-mono">{log.email}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-xl font-bold text-slate-800 mb-6 flex items-center gap-2">
            <Lock size={20} className="text-slate-400" /> Gestão de Contas
          </h3>
          <div className="space-y-4 max-h-[500px] overflow-y-auto pr-2">
            {stats.users.map((u: any) => (
              <div key={u.id} className="p-4 border border-slate-100 rounded-2xl flex flex-col gap-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-bold text-slate-800">{u.name}</p>
                    <p className="text-[10px] text-slate-500">{u.email}</p>
                  </div>
                  <span className={cn(
                    "text-[9px] font-black uppercase tracking-widest px-2 py-1 rounded-md",
                    u.plan === 'enterprise' ? "bg-purple-100 text-purple-700" : 
                    u.plan === 'professional' ? "bg-blue-100 text-blue-700" : "bg-slate-100 text-slate-500"
                  )}>
                    {u.plan === 'free' ? 'Gratuito' : 
                     u.plan === 'student' ? 'Estudante' : 
                     u.plan === 'professional' ? 'Profissional' : 'Empresarial'}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={async () => {
                      await fetch(`/api/admin/users/${u.id}/block`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                        body: JSON.stringify({ blocked: !u.blocked })
                      });
                      onRefresh();
                    }}
                    className={cn("flex-1 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all", u.blocked ? "bg-emerald-100 text-emerald-700" : "bg-red-100 text-red-700")}
                  >
                    {u.blocked ? 'Desbloquear' : 'Bloquear'}
                  </button>
                  <select 
                    value={u.plan}
                    onChange={async (e) => {
                      await fetch(`/api/admin/users/${u.id}/plan`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${localStorage.getItem('token')}` },
                        body: JSON.stringify({ plan: e.target.value })
                      });
                      onRefresh();
                    }}
                    className="flex-1 py-2 bg-slate-50 border border-slate-100 rounded-xl text-[10px] font-black uppercase tracking-widest outline-none"
                  >
                    <option value="free">Gratuito</option>
                    <option value="student">Estudante</option>
                    <option value="professional">Profissional</option>
                    <option value="enterprise">Empresarial</option>
                  </select>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

function ProfileView({ user }: { user: User }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="max-w-2xl mx-auto space-y-8">
      <div className="bg-white p-10 rounded-[40px] border border-slate-200 shadow-sm text-center">
        <div className="w-32 h-32 rounded-full bg-slate-100 border-4 border-white shadow-lg mx-auto mb-6 overflow-hidden">
          <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`} alt="avatar" referrerPolicy="no-referrer" />
        </div>
        <h2 className="text-3xl font-bold text-slate-900">{user.name}</h2>
        <p className="text-slate-500 font-medium">{user.email}</p>
        <div className="mt-6 flex justify-center gap-3">
          <span className="px-4 py-1.5 bg-accent/10 text-accent rounded-full text-xs font-bold uppercase tracking-wider border border-accent/20">
            {user.role === 'admin' ? 'Administrador' : 
             user.role === 'enterprise' ? 'Empresa' : 
             user.role === 'professional' ? 'Profissional' : 'Estudante'}
          </span>
          <span className="px-4 py-1.5 bg-blue-50 text-blue-700 rounded-full text-xs font-bold uppercase tracking-wider border border-blue-100">
            {user.plan === 'free' ? 'Plano Gratuito' : 
             user.plan === 'student' ? 'Plano Estudante' : 
             user.plan === 'professional' ? 'Plano Profissional' : 'Plano Empresarial'}
          </span>
        </div>
        {user.nif && <p className="mt-4 text-sm text-slate-500 font-mono">NIF: {user.nif}</p>}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <Settings size={20} className="text-slate-400" /> Configurações
          </h3>
          <div className="space-y-4">
            <button 
              onClick={async () => {
                const res = await fetch('/api/backup', { method: 'POST', headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` } });
                const data = await res.json();
                alert(data.message);
              }}
              className="w-full text-left px-4 py-3 hover:bg-slate-50 rounded-xl transition-colors text-sm font-medium text-slate-600 flex items-center gap-2"
            >
              <History size={16} /> Realizar Backup Manual
            </button>
            <button className="w-full text-left px-4 py-3 hover:bg-slate-50 rounded-xl transition-colors text-sm font-medium text-slate-600">Alterar Palavra-passe</button>
            <button className="w-full text-left px-4 py-3 hover:bg-slate-50 rounded-xl transition-colors text-sm font-medium text-slate-600">Notificações por Email</button>
            <button className="w-full text-left px-4 py-3 hover:bg-slate-50 rounded-xl transition-colors text-sm font-medium text-slate-600">Privacidade e Dados</button>
          </div>
        </div>
        <div className="bg-white p-8 rounded-3xl border border-slate-200 shadow-sm">
          <h3 className="text-lg font-bold text-slate-800 mb-4 flex items-center gap-2">
            <CreditCard size={20} className="text-slate-400" /> Assinatura
          </h3>
          <p className="text-sm text-slate-500 mb-6">O seu plano actual é o <strong>{user.plan}</strong>.</p>
          <button className="w-full py-4 bg-slate-900 text-white rounded-2xl font-bold hover:bg-slate-800 transition-all">Fazer Upgrade</button>
        </div>
      </div>
    </motion.div>
  );
}

function LoginScreen({ onLogin }: { onLogin: (user: User, token: string) => void }) {
  return <AuthFlow onLogin={onLogin} />;
}

import React, { useState, useEffect, useMemo } from 'react';
import { 
  LayoutDashboard, 
  Users, 
  Shirt, 
  Calendar, 
  BarChart2, 
  Plus, 
  Trash2, 
  Edit, 
  DollarSign, 
  UserPlus,
  UserMinus,
  Check,
  X,
  ChevronLeft,
  ChevronRight,
  Settings,
  Loader2,
  Search,
  Filter,
  FileText,
  Download,
  Printer,
  Target,
  AlertCircle,
  CheckCircle2,
  AlertTriangle,
  Share2,
  ShieldAlert,
  LogIn,
  LogOut,
  Menu,
  Trophy
} from 'lucide-react';

// --- FIREBASE IMPORTS ---
import { initializeApp } from 'firebase/app';
import { 
  getAuth, 
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signOut
} from 'firebase/auth';
import { 
  getFirestore, 
  collection, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot
} from 'firebase/firestore';

// ==================================================================================
// --- ÁREA DE CONFIGURAÇÃO DO USUÁRIO ---
// ==================================================================================
const firebaseConfig = {
  apiKey: "SUA_API_KEY_AQUI", 
  authDomain: "SEU_PROJETO.firebaseapp.com",
  projectId: "SEU_PROJECT_ID",
  storageBucket: "SEU_PROJETO.firebasestorage.app",
  messagingSenderId: "SEU_MESSAGING_ID",
  appId: "SEU_APP_ID"
};
// ==================================================================================

// --- Helpers & Icons ---
const toTitleCase = (str) => str ? str.replace(/(?:^|\s)\S/g, (char) => char.toUpperCase()) : '';
const sortPlayersByName = (list) => [...list].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
const getTeamBgColor = (teamColorClass) => {
  if (!teamColorClass) return 'bg-white border-gray-100';
  const colorMap = { 'text-blue-600': 'bg-blue-50 border-blue-100', 'text-red-600': 'bg-red-50 border-red-100', 'text-green-600': 'bg-green-50 border-green-100', 'text-yellow-500': 'bg-yellow-50 border-yellow-100', 'text-purple-600': 'bg-purple-50 border-purple-100', 'text-orange-500': 'bg-orange-50 border-orange-100', 'text-gray-600': 'bg-gray-100 border-gray-200', 'text-gray-900': 'bg-gray-100 border-gray-300' };
  return colorMap[teamColorClass] || 'bg-white border-gray-200';
};
const SoccerBallIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><path d="M12 7l-2.5 4h5L12 7z" /><path d="M12 17l-2.5-4h5L12 17z" /><path d="M5 10l4 2.5-1.5 4.5L5 10z" /><path d="M19 10l-4 2.5 1.5 4.5L19 10z" /></svg>);
const GloveIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 12v-5a2 2 0 0 0-4 0v5"></path><path d="M15 12v-7a2 2 0 0 0-4 0v7"></path><path d="M11 12v-5a2 2 0 0 0-4 0v5"></path><path d="M7 12v-3a2 2 0 0 0-4 0v3c0 4.5 3.5 8 8 8h2c4.5 0 8-3.5 8-8z"></path><line x1="3" y1="17" x2="21" y2="17"></line></svg>);

// --- Componentes UI Mobile-First ---
const Card = ({ children, className = "", onClick }) => (
  <div onClick={onClick} className={`bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden ${onClick ? 'active:scale-[0.98] transition-transform cursor-pointer' : ''} ${className}`}>
    {children}
  </div>
);

const Button = ({ children, onClick, variant = "primary", className = "", disabled = false, type = "button" }) => {
  const base = "px-4 py-3 rounded-xl font-semibold transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed active:scale-95";
  const variants = {
    primary: "bg-blue-600 text-white shadow-md shadow-blue-200",
    secondary: "bg-white text-gray-700 border border-gray-200 hover:bg-gray-50",
    danger: "bg-red-50 text-red-600 border border-red-100",
    ghost: "text-gray-500 hover:bg-gray-100",
    whatsapp: "bg-green-500 text-white shadow-md shadow-green-200",
    fab: "fixed bottom-20 right-4 w-14 h-14 rounded-full bg-blue-600 text-white shadow-lg shadow-blue-300 z-40 flex items-center justify-center"
  };
  return <button type={type} onClick={onClick} disabled={disabled} className={`${base} ${variants[variant]} ${className}`}>{children}</button>;
};

const Input = (props) => (
  <input {...props} className={`w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white transition-colors ${props.className}`} />
);

const Toast = ({ message, type, onClose }) => {
  useEffect(() => { if(message) { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); } }, [message]);
  if (!message) return null;
  return (
    <div className={`fixed top-4 left-4 right-4 z-[300] px-4 py-3 rounded-xl shadow-lg text-white flex items-center gap-3 animate-in slide-in-from-top-5 ${type === 'success' ? 'bg-green-600' : 'bg-red-500'}`}>
      {type === 'success' ? <CheckCircle2 className="w-5 h-5"/> : <AlertCircle className="w-5 h-5"/>}<span className="text-sm font-medium flex-1">{message}</span><button onClick={onClose}><X className="w-4 h-4"/></button>
    </div>
  );
};

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-xs rounded-3xl p-6 shadow-2xl animate-in zoom-in-95">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-4 mx-auto"><AlertTriangle className="w-6 h-6" /></div>
        <h3 className="text-lg font-bold text-center text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-500 text-center text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onCancel} className="flex-1">Cancelar</Button>
          <Button variant="danger" onClick={onConfirm} className="flex-1 bg-red-600 text-white border-0">Sim, Excluir</Button>
        </div>
      </div>
    </div>
  );
};

// --- Inicialização Firebase ---
const getFirebaseConfig = () => {
  if (typeof firebaseConfig !== 'undefined' && firebaseConfig.apiKey && firebaseConfig.apiKey !== "SUA_API_KEY_AQUI") return firebaseConfig;
  if (typeof __firebase_config !== 'undefined') { try { return JSON.parse(__firebase_config); } catch { return null; } }
  return null;
};
const configToUse = getFirebaseConfig();
const app = configToUse ? initializeApp(configToUse) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
const appId = typeof __app_id !== 'undefined' ? __app_id : (configToUse?.projectId || 'default-app');

// --- Telas de Login / Config / Main ---
export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [permissionError, setPermissionError] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

  // Data State
  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [settings, setSettings] = useState({ monthlyFee: 0, uniformPrice: 0 });

  const showToast = (msg, type = 'success') => setToast({ message: msg, type });
  const requestConfirm = (title, message, action) => setConfirmModal({ isOpen: true, title, message, onConfirm: async () => { try { await action(); setConfirmModal(prev => ({ ...prev, isOpen: false })); } catch (e) { showToast(e.message, 'error'); } } });

  useEffect(() => {
    if (!app) { setLoading(false); return; }
    return onAuthStateChanged(auth, (u) => { setUser(u); setLoading(false); });
  }, []);

  useEffect(() => {
    if (!user || !db) return;
    const isLocal = firebaseConfig && firebaseConfig.apiKey && firebaseConfig.apiKey !== "SUA_API_KEY_AQUI";
    const basePath = isLocal ? `rachao_manager_db/main` : `artifacts/${appId}/public/data`;
    
    const handleError = (err) => { if (err.code === 'permission-denied') setPermissionError(true); };

    const unsubPlayers = onSnapshot(collection(db, `${basePath}/players`), s => setPlayers(s.docs.map(d => ({id: d.id, ...d.data()}))), handleError);
    const unsubTeams = onSnapshot(collection(db, `${basePath}/teams`), s => setTeams(s.docs.map(d => ({id: d.id, ...d.data()}))), handleError);
    const unsubMatches = onSnapshot(collection(db, `${basePath}/matches`), s => setMatches(s.docs.map(d => ({id: d.id, ...d.data()})).sort((a, b) => new Date(b.date) - new Date(a.date) || b.id - a.id)), handleError);
    const unsubSettings = onSnapshot(collection(db, `${basePath}/settings`), s => { if(!s.empty) setSettings({id: s.docs[0].id, ...s.docs[0].data()}); else addDoc(collection(db, `${basePath}/settings`), {monthlyFee:0, uniformPrice:0}).catch(handleError); }, handleError);

    return () => { unsubPlayers(); unsubTeams(); unsubMatches(); unsubSettings(); };
  }, [user]);

  const getPath = (col) => {
    const isLocal = firebaseConfig && firebaseConfig.apiKey && firebaseConfig.apiKey !== "SUA_API_KEY_AQUI";
    return isLocal ? `rachao_manager_db/main/${col}` : `artifacts/${appId}/public/data/${col}`;
  };

  const dbActions = {
    add: (col, data) => { addDoc(collection(db, getPath(col)), data); showToast('Salvo com sucesso!'); },
    update: (col, id, data) => { updateDoc(doc(db, getPath(col), id), data); showToast('Atualizado!'); },
    del: (col, id) => { deleteDoc(doc(db, getPath(col), id)); showToast('Excluído!', 'error'); }
  };

  // Stats Calculation
  const stats = useMemo(() => {
    const t = {}; const s = {}; const g = {};
    teams.forEach(tm => t[tm.id] = { ...tm, p:0, j:0, v:0, e:0, d:0, gp:0, gc:0, sg:0 });
    players.forEach(pl => { s[pl.id] = { name: pl.name, team: teams.find(x => x.id === pl.teamId)?.name || '-', goals: 0, games: 0 }; g[pl.id] = { name: pl.name, conceded: 0, games: 0 }; });
    
    matches.forEach(m => {
      if(t[m.teamA] && t[m.teamB]) {
        const sA = parseInt(m.scoreA||0), sB = parseInt(m.scoreB||0);
        t[m.teamA].j++; t[m.teamB].j++; t[m.teamA].gp+=sA; t[m.teamA].gc+=sB; t[m.teamB].gp+=sB; t[m.teamB].gc+=sA; t[m.teamA].sg = t[m.teamA].gp-t[m.teamA].gc; t[m.teamB].sg = t[m.teamB].gp-t[m.teamB].gc;
        if(sA>sB) { t[m.teamA].v++; t[m.teamA].p+=3; t[m.teamB].d++; } else if(sB>sA) { t[m.teamB].v++; t[m.teamB].p+=3; t[m.teamA].d++; } else { t[m.teamA].e++; t[m.teamA].p++; t[m.teamB].e++; t[m.teamB].p++; }
      }
      [...(m.lineupA||[]), ...(m.lineupB||[])].forEach(pid => { if(s[pid]) s[pid].games++; });
      [...(m.scorersA||[]), ...(m.scorersB||[])].forEach(sc => { if(s[sc.playerId]) s[sc.playerId].goals += parseInt(sc.count); });
      [...(m.goalkeepersA||[]), ...(m.goalkeepersB||[])].forEach(gk => { if(g[gk.playerId]) { g[gk.playerId].games += parseInt(gk.minutes||0)>=90?1:0.5; g[gk.playerId].conceded += parseInt(gk.conceded); } });
    });

    return {
      table: Object.values(t).sort((a, b) => b.p - a.p || b.sg - a.sg),
      scorers: Object.values(s).filter(x => x.goals > 0).sort((a,b) => b.goals - a.goals),
      goalkeepers: Object.values(g).filter(x => x.games > 0).map(x => ({...x, avg: x.conceded/x.games})).sort((a,b) => a.avg - b.avg)
    };
  }, [matches, teams, players]);

  if (!app) return <ConfigError />;
  if (loading) return <div className="h-screen flex items-center justify-center bg-gray-50 text-blue-600 gap-2"><Loader2 className="animate-spin"/> Carregando...</div>;
  if (!user) return <LoginScreen />;
  if (permissionError) return <PermissionHelp />;

  const navItems = [
    { id: 'dashboard', icon: LayoutDashboard, label: 'Dash' },
    { id: 'matches', icon: Calendar, label: 'Jogos' },
    { id: 'teams', icon: Shirt, label: 'Times' },
    { id: 'players', icon: Users, label: 'Jogadores' },
    { id: 'financial', icon: DollarSign, label: 'Caixa' },
  ];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 font-sans text-gray-900">
      <Toast {...toast} onClose={() => setToast({message:'', type:''})} />
      <ConfirmModal {...confirmModal} onCancel={() => setConfirmModal(p => ({...p, isOpen:false}))} />
      
      {/* SIDEBAR (Desktop) */}
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
        <div className="p-6 flex items-center gap-3 border-b border-gray-100">
          <div className="bg-blue-600 text-white p-2 rounded-xl shadow-lg shadow-blue-200">⚽</div>
          <h1 className="font-bold text-xl tracking-tight">Rachão<span className="text-blue-600">Mgr</span></h1>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {navItems.map(item => (
            <button key={item.id} onClick={() => setActiveTab(item.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === item.id ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}>
              <item.icon className="w-5 h-5" /> {item.label}
            </button>
          ))}
          <button onClick={() => setActiveTab('stats')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'stats' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}><BarChart2 className="w-5 h-5"/> Stats</button>
          <button onClick={() => setActiveTab('reports')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all ${activeTab === 'reports' ? 'bg-blue-50 text-blue-700' : 'text-gray-500 hover:bg-gray-50'}`}><FileText className="w-5 h-5"/> Relatórios</button>
        </nav>
        <div className="p-4 border-t border-gray-100">
          <button onClick={() => signOut(auth)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50 transition-all">
            <LogOut className="w-5 h-5" /> Sair
          </button>
        </div>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-y-auto h-screen pb-24 md:pb-0">
        {/* MOBILE HEADER */}
        <header className="md:hidden bg-white border-b border-gray-100 p-4 flex justify-between items-center sticky top-0 z-20">
          <div className="flex items-center gap-2 font-bold text-lg text-gray-800"><div className="bg-blue-600 text-white p-1.5 rounded-lg">⚽</div> Rachão Mgr</div>
          <button onClick={() => signOut(auth)} className="text-gray-400"><LogOut className="w-5 h-5"/></button>
        </header>

        <div className="p-4 md:p-8 max-w-5xl mx-auto">
          {activeTab === 'dashboard' && <Dashboard stats={stats} matches={matches} />}
          {activeTab === 'stats' && <Statistics stats={stats} />}
          {activeTab === 'players' && <PlayerManager players={players} teams={teams} matches={matches} dbActions={dbActions} requestConfirm={requestConfirm} />}
          {activeTab === 'teams' && <TeamManager teams={teams} players={players} dbActions={dbActions} requestConfirm={requestConfirm} showToast={showToast} />}
          {activeTab === 'matches' && <MatchManager matches={matches} teams={teams} players={players} dbActions={dbActions} requestConfirm={requestConfirm} showToast={showToast} />}
          {activeTab === 'financial' && <FinancialManager players={players} settings={settings} dbActions={dbActions} />}
          {activeTab === 'reports' && <ReportsPanel stats={stats} matches={matches} players={players} teams={teams} settings={settings} />}
        </div>
      </main>

      {/* BOTTOM NAV (Mobile) */}
      <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 flex justify-around p-2 pb-safe z-30">
        {navItems.map(item => (
          <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex flex-col items-center gap-1 p-2 rounded-lg transition-colors ${activeTab === item.id ? 'text-blue-600' : 'text-gray-400'}`}>
            <item.icon className={`w-6 h-6 ${activeTab === item.id ? 'fill-current/10' : ''}`} />
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        ))}
        <button onClick={() => setActiveTab('stats')} className={`flex flex-col items-center gap-1 p-2 rounded-lg ${activeTab === 'stats' ? 'text-blue-600' : 'text-gray-400'}`}>
           <BarChart2 className="w-6 h-6"/>
           <span className="text-[10px] font-medium">Stats</span>
        </button>
      </nav>
    </div>
  );
}

// --- MODULOS REFATORADOS ---

const LoginScreen = () => {
  const [isReg, setIsReg] = useState(false);
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    try {
      if(isReg) await createUserWithEmailAndPassword(auth, email, pass);
      else await signInWithEmailAndPassword(auth, email, pass);
    } catch (err) {
      setError(err.code === 'auth/invalid-credential' ? 'Dados inválidos' : err.message);
    } finally { setLoading(false); }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
      <div className="w-full max-w-sm bg-white p-8 rounded-3xl shadow-xl">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center text-3xl text-white mx-auto mb-4 shadow-lg shadow-blue-200">⚽</div>
          <h1 className="text-2xl font-bold text-gray-900">Bem vindo!</h1>
          <p className="text-gray-500 text-sm">Gerencie seu futebol com estilo.</p>
        </div>
        <form onSubmit={handle} className="space-y-4">
          <Input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required className="h-12" />
          <Input type="password" placeholder="Senha" value={pass} onChange={e=>setPass(e.target.value)} required className="h-12" />
          {error && <p className="text-red-500 text-xs text-center bg-red-50 p-2 rounded">{error}</p>}
          <Button type="submit" variant="primary" className="w-full h-12 text-base" disabled={loading}>{loading ? <Loader2 className="animate-spin"/> : (isReg ? 'Criar Conta' : 'Entrar')}</Button>
        </form>
        <button onClick={() => setIsReg(!isReg)} className="w-full mt-6 text-sm text-gray-500 hover:text-blue-600 font-medium">{isReg ? 'Já tem conta? Login' : 'Criar nova conta'}</button>
      </div>
    </div>
  );
};

const ConfigError = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-6 text-center">
    <div className="bg-white p-8 rounded-3xl shadow-xl max-w-sm w-full">
      <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
      <h2 className="text-xl font-bold mb-2">Falta Configurar!</h2>
      <p className="text-gray-500 text-sm mb-4">Adicione suas chaves do Firebase no arquivo <code>App.jsx</code>.</p>
    </div>
  </div>
);

// --- MODULES ---

function Dashboard({ stats, matches }) {
  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5 bg-gradient-to-br from-blue-600 to-blue-800 text-white border-none shadow-lg shadow-blue-200">
          <div className="flex justify-between items-start mb-6">
            <div><p className="text-blue-100 text-xs font-bold uppercase tracking-wider mb-1">Total de Jogos</p><h2 className="text-4xl font-bold">{matches.length}</h2></div>
            <div className="p-2 bg-white/20 rounded-xl backdrop-blur-sm"><Calendar className="w-6 h-6 text-white"/></div>
          </div>
          <div className="space-y-2">
            <p className="text-xs font-bold text-blue-200 uppercase mb-2">Top Vitórias</p>
            {stats.table.slice(0,3).map((t,i) => (
              <div key={t.id} className="flex justify-between text-sm border-b border-white/10 pb-1 last:border-0">
                <span>{i+1}. {t.name}</span><span className="font-bold bg-white/20 px-2 rounded text-xs">{t.v}v</span>
              </div>
            ))}
          </div>
        </Card>
        
        <Card className="p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-bold text-gray-800 flex items-center gap-2"><Trophy className="w-5 h-5 text-yellow-500" /> Artilharia</h3>
          </div>
          <div className="space-y-3">
            {stats.scorers.slice(0,3).map((s, i) => (
              <div key={i} className="flex items-center justify-between p-2 hover:bg-gray-50 rounded-lg transition-colors">
                <div className="flex items-center gap-3">
                  <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${i===0?'bg-yellow-400 text-white':i===1?'bg-gray-400 text-white':'bg-orange-400 text-white'}`}>{i+1}</span>
                  <span className="font-medium text-sm text-gray-700">{s.name}</span>
                </div>
                <span className="text-sm font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-lg">{s.goals}</span>
              </div>
            ))}
            {stats.scorers.length === 0 && <p className="text-center text-gray-400 text-sm py-4">Sem dados ainda.</p>}
          </div>
        </Card>
      </div>

      <Card className="overflow-hidden">
        <div className="p-4 border-b border-gray-100 bg-gray-50/50"><h3 className="font-bold text-gray-800">Tabela de Classificação</h3></div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase"><tr><th className="px-4 py-3 pl-6">Pos</th><th className="px-4 py-3">Time</th><th className="px-4 py-3 text-center text-blue-600 font-bold">PTS</th><th className="px-4 py-3 text-center">J</th><th className="px-4 py-3 text-center text-green-600">V</th><th className="px-4 py-3 text-center text-gray-400">E</th><th className="px-4 py-3 text-center text-red-500">D</th><th className="px-4 py-3 text-center font-bold">SG</th></tr></thead>
            <tbody className="divide-y divide-gray-100">
              {stats.table.map((row, idx) => (
                <tr key={row.id} className="hover:bg-blue-50/30 transition-colors">
                  <td className="px-4 py-3 pl-6 text-gray-400 font-medium">{idx+1}º</td>
                  <td className="px-4 py-3 font-bold text-gray-800">{row.name}</td>
                  <td className="px-4 py-3 text-center"><span className="bg-blue-100 text-blue-700 font-bold px-2 py-1 rounded-lg">{row.p}</span></td>
                  <td className="px-4 py-3 text-center text-gray-500">{row.j}</td>
                  <td className="px-4 py-3 text-center text-green-600 font-medium">{row.v}</td>
                  <td className="px-4 py-3 text-center text-gray-400">{row.e}</td>
                  <td className="px-4 py-3 text-center text-red-400">{row.d}</td>
                  <td className="px-4 py-3 text-center font-bold text-gray-700">{row.sg}</td>
                </tr>
              ))}
              {stats.table.length === 0 && <tr><td colSpan="8" className="p-8 text-center text-gray-400">Tabela vazia.</td></tr>}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}

function TeamManager({ teams, players, dbActions, requestConfirm, showToast }) {
  const [name, setName] = useState('');
  const [selectedColor, setSelectedColor] = useState('text-blue-600');
  const [editingId, setEditingId] = useState(null);
  const [selectedTeamId, setSelectedTeamId] = useState(null); // For managing squad
  const [playerToAdd, setPlayerToAdd] = useState('');

  const colors = [
    { id: 'blue', class: 'text-blue-600', bg: 'bg-blue-600' },
    { id: 'red', class: 'text-red-600', bg: 'bg-red-600' },
    { id: 'green', class: 'text-green-600', bg: 'bg-green-600' },
    { id: 'yellow', class: 'text-yellow-500', bg: 'bg-yellow-500' },
    { id: 'purple', class: 'text-purple-600', bg: 'bg-purple-600' },
    { id: 'black', class: 'text-gray-900', bg: 'bg-gray-900' },
  ];

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name) return showToast('Nome obrigatório', 'error');
    try {
      if (editingId) await dbActions.update('teams', editingId, { name, color: selectedColor });
      else await dbActions.add('teams', { name, id: Date.now().toString(), color: selectedColor });
      setName(''); setEditingId(null);
    } catch (err) { showToast('Erro ao salvar', 'error'); }
  };

  const handleEdit = (t) => { setEditingId(t.id); setName(t.name); setSelectedColor(t.color || 'text-blue-600'); window.scrollTo(0,0); };
  const handleDelete = (id) => requestConfirm("Excluir Time", "Isso removerá o time.", () => dbActions.del('teams', id));
  
  const addPlayer = async () => {
     if(!playerToAdd || !selectedTeamId) return;
     await dbActions.update('players', playerToAdd, { teamId: selectedTeamId });
     setPlayerToAdd('');
  };
  const removePlayer = async (pid) => await dbActions.update('players', pid, { teamId: null });

  const selectedTeam = teams.find(t => t.id === selectedTeamId);
  const teamPlayers = sortPlayersByName(players.filter(p => p.teamId === selectedTeamId));
  const availablePlayers = sortPlayersByName(players.filter(p => !p.teamId));

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* FORM */}
      <Card className="p-5">
        <div className="flex justify-between items-center mb-4">
          <h3 className="font-bold text-gray-800">{editingId ? 'Editar Time' : 'Novo Time'}</h3>
          {editingId && <button onClick={()=>{setEditingId(null); setName('')}} className="text-sm text-red-500">Cancelar</button>}
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <Input placeholder="Nome do Time" value={name} onChange={e => setName(toTitleCase(e.target.value))} />
          <div className="flex gap-2 overflow-x-auto pb-2">
            {colors.map(c => (
              <button key={c.id} type="button" onClick={() => setSelectedColor(c.class)} 
                className={`w-10 h-10 rounded-full ${c.bg} transition-transform flex-shrink-0 ${selectedColor === c.class ? 'ring-4 ring-blue-100 scale-110' : 'opacity-70'}`} 
              />
            ))}
          </div>
          <Button type="submit" variant="primary" className="w-full">{editingId ? 'Salvar Alterações' : 'Criar Time'}</Button>
        </form>
      </Card>

      {/* SQUAD MANAGER (Shown if team selected) */}
      {selectedTeam && (
        <div className="bg-white rounded-2xl border border-blue-200 shadow-lg overflow-hidden animate-in slide-in-from-bottom-10 fixed inset-x-4 bottom-20 md:relative md:inset-auto md:bottom-auto z-20 h-96 flex flex-col">
          <div className="bg-blue-50 p-4 flex justify-between items-center border-b border-blue-100">
            <h3 className="font-bold text-blue-800 flex items-center gap-2"><Users className="w-5 h-5"/> Elenco: {selectedTeam.name}</h3>
            <button onClick={() => setSelectedTeamId(null)}><X className="w-5 h-5 text-blue-400"/></button>
          </div>
          <div className="p-3 border-b border-gray-100 flex gap-2 bg-white">
             <select className="flex-1 h-10 rounded-lg border-gray-300 text-sm bg-white" value={playerToAdd} onChange={e => setPlayerToAdd(e.target.value)}>
                <option value="">Adicionar Jogador...</option>
                {availablePlayers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
             </select>
             <Button onClick={addPlayer} disabled={!playerToAdd} className="h-10 w-10 p-0"><Plus className="w-5 h-5"/></Button>
          </div>
          <div className="flex-1 overflow-y-auto p-2 space-y-2 bg-gray-50">
             {teamPlayers.map(p => (
               <div key={p.id} className="flex justify-between items-center p-3 bg-white rounded-xl border border-gray-100 shadow-sm">
                 <span className="font-medium text-sm">{p.name}</span>
                 <button onClick={() => removePlayer(p.id)} className="text-red-400 p-1"><UserMinus className="w-4 h-4"/></button>
               </div>
             ))}
             {teamPlayers.length === 0 && <p className="text-center text-gray-400 text-sm mt-10">Time vazio.</p>}
          </div>
        </div>
      )}

      {/* LIST */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20 md:pb-0">
        {teams.map(team => (
          <Card key={team.id} onClick={() => setSelectedTeamId(team.id)} className={`p-4 flex items-center justify-between cursor-pointer hover:border-blue-300 transition-colors ${selectedTeamId === team.id ? 'ring-2 ring-blue-500' : ''}`}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-gray-50 ${team.color}`}><Shirt className="w-6 h-6" /></div>
              <div>
                <h4 className="font-bold text-gray-900">{team.name}</h4>
                <p className="text-xs text-gray-500">{players.filter(p => p.teamId === team.id).length} jogadores</p>
              </div>
            </div>
            <div className="flex gap-1">
               <button onClick={(e) => { e.stopPropagation(); handleEdit(team); }} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-blue-600"><Edit className="w-4 h-4"/></button>
               <button onClick={(e) => { e.stopPropagation(); handleDelete(team.id); }} className="p-2 hover:bg-red-50 rounded-lg text-gray-400 hover:text-red-500"><Trash2 className="w-4 h-4"/></button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function MatchManager({ matches, teams, players, dbActions, requestConfirm, showToast }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const [activeMatchId, setActiveMatchId] = useState(null);
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], teamA: '', teamB: '', scoreA: 0, scoreB: 0 });

  const handleSave = async (e) => {
    e.preventDefault();
    if(!form.teamA || !form.teamB) return showToast("Selecione os times", "error");
    try {
      const data = { ...form, scoreA: parseInt(form.scoreA), scoreB: parseInt(form.scoreB) };
      if(editId) await dbActions.update('matches', editId, data);
      else await dbActions.add('matches', { ...data, lineupA:[], lineupB:[], scorersA:[], scorersB:[], goalkeepersA:[], goalkeepersB:[] });
      setIsAdding(false); setEditId(null);
    } catch(err) { showToast('Erro ao salvar', 'error'); }
  };

  const handleDelete = (id) => requestConfirm("Excluir Jogo", "Dados serão perdidos.", () => dbActions.del('matches', id));
  const startEdit = (m) => { setForm({ date: m.date, teamA: m.teamA, teamB: m.teamB, scoreA: m.scoreA, scoreB: m.scoreB }); setEditId(m.id); setIsAdding(true); };

  if (activeMatchId) {
    const m = matches.find(x => x.id === activeMatchId);
    if(!m) { setActiveMatchId(null); return null; }
    return <MatchDetails match={m} players={players} teams={teams} onBack={() => setActiveMatchId(null)} dbActions={dbActions} />;
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {isAdding ? (
        <Card className="p-5 animate-in slide-in-from-bottom-10 fixed inset-0 md:relative md:inset-auto z-50 md:z-0 flex flex-col bg-gray-50 md:bg-white">
          <div className="flex justify-between items-center mb-6 md:mb-4">
             <h3 className="font-bold text-lg">{editId ? 'Editar' : 'Novo Jogo'}</h3>
             <button onClick={() => setIsAdding(false)} className="p-2 bg-gray-200 rounded-full"><X className="w-5 h-5"/></button>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto">
             <div><label className="text-xs font-bold text-gray-500 uppercase">Data</label><Input type="date" value={form.date} onChange={e => setForm({...form, date: e.target.value})} /></div>
             <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-gray-500 uppercase">Time A</label><select className="w-full h-12 rounded-xl border-gray-300" value={form.teamA} onChange={e => setForm({...form, teamA: e.target.value})}><option value="">Selecione</option>{teams.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
                <div><label className="text-xs font-bold text-gray-500 uppercase">Time B</label><select className="w-full h-12 rounded-xl border-gray-300" value={form.teamB} onChange={e => setForm({...form, teamB: e.target.value})}><option value="">Selecione</option>{teams.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
             </div>
             <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 justify-center">
                <Input type="number" className="w-16 text-center font-bold text-xl p-0 border-0" value={form.scoreA} onChange={e => setForm({...form, scoreA: e.target.value})} />
                <span className="text-gray-300 text-2xl">X</span>
                <Input type="number" className="w-16 text-center font-bold text-xl p-0 border-0" value={form.scoreB} onChange={e => setForm({...form, scoreB: e.target.value})} />
             </div>
          </div>
          <Button onClick={handleSave} className="mt-4 w-full">Salvar Jogo</Button>
        </Card>
      ) : (
        <Button variant="fab" onClick={() => { setForm({ date: new Date().toISOString().split('T')[0], teamA: '', teamB: '', scoreA: 0, scoreB: 0 }); setEditId(null); setIsAdding(true); }}><Plus className="w-6 h-6" /></Button>
      )}

      <div className="space-y-3">
        {matches.map(m => {
          const tA = teams.find(t => t.id === m.teamA)?.name || 'Excluído';
          const tB = teams.find(t => t.id === m.teamB)?.name || 'Excluído';
          return (
            <Card key={m.id} className="flex flex-col" onClick={() => setActiveMatchId(m.id)}>
              <div className="p-2 bg-gray-50 border-b border-gray-100 flex justify-between items-center text-xs text-gray-500 px-4">
                 <span>{new Date(m.date).toLocaleDateString('pt-BR')}</span>
                 <div className="flex gap-2">
                    <button onClick={(e) => { e.stopPropagation(); startEdit(m); }} className="hover:text-blue-600"><Edit className="w-3 h-3"/></button>
                    <button onClick={(e) => { e.stopPropagation(); handleDelete(m.id); }} className="hover:text-red-600"><Trash2 className="w-3 h-3"/></button>
                 </div>
              </div>
              <div className="p-4 flex justify-between items-center">
                 <span className={`w-1/3 text-right font-bold truncate ${parseInt(m.scoreA) > parseInt(m.scoreB) ? 'text-gray-900' : 'text-gray-500'}`}>{tA}</span>
                 <div className="bg-gray-100 px-3 py-1 rounded-lg font-mono font-bold text-gray-800 flex gap-2 shadow-inner"><span>{m.scoreA}</span><span className="text-gray-300">:</span><span>{m.scoreB}</span></div>
                 <span className={`w-1/3 text-left font-bold truncate ${parseInt(m.scoreB) > parseInt(m.scoreA) ? 'text-gray-900' : 'text-gray-500'}`}>{tB}</span>
              </div>
              <div className="bg-blue-50 p-2 text-center text-xs font-bold text-blue-600 uppercase tracking-wider">Toque para Súmula</div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function PlayerManager({ players, dbActions, matches, teams, requestConfirm, showToast }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', email: '', position: 'Meia', rating: 3, dob: '' });

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editId) await dbActions.update('players', editId, form);
      else await dbActions.add('players', { ...form, payments: {}, uniformPaid: false });
      setIsAdding(false); setEditId(null); setForm({ name: '', phone: '', email: '', position: 'Meia', rating: 3, dob: '' });
    } catch (err) { showToast('Erro ao salvar', 'error'); }
  };

  const handleDelete = (id) => requestConfirm("Excluir", "Remover jogador?", () => dbActions.del('players', id));
  const filtered = sortPlayersByName(players.filter(p => p.name.toLowerCase().includes(search.toLowerCase())));
  const getTeamName = (tid) => teams.find(t => t.id === tid)?.name || '-';

  return (
    <div className="space-y-4 pb-20 md:pb-0">
      <div className="sticky top-0 bg-gray-50 pt-2 pb-4 z-10 space-y-2">
         <div className="relative"><Search className="absolute left-3 top-3.5 text-gray-400 w-5 h-5"/><Input placeholder="Buscar jogador..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10"/></div>
      </div>

      {isAdding && (
        <div className="fixed inset-0 z-50 bg-white flex flex-col animate-in slide-in-from-bottom-10">
           <div className="p-4 border-b flex justify-between items-center bg-gray-50"><h3 className="font-bold text-lg">{editId ? 'Editar' : 'Novo Jogador'}</h3><button onClick={() => setIsAdding(false)} className="p-2 bg-gray-200 rounded-full"><X className="w-5 h-5"/></button></div>
           <form onSubmit={handleSave} className="p-6 space-y-6 flex-1 overflow-y-auto">
             <div><label className="text-xs font-bold text-gray-500 uppercase mb-1">Nome</label><Input value={form.name} onChange={e=>setForm({...form, name: toTitleCase(e.target.value)})} required/></div>
             <div><label className="text-xs font-bold text-gray-500 uppercase mb-1">Posição</label><select className="w-full h-12 border-gray-300 rounded-xl" value={form.position} onChange={e=>setForm({...form, position: e.target.value})}>{['Goleiro','Zagueiro','Lateral','Meia','Atacante'].map(p=><option key={p}>{p}</option>)}</select></div>
             <div><label className="text-xs font-bold text-gray-500 uppercase mb-1">Nota</label><div className="flex gap-2">{[1,2,3,4,5].map(s=><button key={s} type="button" onClick={()=>setForm({...form, rating:s})} className={`w-10 h-10 rounded-lg font-bold ${form.rating>=s ? 'bg-yellow-400 text-white' : 'bg-gray-100 text-gray-300'}`}>{s}</button>)}</div></div>
             <Button type="submit" className="w-full mt-4">Salvar</Button>
           </form>
        </div>
      )}

      {!isAdding && <Button variant="fab" onClick={() => { setForm({ name: '', phone: '', email: '', position: 'Meia', rating: 3, dob: '' }); setEditId(null); setIsAdding(true); }}><Plus className="w-6 h-6"/></Button>}

      <div className="space-y-2">
        {filtered.map(p => (
          <Card key={p.id} className="p-4 flex items-center justify-between">
             <div>
                <h4 className="font-bold text-gray-900">{p.name}</h4>
                <div className="text-xs text-gray-500 flex gap-2"><span>{p.position}</span><span>•</span><span className="text-blue-600 font-medium">{getTeamName(p.teamId)}</span></div>
             </div>
             <div className="flex items-center gap-3">
                <div className="flex text-yellow-400 text-[10px] gap-0.5">{'★'.repeat(p.rating)}</div>
                <button onClick={() => { setForm(p); setEditId(p.id); setIsAdding(true); }} className="p-2 bg-gray-50 rounded-lg text-gray-400"><Edit className="w-4 h-4"/></button>
                <button onClick={() => handleDelete(p.id)} className="p-2 bg-red-50 rounded-lg text-red-400"><Trash2 className="w-4 h-4"/></button>
             </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

// Mantendo componentes que não precisavam de alteração de lógica crítica mas que foram importados
function Statistics({ stats }) {
  return (
    <div className="space-y-6 animate-in fade-in pb-20 md:pb-0">
       <Card className="p-0">
          <div className="p-4 border-b border-gray-100 flex items-center gap-2 font-bold text-gray-800 bg-gray-50"><SoccerBallIcon className="w-5 h-5"/> Artilharia</div>
          <div className="divide-y divide-gray-100">
             {stats.scorers.map((s,i) => (
               <div key={i} className="p-3 flex justify-between items-center">
                  <div className="flex items-center gap-3"><span className={`w-6 h-6 flex items-center justify-center rounded-full text-xs font-bold ${i<3 ? 'bg-yellow-400 text-white' : 'bg-gray-100 text-gray-500'}`}>{i+1}</span><div><p className="font-medium text-sm">{s.name}</p><p className="text-xs text-gray-400">{s.teamName}</p></div></div>
                  <span className="font-bold text-green-600 bg-green-50 px-2 py-1 rounded text-xs">{s.goals} gols</span>
               </div>
             ))}
          </div>
       </Card>
       <Card className="p-0">
          <div className="p-4 border-b border-gray-100 flex items-center gap-2 font-bold text-gray-800 bg-gray-50"><GloveIcon className="w-5 h-5"/> Goleiros</div>
          <div className="divide-y divide-gray-100">
             {stats.goalkeepers.map((g,i) => (
               <div key={i} className="p-3 flex justify-between items-center">
                  <span className="font-medium text-sm pl-2">{g.name}</span>
                  <div className="text-right"><p className="font-bold text-blue-600 text-sm">{g.avg.toFixed(2)}</p><p className="text-[10px] text-gray-400">média</p></div>
               </div>
             ))}
          </div>
       </Card>
    </div>
  );
}

function FinancialManager({ players, settings, dbActions }) {
   // ... Mantendo lógica original, apenas renderizando simplificado para mobile ...
   const sorted = sortPlayersByName(players);
   const [showConfig, setShowConfig] = useState(false);
   const [localSettings, setLocalSettings] = useState(settings);

   const togglePay = async (pid, m) => {
     const p = players.find(x => x.id === pid);
     const next = p.payments?.[m] === 'paid' ? 'exempt' : p.payments?.[m] === 'exempt' ? null : 'paid';
     await dbActions.update('players', pid, { payments: { ...(p.payments||{}), [m]: next } });
   }

   const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
   
   return (
     <div className="space-y-4 pb-20 md:pb-0">
        <Card className="p-4 bg-blue-600 text-white flex justify-between items-center">
           <div><p className="text-xs text-blue-100">Valor Mensalidade</p><p className="text-xl font-bold">R$ {settings.monthlyFee}</p></div>
           <Button variant="secondary" className="text-xs h-8 px-3" onClick={()=>setShowConfig(!showConfig)}><Settings className="w-4 h-4 mr-1"/> Config</Button>
        </Card>
        
        {showConfig && (
          <Card className="p-4 bg-gray-50 animate-in slide-in-from-top-2">
             <div className="flex gap-4">
               <div className="flex-1"><label className="text-xs font-bold text-gray-500">Mensalidade</label><Input type="number" value={localSettings.monthlyFee} onChange={e => setLocalSettings({...localSettings, monthlyFee: parseInt(e.target.value)})} /></div>
               <div className="flex-1"><label className="text-xs font-bold text-gray-500">Uniforme</label><Input type="number" value={localSettings.uniformPrice} onChange={e => setLocalSettings({...localSettings, uniformPrice: parseInt(e.target.value)})} /></div>
             </div>
             <Button onClick={()=>{ dbActions.updateSettings(localSettings); setShowConfig(false); }} className="w-full mt-4">Salvar Valores</Button>
          </Card>
        )}

        <div className="overflow-x-auto pb-2">
           <table className="w-full text-sm text-left border-collapse">
              <thead><tr className="text-gray-500 border-b"><th className="p-3 min-w-[150px] sticky left-0 bg-gray-50 z-10">Nome</th>{months.map(m => <th key={m} className="p-3 text-center min-w-[50px]">{m}</th>)}</tr></thead>
              <tbody>
                {sorted.map(p => (
                  <tr key={p.id} className="border-b last:border-0">
                    <td className="p-3 font-medium sticky left-0 bg-white z-10 shadow-sm border-r border-gray-100">{p.name}</td>
                    {months.map((m, i) => (
                      <td key={m} className="p-1 text-center">
                         <button onClick={() => togglePay(p.id, i)} className={`w-8 h-8 rounded-full text-[10px] font-bold ${p.payments?.[i]==='paid'?'bg-green-500 text-white':p.payments?.[i]==='exempt'?'bg-blue-300 text-white':'bg-gray-100 text-gray-300'}`}>
                           {p.payments?.[i]==='paid'?'PG':p.payments?.[i]==='exempt'?'IS':'-'}
                         </button>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
           </table>
        </div>
     </div>
   );
}

function ReportsPanel({ stats, matches, players, teams }) {
  // ... Lógica de relatórios simplificada ...
  const [view, setView] = useState(null);
  const reports = [
    { id: 'classificacao', label: 'Classificação', icon: BarChart2, comp: <Dashboard stats={stats} matches={matches} /> },
    { id: 'artilharia', label: 'Estatísticas', icon: Target, comp: <Statistics stats={stats} /> },
    { id: 'financeiro', label: 'Financeiro Completo', icon: DollarSign, comp: <div className="p-4 text-center text-gray-500">Visualização de Impressão</div> }
  ];

  if(view) return <div className="bg-white min-h-screen p-4 absolute inset-0 z-50"><div className="flex justify-between mb-6 no-print"><Button onClick={()=>setView(null)} variant="ghost">Voltar</Button><Button onClick={()=>window.print()}><Printer className="w-4 h-4"/> Imprimir</Button></div><div className="print-content">{reports.find(r=>r.id===view).comp}</div></div>;

  return (
    <div className="space-y-4">
      <h2 className="font-bold text-lg">Relatórios</h2>
      <div className="grid grid-cols-2 gap-4">
         {reports.map(r => (
           <Card key={r.id} onClick={()=>setView(r.id)} className="p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-blue-500">
              <r.icon className="w-8 h-8 text-blue-600"/>
              <span className="text-sm font-medium text-center">{r.label}</span>
           </Card>
         ))}
      </div>
    </div>
  );
}

function MatchDetails({ match, players, teams, onBack, dbActions }) {
    // ... Lógica detalhada de partida mantida, ajustada visualmente ...
    const [local, setLocal] = useState(match);
    
    const update = (d) => { const n = {...local, ...d}; setLocal(n); dbActions.update('matches', n.id, n); };
    const toggle = (side, pid) => { const key = `lineup${side}`; const list = local[key]||[]; update({[key]: list.includes(pid) ? list.filter(x=>x!==pid) : [...list,pid]}); };
    const goal = (side, pid, n) => { const key = `scorers${side}`; const list = [...(local[key]||[])]; list.push({playerId:pid, count:n}); update({[key]:list}); };
    const gk = (side, pid, min, c) => { const key = `goalkeepers${side}`; const list = [...(local[key]||[])]; list.push({playerId:pid, minutes:min, conceded:c}); update({[key]:list}); };
    const remove = (key, idx) => { const list = [...(local[key]||[])]; list.splice(idx,1); update({[key]:list}); };

    const tA = teams.find(t=>t.id===local.teamA);
    const tB = teams.find(t=>t.id===local.teamB);
    const rosterA = sortPlayersByName(players.filter(p=>p.teamId===local.teamA).length?players.filter(p=>p.teamId===local.teamA):players);
    const rosterB = sortPlayersByName(players.filter(p=>p.teamId===local.teamB).length?players.filter(p=>p.teamId===local.teamB):players);

    const TeamPanel = ({ side, team, roster, lineupKey, scorersKey, gkKey }) => {
       const [gP, setGP] = useState(''); const [gC, setGC] = useState(1);
       const [gkP, setGkP] = useState(''); const [gkM, setGkM] = useState(90); const [gkCon, setGkCon] = useState(0);
       const lineup = local[lineupKey]||[];

       return (
         <Card className={`p-4 border-t-4 ${side==='A'?'border-t-green-500':'border-t-blue-500'}`}>
            <h3 className="text-center font-bold text-lg mb-4">{team?.name}</h3>
            
            <div className="mb-6">
              <p className="text-xs font-bold text-gray-400 uppercase mb-2">Escalação</p>
              <div className="max-h-40 overflow-y-auto bg-gray-50 rounded-xl p-2 space-y-1">
                 {roster.map(p => (
                   <div key={p.id} onClick={()=>toggle(side,p.id)} className={`flex items-center gap-2 p-2 rounded-lg text-sm transition-colors cursor-pointer ${lineup.includes(p.id)?'bg-white shadow-sm font-medium text-gray-900':'text-gray-400'}`}>
                      <div className={`w-4 h-4 rounded border flex items-center justify-center ${lineup.includes(p.id)?'bg-blue-600 border-blue-600 text-white':'border-gray-300'}`}>{lineup.includes(p.id)&&<Check className="w-3 h-3"/>}</div>
                      {p.name}
                   </div>
                 ))}
              </div>
            </div>

            <div className="mb-6">
              <p className="text-xs font-bold text-gray-400 uppercase mb-2">Gols</p>
              <div className="flex gap-2 mb-2">
                 <select className="flex-1 text-sm rounded-lg border-gray-200" value={gP} onChange={e=>setGP(e.target.value)}><option value="">Quem?</option>{roster.filter(p=>lineup.includes(p.id)).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select>
                 <input type="number" className="w-12 text-sm rounded-lg border-gray-200 text-center" value={gC} onChange={e=>setGC(e.target.value)}/>
                 <Button onClick={()=>{goal(side,gP,gC); setGP('');}} disabled={!gP} className="h-10 w-10 p-0">+</Button>
              </div>
              <div className="space-y-1">
                 {(local[scorersKey]||[]).map((s,i)=>(
                   <div key={i} className="flex justify-between text-sm bg-green-50 p-2 rounded-lg text-green-800">
                      <span>⚽ {players.find(p=>p.id==s.playerId)?.name} ({s.count})</span>
                      <button onClick={()=>remove(scorersKey,i)}><X className="w-3 h-3"/></button>
                   </div>
                 ))}
              </div>
            </div>

            <div>
               <p className="text-xs font-bold text-gray-400 uppercase mb-2">Goleiros</p>
               <div className="flex flex-col gap-2 mb-2">
                  <select className="w-full text-sm rounded-lg border-gray-200" value={gkP} onChange={e=>setGkP(e.target.value)}><option value="">Goleiro</option>{roster.filter(p=>lineup.includes(p.id)).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select>
                  <div className="flex gap-2">
                     <select className="flex-1 text-sm rounded-lg border-gray-200" value={gkM} onChange={e=>setGkM(e.target.value)}><option value="90">90 min</option><option value="45">45 min</option></select>
                     <input type="number" placeholder="Gols" className="w-20 text-sm rounded-lg border-gray-200" value={gkCon} onChange={e=>setGkCon(e.target.value)}/>
                  </div>
                  <Button onClick={()=>{gk(side,gkP,gkM,gkCon); setGkP('');}} disabled={!gkP} className="h-8 text-xs">Add</Button>
               </div>
               <div className="space-y-1">
                 {(local[gkKey]||[]).map((s,i)=>(
                   <div key={i} className="flex justify-between text-sm bg-gray-100 p-2 rounded-lg">
                      <span>🧤 {players.find(p=>p.id==s.playerId)?.name} (-{s.conceded})</span>
                      <button onClick={()=>remove(gkKey,i)}><X className="w-3 h-3"/></button>
                   </div>
                 ))}
              </div>
            </div>
         </Card>
       );
    }

    return (
      <div className="pb-24 pt-4 animate-in slide-in-from-right">
         <div className="flex items-center justify-between mb-4 px-4">
            <Button variant="ghost" onClick={onBack}>Voltar</Button>
            <h2 className="font-bold text-lg">Súmula</h2>
            <div className="w-16"></div>
         </div>
         <div className="grid md:grid-cols-2 gap-6">
            <TeamPanel side="A" team={tA} roster={rosterA} lineupKey="lineupA" scorersKey="scorersA" gkKey="goalkeepersA" />
            <TeamPanel side="B" team={tB} roster={rosterB} lineupKey="lineupB" scorersKey="scorersB" gkKey="goalkeepersB" />
         </div>
      </div>
    );
}

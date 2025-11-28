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
  Phone,
  Cake
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
  apiKey: "AIzaSyAc-9ED7a9_FJH2mgTGqY9vrydk0nz1Dk4",
  authDomain: "gestorfut-cloud.firebaseapp.com",
  projectId: "gestorfut-cloud",
  storageBucket: "gestorfut-cloud.firebasestorage.app",
  messagingSenderId: "432020965376",
  appId: "1:432020965376:web:6bceeabf1d65bb906c70e5"
};
// ==================================================================================

// --- Helpers ---
const toTitleCase = (str) => str ? str.replace(/(?:^|\s)\S/g, (char) => char.toUpperCase()) : '';
const sortPlayersByName = (list) => [...list].sort((a, b) => (a.name || '').localeCompare(b.name || ''));
const getTeamBgColor = (teamColorClass) => {
  if (!teamColorClass) return 'bg-white border-gray-100';
  const colorMap = { 'text-blue-600': 'bg-blue-50 border-blue-100', 'text-red-600': 'bg-red-50 border-red-100', 'text-green-600': 'bg-green-50 border-green-100', 'text-yellow-500': 'bg-yellow-50 border-yellow-100', 'text-purple-600': 'bg-purple-50 border-purple-100', 'text-orange-500': 'bg-orange-50 border-orange-100', 'text-gray-600': 'bg-gray-100 border-gray-200', 'text-gray-900': 'bg-gray-100 border-gray-300' };
  return colorMap[teamColorClass] || 'bg-white border-gray-200';
};
const SoccerBallIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><path d="M12 7l-2.5 4h5L12 7z" /><path d="M12 17l-2.5-4h5L12 17z" /><path d="M5 10l4 2.5-1.5 4.5L5 10z" /><path d="M19 10l-4 2.5 1.5 4.5L19 10z" /></svg>);
const GloveIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 12v-5a2 2 0 0 0-4 0v5"></path><path d="M15 12v-7a2 2 0 0 0-4 0v7"></path><path d="M11 12v-5a2 2 0 0 0-4 0v5"></path><path d="M7 12v-3a2 2 0 0 0-4 0v3c0 4.5 3.5 8 8 8h2c4.5 0 8-3.5 8-8z"></path><line x1="3" y1="17" x2="21" y2="17"></line></svg>);

// --- Componentes UI ---
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
    danger: "bg-red-50 text-red-600 border border-red-100 hover:bg-red-50",
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
  const [isProcessing, setIsProcessing] = useState(false);
  if (!isOpen) return null;
  const handleConfirm = async () => { setIsProcessing(true); await onConfirm(); setIsProcessing(false); };
  return (
    <div className="fixed inset-0 z-[200] bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in">
      <div className="bg-white w-full max-w-xs rounded-3xl p-6 shadow-2xl animate-in zoom-in-95">
        <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center text-red-600 mb-4 mx-auto"><AlertTriangle className="w-6 h-6" /></div>
        <h3 className="text-lg font-bold text-center text-gray-800 mb-2">{title}</h3>
        <p className="text-gray-500 text-center text-sm mb-6">{message}</p>
        <div className="flex gap-3">
          <Button variant="secondary" onClick={onCancel} className="flex-1" disabled={isProcessing}>Cancelar</Button>
          <Button variant="danger" onClick={handleConfirm} className="flex-1 bg-red-600 text-white border-0" disabled={isProcessing}>
             {isProcessing ? <Loader2 className="w-4 h-4 animate-spin"/> : 'Sim, Excluir'}
          </Button>
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
  
  // Modal Handler Robusto
  const requestConfirm = (title, message, action) => {
    setConfirmModal({ 
      isOpen: true, 
      title, 
      message, 
      onConfirm: async () => { 
        try { 
          await action(); 
          setConfirmModal(prev => ({ ...prev, isOpen: false })); 
        } catch (e) { 
          showToast(e.message, 'error'); 
          setConfirmModal(prev => ({ ...prev, isOpen: false }));
        } 
      } 
    });
  };

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

  // --- PADRONIZAÇÃO DAS AÇÕES (GENÉRICAS) ---
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

      <main className="flex-1 overflow-y-auto h-screen pb-24 md:pb-0">
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
            <h3 className="font-bold text-gray-800 flex items-center gap-2"><BarChart2 className="w-5 h-5 text-yellow-500" /> Artilharia</h3>
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
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [playerToAdd, setPlayerToAdd] = useState('');

  const colors = [
    { id: 'blue', class: 'text-blue-600', bg: 'bg-blue-600' },
    { id: 'red', class: 'text-red-600', bg: 'bg-red-600' },
    { id: 'green', class: 'text-green-600', bg: 'bg-green-600' },
    { id: 'yellow', class: 'text-yellow-500', bg: 'bg-yellow-500' },
    { id: 'purple', class: 'text-purple-600', bg: 'bg-purple-600' },
    { id: 'orange', class: 'text-orange-500', bg: 'bg-orange-500' },
    { id: 'gray', class: 'text-gray-600', bg: 'bg-gray-600' },
    { id: 'black', class: 'text-gray-900', bg: 'bg-gray-900' },
  ];

  const handleSave = async (e) => {
    e.preventDefault();
    if (!name) return showToast('Nome obrigatório', 'error');
    try {
      if (editingId) await dbActions.update('teams', editingId, { name, color: selectedColor });
      else await dbActions.add('teams', { name, id: Date.now().toString(), color: selectedColor });
      setName(''); setEditingId(null); setSelectedColor('text-blue-600');
    } catch (err) { showToast('Erro ao salvar', 'error'); }
  };

  const handleEdit = (t) => { setEditingId(t.id); setName(t.name); setSelectedColor(t.color || 'text-blue-600'); window.scrollTo(0,0); };
  
  // CORRIGIDO: Usa dbActions.del (genérico)
  const handleDelete = (id) => requestConfirm("Excluir Time", "Isso removerá o time permanentemente.", () => dbActions.del('teams', id));
  
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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-20 md:pb-0">
        {teams.map(team => (
          <Card key={team.id} onClick={() => setSelectedTeamId(team.id)} className={`p-4 flex items-center justify-between cursor-pointer hover:border-blue-300 transition-colors ${selectedTeamId === team.id ? 'ring-2 ring-blue-500' : ''}`}>
            <div className="flex items-center gap-4">
              <div className={`p-3 rounded-xl bg-gray-50 ${team.color}`}><Shirt className="w-6 h-6" /></div>
              <div><h4 className="font-bold text-gray-900">{team.name}</h4><p className="text-xs text-gray-500">{players.filter(p => p.teamId === team.id).length} jogadores</p></div>
            </div>
            <div className="flex gap-1">
               <button type="button" onClick={(e) => { e.stopPropagation(); handleEdit(team); }} className="p-2 hover:bg-gray-100 rounded-lg text-gray-400 hover:text-blue-600 z-10 relative"><Edit className="w-5 h-5"/></button>
               <button type="button" onClick={(e) => { e.stopPropagation(); handleDelete(team.id); }} className="p-2 hover:bg-red-50 rounded-lg text-red-400 hover:text-red-500 z-10 relative"><Trash2 className="w-5 h-5"/></button>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

function MatchManager({ matches, teams, players, dbActions, requestConfirm, showToast }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingMatchId, setEditingMatchId] = useState(null);
  const [activeMatchId, setActiveMatchId] = useState(null);
  const [matchForm, setMatchForm] = useState({ date: new Date().toISOString().split('T')[0], round: '', teamA: '', teamB: '', scoreA: 0, scoreB: 0 });

  const resetForm = () => { 
    const nextRound = matches.length > 0 ? matches.length + 1 : 1;
    setMatchForm({ date: new Date().toISOString().split('T')[0], round: nextRound.toString(), teamA: '', teamB: '', scoreA: 0, scoreB: 0 }); 
    setIsAdding(false); 
    setEditingMatchId(null); 
  };

  const handleSaveMatch = async (e) => {
    e.preventDefault(); // Prevents reload
    if (!matchForm.teamA || !matchForm.teamB) return showToast("Selecione os dois times", "error");
    const matchData = { ...matchForm, scoreA: parseInt(matchForm.scoreA), scoreB: parseInt(matchForm.scoreB) };
    try {
      if (editingMatchId) await dbActions.update('matches', editingMatchId, matchData);
      else await dbActions.add('matches', { ...matchData, lineupA: [], lineupB: [], scorersA: [], scorersB: [], goalkeepersA: [], goalkeepersB: [] });
      resetForm();
    } catch (err) { showToast("Erro ao salvar rodada", "error"); }
  };

  const startEdit = (m) => { setMatchForm({ date: m.date, round: m.round || '', teamA: m.teamA, teamB: m.teamB, scoreA: m.scoreA, scoreB: m.scoreB }); setEditingMatchId(m.id); setIsAdding(true); };
  // CORRIGIDO: Usa dbActions.del
  const handleDelete = (id) => requestConfirm("Excluir Partida", "Todos os dados (gols, súmula) serão perdidos.", () => dbActions.del('matches', id));

  if (activeMatchId) {
    const match = matches.find(m => m.id === activeMatchId);
    if (!match) { setTimeout(() => setActiveMatchId(null), 0); return null; }
    return <MatchDetails match={match} players={players} teams={teams} onBack={() => setActiveMatchId(null)} dbActions={dbActions} />;
  }

  return (
    <div className="space-y-6 pb-20 md:pb-0">
      {isAdding ? (
        <Card className="p-5 animate-in slide-in-from-bottom-10 fixed inset-0 md:relative md:inset-auto z-50 md:z-0 flex flex-col bg-gray-50 md:bg-white">
          <div className="flex justify-between items-center mb-6 md:mb-4">
             <h3 className="font-bold text-lg">{editingMatchId ? 'Editar' : 'Novo Jogo'}</h3>
             <button onClick={() => setIsAdding(false)} className="p-2 bg-gray-200 rounded-full"><X className="w-5 h-5"/></button>
          </div>
          <div className="flex-1 space-y-4 overflow-y-auto">
             <div className="grid grid-cols-2 gap-4">
               <div><label className="text-xs font-bold text-gray-500 uppercase">Data</label><Input type="date" value={matchForm.date} onChange={e => setMatchForm({...matchForm, date: e.target.value})} /></div>
               <div><label className="text-xs font-bold text-gray-500 uppercase">Rodada Nº</label><Input type="number" value={matchForm.round} onChange={e => setMatchForm({...matchForm, round: e.target.value})} placeholder="Ex: 1" /></div>
             </div>
             <div className="grid grid-cols-2 gap-4">
                <div><label className="text-xs font-bold text-gray-500 uppercase">Mandante</label><select className="w-full h-12 rounded-xl border-gray-300" value={matchForm.teamA} onChange={e => setMatchForm({...matchForm, teamA: e.target.value})}><option value="">Selecione...</option>{teams.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
                <div><label className="text-xs font-bold text-gray-500 uppercase">Visitante</label><select className="w-full h-12 rounded-xl border-gray-300" value={matchForm.teamB} onChange={e => setMatchForm({...matchForm, teamB: e.target.value})}><option value="">Selecione...</option>{teams.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
             </div>
             <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-gray-200 justify-center">
                <Input type="number" className="w-16 text-center font-bold text-xl p-0 border-0" value={matchForm.scoreA} onChange={e => setMatchForm({...matchForm, scoreA: e.target.value})} />
                <span className="text-gray-300 text-2xl">X</span>
                <Input type="number" className="w-16 text-center font-bold text-xl p-0 border-0" value={matchForm.scoreB} onChange={e => setMatchForm({...matchForm, scoreB: e.target.value})} />
             </div>
          </div>
          <Button onClick={handleSaveMatch} className="mt-4 w-full">Salvar Jogo</Button>
        </Card>
      ) : (
        <Button variant="fab" onClick={() => { resetForm(); setEditingMatchId(null); setIsAdding(true); }}><Plus className="w-6 h-6" /></Button>
      )}

      <div className="space-y-3">
        {matches.map(m => {
          const tA = teams.find(t => t.id === m.teamA)?.name || 'Excluído';
          const tB = teams.find(t => t.id === m.teamB)?.name || 'Excluído';
          return (
            <Card key={m.id} className="flex flex-col" onClick={() => setActiveMatchId(m.id)}>
              <div className="p-2 bg-gray-50 border-b border-gray-100 flex justify-between items-center text-xs text-gray-500 px-4">
                 <span className="font-bold text-blue-600">RODADA {m.round || '?'}</span>
                 <span className="text-gray-400">{new Date(m.date).toLocaleDateString('pt-BR')}</span>
              </div>
              <div className="p-4 flex justify-between items-center">
                 <span className={`w-1/3 text-right font-bold truncate ${parseInt(m.scoreA) > parseInt(m.scoreB) ? 'text-gray-900' : 'text-gray-500'}`}>{tA}</span>
                 <div className="bg-gray-100 px-3 py-1 rounded-lg font-mono font-bold text-gray-800 flex gap-2 shadow-inner"><span>{m.scoreA}</span><span className="text-gray-300">:</span><span>{m.scoreB}</span></div>
                 <span className={`w-1/3 text-left font-bold truncate ${parseInt(m.scoreB) > parseInt(m.scoreA) ? 'text-gray-900' : 'text-gray-500'}`}>{tB}</span>
              </div>
              <div className="px-4 pb-2 flex justify-end gap-2">
                 <button type="button" onClick={(e) => { e.stopPropagation(); startEdit(m); }} className="p-2 hover:bg-blue-50 text-blue-400 rounded-full"><Edit className="w-4 h-4"/></button>
                 <button type="button" onClick={(e) => { e.stopPropagation(); handleDelete(m.id); }} className="p-2 hover:bg-red-50 text-red-400 rounded-full"><Trash2 className="w-4 h-4"/></button>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function MatchDetails({ match, players, teams, onBack, dbActions }) {
  const [localMatch, setLocalMatch] = useState(match);
  
  if (!match) return <div>Carregando...</div>;

  const tA = teams.find(t => t.id == localMatch.teamA);
  const tB = teams.find(t => t.id == localMatch.teamB);

  const getPotentialPlayers = (teamId) => sortPlayersByName(players.filter(p => p.teamId == teamId).length > 0 ? players.filter(p => p.teamId == teamId) : players);
  const potentialA = getPotentialPlayers(localMatch.teamA);
  const potentialB = getPotentialPlayers(localMatch.teamB);

  const handleShare = () => {
    const date = new Date(localMatch.date).toLocaleDateString('pt-BR');
    const tAName = tA?.name || 'Time A';
    const tBName = tB?.name || 'Time B';
    
    let text = `⚽ *SÚMULA DO RACHÃO* - ${date}\n\n`;
    text += `🏆 *${tAName} ${localMatch.scoreA}* x *${localMatch.scoreB} ${tBName}*\n\n`;
    
    const scorersA = localMatch.scorersA || [];
    const scorersB = localMatch.scorersB || [];
    const allScorers = [...scorersA, ...scorersB];
    
    if (allScorers.length > 0) {
        text += `🥅 *Artilharia:*\n`;
        if(scorersA.length > 0) {
            text += `_${tAName}:_\n`;
            scorersA.forEach(s => {
                const p = players.find(p => p.id == s.playerId);
                if(p) text += `  ⚽ ${p.name} (${s.count})\n`;
            });
        }
        if(scorersB.length > 0) {
            text += `_${tBName}:_\n`;
            scorersB.forEach(s => {
                const p = players.find(p => p.id == s.playerId);
                if(p) text += `  ⚽ ${p.name} (${s.count})\n`;
            });
        }
        text += `\n`;
    }
    
    const gksA = localMatch.goalkeepersA || [];
    const gksB = localMatch.goalkeepersB || [];
    const allGks = [...gksA, ...gksB];
    
    if (allGks.length > 0) {
        text += `🧤 *Goleiros:*\n`;
        allGks.forEach(g => {
             const p = players.find(p => p.id == g.playerId);
             if(p) text += `  • ${p.name}: -${g.conceded} gols\n`;
        });
    }
    
    const url = `https://wa.me/?text=${encodeURIComponent(text)}`;
    window.open(url, '_blank');
  };

  // CORRIGIDO: Usa dbActions.update (genérico)
  const updateLocal = (newData) => { const updated = { ...localMatch, ...newData }; setLocalMatch(updated); dbActions.update('matches', updated.id, updated); };
  const togglePresence = (side, pid) => { const key = `lineup${side}`; const list = localMatch[key] || []; updateLocal({ [key]: list.includes(pid) ? list.filter(id => id !== pid) : [...list, pid] }); };
  const addGoal = (side, pid, count) => { if (!pid || count < 1) return; const key = `scorers${side}`; const list = [...(localMatch[key] || [])]; const existing = list.find(s => s.playerId == pid); if (existing) existing.count = parseInt(existing.count) + parseInt(count); else list.push({ playerId: pid, count: parseInt(count) }); updateLocal({ [key]: list }); };
  const addGK = (side, pid, min, conc) => { if (!pid) return; const key = `goalkeepers${side}`; const list = [...(localMatch[key] || [])]; list.push({ playerId: pid, minutes: min, conceded: conc }); updateLocal({ [key]: list }); };
  const removeItem = (listKey, idx) => { const list = [...(localMatch[listKey] || [])]; list.splice(idx, 1); updateLocal({ [listKey]: list }); };

  const renderTeamColumn = (side, team, potentialRoster, lineupKey, scorersKey, gkKey) => {
    const lineup = localMatch[lineupKey] || [];
    const scorers = localMatch[scorersKey] || [];
    const gks = localMatch[gkKey] || [];
    const [goalPlayer, setGoalPlayer] = useState('');
    const [goalCount, setGoalCount] = useState(1);
    const [gkPlayer, setGkPlayer] = useState('');
    const [gkMin, setGkMin] = useState(90);
    const [gkConc, setGkConc] = useState(0);
    const bgClass = getTeamBgColor(team?.color);
    const dropdownPlayers = sortPlayersByName(potentialRoster.length > 0 ? potentialRoster.filter(p => lineup.includes(p.id)) : potentialRoster);

    return (
      <div className={`flex-1 p-5 rounded-xl border shadow-sm transition-colors ${bgClass}`}>
        <div className="text-xl font-bold border-b border-gray-200/50 pb-4 mb-6 text-center flex items-center justify-center gap-2"><div className={`w-3 h-3 rounded-full ${team?.color?.replace('text-', 'bg-') || 'bg-gray-400'}`}></div>{team?.name || 'Time'}</div>

        <div className="mb-8">
          <h4 className="font-bold text-gray-700 text-xs uppercase tracking-wider mb-3 flex items-center gap-2"><Users className="w-4 h-4"/> Escalação</h4>
          <div className="bg-white/80 backdrop-blur-sm rounded-lg border border-gray-200/50 shadow-sm overflow-hidden">
            <div className="max-h-60 overflow-y-auto p-2 space-y-1 custom-scrollbar">
              {potentialRoster.map(p => (
                <div key={p.id} onClick={() => togglePresence(side, p.id)} className={`flex items-center gap-3 text-sm p-2 rounded-md cursor-pointer transition-colors select-none ${lineup.includes(p.id) ? 'bg-gray-100 font-medium text-gray-900' : 'hover:bg-gray-50 text-gray-500'}`}>
                  <div className={`w-5 h-5 rounded flex items-center justify-center border ${lineup.includes(p.id) ? 'border-gray-800 bg-gray-800 text-white' : 'border-gray-300 bg-white'}`}>{lineup.includes(p.id) && <Check className="w-3 h-3" />}</div>
                  {p.name}
                </div>
              ))}
            </div>
            <div className="bg-gray-50/50 p-2 text-right text-xs font-medium text-gray-500 border-t border-gray-200">{lineup.length} selecionados</div>
          </div>
        </div>

        <div className="mb-8">
          <h4 className="font-bold text-gray-700 text-xs uppercase tracking-wider mb-3 flex items-center gap-2"><SoccerBallIcon className="w-4 h-4" /> Gols</h4>
          <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg border border-gray-200/50 shadow-sm">
            <div className="flex gap-2 mb-3"><select className="flex-1 text-sm border border-gray-300 rounded px-2 py-1.5 bg-white outline-none" value={goalPlayer} onChange={e => setGoalPlayer(e.target.value)}><option value="">Quem?</option>{dropdownPlayers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select><input type="number" className="w-16 text-sm border border-gray-300 rounded px-2 py-1.5 text-center" value={goalCount} onChange={e => setGoalCount(e.target.value)} min="1" /><button onClick={() => { addGoal(side, goalPlayer, goalCount); setGoalPlayer(''); setGoalCount(1); }} disabled={!goalPlayer} className="bg-gray-800 text-white px-3 rounded text-sm">+</button></div>
            <div className="space-y-2">{scorers.map((s, i) => (<div key={i} className="flex justify-between items-center bg-gray-50 px-3 py-2 text-sm rounded border border-gray-100"><span className="font-medium text-gray-700">{players.find(p => p.id == s.playerId)?.name || '?'}</span><div className="flex items-center gap-3"><span className="bg-green-100 text-green-700 text-xs px-2 py-0.5 rounded-full font-bold">{s.count}</span><button onClick={() => removeItem(scorersKey, i)} className="text-gray-400 hover:text-red-500"><X className="w-3 h-3"/></button></div></div>))}</div>
          </div>
        </div>

        <div>
          <h4 className="font-bold text-gray-700 text-xs uppercase tracking-wider mb-3 flex items-center gap-2"><GloveIcon className="w-4 h-4" /> Goleiros</h4>
          <div className="bg-white/80 backdrop-blur-sm p-3 rounded-lg border border-gray-200/50 shadow-sm">
            <div className="flex flex-col gap-2 mb-3"><select className="w-full text-sm border border-gray-300 rounded px-2 py-1.5 bg-white outline-none" value={gkPlayer} onChange={e => setGkPlayer(e.target.value)}><option value="">Selecione...</option>{dropdownPlayers.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select><div className="flex gap-2"><select className="w-1/2 text-sm border border-gray-300 rounded px-2 py-1.5 bg-white" value={gkMin} onChange={e => setGkMin(e.target.value)}><option value="90">90 min</option><option value="45">45 min</option></select><input type="number" placeholder="Gols" className="w-1/2 text-sm border border-gray-300 rounded px-2 py-1.5" value={gkConc} onChange={e => setGkConc(e.target.value)} min="0" /></div><button onClick={() => { addGK(side, gkPlayer, gkMin, gkConc); setGkPlayer(''); }} disabled={!gkPlayer} className="w-full bg-gray-800 text-white py-1.5 rounded text-sm mt-1">Add Stats</button></div>
            <div className="space-y-2">{gks.map((g, i) => (<div key={i} className="flex justify-between items-center bg-gray-50 px-3 py-2 text-sm rounded border border-gray-100"><div><div className="font-medium text-gray-700">{players.find(p => p.id == g.playerId)?.name || '?'}</div><div className="text-[10px] text-gray-500">{g.minutes} min • {g.conceded} gols</div></div><button onClick={() => removeItem(gkKey, i)} className="text-gray-400 hover:text-red-500"><X className="w-3 h-3"/></button></div>))}</div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="space-y-4 animate-in fade-in slide-in-from-right-8 duration-300">
       <div className="flex justify-between items-center bg-white p-4 rounded-xl shadow-sm border border-gray-200 sticky top-0 z-20">
         <Button variant="ghost" onClick={onBack}>← Voltar</Button>
         <h2 className="font-bold text-xl text-gray-800 hidden md:block">Súmula da Rodada</h2>
         <Button variant="whatsapp" onClick={handleShare}><Share2 className="w-4 h-4"/> Zap</Button>
       </div>
       <div className="flex flex-col md:flex-row gap-6 pb-10">
          {renderTeamColumn('A', tA, potentialA, 'lineupA', 'scorersA', 'goalkeepersA')}
          <div className="hidden md:flex items-center justify-center text-gray-300 font-black text-2xl">X</div>
          {renderTeamColumn('B', tB, potentialB, 'lineupB', 'scorersB', 'goalkeepersB')}
       </div>
    </div>
  );
}

function FinancialManager({ players, settings, dbActions }) {
  const sortedPlayers = sortPlayersByName(players);
  const [editingSettings, setEditingSettings] = useState(false);
  const [tempSettings, setTempSettings] = useState(settings);
  const [filters, setFilters] = useState({ name: '', month: '', status: '' });
  const monthKeys = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];

  const togglePayment = async (player, monthIndex) => {
    const current = player.payments?.[monthIndex];
    const next = current === 'paid' ? 'exempt' : current === 'exempt' ? null : 'paid';
    await dbActions.update('players', player.id, { payments: { ...(player.payments || {}), [monthIndex]: next } });
  };
  const toggleUniform = async (player) => await dbActions.update('players', player.id, { uniformPaid: !player.uniformPaid });
  const saveSettings = async () => { await dbActions.updateSettings(tempSettings); setEditingSettings(false); };
  const calculateTotalPaid = (player) => {
    if (filters.month !== '') return (player.payments?.[parseInt(filters.month)] === 'paid') ? (settings.monthlyFee || 0) : 0;
    return (Object.values(player.payments || {}).filter(s => s === 'paid').length * (settings.monthlyFee || 0)) + (player.uniformPaid ? (settings.uniformPrice || 0) : 0);
  };
  const filteredList = sortedPlayers.filter(p => {
    const matchName = p.name.toLowerCase().includes(filters.name.toLowerCase());
    if (filters.month !== '' && filters.status !== '') {
      const status = p.payments?.[parseInt(filters.month)];
      if (filters.status === 'paid' && status !== 'paid') return false;
      if (filters.status === 'pending' && status) return false;
      if (filters.status === 'exempt' && status !== 'exempt') return false;
    }
    return matchName;
  });
  const totalReceived = filteredList.reduce((acc, p) => acc + calculateTotalPaid(p), 0);

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
         <h2 className="text-xl font-bold text-gray-800">Controle Financeiro</h2>
         <div className="flex gap-4 bg-white p-2 rounded-lg border border-gray-200 shadow-sm items-center">
            <div className="text-sm"><span className="text-gray-500">Mensalidade:</span> <span className="font-bold text-green-700">R$ {settings.monthlyFee}</span></div>
            <div className="w-px h-4 bg-gray-300"></div>
            <div className="text-sm"><span className="text-gray-500">Uniforme:</span> <span className="font-bold text-blue-700">R$ {settings.uniformPrice}</span></div>
            <Button variant="secondary" className="h-8 text-xs" onClick={() => { setTempSettings(settings); setEditingSettings(!editingSettings); }}><Settings className="w-3 h-3" /> Configurar</Button>
         </div>
      </div>
      <div className="bg-white p-4 rounded-xl border border-gray-200 shadow-sm space-y-4">
        <div className="flex flex-wrap gap-4 items-center">
          <div className="flex-1 min-w-[200px] relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input placeholder="Buscar..." className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg" value={filters.name} onChange={e => setFilters({...filters, name: e.target.value})} /></div>
          <div className="w-32"><select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg" value={filters.month} onChange={e => setFilters({...filters, month: e.target.value, status: ''})}><option value="">Todos Meses</option>{monthKeys.map((m, i) => <option key={i} value={i}>{m}</option>)}</select></div>
          {filters.month !== '' && <div className="w-32"><select className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg" value={filters.status} onChange={e => setFilters({...filters, status: e.target.value})}><option value="">Status...</option><option value="paid">Pago</option><option value="pending">Pendente</option><option value="exempt">Isento</option></select></div>}
          {(filters.name || filters.month) && <Button variant="ghost" onClick={() => setFilters({ name: '', month: '', status: '' })} className="text-xs">Limpar</Button>}
        </div>
        <div className="flex gap-6 pt-2 border-t border-gray-100"><div><p className="text-[10px] uppercase font-bold text-gray-400">Total Pago</p><p className="text-2xl font-bold text-green-600">R$ {totalReceived.toFixed(2)}</p></div></div>
      </div>
      {editingSettings && <Card className="p-4 bg-gray-50 border-gray-200"><h3 className="font-bold text-gray-700 mb-3 text-sm">Configurar Valores</h3><div className="flex gap-4 items-end"><div><label className="text-xs font-bold text-gray-500 mb-1 block">Mensalidade (R$)</label><Input type="number" value={tempSettings.monthlyFee} onChange={e => setTempSettings({...tempSettings, monthlyFee: parseInt(e.target.value)})} /></div><div><label className="text-xs font-bold text-gray-500 mb-1 block">Uniforme (R$)</label><Input type="number" value={tempSettings.uniformPrice} onChange={e => setTempSettings({...tempSettings, uniformPrice: parseInt(e.target.value)})} /></div><Button onClick={saveSettings}>Concluir</Button></div></Card>}
      <Card className="overflow-x-auto">
        <table className="w-full text-sm text-left whitespace-nowrap"><thead className="bg-gray-100 text-gray-600 uppercase text-xs"><tr><th className="px-4 py-3 sticky left-0 bg-gray-100 z-10 font-semibold shadow-sm border-r">Nome</th><th className="px-2 py-3 text-center font-semibold bg-blue-50 text-blue-700 border-r w-24">Uniforme</th>{filters.month !== '' ? <th className="px-2 text-center min-w-[60px] font-semibold bg-yellow-50 text-yellow-700">{monthKeys[parseInt(filters.month)]}</th> : monthKeys.map((m, i) => <th key={m} className="px-2 text-center min-w-[40px] font-semibold">{m}</th>)}<th className="px-4 py-3 font-semibold text-right bg-gray-50 border-l">Total</th></tr></thead>
          <tbody className="divide-y divide-gray-100">
            {filteredList.map(p => (
              <tr key={p.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 sticky left-0 bg-white font-medium shadow-sm z-10 border-r border-gray-100">{p.name}</td>
                <td className="px-2 py-3 text-center border-r border-gray-100 bg-blue-50/30"><button onClick={() => toggleUniform(p)} className={`w-6 h-6 rounded flex items-center justify-center mx-auto border ${p.uniformPaid ? 'bg-blue-600 border-blue-600 text-white' : 'bg-white border-gray-300 text-transparent'}`}><Check className="w-4 h-4" /></button></td>
                {filters.month !== '' ? (<td className="px-2 text-center bg-yellow-50/30"><button onClick={() => togglePayment(p, parseInt(filters.month))} className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center mx-auto transition-all transform active:scale-90 shadow-sm ${p.payments?.[parseInt(filters.month)] === 'paid' ? 'bg-green-500 text-white' : p.payments?.[parseInt(filters.month)] === 'exempt' ? 'bg-blue-400 text-white' : 'bg-red-50 text-red-300'}`}>{p.payments?.[parseInt(filters.month)] === 'paid' ? 'P' : p.payments?.[parseInt(filters.month)] === 'exempt' ? 'I' : '-'}</button></td>) : (monthKeys.map((m, idx) => (<td key={idx} className="px-2 text-center"><button onClick={() => togglePayment(p, idx)} className={`w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center mx-auto transition-all transform active:scale-90 shadow-sm ${p.payments?.[idx] === 'paid' ? 'bg-green-500 text-white' : p.payments?.[idx] === 'exempt' ? 'bg-blue-400 text-white' : 'bg-red-50 text-red-300'}`}>{p.payments?.[idx] === 'paid' ? 'P' : p.payments?.[idx] === 'exempt' ? 'I' : '-'}</button></td>)))}
                <td className="px-4 py-3 text-right font-mono font-bold text-gray-700 border-l bg-gray-50">R$ {calculateTotalPaid(p).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </div>
  );
}

function ReportsPanel({ stats, matches, players, teams, settings }) {
  const [view, setView] = useState(null);
  const print = () => setTimeout(() => window.print(), 100);
  const reports = [{ id: 'classification', title: 'Classificação Geral', icon: BarChart2, component: <Dashboard stats={stats} matches={matches} /> }, { id: 'games', title: 'Jogos e Rodadas', icon: Calendar, component: <MatchManager matches={matches} teams={teams} players={players} dbActions={{}} /> }, { id: 'stats', title: 'Estatísticas', icon: Target, component: <Statistics stats={stats} /> }, { id: 'teams', title: 'Times e Elencos', icon: Shirt, component: <TeamManager teams={teams} players={players} dbActions={{}} /> }, { id: 'players', title: 'Gestão de Jogadores', icon: Users, component: <PlayerManager players={players} dbActions={{}} matches={matches} teams={teams} /> }, { id: 'financial', title: 'Controle Financeiro', icon: DollarSign, component: <FinancialManager players={players} settings={settings} dbActions={{}} /> }];
  const exportCSV = (type) => {
    let data = [], filename = `relatorio_${type}.csv`;
    if (type === 'classification') { data = [['Pos', 'Time', 'P', 'J', 'V', 'E', 'D', 'GP', 'GC', 'SG']]; stats.table.forEach((t, i) => data.push([i+1, t.name, t.p, t.j, t.v, t.e, t.d, t.gp, t.gc, t.sg])); }
    else if (type === 'players') { data = [['Nome', 'Posicao', 'Time', 'Presencas', 'Nota']]; players.forEach(p => data.push([p.name, p.position, teams.find(t => t.id === p.teamId)?.name || '-', matches.reduce((c, m) => c + ((m.lineupA?.includes(p.id) || m.lineupB?.includes(p.id)) ? 1 : 0), 0), p.rating])); }
    else if (type === 'financial') { data = [['Nome', 'Uniforme', 'Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez']]; players.forEach(p => data.push([p.name, p.uniformPaid ? 'Sim' : 'Nao', ...[0,1,2,3,4,5,6,7,8,9,10,11].map(m => p.payments?.[m] || '-')])); }
    downloadCSV(data, filename);
  };

  if (view) return (<div><div className="flex justify-between items-center mb-4 no-print"><Button onClick={() => setView(null)} variant="ghost">← Voltar</Button><div className="flex gap-2"><Button onClick={print} variant="blue"><Printer className="w-4 h-4"/> Imprimir</Button></div></div><div className="print-only-content"><div className="mb-8 text-center hidden print:block"><h1 className="text-2xl font-bold">{reports.find(r => r.id === view)?.title}</h1></div>{reports.find(r => r.id === view)?.component}</div></div>);

  return (
    <div className="space-y-6 animate-in fade-in">
      <h2 className="text-xl font-bold text-gray-800">Central de Relatórios</h2>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {reports.map(rep => (
          <Card key={rep.id} className="p-6 flex items-center justify-between hover:shadow-md transition-shadow cursor-pointer" onClick={() => setView(rep.id)}>
            <div className="flex items-center gap-4"><div className="p-3 bg-blue-50 text-blue-600 rounded-xl"><rep.icon className="w-6 h-6" /></div><div><h3 className="font-bold text-gray-800">{rep.title}</h3><p className="text-xs text-gray-500">Clique para visualizar</p></div></div>
            <div className="flex gap-2" onClick={e => e.stopPropagation()}>{['classification', 'players', 'financial'].includes(rep.id) && <Button variant="secondary" onClick={() => exportCSV(rep.id)}><Download className="w-4 h-4" /></Button>}<Button variant="ghost" onClick={() => setView(rep.id)}><Printer className="w-4 h-4" /></Button></div>
          </Card>
        ))}
      </div>
    </div>
  );
}

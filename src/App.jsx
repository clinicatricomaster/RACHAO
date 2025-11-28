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
const sortPlayersByName = (list) => Array.isArray(list) ? [...list].sort((a, b) => (a.name || '').localeCompare(b.name || '')) : [];

const safeDate = (dateStr) => {
  if (!dateStr || typeof dateStr !== 'string') return null;
  const parts = dateStr.split('-');
  if (parts.length !== 3) return null;
  return `${parts[2]}/${parts[1]}/${parts[0]}`; // Retorna DD/MM/AAAA
};

const downloadCSV = (data, filename) => {
  const BOM = "\uFEFF";
  const csvContent = BOM + data.map(row => 
    row.map(field => {
      const stringField = field === null || field === undefined ? '' : String(field);
      return `"${stringField.replace(/"/g, '""')}"`;
    }).join(";")
  ).join("\n");
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.setAttribute("href", url);
  link.setAttribute("download", filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

const getTeamBgColor = (teamColorClass) => {
  if (!teamColorClass) return 'bg-gray-50 border-gray-200';
  const colorMap = {
    'text-blue-600': 'bg-blue-50 border-blue-200',
    'text-red-600': 'bg-red-50 border-red-200',
    'text-green-600': 'bg-green-50 border-green-200',
    'text-yellow-500': 'bg-yellow-50 border-yellow-200',
    'text-purple-600': 'bg-purple-50 border-purple-200',
    'text-orange-500': 'bg-orange-50 border-orange-200',
    'text-gray-600': 'bg-gray-100 border-gray-300',
    'text-gray-900': 'bg-gray-200 border-gray-400',
  };
  return colorMap[teamColorClass] || 'bg-gray-50 border-gray-200';
};

// --- Componentes UI ---
const Toast = ({ message, type, onClose }) => {
  useEffect(() => { if(message) { const t = setTimeout(onClose, 3000); return () => clearTimeout(t); } }, [message, onClose]);
  if (!message) return null;
  const bg = type === 'success' ? 'bg-green-600' : 'bg-red-500';
  return (<div className={`fixed top-4 right-4 z-[300] flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white ${bg} animate-in slide-in-from-top-5`}>{type==='success'?<CheckCircle2 className="w-5 h-5"/>:<AlertCircle className="w-5 h-5"/>}<span className="text-sm">{message}</span><button onClick={onClose}><X className="w-4 h-4"/></button></div>);
};

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  const [isProcessing, setIsProcessing] = useState(false);
  if (!isOpen) return null;
  const handleConfirm = async () => { setIsProcessing(true); await onConfirm(); setIsProcessing(false); };
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 transform scale-100 animate-in zoom-in-95">
        <div className="flex items-center gap-3 text-red-600 mb-4"><div className="p-2 bg-red-100 rounded-full"><AlertTriangle className="w-6 h-6" /></div><h3 className="text-lg font-bold text-gray-800">{title}</h3></div>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-3"><button onClick={onCancel} disabled={isProcessing} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium">Cancelar</button><button onClick={handleConfirm} disabled={isProcessing} className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium flex items-center gap-2">{isProcessing && <Loader2 className="w-4 h-4 animate-spin"/>} Confirmar</button></div>
      </div>
    </div>
  );
};

const SoccerBallIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><path d="M12 7l-2.5 4h5L12 7z" /><path d="M12 17l-2.5-4h5L12 17z" /><path d="M5 10l4 2.5-1.5 4.5L5 10z" /><path d="M19 10l-4 2.5 1.5 4.5L19 10z" /></svg>);
const GloveIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 12v-5a2 2 0 0 0-4 0v5"></path><path d="M15 12v-7a2 2 0 0 0-4 0v7"></path><path d="M11 12v-5a2 2 0 0 0-4 0v5"></path><path d="M7 12v-3a2 2 0 0 0-4 0v3c0 4.5 3.5 8 8 8h2c4.5 0 8-3.5 8-8z"></path><line x1="3" y1="17" x2="21" y2="17"></line></svg>);
const Card = ({ children, className = "", onClick }) => (<div onClick={onClick} className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden ${onClick?'cursor-pointer active:scale-[0.99] transition-transform':''} ${className}`}>{children}</div>);
const Button = ({ children, onClick, variant = "primary", className = "", disabled = false, title = "", type = "button" }) => {
  const baseClass = "px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm";
  const variants = { primary: "bg-green-600 text-white hover:bg-green-700 shadow-sm", blue: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm", secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200", danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100", ghost: "text-gray-500 hover:bg-gray-50 hover:text-gray-700", outline: "border border-gray-300 text-gray-700 hover:bg-gray-50", whatsapp: "bg-green-500 text-white hover:bg-green-600 shadow-sm" };
  return (<button type={type} onClick={onClick} disabled={disabled} title={title} className={`${baseClass} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>{children}</button>);
};
const Input = (props) => (<input {...props} className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${props.className}`} />);

// --- Firebase Init ---
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

// --- Login Screen ---
const LoginScreen = () => {
  const [isReg, setIsReg] = useState(false);
  const [email, setEmail] = useState('');
  const [pass, setPass] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handle = async (e) => {
    e.preventDefault(); setLoading(true); setError('');
    if (!auth) { setError("Firebase não configurado."); setLoading(false); return; }
    try {
      if (isReg) await createUserWithEmailAndPassword(auth, email, pass);
      else await signInWithEmailAndPassword(auth, email, pass);
    } catch (err) { setError(err.message); } finally { setLoading(false); }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md p-8 shadow-xl">
        <div className="text-center mb-8"><h1 className="text-2xl font-bold text-gray-800">Rachão Manager</h1><p className="text-gray-500">{isReg ? 'Criar Conta' : 'Login'}</p></div>
        <form onSubmit={handle} className="space-y-4">
          <Input type="email" placeholder="Email" value={email} onChange={e=>setEmail(e.target.value)} required />
          <Input type="password" placeholder="Senha" value={pass} onChange={e=>setPass(e.target.value)} required />
          {error && <p className="text-red-500 text-xs bg-red-50 p-2 rounded">{error}</p>}
          <Button type="submit" variant="blue" className="w-full h-12" disabled={loading}>{loading ? <Loader2 className="animate-spin"/> : (isReg ? 'Criar' : 'Entrar')}</Button>
        </form>
        <button onClick={() => setIsReg(!isReg)} className="w-full mt-6 text-sm text-blue-600 hover:underline">{isReg ? 'Já tem conta? Login' : 'Criar nova conta'}</button>
      </Card>
    </div>
  );
};

const PermissionHelp = () => (<div className="min-h-screen flex items-center justify-center bg-gray-50 p-8 text-center"><h1 className="text-xl font-bold mb-2">Acesso Negado</h1><p>Verifique as Regras de Segurança no Firebase Console.</p></div>);

// --- APP PRINCIPAL ---
export default function App() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loading, setLoading] = useState(true);
  const [permissionError, setPermissionError] = useState(false);
  const [toast, setToast] = useState({ message: '', type: '' });
  const [confirmModal, setConfirmModal] = useState({ isOpen: false, title: '', message: '', onConfirm: null });

  const [players, setPlayers] = useState([]);
  const [teams, setTeams] = useState([]);
  const [matches, setMatches] = useState([]);
  const [settings, setSettings] = useState({ monthlyFee: 0, uniformPrice: 0 });

  const showToast = (msg, type = 'success') => setToast({ message: msg, type });
  const requestConfirm = (title, message, action) => setConfirmModal({ isOpen: true, title, message, onConfirm: async () => { try { await action(); setConfirmModal(prev => ({...prev, isOpen: false})); } catch(e){ showToast("Erro", 'error'); setConfirmModal(prev => ({...prev, isOpen: false})); } } });

  useEffect(() => { if (!app) { setLoading(false); return; } return onAuthStateChanged(auth, (u) => { setUser(u); setLoading(false); }); }, []);

  useEffect(() => {
    if (!user || !db) return;
    const isLocal = firebaseConfig && firebaseConfig.apiKey && firebaseConfig.apiKey !== "SUA_API_KEY_AQUI";
    const basePath = isLocal ? `rachao_manager_db/main` : `artifacts/${appId}/public/data`;
    const handleError = (err) => { if (err.code === 'permission-denied') setPermissionError(true); };

    const unsubP = onSnapshot(collection(db, `${basePath}/players`), s => setPlayers(s.docs.map(d => ({id: d.id, ...d.data()}))), handleError);
    const unsubT = onSnapshot(collection(db, `${basePath}/teams`), s => setTeams(s.docs.map(d => ({id: d.id, ...d.data()}))), handleError);
    const unsubM = onSnapshot(collection(db, `${basePath}/matches`), s => setMatches(s.docs.map(d => ({id: d.id, ...d.data()})).sort((a, b) => new Date(b.date) - new Date(a.date) || b.id - a.id)), handleError);
    const unsubS = onSnapshot(collection(db, `${basePath}/settings`), s => { if(!s.empty) setSettings({id: s.docs[0].id, ...s.docs[0].data()}); else addDoc(collection(db, `${basePath}/settings`), {monthlyFee:0, uniformPrice:0}).catch(handleError); }, handleError);

    return () => { unsubP(); unsubT(); unsubM(); unsubS(); };
  }, [user]);

  const getPath = (col) => { const isLocal = firebaseConfig && firebaseConfig.apiKey && firebaseConfig.apiKey !== "SUA_API_KEY_AQUI"; return isLocal ? `rachao_manager_db/main/${col}` : `artifacts/${appId}/public/data/${col}`; };
  const dbActions = {
    add: (col, data) => { addDoc(collection(db, getPath(col)), data); showToast('Salvo!'); },
    update: (col, id, data) => { updateDoc(doc(db, getPath(col), id), data); showToast('Atualizado!'); },
    del: (col, id) => { deleteDoc(doc(db, getPath(col), id)); showToast('Excluído!', 'error'); },
    updatePlayer: async (id, data) => { await updateDoc(doc(db, getPath('players'), id), data); showToast('Jogador atualizado!'); }
  };

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
      (Array.isArray(m.lineupA) ? m.lineupA : []).concat(Array.isArray(m.lineupB) ? m.lineupB : []).forEach(pid => { if(s[pid]) s[pid].games++; });
      (Array.isArray(m.scorersA) ? m.scorersA : []).concat(Array.isArray(m.scorersB) ? m.scorersB : []).forEach(sc => { if(s[sc.playerId]) s[sc.playerId].goals += parseInt(sc.count); });
      (Array.isArray(m.goalkeepersA) ? m.goalkeepersA : []).concat(Array.isArray(m.goalkeepersB) ? m.goalkeepersB : []).forEach(gk => { if(g[gk.playerId]) { g[gk.playerId].games += parseInt(gk.minutes||0)>=90?1:0.5; g[gk.playerId].conceded += parseInt(gk.conceded); } });
    });
    return { table: Object.values(t).sort((a, b) => b.p - a.p || b.sg - a.sg), scorers: Object.values(s).filter(x => x.goals > 0).sort((a,b) => b.goals - a.goals), goalkeepers: Object.values(g).filter(x => x.games > 0).map(x => ({...x, avg: x.conceded/x.games})).sort((a,b) => a.avg - b.avg) };
  }, [matches, teams, players]);

  if (!app) return <div className="p-8 text-center">Configuração Necessária. Edite src/App.jsx</div>;
  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin"/></div>;
  if (!user) return <LoginScreen />;
  if (permissionError) return <PermissionHelp />;

  const navItems = [{ id: 'dashboard', icon: LayoutDashboard, label: 'Dash' }, { id: 'matches', icon: Calendar, label: 'Jogos' }, { id: 'teams', icon: Shirt, label: 'Times' }, { id: 'players', icon: Users, label: 'Jogadores' }, { id: 'financial', icon: DollarSign, label: 'Caixa' }];

  return (
    <div className="flex flex-col md:flex-row min-h-screen bg-gray-50 text-gray-900">
      <Toast {...toast} onClose={() => setToast({message:'', type:''})} />
      <ConfirmModal {...confirmModal} onCancel={() => setConfirmModal(p => ({...p, isOpen:false}))} />
      
      <aside className="hidden md:flex flex-col w-64 bg-white border-r border-gray-200 h-screen sticky top-0">
        <div className="p-6 flex items-center gap-3 border-b border-gray-100"><div className="bg-blue-600 text-white p-2 rounded-xl shadow-lg">⚽</div><h1 className="font-bold text-xl">Rachão<span className="text-blue-600">Mgr</span></h1></div>
        <nav className="flex-1 p-4 space-y-1">{navItems.map(i => <button key={i.id} onClick={() => setActiveTab(i.id)} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${activeTab===i.id?'bg-blue-50 text-blue-700':'text-gray-500 hover:bg-gray-50'}`}><i.icon className="w-5 h-5"/> {i.label}</button>)}<button onClick={() => setActiveTab('stats')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${activeTab==='stats'?'bg-blue-50 text-blue-700':'text-gray-500 hover:bg-gray-50'}`}><BarChart2 className="w-5 h-5"/> Stats</button><button onClick={() => setActiveTab('reports')} className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium ${activeTab==='reports'?'bg-blue-50 text-blue-700':'text-gray-500 hover:bg-gray-50'}`}><FileText className="w-5 h-5"/> Relatórios</button></nav>
        <div className="p-4 border-t border-gray-100"><button onClick={() => signOut(auth)} className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium text-red-500 hover:bg-red-50"><LogOut className="w-5 h-5"/> Sair</button></div>
      </aside>

      <main className="flex-1 overflow-y-auto h-screen pb-24 md:pb-0">
        <header className="md:hidden bg-white border-b p-4 flex justify-between items-center sticky top-0 z-20"><div className="flex items-center gap-2 font-bold text-lg"><div className="bg-blue-600 text-white p-1.5 rounded-lg">⚽</div> Rachão Mgr</div><button onClick={() => signOut(auth)}><LogOut className="w-5 h-5 text-gray-400"/></button></header>
        <div className="p-4 md:p-8 max-w-5xl mx-auto">
          {activeTab === 'dashboard' && <Dashboard stats={stats} matches={matches} />}
          {activeTab === 'stats' && <Statistics stats={stats} />}
          {activeTab === 'players' && <PlayerManager players={players} teams={teams} matches={matches} dbActions={dbActions} requestConfirm={requestConfirm} showToast={showToast} />}
          {activeTab === 'teams' && <TeamManager teams={teams} players={players} dbActions={dbActions} requestConfirm={requestConfirm} showToast={showToast} />}
          {activeTab === 'matches' && <MatchManager matches={matches} teams={teams} players={players} dbActions={dbActions} requestConfirm={requestConfirm} showToast={showToast} />}
          {activeTab === 'financial' && <FinancialManager players={players} settings={settings} dbActions={dbActions} />}
          {activeTab === 'reports' && <ReportsPanel stats={stats} matches={matches} players={players} teams={teams} settings={settings} />}
        </div>
      </main>

      <nav className="md:hidden fixed bottom-0 inset-x-0 bg-white border-t flex justify-around p-2 pb-safe z-30">
        {navItems.map(i => <button key={i.id} onClick={() => setActiveTab(i.id)} className={`flex flex-col items-center gap-1 p-2 rounded-lg ${activeTab===i.id?'text-blue-600':'text-gray-400'}`}><i.icon className="w-6 h-6"/><span className="text-[10px] font-medium">{i.label}</span></button>)}
        <button onClick={() => setActiveTab('stats')} className={`flex flex-col items-center gap-1 p-2 rounded-lg ${activeTab==='stats'?'text-blue-600':'text-gray-400'}`}><BarChart2 className="w-6 h-6"/><span className="text-[10px] font-medium">Stats</span></button>
      </nav>
    </div>
  );
}

function Dashboard({ stats, matches }) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="grid md:grid-cols-2 gap-4">
        <Card className="p-5 border-l-4 border-blue-600">
          <div className="flex justify-between items-start mb-4"><div><p className="text-gray-500 text-xs uppercase font-bold">Total de Jogos</p><p className="text-4xl font-bold mt-1">{matches.length}</p></div><Calendar className="text-blue-600 w-8 h-8"/></div>
          <div className="border-t pt-3 space-y-1"><p className="text-[10px] font-bold text-gray-400 uppercase">Vitórias</p>{stats.table.slice(0, 3).map(t => (<div key={t.id} className="flex justify-between text-sm"><span>{t.name}</span><span className="font-bold text-green-600">{t.v} v</span></div>))}</div>
        </Card>
        <Card className="p-5 border-l-4 border-yellow-500">
          <div className="flex justify-between items-center mb-4"><p className="text-gray-500 text-xs uppercase font-bold">Artilheiros</p><BarChart2 className="text-yellow-500 w-6 h-6"/></div>
          <div className="space-y-2">{stats.scorers.slice(0, 3).map((s, idx) => (<div key={idx} className="flex justify-between text-sm"><span>{idx+1}. {s.name}</span><span className="font-bold text-blue-600">{s.goals} gols</span></div>))}</div>
        </Card>
      </div>
      <Card className="overflow-hidden"><div className="bg-white px-6 py-4 border-b"><h3 className="font-bold text-lg">Classificação</h3></div><div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead className="bg-gray-50 text-xs uppercase"><tr><th className="p-3">Pos</th><th className="p-3">Time</th><th className="p-3 text-center">P</th><th className="p-3 text-center">J</th><th className="p-3 text-center">V</th><th className="p-3 text-center">E</th><th className="p-3 text-center">D</th><th className="p-3 text-center">SG</th></tr></thead><tbody>{stats.table.map((t, i) => (<tr key={t.id} className="border-b"><td className="p-3 text-gray-400">{i+1}º</td><td className="p-3 font-bold">{t.name}</td><td className="p-3 text-center font-bold text-blue-600">{t.p}</td><td className="p-3 text-center">{t.j}</td><td className="p-3 text-center text-green-600">{t.v}</td><td className="p-3 text-center text-gray-500">{t.e}</td><td className="p-3 text-center text-red-500">{t.d}</td><td className="p-3 text-center font-bold">{t.sg}</td></tr>))}</tbody></table></div></Card>
    </div>
  );
}

function Statistics({ stats }) {
  return (
    <div className="space-y-6 animate-in fade-in">
      <Card><div className="p-4 border-b bg-gray-50 flex items-center gap-2 font-bold"><SoccerBallIcon className="w-5 h-5"/> Artilheiros</div><div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead className="bg-gray-100 text-xs uppercase"><tr><th className="p-3">Jogador</th><th className="p-3 text-center">Gols</th><th className="p-3 text-center">Jogos</th><th className="p-3 text-center">Média</th></tr></thead><tbody>{stats.scorers.map((s, i) => (<tr key={i} className="border-b"><td className="p-3 font-medium">{s.name}<div className="text-xs text-gray-400">{s.team}</div></td><td className="p-3 text-center font-bold text-green-600">{s.goals}</td><td className="p-3 text-center">{s.games}</td><td className="p-3 text-center text-gray-500">{(s.games>0?s.goals/s.games:0).toFixed(2)}</td></tr>))}</tbody></table></div></Card>
      <Card><div className="p-4 border-b bg-gray-50 flex items-center gap-2 font-bold"><GloveIcon className="w-5 h-5"/> Goleiros</div><div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead className="bg-gray-100 text-xs uppercase"><tr><th className="p-3">Goleiro</th><th className="p-3 text-center">Média</th><th className="p-3 text-center">Gols</th><th className="p-3 text-center">Jogos</th></tr></thead><tbody>{stats.goalkeepers.map((g, i) => (<tr key={i} className="border-b"><td className="p-3 font-medium">{g.name}</td><td className="p-3 text-center font-bold text-blue-600">{g.avg.toFixed(2)}</td><td className="p-3 text-center text-red-500">{g.conceded}</td><td className="p-3 text-center">{g.games}</td></tr>))}</tbody></table></div></Card>
    </div>
  );
}

function PlayerManager({ players, dbActions, matches, teams, showToast, requestConfirm }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const [search, setSearch] = useState('');
  const [form, setForm] = useState({ name: '', phone: '', email: '', position: 'Meia', rating: 3, dob: '' });

  // CRITICAL FIX: Safe check for matches array and lineup array presence
  const getPresenceCount = (playerId) => {
    if (!Array.isArray(matches)) return 0;
    return matches.reduce((count, match) => {
      const inA = Array.isArray(match.lineupA) && match.lineupA.includes(playerId);
      const inB = Array.isArray(match.lineupB) && match.lineupB.includes(playerId);
      return count + (inA || inB ? 1 : 0);
    }, 0);
  };

  const filtered = sortPlayersByName(players).filter(p => p.name.toLowerCase().includes(search.toLowerCase()));
  const getTeamName = (tid) => teams.find(t => t.id === tid)?.name || '-';
  const formatDate = (d) => safeDate(d) || '-';

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      if (editId) await dbActions.updatePlayer(editId, form); // Use updatePlayer specifically
      else await dbActions.add('players', { ...form, payments: {}, uniformPaid: false });
      setIsAdding(false); setEditId(null); setForm({ name: '', phone: '', email: '', position: 'Meia', rating: 3, dob: '' });
    } catch (err) { showToast('Erro ao salvar', 'error'); console.error(err); }
  };

  return (
    <div className="space-y-4">
      <div className="sticky top-0 bg-gray-50 pt-2 pb-2 z-10"><div className="relative"><Search className="absolute left-3 top-3.5 w-5 h-5 text-gray-400"/><Input placeholder="Buscar jogador..." value={search} onChange={e=>setSearch(e.target.value)} className="pl-10"/></div></div>
      {isAdding && (
        <Card className="p-4 mb-4 bg-blue-50 border-blue-100">
           <h3 className="font-bold mb-4">{editId?'Editar':'Novo'}</h3>
           <form onSubmit={handleSave} className="space-y-3">
             <Input value={form.name} onChange={e=>setForm({...form, name:toTitleCase(e.target.value)})} placeholder="Nome Completo" required />
             <div className="grid grid-cols-2 gap-2">
                <Input type="date" value={form.dob} onChange={e=>setForm({...form, dob:e.target.value})} />
                <Input value={form.phone} onChange={e=>setForm({...form, phone:e.target.value})} placeholder="Celular" />
             </div>
             <div className="grid grid-cols-2 gap-2">
                <select className="w-full h-12 rounded-xl border-gray-300" value={form.position} onChange={e=>setForm({...form, position:e.target.value})}>{['Goleiro','Zagueiro','Lateral','Meia','Atacante'].map(p=><option key={p}>{p}</option>)}</select>
                <div className="flex items-center justify-center gap-1 bg-white rounded-xl border border-gray-300">{[1,2,3,4,5].map(s=><button type="button" key={s} onClick={()=>setForm({...form, rating:s})} className={`text-lg ${form.rating>=s?'text-yellow-400':'text-gray-300'}`}>★</button>)}</div>
             </div>
             <div className="flex gap-2"><Button onClick={()=>{setIsAdding(false); setEditId(null)}} variant="ghost" className="flex-1">Cancelar</Button><Button type="submit" className="flex-1">Salvar</Button></div>
           </form>
        </Card>
      )}
      {!isAdding && <Button variant="fab" onClick={()=>{setForm({ name: '', phone: '', email: '', position: 'Meia', rating: 3, dob: '' }); setIsAdding(true);}}><Plus className="w-6 h-6"/></Button>}
      
      <div className="space-y-2">
        {filtered.map(p => (
          <Card key={p.id} className="p-4">
            <div className="flex justify-between items-start">
               <div>
                  <h4 className="font-bold text-gray-900">{p.name}</h4>
                  <div className="text-xs text-gray-500 flex gap-2 items-center mt-1">
                     <span className="bg-gray-100 px-2 py-0.5 rounded">{p.position}</span>
                     {getTeamName(p.teamId) !== '-' && <span className="text-blue-600 font-medium">{getTeamName(p.teamId)}</span>}
                  </div>
                  <div className="flex gap-3 mt-2 text-xs text-gray-400">
                     {p.dob && <span className="flex items-center gap-1"><Cake className="w-3 h-3"/> {formatDate(p.dob)}</span>}
                     {p.phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3"/> {p.phone}</span>}
                  </div>
               </div>
               <div className="text-right">
                  <div className="text-yellow-400 text-[10px]">{'★'.repeat(p.rating)}</div>
                  <div className={`text-xs font-bold mt-1 ${getPresenceCount(p.id)>0?'text-green-600':'text-gray-300'}`}>{getPresenceCount(p.id)} jogos</div>
               </div>
            </div>
            <div className="flex justify-end gap-2 mt-3 pt-2 border-t border-gray-50">
               <button onClick={()=>{setForm(p); setEditId(p.id); setIsAdding(true);}} className="text-xs text-blue-500 px-2">Editar</button>
               <button onClick={()=>requestConfirm("Excluir", "Remover jogador?", () => dbActions.del('players', p.id))} className="text-xs text-red-500 px-2">Excluir</button>
            </div>
          </Card>
        ))}
        {filtered.length === 0 && <div className="text-center text-gray-400 p-8">Nenhum jogador.</div>}
      </div>
    </div>
  );
}

function TeamManager({ teams, players, dbActions, requestConfirm, showToast }) {
  const [name, setName] = useState('');
  const [color, setColor] = useState('text-blue-600');
  const [editId, setEditId] = useState(null);
  const [selTeam, setSelTeam] = useState(null);
  const [addP, setAddP] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);

  const colors = [{c:'text-blue-600',b:'bg-blue-600'},{c:'text-red-600',b:'bg-red-600'},{c:'text-green-600',b:'bg-green-600'},{c:'text-yellow-500',b:'bg-yellow-500'},{c:'text-purple-600',b:'bg-purple-600'},{c:'text-black',b:'bg-gray-900'}];
  
  const handleSave = async (e) => {
    e.preventDefault();
    if(!name) return showToast("Nome obrigatório", 'error');
    setIsSubmitting(true);
    try {
      if(editId) await dbActions.update('teams', editId, { name, color });
      else await dbActions.add('teams', { name, id: Date.now().toString(), color });
      setName(''); setEditId(null);
    } catch(err) { showToast("Erro", 'error'); } finally { setIsSubmitting(false); }
  };

  const handleEdit = (t) => { setEditId(t.id); setName(t.name); setColor(t.color||'text-blue-600'); };
  const handleDelete = (id) => requestConfirm("Excluir Time", "Tem certeza?", () => dbActions.del('teams', id));
  
  const addPlayer = async () => {
     if(!addP || !selTeam) return;
     await dbActions.updatePlayer(addP, { teamId: selTeam });
     setAddP('');
     showToast("Jogador adicionado");
  };

  const removePlayer = async (pid) => { await dbActions.updatePlayer(pid, { teamId: null }); showToast("Removido"); };
  const selectedTeam = teams.find(t => t.id === selTeam);
  const availablePlayers = sortPlayersByName(players.filter(p => !p.teamId));
  const teamPlayers = sortPlayersByName(players.filter(p => p.teamId === selTeam));

  return (
    <div className="space-y-6">
       <Card className="p-4">
         <h3 className="font-bold mb-3">{editId?'Editar Time':'Novo Time'}</h3>
         <form onSubmit={handleSave} className="space-y-3">
            <div className="flex gap-2"><Input value={name} onChange={e=>setName(toTitleCase(e.target.value))} placeholder="Nome do Time" className="flex-1"/><Button type="submit" disabled={isSubmitting}>{editId?<Save className="w-4 h-4"/>:<Plus className="w-4 h-4"/>}</Button></div>
            <div className="flex gap-2">{colors.map(k=><button key={k.c} type="button" onClick={()=>setColor(k.c)} className={`w-8 h-8 rounded-full ${k.b} ${color===k.c?'ring-2 ring-offset-2 ring-gray-400':''}`}/>)}</div>
         </form>
       </Card>
       
       {selTeam && (
         <div className="fixed inset-x-0 bottom-0 bg-white border-t shadow-2xl z-50 p-4 rounded-t-2xl animate-in slide-in-from-bottom">
            <div className="flex justify-between mb-4"><h3 className="font-bold flex gap-2 items-center"><Users className="w-5 h-5"/> {teams.find(t=>t.id===selTeam)?.name}</h3><button onClick={()=>setSelTeam(null)}><X className="w-6 h-6"/></button></div>
            <div className="flex gap-2 mb-3"><select className="flex-1 h-10 border rounded-lg text-sm" value={addP} onChange={e=>setAddP(e.target.value)}><option value="">Adicionar...</option>{availablePlayers.map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select><Button onClick={addPlayer} disabled={!addP} className="h-10 w-10 p-0"><Plus/></Button></div>
            <div className="max-h-60 overflow-y-auto space-y-2">{teamPlayers.map(p=><div key={p.id} className="flex justify-between p-2 bg-gray-50 rounded-lg text-sm"><span>{p.name}</span><button onClick={()=>removePlayer(p.id)} className="text-red-400"><UserMinus className="w-4 h-4"/></button></div>)}</div>
         </div>
       )}

       <div className="grid md:grid-cols-2 gap-3 pb-20">
          {teams.map(t => (
            <Card key={t.id} onClick={()=>setSelTeam(t.id)} className={`p-4 flex justify-between items-center cursor-pointer ${selTeam===t.id?'ring-2 ring-blue-500':''}`}>
               <div className="flex gap-3 items-center"><div className={`p-2 rounded-lg bg-gray-50 ${t.color}`}><Shirt className="w-6 h-6"/></div><div><p className="font-bold">{t.name}</p><p className="text-xs text-gray-500">{players.filter(p=>p.teamId===t.id).length} jogadores</p></div></div>
               <div className="flex gap-1"><button onClick={(e)=>{e.stopPropagation(); handleEdit(t);}} className="p-2 text-gray-400 hover:text-blue-600"><Edit className="w-5 h-5"/></button><button onClick={(e)=>{e.stopPropagation(); handleDelete(t.id);}} className="p-2 text-gray-400 hover:text-red-600"><Trash2 className="w-5 h-5"/></button></div>
            </Card>
          ))}
       </div>
    </div>
  );
}

function MatchManager({ matches, teams, players, dbActions, requestConfirm, showToast }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editId, setEditId] = useState(null);
  const [activeMatch, setActiveMatch] = useState(null);
  const [form, setForm] = useState({ date: new Date().toISOString().split('T')[0], round: '', teamA: '', teamB: '', scoreA: 0, scoreB: 0 });

  const handleSave = async (e) => {
    e.preventDefault();
    if(!form.teamA || !form.teamB) return showToast("Times inválidos", 'error');
    try {
      if(editId) await dbActions.update('matches', editId, form);
      else await dbActions.add('matches', { ...form, lineupA:[], lineupB:[], scorersA:[], scorersB:[], goalkeepersA:[], goalkeepersB:[] });
      setIsAdding(false); setEditId(null);
    } catch(e) { showToast("Erro", 'error'); }
  };

  if(activeMatch) return <MatchDetails match={matches.find(m=>m.id===activeMatch)} players={players} teams={teams} onBack={()=>setActiveMatch(null)} dbActions={dbActions} />;

  return (
    <div className="space-y-6 pb-20">
       {isAdding && (
         <Card className="p-4 bg-blue-50 fixed inset-x-0 bottom-0 md:relative z-50 animate-in slide-in-from-bottom">
            <div className="flex justify-between mb-4"><h3 className="font-bold">{editId?'Editar':'Novo Jogo'}</h3><button onClick={()=>setIsAdding(false)}><X/></button></div>
            <div className="space-y-3">
               <div className="flex gap-2"><Input type="date" value={form.date} onChange={e=>setForm({...form, date:e.target.value})}/><Input type="number" placeholder="Rodada" value={form.round} onChange={e=>setForm({...form, round:e.target.value})}/></div>
               <div className="flex gap-2"><select className="flex-1 h-12 rounded-xl border-gray-300" value={form.teamA} onChange={e=>setForm({...form, teamA:e.target.value})}><option value="">Mandante</option>{teams.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select><select className="flex-1 h-12 rounded-xl border-gray-300" value={form.teamB} onChange={e=>setForm({...form, teamB:e.target.value})}><option value="">Visitante</option>{teams.map(t=><option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
               <div className="flex gap-4 justify-center items-center bg-white p-2 rounded-xl"><Input type="number" className="w-12 text-center p-0 border-0 text-xl font-bold" value={form.scoreA} onChange={e=>setForm({...form, scoreA:e.target.value})}/><span className="font-bold text-gray-300">X</span><Input type="number" className="w-12 text-center p-0 border-0 text-xl font-bold" value={form.scoreB} onChange={e=>setForm({...form, scoreB:e.target.value})}/></div>
               <Button onClick={handleSave} className="w-full">Salvar</Button>
            </div>
         </Card>
       )}
       {!isAdding && <Button variant="fab" onClick={()=>{setForm({ date: new Date().toISOString().split('T')[0], round: (matches.length+1).toString(), teamA: '', teamB: '', scoreA: 0, scoreB: 0 }); setIsAdding(true);}}><Plus className="w-6 h-6"/></Button>}
       
       <div className="space-y-3">
          {matches.map(m => (
            <Card key={m.id} onClick={()=>setActiveMatch(m.id)} className="p-0 cursor-pointer">
               <div className="flex items-center justify-between p-3 border-b bg-gray-50 text-xs text-gray-500"><span className="font-bold text-blue-600">RODADA {m.round}</span><span>{safeDate(m.date)}</span></div>
               <div className="p-4 flex items-center justify-between">
                  <span className={`flex-1 text-right font-bold truncate ${m.scoreA>m.scoreB?'text-black':'text-gray-400'}`}>{teams.find(t=>t.id===m.teamA)?.name||'-'}</span>
                  <div className="mx-3 px-3 py-1 bg-gray-100 rounded-lg font-mono font-bold text-gray-800">{m.scoreA} : {m.scoreB}</div>
                  <span className={`flex-1 text-left font-bold truncate ${m.scoreB>m.scoreA?'text-black':'text-gray-400'}`}>{teams.find(t=>t.id===m.teamB)?.name||'-'}</span>
               </div>
               <div className="p-2 flex justify-end gap-2 border-t border-gray-50">
                  <button onClick={(e)=>{e.stopPropagation(); setForm(m); setEditId(m.id); setIsAdding(true);}} className="p-2 text-blue-400"><Edit className="w-4 h-4"/></button>
                  <button onClick={(e)=>{e.stopPropagation(); requestConfirm("Excluir", "Apagar partida?", ()=>dbActions.del('matches', m.id))}} className="p-2 text-red-400"><Trash2 className="w-4 h-4"/></button>
               </div>
            </Card>
          ))}
       </div>
    </div>
  );
}

function MatchDetails({ match, players, teams, onBack, dbActions }) {
    const [local, setLocal] = useState(match);
    const update = (d) => { const n = {...local, ...d}; setLocal(n); dbActions.update('matches', n.id, n); };
    const toggle = (side, pid) => { const key = `lineup${side}`; const list = local[key]||[]; update({[key]: list.includes(pid) ? list.filter(x=>x!==pid) : [...list,pid]}); };
    const goal = (side, pid, n) => { const key = `scorers${side}`; const list = [...(local[key]||[])]; list.push({playerId:pid, count:n}); update({[key]:list}); };
    const gk = (side, pid, min, c) => { const key = `goalkeepers${side}`; const list = [...(local[key]||[])]; list.push({playerId:pid, minutes:min, conceded:c}); update({[key]:list}); };
    const remove = (key, idx) => { const list = [...(local[key]||[])]; list.splice(idx,1); update({[key]:list}); };

    const handleShare = () => {
        const tA = teams.find(t=>t.id===local.teamA)?.name; const tB = teams.find(t=>t.id===local.teamB)?.name;
        const txt = `⚽ *SÚMULA RACHÃO* - ${safeDate(local.date)}\n🏆 *${tA} ${local.scoreA}* x *${local.scoreB} ${tB}*`;
        window.open(`https://wa.me/?text=${encodeURIComponent(txt)}`, '_blank');
    };

    const TeamPanel = ({ side, roster, lineupKey, scorersKey, gkKey }) => {
       const [gP, setGP] = useState(''); const [gC, setGC] = useState(1);
       const [gkP, setGkP] = useState(''); const [gkM, setGkM] = useState(90); const [gkCon, setGkCon] = useState(0);
       const lineup = local[lineupKey]||[];
       const teamId = side === 'A' ? local.teamA : local.teamB;
       const team = teams.find(t=>t.id===teamId);
       const bgClass = getTeamBgColor(team?.color);

       return (
         <Card className={`p-4 border-t-4 ${side==='A'?'border-t-green-500':'border-t-blue-500'} ${bgClass}`}>
            <h3 className="text-center font-bold text-lg mb-4">{team?.name}</h3>
            <div className="mb-6"><p className="text-xs font-bold text-gray-400 uppercase mb-2">Escalação</p><div className="max-h-40 overflow-y-auto bg-white/50 rounded-xl p-2 space-y-1">{roster.map(p => (<div key={p.id} onClick={()=>toggle(side,p.id)} className={`flex items-center gap-2 p-2 rounded-lg text-sm cursor-pointer ${lineup.includes(p.id)?'bg-white shadow-sm font-bold':'text-gray-400'}`}><div className={`w-4 h-4 rounded border flex items-center justify-center ${lineup.includes(p.id)?'bg-blue-600 border-blue-600 text-white':'border-gray-300'}`}>{lineup.includes(p.id)&&<Check className="w-3 h-3"/>}</div>{p.name}</div>))}</div></div>
            <div className="mb-6"><p className="text-xs font-bold text-gray-400 uppercase mb-2">Gols</p><div className="flex gap-2 mb-2"><select className="flex-1 text-sm rounded-lg border-gray-200" value={gP} onChange={e=>setGP(e.target.value)}><option value="">Quem?</option>{roster.filter(p=>lineup.includes(p.id)).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select><input type="number" className="w-12 text-sm rounded-lg border-gray-200 text-center" value={gC} onChange={e=>setGC(e.target.value)}/><Button onClick={()=>{goal(side,gP,gC); setGP('');}} disabled={!gP} className="h-10 w-10 p-0">+</Button></div><div className="space-y-1">{(local[scorersKey]||[]).map((s,i)=>(<div key={i} className="flex justify-between text-sm bg-green-50 p-2 rounded-lg text-green-800"><span>⚽ {players.find(p=>p.id==s.playerId)?.name} ({s.count})</span><button onClick={()=>remove(scorersKey,i)}><X className="w-3 h-3"/></button></div>))}</div></div>
            <div><p className="text-xs font-bold text-gray-400 uppercase mb-2">Goleiros</p><div className="flex flex-col gap-2 mb-2"><select className="w-full text-sm rounded-lg border-gray-200" value={gkP} onChange={e=>setGkP(e.target.value)}><option value="">Goleiro</option>{roster.filter(p=>lineup.includes(p.id)).map(p=><option key={p.id} value={p.id}>{p.name}</option>)}</select><div className="flex gap-2"><select className="flex-1 text-sm rounded-lg border-gray-200" value={gkM} onChange={e=>setGkM(e.target.value)}><option value="90">90 min</option><option value="45">45 min</option></select><input type="number" placeholder="Gols" className="w-20 text-sm rounded-lg border-gray-200" value={gkCon} onChange={e=>setGkCon(e.target.value)}/></div><Button onClick={()=>{gk(side,gkP,gkM,gkCon); setGkP('');}} disabled={!gkP} className="h-8 text-xs">Add</Button></div><div className="space-y-1">{(local[gkKey]||[]).map((s,i)=>(<div key={i} className="flex justify-between text-sm bg-gray-100 p-2 rounded-lg"><span>🧤 {players.find(p=>p.id==s.playerId)?.name} (-{s.conceded})</span><button onClick={()=>remove(gkKey,i)}><X className="w-3 h-3"/></button></div>))}</div></div>
         </Card>
       );
    }

    const rosterA = sortPlayersByName(players.filter(p=>p.teamId===local.teamA).length?players.filter(p=>p.teamId===local.teamA):players);
    const rosterB = sortPlayersByName(players.filter(p=>p.teamId===local.teamB).length?players.filter(p=>p.teamId===local.teamB):players);

    return (
      <div className="pb-24 pt-4 animate-in slide-in-from-right">
         <div className="flex items-center justify-between mb-4 px-4"><Button variant="ghost" onClick={onBack}>Voltar</Button><h2 className="font-bold text-lg">Súmula</h2><Button variant="whatsapp" onClick={handleShare}><Share2 className="w-4 h-4"/> Zap</Button></div>
         <div className="grid md:grid-cols-2 gap-6"><TeamPanel side="A" team={teams.find(t=>t.id===local.teamA)} roster={rosterA} lineupKey="lineupA" scorersKey="scorersA" gkKey="goalkeepersA" /><TeamPanel side="B" team={teams.find(t=>t.id===local.teamB)} roster={rosterB} lineupKey="lineupB" scorersKey="scorersB" gkKey="goalkeepersB" /></div>
      </div>
    );
}

function FinancialManager({ players, settings, dbActions }) {
   const sorted = sortPlayersByName(players);
   const [showConfig, setShowConfig] = useState(false);
   const [localSettings, setLocalSettings] = useState(settings);
   const togglePay = async (pid, m) => { const p = players.find(x => x.id === pid); const next = p.payments?.[m] === 'paid' ? 'exempt' : p.payments?.[m] === 'exempt' ? null : 'paid'; await dbActions.updatePlayer(pid, { payments: { ...(p.payments||{}), [m]: next } }); }
   const toggleUni = async (pid) => { const p = players.find(x => x.id === pid); await dbActions.updatePlayer(pid, { uniformPaid: !p.uniformPaid }); }
   const months = ['Jan','Fev','Mar','Abr','Mai','Jun','Jul','Ago','Set','Out','Nov','Dez'];
   
   return (
     <div className="space-y-4 pb-20 md:pb-0">
        <Card className="p-4 bg-blue-600 text-white flex justify-between items-center"><div><p className="text-xs text-blue-100">Valor Mensalidade</p><p className="text-xl font-bold">R$ {settings.monthlyFee}</p></div><Button variant="secondary" className="text-xs h-8 px-3" onClick={()=>setShowConfig(!showConfig)}><Settings className="w-4 h-4 mr-1"/> Config</Button></Card>
        {showConfig && <Card className="p-4 bg-gray-50"><div className="flex gap-4"><div className="flex-1"><label className="text-xs font-bold text-gray-500">Mensalidade</label><Input type="number" value={localSettings.monthlyFee} onChange={e => setLocalSettings({...localSettings, monthlyFee: parseInt(e.target.value)})} /></div><div className="flex-1"><label className="text-xs font-bold text-gray-500">Uniforme</label><Input type="number" value={localSettings.uniformPrice} onChange={e => setLocalSettings({...localSettings, uniformPrice: parseInt(e.target.value)})} /></div></div><Button onClick={()=>{ dbActions.updateSettings(localSettings); setShowConfig(false); }} className="w-full mt-4">Salvar Valores</Button></Card>}
        <div className="overflow-x-auto pb-2"><table className="w-full text-sm text-left border-collapse"><thead><tr className="text-gray-500 border-b"><th className="p-3 min-w-[150px] sticky left-0 bg-gray-50 z-10">Nome</th><th className="p-3 text-center">Unif.</th>{months.map(m => <th key={m} className="p-3 text-center min-w-[50px]">{m}</th>)}</tr></thead><tbody>{sorted.map(p => (<tr key={p.id} className="border-b last:border-0"><td className="p-3 font-medium sticky left-0 bg-white z-10 shadow-sm border-r border-gray-100">{p.name}</td><td className="p-1 text-center"><button onClick={()=>toggleUni(p.id)} className={`w-8 h-8 rounded-full flex items-center justify-center mx-auto ${p.uniformPaid?'bg-blue-600 text-white':'bg-gray-100 text-gray-300'}`}><Check className="w-4 h-4"/></button></td>{months.map((m, i) => (<td key={m} className="p-1 text-center"><button onClick={() => togglePay(p.id, i)} className={`w-8 h-8 rounded-full text-[10px] font-bold ${p.payments?.[i]==='paid'?'bg-green-500 text-white':p.payments?.[i]==='exempt'?'bg-blue-300 text-white':'bg-gray-100 text-gray-300'}`}>{p.payments?.[i]==='paid'?'PG':p.payments?.[i]==='exempt'?'IS':'-'}</button></td>))}</tr>))}</tbody></table></div>
     </div>
   );
}

function ReportsPanel({ stats, matches, players, teams }) {
  const [view, setView] = useState(null);
  const reports = [ { id: 'cl', label: 'Classificação', icon: BarChart2, comp: <Dashboard stats={stats} matches={matches} /> }, { id: 'st', label: 'Estatísticas', icon: Target, comp: <Statistics stats={stats} /> }, { id: 'fn', label: 'Financeiro', icon: DollarSign, comp: <div className="p-4 text-center text-gray-500">Visualização de Impressão</div> } ];
  if(view) return <div className="bg-white min-h-screen p-4 absolute inset-0 z-50"><div className="flex justify-between mb-6 no-print"><Button onClick={()=>setView(null)} variant="ghost">Voltar</Button><Button onClick={()=>window.print()}><Printer className="w-4 h-4"/> Imprimir</Button></div><div className="print-content">{reports.find(r=>r.id===view).comp}</div></div>;
  return (<div className="space-y-4"><h2 className="font-bold text-lg">Relatórios</h2><div className="grid grid-cols-2 gap-4">{reports.map(r => (<Card key={r.id} onClick={()=>setView(r.id)} className="p-6 flex flex-col items-center justify-center gap-3 cursor-pointer hover:border-blue-500"><r.icon className="w-8 h-8 text-blue-600"/><span className="text-sm font-medium text-center">{r.label}</span></Card>))}</div></div>);
}

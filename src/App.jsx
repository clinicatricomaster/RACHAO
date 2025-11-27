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
  KeyRound
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
// --- ÁREA DE CONFIGURAÇÃO DO USUÁRIO (COLE SEUS DADOS DO FIREBASE AQUI) ---
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
const toTitleCase = (str) => {
  if (!str) return '';
  return str.replace(/(?:^|\s)\S/g, (char) => char.toUpperCase());
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

const sortPlayersByName = (list) => {
  if (!Array.isArray(list)) return [];
  return [...list].sort((a, b) => {
    const nameA = a.name || '';
    const nameB = b.name || '';
    return nameA.localeCompare(nameB);
  });
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
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [message, onClose]);
  if (!message) return null;
  const bg = type === 'success' ? 'bg-green-600' : 'bg-red-500';
  const icon = type === 'success' ? <CheckCircle2 className="w-5 h-5" /> : <AlertCircle className="w-5 h-5" />;
  return (
    <div className={`fixed top-4 right-4 z-[200] flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg text-white ${bg} animate-in slide-in-from-top-5 duration-300`}>
      {icon}<span className="font-medium text-sm">{message}</span><button onClick={onClose} className="ml-2 hover:bg-white/20 p-1 rounded"><X className="w-4 h-4" /></button>
    </div>
  );
};

const ConfirmModal = ({ isOpen, title, message, onConfirm, onCancel }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in duration-200">
      <div className="bg-white rounded-xl shadow-xl max-w-sm w-full p-6 transform scale-100 animate-in zoom-in-95 duration-200">
        <div className="flex items-center gap-3 text-red-600 mb-4"><div className="p-2 bg-red-100 rounded-full"><AlertTriangle className="w-6 h-6" /></div><h3 className="text-lg font-bold text-gray-800">{title}</h3></div>
        <p className="text-gray-600 mb-6">{message}</p>
        <div className="flex justify-end gap-3"><button onClick={onCancel} className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium transition-colors">Cancelar</button><button onClick={onConfirm} className="px-4 py-2 bg-red-600 text-white hover:bg-red-700 rounded-lg font-medium transition-colors">Confirmar Exclusão</button></div>
      </div>
    </div>
  );
};

// TELA DE AJUDA PARA REGRAS E AUTH
const PermissionHelp = () => (
  <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8">
    <div className="bg-white p-8 rounded-xl shadow-lg max-w-2xl w-full">
      <div className="flex items-center gap-4 mb-6"><div className="bg-red-100 p-3 rounded-full"><ShieldAlert className="w-10 h-10 text-red-600" /></div><div><h1 className="text-2xl font-bold text-gray-800">Configuração Pendente no Firebase</h1><p className="text-gray-500">Siga os passos abaixo para liberar o acesso.</p></div></div>
      
      <div className="space-y-6 text-gray-600 text-sm">
        <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
          <h3 className="font-bold text-blue-800 mb-2 flex items-center gap-2"><KeyRound className="w-4 h-4"/> 1. Ativar Login</h3>
          <p>No Console Firebase &gt; <strong>Authentication</strong> &gt; <strong>Sign-in method</strong>:</p>
          <ul className="list-disc list-inside ml-2 mt-1">
             <li>Ative o provedor <strong>Email/Password</strong>.</li>
          </ul>
        </div>

        <div className="p-4 bg-orange-50 rounded-lg border border-orange-100">
          <h3 className="font-bold text-orange-800 mb-2 flex items-center gap-2"><ShieldAlert className="w-4 h-4"/> 2. Atualizar Regras do Banco</h3>
          <p>No Console Firebase &gt; <strong>Firestore Database</strong> &gt; aba <strong>Regras</strong>, cole este código:</p>
          <div className="bg-gray-800 text-gray-100 p-3 rounded mt-2 font-mono overflow-x-auto">
<pre>{`rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /rachao_manager_db/{document=**} {
      allow read, write: if request.auth != null;
    }
  }
}`}</pre>
          </div>
        </div>
        
        <p className="text-center text-gray-400 italic">Após configurar, recarregue esta página.</p>
      </div>
    </div>
  </div>
);

const SoccerBallIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}><circle cx="12" cy="12" r="10" /><path d="M12 7l-2.5 4h5L12 7z" /><path d="M12 17l-2.5-4h5L12 17z" /><path d="M5 10l4 2.5-1.5 4.5L5 10z" /><path d="M19 10l-4 2.5 1.5 4.5L19 10z" /></svg>);
const GloveIcon = ({ className }) => (<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><path d="M19 12v-5a2 2 0 0 0-4 0v5"></path><path d="M15 12v-7a2 2 0 0 0-4 0v7"></path><path d="M11 12v-5a2 2 0 0 0-4 0v5"></path><path d="M7 12v-3a2 2 0 0 0-4 0v3c0 4.5 3.5 8 8 8h2c4.5 0 8-3.5 8-8z"></path><line x1="3" y1="17" x2="21" y2="17"></line></svg>);
const Card = ({ children, className = "" }) => (<div className={`bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden print:border-0 print:shadow-none ${className}`}>{children}</div>);
const Button = ({ children, onClick, variant = "primary", className = "", disabled = false, title = "", type = "button" }) => {
  const baseClass = "px-3 py-2 rounded-lg font-medium transition-colors flex items-center justify-center gap-2 text-sm print:hidden";
  const variants = { primary: "bg-green-600 text-white hover:bg-green-700 shadow-sm", blue: "bg-blue-600 text-white hover:bg-blue-700 shadow-sm", secondary: "bg-gray-100 text-gray-700 hover:bg-gray-200 border border-gray-200", danger: "bg-red-50 text-red-600 hover:bg-red-100 border border-red-100", ghost: "text-gray-500 hover:bg-gray-50 hover:text-gray-700", outline: "border border-gray-300 text-gray-700 hover:bg-gray-50", whatsapp: "bg-green-500 text-white hover:bg-green-600 shadow-sm" };
  return (<button type={type} onClick={onClick} disabled={disabled} title={title} className={`${baseClass} ${variants[variant]} ${disabled ? 'opacity-50 cursor-not-allowed' : ''} ${className}`}>{children}</button>);
};
const Input = (props) => (<input {...props} className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent ${props.className}`} />);

// --- Inicialização Firebase ---
const getFirebaseConfig = () => {
  if (typeof firebaseConfig !== 'undefined' && firebaseConfig.apiKey && firebaseConfig.apiKey !== "SUA_API_KEY_AQUI") return firebaseConfig;
  if (typeof __firebase_config !== 'undefined') { try { return JSON.parse(__firebase_config); } catch (e) { return null; } }
  return null;
};

const configToUse = getFirebaseConfig();
const app = configToUse ? initializeApp(configToUse) : null;
const auth = app ? getAuth(app) : null;
const db = app ? getFirestore(app) : null;
const appId = typeof __app_id !== 'undefined' ? __app_id : (configToUse?.projectId || 'default-app');

// --- TELA DE LOGIN UNIFICADA ---
const LoginScreen = () => {
  const [isRegistering, setIsRegistering] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    
    if (!auth) {
      setError("Erro de configuração: Firebase não iniciado.");
      setLoading(false);
      return;
    }

    try {
      if (isRegistering) {
        await createUserWithEmailAndPassword(auth, email, password);
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
    } catch (err) {
      console.error("Auth Error:", err);
      if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password') setError('Email ou senha incorretos.');
      else if (err.code === 'auth/email-already-in-use') setError('Este email já está cadastrado.');
      else if (err.code === 'auth/weak-password') setError('A senha deve ter pelo menos 6 caracteres.');
      else if (err.code === 'auth/operation-not-allowed') setError('O login por email/senha não está ativado no Firebase.');
      else setError(`Erro: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-4">
      <Card className="w-full max-w-md p-8 shadow-xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full text-white text-3xl mb-4">⚽</div>
          <h1 className="text-2xl font-bold text-gray-800">Rachão Manager</h1>
          <p className="text-gray-500">{isRegistering ? 'Crie sua conta de administrador' : 'Entre para gerenciar'}</p>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div><label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Email</label><Input type="email" value={email} onChange={e => setEmail(e.target.value)} required placeholder="seu@email.com" /></div>
          <div><label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Senha</label><Input type="password" value={password} onChange={e => setPassword(e.target.value)} required placeholder="******" /></div>
          {error && <div className="text-red-600 bg-red-50 p-3 rounded-lg text-sm border border-red-100 flex items-center gap-2"><AlertCircle className="w-4 h-4"/> {error}</div>}
          <Button type="submit" variant="blue" className="w-full h-12 text-lg" disabled={loading}>{loading ? <Loader2 className="animate-spin"/> : (isRegistering ? 'Criar Conta' : 'Entrar')}</Button>
        </form>
        <div className="mt-6 text-center text-sm"><button type="button" onClick={() => { setIsRegistering(!isRegistering); setError(''); }} className="text-blue-600 hover:underline font-medium">{isRegistering ? 'Já tem conta? Faça login' : 'Não tem conta? Cadastre-se'}</button></div>
      </Card>
    </div>
  );
};

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
  const [financialSettings, setFinancialSettings] = useState({ monthlyFee: 0, uniformPrice: 0, id: null });

  const showToast = (msg, type = 'success') => setToast({ message: msg, type });
  const requestConfirm = (title, message, action) => {
    setConfirmModal({ 
      isOpen: true, 
      title, 
      message, 
      onConfirm: async () => {
        await action();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      } 
    });
  };

  useEffect(() => {
    if (!app) { setLoading(false); return; }
    const unsubscribe = onAuthStateChanged(auth, (u) => {
      setUser(u);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !db) return;
    
    const isLocal = firebaseConfig && firebaseConfig.apiKey && firebaseConfig.apiKey !== "SUA_API_KEY_AQUI";
    const basePath = isLocal ? `rachao_manager_db/main` : `artifacts/${appId}/public/data`;
    
    const handleError = (err) => {
      console.error("Firestore Error:", err);
      if (err.code === 'permission-denied') setPermissionError(true);
    };

    const unsubPlayers = onSnapshot(collection(db, `${basePath}/players`), (snap) => setPlayers(snap.docs.map(d => ({ id: d.id, ...d.data() }))), handleError);
    const unsubTeams = onSnapshot(collection(db, `${basePath}/teams`), (snap) => setTeams(snap.docs.map(d => ({ id: d.id, ...d.data() }))), handleError);
    const unsubMatches = onSnapshot(collection(db, `${basePath}/matches`), (snap) => setMatches(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => new Date(b.date) - new Date(a.date) || b.id - a.id)), handleError);
    const unsubSettings = onSnapshot(collection(db, `${basePath}/settings`), (snap) => {
      if (!snap.empty) setFinancialSettings({ id: snap.docs[0].id, ...snap.docs[0].data() });
      else addDoc(collection(db, `${basePath}/settings`), { monthlyFee: 0, uniformPrice: 0 }).catch(handleError);
    }, handleError);

    return () => { unsubPlayers(); unsubTeams(); unsubMatches(); unsubSettings(); };
  }, [user]);

  const getColl = (name) => {
     const isLocal = firebaseConfig && firebaseConfig.apiKey && firebaseConfig.apiKey !== "SUA_API_KEY_AQUI";
     const basePath = isLocal ? `rachao_manager_db/main` : `artifacts/${appId}/public/data`;
     return collection(db, `${basePath}/${name}`);
  };
  const getDocRef = (name, id) => {
     const isLocal = firebaseConfig && firebaseConfig.apiKey && firebaseConfig.apiKey !== "SUA_API_KEY_AQUI";
     const basePath = isLocal ? `rachao_manager_db/main` : `artifacts/${appId}/public/data`;
     return doc(db, `${basePath}/${name}`, id);
  };

  const dbActions = {
    addPlayer: async (data) => { await addDoc(getColl('players'), data); showToast('Jogador adicionado!'); },
    updatePlayer: async (id, data) => { await updateDoc(getDocRef('players', id), data); showToast('Jogador atualizado!'); },
    deletePlayer: async (id) => { await deleteDoc(getDocRef('players', id)); showToast('Jogador removido!', 'error'); },
    addTeam: async (data) => { await addDoc(getColl('teams'), data); showToast('Time criado!'); },
    deleteTeam: async (id) => { await deleteDoc(getDocRef('teams', id)); showToast('Time removido!', 'error'); },
    addMatch: async (data) => { await addDoc(getColl('matches'), data); showToast('Rodada criada!'); },
    updateMatch: async (id, data) => { await updateDoc(getDocRef('matches', id), data); showToast('Rodada atualizada!'); },
    deleteMatch: async (id) => { await deleteDoc(getDocRef('matches', id)); showToast('Rodada excluída!', 'error'); },
    updateSettings: async (data) => { if (financialSettings.id) await updateDoc(getDocRef('settings', financialSettings.id), data); showToast('Configurações salvas!'); }
  };

  const stats = useMemo(() => {
    const table = {}; const scorers = {}; const goalkeepers = {};
    teams.forEach(team => { table[team.id] = { id: team.id, name: team.name, p: 0, j: 0, v: 0, e: 0, d: 0, gp: 0, gc: 0, sg: 0 }; });
    players.forEach(p => {
      const currentTeam = teams.find(t => t.id === p.teamId);
      scorers[p.id] = { name: p.name, teamName: currentTeam ? currentTeam.name : '-', goals: 0, gamesPlayed: 0 };
      goalkeepers[p.id] = { name: p.name, goalsConceded: 0, weightedGames: 0 };
    });
    matches.forEach(match => {
      if (table[match.teamA] && table[match.teamB]) {
        const tA = table[match.teamA]; const tB = table[match.teamB];
        const sA = parseInt(match.scoreA || 0); const sB = parseInt(match.scoreB || 0);
        tA.j++; tB.j++; tA.gp += sA; tA.gc += sB; tB.gp += sB; tB.gc += sA; tA.sg = tA.gp - tA.gc; tB.sg = tB.gp - tB.gc;
        if (sA > sB) { tA.v++; tA.p += 3; tB.d++; } else if (sB > sA) { tB.v++; tB.p += 3; tA.d++; } else { tA.e++; tA.p += 1; tB.e++; tB.p += 1; }
      }
      [...(match.lineupA || []), ...(match.lineupB || [])].forEach(pid => { if (scorers[pid]) scorers[pid].gamesPlayed++; });
      [...(match.scorersA || []), ...(match.scorersB || [])].forEach(s => { if (scorers[s.playerId]) scorers[s.playerId].goals += parseInt(s.count || 0); });
      [...(match.goalkeepersA || []), ...(match.goalkeepersB || [])].forEach(gk => {
        if (goalkeepers[gk.playerId]) {
          goalkeepers[gk.playerId].weightedGames += parseInt(gk.minutes || 0) >= 90 ? 1 : 0.5;
          goalkeepers[gk.playerId].goalsConceded += parseInt(gk.conceded || 0);
        }
      });
    });
    return {
      table: Object.values(table).sort((a, b) => b.p - a.p || b.v - a.v || b.sg - a.sg),
      scorers: Object.values(scorers).filter(s => s.goals > 0).sort((a, b) => b.goals - a.goals || (a.name || '').localeCompare(b.name || '')),
      goalkeepers: Object.values(goalkeepers).filter(g => g.weightedGames > 0).map(g => ({...g, average: g.goalsConceded / g.weightedGames})).sort((a, b) => a.average - b.average || a.goalsConceded - b.goalsConceded)
    };
  }, [matches, teams, players]);

  if (!app) return (<div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 p-8 text-center"><div className="bg-white p-8 rounded-xl shadow-lg max-w-md w-full"><div className="bg-red-100 p-3 rounded-full w-fit mx-auto mb-4"><AlertCircle className="w-8 h-8 text-red-600" /></div><h1 className="text-2xl font-bold text-gray-800 mb-2">Configuração Necessária</h1><p className="text-gray-600 mb-6">Edite o arquivo <code>src/App.jsx</code> e cole suas chaves do Firebase na variável <code>firebaseConfig</code>.</p></div></div>);
  if (loading) return <div className="h-screen w-full flex items-center justify-center bg-gray-100 text-gray-500 gap-2"><Loader2 className="animate-spin" /> Carregando...</div>;
  if (!user) return <LoginScreen />;
  if (permissionError) return <PermissionHelp />;

  return (
    <div className="min-h-screen bg-gray-100 font-sans text-gray-900 flex flex-col">
      <Toast message={toast.message} type={toast.type} onClose={() => setToast({ message: '', type: '' })} />
      <ConfirmModal isOpen={confirmModal.isOpen} title={confirmModal.title} message={confirmModal.message} onConfirm={confirmModal.onConfirm} onCancel={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))} />
      <style>{`@media print { body, html { background: white; } header, nav, button, .no-print { display: none !important; } .print-only { display: block !important; } .card-print { border: none !important; shadow: none !important; } .p-print-0 { padding: 0 !important; } table { width: 100%; border-collapse: collapse; font-size: 12px; } th, td { border: 1px solid #ddd; padding: 8px; text-align: left; } th { background-color: #f2f2f2; } }`}</style>
      <header className="bg-gray-900 text-white shadow-md sticky top-0 z-50 print:hidden">
        <div className="max-w-6xl mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2 font-bold text-xl text-white"><div className="bg-blue-600 text-white p-1.5 rounded shadow-lg shadow-blue-900/50">⚽</div><span className="hidden sm:inline tracking-tight">Rachão Manager</span></div>
            <nav className="flex items-center gap-1 sm:gap-2 overflow-x-auto no-scrollbar mask-linear">
              {[{ id: 'dashboard', icon: LayoutDashboard, label: 'Dash' }, { id: 'matches', icon: Calendar, label: 'Jogos' }, { id: 'stats', icon: BarChart2, label: 'Stats' }, { id: 'teams', icon: Shirt, label: 'Times' }, { id: 'players', icon: Users, label: 'Jogadores' }, { id: 'financial', icon: DollarSign, label: 'Financeiro' }, { id: 'reports', icon: FileText, label: 'Relatórios' }].map((item) => (
                <button key={item.id} onClick={() => setActiveTab(item.id)} className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${activeTab === item.id ? 'bg-gray-800 text-white border border-gray-700 shadow-inner' : 'text-gray-400 hover:bg-gray-800 hover:text-white'}`}><item.icon className="w-4 h-4" /> <span className="hidden sm:inline">{item.label}</span></button>
              ))}
            </nav>
            <button onClick={() => signOut(auth)} className="ml-2 text-gray-400 hover:text-white" title="Sair"><LogOut className="w-5 h-5" /></button>
          </div>
        </div>
      </header>
      <main className="flex-1 p-4 md:p-8 overflow-y-auto print:p-0">
        <div className="max-w-6xl mx-auto print:max-w-none">
          {activeTab === 'dashboard' && <Dashboard stats={stats} matches={matches} />}
          {activeTab === 'stats' && <Statistics stats={stats} />}
          {activeTab === 'players' && <PlayerManager players={players} dbActions={dbActions} matches={matches} teams={teams} showToast={showToast} requestConfirm={requestConfirm} />}
          {activeTab === 'teams' && <TeamManager teams={teams} players={players} dbActions={dbActions} showToast={showToast} requestConfirm={requestConfirm} />}
          {activeTab === 'matches' && <MatchManager matches={matches} teams={teams} players={players} dbActions={dbActions} showToast={showToast} requestConfirm={requestConfirm} />}
          {activeTab === 'financial' && <FinancialManager players={players} settings={financialSettings} dbActions={dbActions} />}
          {activeTab === 'reports' && <ReportsPanel stats={stats} matches={matches} players={players} teams={teams} settings={financialSettings} />}
        </div>
      </main>
    </div>
  );
}

// --- MÓDULOS (Lógica UI) ---
function Dashboard({ stats, matches }) {
  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-2 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card className="p-5 border-l-4 border-blue-600">
          <div className="flex justify-between items-start mb-4"><div><p className="text-gray-500 text-xs uppercase font-bold tracking-wider">Total de Jogos</p><p className="text-4xl font-bold text-gray-800 mt-1">{matches.length}</p></div><div className="p-2 bg-blue-50 rounded-lg"><Calendar className="text-blue-600 w-6 h-6"/></div></div>
          <div className="border-t pt-3 space-y-1"><p className="text-[10px] font-bold text-gray-400 mb-2 uppercase">Vitórias por Time</p>{stats.table.slice(0, 3).map(t => (<div key={t.id} className="flex justify-between text-sm items-center"><span className="text-gray-600 font-medium">{t.name}</span><span className="bg-green-100 text-green-700 px-2 py-0.5 rounded text-xs font-bold">{t.v} v</span></div>))}</div>
        </Card>
        <Card className="p-5 border-l-4 border-yellow-500">
          <div className="mb-4 flex justify-between items-center"><p className="text-gray-500 text-xs uppercase font-bold tracking-wider flex items-center gap-2">Artilheiros</p><BarChart2 className="w-4 h-4 text-yellow-500"/></div>
          <div className="space-y-3">{stats.scorers.slice(0, 3).map((s, idx) => (<div key={idx} className="flex items-center justify-between"><div className="flex items-center gap-3"><span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold text-white shadow-sm ${idx === 0 ? 'bg-yellow-500' : idx === 1 ? 'bg-gray-400' : 'bg-orange-400'}`}>{idx + 1}</span><span className="font-medium text-sm text-gray-700 truncate max-w-[120px]">{s.name}</span></div><span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded-full font-bold border border-gray-200">{s.goals} gols</span></div>))}{stats.scorers.length === 0 && <p className="text-xs text-gray-400 italic text-center py-2">Nenhum gol registrado.</p>}</div>
        </Card>
      </div>
      <Card className="overflow-hidden"><div className="bg-white px-6 py-4 border-b border-gray-100 flex justify-between items-center"><h3 className="font-bold text-lg text-gray-800">Classificação Geral</h3></div><div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead className="text-xs text-gray-500 uppercase bg-gray-50 border-b border-gray-100"><tr><th className="px-6 py-3">Pos</th><th className="px-6 py-3">Time</th><th className="px-6 py-3 text-center text-blue-600 font-bold">P</th><th className="px-6 py-3 text-center">J</th><th className="px-6 py-3 text-center text-green-600">V</th><th className="px-6 py-3 text-center text-gray-500">E</th><th className="px-6 py-3 text-center text-red-500">D</th><th className="px-6 py-3 text-center text-gray-400">GP</th><th className="px-6 py-3 text-center text-gray-400">GC</th><th className="px-6 py-3 text-center font-bold">SG</th></tr></thead><tbody className="divide-y divide-gray-100">{stats.table.map((row, idx) => (<tr key={row.id} className="hover:bg-blue-50/30 transition-colors"><td className="px-6 py-4 text-gray-400">{idx + 1}º</td><td className="px-6 py-4 font-bold text-gray-800">{row.name}</td><td className="px-6 py-4 text-center font-bold text-blue-600 bg-blue-50 rounded">{row.p}</td><td className="px-6 py-4 text-center">{row.j}</td><td className="px-6 py-4 text-center text-green-600">{row.v}</td><td className="px-6 py-4 text-center text-gray-500">{row.e}</td><td className="px-6 py-4 text-center text-red-500">{row.d}</td><td className="px-6 py-4 text-center text-gray-400">{row.gp}</td><td className="px-6 py-4 text-center text-gray-400">{row.gc}</td><td className="px-6 py-4 text-center font-bold">{row.sg}</td></tr>))}</tbody></table></div></Card>
    </div>
  );
}

function Statistics({ stats }) {
  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      <Card><div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center"><h3 className="font-bold text-lg text-gray-800 flex items-center gap-2"><SoccerBallIcon className="w-5 h-5" /> Artilheiros</h3></div><div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead className="bg-gray-100 text-gray-600 uppercase text-xs"><tr><th className="px-6 py-3">Jogador</th><th className="px-6 py-3">Time</th><th className="px-6 py-3 text-center text-green-700">Gols</th><th className="px-6 py-3 text-center">Jogos</th><th className="px-6 py-3 text-center">Média</th></tr></thead><tbody className="divide-y divide-gray-100">{stats.scorers.map((s, i) => (<tr key={i} className="hover:bg-gray-50"><td className="px-6 py-3 font-medium">{s.name}</td><td className="px-6 py-3 text-xs text-gray-500">{s.teamName}</td><td className="px-6 py-3 text-center font-bold text-green-600 bg-green-50">{s.goals}</td><td className="px-6 py-3 text-center">{s.gamesPlayed}</td><td className="px-6 py-3 text-center text-gray-500">{(s.gamesPlayed > 0 ? (s.goals / s.gamesPlayed) : 0).toFixed(2)}</td></tr>))}</tbody></table></div></Card>
      <Card><div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex justify-between items-center"><h3 className="font-bold text-lg text-gray-800 flex items-center gap-2"><GloveIcon className="w-5 h-5" /> Goleiros</h3><span className="text-[10px] bg-orange-50 text-orange-600 px-2 py-1 rounded font-bold border border-orange-100">Pond: 45min = 0.5</span></div><div className="overflow-x-auto"><table className="w-full text-sm text-left"><thead className="bg-gray-100 text-gray-600 uppercase text-xs"><tr><th className="px-6 py-3">Goleiro</th><th className="px-6 py-3 text-center text-blue-700">Média</th><th className="px-6 py-3 text-center">Gols Sofr.</th><th className="px-6 py-3 text-center">Jogos</th></tr></thead><tbody className="divide-y divide-gray-100">{stats.goalkeepers.map((g, i) => (<tr key={i} className="hover:bg-gray-50"><td className="px-6 py-3 font-medium">{g.name}</td><td className="px-6 py-3 text-center font-bold text-blue-600 bg-blue-50">{g.average.toFixed(2)}</td><td className="px-6 py-3 text-center text-red-500">{g.goalsConceded}</td><td className="px-6 py-3 text-center text-gray-600">{g.weightedGames}</td></tr>))}</tbody></table></div></Card>
    </div>
  );
}

function PlayerManager({ players, dbActions, matches, teams, showToast, requestConfirm }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [filters, setFilters] = useState({ name: '', teamId: '', minPresence: '' });
  const [formData, setFormData] = useState({ name: '', phone: '', email: '', position: 'Meia', rating: 3, dob: '' });
  const ITEMS_PER_PAGE = 10;

  const getPresenceCount = (playerId) => matches ? matches.reduce((count, match) => count + ((match.lineupA?.includes(playerId) || match.lineupB?.includes(playerId)) ? 1 : 0), 0) : 0;
  const filteredPlayers = sortPlayersByName(players).filter(p => {
    const matchName = p.name.toLowerCase().includes(filters.name.toLowerCase());
    const matchTeam = filters.teamId ? p.teamId === filters.teamId : true;
    const presence = getPresenceCount(p.id);
    const matchPresence = filters.minPresence ? presence >= parseInt(filters.minPresence) : true;
    return matchName && matchTeam && matchPresence;
  });
  const totalPages = Math.ceil(filteredPlayers.length / ITEMS_PER_PAGE);
  const paginatedPlayers = filteredPlayers.slice((currentPage - 1) * ITEMS_PER_PAGE, currentPage * ITEMS_PER_PAGE);
  const getTeamName = (teamId) => teams.find(t => t.id === teamId)?.name || '-';

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) await dbActions.updatePlayer(editingId, formData);
      else await dbActions.addPlayer({ ...formData, payments: {}, uniformPaid: false });
      resetForm();
    } catch (err) { showToast("Erro ao salvar", "error"); }
  };

  const resetForm = () => { setFormData({ name: '', phone: '', email: '', position: 'Meia', rating: 3, dob: '' }); setIsAdding(false); setEditingId(null); };
  const handleEdit = (p) => { setFormData(p); setEditingId(p.id); setIsAdding(true); };
  const handleDelete = (id) => requestConfirm("Remover Jogador", "Tem certeza que deseja remover este jogador permanentemente?", async () => await dbActions.deletePlayer(id));

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center flex-wrap gap-4"><h2 className="text-xl font-bold text-gray-800">Gestão de Jogadores</h2><Button variant="blue" onClick={() => setIsAdding(true)}><Plus className="w-4 h-4"/> Novo Jogador</Button></div>
      <div className="flex flex-wrap gap-2 bg-white p-3 rounded-xl border border-gray-200 shadow-sm">
        <div className="flex-1 min-w-[150px] relative"><Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><input placeholder="Buscar..." className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg" value={filters.name} onChange={e => { setFilters({...filters, name: e.target.value}); setCurrentPage(1); }} /></div>
        <div className="w-40 relative"><Filter className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" /><select className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-lg bg-white" value={filters.teamId} onChange={e => { setFilters({...filters, teamId: e.target.value}); setCurrentPage(1); }}><option value="">Todos Times</option>{teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
        <div className="w-32"><input type="number" placeholder="Min. Jogos" className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg" value={filters.minPresence} onChange={e => { setFilters({...filters, minPresence: e.target.value}); setCurrentPage(1); }} /></div>
        {(filters.name || filters.teamId || filters.minPresence) && <Button variant="ghost" onClick={() => setFilters({ name: '', teamId: '', minPresence: '' })} className="text-xs">Limpar</Button>}
      </div>
      {isAdding && (
        <Card className="p-6 bg-blue-50/50 border-blue-100 shadow-lg mb-6">
          <h3 className="font-bold text-gray-800 mb-4 pb-2 border-b border-blue-100">{editingId ? 'Editar Jogador' : 'Cadastrar Novo Jogador'}</h3>
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="col-span-1 md:col-span-2"><label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Nome Completo</label><Input placeholder="Ex: Ricardo Oliveira" value={formData.name} onChange={e => setFormData({...formData, name: toTitleCase(e.target.value)})} required autoFocus /></div>
            <div><label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Data Nascimento</label><Input type="date" value={formData.dob} onChange={e => setFormData({...formData, dob: e.target.value})} /></div>
            <div><label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Celular</label><Input placeholder="(00) 00000-0000" value={formData.phone} onChange={e => setFormData({...formData, phone: e.target.value})} /></div>
            <div><label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Posição</label><select className="w-full p-2 rounded-lg border border-gray-300 bg-white" value={formData.position} onChange={e => setFormData({...formData, position: e.target.value})}>{['Goleiro', 'Zagueiro', 'Lateral', 'Volante', 'Meia', 'Atacante'].map(p => <option key={p} value={p}>{p}</option>)}</select></div>
            <div><label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Nota</label><div className="flex gap-1 items-center h-[42px]">{[1, 2, 3, 4, 5].map((star) => (<button type="button" key={star} onClick={() => setFormData({...formData, rating: star})} className={`text-2xl ${formData.rating >= star ? 'text-yellow-400' : 'text-gray-300'}`}>★</button>))}</div></div>
            <div className="md:col-span-2 flex gap-2 justify-end mt-4 pt-4 border-t border-blue-100"><Button onClick={resetForm} variant="ghost">Cancelar</Button><Button type="submit" variant="blue">Salvar Jogador</Button></div>
          </form>
        </Card>
      )}
      <Card className="overflow-hidden flex flex-col h-full">
        <table className="w-full text-sm text-left"><thead className="bg-gray-100 text-gray-600 uppercase text-xs"><tr><th className="px-6 py-3">Nome</th><th className="px-6 py-3">Posição</th><th className="px-6 py-3">Time</th><th className="px-6 py-3 text-center">Presenças</th><th className="px-6 py-3">Nota</th><th className="px-6 py-3 text-right">Ações</th></tr></thead><tbody className="divide-y divide-gray-100">{paginatedPlayers.map(p => (<tr key={p.id} className="hover:bg-gray-50"><td className="px-6 py-4 font-medium">{p.name}</td><td className="px-6 py-4 text-gray-600">{p.position}</td><td className="px-6 py-4 text-blue-600 text-xs font-bold">{getTeamName(p.teamId)}</td><td className="px-6 py-4 text-center"><span className={`px-2 py-1 rounded-full text-xs font-bold ${getPresenceCount(p.id) > 0 ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-400'}`}>{getPresenceCount(p.id)} jogos</span></td><td className="px-6 py-4 text-yellow-500 text-xs">{'★'.repeat(p.rating)}</td><td className="px-6 py-4 text-right flex justify-end gap-2"><Button variant="secondary" className="h-8 w-8 p-0 rounded-full" onClick={() => handleEdit(p)}><Edit className="w-3 h-3"/></Button><Button variant="danger" className="h-8 w-8 p-0 rounded-full" onClick={() => handleDelete(p.id)}><Trash2 className="w-3 h-3"/></Button></td></tr>))}</tbody></table>
        {filteredPlayers.length > ITEMS_PER_PAGE && <div className="p-4 border-t border-gray-100 flex justify-between items-center bg-gray-50"><span className="text-xs text-gray-500">Página {currentPage} de {totalPages}</span><div className="flex gap-2"><Button variant="secondary" disabled={currentPage === 1} onClick={() => setCurrentPage(c => c - 1)}><ChevronLeft className="w-4 h-4"/></Button><Button variant="secondary" disabled={currentPage === totalPages} onClick={() => setCurrentPage(c => c + 1)}><ChevronRight className="w-4 h-4"/></Button></div></div>}
      </Card>
    </div>
  );
}

function TeamManager({ teams, players, dbActions, showToast, requestConfirm }) {
  const [name, setName] = useState('');
  const [selectedTeamId, setSelectedTeamId] = useState(null);
  const [playerToAdd, setPlayerToAdd] = useState('');
  const [selectedColor, setSelectedColor] = useState('text-blue-600');

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

  const addTeam = async (e) => {
    e.preventDefault();
    if (!name) return showToast("Nome do time obrigatório", "error");
    await dbActions.addTeam({ name, id: Date.now().toString(), color: selectedColor });
    setName('');
  };

  const removeTeam = (id) => requestConfirm("Excluir Time", "Tem certeza? Isso removerá o time permanentemente.", async () => await dbActions.deleteTeam(id));
  const addPlayerToTeam = async () => { if (!playerToAdd || !selectedTeamId) return; await dbActions.updatePlayer(playerToAdd, { teamId: selectedTeamId }); setPlayerToAdd(''); showToast("Jogador adicionado ao time"); };
  const removePlayerFromTeam = async (playerId) => { await dbActions.updatePlayer(playerId, { teamId: null }); showToast("Jogador removido do time"); };
  const selectedTeam = teams.find(t => t.id === selectedTeamId);

  return (
    <div className="space-y-6 animate-in fade-in">
      <h2 className="text-xl font-bold text-gray-800">Times e Elencos</h2>
      <Card className="p-6 bg-white border-l-4 border-blue-600">
        <form onSubmit={addTeam} className="flex flex-col gap-4">
          <div className="flex gap-4 items-end">
            <div className="flex-1"><label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Criar Novo Time</label><Input placeholder="Nome do Time" value={name} onChange={e => setName(toTitleCase(e.target.value))} /></div>
            <Button type="submit" variant="blue" className="h-[42px]"><Plus className="w-4 h-4"/> Criar</Button>
          </div>
          <div className="flex gap-2">{colors.map(c => (<button type="button" key={c.id} onClick={() => setSelectedColor(c.class)} className={`w-8 h-8 rounded-full ${c.bg} transition-transform hover:scale-110 ${selectedColor === c.class ? 'ring-2 ring-offset-2 ring-gray-400 scale-110' : ''}`} />))}</div>
        </form>
      </Card>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-3">
          {teams.map(team => (
            <div key={team.id} onClick={() => setSelectedTeamId(team.id)} className={`p-4 rounded-xl border cursor-pointer flex justify-between items-center transition-all ${selectedTeamId === team.id ? 'border-blue-500 bg-blue-50 ring-1 ring-blue-500 shadow-md' : 'bg-white border-gray-200 hover:bg-gray-50'}`}>
              <div className="flex items-center gap-3"><div className={`p-2 rounded-lg bg-gray-100 ${team.color || 'text-gray-400'}`}><Shirt className="w-5 h-5" /></div><div><span className={`font-bold block ${selectedTeamId === team.id ? 'text-blue-900' : 'text-gray-700'}`}>{team.name}</span><span className="text-xs text-gray-500">{players.filter(p => p.teamId === team.id).length} jogadores</span></div></div>
              <Button variant="ghost" className="text-gray-400 hover:text-red-500 h-8 w-8 p-0 rounded-full" onClick={(e) => { e.stopPropagation(); removeTeam(team.id); }}><Trash2 className="w-4 h-4"/></Button>
            </div>
          ))}
        </div>
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm flex flex-col h-[500px]">
          {selectedTeam ? (
            <>
              <div className="p-4 border-b border-gray-100 bg-gray-50 rounded-t-xl"><h3 className="font-bold text-lg flex items-center gap-2 text-gray-800"><Users className="w-5 h-5 text-blue-600" /> {selectedTeam.name}</h3></div>
              <div className="p-4 border-b border-gray-100 flex gap-2"><select className="flex-1 border border-gray-300 rounded-lg px-3 py-2 text-sm" value={playerToAdd} onChange={e => setPlayerToAdd(e.target.value)}><option value="">Adicionar Jogador...</option>{sortPlayersByName(players.filter(p => !p.teamId)).map(p => <option key={p.id} value={p.id}>{p.name}</option>)}</select><Button variant="blue" onClick={addPlayerToTeam} disabled={!playerToAdd}><UserPlus className="w-4 h-4" /></Button></div>
              <div className="flex-1 overflow-y-auto p-2 space-y-2">{sortPlayersByName(players.filter(p => p.teamId === selectedTeamId)).map(p => (<div key={p.id} className="flex justify-between items-center text-sm p-3 bg-gray-50 rounded-lg border border-gray-100"><div className="flex flex-col"><span className="font-medium text-gray-800">{p.name}</span><span className="text-xs text-gray-500">{p.position}</span></div><button className="text-gray-300 hover:text-red-500 p-1.5" onClick={() => removePlayerFromTeam(p.id)}><UserMinus className="w-4 h-4"/></button></div>))}</div>
            </>
          ) : <div className="h-full flex flex-col items-center justify-center text-gray-300"><Shirt className="w-16 h-16 mb-4 opacity-50" /><p>Selecione um time ao lado</p></div>}
        </div>
      </div>
    </div>
  );
}

function MatchManager({ matches, teams, players, dbActions, showToast, requestConfirm }) {
  const [isAdding, setIsAdding] = useState(false);
  const [editingMatchId, setEditingMatchId] = useState(null);
  const [activeMatchId, setActiveMatchId] = useState(null);
  const [matchForm, setMatchForm] = useState({ date: new Date().toISOString().split('T')[0], teamA: '', teamB: '', scoreA: 0, scoreB: 0 });

  const resetForm = () => { setMatchForm({ date: new Date().toISOString().split('T')[0], teamA: '', teamB: '', scoreA: 0, scoreB: 0 }); setIsAdding(false); setEditingMatchId(null); };
  const handleSaveMatch = async () => {
    if (!matchForm.teamA || !matchForm.teamB) return showToast("Selecione os dois times", "error");
    const matchData = { ...matchForm, scoreA: parseInt(matchForm.scoreA || 0), scoreB: parseInt(matchForm.scoreB || 0) };
    if (editingMatchId) await dbActions.updateMatch(editingMatchId, matchData); else await dbActions.addMatch({ ...matchData, lineupA: [], lineupB: [], scorersA: [], scorersB: [], goalkeepersA: [], goalkeepersB: [] });
    resetForm();
  };
  const startEdit = (match) => { setMatchForm({ date: match.date, teamA: match.teamA, teamB: match.teamB, scoreA: match.scoreA, scoreB: match.scoreB }); setEditingMatchId(match.id); setIsAdding(true); };
  const deleteMatch = (id) => requestConfirm("Excluir Partida", "Tem certeza? Todos os dados (gols, súmula) serão perdidos.", async () => await dbActions.deleteMatch(id));

  if (activeMatchId) {
    const match = matches.find(m => m.id === activeMatchId);
    if (!match) { setTimeout(() => setActiveMatchId(null), 0); return null; }
    return <MatchDetails match={match} players={players} teams={teams} onBack={() => setActiveMatchId(null)} dbActions={dbActions} />;
  }

  return (
    <div className="space-y-6 animate-in fade-in">
      <div className="flex justify-between items-center"><h2 className="text-xl font-bold text-gray-800">Jogos e Rodadas</h2><Button variant="blue" onClick={() => { resetForm(); setIsAdding(!isAdding); }}>{isAdding ? 'Fechar' : <><Plus className="w-4 h-4"/> Nova Rodada</>}</Button></div>
      {isAdding && (
        <Card className="p-6 bg-blue-50/50 border-blue-100 shadow-lg mb-6">
          <h3 className="font-bold text-gray-800 mb-4 pb-2 border-b border-blue-200">{editingMatchId ? 'Editar Rodada' : 'Criar Rodada'}</h3>
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 items-end">
            <div className="md:col-span-1"><label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Data</label><Input type="date" value={matchForm.date} onChange={e => setMatchForm({...matchForm, date: e.target.value})} /></div>
            <div className="md:col-span-1"><label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Mandante</label><select className="w-full p-2 border border-gray-300 rounded-lg" value={matchForm.teamA} onChange={e => setMatchForm({...matchForm, teamA: e.target.value})}><option value="">Selecione...</option>{teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
            <div className="md:col-span-1 flex items-center gap-2 justify-center bg-white p-2 rounded-lg border border-gray-200"><Input type="number" className="text-center font-bold text-xl border-0 w-12 p-0" value={matchForm.scoreA} onChange={e => setMatchForm({...matchForm, scoreA: e.target.value})} /><span className="text-gray-400 font-black">X</span><Input type="number" className="text-center font-bold text-xl border-0 w-12 p-0" value={matchForm.scoreB} onChange={e => setMatchForm({...matchForm, scoreB: e.target.value})} /></div>
            <div className="md:col-span-1"><label className="text-xs font-bold text-gray-500 mb-1 block uppercase">Visitante</label><select className="w-full p-2 border border-gray-300 rounded-lg" value={matchForm.teamB} onChange={e => setMatchForm({...matchForm, teamB: e.target.value})}><option value="">Selecione...</option>{teams.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}</select></div>
            <Button variant="blue" onClick={handleSaveMatch} className="h-[42px]">{editingMatchId ? 'Atualizar' : 'Criar'}</Button>
          </div>
        </Card>
      )}
      <div className="space-y-4">
        {matches.map((m, index) => {
          const tA = teams.find(t => t.id == m.teamA)?.name || 'Excluído'; const tB = teams.find(t => t.id == m.teamB)?.name || 'Excluído'; const winA = parseInt(m.scoreA) > parseInt(m.scoreB); const winB = parseInt(m.scoreB) > parseInt(m.scoreA);
          return (
            <Card key={m.id} className="p-0 flex flex-col md:flex-row overflow-hidden hover:shadow-md transition-all group">
              <div className="w-full md:w-24 bg-gray-50 border-b md:border-b-0 md:border-r border-gray-100 p-4 flex flex-col items-center justify-center text-center"><span className="text-[10px] font-black text-blue-600 uppercase tracking-widest mb-1">Rodada</span><span className="text-2xl font-bold text-gray-700">{matches.length - index}</span><span className="text-[10px] text-gray-400 mt-1">{new Date(m.date).toLocaleDateString('pt-BR')}</span></div>
              <div className="flex-1 p-4 flex items-center justify-between gap-4"><div className="flex-1 flex items-center justify-end gap-3 text-right"><span className={`font-bold text-sm sm:text-base truncate ${winA ? 'text-gray-900' : 'text-gray-500'}`}>{tA}</span></div><div className="flex items-center bg-gray-100 rounded-lg px-3 py-1 gap-3 shadow-inner font-mono"><span className={`font-bold text-xl ${winA ? 'text-green-600' : 'text-gray-800'}`}>{m.scoreA}</span><span className="text-gray-300 text-xs">x</span><span className={`font-bold text-xl ${winB ? 'text-green-600' : 'text-gray-800'}`}>{m.scoreB}</span></div><div className="flex-1 flex items-center justify-start gap-3 text-left"><span className={`font-bold text-sm sm:text-base truncate ${winB ? 'text-gray-900' : 'text-gray-500'}`}>{tB}</span></div></div>
              <div className="bg-gray-50 p-4 flex items-center gap-2 border-l border-gray-100"><Button variant="secondary" onClick={() => setActiveMatchId(m.id)} className="text-xs h-8">Súmula</Button><div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity"><Button variant="ghost" className="h-8 w-8 p-0" onClick={() => startEdit(m)}><Edit className="w-4 h-4" /></Button><Button variant="ghost" className="h-8 w-8 p-0 text-red-400 hover:text-red-600" onClick={() => deleteMatch(m.id)}><Trash2 className="w-4 h-4" /></Button></div></div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

function MatchDetails({ match, players, teams, onBack, dbActions }) {
  const [localMatch, setLocalMatch] = useState(match);
  
  // Safe Check
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

  const updateLocal = (newData) => { const updated = { ...localMatch, ...newData }; setLocalMatch(updated); dbActions.updateMatch(updated.id, updated); };
  const togglePresence = (side, pid) => { const key = side === 'A' ? 'lineupA' : 'lineupB'; const list = localMatch[key] || []; updateLocal({ [key]: list.includes(pid) ? list.filter(id => id !== pid) : [...list, pid] }); };
  const addGoal = (side, pid, count) => { if (!pid || count < 1) return; const key = side === 'A' ? 'scorersA' : 'scorersB'; const list = [...(localMatch[key] || [])]; const existing = list.find(s => s.playerId == pid); if (existing) existing.count = parseInt(existing.count) + parseInt(count); else list.push({ playerId: pid, count: parseInt(count) }); updateLocal({ [key]: list }); };
  const addGK = (side, pid, min, conc) => { if (!pid) return; const key = side === 'A' ? 'goalkeepersA' : 'goalkeepersB'; const list = [...(localMatch[key] || [])]; list.push({ playerId: pid, minutes: min, conceded: conc }); updateLocal({ [key]: list }); };
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
                  <div className={`w-5 h-5 rounded flex items-center justify-center border ${lineup.includes(p.id) ? 'border-gray-800 bg-gray-800 text-white' : 'border-gray-300 bg-white'}`}>{lineup.includes(p.id) && <Check className="w-3 h-3" />}</div>{p.name}
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
          {renderTeamColumn('A', tA, getPotentialPlayers(localMatch.teamA), 'lineupA', 'scorersA', 'goalkeepersA')}
          <div className="hidden md:flex items-center justify-center text-gray-300 font-black text-2xl">X</div>
          {renderTeamColumn('B', tB, getPotentialPlayers(localMatch.teamB), 'lineupB', 'scorersB', 'goalkeepersB')}
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
    await dbActions.updatePlayer(player.id, { payments: { ...(player.payments || {}), [monthIndex]: next } });
  };
  const toggleUniform = async (player) => await dbActions.updatePlayer(player.id, { uniformPaid: !player.uniformPaid });
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
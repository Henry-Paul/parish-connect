'use client';
import React, { useState, useEffect } from 'react';
import { 
  Users, CreditCard, Music, MapPin, Bell, Home, LogOut, 
  Plus, Edit3, Droplet, HeartHandshake, AlertTriangle 
} from 'lucide-react';

interface Family { id: number; cardNo: string; name: string; address: string; phone: string; }
interface Member { id: number; familyId: number; name: string; relation: string; dob: string; 
  isDeceased: boolean; isEarning: boolean; choir?: any; sacraments?: any; catechism?: any; scholarship?: string; }

export default function ParishConnect() {
  const [showLogin, setShowLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  
  const [state, setState] = useState({
    role: null as string | null,
    token: null as string | null,
    name: '',
    loggedInFamily: null as Family | null,
    families: [] as Family[],
    members: [] as Member[],
    serviceRequests: [] as any[],
    activeTab: 'directory',
    selectedFamilyId: null as number | null,
    searchQuery: '',
  });

  const [loading, setLoading] = useState(false);

  const apiCall = async (endpoint: string, body: any = {}) => {
    const res = await fetch(`/api${endpoint}`, {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${state.token}`
      },
      body: JSON.stringify(body)
    });
    return res.json();
  };

  const handleLogin = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });
      const data = await res.json();

      if (data.success) {
        setState(prev => ({
          ...prev,
          role: data.role,
          token: data.token,
          name: data.name,
          loggedInFamily: data.familyId ? { id: data.familyId, cardNo: '', name: data.name, address: '', phone: '' } : null
        }));
        setShowLogin(false);
        loadData(data.token);
      } else {
        alert(data.message || "Login failed. Try again.");
      }
    } catch (e) {
      alert("Connection error");
    }
    setLoading(false);
  };

  const loadData = async (token: string) => {
    setLoading(true);
    try {
      // Load families
      const famRes = await apiCall('/families');
      const memRes = await apiCall('/members');
      
      setState(prev => ({
        ...prev,
        families: famRes.families || [],
        members: memRes.members || []
      }));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const selectFamily = (id: number) => {
    setState(prev => ({ ...prev, selectedFamilyId: id, activeTab: 'family-detail' }));
  };

  const switchTab = (tab: string) => {
    setState(prev => ({ ...prev, activeTab: tab }));
  };

  const logout = () => {
    setShowLogin(true);
    setEmail('');
    setPassword('');
    setState(prev => ({ ...prev, role: null, token: null, activeTab: 'directory' }));
  };

  // Render Directory
  const renderDirectory = () => {
    const filtered = state.families.filter(f => 
      f.name.toLowerCase().includes(state.searchQuery.toLowerCase()) || 
      f.cardNo.toLowerCase().includes(state.searchQuery.toLowerCase())
    );

    return (
      <div className="space-y-6 max-w-7xl mx-auto">
        <div className="flex justify-between items-center">
          <h2 className="text-3xl font-bold">Parish Directory</h2>
          <div className="relative w-80">
            <input
              type="text"
              placeholder="Search families..."
              className="w-full pl-10 p-3 border border-slate-300 rounded-xl"
              value={state.searchQuery}
              onChange={(e) => setState(prev => ({...prev, searchQuery: e.target.value}))}
            />
          </div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map(family => (
            <div key={family.id} onClick={() => selectFamily(family.id)}
              className="bg-white p-6 rounded-2xl shadow hover:shadow-xl cursor-pointer interactive-row">
              <div className="font-mono text-amber-600 mb-2">{family.cardNo}</div>
              <h3 className="text-xl font-bold">{family.name}</h3>
              <p className="text-slate-500 mt-2 line-clamp-2">{family.address}</p>
            </div>
          ))}
        </div>
      </div>
    );
  };

  // Render Family Detail (Your beautiful original layout preserved)
  const renderFamilyDetail = () => {
    const family = state.families.find(f => f.id === state.selectedFamilyId);
    const famMembers = state.members.filter(m => m.familyId === state.selectedFamilyId);

    if (!family) return <div>Family not found</div>;

    return (
      <div className="max-w-7xl mx-auto space-y-8">
        <button onClick={() => switchTab('directory')} className="flex items-center gap-2 text-slate-600 hover:text-slate-900">
          ← Back to Directory
        </button>

        <div className="bg-white rounded-3xl shadow p-8">
          <div className="flex justify-between">
            <div>
              <div className="uppercase text-amber-600 font-bold">{family.cardNo}</div>
              <h1 className="text-4xl font-black">{family.name}</h1>
            </div>
            {(state.role === 'admin' || state.role === 'council') && (
              <button className="bg-amber-500 text-slate-900 px-6 py-3 rounded-2xl font-bold">Edit Family</button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            <div className="bg-white rounded-3xl p-8 shadow">
              <h3 className="text-2xl font-bold mb-6 flex items-center gap-3">
                <Users className="text-blue-600" /> Family Members
              </h3>
              <div className="space-y-4">
                {famMembers.map(member => (
                  <div key={member.id} className="flex items-center justify-between p-4 border rounded-2xl hover:bg-slate-50 cursor-pointer"
                    onClick={() => alert(`Opened profile for ${member.name}`)}>
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-slate-200 rounded-full" />
                      <div>
                        <div className="font-semibold">{member.name}</div>
                        <div className="text-sm text-slate-500">{member.relation}</div>
                      </div>
                    </div>
                    <span className={`px-4 py-1 rounded-full text-xs ${member.isDeceased ? 'bg-red-100 text-red-700' : 'bg-emerald-100 text-emerald-700'}`}>
                      {member.isDeceased ? 'Deceased' : 'Alive'}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <div className="space-y-6">
            {/* Services */}
            <div className="bg-white rounded-3xl p-8 shadow">
              <h3 className="font-bold text-xl mb-4">Parish Services</h3>
              {state.role === 'family' && (
                <button className="w-full bg-blue-600 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-2">
                  <Droplet /> Book Baptism
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-slate-100">
      {showLogin ? (
        /* === LOGIN VIEW (Your Original Beautiful Login) === */
        <div className="min-h-screen flex items-center justify-center p-4 bg-slate-100">
          <div className="max-w-md w-full bg-white rounded-3xl shadow-2xl overflow-hidden">
            <div className="bg-slate-900 p-10 text-center text-white">
              <div className="mx-auto w-16 h-16 bg-amber-400 rounded-2xl flex items-center justify-center mb-6">
                <span className="text-4xl">⛪</span>
              </div>
              <h1 className="text-3xl font-bold">ParishConnect</h1>
              <p className="text-slate-400 mt-2">Church Records & Ministry CRM</p>
            </div>
            
            <div className="p-8 space-y-6">
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email Address"
                className="w-full p-4 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none"
              />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Password"
                className="w-full p-4 border border-slate-300 rounded-2xl focus:ring-2 focus:ring-amber-500 outline-none"
              />
              <button
                onClick={handleLogin}
                disabled={loading}
                className="w-full bg-amber-500 hover:bg-amber-600 text-slate-900 font-bold py-4 rounded-2xl transition text-lg"
              >
                {loading ? "Logging in..." : "Login to Parish"}
              </button>
            </div>
          </div>
        </div>
      ) : (
        /* === MAIN APP (Your Original Layout) === */
        <div className="flex h-screen">
          {/* Sidebar */}
          <div className="w-72 bg-slate-900 text-white flex flex-col">
            <div className="p-6 border-b border-slate-700 flex items-center gap-3">
              <span className="text-3xl">⛪</span>
              <h1 className="text-2xl font-bold">ParishConnect</h1>
            </div>

            <div className="flex-1 p-4 space-y-2">
              {state.role === 'admin' && (
                <>
                  <button onClick={() => switchTab('directory')} className={`w-full text-left p-4 rounded-2xl flex items-center gap-3 ${state.activeTab === 'directory' ? 'bg-amber-500 text-slate-900' : 'hover:bg-slate-800'}`}>
                    <Users /> Directory
                  </button>
                  <button onClick={() => switchTab('financials')} className="w-full text-left p-4 rounded-2xl flex items-center gap-3 hover:bg-slate-800">
                    <CreditCard /> Financials
                  </button>
                </>
              )}
              {/* Add more nav items as needed */}
            </div>

            <div className="p-4 border-t border-slate-700">
              <div className="mb-4 text-sm">Logged in as:<br/><span className="font-bold">{state.name}</span></div>
              <button onClick={logout} className="flex items-center gap-2 text-red-400 hover:text-red-500 w-full p-3 rounded-xl hover:bg-slate-800">
                <LogOut /> Logout
              </button>
            </div>
          </div>

          {/* Main Content */}
          <div className="flex-1 overflow-auto p-8">
            {state.activeTab === 'directory' && renderDirectory()}
            {state.activeTab === 'family-detail' && renderFamilyDetail()}
            {/* Add other tabs as needed */}
          </div>
        </div>
      )}
    </div>
  );
}

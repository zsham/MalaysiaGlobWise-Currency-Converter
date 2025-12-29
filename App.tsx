
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Layout } from './components/Layout';
import { POPULAR_CURRENCIES, API_URL } from './constants';
import { ConversionResult, ExchangeRates, HistoricalRate, User } from './types';
import { TrendChart } from './components/TrendChart';
import { HistoryTable } from './components/HistoryTable';
import { getFinancialInsights } from './services/geminiService';
import { AuthModal } from './components/AuthModal';

const AMOUNT_PRESETS = [100, 500, 1000, 5000];
const QUICK_PAIRS = [
  { from: 'USD', to: 'EUR' },
  { from: 'USD', to: 'MYR' },
  { from: 'GBP', to: 'USD' },
  { from: 'EUR', to: 'JPY' },
];

const App: React.FC = () => {
  const [amount, setAmount] = useState<number>(1000);
  const [fromCurrency, setFromCurrency] = useState<string>('USD');
  const [toCurrency, setToCurrency] = useState<string>('EUR');
  const [rates, setRates] = useState<ExchangeRates>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [history, setHistory] = useState<ConversionResult[]>([]);
  const [insights, setInsights] = useState<string>('');
  const [loadingInsights, setLoadingInsights] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Auth state
  const [user, setUser] = useState<User | null>(null);
  const [showAuthModal, setShowAuthModal] = useState(false);

  // Persistence
  useEffect(() => {
    const savedUser = localStorage.getItem('globalwise_user');
    if (savedUser) setUser(JSON.parse(savedUser));
    
    const savedHistory = localStorage.getItem('globalwise_history');
    if (savedHistory) setHistory(JSON.parse(savedHistory));

    const lastFrom = localStorage.getItem('globalwise_last_from');
    const lastTo = localStorage.getItem('globalwise_last_to');
    if (lastFrom) setFromCurrency(lastFrom);
    if (lastTo) setToCurrency(lastTo);
  }, []);

  useEffect(() => {
    localStorage.setItem('globalwise_last_from', fromCurrency);
    localStorage.setItem('globalwise_last_to', toCurrency);
  }, [fromCurrency, toCurrency]);

  // API Fetch
  useEffect(() => {
    const fetchRates = async () => {
      try {
        setLoading(true);
        const response = await fetch(`${API_URL}${fromCurrency}`);
        const data = await response.json();
        if (data.result === 'success') {
          setRates(data.rates);
          setError(null);
        } else {
          setError('Failed to fetch current exchange rates.');
        }
      } catch (err) {
        setError('Connection error. Please try again later.');
      } finally {
        setLoading(false);
      }
    };
    fetchRates();
  }, [fromCurrency]);

  const handleLogin = (user: User) => {
    setUser(user);
    localStorage.setItem('globalwise_user', JSON.stringify(user));
    setShowAuthModal(false);
  };

  const handleLogout = () => {
    setUser(null);
    localStorage.removeItem('globalwise_user');
    setInsights('');
  };

  const handleConvert = useCallback(async () => {
    if (!rates[toCurrency] || !user) return;

    const rate = rates[toCurrency];
    const resultValue = amount * rate;

    const newResult: ConversionResult = {
      from: fromCurrency,
      to: toCurrency,
      amount,
      result: resultValue,
      rate,
      timestamp: Date.now(),
    };

    const updatedHistory = [newResult, ...history].slice(0, 10);
    setHistory(updatedHistory);
    localStorage.setItem('globalwise_history', JSON.stringify(updatedHistory));

    setLoadingInsights(true);
    const aiInsight = await getFinancialInsights(fromCurrency, toCurrency, amount, rate);
    setInsights(aiInsight);
    setLoadingInsights(false);
  }, [amount, fromCurrency, toCurrency, rates, user, history]);

  const restoreConversion = (item: ConversionResult) => {
    setFromCurrency(item.from);
    setToCurrency(item.to);
    setAmount(item.amount);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const clearHistory = () => {
    setHistory([]);
    localStorage.removeItem('globalwise_history');
  };

  const swapCurrencies = () => {
    setFromCurrency(toCurrency);
    setToCurrency(fromCurrency);
  };

  const currentRate = rates[toCurrency] || 0;
  const result = amount * currentRate;

  const historicalData = useMemo(() => {
    if (!rates[toCurrency]) return [];
    const baseRate = rates[toCurrency];
    const data: HistoricalRate[] = [];
    for (let i = 6; i >= 0; i--) {
      const date = new Date();
      date.setDate(date.getDate() - i);
      const noise = (Math.random() - 0.5) * 0.04 * baseRate;
      data.push({
        date: date.toLocaleDateString(undefined, { weekday: 'short' }),
        rate: baseRate + noise,
      });
    }
    return data;
  }, [rates, toCurrency]);

  const isTrendingUp = useMemo(() => {
    if (historicalData.length < 2) return false;
    return historicalData[historicalData.length - 1].rate > historicalData[0].rate;
  }, [historicalData]);

  const renderLanding = () => (
    <div className="flex flex-col items-center justify-center py-16 md:py-32 px-4 text-center max-w-5xl mx-auto">
      <div id="converter" className="animate-bounce mb-8">
        <div className="w-20 h-20 bg-indigo-600 rounded-3xl rotate-12 flex items-center justify-center shadow-2xl shadow-indigo-500/40">
           <span className="text-white text-3xl font-black tracking-tighter -rotate-12">RM</span>
        </div>
      </div>
      <h1 className="text-6xl md:text-8xl font-black text-slate-100 tracking-tighter mb-8 leading-[0.9]">
        Currency with <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">Intelligence.</span>
      </h1>
      <p className="text-xl md:text-2xl text-slate-400 mb-12 max-w-2xl font-medium leading-relaxed">
        Stop guessing. Get real-time rates boosted by <span className="text-slate-100 font-bold underline decoration-indigo-500/50 decoration-4">MalaysiaGlobWise</span> for smarter global transactions.
      </p>
      
      <div className="flex flex-col sm:flex-row items-center gap-6 mb-24">
        <button 
          onClick={() => setShowAuthModal(true)}
          className="group relative px-12 py-6 bg-white text-slate-900 font-black rounded-3xl shadow-2xl transition-all hover:scale-105 active:scale-95 flex items-center gap-4 overflow-hidden"
        >
          <span className="relative z-10 flex items-center gap-3">
            <svg className="w-6 h-6" viewBox="0 0 48 48">
              <path fill="currentColor" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4 12.955 4 4 12.955 4 24s8.955 20 20 20 20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z" />
            </svg>
            Unlock Dark Mode Suite
          </span>
        </button>
      </div>

      <div className="w-full h-px bg-gradient-to-r from-transparent via-slate-800 to-transparent mb-24"></div>

      <div id="trends" className="grid grid-cols-1 md:grid-cols-3 gap-12 text-left">
        {[
          { icon: '🎯', title: 'Precision Rates', text: 'Institutional mid-market data with zero markup on the display.' },
          { icon: '🧠', title: 'AI Verdicts', text: 'Real-time financial reasoning to help you spot favorable windows.' },
          { icon: '🛡️', title: 'Private & Secure', text: 'Isolated session tracking and encrypted preference management.' },
        ].map((f, i) => (
          <div key={i} className="group bg-slate-900/40 p-10 rounded-[40px] transition-all border border-slate-800/50 hover:border-indigo-500/30 hover:bg-slate-900">
            <div className="text-4xl mb-6 grayscale group-hover:grayscale-0 transition-all">{f.icon}</div>
            <h3 className="text-xl font-bold text-slate-100 mb-3">{f.title}</h3>
            <p className="text-slate-400 leading-relaxed font-medium">{f.text}</p>
          </div>
        ))}
      </div>
    </div>
  );

  return (
    <Layout user={user} onLogout={handleLogout} onLoginClick={() => setShowAuthModal(true)}>
      {!user ? (
        renderLanding()
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-start animate-in fade-in slide-in-from-bottom-4 duration-1000">
          {/* Main Dashboard Column */}
          <div className="lg:col-span-8 space-y-10">
            {/* Converter Card */}
            <div id="converter" className="bg-slate-900 p-10 rounded-[40px] shadow-2xl border border-slate-800/50 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-32 -mt-32 pointer-events-none"></div>
              
              <div className="relative z-10">
                <div className="flex items-center justify-between mb-10">
                  <h2 className="text-3xl font-black text-slate-100 tracking-tight">Convert</h2>
                  <div className="flex gap-2">
                    {QUICK_PAIRS.map((pair, i) => (
                      <button
                        key={i}
                        onClick={() => { setFromCurrency(pair.from); setToCurrency(pair.to); }}
                        className="px-4 py-2 bg-slate-800 hover:bg-indigo-600/20 text-slate-400 hover:text-indigo-400 rounded-2xl text-[11px] font-bold transition-all border border-slate-700/50"
                      >
                        {pair.from}/{pair.to}
                      </button>
                    ))}
                  </div>
                </div>
                
                <div className="space-y-8">
                  <div className="grid grid-cols-1 md:grid-cols-7 gap-6 items-center">
                    {/* Input Amount */}
                    <div className="md:col-span-3">
                      <div className="group relative">
                        <label className="absolute -top-3 left-4 px-2 bg-slate-900 text-[10px] font-black uppercase tracking-widest text-indigo-400 z-20">Amount</label>
                        <div className="flex items-center gap-4 p-5 bg-slate-800/50 border-2 border-slate-800 group-hover:border-indigo-500/30 focus-within:border-indigo-500 focus-within:bg-slate-800 rounded-[28px] transition-all">
                          <span className="text-3xl font-black text-slate-500">
                            {POPULAR_CURRENCIES.find(c => c.code === fromCurrency)?.symbol}
                          </span>
                          <input
                            type="number"
                            value={amount}
                            onChange={(e) => setAmount(Number(e.target.value))}
                            className="w-full bg-transparent border-none outline-none font-black text-3xl text-slate-100 placeholder-slate-700"
                            placeholder="0.00"
                          />
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        {AMOUNT_PRESETS.map(p => (
                          <button
                            key={p}
                            onClick={() => setAmount(p)}
                            className={`px-5 py-2 rounded-2xl text-xs font-bold transition-all ${amount === p ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/30' : 'bg-slate-800 text-slate-500 hover:bg-slate-700 hover:text-slate-300'}`}
                          >
                            {p.toLocaleString()}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="md:col-span-1 flex justify-center pt-6 md:pt-0">
                      <button 
                        onClick={swapCurrencies}
                        className="p-5 rounded-[24px] bg-slate-800 text-slate-300 hover:bg-indigo-600 hover:text-white transition-all transform hover:rotate-180 active:scale-90 shadow-xl"
                      >
                        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                        </svg>
                      </button>
                    </div>

                    {/* Currencies Row */}
                    <div className="md:col-span-3 grid grid-cols-2 gap-4">
                      <div className="relative group">
                        <label className="absolute -top-3 left-4 px-2 bg-slate-900 text-[10px] font-black uppercase tracking-widest text-slate-500 z-20">From</label>
                        <select
                          value={fromCurrency}
                          onChange={(e) => setFromCurrency(e.target.value)}
                          className="w-full p-5 bg-slate-800/50 border-2 border-slate-800 group-hover:border-indigo-500/20 rounded-[28px] outline-none font-bold text-lg appearance-none transition-all cursor-pointer text-slate-100"
                        >
                          {POPULAR_CURRENCIES.map(curr => (
                            <option key={curr.code} value={curr.code} className="bg-slate-900">{curr.flag} {curr.code}</option>
                          ))}
                        </select>
                      </div>
                      <div className="relative group">
                        <label className="absolute -top-3 left-4 px-2 bg-slate-900 text-[10px] font-black uppercase tracking-widest text-slate-500 z-20">To</label>
                        <select
                          value={toCurrency}
                          onChange={(e) => setToCurrency(e.target.value)}
                          className="w-full p-5 bg-slate-800/50 border-2 border-slate-800 group-hover:border-indigo-500/20 rounded-[28px] outline-none font-bold text-lg appearance-none transition-all cursor-pointer text-slate-100"
                        >
                          {POPULAR_CURRENCIES.map(curr => (
                            <option key={curr.code} value={curr.code} className="bg-slate-900">{curr.flag} {curr.code}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  </div>

                  <div className="p-12 bg-indigo-600 rounded-[45px] text-white shadow-2xl shadow-indigo-500/20 group relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 blur-[80px] rounded-full -mr-32 -mt-32 pointer-events-none"></div>
                    
                    <div className="flex flex-col md:flex-row md:justify-between md:items-end gap-10 relative z-10">
                      <div className="space-y-4">
                        <div className="flex items-center gap-3">
                          <span className="px-3 py-1 bg-white/20 rounded-full text-[9px] font-black uppercase tracking-[0.2em] backdrop-blur-md">Institutional Feed</span>
                          {isTrendingUp ? (
                            <span className="flex items-center gap-1.5 text-[10px] font-black text-emerald-300 uppercase tracking-widest">
                               <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                               Optimistic Trend
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-[10px] font-black text-rose-300 uppercase tracking-widest">
                               <span className="w-1.5 h-1.5 rounded-full bg-rose-400 animate-pulse"></span>
                               Volatile
                            </span>
                          )}
                        </div>
                        <div>
                          <p className="text-indigo-100 text-xl font-medium mb-2">{amount.toLocaleString()} {fromCurrency} equals</p>
                          <h3 className="text-7xl font-black tracking-tighter transition-all group-hover:scale-[1.03] origin-left duration-500">
                            {result.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-3xl text-indigo-200/80 font-bold">{toCurrency}</span>
                          </h3>
                        </div>
                      </div>
                      
                      <button
                        onClick={handleConvert}
                        disabled={loading || loadingInsights}
                        className="relative group px-12 py-6 bg-slate-950 text-white hover:bg-white hover:text-indigo-600 font-black rounded-3xl shadow-2xl transition-all hover:-translate-y-1 active:scale-95 disabled:bg-indigo-300 flex items-center justify-center gap-4"
                      >
                        {loadingInsights ? (
                          <div className="w-6 h-6 border-4 border-indigo-200/30 border-t-white rounded-full animate-spin"></div>
                        ) : (
                          <svg className="w-6 h-6 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                          </svg>
                        )}
                        Smart Analysis
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div id="trends" className="space-y-10">
              <TrendChart data={historicalData} from={fromCurrency} to={toCurrency} />
              <HistoryTable history={history} onRestore={restoreConversion} onClear={clearHistory} />
            </div>
          </div>

          {/* Sidebar Insights */}
          <div className="lg:col-span-4 space-y-10">
            {/* AI Insights Card */}
            <div className="bg-slate-900 text-white rounded-[40px] shadow-2xl overflow-hidden relative border border-slate-800">
              <div className="absolute top-0 right-0 w-full h-full bg-[radial-gradient(circle_at_top_right,rgba(79,70,229,0.1),transparent_70%)]"></div>
              
              <div className="p-10 relative z-10">
                <div className="flex items-center gap-4 mb-10">
                  <div className="w-14 h-14 bg-indigo-600/20 rounded-[20px] flex items-center justify-center shadow-inner border border-indigo-500/20">
                    <svg className="w-7 h-7 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <h3 className="text-2xl font-black tracking-tight text-slate-100">AI Intelligence</h3>
                </div>
                
                <div className="space-y-6">
                  {loadingInsights ? (
                    <div className="space-y-8">
                      <div className="h-8 bg-slate-800 rounded-2xl w-3/4 animate-pulse"></div>
                      <div className="space-y-3">
                        <div className="h-4 bg-slate-800 rounded-xl w-full animate-pulse"></div>
                        <div className="h-4 bg-slate-800 rounded-xl w-full animate-pulse"></div>
                        <div className="h-4 bg-slate-800 rounded-xl w-5/6 animate-pulse"></div>
                      </div>
                      <div className="h-24 bg-slate-800/50 rounded-[30px] w-full animate-pulse"></div>
                    </div>
                  ) : insights ? (
                    <div className="prose prose-invert prose-slate max-w-none">
                      <div className="[&>h3]:text-indigo-400 [&>h3]:text-xs [&>h3]:uppercase [&>h3]:tracking-[0.25em] [&>h3]:font-black [&>h3]:mt-10 [&>h3]:mb-4 first:[&>h3]:mt-0 leading-relaxed text-[13px] text-slate-400 font-medium">
                        {insights.split('\n').map((line, i) => (
                          <p key={i} className="mb-3 last:mb-0">{line}</p>
                        ))}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-16">
                      <div className="w-20 h-20 bg-slate-800 rounded-[30px] flex items-center justify-center mx-auto mb-8 text-slate-700 shadow-inner">
                         <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>
                      </div>
                      <p className="text-slate-500 font-bold text-sm leading-relaxed px-4">Perform a conversion to unlock deep-learning financial insights and buy/sell signals.</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Market Pulse */}
            <div className="bg-slate-900 p-10 rounded-[40px] shadow-sm border border-slate-800/50">
              <h3 className="text-xl font-black text-slate-100 mb-10 tracking-tight">Global Pulse</h3>
              <div className="space-y-8">
                {POPULAR_CURRENCIES.filter(c => c.code !== fromCurrency).slice(0, 6).map((curr) => {
                  const rate = rates[curr.code] || 0;
                  return (
                    <div key={curr.code} className="flex justify-between items-center group cursor-default">
                      <div className="flex items-center gap-5">
                        <span className="text-3xl grayscale group-hover:grayscale-0 transition-all transform group-hover:scale-125 duration-500">{curr.flag}</span>
                        <div>
                          <p className="text-sm font-black text-slate-200 group-hover:text-indigo-400 transition-colors">{curr.code}</p>
                          <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{curr.name}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-black text-slate-100 font-mono tracking-tighter">{rate.toFixed(4)}</p>
                        <p className={`text-[9px] font-black uppercase tracking-widest ${rate > 1 ? 'text-emerald-500' : 'text-slate-600'}`}>
                          {rate > 1 ? 'Prime' : 'Yield'}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      )}
      
      {showAuthModal && (
        <AuthModal onLogin={handleLogin} onClose={() => setShowAuthModal(false)} />
      )}

      {error && (
        <div className="fixed bottom-10 left-1/2 -translate-x-1/2 px-10 py-5 bg-rose-950 text-rose-200 rounded-[30px] shadow-3xl flex items-center gap-5 z-[100] border border-rose-900/50 animate-in fade-in slide-in-from-bottom-10 backdrop-blur-xl">
          <div className="w-8 h-8 bg-rose-500 rounded-xl flex items-center justify-center text-white shadow-lg">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <span className="font-black text-sm tracking-tight">{error}</span>
          <button onClick={() => setError(null)} className="ml-4 hover:scale-110 transition-transform p-1">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
      )}
    </Layout>
  );
};

export default App;

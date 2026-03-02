import React, { useState, useEffect } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { Activity, ShieldAlert, Cpu, Database, Zap, ArrowUpRight, ArrowDownRight, AlertTriangle, ShieldCheck, Server, Layers } from 'lucide-react';
import { cn } from './lib/utils';

// --- Mock Data Generators ---
const generatePriceData = () => {
  let basePrice = 3450.20;
  return Array.from({ length: 60 }).map((_, i) => {
    basePrice += (Math.random() - 0.5) * 10;
    return {
      time: new Date(Date.now() - (60 - i) * 1000).toLocaleTimeString([], { hour12: false, second: '2-digit', minute: '2-digit' }),
      price: Number(basePrice.toFixed(2)),
      signal: i === 45 ? 'BUY' : i === 15 ? 'SELL' : null
    };
  });
};

const generateOrderBook = (basePrice: number) => {
  const asks = Array.from({ length: 8 }).map((_, i) => ({
    price: (basePrice + (i + 1) * 0.5).toFixed(2),
    size: (Math.random() * 10 + 1).toFixed(4),
    total: (Math.random() * 50 + 10).toFixed(4)
  })).reverse();
  
  const bids = Array.from({ length: 8 }).map((_, i) => ({
    price: (basePrice - (i + 1) * 0.5).toFixed(2),
    size: (Math.random() * 10 + 1).toFixed(4),
    total: (Math.random() * 50 + 10).toFixed(4)
  }));
  
  return { asks, bids };
};

const generateExecutionLogs = () => {
  return Array.from({ length: 5 }).map((_, i) => ({
    id: `0x${Math.random().toString(16).slice(2, 10)}...`,
    type: Math.random() > 0.5 ? 'BUY' : 'SELL',
    asset: 'WETH/USDC',
    amount: (Math.random() * 5 + 0.1).toFixed(2),
    price: (3450 + (Math.random() - 0.5) * 20).toFixed(2),
    gas: `${Math.floor(Math.random() * 50 + 100)}k`,
    latency: `${Math.floor(Math.random() * 5 + 2)}ms`,
    status: 'CONFIRMED',
    time: new Date(Date.now() - i * 5000).toLocaleTimeString([], { hour12: false, second: '2-digit', minute: '2-digit' })
  }));
};

// --- Components ---

const StatusIndicator = ({ label, status, icon: Icon }: { label: string, status: 'operational' | 'degraded' | 'offline', icon: any }) => {
  const colors = {
    operational: 'text-emerald-400 bg-emerald-400/10 border-emerald-400/20',
    degraded: 'text-amber-400 bg-amber-400/10 border-amber-400/20',
    offline: 'text-rose-400 bg-rose-400/10 border-rose-400/20'
  };

  return (
    <div className="flex items-center gap-3 px-4 py-2 rounded-lg border border-zinc-800 bg-zinc-900/50">
      <div className={cn("p-2 rounded-md border", colors[status])}>
        <Icon size={16} />
      </div>
      <div>
        <div className="text-[10px] uppercase tracking-wider text-zinc-500 font-mono">{label}</div>
        <div className="text-xs font-medium capitalize">{status}</div>
      </div>
    </div>
  );
};

const Card = ({ title, children, className, icon: Icon }: { title: string, children: React.ReactNode, className?: string, icon?: any }) => (
  <div className={cn("flex flex-col rounded-xl border border-zinc-800 bg-zinc-950 overflow-hidden", className)}>
    <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800 bg-zinc-900/30">
      {Icon && <Icon size={14} className="text-zinc-500" />}
      <h3 className="text-xs font-mono uppercase tracking-widest text-zinc-400">{title}</h3>
    </div>
    <div className="p-4 flex-1 overflow-auto">
      {children}
    </div>
  </div>
);

export default function App() {
  const [priceData, setPriceData] = useState(generatePriceData());
  const currentPrice = priceData[priceData.length - 1].price;
  const [orderBook, setOrderBook] = useState(generateOrderBook(currentPrice));
  const [logs, setLogs] = useState(generateExecutionLogs());
  const [circuitBreaker, setCircuitBreaker] = useState(false);

  useEffect(() => {
    const interval = setInterval(() => {
      setPriceData(prev => {
        const newData = [...prev.slice(1)];
        const lastPrice = newData[newData.length - 1].price;
        const newPrice = Number((lastPrice + (Math.random() - 0.5) * 5).toFixed(2));
        newData.push({
          time: new Date().toLocaleTimeString([], { hour12: false, second: '2-digit', minute: '2-digit' }),
          price: newPrice,
          signal: Math.random() > 0.95 ? (Math.random() > 0.5 ? 'BUY' : 'SELL') : null
        });
        setOrderBook(generateOrderBook(newPrice));
        return newData;
      });

      if (Math.random() > 0.8) {
        setLogs(prev => {
          const newLog = {
            id: `0x${Math.random().toString(16).slice(2, 10)}...`,
            type: Math.random() > 0.5 ? 'BUY' : 'SELL',
            asset: 'WETH/USDC',
            amount: (Math.random() * 5 + 0.1).toFixed(2),
            price: (currentPrice + (Math.random() - 0.5) * 2).toFixed(2),
            gas: `${Math.floor(Math.random() * 50 + 100)}k`,
            latency: `${Math.floor(Math.random() * 5 + 2)}ms`,
            status: 'CONFIRMED',
            time: new Date().toLocaleTimeString([], { hour12: false, second: '2-digit', minute: '2-digit' })
          };
          return [newLog, ...prev.slice(0, 4)];
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [currentPrice]);

  return (
    <div className="min-h-screen bg-[#09090B] text-zinc-100 p-4 md:p-6 lg:p-8 flex flex-col gap-6">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-zinc-800">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight flex items-center gap-3">
            <Layers className="text-indigo-500" />
            Diamond Quant
          </h1>
          <p className="text-sm text-zinc-500 mt-1 font-mono">Enterprise AI-Driven Trading System</p>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <StatusIndicator label="Solidity Diamond" status="operational" icon={Database} />
          <StatusIndicator label="Rust Spine" status="operational" icon={Zap} />
          <StatusIndicator label="Python Brain" status="operational" icon={Cpu} />
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1">
        
        {/* Left Column: Chart & Logs */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Price Chart */}
          <Card title="Market Data & AI Signals" icon={Activity} className="h-[400px]">
            <div className="flex justify-between items-end mb-4">
              <div>
                <div className="text-3xl font-mono font-light">${currentPrice.toFixed(2)}</div>
                <div className="text-sm text-emerald-400 font-mono flex items-center gap-1 mt-1">
                  <ArrowUpRight size={14} /> +1.24% (24h)
                </div>
              </div>
              <div className="flex gap-4 text-xs font-mono text-zinc-500">
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-indigo-500"></span> Price</div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> Buy Signal</div>
                <div className="flex items-center gap-2"><span className="w-2 h-2 rounded-full bg-rose-500"></span> Sell Signal</div>
              </div>
            </div>
            <div className="h-[280px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={priceData} margin={{ top: 5, right: 0, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#27272a" vertical={false} />
                  <XAxis dataKey="time" stroke="#52525b" fontSize={10} tickMargin={10} minTickGap={30} />
                  <YAxis domain={['auto', 'auto']} stroke="#52525b" fontSize={10} tickFormatter={(val) => `$${val}`} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#18181b', borderColor: '#27272a', borderRadius: '8px', fontSize: '12px', fontFamily: 'monospace' }}
                    itemStyle={{ color: '#e4e4e7' }}
                  />
                  <Area type="monotone" dataKey="price" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorPrice)" isAnimationActive={false} />
                  {priceData.map((entry, index) => {
                    if (entry.signal === 'BUY') {
                      return <ReferenceLine key={index} x={entry.time} stroke="#10b981" strokeDasharray="3 3" label={{ position: 'top', value: 'BUY', fill: '#10b981', fontSize: 10, fontFamily: 'monospace' }} />;
                    }
                    if (entry.signal === 'SELL') {
                      return <ReferenceLine key={index} x={entry.time} stroke="#f43f5e" strokeDasharray="3 3" label={{ position: 'top', value: 'SELL', fill: '#f43f5e', fontSize: 10, fontFamily: 'monospace' }} />;
                    }
                    return null;
                  })}
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* Execution Logs */}
          <Card title="Rust Executor Logs" icon={Server} className="flex-1 min-h-[300px]">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm font-mono">
                <thead className="text-xs text-zinc-500 border-b border-zinc-800">
                  <tr>
                    <th className="pb-3 font-normal">Tx Hash</th>
                    <th className="pb-3 font-normal">Type</th>
                    <th className="pb-3 font-normal">Asset</th>
                    <th className="pb-3 font-normal text-right">Amount</th>
                    <th className="pb-3 font-normal text-right">Price</th>
                    <th className="pb-3 font-normal text-right">Gas</th>
                    <th className="pb-3 font-normal text-right">Latency</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/50">
                  {logs.map((log, i) => (
                    <tr key={i} className="hover:bg-zinc-900/50 transition-colors">
                      <td className="py-3 text-indigo-400">{log.id}</td>
                      <td className="py-3">
                        <span className={cn("px-2 py-0.5 rounded text-[10px] font-bold", log.type === 'BUY' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400')}>
                          {log.type}
                        </span>
                      </td>
                      <td className="py-3 text-zinc-300">{log.asset}</td>
                      <td className="py-3 text-right text-zinc-300">{log.amount}</td>
                      <td className="py-3 text-right text-zinc-300">${log.price}</td>
                      <td className="py-3 text-right text-zinc-500">{log.gas}</td>
                      <td className="py-3 text-right text-amber-400">{log.latency}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right Column: Order Book & AI/Risk */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          
          {/* AI Brain Inference */}
          <Card title="Python Brain Inference" icon={Cpu}>
            <div className="space-y-4">
              <div className="flex justify-between items-center p-3 bg-zinc-900/50 rounded-lg border border-zinc-800">
                <span className="text-xs text-zinc-400 font-mono">Current Signal</span>
                <span className="text-sm font-bold text-emerald-400 font-mono bg-emerald-400/10 px-2 py-1 rounded">STRONG BUY</span>
              </div>
              
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-500">Model Confidence</span>
                  <span className="text-zinc-300">94.2%</span>
                </div>
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 w-[94.2%]"></div>
                </div>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-500">Kelly Fraction (f*)</span>
                  <span className="text-zinc-300">0.12</span>
                </div>
                <div className="h-1.5 bg-zinc-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[12%]"></div>
                </div>
              </div>
              
              <div className="grid grid-cols-2 gap-2 mt-4">
                <div className="p-3 bg-zinc-900/50 rounded-lg border border-zinc-800">
                  <div className="text-[10px] text-zinc-500 font-mono uppercase mb-1">Volatility (1h)</div>
                  <div className="text-sm font-mono text-zinc-300">1.42%</div>
                </div>
                <div className="p-3 bg-zinc-900/50 rounded-lg border border-zinc-800">
                  <div className="text-[10px] text-zinc-500 font-mono uppercase mb-1">Win Rate (24h)</div>
                  <div className="text-sm font-mono text-zinc-300">68.5%</div>
                </div>
              </div>
            </div>
          </Card>

          {/* Risk Manager */}
          <Card title="RiskManagerFacet" icon={ShieldAlert}>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="text-emerald-400" size={18} />
                  <span className="text-sm font-medium">Circuit Breaker</span>
                </div>
                <button 
                  onClick={() => setCircuitBreaker(!circuitBreaker)}
                  className={cn(
                    "px-3 py-1 rounded text-xs font-mono font-bold transition-colors",
                    circuitBreaker 
                      ? "bg-rose-500 text-white shadow-[0_0_10px_rgba(244,63,94,0.4)]" 
                      : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700"
                  )}
                >
                  {circuitBreaker ? 'ENGAGED' : 'STANDBY'}
                </button>
              </div>

              {circuitBreaker && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg flex items-start gap-3">
                  <AlertTriangle className="text-rose-500 shrink-0 mt-0.5" size={16} />
                  <div className="text-xs text-rose-200 leading-relaxed">
                    Trading halted. Diamond Proxy state modifiers frozen. Manual intervention required.
                  </div>
                </div>
              )}

              <div className="pt-4 border-t border-zinc-800 space-y-3">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-500">Max Drawdown Limit</span>
                  <span className="text-zinc-300">5.00%</span>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-500">Current Drawdown</span>
                  <span className="text-emerald-400">1.20%</span>
                </div>
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-zinc-500">Max Position Size</span>
                  <span className="text-zinc-300">15.00%</span>
                </div>
              </div>
            </div>
          </Card>

          {/* Order Book */}
          <Card title="L2 Order Book" icon={Database} className="flex-1">
            <div className="flex flex-col h-full font-mono text-xs">
              <div className="grid grid-cols-3 text-zinc-500 pb-2 border-b border-zinc-800 mb-2">
                <div>Price</div>
                <div className="text-right">Size</div>
                <div className="text-right">Total</div>
              </div>
              
              <div className="flex-1 flex flex-col justify-end gap-1 mb-2">
                {orderBook.asks.map((ask, i) => (
                  <div key={i} className="grid grid-cols-3 relative group cursor-pointer">
                    <div className="absolute right-0 top-0 bottom-0 bg-rose-500/10 z-0" style={{ width: `${(Number(ask.total) / 60) * 100}%` }}></div>
                    <div className="text-rose-400 z-10">{ask.price}</div>
                    <div className="text-right text-zinc-300 z-10">{ask.size}</div>
                    <div className="text-right text-zinc-500 z-10">{ask.total}</div>
                  </div>
                ))}
              </div>
              
              <div className="py-2 text-center text-sm font-bold text-zinc-100 border-y border-zinc-800 mb-2 bg-zinc-900/30">
                {currentPrice.toFixed(2)}
              </div>
              
              <div className="flex-1 flex flex-col gap-1">
                {orderBook.bids.map((bid, i) => (
                  <div key={i} className="grid grid-cols-3 relative group cursor-pointer">
                    <div className="absolute right-0 top-0 bottom-0 bg-emerald-500/10 z-0" style={{ width: `${(Number(bid.total) / 60) * 100}%` }}></div>
                    <div className="text-emerald-400 z-10">{bid.price}</div>
                    <div className="text-right text-zinc-300 z-10">{bid.size}</div>
                    <div className="text-right text-zinc-500 z-10">{bid.total}</div>
                  </div>
                ))}
              </div>
            </div>
          </Card>

        </div>
      </div>
    </div>
  );
}


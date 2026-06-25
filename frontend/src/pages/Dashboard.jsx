import React, { useEffect, useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import dashboardApi from '../services/api/dashboardApi';
import invoiceApi from '../services/api/invoiceApi';
import aiApi from '../services/api/aiApi';
import Spinner from '../components/Spinner';
import StatusBadge from '../components/StatusBadge';
import { useAuth } from '../context/AuthContext';
import {
  TrendingUp,
  FileText,
  Users,
  AlertTriangle,
  ArrowUpRight,
  Plus,
  Clock,
  CheckCircle2,
  DollarSign,
  Cpu,
  Sparkles,
  ShieldCheck
} from 'lucide-react';

// Custom, zero-dependency premium SVG Area Chart component for Monthly Revenue Trend
const AreaChart = ({ invoices }) => {
  const [hoveredIndex, setHoveredIndex] = useState(null);

  // Group data by last 6 months
  const chartData = useMemo(() => {
    const months = [];
    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const today = new Date();
    
    // Create placeholders for the last 6 months
    for (let i = 5; i >= 0; i--) {
      const d = new Date(today.getFullYear(), today.getMonth() - i, 1);
      months.push({
        year: d.getFullYear(),
        month: d.getMonth(),
        label: `${monthNames[d.getMonth()]} ${d.getFullYear().toString().slice(-2)}`,
        revenue: 0,
        outstanding: 0,
      });
    }

    // Accumulate invoice amounts
    (invoices || []).forEach(inv => {
      const dateStr = inv.issueDate || inv.createdAt;
      if (!dateStr) return;
      
      const date = new Date(dateStr);
      if (isNaN(date.getTime())) return;
      
      const invYear = date.getFullYear();
      const invMonth = date.getMonth();
      
      const match = months.find(m => m.year === invYear && m.month === invMonth);
      if (match) {
        const amount = Number(inv.totalAmount) || 0;
        if (inv.status === 'PAID') {
          match.revenue += amount;
        } else if (inv.status === 'PARTIAL') {
          // Splitting 50/50 for partial payments
          match.revenue += amount * 0.5;
          match.outstanding += amount * 0.5;
        } else {
          match.outstanding += amount;
        }
      }
    });

    return months;
  }, [invoices]);

  // SVG Chart sizing
  const width = 500;
  const height = 220;
  const padding = { top: 25, right: 20, bottom: 35, left: 55 };
  
  const chartWidth = width - padding.left - padding.right;
  const chartHeight = height - padding.top - padding.bottom;

  // Find max value for Y scaling
  const maxVal = useMemo(() => {
    const highestVal = Math.max(
      ...chartData.map(d => Math.max(d.revenue, d.outstanding)),
      10000 // default minimum max value to avoid division by zero and look good
    );
    return Math.ceil(highestVal * 1.15);
  }, [chartData]);

  // Calculate points coordinates
  const points = useMemo(() => {
    return chartData.map((d, index) => {
      const x = padding.left + (index * (chartWidth / (chartData.length - 1 || 1)));
      const yRev = padding.top + chartHeight - (d.revenue / maxVal) * chartHeight;
      const yOut = padding.top + chartHeight - (d.outstanding / maxVal) * chartHeight;
      return { x, yRev, yOut, ...d };
    });
  }, [chartData, maxVal, chartWidth, chartHeight]);

  // Cubic Bezier curve path generator (smooth horizontal tangent splines)
  const getCurvePath = (pts, key) => {
    if (pts.length === 0) return '';
    let path = `M ${pts[0].x} ${pts[0][key]}`;
    for (let i = 1; i < pts.length; i++) {
      const p0 = pts[i - 1];
      const p1 = pts[i];
      const cp1x = p0.x + (p1.x - p0.x) / 2;
      const cp1y = p0[key];
      const cp2x = p0.x + (p1.x - p0.x) / 2;
      const cp2y = p1[key];
      path += ` C ${cp1x} ${cp1y}, ${cp2x} ${cp2y}, ${p1.x} ${p1[key]}`;
    }
    return path;
  };

  const revenuePath = useMemo(() => getCurvePath(points, 'yRev'), [points]);
  const outstandingPath = useMemo(() => getCurvePath(points, 'yOut'), [points]);

  const revenueArea = useMemo(() => {
    if (!revenuePath) return '';
    return `${revenuePath} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`;
  }, [revenuePath, points, chartHeight]);

  const outstandingArea = useMemo(() => {
    if (!outstandingPath) return '';
    return `${outstandingPath} L ${points[points.length - 1].x} ${padding.top + chartHeight} L ${points[0].x} ${padding.top + chartHeight} Z`;
  }, [outstandingPath, points, chartHeight]);

  const yTicks = [0, maxVal * 0.25, maxVal * 0.5, maxVal * 0.75, maxVal];

  const formatYLabel = (val) => {
    if (val === 0) return '₹0';
    if (val >= 10000000) return `₹${(val / 10000000).toFixed(1)}Cr`;
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(0)}k`;
    return `₹${val}`;
  };

  return (
    <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm lg:col-span-2 relative flex flex-col justify-between overflow-hidden">
      {/* Chart Header */}
      <div className="flex items-center justify-between mb-4">
        <div>
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-slate-400">Monthly Revenue Trend</h4>
          <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">Comparison of paid revenue against outstanding invoices</p>
        </div>
        
        {/* Custom Legend */}
        <div className="flex items-center gap-4 text-[10px] font-bold">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-indigo-500 inline-block shadow-sm"></span>
            <span className="text-slate-600 dark:text-slate-350">Paid Revenue</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block shadow-sm"></span>
            <span className="text-slate-600 dark:text-slate-350">Outstanding</span>
          </div>
        </div>
      </div>

      {/* SVG Container */}
      <div className="relative w-full h-[180px] sm:h-[200px]">
        <svg 
          viewBox={`0 0 ${width} ${height}`} 
          className="w-full h-full overflow-visible"
        >
          <defs>
            {/* Gradients */}
            <linearGradient id="revenueGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
            </linearGradient>
            <linearGradient id="outstandingGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.4" />
              <stop offset="100%" stopColor="#f59e0b" stopOpacity="0.0" />
            </linearGradient>

            {/* Glowing filter */}
            <filter id="chartGlow" x="-20%" y="-20%" width="140%" height="140%">
              <feGaussianBlur stdDeviation="3" result="blur" />
              <feMerge>
                <feMergeNode in="blur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>

          {/* Grid lines */}
          <g className="opacity-40 dark:opacity-20">
            {yTicks.map((val, idx) => {
              const y = padding.top + chartHeight - (val / maxVal) * chartHeight;
              return (
                <g key={idx}>
                  <line 
                    x1={padding.left} 
                    y1={y} 
                    x2={width - padding.right} 
                    y2={y} 
                    stroke="currentColor" 
                    strokeWidth={1} 
                    strokeDasharray={idx === 0 ? "none" : "3,3"}
                    className="text-slate-300 dark:text-slate-700"
                  />
                  {/* Y Axis Labels */}
                  <text 
                    x={padding.left - 8} 
                    y={y + 4} 
                    textAnchor="end" 
                    className="text-[9px] font-extrabold fill-slate-400 dark:fill-slate-500 font-sans"
                  >
                    {formatYLabel(val)}
                  </text>
                </g>
              );
            })}
          </g>

          {/* Gradient Areas */}
          <path d={revenueArea} fill="url(#revenueGrad)" />
          <path d={outstandingArea} fill="url(#outstandingGrad)" />

          {/* Curved Stroke Lines with Glow */}
          <path 
            d={revenuePath} 
            fill="none" 
            stroke="#6366f1" 
            strokeWidth={3} 
            strokeLinecap="round"
            filter="url(#chartGlow)"
          />
          <path 
            d={outstandingPath} 
            fill="none" 
            stroke="#f59e0b" 
            strokeWidth={3} 
            strokeLinecap="round"
            filter="url(#chartGlow)"
          />

          {/* X Axis Labels */}
          <g>
            {points.map((pt, idx) => (
              <text 
                key={idx} 
                x={pt.x} 
                y={height - 8} 
                textAnchor="middle" 
                className="text-[9px] font-extrabold fill-slate-400 dark:fill-slate-500 font-sans"
              >
                {pt.label}
              </text>
            ))}
          </g>

          {/* Interactive vertical hover marker */}
          {hoveredIndex !== null && points[hoveredIndex] && (
            <g>
              <line 
                x1={points[hoveredIndex].x} 
                y1={padding.top} 
                x2={points[hoveredIndex].x} 
                y2={padding.top + chartHeight} 
                stroke="currentColor" 
                strokeWidth={1.5} 
                strokeDasharray="4,4"
                className="text-slate-400 dark:text-slate-600"
              />
              {/* Highlight dots */}
              <circle 
                cx={points[hoveredIndex].x} 
                cy={points[hoveredIndex].yRev} 
                r={6} 
                fill="#6366f1" 
                stroke="#fff" 
                strokeWidth={2}
                className="shadow-sm dark:stroke-slate-900"
              />
              <circle 
                cx={points[hoveredIndex].x} 
                cy={points[hoveredIndex].yOut} 
                r={6} 
                fill="#f59e0b" 
                stroke="#fff" 
                strokeWidth={2}
                className="shadow-sm dark:stroke-slate-900"
              />
            </g>
          )}

          {/* Invisible interactive hover columns overlay */}
          <g>
            {points.map((pt, idx) => {
              const colWidth = chartWidth / (points.length - 1);
              const xStart = idx === 0 
                ? pt.x 
                : pt.x - colWidth / 2;
              const xEnd = idx === points.length - 1 
                ? pt.x 
                : pt.x + colWidth / 2;
              
              return (
                <rect
                  key={idx}
                  x={xStart}
                  y={padding.top}
                  width={xEnd - xStart}
                  height={chartHeight}
                  fill="transparent"
                  className="cursor-pointer"
                  onMouseEnter={() => setHoveredIndex(idx)}
                  onMouseLeave={() => setHoveredIndex(null)}
                />
              );
            })}
          </g>
        </svg>

        {/* Floating Tooltip HTML Overlay */}
        {hoveredIndex !== null && points[hoveredIndex] && (
          <div 
            className="absolute top-2 z-20 pointer-events-none transition-all duration-150 backdrop-blur-md bg-white/90 dark:bg-slate-900/90 border border-slate-200 dark:border-slate-800 shadow-xl rounded-xl p-3 text-left space-y-1.5 w-[160px]"
            style={{
              left: `${(points[hoveredIndex].x / width) * 100}%`,
              transform: hoveredIndex === 0 
                ? 'translateX(10px)' 
                : hoveredIndex === points.length - 1 
                  ? 'translateX(-110%)' 
                  : 'translateX(-50%)',
            }}
          >
            <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-wider">
              {points[hoveredIndex].label}
            </p>
            <div className="space-y-1">
              <div className="flex justify-between items-center gap-2 text-[11px] font-semibold text-slate-600 dark:text-slate-350">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 inline-block"></span>
                  Paid:
                </span>
                <span className="font-extrabold text-slate-800 dark:text-white">
                  ₹{points[hoveredIndex].revenue.toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center gap-2 text-[11px] font-semibold text-slate-600 dark:text-slate-350">
                <span className="flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 inline-block"></span>
                  Outstanding:
                </span>
                <span className="font-extrabold text-slate-800 dark:text-white">
                  ₹{points[hoveredIndex].outstanding.toLocaleString()}
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export const Dashboard = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState(null);
  const [invoices, setInvoices] = useState([]);
  const [allInvoices, setAllInvoices] = useState([]);
  const [loading, setLoading] = useState(true);

  // AI Calculator state
  const [calcAmount, setCalcAmount] = useState('45000');
  const [calcDays, setCalcDays] = useState('30');
  const [calcResult, setCalcResult] = useState(null);
  const [calcLoading, setCalcLoading] = useState(false);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);
      const [statsData, invoicesData] = await Promise.all([
        dashboardApi.getDashboard(),
        invoiceApi.getInvoices(),
      ]);
      setStats(statsData);
      setAllInvoices(invoicesData || []);
      const sortedInvoices = (invoicesData || [])
        .sort((a, b) => b.id - a.id)
        .slice(0, 5);
      setInvoices(sortedInvoices);
    } catch (err) {
      console.error('Failed to load dashboard data:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleCalculateRisk = async (e) => {
    e.preventDefault();
    if (!calcAmount || !calcDays) return;
    try {
      setCalcLoading(true);
      const res = await aiApi.predictLatePayment(Number(calcAmount), Number(calcDays));
      const probPercent = Math.round((res.latePaymentProbability || 0) * 100);
      setCalcResult({
        score: probPercent,
        level: res.riskLevel || (probPercent >= 55 ? 'HIGH' : 'LOW'),
        message: probPercent >= 55
          ? `High Risk (${probPercent}%). The model predicts a high probability of payment delay. Net-15 billing terms or partial advance collections are advised.`
          : `Low Risk (${probPercent}%). Safe terms. The model anticipates timely clearing. Issuing standard Net-30 credit terms is approved.`
      });
    } catch (err) {
      console.error('AI Risk Simulation failed:', err);
      setCalcResult({
        score: 0,
        level: 'ERROR',
        message: 'Could not calculate risk. Please ensure backend is running.'
      });
    } finally {
      setCalcLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[70vh] flex items-center justify-center">
        <Spinner size="lg" />
      </div>
    );
  }

  // Calculate fallbacks if API values are null
  const totalRevenue = stats?.totalRevenue || 0.0;
  const outstandingAmount = stats?.outstandingAmount || 0.0;
  const totalInvoices = stats?.totalInvoices || 0;
  const totalClients = stats?.totalClients || 0;
  const paidCount = stats?.paidInvoices || 0;
  const unpaidCount = stats?.unpaidInvoices || 0;
  const partialCount = stats?.partialInvoices || 0;
  const overdueCount = stats?.overdueInvoices || 0;

  // Percentage calculations
  const totalBreakdown = paidCount + unpaidCount + partialCount + overdueCount || 1;
  const paidPercent = Math.round((paidCount / totalBreakdown) * 100);
  const unpaidPercent = Math.round((unpaidCount / totalBreakdown) * 100);
  const partialPercent = Math.round((partialCount / totalBreakdown) * 100);
  const overduePercent = Math.round((overdueCount / totalBreakdown) * 100);



  if (user?.role === 'CLIENT') {
    const clientInvoices = invoices.filter(
      (inv) => inv.clientId === user.id || inv.clientName === user.tenant?.companyName
    );
    const paidInvoices = clientInvoices.filter((i) => i.status === 'PAID');
    const unpaidInvoices = clientInvoices.filter((i) => i.status !== 'PAID');
    const totalPaid = paidInvoices.reduce((sum, i) => sum + i.totalAmount, 0);
    const outstanding = unpaidInvoices.reduce((sum, i) => sum + i.totalAmount, 0);

    return (
      <div className="space-y-6">
        {/* Welcome header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">Customer Portal</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Review accounts and settle payments with {user?.tenant?.companyName}.</p>
          </div>
        </div>



        {/* Metrics Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm">
            <div className="space-y-1.5">
              <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total Billed</p>
              <h3 className="text-2xl font-black text-slate-800 dark:text-white">₹{(totalPaid + outstanding).toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 rounded-xl">
              <DollarSign size={20} />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm">
            <div className="space-y-1.5">
              <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Outstanding Due</p>
              <h3 className="text-2xl font-black text-rose-600 dark:text-rose-400">₹{outstanding.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-rose-50 dark:bg-rose-950/20 text-rose-600 z-10 rounded-xl">
              <Clock size={20} />
            </div>
          </div>

          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm">
            <div className="space-y-1.5">
              <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total Settled</p>
              <h3 className="text-2xl font-black text-emerald-600 dark:text-emerald-400">₹{totalPaid.toLocaleString()}</h3>
            </div>
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 z-10 rounded-xl">
              <CheckCircle2 size={20} />
            </div>
          </div>
        </div>

        {/* Client Invoices List */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-slate-400 mb-4">My Invoices</h4>
          {clientInvoices.length === 0 ? (
            <p className="text-xs text-slate-500 dark:text-slate-400 italic">No invoices billed to your account yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50/20 dark:bg-slate-900/10">
                    <th className="py-2.5 px-3">Invoice #</th>
                    <th className="py-2.5 px-3">Due Date</th>
                    <th className="py-2.5 px-3">Total Amount</th>
                    <th className="py-2.5 px-3">Status</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                  {clientInvoices.map((inv) => (
                    <tr key={inv.id} className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                      <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">#{inv.invoiceNumber}</td>
                      <td className="py-3 px-3 font-medium text-slate-500">{inv.dueDate || 'N/A'}</td>
                      <td className="py-3 px-3 font-black text-slate-900 dark:text-white">₹{(inv.totalAmount || 0).toLocaleString()}</td>
                      <td className="py-3 px-3"><StatusBadge status={inv.status} /></td>
                      <td className="py-3 px-3 text-right">
                        <Link to={`/invoices/${inv.id}`}>
                          <button className="text-xs font-bold text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer">
                            View & Pay
                          </button>
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Welcome header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Workspace Overview</h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">Real-time statistics on invoices, payments, and clients.</p>
        </div>
        {(user?.role === 'OWNER' || user?.role === 'ACCOUNTANT') && (
          <Link to="/invoices/create">
            <button className="inline-flex items-center justify-center font-bold rounded-xl text-sm px-4 py-2.5 bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-500/10 cursor-pointer">
              <Plus size={16} className="mr-2" />
              Create Invoice
            </button>
          </Link>
        )}
      </div>



      {/* Metrics Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Revenue */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm relative overflow-hidden">
          <div className="space-y-1.5 z-10">
            <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total Revenue</p>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white">₹{totalRevenue.toLocaleString()}</h3>
            <span className="inline-flex items-center text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/30 px-1.5 py-0.5 rounded-lg">
              <TrendingUp size={10} className="mr-1" /> Active Collections
            </span>
          </div>
          <div className="p-3 bg-primary-50 dark:bg-primary-950/20 text-primary-600 dark:text-primary-400 rounded-xl z-10">
            <DollarSign size={20} />
          </div>
        </div>

        {/* Outstanding Balance */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm relative overflow-hidden">
          <div className="space-y-1.5 z-10">
            <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Unpaid Balance</p>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white">₹{outstandingAmount.toLocaleString()}</h3>
            <span className="inline-flex items-center text-[10px] font-bold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 px-1.5 py-0.5 rounded-lg">
              <Clock size={10} className="mr-1" /> Pending settlement
            </span>
          </div>
          <div className="p-3 bg-amber-50 dark:bg-amber-950/20 text-amber-600 dark:text-amber-500 rounded-xl z-10">
            <AlertTriangle size={20} />
          </div>
        </div>

        {/* Total Invoices */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm relative overflow-hidden">
          <div className="space-y-1.5 z-10">
            <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total Invoices</p>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white">{totalInvoices}</h3>
            <span className="inline-flex items-center text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-lg">
              {paidCount} PAID • {unpaidCount} UNPAID
            </span>
          </div>
          <div className="p-3 bg-indigo-50 dark:bg-indigo-950/20 text-indigo-600 dark:text-indigo-400 rounded-xl z-10">
            <FileText size={20} />
          </div>
        </div>

        {/* Total Clients */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 flex items-center justify-between shadow-sm relative overflow-hidden">
          <div className="space-y-1.5 z-10">
            <p className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Total Clients</p>
            <h3 className="text-2xl font-black text-slate-800 dark:text-white">{totalClients}</h3>
            <span className="inline-flex items-center text-[10px] font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-1.5 py-0.5 rounded-lg">
              Registered buyers
            </span>
          </div>
          <div className="p-3 bg-emerald-50 dark:bg-emerald-950/20 text-emerald-600 dark:text-emerald-500 rounded-xl z-10">
            <Users size={20} />
          </div>
        </div>
      {/* Charts & Status Distributions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Monthly Revenue Trend Area Chart */}
        <AreaChart invoices={allInvoices} />

        {/* Invoice status distribution */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm lg:col-span-1">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 mb-4 uppercase tracking-wider text-slate-400">Invoice Status Distribution</h4>
          
          <div className="space-y-4">
            {/* PAID */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-500 dark:text-slate-400">Paid Invoices ({paidCount})</span>
                <span className="text-emerald-600 dark:text-emerald-400 font-bold">{paidPercent}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${paidPercent}%` }}></div>
              </div>
            </div>

            {/* PARTIAL */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-500 dark:text-slate-400">Partially Paid ({partialCount})</span>
                <span className="text-amber-500 dark:text-amber-400 font-bold">{partialPercent}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-amber-500 h-full rounded-full transition-all duration-500" style={{ width: `${partialPercent}%` }}></div>
              </div>
            </div>

            {/* UNPAID */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-500 dark:text-slate-400">Unpaid ({unpaidCount})</span>
                <span className="text-rose-500 dark:text-rose-400 font-bold">{unpaidPercent}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-rose-500 h-full rounded-full transition-all duration-500" style={{ width: `${unpaidPercent}%` }}></div>
              </div>
            </div>

            {/* OVERDUE */}
            <div className="space-y-1">
              <div className="flex justify-between text-xs font-semibold">
                <span className="text-slate-500 dark:text-slate-400">Overdue ({overdueCount})</span>
                <span className="text-red-500 dark:text-red-400 font-bold">{overduePercent}%</span>
              </div>
              <div className="w-full bg-slate-100 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div className="bg-red-500 h-full rounded-full transition-all duration-500" style={{ width: `${overduePercent}%` }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Invoices Table */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl p-5 shadow-sm w-full">
        <div className="flex items-center justify-between mb-4">
          <h4 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider text-slate-400">Recent Invoices</h4>
          <Link to="/invoices" className="text-xs font-bold text-primary-600 dark:text-primary-400 hover:underline flex items-center">
            View All Invoices <ArrowUpRight size={14} className="ml-0.5" />
          </Link>
        </div>

        {invoices.length === 0 ? (
          <div className="h-48 flex flex-col items-center justify-center text-center">
            <FileText className="w-8 h-8 text-slate-300 dark:text-slate-700 mb-2" />
            <p className="text-sm font-bold text-slate-500 dark:text-slate-400">No invoices created yet</p>
            <Link to="/invoices/create" className="text-xs text-primary-500 font-semibold hover:underline mt-1">
              Create your first invoice
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-100 dark:border-slate-800 text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest bg-slate-50/20 dark:bg-slate-900/10">
                  <th className="py-2.5 px-3">Invoice #</th>
                  <th className="py-2.5 px-3">Client</th>
                  <th className="py-2.5 px-3">Due Date</th>
                  <th className="py-2.5 px-3">Total</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/50">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="text-xs font-semibold text-slate-700 dark:text-slate-300 hover:bg-slate-50/50 dark:hover:bg-slate-800/10">
                    <td className="py-3 px-3 font-bold text-slate-900 dark:text-white">#{inv.invoiceNumber}</td>
                    <td className="py-3 px-3">{inv.clientName || 'N/A'}</td>
                    <td className="py-3 px-3 font-medium text-slate-500">{inv.dueDate || 'N/A'}</td>
                    <td className="py-3 px-3 font-black text-slate-900 dark:text-white">₹{(inv.totalAmount || 0).toLocaleString()}</td>
                    <td className="py-3 px-3"><StatusBadge status={inv.status} /></td>
                    <td className="py-3 px-3 text-right">
                      <Link to={`/invoices/${inv.id}`}>
                        <button className="text-xs font-bold text-primary-500 hover:text-primary-600 dark:hover:text-primary-400 cursor-pointer">
                          Manage
                        </button>
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
      </div>

      {/* Handcrafted AI Predictive Analytics Hub */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 pt-2">
        {/* AI Calculator (Left 3 columns) */}
        <div className="lg:col-span-3 bg-gradient-to-br from-white to-slate-50/30 dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-md space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary-100 dark:bg-primary-950/40 text-primary-600 dark:text-primary-400 rounded-xl">
                <Cpu size={18} className="animate-pulse" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-800 dark:text-white">AI Payment Terms Simulator</h4>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">Simulate cashflow settlement probabilities based on invoice parameters.</p>
              </div>
            </div>
            <Sparkles size={16} className="text-primary-400 animate-bounce" />
          </div>

          <form onSubmit={handleCalculateRisk} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Invoice Amount (₹)
              </label>
              <input
                type="number"
                value={calcAmount}
                onChange={(e) => setCalcAmount(e.target.value)}
                placeholder="50000"
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                required
              />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-[10px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">
                Planned Terms (Days to Pay)
              </label>
              <input
                type="number"
                value={calcDays}
                onChange={(e) => setCalcDays(e.target.value)}
                placeholder="30"
                className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-semibold text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-primary-500/20"
                required
              />
            </div>
            <div className="md:col-span-2 pt-2">
              <button
                type="submit"
                disabled={calcLoading}
                className="w-full flex items-center justify-center gap-2 font-bold text-xs bg-slate-900 hover:bg-slate-800 dark:bg-primary-600 dark:hover:bg-primary-700 text-white py-2.5 px-4 rounded-xl shadow transition-colors cursor-pointer"
              >
                {calcLoading ? 'Analysing credit tensors...' : 'Simulate Risk Score'}
              </button>
            </div>
          </form>

          {/* Calculator Result */}
          {calcResult && (
            <div className="bg-slate-50/50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 p-4 rounded-2xl animate-slide-in space-y-3">
              <div className="flex justify-between items-center">
                <div>
                  <p className="text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest">Late Payment probability</p>
                  <p className={`text-xl font-black mt-0.5 ${calcResult.level === 'HIGH' ? 'text-rose-600' : 'text-emerald-500'}`}>
                    {calcResult.score}%
                  </p>
                </div>
                <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase ${
                  calcResult.level === 'HIGH'
                    ? 'bg-rose-500/10 text-rose-600 dark:bg-rose-950/30 dark:text-rose-400'
                    : 'bg-emerald-500/10 text-emerald-600 dark:bg-emerald-950/30 dark:text-emerald-400'
                }`}>
                  {calcResult.level === 'HIGH' ? 'Risk Advisory' : 'Terms Approved'}
                </span>
              </div>
              <div className="w-full bg-slate-200 dark:bg-slate-800 h-2 rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full transition-all duration-700 ${calcResult.level === 'HIGH' ? 'bg-rose-500' : 'bg-emerald-500'}`}
                  style={{ width: `${calcResult.score}%` }}
                ></div>
              </div>
              <p className="text-[11px] font-medium text-slate-500 dark:text-slate-400 leading-relaxed">
                {calcResult.message}
              </p>
            </div>
          )}
        </div>

        {/* AI Advisory Panel (Right 2 columns) */}
        <div className="lg:col-span-2 bg-gradient-to-br from-white to-slate-50/30 dark:from-slate-900 dark:to-slate-950 border border-slate-200 dark:border-slate-800 rounded-3xl p-5 md:p-6 shadow-md space-y-4">
          <h4 className="text-sm font-bold text-slate-800 dark:text-white flex items-center gap-2 pb-3 border-b border-slate-100 dark:border-slate-800">
            <ShieldCheck size={18} className="text-emerald-500" /> AI Workspace Advisory
          </h4>

          <div className="space-y-3.5 text-xs font-semibold">
            <div className="flex gap-3 items-start">
              <div className="w-2.5 h-2.5 rounded-full bg-amber-500 mt-1 shrink-0"></div>
              <div>
                <p className="text-slate-800 dark:text-slate-200">Payment Delay Warning</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">Netflix India is flagged with a 65% payment delay probability for the next Net-30 cycle.</p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 mt-1 shrink-0"></div>
              <div>
                <p className="text-slate-800 dark:text-slate-200">High Credit Reliability</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">Sundar Pichai (Google Corp) settled invoices 3 days ahead of due dates on average. Credit limit extensions are safe.</p>
              </div>
            </div>

            <div className="flex gap-3 items-start">
              <div className="w-2.5 h-2.5 rounded-full bg-rose-500 mt-1 shrink-0"></div>
              <div>
                <p className="text-slate-800 dark:text-slate-200">Overdue Risk Alert</p>
                <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-0.5 font-medium">1 invoice with Google Cloud Corp remains overdue. AI recommends sending an automated reminder immediately.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;

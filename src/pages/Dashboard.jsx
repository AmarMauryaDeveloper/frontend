import React, { useEffect, useState } from 'react';
import { useSelector } from 'react-redux';
import api from '../services/api';
import { CardSkeleton, ChartSkeleton } from '../components/LoadingSkeleton';
import { 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  LineChart, 
  Line, 
  CartesianGrid 
} from 'recharts';
import { 
  Users, 
  FolderKanban, 
  Clock, 
  Activity, 
  CheckCircle2, 
  AlertTriangle 
} from 'lucide-react';

const COLORS = ['#e1ebff', '#70a2ff', '#3875f6']; // Light blue, Medium blue, Primary brand blue
const PRIORITY_COLORS = {
  Low: '#10b981',      // Emerald
  Medium: '#f59e0b',   // Amber
  High: '#ef4444',     // Red
  Critical: '#7f1d1d', // Dark red
};

const Dashboard = () => {
  const { user } = useSelector((state) => state.auth);
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchDashboardData = async () => {
      setLoading(true);
      try {
        const response = await api.get('/dashboard');
        setData(response.data.data);
      } catch (err) {
        setError('Failed to load dashboard data');
      } finally {
        setLoading(false);
      }
    };
    fetchDashboardData();
  }, []);

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
          {[...Array(6)].map((_, i) => <CardSkeleton key={i} />)}
        </div>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <ChartSkeleton />
          <ChartSkeleton />
        </div>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl">
        <AlertTriangle className="w-10 h-10 text-red-500 mx-auto mb-4" />
        <p className="text-slate-600 dark:text-slate-400">{error || 'Something went wrong'}</p>
      </div>
    );
  }

  const { metrics, charts } = data;

  const cards = [
    { 
      title: 'Total Users', 
      value: metrics.totalUsers, 
      icon: Users, 
      color: 'text-brand-500 bg-brand-50 dark:bg-brand-950/20',
      show: user?.role === 'Admin'
    },
    { 
      title: 'Total Projects', 
      value: metrics.totalProjects, 
      icon: FolderKanban, 
      color: 'text-blue-500 bg-blue-50 dark:bg-blue-950/20',
      show: true
    },
    { 
      title: 'Pending', 
      value: metrics.pendingProjects, 
      icon: Clock, 
      color: 'text-slate-500 bg-slate-100 dark:bg-slate-800/30',
      show: true
    },
    { 
      title: 'In Progress', 
      value: metrics.inProgressProjects, 
      icon: Activity, 
      color: 'text-amber-500 bg-amber-50 dark:bg-amber-950/20',
      show: true
    },
    { 
      title: 'Completed', 
      value: metrics.completedProjects, 
      icon: CheckCircle2, 
      color: 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/20',
      show: true
    },
    { 
      title: 'Ending Soon', 
      value: metrics.endingSoonProjects, 
      icon: AlertTriangle, 
      color: 'text-red-500 bg-red-50 dark:bg-red-950/20',
      show: true
    },
  ].filter(c => c.show);

  // Status Distribution clean labels
  const pieData = charts.statusDistribution.filter(item => item.value > 0);

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Overview Metric Blocks */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {cards.map((card) => {
          const Icon = card.icon;
          return (
            <div key={card.title} className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl p-5 hover-lift">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  {card.title}
                </span>
                <div className={`p-2 rounded-xl ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>
              <div className="mt-3">
                <h3 className="text-2xl font-bold font-display text-slate-800 dark:text-white">
                  {card.value}
                </h3>
              </div>
            </div>
          );
        })}
      </div>

      {/* Main Charts Area */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Monthly Activity Column Bar Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl p-6 shadow-sm">
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-6">
            Project Operations Trends (Created vs Completed)
          </h4>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={charts.monthlyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="month" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: '1px solid rgba(226, 232, 240, 0.4)',
                    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' 
                  }} 
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Bar dataKey="created" name="Created Projects" fill="#70a2ff" radius={[4, 4, 0, 0]} />
                <Bar dataKey="completed" name="Completed Projects" fill="#3875f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Completion Cumulative Line Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl p-6 shadow-sm">
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-6">
            Monthly Project Completion Velocity
          </h4>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={charts.monthlyStats} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800/40" />
                <XAxis dataKey="month" stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#888888" fontSize={11} tickLine={false} axisLine={false} />
                <Tooltip 
                  contentStyle={{ 
                    borderRadius: '12px', 
                    border: '1px solid rgba(226, 232, 240, 0.4)' 
                  }} 
                />
                <Legend iconType="circle" wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
                <Line 
                  type="monotone" 
                  dataKey="completed" 
                  name="Completion Trends" 
                  stroke="#3875f6" 
                  strokeWidth={3} 
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      {/* Secondary Graphs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Status Distribution Pie Chart */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl p-6 shadow-sm flex flex-col justify-between">
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-4">
            Workflow Status Distribution
          </h4>
          {pieData.length === 0 ? (
            <div className="flex-1 flex items-center justify-center text-slate-400 text-xs py-8">
              No project records to display status.
            </div>
          ) : (
            <div className="h-56 relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={3}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value) => [`${value} Projects`, 'Count']} />
                </PieChart>
              </ResponsiveContainer>
              
              {/* Central Badge Overlay */}
              <div className="absolute text-center">
                <span className="text-2xl font-black text-slate-800 dark:text-white">{metrics.totalProjects}</span>
                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Total</p>
              </div>
            </div>
          )}
          
          <div className="flex justify-center space-x-6 text-[11px] font-medium pt-2 border-t border-slate-50 dark:border-slate-800/30">
            {pieData.map((item, index) => (
              <div key={item.name} className="flex items-center space-x-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }}></span>
                <span className="text-slate-500 dark:text-slate-400">{item.name} ({item.value})</span>
              </div>
            ))}
          </div>
        </div>

        {/* Priority Breakdown Stack Bar */}
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl p-6 shadow-sm flex flex-col justify-between lg:col-span-2">
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300 mb-6">
            Project Volume by Priority Level
          </h4>
          
          <div className="flex-1 flex flex-col justify-center space-y-5">
            {charts.priorityBreakdown.map((item) => {
              const maxVal = Math.max(...charts.priorityBreakdown.map(x => x.value)) || 1;
              const percentage = (item.value / maxVal) * 100;
              const barColor = PRIORITY_COLORS[item.name] || '#3875f6';

              return (
                <div key={item.name} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-semibold">
                    <span className="text-slate-600 dark:text-slate-400">{item.name}</span>
                    <span className="text-slate-800 dark:text-white font-bold">{item.value} Projects</span>
                  </div>
                  <div className="w-full bg-slate-100 dark:bg-slate-950 h-3 rounded-full overflow-hidden">
                    <div 
                      className="h-full rounded-full transition-all duration-500" 
                      style={{ 
                        width: `${item.value > 0 ? percentage : 0}%`,
                        backgroundColor: barColor 
                      }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

      </div>

    </div>
  );
};

export default Dashboard;

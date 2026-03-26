import React, { useState, useEffect, useMemo } from 'react';
import { 
  Activity, Shield, BarChart3, Download, Bell, Github, Linkedin, 
  CheckCircle, Clock, Zap, Cpu, Server, Database, Globe, ArrowRight,
  Menu, X, Sun, Moon, Plus, Filter, Search, Share2, FileText,
  User, Layers, Terminal, Command, Hash, Code, LayoutDashboard
} from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, BarChart, Bar
} from 'recharts';
import { motion, AnimatePresence } from 'framer-motion';
import clsx from 'clsx';
import { twMerge } from 'tailwind-merge';

// --- Types ---
type Page = 'landing' | 'dashboard' | 'activities' | 'resume' | 'verification' | 'auth';
type ActivityType = 'Internship' | 'Course' | 'Hackathon' | 'Project' | 'Certification';
type VerificationStatus = 'verified' | 'pending' | 'rejected';

interface ActivityItem {
  id: string;
  type: ActivityType;
  title: string;
  issuer: string;
  date: string;
  impact: number;
  status: VerificationStatus;
  hash?: string;
}

interface KafkaEvent {
  id: string;
  type: string;
  timestamp: string;
  payload?: any;
}

// --- Mock Data ---
const MOCK_USER = {
  name: 'Arjun Sharma',
  email: 'arjun@demo.com',
  score: 87,
  avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?fit=crop&w=100&h=100'
};

const MOCK_ACTIVITIES: ActivityItem[] = [
  { id: '1', type: 'Internship', title: 'Google Summer of Code 2024', issuer: 'Google', date: 'May - Aug 2024', impact: 9, status: 'verified' },
  { id: '2', type: 'Course', title: 'AWS Solutions Architect', issuer: 'Amazon Web Services', date: 'Mar 2024', impact: 8, status: 'verified' },
  { id: '3', type: 'Hackathon', title: 'Smart India Hackathon 2024 Finalist', issuer: 'Govt of India', date: 'Feb 2024', impact: 8, status: 'verified' },
  { id: '4', type: 'Project', title: 'Resume Ecosystem Node', issuer: 'Self-Initiated', date: 'Jan 2024', impact: 9, status: 'verified' },
  { id: '5', type: 'Internship', title: 'Zidio Development Java Intern', issuer: 'Zidio', date: 'Dec 2023', impact: 7, status: 'verified' },
  { id: '6', type: 'Course', title: 'Advanced React Course', issuer: 'Frontend Masters', date: 'Nov 2023', impact: 6, status: 'pending' },
  { id: '7', type: 'Hackathon', title: 'HackMIT 2023 Top 10', issuer: 'MIT', date: 'Oct 2023', impact: 8, status: 'verified' },
  { id: '8', type: 'Project', title: 'Computer Vision Attendance System', issuer: 'College Project', date: 'Sep 2023', impact: 7, status: 'pending' },
];

const INITIAL_EVENTS: KafkaEvent[] = [
  { id: '1', type: 'resume.version.published', timestamp: '2 min ago' },
  { id: '2', type: 'activity.verified', timestamp: '5 min ago' },
  { id: '3', type: 'activity.created', timestamp: '8 min ago' },
  { id: '4', type: 'activity.verified', timestamp: '12 min ago' },
  { id: '5', type: 'resume.version.published', timestamp: '1 hour ago' },
];

// --- Utilities ---
function cn(...inputs: (string | undefined | null | false)[]) {
  return twMerge(clsx(inputs));
}

// --- Components ---

const Button = ({ children, variant = 'primary', className, ...props }: any) => {
  const variants = {
    primary: 'bg-[#6C63FF] hover:bg-[#5a52d5] text-white',
    secondary: 'bg-[#00D4AA] hover:bg-[#00b38f] text-black font-medium',
    outline: 'border border-[#1E1E2E] hover:border-[#6C63FF] text-[#F0F0FF]',
    ghost: 'hover:bg-[#1E1E2E] text-[#8888AA] hover:text-[#F0F0FF]',
    danger: 'bg-red-500/10 text-red-500 hover:bg-red-500/20'
  };
  
  return (
    <button 
      className={cn(
        'px-4 py-2 rounded-lg transition-all duration-200 flex items-center gap-2',
        variants[variant as keyof typeof variants],
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
};

const Card = ({ children, className }: any) => (
  <div className={cn(
    'bg-[#111118] border border-[#1E1E2E] rounded-xl p-6 hover:border-[#6C63FF]/30 transition-colors',
    className
  )}>
    {children}
  </div>
);

const Badge = ({ children, variant = 'default' }: any) => {
  const variants = {
    default: 'bg-[#1E1E2E] text-[#8888AA]',
    success: 'bg-[#00D4AA]/10 text-[#00D4AA] border border-[#00D4AA]/20',
    warning: 'bg-[#FFB800]/10 text-[#FFB800] border border-[#FFB800]/20',
    purple: 'bg-[#6C63FF]/10 text-[#6C63FF] border border-[#6C63FF]/20',
  };
  return (
    <span className={cn('px-2 py-1 rounded-md text-xs font-mono', variants[variant as keyof typeof variants])}>
      {children}
    </span>
  );
};

// --- Pages ---

const LandingPage = ({ onNavigate }: { onNavigate: (page: Page) => void }) => {
  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F0F0FF] font-sans overflow-hidden">
      {/* Navbar */}
      <nav className="border-b border-[#1E1E2E] sticky top-0 bg-[#0A0A0F]/80 backdrop-blur-md z-50">
        <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-[#6C63FF] rounded-lg flex items-center justify-center">
              <Activity className="w-5 h-5 text-white" />
            </div>
            <span className="font-mono font-bold text-xl tracking-tight">RESUME_ECOSYSTEM</span>
          </div>
          <div className="flex items-center gap-6">
            <a href="#" className="text-[#8888AA] hover:text-[#F0F0FF] transition-colors">Features</a>
            <a href="#" className="text-[#8888AA] hover:text-[#F0F0FF] transition-colors">Architecture</a>
            <Button variant="ghost" onClick={() => onNavigate('auth')}>Log In</Button>
            <Button variant="primary" onClick={() => onNavigate('auth')}>Get Started</Button>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <section className="relative pt-32 pb-20 px-6">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none"></div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <Badge variant="purple" className="mb-6 inline-block">v1.0.0 Public Beta</Badge>
            <h1 className="text-6xl md:text-7xl font-bold mb-6 tracking-tight leading-tight">
              Your Resume. <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6C63FF] to-[#00D4AA]">
                Always Up To Date.
              </span>
            </h1>
            <p className="text-xl text-[#8888AA] mb-10 max-w-2xl mx-auto leading-relaxed">
              Log achievements. We verify and build your resume automatically using event-driven architecture.
            </p>
            <div className="flex items-center justify-center gap-4">
              <Button variant="primary" className="h-12 px-8 text-lg" onClick={() => onNavigate('auth')}>
                Get Started Free <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button variant="outline" className="h-12 px-8 text-lg">
                View Demo <PlayIcon className="w-5 h-5 ml-2" />
              </Button>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Features Grid */}
      <section className="py-24 px-6 bg-[#0A0A0F]">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            { icon: Zap, title: "Event-Driven Updates", desc: "Kafka-powered real-time resume rebuilding." },
            { icon: Shield, title: "Verified Achievements", desc: "Cryptographically verified proof of work." },
            { icon: BarChart3, title: "AI Resume Scoring", desc: "Instant feedback on your resume impact." },
            { icon: Download, title: "PDF Export", desc: "ATS-friendly formats ready in seconds." },
            { icon: Bell, title: "Real-time Notifications", desc: "Stay updated on verification status." },
            { icon: Github, title: "GitHub Import", desc: "Auto-sync your open source contributions." },
          ].map((feature, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              viewport={{ once: true }}
            >
              <Card className="h-full group hover:bg-[#16161e]">
                <div className="w-12 h-12 bg-[#1E1E2E] rounded-lg flex items-center justify-center mb-6 group-hover:scale-110 transition-transform duration-300">
                  <feature.icon className="w-6 h-6 text-[#6C63FF]" />
                </div>
                <h3 className="text-xl font-bold mb-3 font-mono">{feature.title}</h3>
                <p className="text-[#8888AA] leading-relaxed">{feature.desc}</p>
              </Card>
            </motion.div>
          ))}
        </div>
      </section>

      {/* Architecture Diagram (Simplified) */}
      <section className="py-24 px-6 border-t border-[#1E1E2E] bg-[#0A0A0F]/50">
        <div className="max-w-7xl mx-auto text-center">
          <h2 className="text-3xl font-bold mb-16 font-mono">Microservices Architecture</h2>
          <div className="relative h-96 w-full max-w-4xl mx-auto border border-[#1E1E2E] rounded-xl bg-[#0A0A0F] p-8 flex items-center justify-center overflow-hidden">
             {/* Animated flow lines would go here - simplified for single file */}
             <div className="grid grid-cols-4 gap-8 w-full">
                {['Activity Service', 'Kafka Broker', 'Verification Service', 'Resume Builder'].map((s, i) => (
                  <motion.div 
                    key={s}
                    className="flex flex-col items-center gap-4"
                    initial={{ opacity: 0, scale: 0.8 }}
                    whileInView={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.2 }}
                  >
                    <div className="w-16 h-16 rounded-xl bg-[#1E1E2E] border border-[#6C63FF]/30 flex items-center justify-center shadow-[0_0_15px_rgba(108,99,255,0.2)]">
                      <Server className="w-8 h-8 text-[#6C63FF]" />
                    </div>
                    <span className="font-mono text-sm text-[#8888AA]">{s}</span>
                  </motion.div>
                ))}
             </div>
             <div className="absolute inset-x-0 top-1/2 h-1 bg-gradient-to-r from-transparent via-[#6C63FF] to-transparent opacity-20" />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t border-[#1E1E2E] py-12 px-6">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
           <div className="flex items-center gap-2">
            <Activity className="w-5 h-5 text-[#6C63FF]" />
            <span className="font-mono font-bold text-[#F0F0FF]">RESUME_ECOSYSTEM</span>
          </div>
          <div className="flex gap-6 text-[#8888AA] text-sm font-mono">
            <span>Node.js</span>
            <span>TypeScript</span>
            <span>Kafka</span>
            <span>React</span>
          </div>
          <div className="flex gap-4">
            <a href="#" className="p-2 rounded-lg hover:bg-[#1E1E2E] text-[#8888AA] hover:text-[#F0F0FF]"><Github className="w-5 h-5"/></a>
            <a href="#" className="p-2 rounded-lg hover:bg-[#1E1E2E] text-[#8888AA] hover:text-[#F0F0FF]"><Linkedin className="w-5 h-5"/></a>
          </div>
        </div>
      </footer>
    </div>
  );
};

const DashboardLayout = ({ children, page, setPage }: any) => {
  const [events, setEvents] = useState<KafkaEvent[]>(INITIAL_EVENTS);

  // Simulate incoming events
  useEffect(() => {
    const interval = setInterval(() => {
      const newEvent = {
        id: Date.now().toString(),
        type: Math.random() > 0.5 ? 'activity.verified' : 'resume.updated',
        timestamp: 'Just now'
      };
      setEvents(prev => [newEvent, ...prev.slice(0, 4)]);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'activities', label: 'Activities', icon: Layers },
    { id: 'verification', label: 'Verification', icon: Shield },
    { id: 'resume', label: 'Resume', icon: FileText },
  ];

  return (
    <div className="min-h-screen bg-[#0A0A0F] text-[#F0F0FF] font-sans flex overflow-hidden">
      {/* Sidebar */}
      <aside className="w-64 border-r border-[#1E1E2E] flex flex-col bg-[#0A0A0F]">
        <div className="p-6 border-b border-[#1E1E2E] flex items-center gap-3">
          <div className="w-8 h-8 bg-[#6C63FF] rounded-lg flex items-center justify-center">
            <Activity className="w-5 h-5 text-white" />
          </div>
          <span className="font-mono font-bold tracking-tight">RESUME_ECO</span>
        </div>
        
        <div className="flex-1 p-4 space-y-1">
          {navItems.map((item) => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={cn(
                "w-full flex items-center gap-3 px-4 py-3 rounded-lg text-sm font-medium transition-colors",
                page === item.id 
                  ? "bg-[#1E1E2E] text-[#F0F0FF] border border-[#6C63FF]/20" 
                  : "text-[#8888AA] hover:bg-[#1E1E2E]/50 hover:text-[#F0F0FF]"
              )}
            >
              <item.icon className={cn("w-5 h-5", page === item.id ? "text-[#6C63FF]" : "text-[#8888AA]")} />
              {item.label}
            </button>
          ))}
        </div>

        <div className="p-4 border-t border-[#1E1E2E]">
          <div className="flex items-center gap-3 p-3 rounded-lg bg-[#1E1E2E]/50 border border-[#1E1E2E]">
            <img src={MOCK_USER.avatar} alt="User" className="w-10 h-10 rounded-full" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium truncate">{MOCK_USER.name}</p>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#8888AA]">Score:</span>
                <span className="text-xs font-mono text-[#00D4AA]">{MOCK_USER.score}</span>
              </div>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto relative">
        <header className="h-16 border-b border-[#1E1E2E] flex items-center justify-between px-8 sticky top-0 bg-[#0A0A0F]/80 backdrop-blur-md z-40">
           <h1 className="text-xl font-bold font-mono capitalize">{page}</h1>
           <div className="flex items-center gap-4">
             <Button variant="ghost" className="p-2"><Bell className="w-5 h-5" /></Button>
             <Button variant="ghost" className="p-2"><Sun className="w-5 h-5" /></Button>
           </div>
        </header>
        <div className="p-8 pb-32">
          {children}
        </div>
      </main>

      {/* Right Panel - Kafka Stream */}
      <aside className="w-80 border-l border-[#1E1E2E] bg-[#0A0A0F] hidden xl:flex flex-col">
        <div className="p-6 border-b border-[#1E1E2E]">
          <h3 className="font-mono text-sm font-bold text-[#8888AA] uppercase tracking-wider flex items-center gap-2">
            <Terminal className="w-4 h-4" /> Kafka Event Stream
          </h3>
        </div>
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          <AnimatePresence initial={false}>
            {events.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="bg-[#111118] border border-[#1E1E2E] rounded-lg p-3 group hover:border-[#00D4AA]/30 transition-colors"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-mono text-[#00D4AA]">{event.type}</span>
                  <span className="text-[10px] text-[#8888AA]">{event.timestamp}</span>
                </div>
                <div className="h-1 w-full bg-[#1E1E2E] rounded-full overflow-hidden">
                  <div className="h-full w-1/3 bg-[#00D4AA]/50 rounded-full animate-pulse" />
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      </aside>
    </div>
  );
};

const DashboardPage = () => {
  return (
    <div className="space-y-8">
      {/* Top Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {[
          { label: 'Total Activities', value: '12', icon: Layers, color: '#6C63FF' },
          { label: 'Verified', value: '8', icon: Shield, color: '#00D4AA' },
          { label: 'Resume Score', value: '87', icon: BarChart3, color: '#FFB800' },
          { label: 'Pending', value: '2', icon: Clock, color: '#FF4466' },
        ].map((stat, i) => (
          <Card key={i} className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl flex items-center justify-center bg-[#1E1E2E]" style={{ color: stat.color }}>
              <stat.icon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[#8888AA] text-sm font-medium">{stat.label}</p>
              <p className="text-2xl font-bold font-mono">{stat.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Recent Activity */}
        <div className="lg:col-span-2 space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold font-mono">Recent Activity</h2>
            <Button variant="outline" className="text-sm">View All</Button>
          </div>
          <div className="space-y-4">
            {MOCK_ACTIVITIES.slice(0, 4).map((activity) => (
              <Card key={activity.id} className="flex items-center justify-between p-4 group hover:bg-[#16161e]">
                <div className="flex items-center gap-4">
                  <div className={cn(
                    "w-10 h-10 rounded-lg flex items-center justify-center",
                    activity.type === 'Internship' ? "bg-blue-500/10 text-blue-500" :
                    activity.type === 'Course' ? "bg-purple-500/10 text-purple-500" :
                    "bg-orange-500/10 text-orange-500"
                  )}>
                    <Activity className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-[#F0F0FF]">{activity.title}</h4>
                    <p className="text-sm text-[#8888AA]">{activity.issuer} • {activity.date}</p>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <Badge variant={activity.status === 'verified' ? 'success' : 'warning'}>
                    {activity.status}
                  </Badge>
                  <span className="font-mono text-sm text-[#8888AA] hidden md:block">Score: {activity.impact}/10</span>
                </div>
              </Card>
            ))}
          </div>
        </div>

        {/* Score Card */}
        <Card className="flex flex-col items-center justify-center text-center p-8">
          <div className="relative w-48 h-48 mb-6 flex items-center justify-center">
             {/* Simple SVG Circle for Score */}
             <svg className="w-full h-full transform -rotate-90">
               <circle cx="96" cy="96" r="88" stroke="#1E1E2E" strokeWidth="12" fill="none" />
               <circle cx="96" cy="96" r="88" stroke="#6C63FF" strokeWidth="12" fill="none" strokeDasharray="552" strokeDashoffset={552 - (552 * 87) / 100} className="transition-all duration-1000 ease-out" />
             </svg>
             <div className="absolute inset-0 flex flex-col items-center justify-center">
               <span className="text-5xl font-bold font-mono">87</span>
               <span className="text-sm text-[#8888AA] mt-2">OUT OF 100</span>
             </div>
          </div>
          <h3 className="text-xl font-bold mb-2">Excellent!</h3>
          <p className="text-[#8888AA] mb-6">Your resume is in the top 15% of candidates.</p>
          <Button variant="primary" className="w-full justify-center">Rebuild Resume</Button>
        </Card>
      </div>
    </div>
  );
};

const ActivitiesPage = () => {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex gap-2 overflow-x-auto pb-2">
          {['All', 'Internship', 'Course', 'Hackathon', 'Project'].map(filter => (
            <button key={filter} className="px-4 py-2 rounded-full border border-[#1E1E2E] bg-[#111118] text-sm hover:border-[#6C63FF] transition-colors">
              {filter}
            </button>
          ))}
        </div>
        <Button variant="primary"><Plus className="w-4 h-4 mr-2" /> Add Activity</Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {MOCK_ACTIVITIES.map((activity) => (
          <Card key={activity.id} className="group hover:-translate-y-1 transition-transform duration-300">
            <div className="flex justify-between items-start mb-4">
              <Badge variant="default">{activity.type}</Badge>
              <div className={cn(
                "w-2 h-2 rounded-full",
                activity.status === 'verified' ? "bg-[#00D4AA]" : "bg-[#FFB800]"
              )} />
            </div>
            <h3 className="text-lg font-bold mb-2 line-clamp-2 min-h-[3.5rem]">{activity.title}</h3>
            <p className="text-[#8888AA] text-sm mb-4">{activity.issuer}</p>
            
            <div className="border-t border-[#1E1E2E] pt-4 mt-4 flex items-center justify-between text-sm">
              <span className="text-[#8888AA] font-mono">{activity.date}</span>
              <div className="flex items-center gap-1 text-[#F0F0FF]">
                 <Zap className="w-3 h-3 text-[#FFB800]" />
                 <span className="font-mono font-bold">{activity.impact}/10</span>
              </div>
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
};

const ResumePage = () => {
  return (
    <div className="flex h-[calc(100vh-8rem)] gap-6">
      <div className="w-80 flex flex-col gap-4">
        <Card className="flex-1 overflow-y-auto">
          <h3 className="font-bold mb-4">Version History</h3>
          <div className="space-y-4">
            {[1, 2, 3].map((v) => (
              <div key={v} className="p-3 rounded-lg border border-[#1E1E2E] hover:bg-[#1E1E2E] cursor-pointer transition-colors">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-mono font-bold">v1.0.{v}</span>
                  <Badge variant="success">Published</Badge>
                </div>
                <p className="text-xs text-[#8888AA]">Updated 2 days ago</p>
              </div>
            ))}
          </div>
        </Card>
        <div className="grid grid-cols-2 gap-4">
          <Button variant="outline" className="justify-center"><Share2 className="w-4 h-4 mr-2" /> Share</Button>
          <Button variant="primary" className="justify-center"><Download className="w-4 h-4 mr-2" /> PDF</Button>
        </div>
      </div>

      <Card className="flex-1 bg-white text-black overflow-y-auto p-12 font-serif relative">
         <div className="absolute top-4 right-4 print:hidden">
            <Badge variant="success" className="bg-green-100 text-green-800 border-green-200">Verified</Badge>
         </div>
         <div className="text-center mb-12">
            <h1 className="text-4xl font-bold mb-2">{MOCK_USER.name}</h1>
            <p className="text-gray-600">Software Engineer • {MOCK_USER.email} • +91 98765 43210</p>
         </div>

         <div className="space-y-8">
            <section>
              <h2 className="text-xl font-bold border-b-2 border-black mb-4 uppercase tracking-wider">Experience</h2>
              {MOCK_ACTIVITIES.filter(a => a.type === 'Internship').map(a => (
                <div key={a.id} className="mb-4">
                   <div className="flex justify-between font-bold">
                      <h3>{a.title}</h3>
                      <span>{a.date}</span>
                   </div>
                   <p className="italic text-gray-700">{a.issuer}</p>
                   <ul className="list-disc ml-5 mt-2 text-sm text-gray-700">
                      <li>Implemented core features using React and Node.js.</li>
                      <li>Optimized database queries reducing load times by 40%.</li>
                   </ul>
                </div>
              ))}
            </section>
            
             <section>
              <h2 className="text-xl font-bold border-b-2 border-black mb-4 uppercase tracking-wider">Projects</h2>
              {MOCK_ACTIVITIES.filter(a => a.type === 'Project').map(a => (
                <div key={a.id} className="mb-4">
                   <div className="flex justify-between font-bold">
                      <h3>{a.title}</h3>
                      <span>{a.date}</span>
                   </div>
                   <p className="text-sm text-gray-700 mt-1">Full-stack application built with microservices architecture.</p>
                </div>
              ))}
            </section>
         </div>
      </Card>
    </div>
  );
};

const AuthPage = ({ onNavigate }: any) => {
  return (
    <div className="min-h-screen flex bg-[#0A0A0F]">
      <div className="hidden lg:flex flex-1 bg-[#111118] items-center justify-center p-12 relative overflow-hidden">
        <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-10"></div>
        <div className="relative z-10 max-w-lg">
           <h2 className="text-4xl font-bold text-[#F0F0FF] mb-6">Join the Future of Work</h2>
           <p className="text-[#8888AA] text-lg leading-relaxed">
             Stop manually updating your resume. Let your code commits and course certificates do the talking.
           </p>
        </div>
      </div>
      <div className="flex-1 flex items-center justify-center p-8">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-[#F0F0FF]">Welcome Back</h2>
            <p className="mt-2 text-[#8888AA]">Sign in to your account</p>
          </div>
          <div className="space-y-4">
             <Button variant="outline" className="w-full justify-center h-12 text-base">
               <Github className="w-5 h-5 mr-3" /> Continue with GitHub
             </Button>
             <Button variant="outline" className="w-full justify-center h-12 text-base">
               <Linkedin className="w-5 h-5 mr-3" /> Continue with LinkedIn
             </Button>
          </div>
          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center"><div className="w-full border-t border-[#1E1E2E]"></div></div>
            <div className="relative flex justify-center text-sm"><span className="px-2 bg-[#0A0A0F] text-[#8888AA]">Or continue with email</span></div>
          </div>
          <form className="space-y-4" onSubmit={(e) => { e.preventDefault(); onNavigate('dashboard'); }}>
            <div>
               <label className="block text-sm font-medium text-[#8888AA] mb-1">Email</label>
               <input type="email" className="w-full bg-[#111118] border border-[#1E1E2E] rounded-lg px-4 py-3 text-[#F0F0FF] focus:outline-none focus:border-[#6C63FF]" placeholder="you@example.com" />
            </div>
             <div>
               <label className="block text-sm font-medium text-[#8888AA] mb-1">Password</label>
               <input type="password" className="w-full bg-[#111118] border border-[#1E1E2E] rounded-lg px-4 py-3 text-[#F0F0FF] focus:outline-none focus:border-[#6C63FF]" placeholder="••••••••" />
            </div>
            <Button variant="primary" className="w-full justify-center h-12 text-base">Sign In</Button>
          </form>
        </div>
      </div>
    </div>
  );
};

// --- Main App Component ---
function PlayIcon(props: any) {
  return (
    <svg {...props} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polygon points="5 3 19 12 5 21 5 3"></polygon>
    </svg>
  );
}

export default function ResumeEcosystemApp() {
  const [currentPage, setCurrentPage] = useState<Page>('landing');

  const renderPage = () => {
    switch (currentPage) {
      case 'landing': return <LandingPage onNavigate={setCurrentPage} />;
      case 'auth': return <AuthPage onNavigate={setCurrentPage} />;
      case 'dashboard': return <DashboardLayout page="dashboard" setPage={setCurrentPage}><DashboardPage /></DashboardLayout>;
      case 'activities': return <DashboardLayout page="activities" setPage={setCurrentPage}><ActivitiesPage /></DashboardLayout>;
      case 'resume': return <DashboardLayout page="resume" setPage={setCurrentPage}><ResumePage /></DashboardLayout>;
      case 'verification': return <DashboardLayout page="verification" setPage={setCurrentPage}><div className="text-center py-20 text-[#8888AA]">Verification Queue Empty</div></DashboardLayout>;
      default: return <LandingPage onNavigate={setCurrentPage} />;
    }
  };

  return (
    <div className="bg-[#0A0A0F] min-h-screen text-white">
      {renderPage()}
    </div>
  );
}

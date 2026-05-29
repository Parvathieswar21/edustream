import React from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  GraduationCap, 
  CheckCircle2, 
  Users, 
  ShieldCheck, 
  Zap, 
  Globe,
  ArrowRight,
  BookOpen,
  LayoutDashboard,
  ClipboardCheck
} from 'lucide-react';

const FeatureCard = ({ icon: Icon, title, description, delay }: any) => (
  <motion.div 
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay }}
    viewport={{ once: true }}
    className="bg-white p-8 rounded-3xl border border-slate-100 shadow-sm hover:shadow-xl transition-all hover:-translate-y-1"
  >
    <div className="bg-indigo-50 w-14 h-14 rounded-2xl flex items-center justify-center text-indigo-600 mb-6">
      <Icon className="w-7 h-7" />
    </div>
    <h3 className="text-xl font-bold text-slate-900 mb-3">{title}</h3>
    <p className="text-slate-500 leading-relaxed">{description}</p>
  </motion.div>
);

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-white font-sans selection:bg-indigo-100 selection:text-indigo-900">
      {/* Navigation */}
      <nav className="fixed top-0 w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3 text-indigo-600">
            <div className="bg-indigo-600 p-2.5 rounded-xl text-white shadow-lg shadow-indigo-100">
              <GraduationCap className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900">EduStream</span>
          </div>
          <div className="hidden md:flex items-center space-x-8 text-sm font-bold text-slate-600">
            <a href="#features" className="hover:text-indigo-600 transition-colors">Features</a>
            <a href="#solutions" className="hover:text-indigo-600 transition-colors">Solutions</a>
            <a href="#about" className="hover:text-indigo-600 transition-colors">About</a>
          </div>
          <div className="flex items-center space-x-4">
            <Link to="/login" className="text-sm font-bold text-slate-900 hover:text-indigo-600 transition-colors">Sign In</Link>
            <Link to="/login" className="bg-indigo-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700 transition-all">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 overflow-hidden">
        <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
          <motion.div 
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8 }}
            className="space-y-10"
          >
            <div className="inline-flex items-center space-x-2 bg-indigo-50 px-4 py-2 rounded-full text-indigo-600 text-xs font-black uppercase tracking-widest">
              <Zap className="w-4 h-4" />
              <span>Next-Gen Education OS</span>
            </div>
            <h1 className="text-7xl lg:text-8xl font-black text-slate-900 leading-[0.9] tracking-tighter">
              The Future of <span className="text-indigo-600">Learning</span> Management.
            </h1>
            <p className="text-xl text-slate-500 leading-relaxed max-w-lg font-medium">
              EduStream is the operating system for modern schools. Empowering teachers, engaging students, and simplifying administration with a single, unified platform.
            </p>
            <div className="flex flex-col sm:flex-row gap-5">
              <Link to="/login" className="bg-indigo-600 text-white px-10 py-5 rounded-2xl font-black text-lg shadow-2xl shadow-indigo-200 hover:bg-indigo-700 transition-all flex items-center justify-center space-x-3 group">
                <span>Start Free Trial</span>
                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
              </Link>
              <button className="bg-white text-slate-900 border-2 border-slate-100 px-10 py-5 rounded-2xl font-black text-lg hover:border-indigo-100 hover:bg-slate-50 transition-all">
                Watch Demo
              </button>
            </div>
            <div className="flex items-center space-x-8 pt-6">
              <div className="flex -space-x-4">
                {[1, 2, 3, 4].map(i => (
                  <img 
                    key={i}
                    src={`https://i.pravatar.cc/150?u=${i + 20}`} 
                    className="w-12 h-12 rounded-full border-4 border-white object-cover shadow-sm" 
                    alt=""
                  />
                ))}
              </div>
              <div className="space-y-1">
                <div className="flex text-amber-400">
                  {[1, 2, 3, 4, 5].map(i => <Zap key={i} className="w-3 h-3 fill-current" />)}
                </div>
                <p className="text-xs text-slate-500 font-bold uppercase tracking-widest">
                  Trusted by <span className="text-slate-900">2,400+</span> Educators
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8 }}
            className="relative"
          >
            <div className="absolute -inset-10 bg-indigo-600/10 rounded-[60px] blur-3xl" />
            <div className="relative">
              <div className="bg-white rounded-[40px] shadow-2xl border border-slate-100 overflow-hidden transform rotate-2 hover:rotate-0 transition-transform duration-700">
                <img 
                  src="https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&w=1200&q=80" 
                  className="w-full h-[600px] object-cover" 
                  alt="Students in classroom"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-slate-900/60 via-transparent to-transparent" />
                <div className="absolute bottom-10 left-10 text-white">
                  <p className="text-sm font-black uppercase tracking-widest opacity-80 mb-2">Success Story</p>
                  <h4 className="text-2xl font-bold">"EduStream changed how we teach."</h4>
                  <p className="text-sm opacity-60">— St. Mary's Academy</p>
                </div>
              </div>

              {/* Floating UI Elements */}
              <motion.div 
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 5, repeat: Infinity }}
                className="absolute -top-10 -right-10 bg-white p-6 rounded-3xl shadow-2xl border border-slate-100 flex items-center space-x-4 z-10"
              >
                <div className="bg-emerald-500 p-3 rounded-2xl text-white shadow-lg shadow-emerald-100">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Daily Attendance</p>
                  <p className="text-lg font-black text-slate-900">99.2% Present</p>
                </div>
              </motion.div>

              <motion.div 
                animate={{ y: [0, 15, 0] }}
                transition={{ duration: 6, repeat: Infinity }}
                className="absolute -bottom-10 -left-10 bg-white p-6 rounded-3xl shadow-2xl border border-slate-100 flex items-center space-x-4 z-10"
              >
                <div className="bg-indigo-600 p-3 rounded-2xl text-white shadow-lg shadow-indigo-100">
                  <LayoutDashboard className="w-6 h-6" />
                </div>
                <div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Classes</p>
                  <p className="text-lg font-black text-slate-900">24 Sessions</p>
                </div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-20 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { label: 'Active Students', value: '50k+' },
            { label: 'Partner Schools', value: '1.2k' },
            { label: 'Avg. Grade Boost', value: '15%' },
            { label: 'Support Score', value: '4.9/5' },
          ].map((stat, i) => (
            <div key={i}>
              <p className="text-4xl font-black text-indigo-600 mb-2">{stat.value}</p>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{stat.label}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-32 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-20 space-y-4">
            <h2 className="text-sm font-black text-indigo-600 uppercase tracking-[0.2em]">Features</h2>
            <h3 className="text-4xl lg:text-5xl font-black text-slate-900 leading-tight">
              Everything you need to run a modern campus.
            </h3>
            <p className="text-lg text-slate-500">
              Stop juggling multiple tools. EduStream brings your entire institution into one unified ecosystem.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <FeatureCard 
              icon={LayoutDashboard}
              title="Smart Dashboards"
              description="Real-time insights for admins, teachers, and students. Track attendance, grades, and fees at a glance."
              delay={0.1}
            />
            <FeatureCard 
              icon={ClipboardCheck}
              title="Attendance Tracking"
              description="Automated attendance marking with instant notifications for parents and detailed trend reports."
              delay={0.2}
            />
            <FeatureCard 
              icon={ShieldCheck}
              title="Secure Grading"
              description="End-to-end encrypted grading system with automated report card generation and performance analytics."
              delay={0.3}
            />
            <FeatureCard 
              icon={Users}
              title="Faculty Management"
              description="Manage teacher assignments, schedules, and professional development in one centralized hub."
              delay={0.4}
            />
            <FeatureCard 
              icon={Globe}
              title="Parent Portal"
              description="Keep parents in the loop with real-time updates on their child's progress, fees, and school events."
              delay={0.5}
            />
            <FeatureCard 
              icon={Zap}
              title="Fee Automation"
              description="Automated invoicing, online payment collection, and instant receipt generation for all school fees."
              delay={0.6}
            />
          </div>
        </div>
      </section>

      {/* Solutions Section */}
      <section id="solutions" className="py-32 px-6 bg-slate-900 text-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-20 items-center">
            <div className="relative">
              <div className="grid grid-cols-2 gap-4">
                <motion.div 
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5 }}
                  viewport={{ once: true }}
                  className="space-y-4"
                >
                  <img src="https://images.unsplash.com/photo-1577896851231-70ef18881754?auto=format&fit=crop&w=400&q=80" className="rounded-3xl h-64 w-full object-cover" alt="Student" referrerPolicy="no-referrer" />
                  <img src="https://images.unsplash.com/photo-1588072432836-e10032774350?auto=format&fit=crop&w=400&q=80" className="rounded-3xl h-48 w-full object-cover" alt="Student" referrerPolicy="no-referrer" />
                </motion.div>
                <motion.div 
                  initial={{ opacity: 0, y: -20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  viewport={{ once: true }}
                  className="space-y-4 pt-12"
                >
                  <img src="https://images.unsplash.com/photo-1509062522246-3755977927d7?auto=format&fit=crop&w=400&q=80" className="rounded-3xl h-48 w-full object-cover" alt="Student" referrerPolicy="no-referrer" />
                  <img src="https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=400&q=80" className="rounded-3xl h-64 w-full object-cover" alt="Student" referrerPolicy="no-referrer" />
                </motion.div>
              </div>
              <div className="absolute -inset-10 bg-indigo-500/20 blur-3xl -z-10" />
            </div>
            
            <div className="space-y-8">
              <h2 className="text-sm font-black text-indigo-400 uppercase tracking-[0.2em]">Solutions</h2>
              <h3 className="text-5xl lg:text-6xl font-black leading-tight">
                Built for every <span className="text-indigo-400">stakeholder</span> in the journey.
              </h3>
              <div className="space-y-6">
                {[
                  { title: 'For Administrators', desc: 'Centralize control, automate billing, and gain deep insights into institutional health.' },
                  { title: 'For Teachers', desc: 'Reduce paperwork, manage classrooms effortlessly, and focus on what matters: teaching.' },
                  { title: 'For Students', desc: 'Access resources, track progress, and stay connected with the campus community.' },
                ].map((item, i) => (
                  <div key={i} className="flex space-x-4 group">
                    <div className="bg-white/10 p-3 rounded-2xl text-indigo-400 group-hover:bg-indigo-400 group-hover:text-white transition-all">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold mb-1">{item.title}</h4>
                      <p className="text-slate-400 leading-relaxed">{item.desc}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6">
        <div className="max-w-7xl mx-auto bg-indigo-600 rounded-[60px] p-12 lg:p-24 text-center text-white relative overflow-hidden shadow-2xl shadow-indigo-200">
          <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full -ml-48 -mt-48 blur-3xl" />
          <div className="absolute bottom-0 right-0 w-96 h-96 bg-indigo-400/20 rounded-full -mr-48 -mb-48 blur-3xl" />
          
          <div className="relative space-y-10">
            <h2 className="text-5xl lg:text-7xl font-black leading-tight tracking-tighter">
              Ready to modernize <br /> your institution?
            </h2>
            <p className="text-xl text-indigo-100 max-w-2xl mx-auto font-medium">
              Join 2,400+ schools that have already transformed their administrative workflow with EduStream.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center pt-6">
              <Link to="/login" className="bg-white text-indigo-600 px-12 py-6 rounded-2xl font-black text-xl hover:bg-indigo-50 transition-all shadow-2xl hover:scale-105 active:scale-95">
                Get Started Now
              </Link>
              <button className="bg-indigo-500 text-white border-2 border-indigo-400 px-12 py-6 rounded-2xl font-black text-xl hover:bg-indigo-400 transition-all">
                Book a Demo
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-20 border-t border-slate-100">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-4 gap-12">
          <div className="space-y-6">
            <div className="flex items-center space-x-3 text-indigo-600">
              <div className="bg-indigo-600 p-2 rounded-xl text-white">
                <BookOpen className="w-6 h-6" />
              </div>
              <span className="text-2xl font-black tracking-tight">EduStream</span>
            </div>
            <p className="text-slate-500 text-sm leading-relaxed">
              Building the infrastructure for the next generation of global education.
            </p>
          </div>
          <div>
            <h4 className="font-black text-slate-900 mb-6 uppercase tracking-widest text-xs">Product</h4>
            <ul className="space-y-4 text-sm text-slate-500 font-bold">
              <li><a href="#" className="hover:text-indigo-600">Features</a></li>
              <li><a href="#" className="hover:text-indigo-600">Pricing</a></li>
              <li><a href="#" className="hover:text-indigo-600">Solutions</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black text-slate-900 mb-6 uppercase tracking-widest text-xs">Company</h4>
            <ul className="space-y-4 text-sm text-slate-500 font-bold">
              <li><a href="#" className="hover:text-indigo-600">About Us</a></li>
              <li><a href="#" className="hover:text-indigo-600">Careers</a></li>
              <li><a href="#" className="hover:text-indigo-600">Privacy</a></li>
            </ul>
          </div>
          <div>
            <h4 className="font-black text-slate-900 mb-6 uppercase tracking-widest text-xs">Newsletter</h4>
            <div className="flex space-x-2">
              <input 
                type="email" 
                placeholder="Email" 
                className="bg-slate-50 border border-slate-200 rounded-xl px-4 py-2 text-sm outline-none focus:ring-2 focus:ring-indigo-500 w-full"
              />
              <button className="bg-indigo-600 text-white p-2 rounded-xl">
                <ArrowRight className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 pt-20 text-center text-slate-400 text-xs font-bold">
          © 2026 EduStream Technologies Inc. All rights reserved.
        </div>
      </footer>
    </div>
  );
}

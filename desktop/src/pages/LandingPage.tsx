import React from 'react';
import { Link } from 'react-router-dom';
import { 
  Activity, Shield, Clock, Users, Database, 
  BarChart, ArrowRight, CheckCircle2, Stethoscope,
  ChevronRight
} from 'lucide-react';

const LandingPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#6899B0]/20">
      {/* Navigation */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-slate-100 transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 bg-[#6899B0] rounded-xl flex items-center justify-center shadow-lg shadow-[#6899B0]/20">
              <Stethoscope className="text-white" size={24} />
            </div>
            <span className="text-2xl font-black tracking-tight text-slate-900">
              Health<span className="text-[#6899B0]">Sync</span>
            </span>
          </div>
          <div className="hidden md:flex items-center gap-8 font-medium text-slate-600">
            <a href="#features" className="hover:text-[#6899B0] transition-colors">Features</a>
            <a href="#pricing" className="hover:text-[#6899B0] transition-colors">Pricing</a>
            <a href="#testimonials" className="hover:text-[#6899B0] transition-colors">Testimonials</a>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hidden md:block font-bold text-slate-600 hover:text-[#6899B0] transition-colors">
              Log in
            </Link>
            <Link to="/login" className="bg-[#6899B0] text-white px-6 py-2.5 rounded-full font-bold hover:bg-[#5D8799] transition-all shadow-md shadow-[#6899B0]/20 flex items-center gap-2">
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-40 pb-20 px-6 relative overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[500px] opacity-30 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-[#6899B0]/20 to-blue-400/20 rounded-full blur-3xl"></div>
        </div>
        
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-slate-50 border border-slate-200 text-sm font-bold text-slate-600 mb-8 shadow-sm">
            <span className="flex h-2 w-2 rounded-full bg-[#6899B0] animate-pulse"></span>
            New: Smart Inventory Management Released
          </div>
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-slate-900 mb-8 leading-tight">
            The intelligent OS for <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#6899B0] to-blue-600">
              modern clinics.
            </span>
          </h1>
          <p className="text-lg md:text-xl text-slate-500 mb-10 max-w-2xl mx-auto leading-relaxed">
            Streamline appointments, automate billing, manage inventory, and deliver exceptional patient care with our all-in-one platform.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link to="/login" className="w-full sm:w-auto bg-[#6899B0] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-[#5D8799] hover:scale-105 transition-all shadow-xl shadow-[#6899B0]/20 flex items-center justify-center gap-2">
              Start Free Trial <ArrowRight size={20} />
            </Link>
            <a href="#features" className="w-full sm:w-auto bg-white text-slate-700 px-8 py-4 rounded-full font-bold text-lg border border-slate-200 hover:border-slate-300 hover:bg-slate-50 transition-all flex items-center justify-center">
              View Features
            </a>
          </div>
        </div>

        {/* Dashboard Preview Image (Placeholder) */}
        <div className="max-w-6xl mx-auto mt-20 relative">
          <div className="absolute -inset-1 bg-gradient-to-b from-[#6899B0]/20 to-transparent rounded-2xl blur"></div>
          <div className="relative bg-white border border-slate-200 rounded-2xl shadow-2xl overflow-hidden aspect-video flex items-center justify-center bg-slate-50">
            <div className="text-center">
              <BarChart size={64} className="mx-auto text-slate-300 mb-4" />
              <p className="text-slate-500 font-medium">Dashboard Interface Preview</p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Everything you need to run your clinic</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">Powerful features designed to reduce admin work and let you focus on what matters most: your patients.</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <Clock />, title: 'Smart Scheduling', desc: 'Effortlessly manage appointments, block times, and send automated SMS/Email reminders to reduce no-shows.' },
              { icon: <Activity />, title: 'EMR & Treatments', desc: 'Detailed patient histories, clinical notes, and treatment tracking with pre-built standardized templates.' },
              { icon: <Shield />, title: 'Role-Based Access', desc: 'Secure your data with granular permissions for Doctors, Receptionists, and Admins across multiple clinics.' },
              { icon: <Database />, title: 'Inventory Control', desc: 'Real-time stock tracking with auto-deductions during treatments and low-stock alerts.' },
              { icon: <BarChart />, title: 'Advanced Billing', desc: 'Generate professional GST-compliant invoices, track partial payments, and monitor clinic expenses easily.' },
              { icon: <Users />, title: 'Staff Management', desc: 'Track employee attendance, manage doctor schedules, and handle leave approvals from a single dashboard.' },
            ].map((feature, i) => (
              <div key={i} className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow">
                <div className="w-12 h-12 bg-blue-50 text-[#6899B0] rounded-xl flex items-center justify-center mb-6">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-bold text-slate-900 mb-3">{feature.title}</h3>
                <p className="text-slate-500 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">Simple, transparent pricing</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">Start with what you need, upgrade when you grow. No hidden fees or setup costs.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Starter</h3>
              <p className="text-slate-500 text-sm mb-6">Perfect for solo practitioners.</p>
              <div className="mb-8">
                <span className="text-4xl font-black text-slate-900">₹1,999</span>
                <span className="text-slate-500 font-medium">/month</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {['1 Doctor Account', 'Unlimited Patients', 'Basic Appointments', 'Standard Invoicing', 'Email Support'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-600 font-medium">
                    <CheckCircle2 size={18} className="text-green-500" /> {item}
                  </li>
                ))}
              </ul>
              <Link to="/login" className="w-full block text-center bg-slate-100 text-slate-900 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors">
                Start Free Trial
              </Link>
            </div>

            {/* Pro */}
            <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl shadow-slate-900/20 flex flex-col relative transform md:-translate-y-4">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-[#6899B0] to-blue-500 text-white px-4 py-1 rounded-full text-xs font-bold tracking-wider uppercase">
                Most Popular
              </div>
              <h3 className="text-xl font-bold text-white mb-2">Professional</h3>
              <p className="text-slate-400 text-sm mb-6">For growing clinics with staff.</p>
              <div className="mb-8">
                <span className="text-4xl font-black text-white">₹3,499</span>
                <span className="text-slate-400 font-medium">/month</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {['Up to 5 Staff Accounts', 'Advanced Inventory Management', 'Staff Attendance & Leaves', 'Expense Tracking', 'Advanced Analytics', 'Priority Support'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-300 font-medium">
                    <CheckCircle2 size={18} className="text-[#6899B0]" /> {item}
                  </li>
                ))}
              </ul>
              <Link to="/login" className="w-full block text-center bg-[#6899B0] text-white font-bold py-3 rounded-xl hover:bg-[#5D8799] transition-colors shadow-lg shadow-[#6899B0]/20">
                Start Free Trial
              </Link>
            </div>

            {/* Enterprise */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col">
              <h3 className="text-xl font-bold text-slate-900 mb-2">Enterprise</h3>
              <p className="text-slate-500 text-sm mb-6">For multi-location clinic chains.</p>
              <div className="mb-8">
                <span className="text-4xl font-black text-slate-900">₹6,999</span>
                <span className="text-slate-500 font-medium">/month</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {['Unlimited Staff Accounts', 'Multi-Clinic Management', 'Advanced RBAC Roles', 'Custom Integrations', 'Dedicated Account Manager', '24/7 Phone Support'].map((item, i) => (
                  <li key={i} className="flex items-center gap-3 text-slate-600 font-medium">
                    <CheckCircle2 size={18} className="text-green-500" /> {item}
                  </li>
                ))}
              </ul>
              <Link to="/login" className="w-full block text-center bg-slate-100 text-slate-900 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors">
                Contact Sales
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-gradient-to-br from-slate-900 to-slate-800 text-white border-t border-slate-800">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-black mb-6">Ready to digitize your clinic?</h2>
          <p className="text-xl text-slate-400 mb-10">Join thousands of doctors who have modernized their practice, reduced administrative overhead, and improved patient care.</p>
          <Link to="/login" className="inline-flex items-center gap-2 bg-[#6899B0] text-white px-8 py-4 rounded-full font-bold text-lg hover:bg-[#5D8799] hover:scale-105 transition-all shadow-xl shadow-[#6899B0]/20">
            Create Your Free Account <ChevronRight size={20} />
          </Link>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-12 px-6 border-t border-slate-800 text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <Stethoscope className="text-[#6899B0]" size={24} />
            <span className="text-xl font-black tracking-tight text-white">
              Health<span className="text-[#6899B0]">Sync</span>
            </span>
          </div>
          <div className="flex gap-6 text-sm font-medium">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Service</a>
            <a href="#" className="hover:text-white transition-colors">Contact</a>
          </div>
          <div className="text-sm">
            © {new Date().getFullYear()} HealthSync. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default LandingPage;

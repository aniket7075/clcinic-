import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Activity, Shield, Clock, Users, Database, 
  BarChart, ArrowRight, CheckCircle2,
  ChevronRight, Sparkles, Plus, X
} from 'lucide-react';

import { CreditCard } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import LanguageSwitcher from '../components/LanguageSwitcher';

const LandingPage: React.FC = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'half-yearly' | 'yearly'>('monthly');
  const [selectedPlanToUpgrade, setSelectedPlanToUpgrade] = useState<'starter' | 'pro' | 'enterprise'>('pro');
  const [processingPayment, setProcessingPayment] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  const handleBuyPlan = (plan: 'starter' | 'pro' | 'enterprise') => {
    setSelectedPlanToUpgrade(plan);
    setIsPaymentModalOpen(true);
    setPaymentSuccess(false);
  };

  const processPayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setProcessingPayment(true);
    await new Promise(resolve => setTimeout(resolve, 2000));
    setPaymentSuccess(true);
    setTimeout(() => {
      navigate('/login');
    }, 2000);
  };

  const getPrice = (plan: 'starter' | 'pro' | 'enterprise', cycle: 'monthly' | 'half-yearly' | 'yearly') => {
    if (plan === 'starter') return cycle === 'monthly' ? '650' : cycle === 'half-yearly' ? '3,900' : '7,800';
    if (plan === 'pro') return cycle === 'monthly' ? '1,150' : cycle === 'half-yearly' ? '6,900' : '13,800';
    return cycle === 'monthly' ? '2,300' : cycle === 'half-yearly' ? '13,800' : '27,600';
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 font-sans selection:bg-[#6899B0]/20">
      {/* Navigation */}
      <nav className="fixed w-full bg-white/80 backdrop-blur-md z-50 border-b border-[#6899B0]/40 shadow-[0_4px_30px_rgba(104,153,176,0.4)] transition-all">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center relative group">
            <div className="absolute inset-0 bg-[#6899B0] blur-xl opacity-40 rounded-full group-hover:opacity-60 transition-opacity"></div>
            <img src="/dental_logo.png" alt="Q Dent Logo" className="h-28 md:h-32 scale-150 origin-left object-contain relative drop-shadow-[0_0_12px_rgba(104,153,176,0.8)]" />
          </div>
          <div className="hidden md:flex items-center gap-8 font-medium text-slate-600">
            <a href="#features" className="hover:text-[#6899B0] transition-colors">{t('landing.nav.features')}</a>
            <a href="#pricing" className="hover:text-[#6899B0] transition-colors">{t('landing.nav.pricing')}</a>
            <a href="#testimonials" className="hover:text-[#6899B0] transition-colors">{t('landing.nav.testimonials')}</a>
          </div>
          <div className="flex items-center gap-4">
            <LanguageSwitcher />
            <Link to="/login" className="hidden md:block font-bold text-slate-600 hover:text-[#6899B0] transition-colors">
              {t('landing.nav.logIn')}
            </Link>
            <Link to="/login" className="bg-[#6899B0] text-white px-6 py-2.5 rounded-full font-bold hover:bg-[#5D8799] transition-all shadow-md shadow-[#6899B0]/20 flex items-center gap-2">
              {t('landing.nav.getStarted')}
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-6 relative overflow-hidden bg-[#6899B0]">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-[1200px] h-[600px] opacity-100 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-white/20 via-blue-200/20 to-white/20 rounded-full blur-[120px] animate-pulse-neon"></div>
        </div>

        {/* Floating Background Elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-[20%] left-[10%] animate-float-cross text-white/30"><Plus size={48} /></div>
          <div className="absolute top-[60%] right-[15%] animate-float-cross text-blue-100/30" style={{ animationDelay: '2s' }}><Plus size={64} /></div>
          <div className="absolute top-[30%] right-[20%] animate-float-cross text-white/40" style={{ animationDelay: '1s' }}><Sparkles size={32} /></div>
          <div className="absolute bottom-[20%] left-[20%] animate-float-cross text-white/30" style={{ animationDelay: '3s' }}><Sparkles size={40} /></div>
        </div>
        
        <div className="max-w-7xl mx-auto text-center relative z-10 flex flex-col items-center">
          
          {/* Animated Neon Tooth Centerpiece */}
          <div className="relative mb-12 mt-10 animate-float-neon group cursor-pointer">
            <div className="absolute inset-0 bg-blue-600 rounded-full blur-[50px] opacity-40 group-hover:opacity-70 transition-opacity duration-700"></div>
            <div className="relative w-32 h-32 md:w-40 md:h-40 bg-[#0A192F]/40 backdrop-blur-xl rounded-[2.5rem] border border-cyan-400/40 shadow-[0_0_50px_rgba(34,211,238,0.5)] flex items-center justify-center overflow-hidden">
               <div className="absolute inset-0 bg-gradient-to-tr from-cyan-500/20 to-transparent"></div>
               <div className="relative">
                 <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" className="w-16 h-16 md:w-20 md:h-20 text-cyan-300 drop-shadow-[0_0_20px_rgba(34,211,238,1)]" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                   <path d="M16 2c-2 0-3.5 1-4 2-.5-1-2-2-4-2-2.2 0-4 1.8-4 4v3c0 2 1 4 2.5 5.5L9.5 21c.5 1 1.5 1 2 0l1.5-3 1.5 3c.5 1 1.5 1 2 0l3-6.5C21 13 22 11 22 9V6c0-2.2-1.8-4-4-4zM9.5 16l-2-4.5c-1-1-2-2.5-2-4V6c0-1.1.9-2 2-2 1 0 2.5 1 3 2.5v2h-2v1.5h2v2H9.5z" fill="rgba(34,211,238,0.2)"/>
                 </svg>
                 <Sparkles className="absolute -top-2 -right-4 w-6 h-6 text-cyan-200 animate-pulse drop-shadow-[0_0_8px_rgba(34,211,238,0.8)]" />
               </div>
            </div>
            {/* Glowing Ring */}
            <div className="absolute -inset-6 border-2 border-blue-500/30 rounded-full animate-[spin_10s_linear_infinite] border-t-cyan-400/80"></div>
            <div className="absolute -inset-10 border border-blue-400/20 rounded-full animate-[spin_15s_linear_infinite_reverse] border-b-blue-500/60"></div>
          </div>

          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/20 border border-white/30 text-sm font-bold text-white mb-8 shadow-[0_0_15px_rgba(255,255,255,0.2)] backdrop-blur-sm">
            <span className="flex h-2 w-2 rounded-full bg-white animate-pulse shadow-[0_0_8px_#ffffff]"></span>
            {t('landing.hero.nextGen')}
          </div>
          
          <h1 className="text-5xl md:text-7xl font-black tracking-tight text-white mb-8 leading-tight drop-shadow-lg">
            {t('landing.hero.osLine1')} <br />
            <span className="text-white drop-shadow-md">
              {t('landing.hero.osLine2')}
            </span>
          </h1>
          <p className="text-lg md:text-xl text-blue-50 mb-10 max-w-2xl mx-auto leading-relaxed drop-shadow-sm">
            {t('landing.hero.desc')}
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6">
            <button onClick={() => handleBuyPlan('starter')} className="group w-full sm:w-auto bg-white text-[#6899B0] px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-50 transition-all shadow-[0_0_30px_rgba(255,255,255,0.4)] hover:shadow-[0_0_40px_rgba(255,255,255,0.6)] flex items-center justify-center gap-3 relative overflow-hidden">
              <div className="absolute inset-0 bg-black/5 translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
              <span className="relative z-10 flex items-center gap-2">{t('landing.hero.startFreeTrial')} <ArrowRight size={20} className="group-hover:translate-x-1 transition-transform" /></span>
            </button>
            <a href="#features" className="w-full sm:w-auto bg-transparent text-white px-8 py-4 rounded-full font-bold text-lg border border-white/50 hover:border-white hover:bg-white/10 transition-all flex items-center justify-center">
              {t('landing.hero.viewFeatures')}
            </a>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 bg-slate-50 border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">{t('landing.features.title')}</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">{t('landing.features.desc')}</p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              { icon: <Clock />, title: t('landing.features.f1.title'), desc: t('landing.features.f1.desc') },
              { icon: <Activity />, title: t('landing.features.f2.title'), desc: t('landing.features.f2.desc') },
              { icon: <Shield />, title: t('landing.features.f3.title'), desc: t('landing.features.f3.desc') },
              { icon: <Database />, title: t('landing.features.f4.title'), desc: t('landing.features.f4.desc') },
              { icon: <BarChart />, title: t('landing.features.f5.title'), desc: t('landing.features.f5.desc') },
              { icon: <Users />, title: t('landing.features.f6.title'), desc: t('landing.features.f6.desc') },
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
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-black text-slate-900 mb-4">{t('landing.pricing.title')}</h2>
            <p className="text-lg text-slate-500 max-w-2xl mx-auto">{t('landing.pricing.desc')}</p>
          </div>

          <div className="flex justify-center mb-12">
            <div className="bg-slate-100 p-1.5 rounded-xl inline-flex relative shadow-inner">
              <button onClick={() => setBillingCycle('monthly')} className={`relative z-10 px-5 sm:px-6 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 ${billingCycle === 'monthly' ? 'text-slate-900 shadow-sm bg-white' : 'text-slate-500 hover:text-slate-700'}`}>{t('landing.pricing.monthly')}</button>
              <button onClick={() => setBillingCycle('half-yearly')} className={`relative z-10 px-5 sm:px-6 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 ${billingCycle === 'half-yearly' ? 'text-slate-900 shadow-sm bg-white' : 'text-slate-500 hover:text-slate-700'}`}>{t('landing.pricing.halfYearly')} <span className="hidden sm:inline-block text-[10px] bg-blue-100 text-blue-700 px-1.5 py-0.5 rounded ml-1 font-bold">{t('landing.pricing.save10')}</span></button>
              <button onClick={() => setBillingCycle('yearly')} className={`relative z-10 px-5 sm:px-6 py-2.5 text-sm font-bold rounded-lg transition-all duration-300 ${billingCycle === 'yearly' ? 'text-slate-900 shadow-sm bg-white' : 'text-slate-500 hover:text-slate-700'}`}>{t('landing.pricing.yearly')} <span className="hidden sm:inline-block text-[10px] bg-green-100 text-green-700 px-1.5 py-0.5 rounded ml-1 font-bold">{t('landing.pricing.save16')}</span></button>
            </div>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-5xl mx-auto">
            {/* Starter */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col">
              <h3 className="text-xl font-bold text-slate-900 mb-2">{t('landing.pricing.starter.title')}</h3>
              <p className="text-slate-500 text-sm mb-6">{t('landing.pricing.starter.desc')}</p>
              <div className="mb-8">
                <span className="text-4xl font-black text-slate-900">₹{getPrice('starter', billingCycle)}</span>
                <span className="text-slate-500 font-medium">/{billingCycle === 'monthly' ? t('landing.pricing.month') : billingCycle === 'half-yearly' ? t('landing.pricing.sixMonths') : t('landing.pricing.year')}</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {[
                  { name: t('landing.pricing.starter.i1'), included: true },
                  { name: t('landing.pricing.starter.i2'), included: true },
                  { name: t('landing.pricing.starter.i3'), included: true },
                  { name: t('landing.pricing.starter.i4'), included: true },
                  { name: t('landing.pricing.starter.i5'), included: true },
                  { name: t('landing.pricing.starter.i6'), included: false },
                  { name: t('landing.pricing.starter.i7'), included: false },
                  { name: t('landing.pricing.starter.i8'), included: false },
                ].map((item, i) => (
                  <li key={i} className={`flex items-center gap-3 font-medium ${item.included ? 'text-slate-600' : 'text-slate-400 opacity-60'}`}>
                    {item.included ? <CheckCircle2 size={18} className="text-green-500 shrink-0" /> : <X size={18} className="text-slate-400 shrink-0" />} 
                    {item.name}
                  </li>
                ))}
              </ul>
              <button onClick={() => handleBuyPlan('starter')} className="w-full block text-center bg-slate-100 text-slate-900 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors">
                {t('landing.hero.startFreeTrial')}
              </button>
            </div>

            {/* Pro */}
            <div className="bg-slate-900 rounded-3xl p-8 border border-slate-800 shadow-2xl shadow-slate-900/20 flex flex-col relative transform md:-translate-y-4">
              <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 bg-gradient-to-r from-[#6899B0] to-blue-500 text-white px-4 py-1 rounded-full text-xs font-bold tracking-wider uppercase">
                {t('landing.pricing.pro.tag')}
              </div>
              <h3 className="text-xl font-bold text-white mb-2">{t('landing.pricing.pro.title')}</h3>
              <p className="text-slate-400 text-sm mb-6">{t('landing.pricing.pro.desc')}</p>
              <div className="mb-8">
                <span className="text-4xl font-black text-white">₹{getPrice('pro', billingCycle)}</span>
                <span className="text-slate-400 font-medium">/{billingCycle === 'monthly' ? t('landing.pricing.month') : billingCycle === 'half-yearly' ? t('landing.pricing.sixMonths') : t('landing.pricing.year')}</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {[
                  { name: t('landing.pricing.pro.i1'), included: true },
                  { name: t('landing.pricing.pro.i2'), included: true },
                  { name: t('landing.pricing.pro.i3'), included: true },
                  { name: t('landing.pricing.pro.i4'), included: true },
                  { name: t('landing.pricing.pro.i5'), included: true },
                  { name: t('landing.pricing.pro.i6'), included: true },
                  { name: t('landing.pricing.pro.i7'), included: true },
                  { name: t('landing.pricing.pro.i8'), included: false },
                ].map((item, i) => (
                  <li key={i} className={`flex items-center gap-3 font-medium ${item.included ? 'text-slate-200' : 'text-slate-500 opacity-60'}`}>
                    {item.included ? <CheckCircle2 size={18} className="text-[#6899B0] shrink-0" /> : <X size={18} className="text-slate-500 shrink-0" />} 
                    {item.name}
                  </li>
                ))}
              </ul>
              <button onClick={() => handleBuyPlan('pro')} className="w-full block text-center bg-[#6899B0] text-white font-bold py-3 rounded-xl hover:bg-[#5D8799] transition-colors shadow-lg shadow-[#6899B0]/20">
                {t('landing.pricing.pro.btn')}
              </button>
            </div>

            {/* Enterprise */}
            <div className="bg-white rounded-3xl p-8 border border-slate-200 shadow-sm flex flex-col">
              <h3 className="text-xl font-bold text-slate-900 mb-2">{t('landing.pricing.enterprise.title')}</h3>
              <p className="text-slate-500 text-sm mb-6">{t('landing.pricing.enterprise.desc')}</p>
              <div className="mb-8">
                <span className="text-4xl font-black text-slate-900">₹{getPrice('enterprise', billingCycle)}</span>
                <span className="text-slate-500 font-medium">/{billingCycle === 'monthly' ? t('landing.pricing.month') : billingCycle === 'half-yearly' ? t('landing.pricing.sixMonths') : t('landing.pricing.year')}</span>
              </div>
              <ul className="space-y-4 mb-8 flex-1">
                {[
                  { name: t('landing.pricing.enterprise.i1'), included: true },
                  { name: t('landing.pricing.enterprise.i2'), included: true },
                  { name: t('landing.pricing.enterprise.i3'), included: true },
                  { name: t('landing.pricing.enterprise.i4'), included: true },
                  { name: t('landing.pricing.enterprise.i5'), included: true },
                  { name: t('landing.pricing.enterprise.i6'), included: true },
                  { name: t('landing.pricing.enterprise.i7'), included: true },
                  { name: t('landing.pricing.enterprise.i8'), included: true },
                ].map((item, i) => (
                  <li key={i} className={`flex items-center gap-3 font-medium ${item.included ? 'text-slate-600' : 'text-slate-400 opacity-60'}`}>
                    {item.included ? <CheckCircle2 size={18} className="text-green-500 shrink-0" /> : <X size={18} className="text-slate-400 shrink-0" />} 
                    {item.name}
                  </li>
                ))}
              </ul>
              <button onClick={() => handleBuyPlan('enterprise')} className="w-full block text-center bg-slate-100 text-slate-900 font-bold py-3 rounded-xl hover:bg-slate-200 transition-colors border border-slate-200">
                {t('landing.pricing.enterprise.btn')}
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-[#6899B0] text-white">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-5xl font-black mb-6 drop-shadow-md">{t('landing.cta.title')}</h2>
          <p className="text-xl text-blue-50 mb-10 drop-shadow-sm">{t('landing.cta.desc')}</p>
          <button onClick={() => handleBuyPlan('starter')} className="inline-flex items-center gap-2 bg-white text-[#6899B0] px-8 py-4 rounded-full font-bold text-lg hover:bg-blue-50 hover:scale-105 transition-all shadow-xl shadow-white/10">
            {t('landing.cta.btn')} <ChevronRight size={20} />
          </button>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-slate-900 py-12 px-6 border-t border-slate-800 text-slate-400">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center">
            <img src="/dental_logo.png" alt="Q Dent Logo" className="h-24 md:h-28 scale-125 origin-left object-contain brightness-0 invert opacity-80" />
          </div>
          <div className="flex gap-6 text-sm font-medium">
            <a href="#" className="hover:text-white transition-colors">{t('landing.footer.privacy')}</a>
            <a href="#" className="hover:text-white transition-colors">{t('landing.footer.terms')}</a>
            <a href="#" className="hover:text-white transition-colors">{t('landing.footer.contact')}</a>
          </div>
          <div className="text-sm text-center md:text-right">
            <p>© {new Date().getFullYear()} {t('landing.footer.rights')}</p>
            <p className="mt-1 text-slate-500 font-medium">{t('landing.footer.poweredBy')}</p>
          </div>
        </div>
      </footer>

      {/* Razorpay Simulation Modal */}
      {isPaymentModalOpen && (
        <div className="fixed inset-0 bg-slate-900/70 flex items-center justify-center p-4 z-50 backdrop-blur-sm">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-[400px] overflow-hidden flex flex-col relative animate-in fade-in zoom-in-95 duration-200">
            {/* Razorpay Header */}
            <div className="bg-[#121212] p-5 text-white flex justify-between items-start relative">
               <div className="absolute top-0 right-0 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-bl uppercase">Test Mode</div>
               <div className="flex gap-4 items-center">
                 <div className="w-12 h-12 bg-white rounded flex items-center justify-center font-bold text-black text-xl">Q</div>
                 <div>
                   <h2 className="font-medium text-lg leading-tight">Q Dent</h2>
                   <p className="text-white/60 text-sm">Subscription Upgrade</p>
                 </div>
               </div>
               <div className="text-right">
                  <p className="text-white/60 text-xs">Amount ({billingCycle})</p>
                  <p className="font-semibold text-lg">₹{getPrice(selectedPlanToUpgrade, billingCycle)}</p>
               </div>
            </div>
            
            {/* Razorpay Body */}
            {paymentSuccess ? (
              <div className="p-8 text-center flex flex-col items-center justify-center min-h-[300px]">
                <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mb-4 shadow-lg shadow-green-500/30">
                  <CheckCircle2 size={32} className="text-white" />
                </div>
                <h3 className="text-xl font-bold text-slate-800 mb-1">Request Submitted!</h3>
                <p className="text-slate-500 text-sm">Your subscription request is pending approval from Q Dent admin. Redirecting...</p>
              </div>
            ) : (
              <form onSubmit={processPayment} className="p-0 flex-1 flex flex-col min-h-[400px]">
                <div className="bg-[#F4F8FB] p-3 text-xs text-center border-b border-slate-200 text-slate-500">
                   English | ₹ INR
                </div>
                
                <div className="p-5 flex-1 space-y-4">
                  <div className="text-sm font-medium text-slate-800 mb-2">Contact Details</div>
                  <input type="text" placeholder="Phone Number" className="w-full p-3 border-b border-slate-300 text-sm outline-none focus:border-blue-500 transition-colors" required />
                  <input type="email" placeholder="Email Address" className="w-full p-3 border-b border-slate-300 text-sm outline-none focus:border-blue-500 transition-colors" required />
                  
                  <div className="text-sm font-medium text-slate-800 mt-6 mb-2">Cards, UPI & More</div>
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                     <div className="flex items-center gap-3 p-3 border-b border-slate-200 bg-blue-50/50 cursor-pointer">
                        <CreditCard size={18} className="text-blue-600" />
                        <span className="text-sm font-medium text-slate-700">Card</span>
                     </div>
                     <div className="p-4 space-y-3 bg-white">
                        <input type="text" placeholder="Card Number" className="w-full p-2.5 border border-slate-300 rounded text-sm outline-none focus:border-blue-500" required />
                        <div className="grid grid-cols-2 gap-3">
                          <input type="text" placeholder="Expiry (MM/YY)" className="w-full p-2.5 border border-slate-300 rounded text-sm outline-none focus:border-blue-500" required />
                          <input type="text" placeholder="CVV" className="w-full p-2.5 border border-slate-300 rounded text-sm outline-none focus:border-blue-500" required />
                        </div>
                     </div>
                  </div>
                </div>

                {/* Razorpay Footer */}
                <div className="p-4 border-t border-slate-200 bg-slate-50">
                  <button 
                    type="submit" 
                    disabled={processingPayment}
                    className="w-full py-3.5 bg-blue-600 text-white font-medium rounded hover:bg-blue-700 disabled:opacity-70 transition-all flex justify-center items-center shadow-md shadow-blue-600/20 uppercase tracking-wide text-sm"
                  >
                    {processingPayment ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      `Pay ₹${getPrice(selectedPlanToUpgrade, billingCycle)}`
                    )}
                  </button>
                  <div className="flex justify-between items-center mt-3 px-1">
                    <span className="text-[10px] text-slate-400 font-medium">Secured by Razorpay</span>
                    <button type="button" onClick={() => !processingPayment && setIsPaymentModalOpen(false)} className="text-[11px] text-slate-500 hover:text-slate-800 font-medium">Cancel</button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;

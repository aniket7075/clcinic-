import React, { useState } from 'react';
import { HelpCircle, Mail, Phone, ExternalLink, ChevronDown, ChevronUp } from 'lucide-react';

const FAQS = [
  {
    question: "How do I add a new patient?",
    answer: "Navigate to the 'Patients' module from the sidebar and click on the 'Add New Patient' button in the top right corner. Fill in the required details and save."
  },
  {
    question: "How do I switch between different clinics?",
    answer: "If you are a Super Admin, you can use the Clinic Switcher dropdown located at the top of the left sidebar. Selecting a different clinic will instantly switch your context to that clinic's data."
  },
  {
    question: "How can I update my working schedule?",
    answer: "Your working schedule is currently managed by the Clinic Admin or Super Admin through the Staff Management module. Please contact them to update your shift timings."
  },
  {
    question: "Where can I view low stock alerts?",
    answer: "Low stock alerts are displayed on the main Dashboard under the 'Low Stock Alerts' card, and also highlighted in red within the Inventory module."
  },
  {
    question: "What should I do if I forget my password?",
    answer: "Currently, you must contact your system administrator to reset your password. A self-service password reset feature will be added in a future update."
  }
];

const HelpSupport: React.FC = () => {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="flex flex-col h-full bg-slate-50">
      <header className="bg-white shadow-sm border-b border-slate-200 p-6 flex justify-between items-center shrink-0">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-blue-100 text-[#6899B0] rounded-lg">
            <HelpCircle size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-black">Help & Support</h1>
            <p className="text-sm text-black">Find answers and contact system administration</p>
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto p-6">
        <div className="max-w-5xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* FAQ Section */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 overflow-hidden">
              <div className="p-6 border-b border-slate-200 bg-slate-50/50">
                <h2 className="text-lg font-bold text-black">Frequently Asked Questions</h2>
                <p className="text-sm text-black mt-1">Quick answers to common tasks and issues</p>
              </div>
              <div className="divide-y divide-slate-100 p-2">
                {FAQS.map((faq, index) => (
                  <div key={index} className="p-4 transition-colors hover:bg-slate-50 rounded-xl">
                    <button 
                      onClick={() => toggleFaq(index)}
                      className="w-full flex items-center justify-between text-left font-medium text-black"
                    >
                      <span>{faq.question}</span>
                      {openFaq === index ? (
                        <ChevronUp size={18} className="text-slate-400 shrink-0 ml-4" />
                      ) : (
                        <ChevronDown size={18} className="text-slate-400 shrink-0 ml-4" />
                      )}
                    </button>
                    {openFaq === index && (
                      <p className="mt-3 text-black text-sm leading-relaxed pr-8 animate-fade-in-up">
                        {faq.answer}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Contact Support */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
              <h2 className="text-lg font-bold text-black mb-4">Contact IT Support</h2>
              
              <div className="space-y-4">
                <a href="mailto:support@dentalclinicpro.com" className="flex items-center space-x-3 p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-[#E0EEF5] transition-colors group cursor-pointer">
                  <div className="p-2 bg-slate-100 text-black rounded-lg group-hover:bg-blue-100 group-hover:text-[#6899B0] transition-colors">
                    <Mail size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-black">Email Support</p>
                    <p className="text-xs text-black">support@dentalclinicpro.com</p>
                  </div>
                </a>

                <div className="flex items-center space-x-3 p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-[#E0EEF5] transition-colors group cursor-pointer">
                  <div className="p-2 bg-slate-100 text-black rounded-lg group-hover:bg-blue-100 group-hover:text-[#6899B0] transition-colors">
                    <Phone size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-black">Emergency Support</p>
                    <p className="text-xs text-black">+1 (800) 123-4567</p>
                  </div>
                </div>

                <a href="#" className="flex items-center space-x-3 p-3 rounded-xl border border-slate-200 hover:border-blue-300 hover:bg-[#E0EEF5] transition-colors group cursor-pointer">
                  <div className="p-2 bg-slate-100 text-black rounded-lg group-hover:bg-blue-100 group-hover:text-[#6899B0] transition-colors">
                    <ExternalLink size={18} />
                  </div>
                  <div>
                    <p className="text-sm font-medium text-black">Knowledge Base</p>
                    <p className="text-xs text-black">Read detailed documentation</p>
                  </div>
                </a>
              </div>
            </div>

            <div className="bg-slate-800 p-6 rounded-2xl shadow-sm text-white">
              <h3 className="font-semibold mb-2">System Information</h3>
              <div className="space-y-2 text-sm text-slate-300">
                <div className="flex justify-between">
                  <span>Version:</span>
                  <span className="font-medium text-white">v2.4.0 (Enterprise)</span>
                </div>
                <div className="flex justify-between">
                  <span>Environment:</span>
                  <span className="font-medium text-green-400">Production</span>
                </div>
                <div className="flex justify-between">
                  <span>Last Updated:</span>
                  <span className="font-medium text-white">Today</span>
                </div>
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
};

export default HelpSupport;

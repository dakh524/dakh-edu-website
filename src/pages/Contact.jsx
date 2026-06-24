import { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, MapPin, Send, CheckCircle2, Loader2 } from 'lucide-react';
import PageTransition from '../components/PageTransition';
import ScrollReveal from '../components/ScrollReveal';
import { supabase } from '../lib/supabase';

const Contact = () => {
  const [formState, setFormState] = useState('idle'); // idle | submitting | success | error
  const [formError, setFormError] = useState('');
  const [form, setForm] = useState({ name: '', email: '', subject: 'Internship Inquiry', message: '' });

  const set = (field, value) => setForm(prev => ({ ...prev, [field]: value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    setFormState('submitting');
    setFormError('');
    try {
      // Optional backup: Try to save to Supabase (fails silently if table is missing)
      supabase.from('contact_messages').insert([{
        name: form.name.trim(),
        email: form.email.trim().toLowerCase(),
        subject: form.subject,
        message: form.message.trim(),
        sent_at: new Date().toISOString(),
        status: 'unread',
      }]).then(() => {}).catch(() => {});

      const accessKey = import.meta.env.VITE_WEB3FORMS_ACCESS_KEY;
      
      // If Web3Forms is set up, send email
      if (accessKey && accessKey !== 'your_access_key_here') {
        const response = await fetch("https://api.web3forms.com/submit", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Accept: "application/json",
          },
          body: JSON.stringify({
            access_key: accessKey,
            name: form.name,
            email: form.email,
            subject: form.subject,
            message: form.message,
            to: "dakhedusolution@gmail.com",
          }),
        });

        const result = await response.json();
        
        if (!result.success) {
          throw new Error(result.message || "Failed to send message");
        }
      } else {
        // Fallback: Send directly to WhatsApp
        const phoneNumber = "918667399640";
        const whatsappMessage = `*New Contact Form Submission*%0A%0A*Name:* ${form.name}%0A*Email:* ${form.email}%0A*Subject:* ${form.subject}%0A*Message:* ${form.message}`;
        window.open(`https://wa.me/${phoneNumber}?text=${whatsappMessage}`, '_blank');
      }

      setFormState('success');
      setForm({ name: '', email: '', subject: 'Internship Inquiry', message: '' });
    } catch (err) {
      console.error(err);
      setFormError(err.message || 'Something went wrong. Please try again or email us directly.');
      setFormState('error');
    }
  };

  return (
    <PageTransition>
      <section className="pt-32 pb-20 px-6 lg:px-8 max-w-7xl mx-auto min-h-[calc(100vh-400px)]">
        <ScrollReveal className="text-center max-w-3xl mx-auto mb-16 relative">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-[var(--color-brand-secondary)] rounded-full blur-[120px] opacity-10 pointer-events-none -z-10"></div>
          <h1 className="font-extrabold text-5xl md:text-7xl mb-6 text-gray-900">
            Let's <span className="text-gradient">Connect</span>
          </h1>
          <p className="text-lg md:text-xl text-[var(--color-brand-text-secondary)]">
            Whether you're looking for an internship, need a product built, or just want to say hi.
          </p>
        </ScrollReveal>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-start">
          
          {/* Contact Info */}
          <ScrollReveal delay={0.1}>
            <div className="space-y-10">
              <div className="flex items-start gap-6">
                <div className="w-14 h-14 bg-white border border-gray-200 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                  <Mail className="text-[var(--color-brand-primary)]" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-2xl mb-2 text-gray-900">Email Us</h3>
                  <p className="text-[var(--color-brand-text-secondary)] mb-2">For general inquiries and project requests.</p>
                  <a href="mailto:dakhsolutions@gmail.com" className="font-bold text-[var(--color-brand-secondary)] hover:text-[var(--color-brand-primary)] transition-colors text-lg">
                    dakhsolutions@gmail.com
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-6">
                <div className="w-14 h-14 bg-white border border-gray-200 rounded-2xl flex items-center justify-center shrink-0 shadow-sm">
                  <MapPin className="text-[var(--color-brand-primary)]" size={24} />
                </div>
                <div>
                  <h3 className="font-bold text-2xl mb-2 text-gray-900">Location</h3>
                  <p className="text-[var(--color-brand-text-secondary)] mb-2">Our headquarters</p>
                  <p className="font-bold text-gray-900 text-lg">Chennai, Tamil Nadu, India</p>
                </div>
              </div>
            </div>
          </ScrollReveal>

          {/* Form */}
          <ScrollReveal delay={0.2}>
            <div className="bg-white p-8 lg:p-10 rounded-3xl border border-gray-200 shadow-xl relative overflow-hidden backdrop-blur-md">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[var(--color-brand-primary)] rounded-full blur-[80px] opacity-10"></div>
              
              {formState === 'success' ? (
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="text-center py-12"
                >
                  <CheckCircle2 size={64} className="text-[var(--color-brand-success)] mx-auto mb-6" />
                  <h3 className="text-3xl font-bold mb-4 text-gray-900">Message Sent!</h3>
                  <p className="text-[var(--color-brand-text-secondary)] mb-8">We'll get back to you within 24 hours.</p>
                  <button 
                    onClick={() => setFormState('idle')}
                    className="font-bold text-[var(--color-brand-primary)] hover:text-gray-900 transition-colors"
                  >
                    Send another message
                  </button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="space-y-6 relative z-10">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    <div className="space-y-2">
                    <label className="text-sm font-bold text-[var(--color-brand-text-secondary)]">Name</label>
                    <input required type="text" value={form.name} onChange={e => set('name', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-[var(--color-brand-primary)] focus:bg-white transition-colors" placeholder="John Doe" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[var(--color-brand-text-secondary)]">Email</label>
                    <input required type="email" value={form.email} onChange={e => set('email', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-[var(--color-brand-primary)] focus:bg-white transition-colors" placeholder="john@example.com" />
                  </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[var(--color-brand-text-secondary)]">Subject</label>
                    <select value={form.subject} onChange={e => set('subject', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-[var(--color-brand-primary)] focus:bg-white transition-colors appearance-none">
                      <option className="bg-white text-gray-900">Internship Inquiry</option>
                      <option className="bg-white text-gray-900">Project Request</option>
                      <option className="bg-white text-gray-900">Partnership</option>
                      <option className="bg-white text-gray-900">Other</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-[var(--color-brand-text-secondary)]">Message</label>
                    <textarea required rows={4} value={form.message} onChange={e => set('message', e.target.value)} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 focus:outline-none focus:border-[var(--color-brand-primary)] focus:bg-white transition-colors resize-none" placeholder="How can we help you?"></textarea>
                  </div>
                  {formState === 'error' && (
                    <p className="text-sm text-red-500 font-medium bg-red-50 border border-red-100 rounded-xl px-4 py-2.5">⚠️ {formError}</p>
                  )}
                  <button 
                    disabled={formState === 'submitting'}
                    className="w-full group flex items-center justify-center gap-2 px-8 py-4 bg-gradient-primary text-white rounded-xl font-bold hover:shadow-[0_0_20px_rgba(147,51,234,0.4)] transition-all duration-300 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {formState === 'submitting' ? <><Loader2 size={18} className="animate-spin" /> Sending...</> : <>Send Message <Send size={18} className="group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" /></>}
                  </button>
                </form>
              )}
            </div>
          </ScrollReveal>
        </div>
      </section>
    </PageTransition>
  );
};

export default Contact;

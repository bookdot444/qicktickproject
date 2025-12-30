"use client";

import Link from "next/link";
import Image from "next/image";
import { 
  Facebook, 
  Instagram, 
  Twitter, 
  Mail, 
  Phone, 
  MapPin, 
  ArrowRight,
  Globe
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative bg-[#05070a] text-slate-400 pt-20 pb-10 overflow-hidden border-t border-white/5">
      {/* Background Decorative Elements */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 blur-[120px] rounded-full"></div>
      <div className="absolute bottom-0 right-1/4 w-64 h-64 bg-blue-500/5 blur-[100px] rounded-full"></div>

      <div className="max-w-7xl mx-auto px-6 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 mb-16">
          
          {/* Column 1: Brand (Span 4) */}
          <div className="lg:col-span-4 space-y-8">
            <Link href="/" className="inline-block group">
                <Image
                  src="/logoBlacl.png"
                  alt="QickTick Logo"
                  width={170}
                  height={45}
                  className="object-contain"
                />
            </Link>
            <p className="text-sm leading-relaxed text-slate-500 max-w-sm">
              Empowering local economies through digital discovery. We connect millions of users with verified local experts and businesses across India.
            </p>
            <div className="flex gap-3">
              {[
                { icon: <Instagram size={18} />, color: "hover:bg-pink-600", label: "Instagram" },
                { icon: <Facebook size={18} />, color: "hover:bg-blue-600", label: "Facebook" },
                { icon: <Twitter size={18} />, color: "hover:bg-sky-500", label: "Twitter" }
              ].map((social, i) => (
                <a
                  key={i}
                  href="#"
                  aria-label={social.label}
                  className={`p-3 bg-white/5 rounded-full border border-white/10 text-slate-300 transition-all duration-300 hover:-translate-y-1 ${social.color} hover:text-white hover:border-transparent`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2: Quick Links (Span 2) */}
          <div className="lg:col-span-2">
            <h3 className="text-white text-[11px] font-black uppercase tracking-[0.2em] mb-8">
              Platform
            </h3>
            <ul className="space-y-4">
              {['Home', 'Categories', 'Add Business', 'Subscription'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm hover:text-amber-400 transition-colors duration-300 flex items-center group">
                    <ArrowRight size={12} className="mr-2 opacity-0 -ml-4 group-hover:opacity-100 group-hover:ml-0 transition-all" />
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Support (Span 2) */}
          <div className="lg:col-span-2">
            <h3 className="text-white text-[11px] font-black uppercase tracking-[0.2em] mb-8">
              Support
            </h3>
            <ul className="space-y-4">
              {['Help Center', 'Safety Tips', 'Contact Us', 'Privacy'].map((item) => (
                <li key={item}>
                  <Link href="#" className="text-sm hover:text-amber-400 transition-colors duration-300">
                    {item}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 4: Newsletter (Span 4) */}
          <div className="lg:col-span-4 space-y-6">
            <h3 className="text-white text-[11px] font-black uppercase tracking-[0.2em] mb-8">
              Newsletter
            </h3>
            <p className="text-xs text-slate-500">Subscribe to get the latest business trends and updates.</p>
            <div className="relative group">
              <input 
                type="email" 
                placeholder="email@example.com" 
                className="w-full bg-white/5 border border-white/10 rounded-xl py-4 px-5 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/50 transition-all"
              />
              <button className="absolute right-2 top-2 bottom-2 bg-amber-500 hover:bg-amber-400 text-black px-4 rounded-lg transition-colors">
                <ArrowRight size={18} />
              </button>
            </div>
            <div className="flex items-center gap-4 pt-4 text-xs text-slate-500">
              <div className="flex items-center gap-1">
                <Globe size={14} className="text-amber-500" />
                <span>English (IN)</span>
              </div>
              <div className="w-1 h-1 bg-slate-700 rounded-full"></div>
              <span>INR (₹)</span>
            </div>
          </div>

        </div>

        {/* Contact Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 py-8 border-y border-white/5">
            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="p-3 bg-amber-500/10 rounded-xl text-amber-500 group-hover:bg-amber-500 group-hover:text-black transition-all">
                <Mail size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-tighter text-slate-600">Email Us</p>
                <p className="text-sm text-slate-300 font-bold">support@qicktick.com</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="p-3 bg-blue-500/10 rounded-xl text-blue-500 group-hover:bg-blue-500 group-hover:text-white transition-all">
                <Phone size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-tighter text-slate-600">Call Us</p>
                <p className="text-sm text-slate-300 font-bold">+91 98765 43210</p>
              </div>
            </div>
            <div className="flex items-center gap-4 group cursor-pointer">
              <div className="p-3 bg-emerald-500/10 rounded-xl text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white transition-all">
                <MapPin size={20} />
              </div>
              <div>
                <p className="text-[10px] font-black uppercase tracking-tighter text-slate-600">Visit Us</p>
                <p className="text-sm text-slate-300 font-bold">Mumbai, Maharashtra, India</p>
              </div>
            </div>
        </div>

        {/* Copyright */}
        <div className="mt-10 flex flex-col md:flex-row justify-between items-center gap-6">
          <p className="text-[11px] font-medium text-slate-600">
            © {new Date().getFullYear()} QICKTICK INDIA PRIVATE LIMITED. ALL RIGHTS RESERVED.
          </p>
          <div className="flex gap-8">
            {['Privacy', 'Terms', 'Sitemap'].map(link => (
              <Link key={link} href="#" className="text-[11px] font-bold uppercase tracking-widest text-slate-600 hover:text-white transition-colors">
                {link}
              </Link>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}
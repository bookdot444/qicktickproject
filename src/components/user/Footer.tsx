"use client";

import Link from "next/link";
import Image from "next/image";
import {
  Instagram,
  Youtube,
  MessageCircle, // Using this for WhatsApp
  Mail,
  Phone,
  MapPin,
  Globe
} from "lucide-react";

export default function Footer() {
  return (
    <footer className="relative bg-[#05070a] text-slate-400 pt-8 pb-10 border-t border-white/5">      {/* Background Decorative Element */}
      <div className="absolute top-0 left-1/4 w-72 h-72 bg-amber-500/5 blur-[100px] rounded-full"></div>

      <div className="max-w-7xl mx-auto px-5 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-x-8 gap-y-8 mb-8">

          {/* Column 1: Brand Info */}
          <div className="lg:col-span-4 space-y-4">
            <Link href="/" className="inline-block">
              <Image
                src="/logoBlacl.png"
                alt="QickTick Logo"
                width={140}
                height={35}
                className="object-contain"
              />
            </Link>
            <p className="text-[13px] leading-relaxed text-slate-400 max-w-sm">
              Empowering local economies through digital discovery. We connect millions of users with verified local experts and businesses across India.
            </p>

            {/* Updated Social Links */}
            <div className="flex gap-3 pt-1">
              {[
                {
                  icon: <Instagram size={18} />,
                  color: "hover:bg-pink-600",
                  href: "https://www.instagram.com/qicktick4?igsh=MWF5NGxwcGFtM3pyag=="
                },
                {
                  icon: <Youtube size={18} />,
                  color: "hover:bg-red-600",
                  href: "https://youtube.com/@qicktick-2045?si=g5xqkrG7P9TZyII2"
                },
                {
                  icon: <MessageCircle size={18} />,
                  color: "hover:bg-green-600",
                  href: "https://WA.me/917892999063"
                }
              ].map((social, i) => (
                <a
                  key={i}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 bg-white/5 rounded-full border border-white/10 text-slate-300 transition-all ${social.color} hover:text-white`}
                >
                  {social.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Column 2 & 3 Wrapper for Mobile (Platform & Services) */}
          <div className="grid grid-cols-2 lg:grid-cols-5 lg:col-span-5 gap-4">
            {/* Column 2: Platform */}
            <div className="lg:col-span-2">
              <h3 className="text-white text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                Platform
              </h3>
              <ul className="space-y-2.5">
                {[
                  { name: 'Home', href: '/' },
                  { name: 'Plans', href: '/plans' },
                  { name: 'Add Business', href: '/add-business' },
                  { name: 'Transport', href: '/transport' }
                ].map((item) => (
                  <li key={item.name}>
                    <Link href={item.href} className="text-xs hover:text-amber-400 transition-colors">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Column 3: Services */}
            <div className="lg:col-span-3">
              <h3 className="text-white text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                Services
              </h3>
              <ul className="space-y-2.5">
                {[
                  { name: 'Enquiry', href: '/enquiry' },
                  { name: 'Listing', href: '/listing' },
                  { name: 'Video Services', href: '/video' },
                  { name: 'Help & Earn', href: '/help-earn' }
                ].map((item) => (
                  <li key={item.name}>
                    <Link href={item.href} className="text-xs hover:text-amber-400 transition-colors">
                      {item.name}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Column 4: Preferences */}
          <div className="lg:col-span-3">
            <h3 className="text-white text-[10px] font-black uppercase tracking-[0.2em] mb-4">
              Preferences
            </h3>
            <div className="flex flex-col gap-2">
              <div className="flex items-center gap-2 text-[11px] text-slate-300 bg-white/5 border border-white/10 p-2 rounded-lg">
                <Globe size={12} className="text-amber-500" />
                <span>English (IN)</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] text-slate-300 bg-white/5 border border-white/10 p-2 rounded-lg">
                <span className="text-amber-500 font-bold ml-0.5 text-[10px]">₹</span>
                <span>INR (₹)</span>
              </div>
            </div>

            <a
              href="/terms.pdf"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-10 block text-[10px] font-bold uppercase tracking-widest text-slate-500 hover:text-amber-500"
            >
              Terms & Conditions
            </a>
          </div>
        </div>

        {/* Contact Strip */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 py-5 border-y border-white/5">
          {[
            { icon: <Mail size={16} />, label: "Email Us", val: "qicktick2025@gmail.com", color: "text-amber-500", bg: "bg-amber-500/10" },
            { icon: <Phone size={16} />, label: "Call Us", val: "+91 7892999063", color: "text-blue-500", bg: "bg-blue-500/10" },
            { icon: <MapPin size={16} />, label: "Visit Us", val: "Vidyanagar kabbur, Haveri, Karnataka, 581110", color: "text-emerald-500", bg: "bg-emerald-500/10" }
          ].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3 p-2.5 bg-white/[0.02] rounded-xl border border-white/5">
              <div className={`p-2 ${item.bg} rounded-lg ${item.color}`}>
                {item.icon}
              </div>
              <div>
                <p className="text-[8px] font-black uppercase tracking-widest text-slate-500">{item.label}</p>
                <p className="text-[13px] text-slate-200 font-semibold">{item.val}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom Bar */}
        <div className="mt-6 flex flex-col items-center justify-center text-center gap-2 pb-4">          <p className="text-[10px] font-medium text-slate-500 tracking-wide">
          © {new Date().getFullYear()} QICKTICK INDIA PRIVATE LIMITED.
        </p>
          <p className="text-[10px] text-slate-600">
            Developed by{" "}
            <a
              href="https://rakvih.in/"
              target="_blank"
              rel="noopener noreferrer"
              className="text-amber-500 uppercase hover:underline"
            >
              Rakivh
            </a>
          </p>
        </div>
      </div>
    </footer>
  );
}
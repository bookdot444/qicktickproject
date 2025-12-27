"use client";

import Link from "next/link";
import Image from "next/image";
import { Facebook, Instagram, Twitter, Mail, Phone, MapPin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-slate-900 text-slate-300 pt-16 pb-8 w-full border-t border-slate-800">
      <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
     {/* Column 1: Brand & Logo */}
        <div className="space-y-6">
          <Link href="/" className="inline-block bg-white p-2 rounded-xl"> 
            {/* Added a small white background & padding to make the logo pop */}
            <Image 
              src="/logo.jpg" 
              alt="QickTick Logo" 
              width={140} 
              height={50} 
              className="object-contain" // REMOVED the filters here
            />
          </Link>
   
          <p className="text-sm leading-relaxed text-slate-400 max-w-xs">
            Bringing trusted services to your doorstep. The ultimate platform for local business discovery and professional networking.
          </p>
          <div className="flex gap-4">
            <a href="#" className="p-2 bg-slate-800 rounded-lg hover:bg-yellow-500 hover:text-slate-900 transition-all">
              <Instagram size={20} />
            </a>
            <a href="#" className="p-2 bg-slate-800 rounded-lg hover:bg-yellow-500 hover:text-slate-900 transition-all">
              <Facebook size={20} />
            </a>
            <a href="#" className="p-2 bg-slate-800 rounded-lg hover:bg-yellow-500 hover:text-slate-900 transition-all">
              <Twitter size={20} />
            </a>
          </div>
        </div>

        {/* Column 2: Quick Links */}
        <div>
          <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
            Quick Links
          </h3>
          <ul className="space-y-4 text-sm font-medium">
            <li><Link href="/" className="hover:text-yellow-500 transition-colors">Home</Link></li>
            <li><Link href="/user/listing" className="hover:text-yellow-500 transition-colors">Categories</Link></li>
            <li><Link href="/about" className="hover:text-yellow-500 transition-colors">About QickTick</Link></li>
            <li><Link href="/user/add-business" className="hover:text-yellow-500 transition-colors text-yellow-500">Add Your Business</Link></li>
          </ul>
        </div>

        {/* Column 3: Support */}
        <div>
          <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
            Support
          </h3>
          <ul className="space-y-4 text-sm font-medium">
            <li><Link href="/contact" className="hover:text-yellow-500 transition-colors">Contact Support</Link></li>
            <li><Link href="/faq" className="hover:text-yellow-500 transition-colors">Help Center / FAQ</Link></li>
            <li><Link href="/privacy" className="hover:text-yellow-500 transition-colors">Privacy Policy</Link></li>
            <li><Link href="/terms" className="hover:text-yellow-500 transition-colors">Terms of Service</Link></li>
          </ul>
        </div>

        {/* Column 4: Get in Touch */}
        <div>
          <h3 className="text-white font-bold text-lg mb-6 flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-yellow-500 rounded-full"></span>
            Contact Info
          </h3>
          <ul className="space-y-4 text-sm">
            <li className="flex items-start gap-3">
              <Mail className="text-yellow-500 mt-1" size={18} />
              <span>support@qicktick.com</span>
            </li>
            <li className="flex items-start gap-3">
              <Phone className="text-yellow-500 mt-1" size={18} />
              <span>+91 98765 43210</span>
            </li>
            <li className="flex items-start gap-3">
              <MapPin className="text-yellow-500 mt-1" size={18} />
              <span>Main Business Hub, City Plaza,<br />India</span>
            </li>
          </ul>
        </div>

      </div>

      {/* Bottom Bar */}
      <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-slate-800/60">
        <div className="flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-xs text-slate-500 font-medium">
            © {new Date().getFullYear()} <span className="text-slate-300">QickTick India Pvt Ltd.</span> All rights reserved.
          </p>
          <div className="flex gap-6 text-xs text-slate-500 font-medium">
            <Link href="/privacy" className="hover:text-white transition-colors">Privacy</Link>
            <Link href="/terms" className="hover:text-white transition-colors">Terms</Link>
            <Link href="/cookies" className="hover:text-white transition-colors">Cookies</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
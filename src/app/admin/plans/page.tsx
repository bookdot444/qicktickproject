"use client";

import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabaseClient";
import { 
  Trash2, Plus, CheckCircle2, ShieldCheck, 
  Edit3, X, RefreshCw, AlertCircle, Zap, Search
} from "lucide-react";

export default function AdminPlansPage() {
    const [plans, setPlans] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editingId, setEditingId] = useState<number | null>(null);
    const [saving, setSaving] = useState(false);
    const [toast, setToast] = useState<{ msg: string; type: 'success' | 'error' } | null>(null);
    const [showModal, setShowModal] = useState(false);
    
    // --- SEARCH STATE ---
    const [searchTerm, setSearchTerm] = useState("");

    const [form, setForm] = useState({
        name: "",
        base_price: "",
        tax_percent: "",
        duration_months: "",
        color: "#e11d48",
        medals: "",
    });
    const [benefits, setBenefits] = useState<string[]>([""]);

    useEffect(() => {
        fetchPlans();
    }, []);

    const showToast = (msg: string, type: 'success' | 'error') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    const fetchPlans = async () => {
        setLoading(true);
        const { data, error } = await supabase.from("subscription_plans").select("*");

        if (error) {
            showToast(error.message, 'error');
            setLoading(false);
            return;
        }

        const sortedData = (data || []).sort((a, b) => {
            const totalA = a.base_price * (1 + (a.tax_percent || 0) / 100);
            const totalB = b.base_price * (1 + (b.tax_percent || 0) / 100);
            return totalA - totalB;
        });

        setPlans(sortedData);
        setLoading(false);
    };

    const handleEditClick = (plan: any) => {
        setEditingId(plan.id);
        setForm({
            name: plan.name,
            base_price: plan.base_price.toString(),
            tax_percent: plan.tax_percent.toString(),
            duration_months: plan.duration_months.toString(),
            color: plan.color || "#e11d48",
            medals: plan.medals || "",
        });
        setBenefits(plan.benefits && plan.benefits.length > 0 ? plan.benefits : [""]);
        setShowModal(true);
    };

    const resetForm = () => {
        setEditingId(null);
        setForm({ 
            name: "", 
            base_price: "", 
            tax_percent: "", 
            duration_months: "", 
            color: "#e11d48", 
            medals: "" 
        });
        setBenefits([""]);
        setShowModal(false);
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();
        const filteredBenefits = benefits.filter((b) => b.trim() !== "");
        
        if (!form.name.trim() || !form.base_price || !form.duration_months || filteredBenefits.length === 0) {
            showToast("Required fields missing", "error");
            return;
        }

        setSaving(true);
        const payload = {
            name: form.name.trim(),
            base_price: Number(form.base_price),
            tax_percent: Number(form.tax_percent || 0),
            duration_months: Number(form.duration_months),
            color: form.color,
            benefits: filteredBenefits,
            medals: form.medals.trim(),
        };

        const { error } = editingId 
            ? await supabase.from("subscription_plans").update(payload).eq("id", editingId)
            : await supabase.from("subscription_plans").insert(payload);

        if (error) {
            showToast(error.message, "error");
        } else {
            showToast(`Plan ${editingId ? 'updated' : 'deployed'} successfully`, "success");
            resetForm();
            fetchPlans();
        }
        setSaving(false);
    };

    const handleDeletePlan = async (planId: number) => {
        if (!confirm("Are you sure?")) return;
        const { error } = await supabase.from("subscription_plans").delete().eq("id", planId);
        if (error) showToast(error.message, "error");
        else { showToast("Plan deleted", "success"); fetchPlans(); }
    };

    const filteredPlans = plans.filter(plan => 
        plan.name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="min-h-screen bg-[#f8fafc] font-sans pb-20 text-slate-900">
            {/* TOAST SYSTEM */}
            {toast && (
                <div className={`fixed top-6 right-6 z-[200] flex items-center gap-3 px-6 py-3 rounded-xl shadow-2xl border animate-in fade-in slide-in-from-top-4 ${toast.type === 'success' ? 'bg-white border-yellow-400 text-slate-800' : 'bg-red-600 border-red-700 text-white'}`}>
                    {toast.type === 'success' ? <CheckCircle2 className="text-yellow-500" size={20} /> : <AlertCircle size={20} />}
                    <span className="text-sm font-bold uppercase tracking-tight">{toast.msg}</span>
                </div>
            )}

            {/* --- MASTER YELLOW BANNER --- */}
            <div className="bg-yellow-300 pt-10 pb-28 px-6 md:px-10 rounded-b-[3rem] shadow-lg relative overflow-hidden">
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <ShieldCheck className="text-[#e11d48]" size={20} />
                                <span className="text-red-900/60 text-[10px] font-black uppercase tracking-[0.3em]">Billing Engine</span>
                            </div>
                            <h1 className="text-4xl md:text-6xl font-black text-black uppercase italic tracking-tighter">
                                Subscription <span className="text-[#e11d48]">Plans</span>
                            </h1>
                        </div>
                        <div className="bg-white/40 backdrop-blur-md p-5 rounded-[2rem] border border-white/50 text-center shadow-sm">
                            <p className="text-red-900 text-[9px] font-black uppercase mb-1">Total Tiers</p>
                            <p className="text-3xl font-black text-[#e11d48]">{plans.length}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* --- ACTION BAR --- */}
            <div className="max-w-7xl mx-auto px-6 md:px-10 -mt-10 relative z-30">
                <div className="bg-white p-4 rounded-[2.5rem] shadow-2xl flex flex-col md:flex-row gap-4 items-center border border-slate-100">
                    <div className="relative flex-1 w-full group">
                        <Search className={`absolute left-5 top-1/2 -translate-y-1/2 transition-colors ${searchTerm ? 'text-[#e11d48]' : 'text-slate-400'}`} size={20} />
                        <input 
                            type="text" 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            placeholder="Search plans by name..." 
                            className="w-full pl-14 pr-6 py-4 bg-slate-50 rounded-[1.5rem] outline-none text-sm font-bold text-slate-900 border border-transparent focus:border-yellow-400 focus:bg-white transition-all hover:bg-slate-100 placeholder:text-slate-400 shadow-inner" 
                        />
                        {searchTerm && (
                            <button onClick={() => setSearchTerm("")} className="absolute right-4 top-1/2 -translate-y-1/2 p-1 hover:bg-slate-200 rounded-full text-slate-400">
                                <X size={16} />
                            </button>
                        )}
                    </div>
                    <button onClick={() => { resetForm(); setShowModal(true); }} className="w-full md:w-auto bg-[#e11d48] hover:bg-black text-white px-10 py-4 rounded-[1.5rem] text-xs font-black uppercase tracking-widest flex items-center justify-center gap-3 transition-all shadow-xl active:scale-95">
                        <Plus size={18} strokeWidth={3} /> Create New Plan
                    </button>
                </div>
            </div>

            {/* --- PLANS GRID --- */}
            <div className="max-w-7xl mx-auto px-6 md:px-10 mt-16">
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-24 gap-4">
                        <RefreshCw className="animate-spin text-[#e11d48]" size={48} />
                        <p className="text-slate-400 font-black uppercase text-[10px] tracking-[0.2em]">Synchronizing Tiers</p>
                    </div>
                ) : filteredPlans.length === 0 ? (
                    <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[3rem] border-2 border-dashed border-slate-200">
                        <Search size={40} className="text-slate-200 mb-4" />
                        <p className="text-slate-500 font-bold">No plans found matching "{searchTerm}"</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
                        {filteredPlans.map((plan) => {
                            const total = plan.base_price * (1 + (plan.tax_percent || 0) / 100);
                            return (
                                <div key={plan.id} className="bg-white rounded-[2.5rem] border border-slate-200 overflow-hidden hover:shadow-2xl transition-all group flex flex-col relative">
                                    <div className="h-3 w-full" style={{ backgroundColor: plan.color || '#e11d48' }} />
                                    <div className="p-8">
                                        <div className="flex justify-between items-start mb-6">
                                            <div>
                                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Plan Name</p>
                                                <h3 className="font-black text-slate-900 uppercase italic text-2xl tracking-tight leading-none flex items-center gap-2">
                                                    {plan.name} 
                                                    {plan.medals && <span className="not-italic">{plan.medals}</span>}
                                                </h3>
                                            </div>
                                            <div className="bg-slate-50 p-2 rounded-2xl">
                                                <Zap size={20} style={{ color: plan.color }} fill="currentColor" />
                                            </div>
                                        </div>

                                        <div className="mb-8">
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-4xl font-black text-black">₹{total.toFixed(0)}</span>
                                                <span className="text-slate-400 text-xs font-bold uppercase">/ {plan.duration_months}mo</span>
                                            </div>
                                            <p className="text-[9px] font-bold text-slate-400 uppercase mt-1">Includes {plan.tax_percent}% Tax</p>
                                        </div>

                                        <div className="space-y-3 pb-8">
                                            {plan.benefits?.map((b: string, idx: number) => (
                                                <div key={idx} className="flex items-center gap-3">
                                                    <CheckCircle2 size={16} className="text-green-500" />
                                                    <span className="text-xs font-bold text-slate-600 uppercase tracking-tight">{b}</span>
                                                </div>
                                            ))}
                                        </div>

                                        <div className="flex gap-3 pt-6 border-t border-slate-50">
                                            <button onClick={() => handleEditClick(plan)} className="flex-1 flex items-center justify-center gap-2 py-3.5 bg-slate-50 hover:bg-yellow-300 text-slate-500 hover:text-black rounded-[1.25rem] text-[10px] font-black uppercase transition-all shadow-sm">
                                                <Edit3 size={14} /> Edit
                                            </button>
                                            <button onClick={() => handleDeletePlan(plan.id)} className="w-14 flex items-center justify-center py-3.5 bg-slate-50 hover:bg-red-600 text-slate-400 hover:text-white rounded-[1.25rem] transition-all shadow-sm">
                                                <Trash2 size={18} />
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
{/* --- UPDATED HORIZONTAL DESIGN FORM MODAL --- */}
{showModal && (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-md overflow-y-auto">
        <div className="bg-white w-full max-w-5xl rounded-[3.5rem] shadow-2xl overflow-hidden border border-slate-200 my-8 animate-in zoom-in-95 duration-300">
            
            {/* Header - Sleeker & Integrated */}
            <div className="bg-yellow-300 px-10 py-8 flex items-center justify-between border-b border-yellow-400/50">
                <div className="flex items-center gap-4">
                    <div className="w-14 h-14 bg-black rounded-3xl flex items-center justify-center shadow-lg rotate-3">
                        <Zap className="text-yellow-300" size={28} fill="currentColor" />
                    </div>
                    <div>
                        <p className="text-red-900/60 text-[10px] font-black uppercase tracking-[0.2em] mb-0.5">Configuration Suite</p>
                        <h3 className="text-3xl font-black text-black uppercase italic tracking-tighter leading-none">
                            {editingId ? "Modify" : "Engineer"} <span className="text-[#e11d48]">Tier</span>
                        </h3>
                    </div>
                </div>
                <button 
                    onClick={resetForm} 
                    className="w-14 h-14 bg-white/50 hover:bg-black hover:text-white rounded-full flex items-center justify-center text-black transition-all shadow-sm border border-black/5"
                >
                    <X size={24} strokeWidth={3} />
                </button>
            </div>
            
            <form onSubmit={handleSave} className="flex flex-col md:flex-row divide-x divide-slate-100">
                
                {/* LEFT COLUMN: Primary Specs */}
                <div className="flex-1 p-10 space-y-8 bg-slate-50/50">
                    <div className="flex items-center gap-2 mb-2">
                        <div className="w-1.5 h-4 bg-[#e11d48] rounded-full" />
                        <h4 className="text-xs font-black uppercase tracking-widest text-slate-800">Identity & Pricing</h4>
                    </div>

                    <div className="grid grid-cols-1 gap-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Display Name</label>
                            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="w-full px-6 py-4 bg-white border border-slate-200 rounded-[1.25rem] focus:ring-4 focus:ring-yellow-400/20 focus:border-yellow-400 outline-none text-sm font-bold text-slate-900 transition-all shadow-sm" placeholder="e.g. ULTIMATE PRO" />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Base (₹)</label>
                                <input required type="number" value={form.base_price} onChange={(e) => setForm({ ...form, base_price: e.target.value })} className="w-full px-6 py-4 bg-white border border-slate-200 rounded-[1.25rem] outline-none text-sm font-bold text-slate-900 shadow-sm" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Duration (Mo)</label>
                                <input required type="number" value={form.duration_months} onChange={(e) => setForm({ ...form, duration_months: e.target.value })} className="w-full px-6 py-4 bg-white border border-slate-200 rounded-[1.25rem] outline-none text-sm font-bold text-slate-900 shadow-sm" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Tax (%)</label>
                                <input type="number" value={form.tax_percent} onChange={(e) => setForm({ ...form, tax_percent: e.target.value })} className="w-full px-6 py-4 bg-white border border-slate-200 rounded-[1.25rem] outline-none text-sm font-bold text-slate-900 shadow-sm" />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Icon/Medal</label>
                                <input value={form.medals} onChange={(e) => setForm({ ...form, medals: e.target.value })} className="w-full px-6 py-4 bg-white border border-slate-200 rounded-[1.25rem] outline-none text-sm font-bold text-slate-900 shadow-sm text-center" placeholder="💎" />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-slate-400 tracking-widest ml-1">Accent Theme</label>
                            <div className="flex items-center gap-4 bg-white p-3 rounded-[1.25rem] border border-slate-200 shadow-sm">
                                <input type="color" value={form.color} onChange={(e) => setForm({ ...form, color: e.target.value })} className="w-12 h-10 rounded-lg cursor-pointer border-none" />
                                <span className="text-xs font-mono font-black text-slate-600 tracking-tighter">{form.color.toUpperCase()}</span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RIGHT COLUMN: Benefits & Submission */}
                <div className="flex-1 p-10 flex flex-col">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-4 bg-green-500 rounded-full" />
                            <h4 className="text-xs font-black uppercase tracking-widest text-slate-800">Feature Roadmap</h4>
                        </div>
                        <button type="button" onClick={() => setBenefits([...benefits, ""])} className="bg-black text-white px-4 py-2 rounded-full text-[9px] font-black uppercase tracking-wider flex items-center gap-2 hover:scale-105 transition-transform active:scale-95">
                            <Plus size={14} strokeWidth={3} /> Add Perk
                        </button>
                    </div>

                    <div className="flex-1 space-y-3 max-h-[320px] overflow-y-auto pr-4 custom-scrollbar">
                        {benefits.map((b, idx) => (
                            <div key={idx} className="group flex gap-3 animate-in slide-in-from-right-4 duration-300">
                                <div className="flex-1 relative">
                                    <CheckCircle2 className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-300 group-focus-within:text-green-500 transition-colors" size={16} />
                                    <input required placeholder="Benefit description..." value={b} onChange={(e) => {
                                        const updated = [...benefits];
                                        updated[idx] = e.target.value;
                                        setBenefits(updated);
                                    }} className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl outline-none text-xs font-bold text-slate-900 placeholder:text-slate-400 focus:bg-white focus:border-slate-200 transition-all" />
                                </div>
                                <button type="button" onClick={() => setBenefits(benefits.filter((_, i) => i !== idx))} className="w-12 bg-red-50 text-red-400 hover:bg-red-500 hover:text-white rounded-2xl flex items-center justify-center transition-all opacity-0 group-hover:opacity-100 shadow-sm">
                                    <Trash2 size={16} />
                                </button>
                            </div>
                        ))}
                    </div>

                    {/* Final Actions */}
                    <div className="pt-10 mt-auto flex gap-4">
                        <button type="button" onClick={resetForm} className="flex-1 py-5 text-[10px] font-black uppercase text-slate-400 hover:text-slate-600 tracking-widest transition-colors">
                            Discard
                        </button>
                        <button type="submit" disabled={saving} className="flex-[2] py-5 bg-[#e11d48] text-white text-[11px] font-black uppercase tracking-[0.2em] rounded-[1.5rem] hover:bg-black transition-all flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(225,29,72,0.3)] active:scale-95 disabled:opacity-70">
                            {saving ? <RefreshCw className="animate-spin" size={20} /> : (editingId ? <RefreshCw size={20} /> : <ShieldCheck size={20} />)}
                            {editingId ? "Update System" : "Deploy Tier"}
                        </button>
                    </div>
                </div>
            </form>
        </div>
    </div>
)}
        </div>
    );
}
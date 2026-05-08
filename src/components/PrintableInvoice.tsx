import React from "react";

export const PrintableInvoice = ({ order, vendorProfile }: any) => {
  return (
    <div className="bg-white text-slate-900 p-[15mm] font-sans print:p-0" style={{ width: '210mm', minHeight: '297mm' }}>
      {/* Aesthetic Top Bar */}
      <div className="h-2 w-full bg-slate-900 mb-8" />

      {/* Header Section */}
      <div className="flex justify-between items-start mb-12">
        <div>
          <h1 className="text-4xl font-black tracking-tighter uppercase mb-1">Invoice</h1>
          <p className="text-sm font-medium text-slate-500">#{order.id.slice(0, 8).toUpperCase()}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-bold uppercase tracking-widest text-slate-400">Date Issued</p>
          <p className="text-lg font-black italic">{new Date(order.created_at).toLocaleDateString('en-GB', { day: '2-digit', month: 'short', year: 'numeric' })}</p>
        </div>
      </div>

      {/* Info Grid */}
      <div className="grid grid-cols-2 gap-16 mb-12 pb-12 border-b border-slate-100">
        {/* Vendor Side */}
        <div>
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Sold By</h2>
          <p className="text-lg font-black uppercase mb-1">{vendorProfile?.company_name}</p>
          <p className="text-xs text-slate-600 leading-relaxed max-w-[280px]">
            {vendorProfile?.address}
          </p>
          {vendorProfile?.gstin && (
             <p className="text-[10px] font-bold mt-2">GSTIN: <span className="font-normal">{vendorProfile.gstin}</span></p>
          )}
        </div>

        {/* Customer Side */}
        <div className="bg-slate-50 p-6 rounded-2xl">
          <h2 className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 mb-4">Ship To</h2>
          <p className="text-lg font-black uppercase mb-1">{order.address?.name}</p>
          <p className="text-xs text-slate-600 leading-relaxed uppercase">
            {order.address?.address}<br />
            {order.address?.city}, {order.address?.state} - {order.address?.pincode}
          </p>
          <div className="mt-4 pt-4 border-t border-slate-200 flex justify-between items-center">
            <p className="text-[10px] font-black uppercase">Contact</p>
            <p className="text-xs font-bold">{order.address?.phone}</p>
          </div>
        </div>
      </div>

      {/* Items Table */}
      <div className="mb-12">
        <table className="w-full">
          <thead>
            <tr className="text-[10px] font-black uppercase tracking-widest text-slate-400 border-b-2 border-slate-900">
              <th className="text-left py-4 px-2">Item Details</th>
              <th className="text-center py-4">Rate</th>
              <th className="text-center py-4">Qty</th>
              <th className="text-right py-4 px-2">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {order.items.map((item: any, i: number) => (
              <tr key={i} className="group">
                <td className="py-6 px-2">
                  <p className="text-sm font-black uppercase mb-0.5">{item.product?.product_name}</p>
                  <p className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">SKU: {item.id.slice(0, 8).toUpperCase()}</p>
                </td>
                <td className="py-6 text-center text-sm font-medium text-slate-600">₹{item.product?.price.toLocaleString()}</td>
                <td className="py-6 text-center text-sm font-black italic">{item.quantity}</td>
                <td className="py-6 px-2 text-right text-sm font-black italic">₹{(item.quantity * item.product?.price).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Summary Section */}
      <div className="flex justify-between items-start">
        <div className="max-w-[300px]">
          <p className="text-[10px] font-black uppercase text-slate-400 mb-2 tracking-widest">Payment Method</p>
          <p className="text-xs font-bold uppercase mb-4">{order.payment_method || 'Online / Prepaid'}</p>
          <div className="p-4 border border-dashed border-slate-200 rounded-lg">
            <p className="text-[9px] text-slate-400 leading-relaxed uppercase">
              Please note: This invoice is a legal record of purchase. For returns or support, please quote the Invoice ID shown above.
            </p>
          </div>
        </div>

        <div className="w-72 bg-slate-900 text-white p-8 rounded-3xl relative overflow-hidden">
          {/* Subtle decoration */}
          <div className="absolute top-0 right-0 w-24 h-24 bg-white/5 -mr-8 -mt-8 rounded-full" />
          
          <div className="space-y-3 relative z-10">
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <span>Subtotal</span>
              <span>₹{order.vendor_share.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-[10px] font-bold uppercase tracking-widest text-slate-400">
              <span>Shipping</span>
              <span>₹0.00</span>
            </div>
            <div className="h-px bg-white/10 my-2" />
            <div className="flex justify-between items-end pt-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-yellow-400">Total Payable</span>
              <span className="text-3xl font-black italic">₹{order.vendor_share.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Professional Footer */}
      <div className="mt-24 pt-8 border-t border-slate-100 flex justify-between items-center text-[9px] font-bold text-slate-400 uppercase tracking-[0.2em]">
        <span>Generative AI System Verified</span>
        <span>Authorized Vendor Invoice</span>
        <span>Page 01 of 01</span>
      </div>
    </div>
  );
};
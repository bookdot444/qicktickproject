import React from "react";
import { ShieldCheck, MapPin, Phone, Printer } from "lucide-react";

interface InvoiceProps {
  order: any;
  vendorProfile: any;
}

export const VendorInvoice = ({ order, vendorProfile }: InvoiceProps) => {
  return (
    /* This wrapper handles the 'Screen vs Paper' difference */
    <div className="invoice-wrapper">
      <style jsx>{`
        /* SCREEN STYLES: Keep the cool design you liked */
        .invoice-container {
          background: white;
          border: 3px solid black;
          padding: 3rem;
          position: relative;
          overflow: hidden;
        }
        .accent-box {
          position: absolute;
          top: 0; right: 0;
          width: 8rem; height: 8rem;
          background: #facc15;
          margin-right: -4rem; margin-top: -4rem;
          transform: rotate(45deg);
        }

        /* PRINT STYLES: Force A4 format */
        @media print {
          .invoice-container {
            border: 1px solid #eee !important;
            padding: 20mm !important;
            width: 210mm !important;
            height: 297mm !important;
            position: static !important;
          }
          .accent-box { display: none; }
          .invoice-wrapper { margin: 0; padding: 0; }
        }
      `}</style>

      <div className="invoice-container">
        <div className="accent-box" />

        {/* Header */}
        <div className="flex justify-between items-start mb-12">
          <div>
            <h1 className="text-5xl font-black italic uppercase tracking-tighter mb-2">Invoice</h1>
            <div className="flex items-center gap-2 bg-black text-white px-3 py-1 rounded-full w-fit">
              <ShieldCheck size={14} className="text-yellow-400" />
              <span className="text-[10px] font-black uppercase tracking-widest">Verified Vendor</span>
            </div>
          </div>
          <div className="text-right">
            <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest">Reference</p>
            <p className="text-xl font-black uppercase italic">#{order.id.slice(0, 10)}</p>
            <p className="text-sm font-bold uppercase mt-1">{new Date(order.created_at).toLocaleDateString()}</p>
          </div>
        </div>

        {/* Info Grid */}
        <div className="grid grid-cols-2 gap-10 mb-12">
          <div>
            <p className="text-[10px] font-black uppercase text-yellow-500 mb-4 tracking-widest">From</p>
            <h3 className="text-xl font-black uppercase leading-tight">{vendorProfile?.company_name}</h3>
            <p className="text-xs font-bold text-gray-500 uppercase mt-2 leading-relaxed">
              {vendorProfile?.address}
            </p>
          </div>
          <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
            <p className="text-[10px] font-black uppercase text-gray-400 mb-4 tracking-widest">Ship To</p>
            <h3 className="text-lg font-black uppercase">{order.address?.name}</h3>
            <p className="text-xs font-bold text-gray-700 uppercase leading-relaxed mt-1">
              {order.address?.address}, {order.address?.city}<br/>
              {order.address?.state} - {order.address?.pincode}
            </p>
          </div>
        </div>

        {/* Items Table */}
        <table className="w-full mb-10">
          <thead>
            <tr className="border-b-4 border-black text-left">
              <th className="py-4 text-[10px] font-black uppercase italic">Item Detail</th>
              <th className="py-4 text-center text-[10px] font-black uppercase italic">Qty</th>
              <th className="py-4 text-right text-[10px] font-black uppercase italic">Total</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {order.items.map((item: any, i: number) => (
              <tr key={i}>
                <td className="py-5">
                  <p className="font-black uppercase text-sm">{item.product?.product_name}</p>
                  <p className="text-[9px] text-gray-400 font-bold uppercase mt-1">Vendor SKU: {item.product?.id.slice(0,5)}</p>
                </td>
                <td className="py-5 text-center font-bold text-sm italic">0{item.quantity}</td>
                <td className="py-5 text-right font-black text-sm italic">₹{(item.quantity * item.product?.price).toLocaleString()}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Summary */}
        <div className="flex justify-end pt-6 border-t-2 border-dashed border-gray-200">
          <div className="w-64 bg-black text-white p-5 rounded-2xl">
            <div className="flex justify-between items-center">
              <span className="text-[10px] font-black uppercase tracking-tighter">Net Total</span>
              <span className="text-2xl font-black italic tracking-tighter">₹{order.vendor_share.toLocaleString()}</span>
            </div>
          </div>
        </div>

        {/* Print Only Footer */}
        <div className="hidden print:block mt-20 text-center border-t pt-8">
          <p className="text-[10px] font-black text-gray-300 uppercase tracking-[0.4em]">
            Official Packing Slip • {vendorProfile?.company_name}
          </p>
        </div>
      </div>
    </div>
  );
};
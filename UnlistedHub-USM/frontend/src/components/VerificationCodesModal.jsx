import React from 'react';
import { X, Copy, CheckCircle, Phone, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const VerificationCodesModal = ({ deal, onClose }) => {
  if (!deal) return null;

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Code copied!');
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
        {/* Header */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 p-6 text-white text-center relative">
          <button 
            onClick={onClose}
            className="absolute top-4 right-4 text-white/80 hover:text-white hover:bg-white/20 rounded-full p-1 transition-colors"
          >
            <X size={20} />
          </button>
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 backdrop-blur-sm">
            <CheckCircle size={32} className="text-white" />
          </div>
          <h2 className="text-2xl font-bold mb-1">Deal Confirmed!</h2>
          <p className="text-green-100 text-sm">Transaction successfully initiated</p>
        </div>

        {/* Content */}
        <div className="p-6">
          <div className="text-center mb-6">
            <p className="text-gray-600 text-sm mb-1">You have successfully accepted the deal for</p>
            <p className="text-gray-900 font-bold text-lg">{deal.companyName || 'Shares'}</p>
          </div>

          <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 mb-6">
            <h3 className="text-blue-800 font-bold text-sm mb-3 flex items-center gap-2">
              <ShieldCheck size={16} />
              YOUR VERIFICATION CODES
            </h3>
            
            <div className="space-y-3">
              {/* My Code */}
              <div className="bg-white rounded-lg p-3 border border-blue-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">Your Code</p>
                  <p className="text-lg font-mono font-bold text-gray-900 tracking-widest">
                    {deal.buyerCode || deal.sellerCode || deal.myVerificationCode}
                  </p>
                  <p className="text-[10px] text-blue-600 mt-0.5">Share this with RM when they call</p>
                </div>
                <button 
                  onClick={() => copyToClipboard(deal.buyerCode || deal.sellerCode || deal.myVerificationCode)}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                >
                  <Copy size={18} />
                </button>
              </div>

              {/* RM Code */}
              <div className="bg-white rounded-lg p-3 border border-blue-100 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider">RM Code</p>
                  <p className="text-lg font-mono font-bold text-gray-900 tracking-widest">
                    {deal.rmCode || deal.rmVerificationCode}
                  </p>
                  <p className="text-[10px] text-blue-600 mt-0.5">Ask RM for this code to verify them</p>
                </div>
                <button 
                  onClick={() => copyToClipboard(deal.rmCode || deal.rmVerificationCode)}
                  className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 transition-colors"
                >
                  <Copy size={18} />
                </button>
              </div>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-purple-100 rounded-full flex items-center justify-center flex-shrink-0 text-purple-600">
                <Phone size={16} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-900">What happens next?</p>
                <p className="text-xs text-gray-600 mt-1">
                  A Company Representative (RM) will call you within 24 hours to verify the transaction and guide you through the transfer process.
                </p>
              </div>
            </div>
          </div>

          <button 
            onClick={onClose}
            className="w-full mt-8 bg-gray-900 text-white py-3 rounded-xl font-semibold hover:bg-gray-800 transition-colors"
          >
            Got it, I'll wait for the call
          </button>
        </div>
      </div>
    </div>
  );
};

export default VerificationCodesModal;

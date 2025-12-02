import React, { useState } from 'react';
import { X, IndianRupee } from 'lucide-react';

const SoldConfirmModal = ({ listing, onClose, onSubmit }) => {
  const [pricePerShare, setPricePerShare] = useState('');
  const [error, setError] = useState('');

  const submitSold = (e) => {
    e.preventDefault();
    const p = parseFloat(pricePerShare);
    if (!p || p <= 0) {
      setError('Please enter a valid price per share');
      return;
    }
    setError('');
    onSubmit({ pricePerShare: p });
  };

  return (
    <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4" onClick={onClose}>
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md" onClick={(e) => e.stopPropagation()}>
        <div className="p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-gray-900">Mark as Sold</h2>
            <button onClick={onClose} className="p-1.5 hover:bg-gray-100 rounded-lg">
              <X size={20} />
            </button>
          </div>

          <p className="text-sm text-gray-600 mb-3">
            Capture the price per share at which you sold this listing.
          </p>

          <form onSubmit={submitSold} className="space-y-3">
            <div className="relative">
              <IndianRupee className={`absolute left-3 top-1/2 -translate-y-1/2 ${pricePerShare ? 'text-emerald-600' : 'text-gray-400'}`} size={18} />
              <input
                type="text"
                inputMode="decimal"
                value={pricePerShare}
                onChange={(e) => {
                  const v = e.target.value.replace(/[^0-9.]/g, '');
                  setPricePerShare(v);
                }}
                placeholder="Price per share"
                className="w-full pl-9 pr-4 py-2.5 border-2 border-gray-200 rounded-xl focus:border-emerald-500 focus:ring-2 focus:ring-emerald-100 text-sm"
                required
              />
              {error && <p className="text-xs text-red-600 mt-1">{error}</p>}
            </div>

            <button type="submit" className="w-full py-2.5 bg-emerald-600 text-white font-bold text-sm rounded-xl hover:bg-emerald-700">
              Confirm Sold
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SoldConfirmModal;

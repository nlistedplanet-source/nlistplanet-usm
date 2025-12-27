import React, { useState, useEffect } from 'react';
import { X, Search, TrendingUp, Package, Info, IndianRupee } from 'lucide-react';
import { companiesAPI, listingsAPI } from '../utils/api';
import toast from 'react-hot-toast';

// Number to words converter
const numberToWords = (num) => {
  if (!num || num === 0) return 'Zero';
  
  const ones = ['', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine'];
  const tens = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];
  const teens = ['Ten', 'Eleven', 'Twelve', 'Thirteen', 'Fourteen', 'Fifteen', 'Sixteen', 'Seventeen', 'Eighteen', 'Nineteen'];
  
  const convertLessThanThousand = (n) => {
    if (n === 0) return '';
    if (n < 10) return ones[n];
    if (n < 20) return teens[n - 10];
    if (n < 100) return tens[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + ones[n % 10] : '');
    return ones[Math.floor(n / 100)] + ' Hundred' + (n % 100 !== 0 ? ' ' + convertLessThanThousand(n % 100) : '');
  };
  
  if (num < 1000) return convertLessThanThousand(num);
  if (num < 100000) return convertLessThanThousand(Math.floor(num / 1000)) + ' Thousand' + (num % 1000 !== 0 ? ' ' + convertLessThanThousand(num % 1000) : '');
  if (num < 10000000) return convertLessThanThousand(Math.floor(num / 100000)) + ' Lakh' + (num % 100000 !== 0 ? ' ' + numberToWords(num % 100000) : '');
  return convertLessThanThousand(Math.floor(num / 10000000)) + ' Crore' + (num % 10000000 !== 0 ? ' ' + numberToWords(num % 10000000) : '');
};

// Helper to safely get property value regardless of case (e.g., PAN, pan, Pan)
const getCaseInsensitive = (obj, key) => {
  if (!obj) return undefined;
  const lowerKey = key.toLowerCase();
  const foundKey = Object.keys(obj).find(k => k.toLowerCase() === lowerKey);
  return foundKey ? obj[foundKey] : undefined;
};

const CreateListingModal = ({ onClose, onSuccess }) => {
  const [step, setStep] = useState(1);
  const [type, setType] = useState('sell');
  const [companies, setCompanies] = useState([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(false);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [manualEntry, setManualEntry] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const [agreedToTerms, setAgreedToTerms] = useState(false);
  const [formData, setFormData] = useState({
    companyId: '',
    companyName: '',
    companyPan: '',
    companyISIN: '',
    companyCIN: '',
    companySegmentation: '',
    price: '',
    quantity: '',
    minLot: '1'
  });

  useEffect(() => {
    const loadCompanies = async () => {
      if (searchTerm.length > 0) {
        try {
          const response = await companiesAPI.getAll({ search: searchTerm, limit: 10 });
          setCompanies(response.data.data);
          setShowSuggestions(true);
        } catch (error) {
          console.error('Failed to fetch companies:', error);
          setCompanies([]);
        }
      } else {
        setCompanies([]);
        setShowSuggestions(false);
      }
    };

    const delayDebounce = setTimeout(() => {
      loadCompanies();
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [searchTerm]);

  const handleCompanySelect = (company) => {
    // Use helper to find fields regardless of casing (PAN, pan, Pan, etc.)
    const name = getCaseInsensitive(company, 'companyName') || getCaseInsensitive(company, 'name');
    const pan = getCaseInsensitive(company, 'pan');
    const isin = getCaseInsensitive(company, 'isin');
    const cin = getCaseInsensitive(company, 'cin');

    setFormData({
      ...formData,
      companyId: company._id,
      companyName: name || '',
      companyPan: pan ? pan.toUpperCase() : '',
      companyISIN: isin ? isin.toUpperCase() : '',
      companyCIN: cin ? cin.toUpperCase() : ''
    });
    setSearchTerm(name || '');
    setShowSuggestions(false);
    setManualEntry(false);
    setStep(2);
  };

  const handleManualEntry = () => {
    if (searchTerm.length > 0) {
      setFormData({
        ...formData,
        companyId: '', // No ID for manual entry
        companyName: searchTerm
      });
      setManualEntry(true);
      setShowSuggestions(false);
      setStep(2);
    } else {
      toast.error('Please enter company name');
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (!formData.companyName || !formData.price || !formData.quantity) {
      toast.error('Please fill all required fields');
      return;
    }

    if (!agreedToTerms) {
      toast.error('Please agree to Terms & Conditions');
      return;
    }

    // Show preview before final submission
    setShowPreview(true);
  };

  const handleConfirmSubmit = async () => {
    setLoading(true);
    try {
      const payload = {
        type,
        price: parseFloat(formData.price),
        quantity: parseInt(formData.quantity),
        minLot: parseInt(formData.minLot),
        companyPan: formData.companyPan,
        companyISIN: formData.companyISIN,
        companyCIN: formData.companyCIN,
        companySegmentation: formData.companySegmentation || null
      };

      // Add companyId if selected from database, otherwise add companyName for manual entry
      if (formData.companyId) {
        payload.companyId = formData.companyId;
      } else {
        payload.companyName = formData.companyName;
      }

      await listingsAPI.create(payload);
      
      // Close preview first
      setShowPreview(false);
      
      toast.success(`${type === 'sell' ? 'Sell post' : 'Buy request'} created successfully!`);
      
      // Then trigger callbacks
      if (onSuccess) {
        onSuccess();
      }
      if (onClose) {
        onClose();
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create listing');
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-gradient-to-b from-white via-white to-gray-50 rounded-3xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto border border-white/80" onClick={(e) => e.stopPropagation()}>
          <div className="p-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-indigo-600 bg-clip-text text-transparent">Create Listing</h2>
            <p className="text-sm text-gray-500 mt-1">Post your unlisted share offer</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-xl transition-colors"
          >
            <X size={24} className="text-gray-600" />
          </button>
        </div>

        {step === 1 && (
          <div className="space-y-6">
            {/* Type Selection */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3 tracking-wide">
                Listing Type
              </label>
              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={() => setType('sell')}
                  className={`py-5 px-6 rounded-2xl border-2 font-semibold transition-all duration-200 ${
                    type === 'sell'
                      ? 'border-emerald-500 bg-gradient-to-br from-emerald-50 to-teal-50 text-emerald-700 shadow-lg shadow-emerald-500/20 transform scale-105'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-emerald-300 hover:bg-emerald-50/50'
                  }`}
                >
                  <TrendingUp className="mx-auto mb-2 transition-transform" size={28} strokeWidth={2.5} />
                  <span className="text-lg">SELL Post</span>
                </button>
                <button
                  onClick={() => setType('buy')}
                  className={`py-5 px-6 rounded-2xl border-2 font-semibold transition-all duration-200 ${
                    type === 'buy'
                      ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-700 shadow-lg shadow-blue-500/20 transform scale-105'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300 hover:bg-blue-50/50'
                  }`}
                >
                  <Package className="mx-auto mb-2 transition-transform" size={28} strokeWidth={2.5} />
                  <span className="text-lg">BUY Request</span>
                </button>
              </div>
            </div>

            {/* Company Search */}
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-3 tracking-wide">
                Type Company Name
              </label>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} strokeWidth={2.5} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Start typing company name..."
                  className="w-full px-5 py-3 pl-12 border-2 border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-gray-50 placeholder-gray-400"
                  autoFocus
                />
              </div>
              <p className="text-xs text-gray-500 mt-2 flex items-center gap-1">
                <Info size={14} /> Select from suggestions or continue typing to add manually
              </p>
            </div>

            {/* Company Suggestions */}
            {showSuggestions && companies.length > 0 && (
              <div className="max-h-64 overflow-y-auto space-y-2 border-2 border-purple-200 rounded-2xl p-3 bg-purple-50/50 backdrop-blur-sm">
                <p className="text-xs font-bold text-purple-700 px-2 py-1 uppercase tracking-wider">Suggestions from database:</p>
                {companies.map((company) => (
                  <button
                    key={company._id}
                    onClick={() => handleCompanySelect(company)}
                    className="w-full flex items-center gap-3 p-3 bg-white hover:bg-purple-100/50 rounded-xl transition-all text-left border border-transparent hover:border-purple-300 shadow-sm hover:shadow-md"
                  >
                    {(company.Logo || company.logo) ? (
                      <img
                        src={company.Logo || company.logo}
                        alt={company.CompanyName || company.name}
                        className="w-12 h-12 rounded-lg object-cover ring-2 ring-gray-100"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center shadow-md">
                        <span className="text-white font-bold text-lg">
                          {(company.CompanyName || company.name)[0]}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900">{company.CompanyName || company.name}</h4>
                      <p className="text-sm text-gray-600 flex items-center gap-2">
                        {(company.scriptName || company.ScripName) && <span className="text-xs bg-purple-200 text-purple-700 px-2 py-0.5 rounded-full font-semibold">{company.scriptName || company.ScripName}</span>}
                        <span className="text-gray-500">{company.Sector || company.sector}</span>
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Manual Entry Option - Only show when no suggestions found */}
            {searchTerm.length > 0 && !showSuggestions && companies.length === 0 && (
              <div className="bg-gradient-to-br from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-xl p-3 shadow-sm">
                <p className="text-xs text-gray-700 mb-2">
                  Can't find <span className="font-bold text-blue-600">"{searchTerm}"</span>?
                </p>
                <button
                  type="button"
                  onClick={handleManualEntry}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-2.5 rounded-lg font-semibold hover:shadow-lg hover:shadow-blue-500/30 transition-all active:scale-95 text-sm border border-blue-700/30"
                >
                  Continue with "{searchTerm}"
                </button>
                <p className="text-xs text-gray-600 mt-2 text-center">
                  Add this company manually
                </p>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Selected Company Card */}
            <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl p-5 flex items-center gap-4 border border-purple-200/50">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-purple-400 to-indigo-500 flex items-center justify-center flex-shrink-0 shadow-md">
                <span className="text-white font-bold text-xl">
                  {formData.companyName[0]}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <h4 className="font-bold text-gray-900 text-lg">{formData.companyName}</h4>
                <p className="text-sm text-gray-600 flex items-center gap-2">
                  <span>{type === 'sell' ? '📤 Selling shares' : '📥 Buying shares'}</span>
                  {manualEntry && <span className="text-xs bg-blue-200 text-blue-700 px-2.5 py-1 rounded-full font-semibold">Manual Entry</span>}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setSearchTerm('');
                  setManualEntry(false);
                }}
                className="text-purple-600 text-sm font-bold hover:text-purple-700 hover:bg-white px-3 py-2 rounded-lg transition-all"
              >
                Change
              </button>
            </div>

            {/* Price Input */}
            <div className="relative">
              <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 text-purple-400 z-10" size={20} strokeWidth={2.5} />
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                onWheel={(e) => e.target.blur()}
                placeholder=" "
                className="peer w-full px-5 py-3 pl-12 pr-4 border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                required
                min="1"
                step="0.01"
              />
              <label className="absolute left-12 -top-3 text-xs text-gray-600 bg-white px-2 transition-all pointer-events-none peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:bg-transparent peer-focus:-top-3 peer-focus:text-xs peer-focus:text-purple-600 peer-focus:bg-white font-semibold">
                Price per Share
              </label>

              {formData.price && (
                <p className="text-xs font-bold text-purple-600 mt-2 ml-2 bg-purple-100 px-3 py-1.5 rounded-lg inline-block">
                  ₹ {numberToWords(parseFloat(formData.price))}
                </p>
              )}
            </div>

            {/* Quantity Input */}
            <div className="relative">
              <Package className="absolute left-4 top-1/2 -translate-y-1/2 text-indigo-400 z-10" size={20} strokeWidth={2.5} />
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                onWheel={(e) => e.target.blur()}
                placeholder=" "
                className="peer w-full px-5 py-3 pl-12 pr-4 border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                required
                min="1"
              />
              <label className="absolute left-12 -top-3 text-xs text-gray-600 bg-white px-2 transition-all pointer-events-none peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:bg-transparent peer-focus:-top-3 peer-focus:text-xs peer-focus:text-indigo-600 peer-focus:bg-white font-semibold">
                Quantity
              </label>
              {formData.quantity && (
                <p className="text-xs font-bold text-indigo-600 mt-2 ml-2 bg-indigo-100 px-3 py-1.5 rounded-lg inline-block">
                  📊 {numberToWords(parseInt(formData.quantity))} Shares
                </p>
              )}
            </div>

            {/* Min Lot Input */}
            <div className="relative">
              <input
                type="number"
                value={formData.minLot}
                onChange={(e) => setFormData({ ...formData, minLot: e.target.value })}
                onWheel={(e) => e.target.blur()}
                placeholder=" "
                className="peer w-full px-5 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all bg-white [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                min="1"
              />
              <label className="absolute left-4 -top-3 text-xs text-gray-600 bg-white px-2 transition-all pointer-events-none peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:bg-transparent peer-focus:-top-3 peer-focus:text-xs peer-focus:text-purple-600 peer-focus:bg-white font-semibold">
                Minimum Lot Size
              </label>
            </div>

            {/* Company Segmentation */}
            <div className="relative">
              <select
                value={formData.companySegmentation}
                onChange={(e) => setFormData({ ...formData, companySegmentation: e.target.value })}
                className="w-full px-5 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all appearance-none bg-white text-gray-700 font-medium"
              >
                <option value="">Select Company Segmentation</option>
                <option value="SME">SME</option>
                <option value="Mainboard">Mainboard</option>
                <option value="Unlisted">Unlisted</option>
                <option value="Pre-IPO">Pre-IPO</option>
                <option value="Startup">Startup</option>
              </select>
              <label className="absolute left-4 -top-3 text-xs text-gray-600 bg-white px-2 font-semibold">
                Company Segmentation
              </label>
            </div>

            {/* Company PAN */}
            <div className="relative">
              <input
                type="text"
                value={formData.companyPan}
                onChange={(e) => setFormData({ ...formData, companyPan: e.target.value.toUpperCase() })}
                placeholder=" "
                className="peer w-full px-5 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                maxLength="10"
              />
              <label className="absolute left-4 -top-3 text-xs text-gray-600 bg-white px-2 transition-all pointer-events-none peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:bg-transparent peer-focus:-top-3 peer-focus:text-xs peer-focus:text-purple-600 peer-focus:bg-white font-semibold">
                Company PAN
              </label>
            </div>

            {/* Company ISIN */}
            <div className="relative">
              <input
                type="text"
                value={formData.companyISIN}
                onChange={(e) => setFormData({ ...formData, companyISIN: e.target.value.toUpperCase() })}
                placeholder=" "
                className="peer w-full px-5 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                maxLength="12"
              />
              <label className="absolute left-4 -top-3 text-xs text-gray-600 bg-white px-2 transition-all pointer-events-none peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:bg-transparent peer-focus:-top-3 peer-focus:text-xs peer-focus:text-purple-600 peer-focus:bg-white font-semibold">
                Company ISIN No
              </label>
            </div>

            {/* Company CIN */}
            <div className="relative">
              <input
                type="text"
                value={formData.companyCIN}
                onChange={(e) => setFormData({ ...formData, companyCIN: e.target.value.toUpperCase() })}
                placeholder=" "
                className="peer w-full px-5 py-3 border-2 border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all"
                maxLength="21"
              />
              <label className="absolute left-4 -top-3 text-xs text-gray-600 bg-white px-2 transition-all pointer-events-none peer-placeholder-shown:top-4 peer-placeholder-shown:text-base peer-placeholder-shown:bg-transparent peer-focus:-top-3 peer-focus:text-xs peer-focus:text-purple-600 peer-focus:bg-white font-semibold">
                Company CIN Number
              </label>
            </div>

            {/* Terms & Conditions Checkbox */}
            <div className="flex items-start gap-3 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-2xl border border-purple-200/50">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-5 h-5 text-purple-600 border-purple-300 rounded-lg focus:ring-2 focus:ring-purple-500 cursor-pointer"
              />
              <label htmlFor="terms" className="text-sm text-gray-700 leading-relaxed font-medium">
                I agree to the <button type="button" className="text-purple-600 font-bold hover:text-purple-700 hover:underline">Terms & Conditions</button> and confirm that all information provided is accurate
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!agreedToTerms || loading}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-4 rounded-2xl font-bold hover:shadow-lg hover:shadow-purple-500/40 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 active:scale-95 border border-purple-700/30"
            >
              {loading ? (
                <>
                  <Loader size={20} className="animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <TrendingUp size={22} strokeWidth={2.5} />
                  Create Listing
                </>
              )}
            </button>
          </form>
        )}
          </div>
        </div>
      </div>

      {/* Preview Modal */}
      {showPreview && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setShowPreview(false)}>
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg" onClick={(e) => e.stopPropagation()}>
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Review Your Listing</h3>
                <p className="text-sm text-gray-600 mb-6">Please verify all details before posting</p>

                <div className="space-y-4 mb-6">
                  <div className="bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl p-4">
                    <p className="text-xs text-gray-600 mb-1">Company</p>
                    <p className="text-lg font-bold text-gray-900">{formData.companyName}</p>
                    {manualEntry && <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Manual Entry</span>}
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-600 mb-1">Type</p>
                      <p className={`font-bold ${type === 'sell' ? 'text-green-600' : 'text-blue-600'}`}>
                        {type === 'sell' ? 'SELL' : 'BUY'}
                      </p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-600 mb-1">Price per Share</p>
                      <p className="font-bold text-gray-900">₹{parseFloat(formData.price).toLocaleString('en-IN')}</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-600 mb-1">Quantity</p>
                      <p className="font-bold text-gray-900">{formData.quantity} shares</p>
                    </div>
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-600 mb-1">Min Lot</p>
                      <p className="font-bold text-gray-900">{formData.minLot}</p>
                    </div>
                  </div>

                  {(formData.companyPan || formData.companyISIN || formData.companyCIN) && (
                    <div className="bg-gray-50 rounded-xl p-3">
                      <p className="text-xs text-gray-600 mb-2">Company Details</p>
                      {formData.companyPan && <p className="text-sm text-gray-900">PAN: {formData.companyPan}</p>}
                      {formData.companyISIN && <p className="text-sm text-gray-900">ISIN: {formData.companyISIN}</p>}
                      {formData.companyCIN && <p className="text-sm text-gray-900">CIN: {formData.companyCIN}</p>}
                    </div>
                  )}

                  <div className="bg-blue-50 border border-blue-200 rounded-xl p-3">
                    <div className="flex justify-between items-center">
                      <span className="font-semibold text-gray-900">Total Value</span>
                      <span className="font-bold text-primary-600 text-lg">₹{(parseFloat(formData.price) * parseFloat(formData.quantity)).toLocaleString('en-IN')}</span>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setShowPreview(false)}
                    className="flex-1 bg-gray-200 text-gray-700 px-6 py-3 rounded-xl font-semibold hover:bg-gray-300 transition-all"
                  >
                    Edit
                  </button>
                  <button
                    onClick={handleConfirmSubmit}
                    disabled={loading}
                    className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {loading ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Creating...
                      </>
                    ) : (
                      <>
                        Confirm & Post
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}
    </>
  );
};

export default CreateListingModal;
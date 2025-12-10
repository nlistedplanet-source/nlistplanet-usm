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
    setFormData({
      ...formData,
      companyId: company._id,
      companyName: company.CompanyName || company.name,
      companyPan: company.PAN || company.pan || '',
      companyISIN: company.ISIN || company.isin || '',
      companyCIN: company.CIN || company.cin || ''
    });
    setSearchTerm(company.CompanyName || company.name);
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
      toast.success(`${type === 'sell' ? 'Sell post' : 'Buy request'} created successfully!`);
      onSuccess();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to create listing');
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={onClose}>
        <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
          <div className="p-6">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-2xl font-bold text-dark-900">Create Listing</h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-dark-100 rounded-lg transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {step === 1 && (
          <div className="space-y-4">
            {/* Type Selection */}
            <div>
              <label className="block text-sm font-semibold text-dark-700 mb-2">
                Listing Type
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  onClick={() => setType('sell')}
                  className={`py-4 px-6 rounded-xl border-2 font-semibold transition-all ${
                    type === 'sell'
                      ? 'border-green-500 bg-gradient-to-br from-green-50 to-emerald-50 text-green-700 shadow-md'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-green-300'
                  }`}
                >
                  <TrendingUp className="mx-auto mb-2" size={24} />
                  SELL Post
                </button>
                <button
                  onClick={() => setType('buy')}
                  className={`py-4 px-6 rounded-xl border-2 font-semibold transition-all ${
                    type === 'buy'
                      ? 'border-blue-500 bg-gradient-to-br from-blue-50 to-indigo-50 text-blue-700 shadow-md'
                      : 'border-gray-200 bg-white text-gray-600 hover:border-blue-300'
                  }`}
                >
                  <Package className="mx-auto mb-2" size={24} />
                  BUY Request
                </button>
              </div>
            </div>

            {/* Company Search */}
            <div>
              <label className="block text-sm font-semibold text-dark-700 mb-2">
                Type Company Name
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={20} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Start typing company name..."
                  className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                  autoFocus
                />
              </div>
              <p className="text-xs text-dark-500 mt-1">
                Select from suggestions or continue typing to add manually
              </p>
            </div>

            {/* Company Suggestions */}
            {showSuggestions && companies.length > 0 && (
              <div className="max-h-64 overflow-y-auto space-y-2 border-2 border-primary-200 rounded-xl p-2">
                <p className="text-xs font-semibold text-dark-600 px-2 py-1">Suggestions from database:</p>
                {companies.map((company) => (
                  <button
                    key={company._id}
                    onClick={() => handleCompanySelect(company)}
                    className="w-full flex items-center gap-3 p-3 bg-dark-50 hover:bg-primary-50 rounded-xl transition-all text-left touch-feedback"
                  >
                    {(company.Logo || company.logo) ? (
                      <img
                        src={company.Logo || company.logo}
                        alt={company.CompanyName || company.name}
                        className="w-12 h-12 rounded-lg object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
                        <span className="text-primary-700 font-bold text-lg">
                          {(company.CompanyName || company.name)[0]}
                        </span>
                      </div>
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-dark-900">{company.CompanyName || company.name}</h4>
                      <p className="text-sm text-dark-500 flex items-center gap-2">
                        {(company.scriptName || company.ScripName) && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">{company.scriptName || company.ScripName}</span>}
                        {company.Sector || company.sector}
                      </p>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {/* Manual Entry Option */}
            {searchTerm.length > 0 && (
              <div className="bg-blue-50 border-2 border-blue-200 rounded-xl p-4">
                <p className="text-sm text-dark-700 mb-3">
                  Can't find <span className="font-bold">"{searchTerm}"</span> in suggestions?
                </p>
                <button
                  type="button"
                  onClick={handleManualEntry}
                  className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 text-white px-4 py-3 rounded-xl font-semibold hover:shadow-lg transition-all"
                >
                  Continue with "{searchTerm}"
                </button>
                <p className="text-xs text-dark-500 mt-2 text-center">
                  You'll be able to list this company manually
                </p>
              </div>
            )}
          </div>
        )}

        {step === 2 && (
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Selected Company */}
            <div className="bg-primary-50 rounded-xl p-4 flex items-center gap-3">
              <div className="w-12 h-12 rounded-lg bg-primary-100 flex items-center justify-center">
                <span className="text-primary-700 font-bold text-lg">
                  {formData.companyName[0]}
                </span>
              </div>
              <div className="flex-1">
                <h4 className="font-semibold text-dark-900">{formData.companyName}</h4>
                <p className="text-sm text-dark-600">
                  {type === 'sell' ? 'Selling shares' : 'Buying shares'}
                  {manualEntry && <span className="ml-2 text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">Manual Entry</span>}
                </p>
              </div>
              <button
                type="button"
                onClick={() => {
                  setStep(1);
                  setSearchTerm('');
                  setManualEntry(false);
                }}
                className="text-primary-600 text-sm font-semibold"
              >
                Change
              </button>
            </div>

            {/* Price with Floating Label */}
            <div className="relative">
              <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={18} />
              <input
                type="number"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder=" "
                className="peer w-full px-4 py-3 pl-10 pr-10 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                required
                min="1"
                step="0.01"
              />
              <label className="absolute left-10 -top-2.5 text-xs text-gray-500 bg-white px-2 transition-all pointer-events-none peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-purple-600 peer-focus:bg-white">
                Price per Share
              </label>

              {formData.price && (
                <p className="text-sm font-semibold text-purple-600 mt-2 ml-1 bg-purple-50 px-3 py-1 rounded-lg inline-block">
                  ₹ {numberToWords(parseFloat(formData.price))} Rupees
                </p>
              )}
            </div>

            {/* Quantity with Floating Label */}
            <div className="relative">
              <Package className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 z-10" size={18} />
              <input
                type="number"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                placeholder=" "
                className="peer w-full px-4 py-3 pl-10 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                required
                min="1"
              />
              <label className="absolute left-10 -top-2.5 text-xs text-gray-500 bg-white px-2 transition-all pointer-events-none peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-purple-600 peer-focus:bg-white">
                Quantity
              </label>
              {formData.quantity && (
                <p className="text-sm font-semibold text-indigo-600 mt-2 ml-1 bg-indigo-50 px-3 py-1 rounded-lg inline-block">
                  📊 {numberToWords(parseInt(formData.quantity))} Shares
                </p>
              )}
            </div>

            {/* Min Lot with Floating Label */}
            <div className="relative">
              <input
                type="number"
                value={formData.minLot}
                onChange={(e) => setFormData({ ...formData, minLot: e.target.value })}
                placeholder=" "
                className="peer w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                min="1"
              />
              <label className="absolute left-4 -top-2.5 text-xs text-gray-500 bg-white px-2 transition-all pointer-events-none peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-purple-600 peer-focus:bg-white">
                Minimum Lot Size
              </label>
            </div>

            {/* Company Segmentation */}
            <div className="relative">
              <select
                value={formData.companySegmentation}
                onChange={(e) => setFormData({ ...formData, companySegmentation: e.target.value })}
                className="w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all appearance-none bg-white"
              >
                <option value="">Select Company Segmentation</option>
                <option value="SME">SME</option>
                <option value="Mainboard">Mainboard</option>
                <option value="Unlisted">Unlisted</option>
                <option value="Pre-IPO">Pre-IPO</option>
                <option value="Startup">Startup</option>
              </select>
              <label className="absolute left-4 -top-2.5 text-xs text-gray-500 bg-white px-2">
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
                className="peer w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                maxLength="10"
              />
              <label className="absolute left-4 -top-2.5 text-xs text-gray-500 bg-white px-2 transition-all pointer-events-none peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-purple-600 peer-focus:bg-white">
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
                className="peer w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                maxLength="12"
              />
              <label className="absolute left-4 -top-2.5 text-xs text-gray-500 bg-white px-2 transition-all pointer-events-none peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-purple-600 peer-focus:bg-white">
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
                className="peer w-full px-4 py-3 border-2 border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-purple-500 transition-all"
                maxLength="21"
              />
              <label className="absolute left-4 -top-2.5 text-xs text-gray-500 bg-white px-2 transition-all pointer-events-none peer-placeholder-shown:top-3 peer-placeholder-shown:text-base peer-placeholder-shown:bg-transparent peer-focus:-top-2.5 peer-focus:text-xs peer-focus:text-purple-600 peer-focus:bg-white">
                Company CIN Number
              </label>
            </div>

            {/* Terms & Conditions Checkbox */}
            <div className="flex items-start gap-3 p-4 bg-gray-50 rounded-xl">
              <input
                type="checkbox"
                id="terms"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-5 h-5 text-purple-600 border-gray-300 rounded focus:ring-2 focus:ring-purple-500"
              />
              <label htmlFor="terms" className="text-sm text-gray-700">
                I agree to the <button type="button" className="text-purple-600 font-semibold hover:underline">Terms & Conditions</button> and confirm that all information provided is accurate
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!agreedToTerms}
              className="w-full bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-6 py-3 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              <TrendingUp size={20} />
              Submit
            </button>
          </form>
        )}

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
          </div>
        </div>
      </div>
    </>
  );
};

export default CreateListingModal;
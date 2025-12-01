import React, { useState, useEffect } from 'react';
import { X, TrendingUp, TrendingDown, AlertCircle, Check } from 'lucide-react';
import { companiesAPI, listingsAPI } from '../../utils/api';
import { formatCurrency, calculatePlatformFee, haptic } from '../../utils/helpers';
import toast from 'react-hot-toast';

const CreateListingModal = ({ isOpen, onClose, onSuccess }) => {
  const [step, setStep] = useState(1); // 1: Type selection, 2: Form
  const [type, setType] = useState(''); // 'sell' or 'buy'
  const [companies, setCompanies] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [filteredCompanies, setFilteredCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [formData, setFormData] = useState({
    companyId: '',
    companyName: '',
    quantity: '',
    price: '',
    description: '',
  });

  useEffect(() => {
    if (isOpen) {
      fetchCompanies();
      // Reset form when modal opens
      setStep(1);
      setType('');
      setFormData({
        companyId: '',
        companyName: '',
        quantity: '',
        price: '',
        description: '',
      });
    }
  }, [isOpen]);

  useEffect(() => {
    if (searchQuery.trim()) {
      const filtered = companies.filter(company =>
        company.name.toLowerCase().includes(searchQuery.toLowerCase())
      );
      setFilteredCompanies(filtered);
    } else {
      setFilteredCompanies(companies);
    }
  }, [searchQuery, companies]);

  const fetchCompanies = async () => {
    try {
      const response = await companiesAPI.getAll();
      setCompanies(response.data.data || []);
      setFilteredCompanies(response.data.data || []);
    } catch (error) {
      console.error('Failed to fetch companies:', error);
    }
  };

  const handleTypeSelect = (selectedType) => {
    haptic.medium();
    setType(selectedType);
    setStep(2);
  };

  const handleCompanySelect = (company) => {
    haptic.light();
    setFormData({
      ...formData,
      companyId: company._id,
      companyName: company.name,
    });
    setSearchQuery('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.companyId || !formData.quantity || !formData.price) {
      toast.error('Please fill all required fields');
      return;
    }

    if (parseInt(formData.quantity) <= 0) {
      toast.error('Quantity must be greater than 0');
      return;
    }

    if (parseFloat(formData.price) <= 0) {
      toast.error('Price must be greater than 0');
      return;
    }

    try {
      setLoading(true);
      haptic.medium();

      const payload = {
        type,
        companyId: formData.companyId,
        quantity: parseInt(formData.quantity),
        price: parseFloat(formData.price),
        description: formData.description || '',
      };

      await listingsAPI.create(payload);
      
      haptic.success();
      toast.success(`${type === 'sell' ? 'Selling' : 'Buying'} post created successfully!`);
      onSuccess?.();
      onClose();
    } catch (error) {
      haptic.error();
      console.error('Failed to create listing:', error);
      toast.error(error.response?.data?.message || 'Failed to create post');
    } finally {
      setLoading(false);
    }
  };

  const platformFee = formData.price ? calculatePlatformFee(parseFloat(formData.price) * parseInt(formData.quantity || 1)) : 0;
  const totalAmount = formData.price && formData.quantity 
    ? parseFloat(formData.price) * parseInt(formData.quantity) 
    : 0;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-end animate-fade-in">
      <div className="bg-white rounded-t-3xl w-full max-h-[90vh] overflow-y-auto animate-slide-up pb-safe">
        {/* Header */}
        <div className="sticky top-0 bg-white border-b border-gray-100 px-6 py-4 flex items-center justify-between z-10">
          <h2 className="text-xl font-bold text-gray-900">
            {step === 1 ? 'Create New Post' : `Create ${type === 'sell' ? 'Sell' : 'Buy'} Post`}
          </h2>
          <button
            onClick={() => {
              haptic.light();
              onClose();
            }}
            className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center touch-feedback"
          >
            <X size={20} className="text-gray-600" />
          </button>
        </div>

        {/* Step 1: Type Selection */}
        {step === 1 && (
          <div className="p-6 space-y-4">
            <p className="text-gray-600 mb-6">What would you like to do?</p>
            
            <button
              onClick={() => handleTypeSelect('sell')}
              className="w-full bg-gradient-to-br from-red-50 to-red-100 border-2 border-red-200 rounded-2xl p-6 text-left touch-feedback active:scale-98 transition-transform"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-red-600 rounded-xl flex items-center justify-center">
                  <TrendingDown className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Sell Shares</h3>
                  <p className="text-sm text-gray-600">Post shares you want to sell</p>
                </div>
              </div>
            </button>

            <button
              onClick={() => handleTypeSelect('buy')}
              className="w-full bg-gradient-to-br from-green-50 to-green-100 border-2 border-green-200 rounded-2xl p-6 text-left touch-feedback active:scale-98 transition-transform"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-gray-900 mb-1">Buy Shares</h3>
                  <p className="text-sm text-gray-600">Post a request to buy shares</p>
                </div>
              </div>
            </button>
          </div>
        )}

        {/* Step 2: Form */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="p-6 space-y-6">
            {/* Company Selection */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Company <span className="text-red-500">*</span>
              </label>
              
              {!formData.companyId ? (
                <>
                  <input
                    type="text"
                    placeholder="Search company..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="input-field"
                  />
                  
                  {searchQuery && (
                    <div className="mt-2 max-h-60 overflow-y-auto bg-white border border-gray-200 rounded-xl">
                      {filteredCompanies.length > 0 ? (
                        filteredCompanies.map((company) => (
                          <button
                            key={company._id}
                            type="button"
                            onClick={() => handleCompanySelect(company)}
                            className="w-full px-4 py-3 text-left hover:bg-gray-50 border-b border-gray-100 last:border-0 touch-feedback"
                          >
                            <p className="font-semibold text-gray-900">{company.name}</p>
                            {company.industry && (
                              <p className="text-sm text-gray-500">{company.industry}</p>
                            )}
                          </button>
                        ))
                      ) : (
                        <div className="px-4 py-8 text-center text-gray-500">
                          No companies found
                        </div>
                      )}
                    </div>
                  )}
                </>
              ) : (
                <div className="flex items-center justify-between bg-primary-50 border-2 border-primary-200 rounded-xl p-4">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-primary-600 rounded-xl flex items-center justify-center">
                      <span className="text-white font-bold">{formData.companyName.charAt(0)}</span>
                    </div>
                    <p className="font-semibold text-gray-900">{formData.companyName}</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      haptic.light();
                      setFormData({ ...formData, companyId: '', companyName: '' });
                    }}
                    className="text-primary-600 font-semibold text-sm"
                  >
                    Change
                  </button>
                </div>
              )}
            </div>

            {/* Quantity */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Quantity (shares) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder="Enter quantity"
                value={formData.quantity}
                onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
                className="input-field"
                min="1"
                required
              />
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Price per share (₹) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                placeholder="Enter price"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                className="input-field"
                min="0"
                step="0.01"
                required
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">
                Description (Optional)
              </label>
              <textarea
                placeholder="Add any additional details..."
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field min-h-[100px] resize-none"
                rows={4}
              />
            </div>

            {/* Price Summary */}
            {totalAmount > 0 && (
              <div className="bg-gray-50 rounded-2xl p-4 space-y-2">
                <div className="flex items-center gap-2 text-primary-600 mb-3">
                  <AlertCircle size={18} />
                  <p className="text-sm font-semibold">Price Breakdown</p>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Base Amount</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(totalAmount)}</span>
                </div>
                
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Platform Fee (2%)</span>
                  <span className="font-semibold text-gray-900">{formatCurrency(platformFee)}</span>
                </div>
                
                <div className="border-t border-gray-200 pt-2 mt-2">
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900">
                      {type === 'sell' ? 'You will receive' : 'Total you will pay'}
                    </span>
                    <span className="font-bold text-primary-600 text-lg">
                      {type === 'sell' 
                        ? formatCurrency(totalAmount - platformFee)
                        : formatCurrency(totalAmount + platformFee)
                      }
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => {
                  haptic.light();
                  setStep(1);
                }}
                className="flex-1 btn-secondary"
                disabled={loading}
              >
                Back
              </button>
              <button
                type="submit"
                disabled={loading || !formData.companyId || !formData.quantity || !formData.price}
                className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <span className="flex items-center justify-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Creating...
                  </span>
                ) : (
                  <span className="flex items-center justify-center gap-2">
                    <Check size={18} />
                    Create Post
                  </span>
                )}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

export default CreateListingModal;

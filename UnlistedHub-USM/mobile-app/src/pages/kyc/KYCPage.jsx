import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  ArrowLeft,
  Upload,
  CheckCircle,
  Clock,
  XCircle,
  FileText,
  Camera,
  AlertCircle
} from 'lucide-react';
import { kycAPI } from '../../utils/api';
import { haptic } from '../../utils/helpers';
import toast from 'react-hot-toast';

const KYCPage = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [kycStatus, setKycStatus] = useState(null);
  const [documents, setDocuments] = useState({
    aadhaar: null,
    pan: null,
  });

  useEffect(() => {
    fetchKYCStatus();
  }, []);

  const fetchKYCStatus = async () => {
    try {
      setLoading(true);
      const response = await kycAPI.getStatus();
      setKycStatus(response.data.data);
    } catch (error) {
      console.error('Failed to fetch KYC status:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleFileChange = (type, event) => {
    const file = event.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size should be less than 5MB');
        return;
      }
      haptic.light();
      setDocuments(prev => ({ ...prev, [type]: file }));
    }
  };

  const handleSubmit = async () => {
    if (!documents.aadhaar || !documents.pan) {
      toast.error('Please upload both Aadhaar and PAN documents');
      return;
    }

    try {
      setUploading(true);
      haptic.medium();

      const formData = new FormData();
      formData.append('aadhaar', documents.aadhaar);
      formData.append('pan', documents.pan);

      await kycAPI.submit(formData);
      
      haptic.success();
      toast.success('KYC documents submitted successfully!');
      fetchKYCStatus();
      setDocuments({ aadhaar: null, pan: null });
    } catch (error) {
      haptic.error();
      console.error('Failed to submit KYC:', error);
      toast.error(error.response?.data?.message || 'Failed to submit KYC documents');
    } finally {
      setUploading(false);
    }
  };

  const getStatusConfig = () => {
    if (!kycStatus) return null;

    const configs = {
      verified: {
        icon: CheckCircle,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
        borderColor: 'border-green-200',
        title: 'KYC Verified',
        description: 'Your account is fully verified and ready for trading.'
      },
      pending: {
        icon: Clock,
        color: 'text-yellow-600',
        bgColor: 'bg-yellow-100',
        borderColor: 'border-yellow-200',
        title: 'Verification Pending',
        description: 'Your KYC documents are under review. This usually takes 24-48 hours.'
      },
      rejected: {
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
        borderColor: 'border-red-200',
        title: 'Verification Failed',
        description: 'Your KYC documents were rejected. Please resubmit with correct documents.'
      },
      not_submitted: {
        icon: AlertCircle,
        color: 'text-gray-600',
        bgColor: 'bg-gray-100',
        borderColor: 'border-gray-200',
        title: 'KYC Not Submitted',
        description: 'Complete your KYC to start trading on the platform.'
      }
    };

    return configs[kycStatus.status] || configs.not_submitted;
  };

  const statusConfig = getStatusConfig();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-8 h-8 border-4 border-primary-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const StatusIcon = statusConfig?.icon;

  return (
    <div className="min-h-screen bg-gray-50 pb-20">
      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="px-6 pt-safe pb-4">
          <div className="flex items-center gap-4 mb-4">
            <button
              onClick={() => {
                haptic.light();
                navigate(-1);
              }}
              className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center touch-feedback"
            >
              <ArrowLeft className="w-5 h-5 text-gray-700" />
            </button>
            <h1 className="text-2xl font-bold text-gray-900">KYC Verification</h1>
          </div>
        </div>
      </div>

      <div className="px-6 pt-6">
        {/* Status Card */}
        {statusConfig && (
          <div className={`border-2 rounded-3xl p-6 mb-6 ${statusConfig.borderColor} ${statusConfig.bgColor}`}>
            <div className="flex items-start gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center bg-white`}>
                <StatusIcon className={`w-8 h-8 ${statusConfig.color}`} />
              </div>
              <div className="flex-1">
                <h3 className="text-xl font-bold text-gray-900 mb-2">{statusConfig.title}</h3>
                <p className="text-gray-700">{statusConfig.description}</p>
              </div>
            </div>
          </div>
        )}

        {/* Upload Section - Show only if not verified or pending */}
        {kycStatus?.status !== 'verified' && kycStatus?.status !== 'pending' && (
          <>
            <h2 className="text-lg font-bold text-gray-900 mb-4">Upload Documents</h2>

            {/* Aadhaar Upload */}
            <div className="bg-white rounded-2xl p-5 shadow-mobile mb-4">
              <div className="flex items-center gap-3 mb-3">
                <FileText className="w-6 h-6 text-blue-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">Aadhaar Card</h3>
                  <p className="text-sm text-gray-500">Upload front side of your Aadhaar</p>
                </div>
              </div>
              <input
                type="file"
                id="aadhaar"
                accept="image/*,.pdf"
                onChange={(e) => handleFileChange('aadhaar', e)}
                className="hidden"
              />
              <label
                htmlFor="aadhaar"
                className="w-full btn-secondary flex items-center justify-center gap-2 cursor-pointer"
              >
                {documents.aadhaar ? (
                  <>
                    <CheckCircle size={18} className="text-green-600" />
                    {documents.aadhaar.name}
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    Choose File
                  </>
                )}
              </label>
            </div>

            {/* PAN Upload */}
            <div className="bg-white rounded-2xl p-5 shadow-mobile mb-6">
              <div className="flex items-center gap-3 mb-3">
                <FileText className="w-6 h-6 text-purple-600" />
                <div>
                  <h3 className="font-semibold text-gray-900">PAN Card</h3>
                  <p className="text-sm text-gray-500">Upload your PAN card</p>
                </div>
              </div>
              <input
                type="file"
                id="pan"
                accept="image/*,.pdf"
                onChange={(e) => handleFileChange('pan', e)}
                className="hidden"
              />
              <label
                htmlFor="pan"
                className="w-full btn-secondary flex items-center justify-center gap-2 cursor-pointer"
              >
                {documents.pan ? (
                  <>
                    <CheckCircle size={18} className="text-green-600" />
                    {documents.pan.name}
                  </>
                ) : (
                  <>
                    <Upload size={18} />
                    Choose File
                  </>
                )}
              </label>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmit}
              disabled={uploading || !documents.aadhaar || !documents.pan}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {uploading ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  Submitting...
                </span>
              ) : (
                <span className="flex items-center justify-center gap-2">
                  <Upload size={18} />
                  Submit KYC Documents
                </span>
              )}
            </button>

            {/* Guidelines */}
            <div className="bg-blue-50 border border-blue-200 rounded-2xl p-4 mt-6">
              <div className="flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold text-blue-900 mb-2">Guidelines</p>
                  <ul className="text-sm text-blue-700 space-y-1">
                    <li>• Documents should be clear and readable</li>
                    <li>• File size should be less than 5MB</li>
                    <li>• Accepted formats: JPG, PNG, PDF</li>
                    <li>• Verification takes 24-48 hours</li>
                  </ul>
                </div>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default KYCPage;

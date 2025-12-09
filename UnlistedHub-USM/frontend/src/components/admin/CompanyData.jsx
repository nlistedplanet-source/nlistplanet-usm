import React, { useState, useEffect } from 'react';
import { Plus, Search, Edit2, Trash2, X, Building2, Save, Image, Download, Upload } from 'lucide-react';
import { companiesAPI, adminAPI } from '../../utils/api';
import toast from 'react-hot-toast';

const CompanyData = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [formData, setFormData] = useState({
    Logo: '',
    CompanyName: '',
    ScripName: '',
    ISIN: '',
    PAN: '',
    CIN: '',
    RegistrationDate: '',
    Sector: ''
  });

  useEffect(() => {
    loadCompanies();
  }, []);

  const loadCompanies = async () => {
    try {
      setLoading(true);
      const response = await companiesAPI.getAll({ limit: 1000 });
      setCompanies(response.data.data || []);
    } catch (error) {
      toast.error('Failed to load companies');
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingCompany) {
        // Update existing company
        await companiesAPI.update(editingCompany._id, formData);
        toast.success('Company updated successfully');
      } else {
        // Create new company
        await companiesAPI.create(formData);
        toast.success('Company created successfully');
      }
      
      setShowModal(false);
      resetForm();
      loadCompanies();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleEdit = (company) => {
    setEditingCompany(company);
    setFormData({
      Logo: company.Logo || '',
      CompanyName: company.CompanyName || '',
      ScripName: company.ScripName || '',
      ISIN: company.ISIN || '',
      PAN: company.PAN || '',
      CIN: company.CIN || '',
      RegistrationDate: company.RegistrationDate || '',
      Sector: company.Sector || ''
    });
    setShowModal(true);
  };

  const handleDelete = async (company) => {
    if (!window.confirm(`Are you sure you want to delete ${company.CompanyName}?`)) {
      return;
    }

    try {
      await companiesAPI.delete(company._id);
      toast.success('Company deleted successfully');
      loadCompanies();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete company');
    }
  };

  const handleDownloadSample = async () => {
    try {
      const response = await adminAPI.downloadSampleCsv();
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', 'companies_sample.csv');
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Sample CSV downloaded');
    } catch (error) {
      toast.error('Failed to download sample CSV');
      console.error(error);
    }
  };

  const handleBulkUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    if (!file.name.endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    try {
      setUploading(true);
      await adminAPI.bulkUploadCsv(file);
      toast.success('Companies uploaded successfully');
      loadCompanies();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to upload companies');
      console.error(error);
    } finally {
      setUploading(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleCloseModal = () => {
    setShowModal(false);
    resetForm();
  };

  const filteredCompanies = companies.filter(company =>
    (company.CompanyName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.ScripName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    company.Sector?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-2xl font-bold text-dark-900 flex items-center gap-2">
              <Building2 size={28} className="text-purple-600" />
              Company Data Management
            </h1>
            <p className="text-dark-600 mt-1">Manage unlisted companies database</p>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handleDownloadSample}
              className="flex items-center gap-2 bg-green-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-green-700 transition-colors"
            >
              <Download size={20} />
              Sample CSV
            </button>
            <label className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-xl font-semibold hover:bg-blue-700 transition-colors cursor-pointer">
              <Upload size={20} />
              {uploading ? 'Uploading...' : 'Bulk Upload'}
              <input
                type="file"
                accept=".csv"
                onChange={handleBulkUpload}
                disabled={uploading}
                className="hidden"
              />
            </label>
            <button
              onClick={() => setShowModal(true)}
              className="flex items-center gap-2 bg-gradient-to-r from-purple-600 to-indigo-600 text-white px-4 py-2 rounded-xl font-semibold hover:shadow-lg transition-all"
            >
              <Plus size={20} />
              Add Company
            </button>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-dark-400" size={20} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by company name, scrip, or sector..."
            className="w-full px-4 py-3 pl-10 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500"
          />
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-dark-600 text-sm">Total Companies</p>
          <p className="text-2xl font-bold text-dark-900">{companies.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-dark-600 text-sm">Search Results</p>
          <p className="text-2xl font-bold text-purple-600">{filteredCompanies.length}</p>
        </div>
        <div className="bg-white rounded-xl p-4 border border-gray-200">
          <p className="text-dark-600 text-sm">Unique Sectors</p>
          <p className="text-2xl font-bold text-indigo-600">
            {new Set(companies.map(c => c.Sector)).size}
          </p>
        </div>
      </div>

      {/* Companies Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <p className="text-dark-600">Loading companies...</p>
          </div>
        ) : filteredCompanies.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-dark-600">No companies found</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-700 uppercase">Logo</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-700 uppercase">Company Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-700 uppercase">Scrip Name</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-700 uppercase">ISIN</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-700 uppercase">PAN</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-700 uppercase">CIN</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-700 uppercase">Sector</th>
                  <th className="px-4 py-3 text-left text-xs font-semibold text-dark-700 uppercase">Reg. Date</th>
                  <th className="px-4 py-3 text-center text-xs font-semibold text-dark-700 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {filteredCompanies.map((company) => (
                  <tr key={company._id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-4 py-3">
                      {company.Logo ? (
                        <img src={company.Logo} alt="" className="w-10 h-10 rounded object-contain" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-purple-100 flex items-center justify-center">
                          <span className="text-purple-600 font-bold">{company.CompanyName[0]}</span>
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-3 font-semibold text-dark-900">{company.CompanyName}</td>
                    <td className="px-4 py-3 text-dark-600">{company.ScripName}</td>
                    <td className="px-4 py-3 text-xs text-dark-600 font-mono">{company.ISIN}</td>
                    <td className="px-4 py-3 text-xs text-dark-600 font-mono">{company.PAN}</td>
                    <td className="px-4 py-3 text-xs text-dark-600 font-mono">{company.CIN}</td>
                    <td className="px-4 py-3">
                      <span className="text-xs bg-indigo-100 text-indigo-700 px-2 py-1 rounded-full">
                        {company.Sector}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-dark-600">{company.RegistrationDate}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => handleEdit(company)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(company)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
              <h2 className="text-xl font-bold text-dark-900">
                {editingCompany ? 'Edit Company' : 'Add New Company'}
              </h2>
              <button
                onClick={handleCloseModal}
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              {/* Logo URL */}
              <div className="relative">
                <input
                  type="text"
                  value={formData.Logo}
                  onChange={(e) => setFormData({ ...formData, Logo: e.target.value })}
                  placeholder=" "
                  className="peer w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <label className="absolute left-3 -top-2.5 bg-white px-2 text-sm text-gray-600 peer-focus:text-purple-600 pointer-events-none">
                  Logo URL (optional)
                </label>
              </div>

              {/* Company Name */}
              <div className="relative">
                <input
                  type="text"
                  value={formData.CompanyName}
                  onChange={(e) => setFormData({ ...formData, CompanyName: e.target.value })}
                  placeholder=" "
                  required
                  className="peer w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <label className="absolute left-3 -top-2.5 bg-white px-2 text-sm text-gray-600 peer-focus:text-purple-600 pointer-events-none">
                  Company Name
                </label>
              </div>

              {/* Scrip Name */}
              <div className="relative">
                <input
                  type="text"
                  value={formData.ScripName}
                  onChange={(e) => setFormData({ ...formData, ScripName: e.target.value })}
                  placeholder=" "
                  required
                  className="peer w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <label className="absolute left-3 -top-2.5 bg-white px-2 text-sm text-gray-600 peer-focus:text-purple-600 pointer-events-none">
                  Scrip Name
                </label>
              </div>

              {/* ISIN */}
              <div className="relative">
                <input
                  type="text"
                  value={formData.ISIN}
                  onChange={(e) => setFormData({ ...formData, ISIN: e.target.value.toUpperCase() })}
                  placeholder=" "
                  required
                  maxLength={12}
                  pattern="[A-Z]{2}[A-Z0-9]{9}[0-9]"
                  className="peer w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
                />
                <label className="absolute left-3 -top-2.5 bg-white px-2 text-sm text-gray-600 peer-focus:text-purple-600 pointer-events-none">
                  ISIN (12 characters)
                </label>
              </div>

              {/* PAN */}
              <div className="relative">
                <input
                  type="text"
                  value={formData.PAN}
                  onChange={(e) => setFormData({ ...formData, PAN: e.target.value.toUpperCase() })}
                  placeholder=" "
                  required
                  maxLength={10}
                  pattern="[A-Z]{5}[0-9]{4}[A-Z]"
                  className="peer w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
                />
                <label className="absolute left-3 -top-2.5 bg-white px-2 text-sm text-gray-600 peer-focus:text-purple-600 pointer-events-none">
                  PAN (10 characters)
                </label>
              </div>

              {/* CIN */}
              <div className="relative">
                <input
                  type="text"
                  value={formData.CIN}
                  onChange={(e) => setFormData({ ...formData, CIN: e.target.value.toUpperCase() })}
                  placeholder=" "
                  required
                  maxLength={21}
                  pattern="[UL][0-9]{5}[A-Z]{2}[0-9]{4}[A-Z]{3}[0-9]{6}"
                  className="peer w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent font-mono"
                />
                <label className="absolute left-3 -top-2.5 bg-white px-2 text-sm text-gray-600 peer-focus:text-purple-600 pointer-events-none">
                  CIN (21 characters)
                </label>
              </div>

              {/* Registration Date */}
              <div className="relative">
                <input
                  type="text"
                  value={formData.RegistrationDate}
                  onChange={(e) => setFormData({ ...formData, RegistrationDate: e.target.value })}
                  placeholder=" "
                  required
                  className="peer w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <label className="absolute left-3 -top-2.5 bg-white px-2 text-sm text-gray-600 peer-focus:text-purple-600 pointer-events-none">
                  Registration Date (DD/MM/YYYY)
                </label>
              </div>

              {/* Sector */}
              <div className="relative">
                <input
                  type="text"
                  value={formData.Sector}
                  onChange={(e) => setFormData({ ...formData, Sector: e.target.value })}
                  placeholder=" "
                  required
                  className="peer w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
                <label className="absolute left-3 -top-2.5 bg-white px-2 text-sm text-gray-600 peer-focus:text-purple-600 pointer-events-none">
                  Sector
                </label>
              </div>

              {/* Buttons */}
              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={handleCloseModal}
                  className="flex-1 px-4 py-3 border border-gray-300 text-dark-700 rounded-xl font-semibold hover:bg-gray-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
                >
                  <Save size={20} />
                  {editingCompany ? 'Update Company' : 'Add Company'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default CompanyData;

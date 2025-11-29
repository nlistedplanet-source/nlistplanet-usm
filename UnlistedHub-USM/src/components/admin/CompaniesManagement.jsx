import React, { useState, useCallback } from 'react';
import { Upload, X, Loader, Edit2, Trash2, Building2, Image as ImageIcon } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BASE_API_URL } from '../../utils/api';

const CompaniesManagement = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    scriptName: '',
    sector: '',
    isin: '',
    cin: '',
    pan: '',
    registrationDate: '',
    description: ''
  });

  // Fetch companies
  const fetchCompanies = async () => {
    try {
      setLoading(true);
      const response = await axios.get(`${BASE_API_URL}/admin/companies`);
      setCompanies(response.data.companies);
    } catch (error) {
      toast.error('Failed to fetch companies');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchCompanies();
  }, []);

  // Handle logo file selection
  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('Image size should be less than 5MB');
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  // Open modal for adding new company
  const handleAddNew = () => {
    setEditingCompany(null);
    setFormData({
      name: '',
      scriptName: '',
      sector: '',
      isin: '',
      cin: '',
      pan: '',
      registrationDate: '',
      description: ''
    });
    setLogoFile(null);
    setLogoPreview(null);
    setShowModal(true);
  };

  // Open modal for editing existing company
  const handleEdit = (company) => {
    setEditingCompany(company);
    setFormData({
      name: company.name || '',
      scriptName: company.scriptName || '',
      sector: company.sector || '',
      isin: company.isin || '',
      cin: company.cin || '',
      pan: company.pan || '',
      registrationDate: company.registrationDate ? new Date(company.registrationDate).toISOString().split('T')[0] : '',
      description: company.description || ''
    });
    setLogoFile(null);
    setLogoPreview(company.logo || null);
    setShowModal(true);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const submitData = new FormData();
      submitData.append('name', formData.name);
      submitData.append('scriptName', formData.scriptName || '');
      submitData.append('sector', formData.sector);
      submitData.append('isin', formData.isin || '');
      submitData.append('cin', formData.cin || '');
      submitData.append('pan', formData.pan || '');
      submitData.append('registrationDate', formData.registrationDate || '');
      submitData.append('description', formData.description || '');
      
      if (logoFile) {
        submitData.append('logo', logoFile);
      }

      if (editingCompany) {
        // Update existing company
        await axios.put(`${BASE_API_URL}/admin/companies/${editingCompany._id}`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Company updated successfully!');
      } else {
        // Add new company
        await axios.post(`${BASE_API_URL}/admin/companies`, submitData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        toast.success('Company added successfully!');
      }

      setShowModal(false);
      setFormData({
        name: '',
        scriptName: '',
        sector: '',
        isin: '',
        cin: '',
        pan: '',
        registrationDate: '',
        description: ''
      });
      setLogoFile(null);
      setLogoPreview(null);
      setEditingCompany(null);
      fetchCompanies();
    } catch (error) {
      toast.error(error.response?.data?.message || `Failed to ${editingCompany ? 'update' : 'add'} company`);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this company?')) return;
    
    try {
      await axios.delete(`${BASE_API_URL}/admin/companies/${id}`);
      toast.success('Company deleted successfully!');
      fetchCompanies();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Failed to delete company');
    }
  };

  return (
    <div className="p-6">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Companies Management</h1>
          <p className="text-gray-500 mt-1">Manage companies with logo upload and details</p>
        </div>
        <button
          onClick={handleAddNew}
          className="px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 flex items-center gap-2"
        >
          <Building2 size={20} />
          Add Company
        </button>
      </div>

      {/* Companies List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader className="animate-spin text-emerald-500" size={40} />
        </div>
      ) : (
        <div className="bg-white rounded-xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-gray-50 border-b border-gray-200">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Company</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Script Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">ISIN</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">PAN</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">CIN</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Sector</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Reg. Date</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200">
                {companies.map((company) => (
                  <tr key={company._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        {company.logo ? (
                          <img src={company.logo} alt={company.name} className="w-10 h-10 rounded-lg object-cover" />
                        ) : (
                          <div className="w-10 h-10 bg-gray-200 rounded-lg flex items-center justify-center">
                            <Building2 size={20} className="text-gray-400" />
                          </div>
                        )}
                        <span className="font-medium text-gray-900">{company.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-600">{company.scriptName || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-600 font-mono text-sm">{company.isin || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-600 font-mono text-sm">{company.pan || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-600 font-mono text-sm">{company.cin || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-600">{company.sector || 'N/A'}</td>
                    <td className="px-6 py-4 text-gray-600 text-sm">
                      {company.registrationDate ? new Date(company.registrationDate).toLocaleDateString('en-GB') : 'N/A'}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => handleEdit(company)}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={18} />
                        </button>
                        <button
                          onClick={() => handleDelete(company._id)}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Add/Edit Company Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-900">
                {editingCompany ? 'Edit Company' : 'Add New Company'}
              </h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-6">
              {/* Logo Upload Section */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Company Logo
                </label>
                <div className="flex items-center gap-4">
                  {logoPreview ? (
                    <div className="relative">
                      <img src={logoPreview} alt="Logo preview" className="w-24 h-24 rounded-lg object-cover border-2 border-gray-200" />
                      <button
                        type="button"
                        onClick={() => {
                          setLogoFile(null);
                          setLogoPreview(null);
                        }}
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                      >
                        <X size={16} />
                      </button>
                    </div>
                  ) : (
                    <div className="w-24 h-24 bg-gray-100 rounded-lg flex items-center justify-center border-2 border-dashed border-gray-300">
                      <ImageIcon className="text-gray-400" size={32} />
                    </div>
                  )}
                  <div className="flex-1">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleLogoChange}
                      className="hidden"
                      id="logo-upload"
                    />
                    <label
                      htmlFor="logo-upload"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer"
                    >
                      <Upload size={18} />
                      {logoPreview ? 'Change Logo' : 'Upload Logo'}
                    </label>
                    <p className="text-sm text-gray-500 mt-2">PNG, JPG up to 5MB</p>
                  </div>
                </div>
              </div>

              {/* Form Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="col-span-2">
                  <label className="block text-sm font-medium text-gray-700 mb-2">Company Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="e.g., National Stock Exchange of India"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Script Name *</label>
                  <input
                    type="text"
                    required
                    value={formData.scriptName}
                    onChange={(e) => setFormData({ ...formData, scriptName: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="e.g., NSE"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Sector *</label>
                  <input
                    type="text"
                    required
                    value={formData.sector}
                    onChange={(e) => setFormData({ ...formData, sector: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="e.g., Financial Service"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">ISIN</label>
                  <input
                    type="text"
                    value={formData.isin}
                    onChange={(e) => setFormData({ ...formData, isin: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="INE123A01012"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">CIN</label>
                  <input
                    type="text"
                    value={formData.cin}
                    onChange={(e) => setFormData({ ...formData, cin: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="U67120MH2000PTC123456"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">PAN</label>
                  <input
                    type="text"
                    value={formData.pan}
                    onChange={(e) => setFormData({ ...formData, pan: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="AAACH1234A"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Registration Date</label>
                  <input
                    type="date"
                    value={formData.registrationDate}
                    onChange={(e) => setFormData({ ...formData, registrationDate: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                  placeholder="Brief description of the company"
                />
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  type="button"
                  onClick={() => setShowModal(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 px-4 py-2 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600"
                >
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

export default CompaniesManagement;

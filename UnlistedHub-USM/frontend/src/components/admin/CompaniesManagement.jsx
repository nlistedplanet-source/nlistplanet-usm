import React, { useState, useCallback, useMemo } from 'react';
import { Upload, X, Loader, Edit2, Trash2, Building2, Image as ImageIcon, Search, Filter, Download } from 'lucide-react';
import axios from 'axios';
import toast from 'react-hot-toast';
import { BASE_API_URL, adminAPI } from '../../utils/api';

const CompaniesManagement = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedIds, setSelectedIds] = useState(new Set());
  const [selectAll, setSelectAll] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingCompany, setEditingCompany] = useState(null);
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterSector, setFilterSector] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    scriptName: '',
    sector: '',
    isin: '',
    cin: '',
    pan: '',
    registrationDate: '',
    description: '',
    logoUrl: ''
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

  // Download sample CSV template
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
    } catch (err) {
      toast.error('Failed to download sample CSV');
      console.error(err);
    }
  };

  // Bulk upload CSV file
  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (!file.name.endsWith('.csv')) {
      toast.error('Please select a CSV file');
      return;
    }

    try {
      setLoading(true);
      await adminAPI.bulkUploadCsv(file);
      toast.success('Companies uploaded successfully');
      fetchCompanies();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to upload companies');
      console.error(err);
    } finally {
      setLoading(false);
      e.target.value = '';
    }
  };

  // Get unique sectors for filter dropdown
  const uniqueSectors = useMemo(() => {
    const sectors = companies.map(c => c.sector).filter(Boolean);
    return [...new Set(sectors)].sort();
  }, [companies]);

  // Filter companies based on search and sector
  const filteredCompanies = useMemo(() => {
    return companies.filter(company => {
      const matchesSearch = searchTerm === '' || 
        company.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.scriptName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.isin?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.pan?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        company.cin?.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesSector = filterSector === '' || company.sector === filterSector;
      
      return matchesSearch && matchesSector;
    });
  }, [companies, searchTerm, filterSector]);

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
      description: '',
      logoUrl: ''
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
      registrationDate: company.registrationDate ? new Date(company.registrationDate).toLocaleDateString('en-GB') : '',
      description: company.description || '',
      logoUrl: company.logo || ''
    });
    setLogoFile(null);
    setLogoPreview(company.logo || null);
    setShowModal(true);
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      let submitData;
      let headers = {};

      if (logoFile) {
        // Use FormData when a file is being uploaded
        submitData = new FormData();
        submitData.append('name', formData.name);
        submitData.append('scriptName', formData.scriptName || '');
        submitData.append('sector', formData.sector);
        submitData.append('isin', formData.isin || '');
        submitData.append('cin', formData.cin || '');
        submitData.append('pan', formData.pan || '');
        submitData.append('registrationDate', formData.registrationDate || '');
        submitData.append('description', formData.description || '');
        submitData.append('logo', logoFile);
        headers['Content-Type'] = 'multipart/form-data';
      } else {
        // Use JSON for text-only updates (more reliable for logoUrl)
        submitData = {
          name: formData.name,
          scriptName: formData.scriptName || '',
          sector: formData.sector,
          isin: formData.isin || '',
          cin: formData.cin || '',
          pan: formData.pan || '',
          registrationDate: formData.registrationDate || '',
          description: formData.description || '',
          logoUrl: formData.logoUrl || '' // Explicitly send logoUrl
        };
        headers['Content-Type'] = 'application/json';
      }

      if (editingCompany) {
        // Update existing company
        await axios.put(`${BASE_API_URL}/admin/companies/${editingCompany._id}`, submitData, { headers });
        toast.success('Company updated successfully!');
      } else {
        // Add new company
        await axios.post(`${BASE_API_URL}/admin/companies`, submitData, { headers });
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
    <div className="p-3">
      {/* Header */}
      <div className="flex justify-between items-center mb-3">
        <div>
          <h1 className="text-xl font-bold text-gray-900">Companies Management</h1>
          <p className="text-xs text-gray-500">Manage companies with logo upload and details</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleDownloadSample}
            className="px-3 py-1.5 text-sm bg-green-500 text-white rounded-md hover:bg-green-600 flex items-center gap-1.5"
          >
            <Download size={14} />
            Sample CSV
          </button>

          <label className="flex items-center gap-2 px-3 py-1.5 text-sm bg-blue-500 text-white rounded-md hover:bg-blue-600 cursor-pointer">
            <Upload size={14} />
            Bulk Upload
            <input type="file" accept=".csv" onChange={handleBulkUpload} className="hidden" />
          </label>

          <button
            onClick={handleAddNew}
            className="px-3 py-1.5 text-sm bg-emerald-500 text-white rounded-md hover:bg-emerald-600 flex items-center gap-1.5"
          >
            <Building2 size={16} />
            Add Company
          </button>

          <button
            onClick={async () => {
              if (selectedIds.size === 0) return;
              if (!window.confirm(`Delete ${selectedIds.size} selected companies? This cannot be undone.`)) return;
              try {
                setLoading(true);
                const ids = Array.from(selectedIds);
                const res = await adminAPI.bulkDeleteCompanies(ids);
                const { results } = res.data;
                // Show summary toast
                let msg = `${results.deleted.length} deleted`;
                if (results.skipped.length) msg += `, ${results.skipped.length} skipped`;
                if (results.errors.length) msg += `, ${results.errors.length} errors`;
                toast.success(`Bulk delete: ${msg}`);
                setSelectedIds(new Set());
                setSelectAll(false);
                fetchCompanies();
              } catch (err) {
                toast.error(err.response?.data?.message || 'Bulk delete failed');
                console.error(err);
              } finally {
                setLoading(false);
              }
            }}
            disabled={selectedIds.size === 0}
            className={`px-3 py-1.5 text-sm rounded-md flex items-center gap-1.5 ${selectedIds.size === 0 ? 'bg-gray-200 text-gray-500 cursor-not-allowed' : 'bg-red-500 text-white hover:bg-red-600'}`}
          >
            <Trash2 size={14} />
            Delete Selected
          </button>
        </div>
      </div>

      {/* Search & Filter Bar */}
      <div className="flex flex-wrap gap-2 mb-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, script, ISIN, PAN, CIN..."
            className="w-full pl-9 pr-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter size={16} className="text-gray-500" />
          <select
            value={filterSector}
            onChange={(e) => setFilterSector(e.target.value)}
            className="px-3 py-2 text-sm border border-gray-300 rounded-md focus:ring-1 focus:ring-emerald-500 focus:border-emerald-500"
          >
            <option value="">All Sectors</option>
            {uniqueSectors.map(sector => (
              <option key={sector} value={sector}>{sector}</option>
            ))}
          </select>
          {(searchTerm || filterSector) && (
            <button
              onClick={() => {
                setSearchTerm('');
                setFilterSector('');
              }}
              className="px-3 py-2 text-sm bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition-colors"
            >
              Clear
            </button>
          )}
        </div>
        <div className="text-xs text-gray-500 flex items-center ml-auto">
          Showing {filteredCompanies.length} of {companies.length} companies
        </div>
      </div>

      {/* Companies List */}
      {loading ? (
        <div className="flex justify-center py-12">
          <Loader className="animate-spin text-emerald-500" size={40} />
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="w-full" style={{ overflowX: 'scroll', overflowY: 'auto', maxHeight: '70vh' }}>
            <table className="text-xs border-collapse" style={{ minWidth: '1400px', tableLayout: 'fixed' }}>
              <thead className="bg-gray-50 border-b border-gray-200 sticky top-0 z-10">
                <tr>
                  <th style={{ width: '40px' }} className="px-3 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase whitespace-nowrap">
                    <input
                      type="checkbox"
                      checked={selectAll || (selectedIds.size > 0 && selectedIds.size === filteredCompanies.length)}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setSelectAll(checked);
                        if (checked) {
                          const allIds = filteredCompanies.map(c => c._id);
                          setSelectedIds(new Set(allIds));
                        } else {
                          setSelectedIds(new Set());
                        }
                      }}
                    />
                  </th>
                  <th style={{ width: '60px' }} className="px-3 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase whitespace-nowrap">Logo</th>
                  <th style={{ width: '220px' }} className="px-3 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase whitespace-nowrap">Company</th>
                  <th style={{ width: '120px' }} className="px-3 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase whitespace-nowrap">Script</th>
                  <th style={{ width: '140px' }} className="px-3 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase whitespace-nowrap">ISIN</th>
                  <th style={{ width: '120px' }} className="px-3 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase whitespace-nowrap">PAN</th>
                  <th style={{ width: '220px' }} className="px-3 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase whitespace-nowrap">CIN</th>
                  <th style={{ width: '140px' }} className="px-3 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase whitespace-nowrap">Sector</th>
                  <th style={{ width: '100px' }} className="px-3 py-2 text-left text-[10px] font-semibold text-gray-600 uppercase whitespace-nowrap">Reg. Date</th>
                  <th style={{ width: '80px' }} className="px-3 py-2 text-center text-[10px] font-semibold text-gray-600 uppercase whitespace-nowrap">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredCompanies.length === 0 ? (
                  <tr>
                    <td colSpan="9" className="px-3 py-8 text-center text-gray-500">
                      <Building2 size={32} className="mx-auto mb-2 text-gray-300" />
                      <p className="text-sm">No companies found</p>
                      <p className="text-xs">{searchTerm || filterSector ? 'Try different search or filter' : 'Add your first company'}</p>
                    </td>
                  </tr>
                ) : (
                  filteredCompanies.map((company) => (
                  <tr key={company._id} className="hover:bg-gray-50">
                    <td className="px-3 py-2">
                      <input
                        type="checkbox"
                        checked={selectedIds.has(company._id)}
                        onChange={(e) => {
                          const next = new Set(selectedIds);
                          if (e.target.checked) next.add(company._id);
                          else next.delete(company._id);
                          setSelectedIds(next);
                          if (next.size !== filteredCompanies.length) setSelectAll(false);
                        }}
                      />
                    </td>
                    <td className="px-3 py-2">
                      {company.logo ? (
                        <img src={company.logo} alt={company.name} className="w-8 h-8 rounded object-cover border border-gray-200" />
                      ) : (
                        <div className="w-8 h-8 bg-gray-100 rounded flex items-center justify-center border border-gray-200">
                          <Building2 size={16} className="text-gray-400" />
                        </div>
                      )}
                    </td>
                    <td className="px-3 py-2">
                      <span className="font-medium text-gray-900 text-xs truncate block max-w-[200px]" title={company.name}>{company.name}</span>
                    </td>
                    <td className="px-3 py-2 text-gray-600 text-xs whitespace-nowrap">{company.scriptName || '-'}</td>
                    <td className="px-3 py-2 text-gray-600 font-mono text-[10px] whitespace-nowrap">{company.isin || '-'}</td>
                    <td className="px-3 py-2 text-gray-600 font-mono text-[10px] whitespace-nowrap">{company.pan || '-'}</td>
                    <td className="px-3 py-2 text-gray-600 font-mono text-[10px] whitespace-nowrap">{company.cin || '-'}</td>
                    <td className="px-3 py-2 text-gray-600 text-xs whitespace-nowrap">{company.sector || '-'}</td>
                    <td className="px-3 py-2 text-gray-600 text-[10px] whitespace-nowrap">
                      {company.registrationDate ? new Date(company.registrationDate).toLocaleDateString('en-GB') : '-'}
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center justify-center gap-1">
                        <button
                          onClick={() => handleEdit(company)}
                          className="p-1 text-blue-500 hover:bg-blue-50 rounded transition-colors"
                          title="Edit"
                        >
                          <Edit2 size={14} />
                        </button>
                        <button
                          onClick={() => handleDelete(company._id)}
                          className="p-1 text-red-500 hover:bg-red-50 rounded transition-colors"
                          title="Delete"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                  ))
                )}
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
                    <div className="mt-3">
                      <label className="block text-sm font-medium text-gray-700">Or provide Logo URL</label>
                      <input
                        type="url"
                        value={formData.logoUrl}
                        onChange={(e) => setFormData({ ...formData, logoUrl: e.target.value })}
                        placeholder="https://example.com/logo.png"
                        className="mt-1 w-full px-3 py-2 border border-gray-200 rounded-lg"
                      />
                      <p className="text-xs text-gray-500 mt-1">If a file is uploaded, file takes precedence over URL.</p>
                    </div>
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
                    type="text"
                    value={formData.registrationDate || ''}
                    onChange={(e) => {
                      const val = e.target.value;
                      // Just store the raw value, we'll format on submit
                      setFormData({ ...formData, registrationDate: val });
                    }}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                    placeholder="DD/MM/YYYY"
                  />
                  <p className="text-xs text-gray-500 mt-1">Format: DD/MM/YYYY (e.g., 18/08/2005)</p>
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

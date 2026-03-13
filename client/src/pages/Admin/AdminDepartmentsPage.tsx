import { useState, useEffect } from 'react';
import { apiRequest } from '../../api/client';
import { useAuth } from '@hooks/index';
import { useUsers } from '@hooks/useUsers';
import { AdminHeader } from './AdminHeader';
import { AdminSidebar } from './AdminSidebar';
import { Card } from '@components/ui/Card';
import { Button } from '@components/ui/Button';
import { Input } from '@components/ui/Input';

interface Department {
  _id: string;
  name: string;
  code: string;
  description: string;
  location: string;
  phoneExtension: string;
  isActive: boolean;
  headOfDepartment: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

export function AdminDepartmentsPage() {
  const { user } = useAuth();
  const { staff } = useUsers(); // Get staff for HoD assignment
  const [departments, setDepartments] = useState<Department[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // Modal states
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingDept, setEditingDept] = useState<Department | null>(null);
  const [formData, setFormData] = useState({
    name: '',
    code: '',
    description: '',
    location: '',
    phoneExtension: '',
    headOfDepartment: '',
    isActive: true
  });

  const fetchDepartments = async () => {
    setIsLoading(true);
    try {
      const response = await apiRequest<{ data: Department[] }>('/departments?limit=100&sort=name');
      setDepartments(response.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load departments');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDepartments();
  }, []);

  const handleOpenModal = (dept?: Department) => {
    if (dept) {
      setEditingDept(dept);
      setFormData({
        name: dept.name,
        code: dept.code,
        description: dept.description || '',
        location: dept.location || '',
        phoneExtension: dept.phoneExtension || '',
        headOfDepartment: dept.headOfDepartment?._id || '',
        isActive: dept.isActive !== false
      });
    } else {
      setEditingDept(null);
      setFormData({
        name: '',
        code: '',
        description: '',
        location: '',
        phoneExtension: '',
        headOfDepartment: '',
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      if (editingDept) {
        await apiRequest(`/departments/${editingDept._id}`, {
          method: 'PUT',
          body: JSON.stringify(formData)
        });
      } else {
        await apiRequest('/departments', {
          method: 'POST',
          body: JSON.stringify(formData)
        });
      }
      setIsModalOpen(false);
      fetchDepartments();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Operation failed');
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this department? This will fail if doctors or appointments are linked.')) {
      try {
        await apiRequest(`/departments/${id}`, { method: 'DELETE' });
        fetchDepartments();
      } catch (err) {
        alert(err instanceof Error ? err.message : 'Failed to delete department');
      }
    }
  };

  const toggleStatus = async (dept: Department) => {
    try {
      await apiRequest(`/departments/${dept._id}`, {
        method: 'PUT',
        body: JSON.stringify({ ...dept, isActive: !dept.isActive })
      });
      fetchDepartments();
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to toggle status');
    }
  };

  return (
    <div className="flex min-h-screen bg-slate-50">
      <AdminSidebar user={user} />
      <div className="flex-1 flex flex-col min-w-0">
        <AdminHeader user={user} />
        <main className="flex-1 p-8 overflow-auto">
          <div className="max-w-[1400px] mx-auto space-y-8">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <div>
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Hospital Departments</h1>
                <p className="text-slate-500 font-medium mt-1">Configure and manage clinical and administrative units.</p>
              </div>
              <Button 
                onClick={() => handleOpenModal()}
                className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl font-bold shadow-lg shadow-indigo-600/20 transition-all flex items-center gap-2"
              >
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                </svg>
                Add New Department
              </Button>
            </div>

            {error && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-6 py-4 rounded-xl font-medium">
                {error}
              </div>
            )}

            {/* Departments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
              {isLoading ? (
                <div className="col-span-full py-20 text-center">
                  <div className="w-10 h-10 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                  <p className="text-slate-500 font-bold">Synchronizing department data...</p>
                </div>
              ) : departments.length === 0 ? (
                <div className="col-span-full py-20 text-center bg-white rounded-3xl border-2 border-dashed border-slate-200">
                  <p className="text-slate-400 font-medium">No departments registered yet. Click "Add New Department" to begin.</p>
                </div>
              ) : (
                departments.map((dept) => (
                  <Card key={dept._id} className="group relative overflow-hidden transition-all hover:shadow-xl hover:-translate-y-1 border-slate-200">
                    <div className={`absolute top-0 left-0 w-2 h-full ${dept.isActive ? 'bg-indigo-500' : 'bg-slate-300'}`}></div>
                    
                    <div className="p-6">
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <span className="text-xs font-bold text-indigo-600 bg-indigo-50 px-2.5 py-1 rounded-lg uppercase tracking-wider mb-2 inline-block">
                            {dept.code}
                          </span>
                          <h3 className="text-xl font-bold text-slate-800 group-hover:text-indigo-600 transition-colors">
                            {dept.name}
                          </h3>
                        </div>
                        <div className="flex gap-1">
                          <button 
                            onClick={() => handleOpenModal(dept)}
                            className="p-2 text-slate-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-all"
                            title="Edit Department"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 00-2 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                            </svg>
                          </button>
                          <button 
                            onClick={() => handleDelete(dept._id)}
                            className="p-2 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-lg transition-all"
                            title="Delete Department"
                          >
                            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                            </svg>
                          </button>
                        </div>
                      </div>

                      <p className="text-slate-600 text-sm line-clamp-2 mb-6 min-h-[40px]">
                        {dept.description || 'No description provided for this department.'}
                      </p>

                      <div className="space-y-3 pt-4 border-t border-slate-100">
                        <div className="flex items-center gap-3 text-sm">
                          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="font-medium text-slate-700">{dept.location || 'Not Specified'}</span>
                        </div>
                        <div className="flex items-center gap-3 text-sm">
                          <svg className="w-4 h-4 text-slate-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                          </svg>
                          <span className="font-medium text-slate-700">
                            Head: {dept.headOfDepartment ? `${dept.headOfDepartment.firstName} ${dept.headOfDepartment.lastName}` : 'Vacant'}
                          </span>
                        </div>
                      </div>

                      <div className="mt-6 flex items-center justify-between">
                        <button 
                          onClick={() => toggleStatus(dept)}
                          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg font-bold text-xs transition-all ${
                            dept.isActive 
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' 
                              : 'bg-slate-100 text-slate-500 border border-slate-200'
                          }`}
                        >
                          <div className={`w-2 h-2 rounded-full ${dept.isActive ? 'bg-emerald-500 animate-pulse' : 'bg-slate-400'}`}></div>
                          {dept.isActive ? 'Operational' : 'Disabled'}
                        </button>
                        
                        <div className="flex -space-x-2">
                           <div className="w-8 h-8 rounded-full bg-indigo-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-indigo-600">DR</div>
                           <div className="w-8 h-8 rounded-full bg-purple-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-purple-600">ST</div>
                           <div className="w-8 h-8 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-bold text-slate-400">+</div>
                        </div>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </main>
      </div>

      {/* Modal Overlay */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm transition-all">
          <Card className="w-full max-w-lg shadow-2xl border-0 animate-in fade-in zoom-in duration-200">
            <div className="p-8">
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-slate-900">
                  {editingDept ? 'Update Department' : 'Register Department'}
                </h2>
                <button onClick={() => setIsModalOpen(false)} className="text-slate-400 hover:text-slate-600">
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Dept Name</label>
                    <Input
                      required
                      placeholder="e.g. Cardiology"
                      value={formData.name}
                      onChange={(e) => setFormData({...formData, name: e.target.value})}
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm font-bold text-slate-700">Code</label>
                    <Input
                      required
                      placeholder="e.g. CARD"
                      value={formData.code}
                      onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Location</label>
                  <Input
                    placeholder="e.g. Wing B, 3rd Floor"
                    value={formData.location}
                    onChange={(e) => setFormData({...formData, location: e.target.value})}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Assign Head (Staff)</label>
                  <select
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                    value={formData.headOfDepartment}
                    onChange={(e) => setFormData({...formData, headOfDepartment: e.target.value})}
                  >
                    <option value="">Select Staff Member</option>
                    {staff.map(s => (
                      <option key={s._id || s.id} value={s._id || s.id}>
                        {s.firstName} {s.lastName} ({s.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-bold text-slate-700">Description</label>
                  <textarea
                    rows={3}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-2.5 text-slate-700 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all font-medium"
                    placeholder="Brief overview of department functions..."
                    value={formData.description}
                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                  />
                </div>

                <div className="pt-4 flex gap-3">
                  <Button 
                    type="button" 
                    variant="outline" 
                    className="flex-1 py-3 rounded-xl border-slate-200"
                    onClick={() => setIsModalOpen(false)}
                  >
                    Cancel
                  </Button>
                  <Button 
                    type="submit" 
                    className="flex-1 py-3 rounded-xl bg-indigo-600 text-white font-bold"
                  >
                    {editingDept ? 'Save Changes' : 'Create Unit'}
                  </Button>
                </div>
              </form>
            </div>
          </Card>
        </div>
      )}
    </div>
  );
}

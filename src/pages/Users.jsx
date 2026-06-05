import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { fetchUsers, createNewUser, updateUserRecord, deleteUserRecord } from '../features/users/userSlice';
import { TableSkeleton } from '../components/LoadingSkeleton';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { 
  UserPlus, 
  Edit, 
  Trash2, 
  Check, 
  X, 
  Shield, 
  Mail, 
  User, 
  Lock, 
  Loader2,
  ChevronLeft,
  ChevronRight,
  ToggleLeft,
  ToggleRight,
  Camera,
  Upload
} from 'lucide-react';


const Users = () => {
  const dispatch = useDispatch();
  const { users, pagination, loading } = useSelector((state) => state.users);

  // States
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(10);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState(null); // null for create, object for edit
  const [photoPreview, setPhotoPreview] = useState(null);

  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm();
  const [submitLoading, setSubmitLoading] = useState(false);

  useEffect(() => {
    dispatch(fetchUsers({ page, limit }));
  }, [dispatch, page, limit]);

  const openCreateModal = () => {
    setEditingUser(null);
    setPhotoPreview(null);
    reset();
    setIsModalOpen(true);
  };

  const openEditModal = (user) => {
    setEditingUser(user);
    setPhotoPreview(user.avatar || null);
    setValue('name', user.name);
    setValue('email', user.email);
    setValue('role', user.role);
    setValue('isActive', user.isActive);
    setValue('avatarFile', null);
    setIsModalOpen(true);
  };


  const handleDelete = async (id, name) => {
    if (window.confirm(`Are you sure you want to delete user ${name}?`)) {
      const result = await dispatch(deleteUserRecord(id));
      if (deleteUserRecord.fulfilled.match(result)) {
        toast.success('User deleted successfully');
        dispatch(fetchUsers({ page, limit }));
      } else {
        toast.error(result.payload || 'Failed to delete user');
      }
    }
  };

  const handleToggleActive = async (userObj) => {
    try {
      const result = await dispatch(updateUserRecord({
        id: userObj._id,
        userData: { isActive: !userObj.isActive }
      }));
      if (updateUserRecord.fulfilled.match(result)) {
        toast.success(`User ${userObj.name} ${!userObj.isActive ? 'activated' : 'deactivated'}`);
        dispatch(fetchUsers({ page, limit }));
      } else {
        toast.error(result.payload || 'Action failed');
      }
    } catch (err) {
      toast.error('An error occurred');
    }
  };

  const onSubmit = async (data) => {
    setSubmitLoading(true);
    try {
      const formData = new FormData();
      formData.append('name', data.name);
      formData.append('email', data.email);
      formData.append('role', data.role);

      if (data.avatarFile) {
        formData.append('avatar', data.avatarFile);
      }

      if (editingUser) {
        // Edit flow
        formData.append('isActive', data.isActive !== undefined ? data.isActive : editingUser.isActive);
        const result = await dispatch(updateUserRecord({ id: editingUser._id, userData: formData }));
        if (updateUserRecord.fulfilled.match(result)) {
          toast.success('User updated successfully');
          setIsModalOpen(false);
          dispatch(fetchUsers({ page, limit }));
        } else {
          toast.error(result.payload || 'Failed to update user');
        }
      } else {
        // Create flow
        formData.append('password', data.password);
        const result = await dispatch(createNewUser(formData));
        if (createNewUser.fulfilled.match(result)) {
          toast.success('User created successfully');
          setIsModalOpen(false);
          reset();
          dispatch(fetchUsers({ page, limit }));
        } else {
          toast.error(result.payload || 'Failed to create user');
        }
      }
    } finally {
      setSubmitLoading(false);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Panel */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Create user credentials, adjust roles, and manage account statuses.
          </p>
        </div>

        <button
          onClick={openCreateModal}
          className="inline-flex items-center space-x-1.5 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-colors duration-200"
        >
          <UserPlus className="w-4 h-4" />
          <span>Add New User</span>
        </button>
      </div>

      {/* Main Table view */}
      {loading ? (
        <TableSkeleton rows={6} />
      ) : (
        <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs">
              
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-950/40 border-b border-slate-200/50 dark:border-slate-800/40 text-slate-500 font-bold uppercase tracking-wider">
                  <th className="px-6 py-4">User</th>
                  <th className="px-6 py-4">Role</th>
                  <th className="px-6 py-4">Status</th>
                  <th className="px-6 py-4">Registered Date</th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/40">
                {users.map((item) => (
                  <tr key={item._id} className="hover:bg-slate-50/40 dark:hover:bg-slate-950/10 transition-colors">
                    
                    {/* User Card Avatar & Info */}
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <img
                          src={item.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80'}
                          alt={item.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-100"
                        />
                        <div>
                          <p className="font-bold text-slate-800 dark:text-white">{item.name}</p>
                          <span className="text-[10px] text-slate-400 block mt-0.5">{item.email}</span>
                        </div>
                      </div>
                    </td>

                    {/* Role */}
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${
                        item.role === 'Admin' 
                          ? 'bg-indigo-50 text-indigo-700 border-indigo-200 dark:bg-indigo-950/20 dark:text-indigo-400 dark:border-indigo-900/30' 
                          : 'bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-950/20 dark:text-brand-400 dark:border-brand-900/30'
                      }`}>
                        <Shield className="w-3 h-3 mr-0.5" />
                        {item.role}
                      </span>
                    </td>

                    {/* Toggle Active status */}
                    <td className="px-6 py-4">
                      <button
                        onClick={() => handleToggleActive(item)}
                        className={`inline-flex items-center space-x-1.5 focus:outline-none transition-colors duration-150 ${
                          item.isActive ? 'text-emerald-600' : 'text-red-500'
                        }`}
                        title={item.isActive ? 'Deactivate User' : 'Activate User'}
                      >
                        {item.isActive ? (
                          <>
                            <ToggleRight className="w-6 h-6 text-emerald-500" />
                            <span className="font-semibold text-[10px]">Active</span>
                          </>
                        ) : (
                          <>
                            <ToggleLeft className="w-6 h-6 text-slate-400 dark:text-slate-700" />
                            <span className="font-semibold text-[10px]">Inactive</span>
                          </>
                        )}
                      </button>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4 text-slate-500 dark:text-slate-400">
                      {new Date(item.createdAt).toLocaleDateString()}
                    </td>

                    {/* Actions buttons */}
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        <button
                          onClick={() => openEditModal(item)}
                          className="p-1.5 bg-slate-50 dark:bg-slate-950 text-slate-500 hover:text-brand-500 hover:bg-slate-100 rounded-lg transition-colors border border-slate-100 dark:border-slate-800"
                          title="Edit User"
                        >
                          <Edit className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item._id, item.name)}
                          className="p-1.5 bg-red-50 text-red-500 hover:text-white hover:bg-red-500 rounded-lg transition-colors border border-red-100 dark:bg-red-950/20 dark:border-red-900/30"
                          title="Delete User"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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

      {/* Pagination Footer */}
      {users.length > 0 && (
        <div className="flex items-center justify-between pt-6 border-t border-slate-200/50 dark:border-slate-800/40">
          
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400">Show:</span>
            <select
              value={limit}
              onChange={(e) => {
                setLimit(parseInt(e.target.value, 10));
                setPage(1);
              }}
              className="py-1 px-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/40 rounded-lg text-xs font-medium"
            >
              <option value="5">5</option>
              <option value="10">10</option>
              <option value="25">25</option>
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-xs text-slate-500 dark:text-slate-400 font-medium">
              Page {pagination.page} of {pagination.pages}
            </span>
            <div className="flex items-center space-x-1">
              <button
                disabled={page === 1}
                onClick={() => setPage(page - 1)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                disabled={page === pagination.pages}
                onClick={() => setPage(page + 1)}
                className="p-1.5 rounded-lg border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 disabled:opacity-40 transition-colors"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>

        </div>
      )}

      {/* User Create/Edit Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl w-full max-w-md shadow-2xl overflow-hidden animate-in zoom-in-95 duration-250">
            
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/40 bg-slate-50 dark:bg-slate-950/20">
              <h3 className="text-base font-bold text-slate-800 dark:text-white">
                {editingUser ? 'Edit User details' : 'Add New User'}
              </h3>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-4">
              
              {/* Name */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">User Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <User className="w-4 h-4 text-slate-400" />
                  </span>
                  <input
                    type="text"
                    placeholder="Enter full name"
                    {...register('name', { required: 'Name is required' })}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/40 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 text-sm"
                  />
                </div>
                {errors.name && <p className="text-[10px] text-red-500 mt-1">{errors.name.message}</p>}
              </div>

              {/* Email */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Email Address</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                    <Mail className="w-4 h-4 text-slate-400" />
                  </span>
                  <input
                    type="email"
                    placeholder="name@company.com"
                    {...register('email', { 
                      required: 'Email is required',
                      pattern: {
                        value: /^[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}$/i,
                        message: 'Invalid email address',
                      }
                    })}
                    className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/40 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 text-sm"
                  />
                </div>
                {errors.email && <p className="text-[10px] text-red-500 mt-1">{errors.email.message}</p>}
              </div>

              {/* Password - ONLY for Create User */}
              {!editingUser && (
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Password</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3">
                      <Lock className="w-4 h-4 text-slate-400" />
                    </span>
                    <input
                      type="password"
                      placeholder="••••••••"
                      {...register('password', { 
                        required: 'Password is required',
                        minLength: { value: 6, message: 'Password must be 6+ characters' }
                      })}
                      className="w-full pl-9 pr-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/40 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 text-sm"
                    />
                  </div>
                  {errors.password && <p className="text-[10px] text-red-500 mt-1">{errors.password.message}</p>}
                </div>
              )}

              {/* Role selector */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">User Role</label>
                <select
                  defaultValue="User"
                  {...register('role')}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/40 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 text-sm"
                >
                  <option value="User">User (Standard Access)</option>
                  <option value="Admin">Admin (Full Access)</option>
                </select>
              </div>

              {/* Profile Photo */}
              <div className="space-y-2">
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400">Profile Photo</label>
                <div className="flex items-center space-x-4">
                  {/* Photo Preview */}
                  <div className="relative w-16 h-16 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 flex items-center justify-center">
                    {photoPreview ? (
                      <img src={photoPreview} alt="Avatar Preview" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-8 h-8 text-slate-400" />
                    )}
                  </div>
                  {/* Upload button wrapper */}
                  <div className="flex-1">
                    <label className="flex items-center justify-center px-4 py-2 border border-slate-200 dark:border-slate-800 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-950 cursor-pointer transition-colors duration-200">
                      <Camera className="w-3.5 h-3.5 mr-2" />
                      <span>{photoPreview ? 'Change Photo' : 'Upload Photo'}</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                            setValue('avatarFile', file);
                            setPhotoPreview(URL.createObjectURL(file));
                          }
                        }}
                        className="hidden"
                      />
                    </label>
                    <p className="text-[10px] text-slate-400 mt-1">PNG, JPG, or GIF up to 5MB.</p>
                  </div>
                </div>
              </div>

              {/* Active Toggle - ONLY for Edit User */}
              {editingUser && (
                <div className="flex items-center justify-between py-2.5 bg-slate-50 dark:bg-slate-950/40 px-4 rounded-xl border border-slate-100 dark:border-slate-800">
                  <span className="text-xs font-bold text-slate-600 dark:text-slate-400">Account Active status</span>
                  <input
                    type="checkbox"
                    {...register('isActive')}
                    className="h-4.5 w-4.5 text-brand-500 rounded focus:ring-brand-500 border-slate-300"
                  />
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800/40">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitLoading}
                  className="flex items-center bg-brand-500 hover:bg-brand-600 disabled:bg-brand-400 text-white px-4 py-2 rounded-xl text-xs font-semibold"
                >
                  {submitLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>{editingUser ? 'Save Changes' : 'Create User'}</span>
                  )}
                </button>
              </div>

            </form>

          </div>
        </div>
      )}

    </div>
  );
};

export default Users;

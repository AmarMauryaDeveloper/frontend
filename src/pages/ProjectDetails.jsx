import React, { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { 
  fetchProjectDetails, 
  updateProjectDetails, 
  updateStatusOnly, 
  deleteProjectRecord,
  clearSelectedProject
} from '../features/projects/projectSlice';
import { fetchUsers } from '../features/users/userSlice';
import { CardSkeleton, TableSkeleton } from '../components/LoadingSkeleton';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { 
  ArrowLeft, 
  Calendar, 
  User, 
  Paperclip, 
  Download, 
  Edit, 
  Trash2, 
  CheckCircle2, 
  Clock, 
  Activity, 
  ChevronRight,
  Upload,
  Loader2,
  FileText,
  FileSpreadsheet,
  FileImage,
  ExternalLink,
  X
} from 'lucide-react';

const PRIORITY_COLORS = {
  Low: 'border-emerald-200 text-emerald-700 bg-emerald-50 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30',
  Medium: 'border-amber-200 text-amber-700 bg-amber-50 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30',
  High: 'border-red-200 text-red-700 bg-red-50 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30',
  Critical: 'border-red-300 text-red-950 bg-red-100 dark:bg-red-950 dark:text-red-300 dark:border-red-900',
};

const STATUS_ICONS = {
  Pending: Clock,
  'In Progress': Activity,
  Completed: CheckCircle2,
};

const STATUS_COLORS = {
  Pending: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  'In Progress': 'bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-950/20 dark:text-brand-400 dark:border-brand-900/30',
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30',
};

const ProjectDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { selectedProject, detailsLoading, loading } = useSelector((state) => state.projects);
  const { users } = useSelector((state) => state.users);

  // States
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [statusUpdating, setStatusUpdating] = useState(false);
  const [filesToUpload, setFilesToUpload] = useState([]);
  const [uploadingFiles, setUploadingFiles] = useState(false);

  // Edit form hook
  const { register, handleSubmit, setValue, reset, formState: { errors } } = useForm();

  useEffect(() => {
    dispatch(fetchProjectDetails(id));
    return () => {
      dispatch(clearSelectedProject());
    };
  }, [id, dispatch]);

  useEffect(() => {
    if (user?.role === 'Admin') {
      dispatch(fetchUsers({ limit: 100 }));
    }
  }, [dispatch, user]);

  // Set default values when edit modal is opened
  const openEditModal = () => {
    if (selectedProject) {
      setValue('title', selectedProject.title);
      setValue('description', selectedProject.description);
      setValue('startDate', selectedProject.startDate.substring(0, 10));
      setValue('endDate', selectedProject.endDate.substring(0, 10));
      setValue('priority', selectedProject.priority);
      setValue('status', selectedProject.status);
      setValue('assignedUsers', selectedProject.assignedUsers.map(u => u._id));
      setIsEditModalOpen(true);
    }
  };

  const handleDelete = async () => {
    if (window.confirm('Are you sure you want to delete this project?')) {
      const result = await dispatch(deleteProjectRecord(id));
      if (deleteProjectRecord.fulfilled.match(result)) {
        toast.success('Project deleted successfully');
        navigate('/projects');
      } else {
        toast.error(result.payload || 'Failed to delete project');
      }
    }
  };

  const handleStatusChange = async (newStatus) => {
    setStatusUpdating(true);
    try {
      const result = await dispatch(updateStatusOnly({ id, status: newStatus }));
      if (updateStatusOnly.fulfilled.match(result)) {
        toast.success(`Status updated to ${newStatus}`);
        dispatch(fetchProjectDetails(id));
      } else {
        toast.error(result.payload || 'Failed to update status');
      }
    } finally {
      setStatusUpdating(false);
    }
  };

  // Upload inline attachments
  const handleAttachmentUpload = async (e) => {
    e.preventDefault();
    if (filesToUpload.length === 0) return;
    setUploadingFiles(true);

    try {
      const formData = new FormData();
      // Keep existing project data fields, and append new files
      formData.append('title', selectedProject.title);
      formData.append('description', selectedProject.description);
      formData.append('startDate', selectedProject.startDate);
      formData.append('endDate', selectedProject.endDate);
      formData.append('priority', selectedProject.priority);
      formData.append('status', selectedProject.status);
      formData.append('assignedUsers', JSON.stringify(selectedProject.assignedUsers.map(u => u._id)));
      
      filesToUpload.forEach((file) => {
        formData.append('attachments', file);
      });

      const result = await dispatch(updateProjectDetails({ id, formData }));
      if (updateProjectDetails.fulfilled.match(result)) {
        toast.success('Attachment uploaded successfully!');
        setFilesToUpload([]);
        dispatch(fetchProjectDetails(id));
      } else {
        toast.error(result.payload || 'Upload failed');
      }
    } finally {
      setUploadingFiles(false);
    }
  };

  const onSubmitEdit = async (data) => {
    setCreateLoading(true);
    try {
      const formData = new FormData();
      formData.append('title', data.title);
      formData.append('description', data.description);
      formData.append('startDate', data.startDate);
      formData.append('endDate', data.endDate);
      formData.append('priority', data.priority);
      formData.append('status', data.status);

      const assigned = Array.from(data.assignedUsers || []);
      formData.append('assignedUsers', JSON.stringify(assigned));

      const result = await dispatch(updateProjectDetails({ id, formData }));
      if (updateProjectDetails.fulfilled.match(result)) {
        toast.success('Project updated successfully!');
        setIsEditModalOpen(false);
        dispatch(fetchProjectDetails(id));
      } else {
        toast.error(result.payload || 'Project update failed');
      }
    } catch (err) {
      toast.error('An error occurred');
    } finally {
      setCreateLoading(false);
    }
  };

  const [createLoading, setCreateLoading] = useState(false);

  // Icon mapping helper for file types
  const getFileIcon = (name) => {
    const ext = name.split('.').pop().toLowerCase();
    if (ext === 'pdf') return FileText;
    if (['xlsx', 'xls', 'csv'].includes(ext)) return FileSpreadsheet;
    if (['png', 'jpg', 'jpeg'].includes(ext)) return FileImage;
    return Paperclip;
  };

  if (detailsLoading || !selectedProject) {
    return <CardSkeleton />;
  }

  const project = selectedProject;
  const ProgressIcon = STATUS_ICONS[project.status] || HelpCircle;

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Breadcrumbs / Actions Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          to="/projects"
          className="inline-flex items-center space-x-1.5 text-xs font-semibold text-slate-500 hover:text-brand-500 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Project Dashboard</span>
        </Link>

        {user?.role === 'Admin' && (
          <div className="flex items-center space-x-2.5">
            <button
              onClick={openEditModal}
              className="inline-flex items-center space-x-1 px-4 py-2 bg-white dark:bg-slate-900 border border-slate-200/60 dark:border-slate-800/60 hover:bg-slate-50 dark:hover:bg-slate-800 rounded-xl text-xs font-bold text-slate-700 dark:text-slate-300"
            >
              <Edit className="w-4 h-4 text-slate-500" />
              <span>Edit Settings</span>
            </button>
            <button
              onClick={handleDelete}
              className="inline-flex items-center space-x-1 px-4 py-2 bg-red-50 hover:bg-red-100 dark:bg-red-950/20 dark:hover:bg-red-950/40 rounded-xl text-xs font-bold text-red-600 dark:text-red-400"
            >
              <Trash2 className="w-4 h-4" />
              <span>Delete Project</span>
            </button>
          </div>
        )}
      </div>

      {/* Main content grid split */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column - Detailed metrics */}
        <div className="lg:col-span-2 space-y-6">
          
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl p-6 shadow-sm space-y-5">
            
            {/* Badges bar */}
            <div className="flex flex-wrap items-center gap-3">
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${STATUS_COLORS[project.status]}`}>
                {project.status}
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${PRIORITY_COLORS[project.priority]}`}>
                {project.priority} Priority
              </span>
            </div>

            {/* Title */}
            <h3 className="text-xl font-bold text-slate-800 dark:text-white font-display">
              {project.title}
            </h3>

            {/* Description */}
            <div className="space-y-2">
              <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Project Overview</h5>
              <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed whitespace-pre-wrap">
                {project.description}
              </p>
            </div>

            {/* Timelines and Creator info */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-5 border-t border-slate-100 dark:border-slate-800/40 text-xs">
              <div className="space-y-1">
                <span className="text-slate-400 font-semibold block">Start Date</span>
                <div className="flex items-center space-x-1.5 font-bold text-slate-700 dark:text-slate-300">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>{new Date(project.startDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-semibold block">Target End Date</span>
                <div className="flex items-center space-x-1.5 font-bold text-slate-700 dark:text-slate-300">
                  <Calendar className="w-4 h-4 text-slate-400" />
                  <span>{new Date(project.endDate).toLocaleDateString()}</span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-slate-400 font-semibold block">Created By</span>
                <div className="flex items-center space-x-1.5 font-bold text-slate-700 dark:text-slate-300">
                  <User className="w-4 h-4 text-slate-400" />
                  <span>{project.createdBy?.name || 'Admin'}</span>
                </div>
              </div>
            </div>

          </div>

          {/* Attachments Section */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800/40">
              <span className="text-sm font-bold text-slate-700 dark:text-slate-300">Project Attachments ({project.attachments?.length || 0})</span>
            </div>

            {/* List */}
            {project.attachments?.length === 0 ? (
              <p className="text-xs text-slate-400 text-center py-6">No attachments uploaded yet.</p>
            ) : (
              <div className="divide-y divide-slate-100 dark:divide-slate-800">
                {project.attachments.map((file) => {
                  const FileIcon = getFileIcon(file.name);
                  return (
                    <div key={file._id} className="flex items-center justify-between py-3.5 first:pt-0 last:pb-0">
                      <div className="flex items-center space-x-3 min-w-0">
                        <div className="p-2 bg-slate-50 dark:bg-slate-950 border border-slate-100 dark:border-slate-800 rounded-xl">
                          <FileIcon className="w-4.5 h-4.5 text-slate-500" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate" title={file.name}>
                            {file.name}
                          </p>
                          <span className="text-[9px] text-slate-400 block mt-0.5">
                            {(file.size / (1024 * 1024)).toFixed(2)} MB • {new Date(file.uploadedAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-2">
                        {/* Preview */}
                        <a
                          href={file.secure_url}
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 bg-slate-50 dark:bg-slate-950 text-slate-500 hover:text-brand-500 hover:bg-slate-100 rounded-lg transition-colors border border-slate-100 dark:border-slate-800"
                          title="Preview"
                        >
                          <ExternalLink className="w-3.5 h-3.5" />
                        </a>
                        {/* Download */}
                        <a
                          href={file.secure_url}
                          download
                          target="_blank"
                          rel="noreferrer"
                          className="p-2 bg-slate-50 dark:bg-slate-950 text-slate-500 hover:text-brand-500 hover:bg-slate-100 rounded-lg transition-colors border border-slate-100 dark:border-slate-800"
                          title="Download"
                        >
                          <Download className="w-3.5 h-3.5" />
                        </a>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            {/* Inline Attachment upload (Only for Admin to upload, or let users upload as well! Allowing all members of the project to upload attachments makes it a high-grade tool) */}
            {user?.role === 'Admin' && (
              <form onSubmit={handleAttachmentUpload} className="pt-4 border-t border-slate-100 dark:border-slate-800/40 flex items-center space-x-3">
                <input
                  type="file"
                  onChange={(e) => setFilesToUpload(Array.from(e.target.files).slice(0, 3))}
                  accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg"
                  className="flex-1 text-xs text-slate-500 file:mr-3 file:py-1.5 file:px-3 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-100 file:text-slate-700 hover:file:bg-slate-200"
                />
                {filesToUpload.length > 0 && (
                  <button
                    type="submit"
                    disabled={uploadingFiles}
                    className="flex items-center bg-brand-500 hover:bg-brand-600 disabled:bg-brand-400 text-white px-3 py-1.5 rounded-lg text-xs font-semibold"
                  >
                    {uploadingFiles ? (
                      <Loader2 className="w-3 h-3 animate-spin mr-1" />
                    ) : (
                      <Upload className="w-3 h-3 mr-1" />
                    )}
                    <span>Upload</span>
                  </button>
                )}
              </form>
            )}

          </div>

        </div>

        {/* Right Column - Status settings & Team lists */}
        <div className="space-y-6">
          
          {/* Status Update Card */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl p-6 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Update Project Status</h4>
            <p className="text-[11px] text-slate-400 leading-normal">
              Progress indicator transitions: Pending → In Progress → Completed. Updates emit alerts.
            </p>

            <div className="flex flex-col space-y-2.5 pt-2">
              {['Pending', 'In Progress', 'Completed'].map((state) => {
                const isActive = project.status === state;
                return (
                  <button
                    key={state}
                    disabled={isActive || statusUpdating}
                    onClick={() => handleStatusChange(state)}
                    className={`flex items-center justify-between w-full px-4 py-3 rounded-xl border text-xs font-semibold transition-all duration-200 ${
                      isActive 
                        ? 'bg-brand-500 border-brand-500 text-white shadow-sm shadow-brand-500/10' 
                        : 'bg-white hover:bg-slate-50 border-slate-200/60 dark:bg-slate-950 dark:border-slate-800 text-slate-600 dark:text-slate-300'
                    }`}
                  >
                    <span className="capitalize">{state}</span>
                    {isActive && <CheckCircle2 className="w-4 h-4" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Assigned Team list */}
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl p-6 shadow-sm space-y-4">
            <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">Assigned Team ({project.assignedUsers?.length || 0})</h4>

            {project.assignedUsers?.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">No team members assigned.</p>
            ) : (
              <div className="space-y-3.5">
                {project.assignedUsers.map((member) => (
                  <div key={member._id} className="flex items-center space-x-3">
                    <img
                      src={member.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80'}
                      alt={member.name}
                      className="w-8 h-8 rounded-full object-cover border border-slate-100"
                    />
                    <div className="flex-1 min-w-0">
                      <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 truncate">
                        {member.name}
                      </p>
                      <span className="text-[9px] text-slate-400 block mt-0.5 truncate">
                        {member.email}
                      </span>
                    </div>
                    <span className={`inline-flex px-1.5 py-0.5 text-[8px] font-bold rounded-full ${member.isActive ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-600'}`}>
                      {member.isActive ? 'Active' : 'Inactive'}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Admin Edit Modal */}
      {isEditModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-250">
            
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/40 bg-slate-50 dark:bg-slate-950/20">
              <h3 className="text-base font-bold text-slate-800 dark:text-white">Edit Project Settings</h3>
              <button 
                onClick={() => setIsEditModalOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmitEdit)} className="p-6 space-y-4">
              
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Project Title</label>
                <input
                  type="text"
                  placeholder="Enter project title"
                  {...register('title', { required: 'Title is required' })}
                  className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/40 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 text-sm"
                />
                {errors.title && <p className="text-[10px] text-red-500 mt-1">{errors.title.message}</p>}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Description</label>
                <textarea
                  placeholder="Describe project deliverables..."
                  rows="3"
                  {...register('description', { required: 'Description is required' })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/40 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 text-sm resize-none"
                ></textarea>
                {errors.description && <p className="text-[10px] text-red-500 mt-1">{errors.description.message}</p>}
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Start Date</label>
                  <input
                    type="date"
                    {...register('startDate', { required: 'Start date is required' })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/40 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 text-sm"
                  />
                  {errors.startDate && <p className="text-[10px] text-red-500 mt-1">{errors.startDate.message}</p>}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">End Date</label>
                  <input
                    type="date"
                    {...register('endDate', { required: 'End date is required' })}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/40 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 text-sm"
                  />
                  {errors.endDate && <p className="text-[10px] text-red-500 mt-1">{errors.endDate.message}</p>}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Priority</label>
                  <select
                    {...register('priority')}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/40 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 text-sm"
                  >
                    <option value="Low">Low</option>
                    <option value="Medium">Medium</option>
                    <option value="High">High</option>
                    <option value="Critical">Critical</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Status</label>
                  <select
                    {...register('status')}
                    className="w-full px-3.5 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/40 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 text-sm"
                  >
                    <option value="Pending">Pending</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Assign Members</label>
                  <select
                    multiple
                    {...register('assignedUsers')}
                    className="w-full px-2 py-1.5 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/40 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 text-xs h-24"
                  >
                    {users.map((item) => (
                      <option key={item._id} value={item._id}>
                        {item.name} ({item.role})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800/40">
                <button
                  type="button"
                  onClick={() => setIsEditModalOpen(false)}
                  className="px-4 py-2 bg-slate-50 dark:bg-slate-800 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createLoading}
                  className="flex items-center bg-brand-500 hover:bg-brand-600 disabled:bg-brand-400 text-white px-4 py-2 rounded-xl text-xs font-semibold"
                >
                  {createLoading ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin mr-2" />
                      <span>Saving...</span>
                    </>
                  ) : (
                    <span>Save Changes</span>
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

export default ProjectDetails;

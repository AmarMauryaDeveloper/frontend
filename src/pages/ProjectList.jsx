import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { Link } from 'react-router-dom';
import { fetchProjects, createNewProject } from '../features/projects/projectSlice';
import { fetchUsers } from '../features/users/userSlice';
import { TableSkeleton } from '../components/LoadingSkeleton';
import { useForm } from 'react-hook-form';
import { toast } from 'react-toastify';
import { 
  Plus, 
  Search, 
  SlidersHorizontal, 
  ChevronLeft, 
  ChevronRight,
  FolderOpen,
  Calendar,
  AlertCircle,
  Paperclip,
  CheckCircle2,
  HelpCircle,
  FileSpreadsheet,
  FileText,
  FileImage,
  Loader2,
  X
} from 'lucide-react';

const PRIORITY_BADGES = {
  Low: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30',
  Medium: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/20 dark:text-amber-400 dark:border-amber-900/30',
  High: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/20 dark:text-red-400 dark:border-red-900/30',
  Critical: 'bg-red-100 text-red-950 border-red-300 dark:bg-red-950 dark:text-red-300 dark:border-red-900',
};

const STATUS_BADGES = {
  Pending: 'bg-slate-100 text-slate-700 border-slate-200 dark:bg-slate-800 dark:text-slate-300 dark:border-slate-700',
  'In Progress': 'bg-brand-50 text-brand-700 border-brand-200 dark:bg-brand-950/20 dark:text-brand-400 dark:border-brand-900/30',
  Completed: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/20 dark:text-emerald-400 dark:border-emerald-900/30',
};

const ProjectList = () => {
  const dispatch = useDispatch();
  const { user } = useSelector((state) => state.auth);
  const { projects, pagination, loading } = useSelector((state) => state.projects);
  const { users } = useSelector((state) => state.users);

  // States for query filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(1);
  const [limit, setLimit] = useState(6);

  // Modal control
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [filesSelected, setFilesSelected] = useState([]);

  // React Hook Form for Project creation
  const { register, handleSubmit, reset, formState: { errors } } = useForm();
  const [createLoading, setCreateLoading] = useState(false);

  // Trigger query load when dependencies change
  useEffect(() => {
    dispatch(fetchProjects({ search, status, priority, sort, page, limit }));
  }, [dispatch, search, status, priority, sort, page, limit]);

  // Load user options for assignment modal (if Admin)
  useEffect(() => {
    if (user?.role === 'Admin') {
      dispatch(fetchUsers({ limit: 100 })); // load all users
    }
  }, [dispatch, user]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    setPage(1); // Reset page to 1
  };

  const handleStatusFilter = (val) => {
    setStatus(val);
    setPage(1);
  };

  const handlePriorityFilter = (val) => {
    setPriority(val);
    setPage(1);
  };

  const handleSortChange = (val) => {
    setSort(val);
    setPage(1);
  };

  const handleFileChange = (e) => {
    if (e.target.files) {
      const arr = Array.from(e.target.files);
      if (arr.length > 3) {
        toast.warning('Maximum 3 files allowed. Only first 3 will be selected.');
        setFilesSelected(arr.slice(0, 3));
      } else {
        setFilesSelected(arr);
      }
    }
  };

  const onSubmitProject = async (formData) => {
    setCreateLoading(true);
    try {
      const dataPayload = new FormData();
      dataPayload.append('title', formData.title);
      dataPayload.append('description', formData.description);
      dataPayload.append('startDate', formData.startDate);
      dataPayload.append('endDate', formData.endDate);
      dataPayload.append('priority', formData.priority);

      // JSON stringified assigned users array
      const assigned = Array.from(formData.assignedUsers || []);
      dataPayload.append('assignedUsers', JSON.stringify(assigned));

      // Append files
      filesSelected.forEach((file) => {
        dataPayload.append('attachments', file);
      });

      const result = await dispatch(createNewProject(dataPayload));
      if (createNewProject.fulfilled.match(result)) {
        toast.success('Project created successfully!');
        setIsModalOpen(false);
        reset();
        setFilesSelected([]);
        // Reload projects
        dispatch(fetchProjects({ search, status, priority, sort, page, limit }));
      } else {
        toast.error(result.payload || 'Project creation failed');
      }
    } catch (err) {
      toast.error('An error occurred during submission');
    } finally {
      setCreateLoading(false);
    }
  };

  // Icon mapping helper for file types
  const getFileIcon = (mimeType) => {
    if (!mimeType) return Paperclip;
    if (mimeType.includes('pdf')) return FileText;
    if (mimeType.includes('sheet') || mimeType.includes('excel') || mimeType.includes('csv')) return FileSpreadsheet;
    if (mimeType.includes('image')) return FileImage;
    return Paperclip;
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Upper header action row */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            Monitor workloads, project updates, and operational timelines.
          </p>
        </div>
        
        {user?.role === 'Admin' && (
          <button
            onClick={() => setIsModalOpen(true)}
            className="inline-flex items-center space-x-1.5 bg-brand-500 hover:bg-brand-600 text-white px-4 py-2.5 rounded-xl text-sm font-semibold shadow-sm transition-colors duration-200"
          >
            <Plus className="w-4 h-4" />
            <span>Create Project</span>
          </button>
        )}
      </div>

      {/* Query Filters container */}
      <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl p-5 shadow-sm space-y-4">
        
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          
          {/* Search bar query */}
          <div className="relative md:col-span-2">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none">
              <Search className="w-4 h-4 text-slate-400" />
            </span>
            <input
              type="text"
              placeholder="Search by title or description..."
              value={search}
              onChange={handleSearchChange}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/40 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 text-slate-800 dark:text-slate-200"
            />
          </div>

          {/* Status selector */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-medium">Status:</span>
            <select
              value={status}
              onChange={(e) => handleStatusFilter(e.target.value)}
              className="flex-1 py-1.5 px-3 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/40 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="In Progress">In Progress</option>
              <option value="Completed">Completed</option>
            </select>
          </div>

          {/* Priority selector */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-medium">Priority:</span>
            <select
              value={priority}
              onChange={(e) => handlePriorityFilter(e.target.value)}
              className="flex-1 py-1.5 px-3 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/40 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="">All Priorities</option>
              <option value="Low">Low</option>
              <option value="Medium">Medium</option>
              <option value="High">High</option>
              <option value="Critical">Critical</option>
            </select>
          </div>

        </div>

        {/* Secondary filters row */}
        <div className="flex flex-wrap items-center justify-between pt-3 border-t border-slate-100 dark:border-slate-800/40 gap-3">
          
          <div className="flex items-center space-x-2">
            <SlidersHorizontal className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-xs text-slate-500 dark:text-slate-400">
              Showing {projects.length} of {pagination.total} projects
            </span>
          </div>

          {/* Sorting */}
          <div className="flex items-center space-x-2">
            <span className="text-xs text-slate-400 font-medium">Sort by:</span>
            <select
              value={sort}
              onChange={(e) => handleSortChange(e.target.value)}
              className="py-1 px-2.5 text-xs bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/40 rounded-lg text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="newest">Newest Created</option>
              <option value="oldest">Oldest Created</option>
              <option value="endDate">Target End Date</option>
            </select>
          </div>

        </div>

      </div>

      {/* Loading Skeleton fallback */}
      {loading ? (
        <TableSkeleton rows={4} />
      ) : projects.length === 0 ? (
        <div className="text-center py-20 bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl shadow-sm">
          <FolderOpen className="w-12 h-12 text-slate-300 dark:text-slate-700 mx-auto mb-4" />
          <h4 className="text-sm font-bold text-slate-700 dark:text-slate-300">No Projects Found</h4>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs mx-auto">
            We couldn't find any projects matching your search criteria or assigned list.
          </p>
        </div>
      ) : (
        /* Grid layout for Project list */
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {projects.map((project) => {
            const daysLeft = Math.ceil((new Date(project.endDate) - new Date()) / (1000 * 60 * 60 * 24));

            return (
              <div key={project._id} className="flex flex-col bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl p-6 shadow-sm hover-lift relative overflow-hidden">
                
                {/* Visual Accent indicators */}
                <div className={`absolute top-0 left-0 right-0 h-1 ${
                  project.status === 'Completed' 
                    ? 'bg-emerald-500' 
                    : project.priority === 'Critical' 
                      ? 'bg-red-600' 
                      : 'bg-brand-500'
                }`}></div>

                {/* Priority & Status Badges */}
                <div className="flex items-center justify-between mb-4">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${STATUS_BADGES[project.status]}`}>
                    {project.status}
                  </span>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold border ${PRIORITY_BADGES[project.priority]}`}>
                    {project.priority}
                  </span>
                </div>

                {/* Title */}
                <h4 className="text-base font-bold text-slate-800 dark:text-white line-clamp-1 mb-2">
                  {project.title}
                </h4>

                {/* Description */}
                <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-3 mb-4 flex-1">
                  {project.description}
                </p>

                {/* Meta details */}
                <div className="grid grid-cols-2 gap-4 py-3 border-y border-slate-100 dark:border-slate-800/40 mb-4 text-[11px] font-medium text-slate-500 dark:text-slate-400">
                  <div className="flex items-center space-x-1.5">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>Ends: {new Date(project.endDate).toLocaleDateString()}</span>
                  </div>
                  
                  <div className="flex items-center space-x-1.5 justify-end">
                    <Paperclip className="w-3.5 h-3.5 text-slate-400" />
                    <span>{project.attachments?.length || 0} Attachments</span>
                  </div>
                </div>

                {/* User Avatars Row & Action Button */}
                <div className="flex items-center justify-between">
                  <div className="flex -space-x-2 overflow-hidden" title="Assigned Team">
                    {project.assignedUsers?.slice(0, 4).map((member) => (
                      <img
                        key={member._id}
                        src={member.avatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=80&h=80&q=80'}
                        alt={member.name}
                        className="inline-block h-7 w-7 rounded-full ring-2 ring-white dark:ring-slate-900 object-cover"
                        title={member.name}
                      />
                    ))}
                    {project.assignedUsers?.length > 4 && (
                      <span className="flex items-center justify-center h-7 w-7 rounded-full bg-slate-100 dark:bg-slate-800 text-[10px] font-bold text-slate-600 dark:text-slate-400 ring-2 ring-white dark:ring-slate-900">
                        +{project.assignedUsers.length - 4}
                      </span>
                    )}
                  </div>

                  <Link
                    to={`/projects/${project._id}`}
                    className="text-xs font-bold text-brand-500 hover:text-brand-600 flex items-center space-x-0.5 hover:underline"
                  >
                    <span>View Details</span>
                  </Link>
                </div>

                {/* Ending Soon Warning banner */}
                {daysLeft >= 0 && daysLeft <= 7 && project.status !== 'Completed' && (
                  <div className="mt-4 p-2 bg-red-50 dark:bg-red-950/20 rounded-xl border border-red-200/50 dark:border-red-900/20 text-[10px] font-semibold text-red-600 dark:text-red-400 flex items-center space-x-1.5">
                    <AlertCircle className="w-3.5 h-3.5" />
                    <span>Ends soon: {daysLeft} days remaining</span>
                  </div>
                )}

              </div>
            );
          })}
        </div>
      )}

      {/* Pagination controls footer */}
      {projects.length > 0 && (
        <div className="flex items-center justify-between pt-6 border-t border-slate-200/50 dark:border-slate-800/40">
          
          {/* Items per page Selector */}
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
              <option value="3">3</option>
              <option value="6">6</option>
              <option value="12">12</option>
            </select>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-xs text-slate-500 dark:text-slate-400">
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

      {/* Admin Creation modal form */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 backdrop-blur-sm p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200/50 dark:border-slate-800/40 rounded-2xl w-full max-w-xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-250">
            
            {/* Modal header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-slate-100 dark:border-slate-800/40 bg-slate-50 dark:bg-slate-950/20">
              <h3 className="text-base font-bold text-slate-800 dark:text-white">Create New Project</h3>
              <button 
                onClick={() => { setIsModalOpen(false); setFilesSelected([]); reset(); }}
                className="p-1.5 rounded-lg text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit(onSubmitProject)} className="p-6 space-y-4">
              
              {/* Title input */}
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

              {/* Description input */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Description</label>
                <textarea
                  placeholder="Describe project deliverables and goals..."
                  rows="3"
                  {...register('description', { required: 'Description is required' })}
                  className="w-full px-3.5 py-2 bg-slate-50 dark:bg-slate-950 border border-slate-200/60 dark:border-slate-800/40 rounded-xl focus:outline-none focus:ring-1 focus:ring-brand-500 text-sm resize-none"
                ></textarea>
                {errors.description && <p className="text-[10px] text-red-500 mt-1">{errors.description.message}</p>}
              </div>

              {/* Date Ranges inputs */}
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

              {/* Priority & Assignments */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Priority</label>
                  <select
                    defaultValue="Medium"
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
                  <span className="text-[9px] text-slate-400 mt-1 block">Hold Ctrl/Cmd to select multiple members.</span>
                </div>
              </div>

              {/* File upload selector */}
              <div>
                <label className="block text-xs font-bold text-slate-500 dark:text-slate-400 mb-1.5">Attachments (Max 3 files)</label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileChange}
                  accept=".pdf,.docx,.xlsx,.png,.jpg,.jpeg"
                  className="w-full text-xs text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-brand-50 file:text-brand-700 hover:file:bg-brand-100"
                />

                {/* Files Preview list */}
                {filesSelected.length > 0 && (
                  <div className="mt-2.5 space-y-1.5">
                    {filesSelected.map((file, i) => {
                      const FileIcon = getFileIcon(file.type);
                      return (
                        <div key={i} className="flex items-center space-x-2 p-2 bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800 rounded-lg text-[10px] font-medium text-slate-600 dark:text-slate-400">
                          <FileIcon className="w-4 h-4 text-slate-400" />
                          <span className="truncate flex-1">{file.name}</span>
                          <span>{(file.size / (1024 * 1024)).toFixed(2)} MB</span>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100 dark:border-slate-800/40">
                <button
                  type="button"
                  onClick={() => { setIsModalOpen(false); setFilesSelected([]); reset(); }}
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
                      <span>Creating...</span>
                    </>
                  ) : (
                    <span>Create Project</span>
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

export default ProjectList;

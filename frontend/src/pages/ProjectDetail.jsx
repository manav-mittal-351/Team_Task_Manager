import { useParams } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '../api/axios.config';
import { DragDropContext, Droppable, Draggable } from '@hello-pangea/dnd';
import { Plus, Clock, X, Loader2 } from 'lucide-react';
import { formatDistanceToNow, isPast } from 'date-fns';
import { useState } from 'react';
import toast from 'react-hot-toast';

const statusCfg = {
  TODO: { label: 'To Do', color: 'bg-slate-500', hdr: 'bg-slate-100 dark:bg-slate-700/50' },
  IN_PROGRESS: { label: 'In Progress', color: 'bg-blue-500', hdr: 'bg-blue-50 dark:bg-blue-500/10' },
  IN_REVIEW: { label: 'In Review', color: 'bg-purple-500', hdr: 'bg-purple-50 dark:bg-purple-500/10' },
  DONE: { label: 'Done', color: 'bg-emerald-500', hdr: 'bg-emerald-50 dark:bg-emerald-500/10' },
};

const priCfg = {
  LOW: { badge: 'bg-slate-100 text-slate-600 dark:bg-slate-700 dark:text-slate-300', border: 'border-l-slate-400' },
  MEDIUM: { badge: 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-400', border: 'border-l-blue-500' },
  HIGH: { badge: 'bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-400', border: 'border-l-amber-500' },
  URGENT: { badge: 'bg-red-100 text-red-700 dark:bg-red-500/20 dark:text-red-400', border: 'border-l-red-500' },
};

export default function ProjectDetail() {
  const { id } = useParams();
  const qc = useQueryClient();
  const [showModal, setShowModal] = useState(false);
  const [activeCol, setActiveCol] = useState('TODO');
  const [form, setForm] = useState({ title: '', description: '', priority: 'MEDIUM', dueDate: '' });

  const { data: project, isLoading: pLoading } = useQuery({ queryKey: ['project', id], queryFn: async () => (await api.get(`/projects/${id}`)).data.data });
  const { data: tasksRes, isLoading: tLoading } = useQuery({ queryKey: ['tasks', id], queryFn: async () => (await api.get(`/tasks/project/${id}`)).data });

  const updateStatus = useMutation({
    mutationFn: async ({ taskId, status }) => api.patch(`/tasks/${taskId}/status`, { status }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['tasks', id] }),
  });

  const createTask = useMutation({
    mutationFn: async (d) => (await api.post(`/tasks/project/${id}`, d)).data.data,
    onSuccess: () => { qc.invalidateQueries({ queryKey: ['tasks', id] }); setShowModal(false); setForm({ title: '', description: '', priority: 'MEDIUM', dueDate: '' }); toast.success('Task created!'); },
  });

  const handleDragEnd = (result) => {
    if (!result.destination) return;
    const newStatus = result.destination.droppableId;
    updateStatus.mutate({ taskId: result.draggableId, status: newStatus });
    toast.success(`Moved to ${statusCfg[newStatus].label}`);
  };

  if (pLoading || tLoading) return <div className="space-y-6 animate-pulse"><div className="h-8 w-64 bg-slate-200 dark:bg-slate-800 rounded-lg" /><div className="flex gap-6 overflow-hidden">{[...Array(4)].map((_, i) => <div key={i} className="w-80 h-96 bg-slate-200 dark:bg-slate-800 rounded-xl flex-shrink-0" />)}</div></div>;

  const tasks = tasksRes?.data || [];

  return (
    <div className="h-full flex flex-col">
      <div className="mb-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div><h1 className="text-2xl font-bold">{project?.name}</h1><p className="text-slate-500 mt-1">{project?.description}</p></div>
        <div className="flex -space-x-2">
          {project?.members?.slice(0, 5).map(m => <div key={m._id} className="w-8 h-8 rounded-full bg-primary/20 text-primary border-2 border-white dark:border-slate-800 flex items-center justify-center text-xs font-bold" title={m.name}>{m.name.charAt(0)}</div>)}
          {project?.members?.length > 5 && <div className="w-8 h-8 rounded-full bg-slate-200 dark:bg-slate-700 border-2 border-white dark:border-slate-800 flex items-center justify-center text-xs font-medium">+{project.members.length - 5}</div>}
        </div>
      </div>

      <DragDropContext onDragEnd={handleDragEnd}>
        <div className="flex-1 overflow-x-auto pb-4">
          <div className="flex gap-5 h-full min-w-max">
            {['TODO', 'IN_PROGRESS', 'IN_REVIEW', 'DONE'].map(status => {
              const cfg = statusCfg[status];
              const col = tasks.filter(t => t.status === status);
              return (
                <div key={status} className="w-80 flex flex-col bg-slate-50 dark:bg-slate-800/50 rounded-xl border border-slate-200 dark:border-slate-700">
                  <div className={`px-4 py-3 rounded-t-xl ${cfg.hdr} border-b border-slate-200 dark:border-slate-700`}>
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2"><span className={`w-2.5 h-2.5 rounded-full ${cfg.color}`} /><h3 className="font-semibold text-sm text-slate-700 dark:text-slate-300">{cfg.label}</h3></div>
                      <span className="bg-white dark:bg-slate-700 text-xs py-0.5 px-2 rounded-full font-medium shadow-sm">{col.length}</span>
                    </div>
                  </div>
                  <Droppable droppableId={status}>
                    {(provided, snapshot) => (
                      <div ref={provided.innerRef} {...provided.droppableProps} className={`flex-1 p-3 space-y-3 overflow-y-auto min-h-[200px] transition-colors ${snapshot.isDraggingOver ? 'bg-primary/5' : ''}`}>
                        {col.map((task, index) => {
                          const over = task.dueDate && isPast(new Date(task.dueDate)) && task.status !== 'DONE';
                          const pc = priCfg[task.priority];
                          return (
                            <Draggable key={task._id} draggableId={task._id} index={index}>
                              {(prov, snap) => (
                                <div ref={prov.innerRef} {...prov.draggableProps} {...prov.dragHandleProps} className={`p-4 bg-white dark:bg-slate-700 rounded-xl shadow-sm border border-slate-100 dark:border-slate-600 border-l-4 ${pc.border} cursor-grab active:cursor-grabbing hover:shadow-md transition-all ${over ? 'ring-1 ring-red-300' : ''} ${snap.isDragging ? 'shadow-xl rotate-2 scale-105' : ''} ${task.status === 'DONE' ? 'opacity-75' : ''}`}>
                                  <p className={`text-sm font-medium ${task.status === 'DONE' ? 'line-through text-slate-400' : ''}`}>{task.title}</p>
                                  {task.description && <p className="text-xs text-slate-500 mt-1.5 line-clamp-2">{task.description}</p>}
                                  <div className="flex justify-between items-center mt-3">
                                    <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-md ${pc.badge}`}>
                                      {task.priority === 'URGENT' && <span className="inline-block w-1.5 h-1.5 bg-red-500 rounded-full animate-pulse mr-1 align-middle" />}{task.priority}
                                    </span>
                                    <div className="flex items-center gap-2">
                                      {task.dueDate && <span className={`text-[11px] flex items-center gap-1 ${over ? 'text-red-500 font-medium' : 'text-slate-400'}`}><Clock className="w-3 h-3" />{formatDistanceToNow(new Date(task.dueDate), { addSuffix: true })}</span>}
                                      {task.assigneeName && <div className="w-6 h-6 rounded-full bg-primary/20 text-primary flex items-center justify-center text-[10px] font-bold" title={task.assigneeName}>{task.assigneeName.charAt(0)}</div>}
                                    </div>
                                  </div>
                                </div>
                              )}
                            </Draggable>
                          );
                        })}
                        {provided.placeholder}
                      </div>
                    )}
                  </Droppable>
                  <button onClick={() => { setActiveCol(status); setShowModal(true); }} className="m-3 mt-0 py-2.5 border-2 border-dashed border-slate-200 dark:border-slate-600 rounded-xl text-slate-400 hover:text-primary hover:border-primary/40 hover:bg-primary/5 transition-all text-sm font-medium flex items-center justify-center gap-1.5"><Plus className="w-4 h-4" /> Add Task</button>
                </div>
              );
            })}
          </div>
        </div>
      </DragDropContext>

      {showModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4" onClick={() => setShowModal(false)}>
          <div className="bg-white dark:bg-slate-800 rounded-2xl w-full max-w-md p-6 shadow-2xl border border-slate-100 dark:border-slate-700" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6"><h2 className="text-xl font-bold">New Task</h2><button onClick={() => setShowModal(false)} className="p-2 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-full"><X className="w-5 h-5" /></button></div>
            <form onSubmit={e => { e.preventDefault(); createTask.mutate({ ...form, status: activeCol }); }} className="space-y-4">
              <div><label className="block text-sm font-medium mb-1">Title</label><input value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/50 outline-none" placeholder="Task title" required minLength={3} /></div>
              <div><label className="block text-sm font-medium mb-1">Description</label><textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} rows={3} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/50 outline-none resize-none" placeholder="Describe the task..." /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium mb-1">Priority</label><select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/50 outline-none"><option value="LOW">Low</option><option value="MEDIUM">Medium</option><option value="HIGH">High</option><option value="URGENT">Urgent</option></select></div>
                <div><label className="block text-sm font-medium mb-1">Due Date</label><input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })} className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-600 bg-white dark:bg-slate-900 focus:ring-2 focus:ring-primary/50 outline-none" /></div>
              </div>
              <button type="submit" disabled={createTask.isPending} className="w-full py-3 bg-primary hover:bg-primary-dark text-white font-medium rounded-xl disabled:opacity-70 flex justify-center items-center gap-2">{createTask.isPending ? <Loader2 className="w-5 h-5 animate-spin" /> : 'Create Task'}</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

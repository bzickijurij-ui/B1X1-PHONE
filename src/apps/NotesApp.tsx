import React, { useState } from 'react';
import { TaskItem, UserNote } from '../types';
import { StickyNote, ClipboardList, Trash2, Plus, CheckCircle, Circle, Save, CornerDownLeft } from 'lucide-react';
import { playTone } from '../utils/audio';

interface NotesAppProps {
  tasks: TaskItem[];
  notes: UserNote[];
  onAddTask: (text: string) => void;
  onToggleTask: (id: string) => void;
  onDeleteTask: (id: string) => void;
  onAddNote: (title: string, content: string) => void;
  onDeleteNote: (id: string) => void;
}

export default function NotesApp({
  tasks,
  notes,
  onAddTask,
  onToggleTask,
  onDeleteTask,
  onAddNote,
  onDeleteNote
}: NotesAppProps) {
  const [activeTab, setActiveTab] = useState<'todo' | 'notes'>('todo');
  
  // Todo Input State
  const [todoText, setTodoText] = useState('');
  
  // Note Input States
  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  const handleCreateTodo = (e: React.FormEvent) => {
    e.preventDefault();
    if (!todoText.trim()) return;
    onAddTask(todoText.trim());
    setTodoText('');
    playTone(600, 0.08, 'sine');
  };

  const handleCreateNote = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteTitle.trim() && !noteContent.trim()) return;
    onAddNote(
      noteTitle.trim() || 'Без назви', 
      noteContent.trim() || 'Пустий вміст'
    );
    setNoteTitle('');
    setNoteContent('');
    playTone(700, 0.1, 'sine');
  };

  const handleToggleTodo = (id: string) => {
    onToggleTask(id);
    playTone(500, 0.05, 'sine');
  };

  return (
    <div className="flex flex-col h-full bg-[#fafaf9] text-amber-950 dark:bg-zinc-950 dark:text-orange-50 rounded-3xl overflow-hidden relative select-none font-sans" id="notes_app_root">
      
      {/* Header bar */}
      <div className="h-14 flex items-center justify-between px-6 bg-amber-100/40 dark:bg-zinc-900 border-b border-amber-200/40 dark:border-zinc-800 shrink-0">
        <span className="text-sm font-semibold flex items-center gap-2">
          <StickyNote size={18} className="text-amber-500" />
          <span>Блокнот B1X1</span>
        </span>
        <div className="flex bg-amber-50 dark:bg-zinc-850 p-0.5 rounded-lg border border-amber-200/30 dark:border-zinc-800">
          <button
            onClick={() => {
              setActiveTab('todo');
              playTone(550, 0.04, 'sine');
            }}
            className={`px-3 py-1 text-[10px] uppercase font-bold rounded-md transition-all ${
              activeTab === 'todo'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Завдання
          </button>
          <button
            onClick={() => {
              setActiveTab('notes');
              playTone(550, 0.04, 'sine');
            }}
            className={`px-3 py-1 text-[10px] uppercase font-bold rounded-md transition-all ${
              activeTab === 'notes'
                ? 'bg-amber-500 text-white shadow-sm'
                : 'text-zinc-400 hover:text-zinc-200'
            }`}
          >
            Нотатки
          </button>
        </div>
      </div>

      {activeTab === 'todo' ? (
        /* TAB: TODO LISTS */
        <div className="flex-1 flex flex-col min-h-0">
          {/* Add Todo Input form */}
          <form onSubmit={handleCreateTodo} className="p-4 bg-white/60 dark:bg-zinc-900/60 border-b border-amber-100 dark:border-zinc-855 flex gap-2">
            <input
              type="text"
              placeholder="Додати нове завдання..."
              value={todoText}
              onChange={(e) => setTodoText(e.target.value)}
              className="flex-1 px-4 py-2 text-xs rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-amber-500 text-zinc-900 dark:text-white"
            />
            <button
              type="submit"
              className="p-2.5 rounded-xl bg-amber-500 hover:bg-amber-600 text-white transition-all active:scale-95 cursor-pointer flex items-center justify-center shrink-0"
            >
              <Plus size={16} />
            </button>
          </form>

          {/* List display */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5 pb-8">
            {tasks.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center text-zinc-400 py-12">
                <ClipboardList size={32} className="text-zinc-300 dark:text-zinc-700 mb-1" />
                <p className="text-xs font-mono">Список завдань вільний</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">Введіть завдання зверху щоб бути продуктивним!</p>
              </div>
            ) : (
              tasks.map((task) => (
                <div
                  key={task.id}
                  className="flex items-center justify-between bg-white dark:bg-zinc-900 border border-slate-100 dark:border-zinc-800/80 p-3 rounded-2xl shadow-sm transition-all text-left"
                >
                  <div
                    onClick={() => handleToggleTodo(task.id)}
                    className="flex-1 flex items-center gap-3 cursor-pointer"
                  >
                    {task.completed ? (
                      <CheckCircle size={18} className="text-emerald-500 flex-shrink-0" />
                    ) : (
                      <Circle size={18} className="text-zinc-400 hover:text-amber-500 flex-shrink-0" />
                    )}
                    <span className={`text-xs select-none transition-all ${
                      task.completed ? 'line-through text-zinc-400 dark:text-zinc-600' : 'text-zinc-700 dark:text-zinc-100 font-medium'
                    }`}>
                      {task.text}
                    </span>
                  </div>
                  
                  <button
                    onClick={() => {
                      onDeleteTask(task.id);
                      playTone(350, 0.1, 'triangle');
                    }}
                    className="p-1 px-2.5 rounded text-zinc-400 hover:text-red-400 transition-colors cursor-pointer"
                    title="Видалити"
                  >
                    <Trash2 size={13} />
                  </button>
                </div>
              ))
            )}
          </div>
        </div>
      ) : (
        /* TAB: STICKY NOTES */
        <div className="flex-1 flex flex-col min-h-0">
          
          {/* Create Note Editor */}
          <form onSubmit={handleCreateNote} className="p-4 bg-white/60 dark:bg-zinc-900/60 border-b border-amber-100 dark:border-zinc-850 space-y-2 text-left">
            <input
              type="text"
              placeholder="Заголовок нотатки..."
              value={noteTitle}
              onChange={(e) => setNoteTitle(e.target.value)}
              className="w-full px-3 py-1.5 text-xs font-bold rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-amber-500 text-zinc-900 dark:text-white"
            />
            <div className="flex gap-2">
              <textarea
                placeholder="Вміст нотатки..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                rows={2}
                className="flex-1 px-3 py-1.5 text-xs rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus:outline-none focus:ring-1 focus:ring-amber-500 text-zinc-900 dark:text-white resize-none"
              />
              <button
                type="submit"
                className="px-3.5 rounded-lg bg-amber-500 text-white transition-all active:scale-95 cursor-pointer flex flex-col items-center justify-center font-bold text-[10px]"
              >
                <Save size={14} className="mb-0.5" />
                Зберегти
              </button>
            </div>
          </form>

          {/* Notes display Grid (beautiful sticky color options) */}
          <div className="flex-1 overflow-y-auto p-4 grid grid-cols-2 gap-3 pb-8 text-left">
            {notes.length === 0 ? (
              <div className="col-span-2 py-12 text-center text-zinc-400">
                <StickyNote size={32} className="mx-auto text-zinc-300 dark:text-zinc-700 mb-1" />
                <p className="text-xs font-mono">Немає збережених нотаток</p>
                <p className="text-[10px] text-zinc-500 mt-0.5">Втілюйте ваші ідеї в B1X1 OS!</p>
              </div>
            ) : (
              notes.map((note, index) => {
                // cycle beautiful colors for widgets
                const colors = [
                  'bg-amber-100/90 hover:bg-amber-100 text-amber-950 dark:bg-zinc-900/95 dark:text-amber-100',
                  'bg-orange-100/90 hover:bg-orange-100 text-orange-950 dark:bg-zinc-900/95 dark:text-orange-100',
                  'bg-emerald-100/90 hover:bg-emerald-100 text-emerald-950 dark:bg-zinc-900/95 dark:text-emerald-100',
                  'bg-sky-100/90 hover:bg-sky-100 text-sky-950 dark:bg-zinc-900/95 dark:text-sky-105'
                ];
                const colorClass = colors[index % colors.length];

                return (
                  <div
                    key={note.id}
                    className={`p-3.5 rounded-2xl flex flex-col justify-between aspect-square border border-black/5 dark:border-zinc-800 shadow-sm transition-transform hover:-translate-y-0.5 ${colorClass}`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-1 mb-1.5">
                        <h4 className="text-[11px] font-bold line-clamp-1 truncate uppercase tracking-wider">{note.title}</h4>
                        <button
                          onClick={() => {
                            onDeleteNote(note.id);
                            playTone(400, 0.1, 'triangle');
                          }}
                          className="opacity-40 hover:opacity-100 transition-opacity p-0.5"
                          title="Видалити"
                        >
                          <Trash2 size={11} />
                        </button>
                      </div>
                      <p className="text-[10px] opacity-85 leading-relaxed line-clamp-4 overflow-hidden whitespace-pre-wrap">{note.content}</p>
                    </div>
                    
                    <span className="text-[8px] opacity-50 block text-right mt-1 font-mono">{note.timestamp}</span>
                  </div>
                );
              })
            )}
          </div>

        </div>
      )}

    </div>
  );
}

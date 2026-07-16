'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Check, X, Pencil } from 'lucide-react';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

import { tasksApi, ApiError, type Task } from '@/lib/api';
import { getToken, clearToken } from '@/lib/auth';

const PRIORITIES = Array.from({ length: 10 }, (_, i) => i + 1);

export function TodoList() {
  const router = useRouter();
  const [token, setToken] = useState<string | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [newTitle, setNewTitle] = useState('');
  const [newPriority, setNewPriority] = useState('1');
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  //   useEffect(() => {
  //     const t = getToken();
  //     if (!t) {
  //       router.push('/login');
  //       return;
  //     }
  //     setToken(t);
  //     load(t);
  //     // eslint-disable-next-line react-hooks/exhaustive-deps
  //   }, []);

  async function load(t: string) {
    setLoading(true);
    setError(null);
    try {
      setTasks(await tasksApi.list(t));
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
    }
  }

  function handleError(err: unknown) {
    if (err instanceof ApiError && err.status === 401) {
      clearToken();
      router.push('/login');
      return;
    }
    setError(err instanceof ApiError ? err.message : 'Something went wrong.');
  }

  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!token || !newTitle.trim()) return;
    try {
      const task = await tasksApi.create(token, {
        title: newTitle.trim(),
        priority: Number(newPriority),
      });
      setTasks((prev) => [...prev, task]);
      setNewTitle('');
      setNewPriority('1');
    } catch (err) {
      handleError(err);
    }
  }

  async function toggleDone(task: Task) {
    if (!token) return;
    const updated = await tasksApi.update(token, task.id, { done: !task.done });
    setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
  }

  async function changePriority(task: Task, priority: string) {
    if (!token) return;
    const updated = await tasksApi.update(token, task.id, {
      priority: Number(priority),
    });
    setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
  }

  function startEdit(task: Task) {
    setEditingId(task.id);
    setEditingTitle(task.title);
  }

  async function saveEdit(task: Task) {
    if (!token || !editingTitle.trim()) return;
    const updated = await tasksApi.update(token, task.id, {
      title: editingTitle.trim(),
    });
    setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    setEditingId(null);
  }

  async function handleRemove(task: Task) {
    if (!token) return;
    await tasksApi.remove(token, task.id);
    setTasks((prev) => prev.filter((t) => t.id !== task.id));
  }

  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Your tasks </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <form onSubmit={handleAdd} className="flex gap-2">
          <Input
            placeholder="Add a task..."
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <Select value={newPriority} onValueChange={setNewPriority}>
            <SelectTrigger className="w-20">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PRIORITIES.map((p) => (
                <SelectItem key={p} value={String(p)}>
                  P{p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button type="submit"> Add </Button>
        </form>

        {error && <p className="text-sm text-destructive"> {error} </p>}

        {loading ? (
          <p className="text-sm text-muted-foreground"> Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            {' '}
            No tasks yet.Add one above.
          </p>
        ) : (
          <ul className="space-y-2">
            {tasks
              .slice()
              .sort((a, b) => b.priority - a.priority)
              .map((task) => (
                <li
                  key={task.id}
                  className="flex items-center gap-2 rounded-md border p-2"
                >
                  <Checkbox
                    checked={task.done}
                    onCheckedChange={() => toggleDone(task)}
                  />

                  {editingId === task.id ? (
                    <>
                      <Input
                        value={editingTitle}
                        onChange={(e) => setEditingTitle(e.target.value)}
                        className="h-8 flex-1"
                        autoFocus
                      />
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => saveEdit(task)}
                      >
                        <Check className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setEditingId(null)}
                      >
                        <X className="h-4 w-4" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <span
                        className={`flex-1 text-sm ${
                          task.done ? 'text-muted-foreground line-through' : ''
                        }`}
                      >
                        {task.title}
                      </span>
                      <Select
                        value={String(task.priority)}
                        onValueChange={(v) => changePriority(task, v)}
                      >
                        <SelectTrigger className="h-8 w-16">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {PRIORITIES.map((p) => (
                            <SelectItem key={p} value={String(p)}>
                              P{p}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => startEdit(task)}
                      >
                        <Pencil className="h-4 w-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => handleRemove(task)}
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </>
                  )}
                </li>
              ))}
          </ul>
        )}
      </CardContent>
    </Card>
  );
}

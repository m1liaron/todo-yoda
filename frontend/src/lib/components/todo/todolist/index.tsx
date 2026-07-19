'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Trash2, Check, X, Pencil, CalendarDays } from 'lucide-react';

import { Button } from '@/src/lib/components/ui/button';
import { Input } from '@/src/lib/components/ui/input';
import { Checkbox } from '@/src/lib/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/lib/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle } from '@/src/lib/components/ui/card';

import { getToken, clearToken } from '@/src/lib/modules/storage/auth';
import { SortOrder, Task, TaskSortField } from '@/src/lib/types/task';
import { tasksApi } from '@/src/lib/modules/api';
import { ApiError } from '@/src/lib/enums/exception/api-error';
import { Popover, PopoverTrigger, PopoverContent } from "@/src/lib/components/ui/popover";
import { Calendar } from "@/src/lib/components/ui/calendar";
import { DateRange } from 'react-day-picker';
import { SortableTaskRow } from '../../sortable-task-row';

const PRIORITIES = Array.from({ length: 10 }, (_, i) => i + 1);

type StatusFilter = "all" | "active" | "done";
 
const SORT_OPTIONS: { value: TaskSortField; label: string }[] = [
  { value: "id", label: "Created" },
  { value: "title", label: "Title" },
  { value: "priority", label: "Priority" },
  { value: "done", label: "Status" },
];

function toApiDate(d: Date): string {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const day = String(d.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
 
function formatRangeLabel(range: DateRange | undefined): string {
  if (!range?.from) return "Due date";
  if (!range.to) return toApiDate(range.from);
  return `${toApiDate(range.from)} – ${toApiDate(range.to)}`;
}



export function TodoList() {
  const router = useRouter();
 
  const [tasks, setTasks] = useState<Task[]>([]);
  const [page, setPage] = useState(1);
  const [hasMorePages, setHasMorePages] = useState(false);
 
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [sortField, setSortField] = useState<TaskSortField>("id");
  const [sortOrder, setSortOrder] = useState<SortOrder>("asc");
  const [dateRange, setDateRange] = useState<DateRange | undefined>(undefined);
 
  const [newTitle, setNewTitle] = useState("");
  const [newPriority, setNewPriority] = useState<string | null>("1");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingTitle, setEditingTitle] = useState("");
 
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  async function fetchPage(
    pageNum: number,
    { replace }: { replace: boolean }
  ) {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    replace ? setLoading(true) : setLoadingMore(true);
    setError(null);
    try {
      const res = await tasksApi.list({
        page: pageNum,
        status: statusParam(),
        sort: sortField,
        sortOrder,
        startDate: dateRange?.from ? toApiDate(dateRange.from) : undefined,
        endDate: dateRange?.to
          ? toApiDate(dateRange.to)
          : dateRange?.from
            ? toApiDate(dateRange.from) // single day selected: treat as start=end
            : undefined,
      });
      setTasks((prev) => (replace ? res.data : [...prev, ...res.data]));
      setPage(res.page_number);
      setHasMorePages(res.has_more_pages);
    } catch (err) {
      handleError(err);
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
   }
  
  // First load
  useEffect(() => {
    fetchPage(1, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
 
  // Re-fetch from page 1 whenever the filter or sort changes
  useEffect(() => {
    fetchPage(1, { replace: true });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, sortField, sortOrder, dateRange?.from, dateRange?.to]);
 
  function statusParam(): boolean | undefined {
    if (statusFilter === "active") return false;
    if (statusFilter === "done") return true;
    return undefined;
  }
 

 
  function handleError(err: unknown) {
    if (err instanceof ApiError && err.status === 401) {
      clearToken();
      router.push("/login");
      return;
    }
    setError(err instanceof ApiError ? err.message : "Something went wrong.");
  }
 
  function handleLoadMore() {
    fetchPage(page + 1, { replace: false });
  }
 
  async function handleAdd(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;
    try {
      await tasksApi.create({
        title: newTitle.trim(),
        priority: Number(newPriority),
      });
      setNewTitle("");
      setNewPriority("1");
      // Reload from page 1 so the new task lands in the right sorted position
      fetchPage(1, { replace: true });
    } catch (err) {
      handleError(err);
    }
  }
 
  async function toggleDone(task: Task) {
    try {
      const updated = await tasksApi.update(task.id, { done: !task.done });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    } catch (err) {
      handleError(err);
    }
  }
 
  async function changePriority(task: Task, priority: string | null) {
    if (priority === null) {
      return;
    }

    try {
      const updated = await tasksApi.update(task.id, {
        priority: Number(priority),
      });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
    } catch (err) {
      handleError(err);
    }
  }
 
  function startEdit(task: Task) {
    setEditingId(task.id);
    setEditingTitle(task.title);
  }
 
  async function saveEdit(task: Task) {
    if (!editingTitle.trim()) return;
    try {
      const updated = await tasksApi.update(task.id, {
        title: editingTitle.trim(),
      });
      setTasks((prev) => prev.map((t) => (t.id === task.id ? updated : t)));
      setEditingId(null);
    } catch (err) {
      handleError(err);
    }
  }
 
  async function handleRemove(task: Task) {
    try {
      await tasksApi.remove(task.id);
      setTasks((prev) => prev.filter((t) => t.id !== task.id));
    } catch (err) {
      handleError(err);
    }
  }
 
  return (
    <Card className="w-full max-w-lg">
      <CardHeader>
        <CardTitle>Your tasks</CardTitle>
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
          <Button type="submit">Add</Button>
        </form>
 

        <div className="flex flex-wrap gap-2">
          <div className="flex gap-2">
            <Select
              value={statusFilter}
              onValueChange={(v) => setStatusFilter(v as StatusFilter)}
            >
              <SelectTrigger className="w-28">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All</SelectItem>
                <SelectItem value="active">Active</SelectItem>
                <SelectItem value="done">Done</SelectItem>
              </SelectContent>
            </Select>
  
            <Select
              value={sortField}
              onValueChange={(v) => setSortField(v as TaskSortField)}
            >
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {SORT_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    Sort: {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
  
            <Select
              value={sortOrder}
              onValueChange={(v) => setSortOrder(v as SortOrder)}
            >
              <SelectTrigger className="w-24">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="asc">Asc</SelectItem>
                <SelectItem value="desc">Desc</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Popover>
            <PopoverTrigger
              render={<Button variant="outline" className="gap-2" />}
            >
              <CalendarDays className="h-4 w-4" />
              {formatRangeLabel(dateRange)}
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="range"
                selected={dateRange}
                onSelect={setDateRange}
                numberOfMonths={2}
              />
              {dateRange?.from && (
                <div className="flex justify-end border-t p-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setDateRange(undefined)}
                  >
                    Clear dates
                  </Button>
                </div>
              )}
            </PopoverContent>
          </Popover>
        </div>
 
        {error && <p className="text-sm text-destructive">{error}</p>}
 
        {loading ? (
          <p className="text-sm text-muted-foreground">Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No tasks match this filter.
          </p>
        ) : (
          <>
            <ul className="space-y-2">
              {tasks.map((task, index) => (
                  <SortableTaskRow
                    key={task.id}
                    task={task}
                    index={index}
                    editingId={editingId}
                    editingTitle={editingTitle}
                    onEditingTitleChange={setEditingTitle}
                    onToggleDone={toggleDone}
                    onChangePriority={changePriority}
                    onStartEdit={startEdit}
                    onSaveEdit={saveEdit}
                    onCancelEdit={() => setEditingId(null)}
                    onRemove={handleRemove}
                  />
                ))}
            </ul>
 
            {hasMorePages && (
              <Button
                variant="outline"
                className="w-full"
                disabled={loadingMore}
                onClick={handleLoadMore}
              >
                {loadingMore ? "Loading..." : "Load more"}
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  );
}

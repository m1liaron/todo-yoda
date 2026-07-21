import { useSortable } from "@dnd-kit/react/sortable";

import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/src/lib/components/ui/select';
import { SortableTaskRowProps } from "./libs/types";
import { Check, GripVertical, Pencil, Trash2, X } from "lucide-react";
import { Checkbox } from "../ui/checkbox";
import { Input } from "../ui/input";
import { Button } from "../ui/button";

const PRIORITIES = Array.from({ length: 10 }, (_, i) => i + 1);

const SortableTaskRow: React.FC<SortableTaskRowProps> = ({
  task,
  index,
  editingId,
  editingTitle,
  onEditingTitleChange,
  onToggleDone,
  onChangePriority,
  onStartEdit,
  onSaveEdit,
  onCancelEdit,
  onRemove,
}) => {
  // Disable dragging while this row is mid-edit, so the drag handle doesn't
  // fight with typing in the title input.
  const { ref, handleRef, isDragging } = useSortable({
    id: task.id,
    index,
    disabled: editingId === task.id,
  });
 
  const isEditing = editingId === task.id;
 
  return (
    <li
      ref={ref}
      className={`flex items-center gap-2 rounded-md border p-2 bg-background ${
        isDragging ? "opacity-50" : ""
      }`}
    >
      <button
        ref={handleRef}
        type="button"
        className="cursor-grab touch-none text-muted-foreground active:cursor-grabbing disabled:cursor-not-allowed disabled:opacity-30"
        disabled={isEditing}
        aria-label="Drag to reorder"
      >
        <GripVertical className="h-4 w-4" />
      </button>
 
      <Checkbox checked={task.done} onCheckedChange={() => onToggleDone(task)} />
 
      {isEditing ? (
        <>
          <Input
            value={editingTitle}
            onChange={(e) => onEditingTitleChange(e.target.value)}
            className="h-8 flex-1"
            autoFocus
          />
          <Button size="icon" variant="ghost" onClick={() => onSaveEdit(task)}>
            <Check className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={onCancelEdit}>
            <X className="h-4 w-4" />
          </Button>
        </>
      ) : (
        <>
          <span
            className={`flex-1 text-sm ${
              task.done ? "text-muted-foreground line-through" : ""
            }`}
          >
            {task.title}
          </span>
          <Select
            value={String(task.priority)}
            onValueChange={(v) => onChangePriority(task, v)}
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
          <Button size="icon" variant="ghost" onClick={() => onStartEdit(task)}>
            <Pencil className="h-4 w-4" />
          </Button>
          <Button size="icon" variant="ghost" onClick={() => onRemove(task)}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </>
      )}
    </li>
  );
}

export { SortableTaskRow };
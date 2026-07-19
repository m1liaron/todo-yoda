import { Task } from "@/src/lib/types/task";

type SortableTaskRowProps = {
    task: Task;
    index: number;
    editingId: number | null;
    editingTitle: string;
    onEditingTitleChange: (value: string) => void;
    onToggleDone: (task: Task) => void;
    onChangePriority: (task: Task, priority: string | null) => void;
    onStartEdit: (task: Task) => void;
    onSaveEdit: (task: Task) => void;
    onCancelEdit: () => void;
    onRemove: (task: Task) => void;
};

export { type SortableTaskRowProps };
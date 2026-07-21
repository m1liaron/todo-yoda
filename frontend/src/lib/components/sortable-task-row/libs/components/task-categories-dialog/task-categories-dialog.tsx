import { useEffect, useState } from 'react';
import { Plus, Tag, X } from 'lucide-react';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/src/lib/components/ui/dialog';

import { Badge } from '@/src/lib/components/ui/badge';
import { Button } from '@/src/lib/components/ui/button';
import { Input } from '@/src/lib/components/ui/input';

import { categoriesApi } from '@/src/lib/modules/api/index';
import { Category } from '@/src/lib/types/category';

type Props = {
  taskId: number;
  categories: Category[];
  onCategoriesChanged: () => void;
};

export function TaskCategoriesDialog({
  taskId,
  categories,
  onCategoriesChanged,
}: Props) {
  const [allCategories, setAllCategories] = useState<Category[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [assignedCategories, setAssignedCategories] = useState(categories);

  useEffect(() => {
    setAssignedCategories(categories);
  }, [categories]);

  async function loadCategories() {
    const res = await categoriesApi.list();
    setAllCategories(res);
  }

  useEffect(() => {
    loadCategories();
  }, []);

  async function handleCreate() {
    if (!newCategory.trim()) return;

    const category = await categoriesApi.create({
      title: newCategory.trim(),
    });

    await categoriesApi.assign(taskId, category.id);

    setAssignedCategories((prev) => [...prev, category]);
    setAllCategories((prev) => [...prev, category]);

    setNewCategory('');

    await loadCategories();
    onCategoriesChanged();
  }

  async function handleAssign(category: Category) {
    await categoriesApi.assign(taskId, category.id);

    setAssignedCategories((prev) => [...prev, category]);

    onCategoriesChanged();
  }

  async function handleRemove(category: Category) {
    await categoriesApi.remove_assign(taskId, category.id);

    setAssignedCategories((prev) => prev.filter((c) => c.id !== category.id));

    onCategoriesChanged();
  }

  return (
    <Dialog>
      <DialogTrigger>
        <Tag className="h-4 w-4" />
      </DialogTrigger>

      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Categories</DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          <div>
            <p className="mb-2 text-sm font-medium">Assigned</p>

            <div className="flex flex-wrap gap-2">
              {assignedCategories.length === 0 ? (
                <span className="text-muted-foreground text-sm">
                  No categories
                </span>
              ) : (
                assignedCategories.map((category) => (
                  <Badge key={category.id} className="flex items-center gap-1">
                    {category.title}

                    <button onClick={() => handleRemove(category)}>
                      <X className="h-3 w-3" />
                    </button>
                  </Badge>
                ))
              )}
            </div>
          </div>

          <div>
            <p className="mb-2 text-sm font-medium">Existing Categories</p>

            <div className="flex flex-wrap gap-2">
              {allCategories
                .filter(
                  (c) =>
                    !assignedCategories.some((assigned) => assigned.id === c.id)
                )
                .map((category) => (
                  <Badge
                    key={category.id}
                    variant="outline"
                    className="cursor-pointer"
                    onClick={() => handleAssign(category)}
                  >
                    {category.title}
                  </Badge>
                ))}
            </div>
          </div>

          <div className="flex gap-2">
            <Input
              value={newCategory}
              onChange={(e) => setNewCategory(e.target.value)}
              placeholder="New category..."
            />

            <Button onClick={handleCreate}>
              <Plus className="mr-2 h-4 w-4" />
              Add
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

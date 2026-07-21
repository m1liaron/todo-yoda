import { Category } from '../category';

type Task = {
  id: number;
  title: string;
  done: boolean;
  priority: number;
  owner_id: number;
  categories: Category[];
};

export { type Task };

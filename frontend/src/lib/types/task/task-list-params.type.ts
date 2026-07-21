import { TaskSortField, SortOrder } from './index';

type TaskListParams = {
  page?: number;
  status?: boolean;
  sort?: TaskSortField;
  sortOrder?: SortOrder;
  startDate?: string;
  endDate?: string;
};

export { type TaskListParams };

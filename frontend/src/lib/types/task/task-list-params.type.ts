import { TaskSortField, SortOrder } from "./index";

type TaskListParams = {
  page?: number;
  status?: boolean;
  sort?: TaskSortField;
  sortOrder?: SortOrder;
};

export { type TaskListParams };
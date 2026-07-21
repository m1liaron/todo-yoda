import {
  Task,
  TaskInput,
  TaskListParams,
  TaskListResponse,
} from '../../types/task';
import { request } from './api';

const tasksApi = {
  list: (params: TaskListParams = {}) => {
    const search = new URLSearchParams();
    if (params.page !== undefined) search.set('page', String(params.page));
    if (params.status !== undefined)
      search.set('status', String(params.status));
    if (params.sort !== undefined) search.set('sort', params.sort);
    if (params.sortOrder !== undefined)
      search.set('sortOrder', params.sortOrder);
    if (params.startDate !== undefined)
      search.set('startDate', params.startDate);
    if (params.endDate !== undefined) search.set('endDate', params.endDate);

    const qs = search.toString();
    return request<TaskListResponse>(`/tasks/${qs ? `?${qs}` : ''}`, {});
  },

  create: (input: TaskInput) =>
    request<Task>('/tasks/', { method: 'POST', body: JSON.stringify(input) }),

  update: (id: number, input: Partial<TaskInput>) =>
    request<Task>(`/tasks/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    }),

  remove: (id: number) => request<void>(`/tasks/${id}`, { method: 'DELETE' }),
};

export { tasksApi };

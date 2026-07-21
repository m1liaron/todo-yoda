import { Category } from '../../types/category';
import { request } from './api';

const categoriesApi = {
  list: () => request<Category[]>('/categories/'),
  create: (input: { title: string }) =>
    request<Category>('/categories/', {
      method: 'POST',
      body: JSON.stringify(input),
    }),
  update: (id: number, input: { title?: string }) =>
    request<Category>(`/categories/${id}`, {
      method: 'PUT',
      body: JSON.stringify(input),
    }),
  remove: (id: number) =>
    request<void>(`/categories/${id}`, { method: 'DELETE' }),
  assign: (taskId: number, categoryId: number) =>
    request<void>(`/categories/${taskId}/categories/${categoryId}`, {
      method: 'POST',
    }),
  remove_assign: (taskId: number, categoryId: number) =>
    request<void>(`/categories/${taskId}/categories/${categoryId}`, {
      method: 'DELETE',
    }),
};

export { categoriesApi };

import { Task } from "./index";

type TaskListResponse = {
    data: Task[];
    has_more_pages: boolean;
    page_number: number;
};

export { type TaskListResponse };
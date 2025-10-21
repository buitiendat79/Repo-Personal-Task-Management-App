import { setupServer } from "msw/node";
import { http, HttpResponse } from "msw";

export const handlers = [
  // Lấy danh sách task
  http.get(`${import.meta.env.VITE_SUPABASE_URL}/tasks`, () => {
    return HttpResponse.json([
      { id: 1, title: "Mock Task 1", priority: "High", completed: false },
      { id: 2, title: "Mock Task 2", priority: "Low", completed: true },
    ]);
  }),

  // create task
  http.post(
    `${import.meta.env.VITE_SUPABASE_URL}/tasks`,
    async ({ request }) => {
      const body = await request.json();
      return HttpResponse.json({ ...body, id: Date.now() });
    }
  ),

  http.put(
    `${import.meta.env.VITE_SUPABASE_URL}/tasks/:id`,
    async ({ params, request }) => {
      const body = await request.json();
      return HttpResponse.json({ id: params.id, ...body });
    }
  ),
];

export const server = setupServer(...handlers);

const API_URL = import.meta.env.VITE_API_URL;

export async function registerUser(data: { email: string; password: string; first_name: string; last_name: string; }) {
  const res = await fetch(`${API_URL}/users/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function loginUser(data: { email: string; password: string; }) {
  const res = await fetch(`${API_URL}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json(); // Should return { access_token: string }
}

export async function fetchChats(token: string) {
  const res = await fetch(`${API_URL}/chat/chats`, {
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

export async function sendMessage(token: string, chatId: number, content: string) {
  const res = await fetch(`${API_URL}/chat/messages`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ chat_id: chatId, content }),
  });
  if (!res.ok) throw new Error(await res.text());
  return res.json();
}

"use client";
// import { verifyToken } from "@/lib/auth";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getToken, clearToken } from "@/lib/auth";
import {jwtDecode} from "jwt-decode";
interface Tenant {
  id: number;
  slug: string;
  plan: "free" | "pro";
}

interface Note {
  id: number;
  title: string;
  content: string;
  tenant: Tenant;
}

type NotesResponse = Note[] | { error: string };
type NoteResponse = Note | { error: string };

interface MyTokenPayload {
  userId: number;
  tenantId: number;
  role: string;
  tenantSlug: string;
  iat: number;
  exp: number;
}

export default function NotesPage() {
  const router = useRouter();
  const [notes, setNotes] = useState<Note[]>([]);
  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [error, setError] = useState("");
  const [tenantPlan, setTenantPlan] = useState<"free" | "pro">("free");

  const token = getToken();

  useEffect(() => {
    if (!token) {
      router.push("/");
    } else {
      fetchNotes();
    }
  }, [token]);

  async function fetchNotes() {
    try {
      const res = await fetch("/api/notes", {
        headers: { Authorization: `Bearer ${token}` },
      });

      const data: NotesResponse = await res.json();

      if (res.ok && Array.isArray(data)) {
        setNotes(data);
        if (data.length && data[0].tenant) setTenantPlan(data[0].tenant.plan);
      } else {
        setError("error" in data ? data.error : "Failed to fetch notes");
      }
    } catch {
      setError("Failed to fetch notes");
    }
  }

  async function createNote(e: React.FormEvent) {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/notes", {
        method: "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body: JSON.stringify({ title, content }),
      });

      const data: NoteResponse = await res.json();

      if (res.ok && "id" in data) {
        setNotes((prev) => [data, ...prev]);
        setTitle("");
        setContent("");
      } else {
        setError("error" in data ? data.error : "Failed to create note");
      }
    } catch {
      setError("Failed to create note");
    }
  }

  async function deleteNote(id: number) {
    try {
      const res = await fetch(`/api/notes/${id}`, {
        method: "DELETE",
        headers: { Authorization: `Bearer ${token}` },
      });
      if (res.ok) setNotes((prev) => prev.filter((n) => n.id !== id));
    } catch {
      setError("Failed to delete note");
    }
  }

 
async function upgradeTenant() {
  if (!token) {
  setError("No token found");
  return;
}
  const decoded = jwtDecode<MyTokenPayload>(token);
  console.log("Decoded token:", decoded);
  const slug = decoded.tenantSlug;
  if (!slug) {
    setError("Tenant slug missing from token");
    return;
  }

  try {
    const res = await fetch(`/api/tenants/${slug}/upgrade`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });

    const data = await res.json();

    if (res.ok) {
      alert("Tenant upgraded to Pro!");
      setTenantPlan("pro");
      await fetchNotes();
    } else {
      setError("error" in data ? data.error : "Upgrade failed");
    }
  } catch {
    setError("Upgrade failed");
  }
}

  function handleLogout() {
    clearToken();
    router.push("/");
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">
      <div className="max-w-3xl mx-auto bg-white p-6 rounded shadow-md">
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Notes</h2>
          <button
            onClick={handleLogout}
            className="bg-gray-800 text-white px-3 py-1 rounded hover:bg-gray-900 transition"
          >
            Logout
          </button>
        </div>

        <form onSubmit={createNote} className="mb-4 space-y-2">
          <input
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 shadow-sm"
            required
          />
          <textarea
            placeholder="Content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full px-4 py-2 border rounded focus:outline-none focus:ring-2 focus:ring-blue-500 text-gray-900 shadow-sm"
            required
          />
          <button
            type="submit"
            className="bg-blue-500 text-white py-2 px-4 rounded hover:bg-blue-600 transition"
          >
            Add Note
          </button>
        </form>

        {tenantPlan === "free" && notes.length >= 3 && (
          <button
            onClick={upgradeTenant}
            className="mb-4 bg-green-500 text-white py-2 px-4 rounded hover:bg-green-600 transition"
          >
            Upgrade to Pro
          </button>
        )}

        {error && <p className="text-red-500 mb-2">{error}</p>}

        <ul className="space-y-4">
          {notes.map((n) => (
            <li key={n.id} className="border p-4 rounded bg-gray-50 shadow-sm">
              <h4 className="font-bold text-gray-900">{n.title}</h4>
              <p className="mb-2 text-gray-700">{n.content}</p>
              <button
                onClick={() => deleteNote(n.id)}
                className="bg-red-500 text-white py-1 px-3 rounded hover:bg-red-600 transition"
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

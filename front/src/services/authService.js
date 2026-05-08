export async function apiLogin(email, senha) {
    const res = await fetch("/api/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email, senha }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Falha no login.");
    return data; // { token, user }
  }
  
  export async function apiSignup(nome, email, senha) {
    const res = await fetch("/api/signup", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ nome, email, senha }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Falha no cadastro.");
    return data;
  }
  
  export async function apiGetMe(token) {
    const res = await fetch("/api/me", {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Token inválido");
    return res.json(); // { user }
  }
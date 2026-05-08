export async function apiGetAgendamentos(token) {
    const res = await fetch("/api/agendamentos", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Falha ao buscar agendamentos.");
    return data; // array de agendamentos
  }
  
  export async function apiCreateAgendamento(token, agendamento) {
    const res = await fetch("/api/agendamentos", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(agendamento),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Falha ao criar agendamento.");
    return data;
  }
// ─── Daycare Service ──────────────────────────────────────────────────────────

export async function apiVerificarDayTeste(token, petId) {
    const res = await fetch(`/api/daycare/verificar-day-teste/${petId}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Erro ao verificar Day Teste.");
    return res.json(); // { aprovado: true | false }
  }
  
  export async function apiVerificarVagas(token, data) {
    const res = await fetch(`/api/daycare/vagas?data=${data}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    if (!res.ok) throw new Error("Erro ao verificar vagas.");
    return res.json(); // { ocupados, disponivel, maximo }
  }
  
  export async function apiCriarAgendamentoDaycare(token, dados) {
    const res = await fetch("/api/daycare/agendar", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(dados),
    });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.error || "Erro ao criar agendamento.");
    }
    return res.json();
  }
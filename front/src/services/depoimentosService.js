export async function apiGetDepoimentos() {
    const res = await fetch("/api/depoimentos");
    if (!res.ok) throw new Error("Falha ao buscar depoimentos.");
    return res.json(); // array de depoimentos
  }
  
  export async function apiCreateDepoimento(depoimento) {
    const res = await fetch("/api/depoimentos", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(depoimento),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Falha ao enviar depoimento.");
    return data;
  }
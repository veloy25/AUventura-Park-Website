export async function apiGetPets(token) {
    const res = await fetch("/api/pets", {
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Falha ao buscar pets.");
    return data; // array de pets
  }
  
  export async function apiCreatePet(token, pet) {
    const res = await fetch("/api/pets", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(pet),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Falha ao cadastrar pet.");
    return data;
  }
  
  export async function apiDeletePet(token, petId) {
    const res = await fetch(`/api/pets/${petId}`, {
      method: "DELETE",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || "Falha ao remover pet.");
    return data;
  }
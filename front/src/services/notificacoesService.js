// API client para o serviço de notificações

export async function apiGetNotificacoes(token) {
  const res = await fetch("/api/notificacoes", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Falha ao buscar notificações.");
  return data;
}

export async function apiGetNotificacoesNaoLidas(token) {
  const res = await fetch("/api/notificacoes/nao-lidas", {
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Falha ao buscar notificações não lidas.");
  return data;
}

export async function apiMarcarNotificacaoComoLida(token, id) {
  const res = await fetch(`/api/notificacoes/${id}/lida`, {
    method: "PATCH",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Falha ao marcar notificação como lida.");
  return data;
}

export async function apiExcluirNotificacao(token, id) {
  const res = await fetch(`/api/notificacoes/${id}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Falha ao excluir notificação.");
  return data;
}
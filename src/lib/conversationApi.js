import api from "./api"

export async function fetchConversations() {
  const { data } = await api.get("/chat/get-Conversations")

  return data.conversation || []
}

export async function createConversation() {
  const { data } = await api.post("/chat/create-conversation")

  return data.conversation
}

export async function fetchMessages(conversationId) {
  const { data } = await api.get(`/chat/get-messages/${conversationId}`)

  return data.messages || []
}

export async function renameConversation(id, title) {
  const { data } = await api.post("/chat/update-conversation", { id, title })

  return data.conversation
}

export async function deleteConversation(id) {
  await api.delete(`/chat/delete-conversation/${id}`)
}

import { GoogleAuthProvider, signInWithPopup } from "firebase/auth"

import api from "./api"

import { firebaseAuth } from "./firebase"

const googleProvider = new GoogleAuthProvider()

export async function signInWithGoogle() {
  const result = await signInWithPopup(firebaseAuth, googleProvider)

  const token = await result.user.getIdToken()

  await api.post("/auth/login", { token })

  const { data } = await api.get("/me")

  return data
}

export async function getCurrentUser() {
  const { data } = await api.get("/me")

  return data
}

export async function logout() {
  await api.get("/auth/logout")
}

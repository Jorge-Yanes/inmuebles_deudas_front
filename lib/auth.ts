import type { User } from "@/types/user"

// Simulated authentication functions
// In a real application, you would use Firebase Authentication

// Sample users for demonstration
const sampleUsers: User[] = [
  {
    id: "1",
    name: "Admin Usuario",
    email: "admin@ejemplo.com",
    role: "admin",
  },
  {
    id: "2",
    name: "Usuario Normal",
    email: "usuario@ejemplo.com",
    role: "user",
  },
]

// Store the current user in localStorage
const CURRENT_USER_KEY = "current_user"

// Login user
export async function loginUser(email: string, password: string): Promise<User> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1000))

  // In a real app, you would validate credentials with Firebase
  // For demo, accept any email with password "password"
  if (password !== "password") {
    throw new Error("Invalid credentials")
  }

  // Find user by email or create a new one
  let user = sampleUsers.find((u) => u.email === email)

  if (!user) {
    // Create a new user if not found (for demo purposes)
    user = {
      id: Math.random().toString(36).substring(2, 9),
      name: email.split("@")[0],
      email,
      role: "user",
    }
  }

  // Store user in localStorage
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))

  return user
}

// Register user
export async function registerUser(name: string, email: string, password: string): Promise<User> {
  // Simulate API delay
  await new Promise((resolve) => setTimeout(resolve, 1500))

  // In a real app, you would create a user in Firebase
  // For demo, create a new user object
  const user: User = {
    id: Math.random().toString(36).substring(2, 9),
    name,
    email,
    role: "user",
  }

  // Store user in localStorage
  localStorage.setItem(CURRENT_USER_KEY, JSON.stringify(user))

  return user
}

// Get current user
export async function getCurrentUser(): Promise<User | null> {
  // In a real app, you would check Firebase auth state
  const userJson = localStorage.getItem(CURRENT_USER_KEY)
  if (!userJson) return null

  return JSON.parse(userJson)
}

// Logout user
export async function logout(): Promise<void> {
  // In a real app, you would sign out from Firebase
  localStorage.removeItem(CURRENT_USER_KEY)
}

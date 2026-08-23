"use client"

import Link from "next/link"
import { useActionState } from "react"
import { login, register, type AuthState } from "@/app/actions/auth"
import { Button } from "./ui/Button"

const field =
  "h-11 w-full rounded-lg border border-line-strong bg-surface px-3 text-sm outline-none focus:border-ink"

export function LoginForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    login,
    undefined
  )

  return (
    <form action={action} className="space-y-4">
      <Field label="Email" name="email" type="email" autoComplete="email" required />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="current-password"
        required
      />
      {state?.error && (
        <p role="alert" className="text-sm text-sale">
          {state.error}
        </p>
      )}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Signing in…" : "Sign in"}
      </Button>
      <p className="text-center text-sm text-ink-muted">
        New here?{" "}
        <Link href="/signup" className="text-accent underline-offset-4 hover:underline">
          Create an account
        </Link>
      </p>
    </form>
  )
}

export function SignupForm() {
  const [state, action, pending] = useActionState<AuthState, FormData>(
    register,
    undefined
  )

  return (
    <form action={action} className="space-y-4">
      <Field label="Full name" name="first_name" autoComplete="name" required />
      <Field label="Email" name="email" type="email" autoComplete="email" required />
      <Field
        label="Mobile number (optional)"
        name="phone"
        inputMode="numeric"
        placeholder="10 digits"
      />
      <Field
        label="Password"
        name="password"
        type="password"
        autoComplete="new-password"
        placeholder="At least 8 characters"
        required
      />
      {state?.error && (
        <p role="alert" className="text-sm text-sale">
          {state.error}
        </p>
      )}
      <Button type="submit" size="lg" className="w-full" disabled={pending}>
        {pending ? "Creating account…" : "Create account"}
      </Button>
      <p className="text-center text-sm text-ink-muted">
        Already have an account?{" "}
        <Link href="/login" className="text-accent underline-offset-4 hover:underline">
          Sign in
        </Link>
      </p>
    </form>
  )
}

function Field({
  label,
  name,
  ...props
}: { label: string; name: string } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <label htmlFor={name} className="mb-1 block text-xs text-ink-muted">
        {label}
      </label>
      <input id={name} name={name} className={field} {...props} />
    </div>
  )
}

import type { Metadata } from "next"
import { redirect } from "next/navigation"
import { SignupForm } from "@/components/AuthForms"
import { getCustomer } from "@/lib/auth"

export const metadata: Metadata = {
  title: "Create account",
  robots: { index: false, follow: true },
}

export const dynamic = "force-dynamic"

export default async function SignupPage() {
  if (await getCustomer()) redirect("/account")

  return (
    <div className="mx-auto max-w-sm px-4 py-16 sm:px-6">
      <h1 className="text-display text-3xl font-semibold">Create account</h1>
      <p className="mt-2 text-sm text-ink-muted">
        Save your addresses and follow every order.
      </p>
      <div className="mt-8">
        <SignupForm />
      </div>
    </div>
  )
}

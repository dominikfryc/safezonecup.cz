import { LoginForm } from "@/components/login-form"

export default async function LoginPage(props: { searchParams: Promise<{ error?: string }> }) {
  const searchParams = await props.searchParams;
  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 md:p-10">
      <div className="w-full max-w-sm md:max-w-4xl">
        <LoginForm error={searchParams?.error} />
      </div>
    </div>
  )
}

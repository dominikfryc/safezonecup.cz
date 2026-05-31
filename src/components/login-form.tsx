import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import {
  Field,
  FieldGroup,
  FieldLabel,
} from "@/components/ui/field"
import { Input } from "@/components/ui/input"
import { login } from "@/app/admin/login/actions"

interface LoginFormProps extends React.ComponentProps<"div"> {
  error?: string;
}

export function LoginForm({
  className,
  error,
  ...props
}: LoginFormProps) {
  return (
    <div className={cn("flex flex-col gap-6", className)} {...props}>
      <Card className="overflow-hidden p-0 shadow-2xl">
        <CardContent className="grid p-0 md:grid-cols-2">
          <form action={login} className="p-6 md:p-8 flex flex-col justify-center">
            <FieldGroup>
              <div className="flex flex-col items-center gap-2 text-center mb-6">
                <h1 className="text-2xl font-bold">Admin Access</h1>
                <p className="text-balance text-muted-foreground">
                  Sign in to manage the tournament
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="email">Email</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@example.com"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Password</FieldLabel>
                <Input id="password" name="password" type="password" required />
              </Field>
              
              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm mt-2">
                  {error}
                </div>
              )}

              <Field className="mt-4">
                <Button type="submit" className="w-full">Sign In</Button>
              </Field>
            </FieldGroup>
          </form>
          <div className="relative hidden bg-muted md:block">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src="/placeholder.svg"
              alt="Image"
              className="absolute inset-0 h-full w-full object-cover dark:brightness-[0.2] dark:grayscale"
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

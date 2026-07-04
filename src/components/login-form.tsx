import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { login } from '@/app/admin/login/actions';

interface LoginFormProps extends React.ComponentProps<'div'> {
  error?: string;
}

export function LoginForm({ className, error, ...props }: LoginFormProps) {
  return (
    <div className={cn('flex flex-col gap-6', className)} {...props}>
      <Card className="overflow-hidden p-0 shadow-none">
        <CardContent className="p-0">
          <form action={login} className="p-6 md:p-8 flex flex-col justify-center">
            <FieldGroup>
              <div className="flex flex-col items-center gap-1 text-center mb-4">
                <h1 className="text-2xl font-bold">Administrace</h1>
                <p className="text-balance text-muted-foreground text-sm">
                  Přihlaste se pro správu turnaje
                </p>
              </div>
              <Field>
                <FieldLabel htmlFor="email">E-mail</FieldLabel>
                <Input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="admin@example.com"
                  required
                />
              </Field>
              <Field>
                <FieldLabel htmlFor="password">Heslo</FieldLabel>
                <Input id="password" name="password" type="password" required />
              </Field>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm mt-2">
                  {error}
                </div>
              )}

              <Field className="mt-2">
                <Button type="submit" className="w-full">
                  Přihlásit se
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

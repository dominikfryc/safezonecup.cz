import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Field, FieldGroup, FieldLabel } from '@/components/ui/field';
import { Input } from '@/components/ui/input';
import { updatePassword } from './actions';

export default async function UpdatePasswordPage(props: {
  searchParams: Promise<{ error?: string }>;
}) {
  const searchParams = await props.searchParams;
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    redirect('/admin/login');
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-6 md:p-10">
      <Card className="w-full max-w-sm shadow-2xl rounded-md">
        <CardHeader>
          <CardTitle className="text-2xl font-bold text-center">Update Password</CardTitle>
          <CardDescription className="text-center">Enter your new password below.</CardDescription>
        </CardHeader>
        <CardContent>
          <form action={updatePassword}>
            <FieldGroup>
              <Field>
                <FieldLabel htmlFor="password">New Password</FieldLabel>
                <Input id="password" name="password" type="password" required minLength={6} />
              </Field>

              {searchParams?.error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-destructive text-sm mt-2">
                  {searchParams.error}
                </div>
              )}

              <Field className="mt-4">
                <Button type="submit" className="w-full">
                  Save Password
                </Button>
              </Field>
            </FieldGroup>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

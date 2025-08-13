'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/app/context/AuthContext';
import { query } from '@/app/config/db';
import { toast } from 'react-hot-toast';
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
});

export default function UserNameForm({ onSuccess }: { onSuccess: (name: string) => void }) {
  const { user } = useAuth();
  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user) return;

    try {
      // Check if user already exists
      const userCheck = await query('SELECT * FROM users WHERE uid = $1', [user.uid]);
      
      if (userCheck.rows.length > 0) {
        // Update existing user
        await query('UPDATE users SET name = $1 WHERE uid = $2', [values.name, user.uid]);
      } else {
        // Create new user
        await query(
          'INSERT INTO users (uid, email, name) VALUES ($1, $2, $3)',
          [user.uid, user.email, values.name]
        );
      }

      toast.success('Name saved successfully!');
      onSuccess(values.name);
    } catch (error) {
      console.error('Error saving user name:', error);
      toast.error('Failed to save name. Please try again.');
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Tell Us Your Name</CardTitle>
        <CardDescription>
          We'd like to personalize your experience by knowing your name.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Your Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Enter your name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <Button type="submit">Save</Button>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
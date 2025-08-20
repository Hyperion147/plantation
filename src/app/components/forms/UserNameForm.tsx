'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';
import { useState } from 'react';
import { useAuth } from '@/app/context/AuthContext';

// Define proper types for user metadata
interface UserMetadata {
  name?: string;
  avatar_url?: string;
  [key: string]: unknown; // Allow for other properties
}

const formSchema = z.object({
  display_name: z.string().min(2, {
    message: 'Name must be at least 2 characters.',
  }),
});

interface UserNameFormProps {
  onSuccess: (name: string) => void;
}

export default function UserNameForm({ onSuccess }: UserNameFormProps) {
  const { user } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Safely get user metadata with proper typing
  const userMetadata = user?.user_metadata as UserMetadata | undefined;
  const initialName = userMetadata?.name || '';

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      display_name: initialName,
    },
  });

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!user?.id) {
      toast.error('You must be logged in');
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch(`/api/user/${user.id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          name: values.display_name,
          avatar_url: userMetadata?.avatar_url ?? null,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to update user');
      }

      toast.success('Name updated successfully!');
      onSuccess(values.display_name);
    } catch (error) {
      console.error('Error updating user:', error);
      toast.error('Failed to update name', {
        description: 'Please try again later',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-muted p-6 rounded-lg mb-6">
      <h3 className="text-lg font-semibold mb-4">Welcome! Please set your display name</h3>
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="display_name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Display Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter your name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <Button type="submit" disabled={isSubmitting}>
            {isSubmitting ? 'Saving...' : 'Save Name'}
          </Button>
        </form>
      </Form>
    </div>
  );
}
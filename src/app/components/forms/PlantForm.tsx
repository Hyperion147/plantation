'use client';

import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { Button } from '@/components/ui/button';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';
import { query } from '@/app/config/db';
import { getStorage, ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { useState } from 'react';
import ReactCrop, { Crop } from 'react-image-crop';
import 'react-image-crop/dist/ReactCrop.css';

const formSchema = z.object({
  name: z.string().min(2, {
    message: 'Plant name must be at least 2 characters.',
  }),
  description: z.string().optional(),
});

export default function PlantForm({ userId, userName }: { userId?: string; userName: string }) {
  const [image, setImage] = useState<string | null>(null);
  const [crop, setCrop] = useState<Crop>();
  const [croppedImage, setCroppedImage] = useState<string | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: '',
      description: '',
    },
  });

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener('load', () => {
        setImage(reader.result?.toString() || null);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleCropComplete = (crop: Crop) => {
    if (image && crop.width && crop.height) {
      const canvas = document.createElement('canvas');
      const scaleX = crop.width / crop.width;
      const scaleY = crop.height / crop.height;
      canvas.width = crop.width;
      canvas.height = crop.height;
      const ctx = canvas.getContext('2d');
      
      const imageElement = new Image();
      imageElement.src = image;
      
      imageElement.onload = () => {
        ctx?.drawImage(
          imageElement,
          crop.x * scaleX,
          crop.y * scaleY,
          crop.width * scaleX,
          crop.height * scaleY,
          0,
          0,
          crop.width,
          crop.height
        );
        
        const croppedImageUrl = canvas.toDataURL('image/jpeg');
        setCroppedImage(croppedImageUrl);
      };
    }
  };

  const getLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
          toast.success('Location captured! Your plant location has been saved.');
        },
        (error) => {
          toast.error('Could not get your location. Please enable location services.');
        }
      );
    } else {
      toast.error('Your browser does not support geolocation.');
    }
  };

  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    if (!userId) {
      toast.error('Please login to track plants.');
      return;
    }

    if (!croppedImage) {
      toast.error('Please upload and crop an image of your plant.');
      return;
    }

    if (!location) {
      toast.error('Please capture your location to tag the plant.');
      return;
    }

    setIsUploading(true);

    try {
      const savePromise = new Promise(async (resolve, reject) => {
        try {
          // Upload image to Firebase Storage
          const storage = getStorage();
          const storageRef = ref(storage, `plants/${userId}/${Date.now()}.jpg`);
          
          const blob = await fetch(croppedImage).then(r => r.blob());
          await uploadBytes(storageRef, blob);
          const imageUrl = await getDownloadURL(storageRef);

          // Save plant to PostgreSQL
          const res = await query(
            `INSERT INTO plants (name, description, image_url, location, user_id, user_name) 
             VALUES ($1, $2, $3, ST_SetSRID(ST_MakePoint($4, $5), 4326), $6, $7) 
             RETURNING id`,
            [
              values.name,
              values.description,
              imageUrl,
              location.lng,
              location.lat,
              userId,
              userName,
            ]
          );

          resolve(res.rows[0].id);
        } catch (error) {
          reject(error);
        }
      });

      const plantId = await toast.promise(savePromise, {
        loading: 'Saving your plant...',
        success: (id) => `Plant ${values.name} saved successfully with ID: ${id}`,
        error: 'There was an error saving your plant. Please try again.',
      });

      // Reset form
      form.reset();
      setImage(null);
      setCroppedImage(null);
      setLocation(null);
    } catch (error) {
      console.error('Error saving plant:', error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={form.control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Plant Name</FormLabel>
                <FormControl>
                  <Input placeholder="Enter plant name" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          
          <div>
            <FormLabel>Plant Image</FormLabel>
            <div className="space-y-4">
              <Input 
                type="file" 
                accept="image/*" 
                onChange={handleImageUpload} 
                className="cursor-pointer"
              />
              
              {image && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Crop your image:</p>
                  <ReactCrop
                    crop={crop}
                    onChange={(c) => setCrop(c)}
                    onComplete={handleCropComplete}
                    aspect={1}
                    className="max-w-full rounded-md border"
                  >
                    <img 
                      src={image} 
                      alt="Plant preview" 
                      className="max-h-64 object-contain"
                    />
                  </ReactCrop>
                </div>
              )}
              
              {croppedImage && (
                <div>
                  <p className="text-sm text-muted-foreground mb-2">Cropped preview:</p>
                  <img 
                    src={croppedImage} 
                    alt="Cropped plant" 
                    className="w-32 h-32 object-cover rounded-md border"
                  />
                </div>
              )}
            </div>
          </div>
        </div>
        
        <FormField
          control={form.control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Description (Optional)</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Tell us about your plant..."
                  className="resize-none"
                  {...field}
                />
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />
        
        <div className="space-y-4">
          <div className="flex items-center gap-4">
            <Button 
              type="button" 
              variant="outline" 
              onClick={getLocation}
              disabled={!navigator.geolocation}
            >
              {location ? 'Location Captured' : 'Capture Location'}
            </Button>
            {location && (
              <span className="text-sm text-muted-foreground">
                Lat: {location.lat.toFixed(4)}, Lng: {location.lng.toFixed(4)}
              </span>
            )}
          </div>
          
          <Button 
            type="submit" 
            disabled={isUploading}
            className="w-full md:w-auto"
          >
            {isUploading ? (
              <span className="flex items-center gap-2">
                <span className="animate-spin">↻</span>
                Saving...
              </span>
            ) : (
              'Save Plant'
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
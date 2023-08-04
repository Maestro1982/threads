import * as z from 'zod';

export const UserValidation = z.object({
  profile_photo: z.string().url().nonempty(),
  name: z
    .string()
    .min(3, { message: 'Minimum of 3 characters is required.' })
    .max(30, { message: 'Maximum of 30 characters is required.' }),
  username: z
    .string()
    .min(3, { message: 'Minimum of 3 characters is required.' })
    .max(30, { message: 'Maximum of 30 characters is required.' }),
  bio: z
    .string()
    .min(3, { message: 'Minimum of 3 characters is required.' })
    .max(1000, { message: 'Maximum of 1000 characters is required.' }),
});

import { fail, redirect } from '@sveltejs/kit';
import { auth } from '$lib/server/auth';

export const actions = {
	updateAvatar: async ({ request, locals }) => {
		if (!locals.user) {
			redirect(302, '/login');
		}

		const formData = await request.formData();
		const file = formData.get('avatar') as File | null;

		if (!file || file.size === 0) {
			return fail(400, { error: 'No file provided' });
		}

		const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
		if (!allowedTypes.includes(file.type)) {
			return fail(400, { error: 'Invalid file type. Allowed: JPEG, PNG, WebP, GIF' });
		}

		const maxSize = 5 * 1024 * 1024;
		if (file.size > maxSize) {
			return fail(400, { error: 'File too large. Maximum size is 5MB' });
		}

		const buffer = await file.arrayBuffer();
		const base64 = Buffer.from(buffer).toString('base64');
		const dataUrl = `data:${file.type};base64,${base64}`;

		try {
			await auth.api.updateUser({
			body: {
				user: {
					id: locals.user.id,
					image: dataUrl
				}
			},
			headers: {
				cookie: request.headers.get('cookie') || ''
			}
		});
		} catch(err) {
			console.log(err);
		}

		return { success: true };
	}
};

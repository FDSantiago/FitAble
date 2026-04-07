import nodemailer from 'nodemailer';
import { betterAuth } from 'better-auth/minimal';
import { drizzleAdapter } from 'better-auth/adapters/drizzle';
import { sveltekitCookies } from 'better-auth/svelte-kit';
import { env } from '$env/dynamic/private';
import { getRequestEvent } from '$app/server';
import { db } from '$lib/server/db';
import { SMTP_PASSWORD, SMTP_USERNAME } from '$env/static/private';
import { APP_NAME, BASE_URL } from '$lib/config';

const smtpTransporter = nodemailer.createTransport({
	host: 'mail.smtp2go.com',
	port: 465,
	secure: true,
	auth: {
		user: SMTP_USERNAME,
		pass: SMTP_PASSWORD
	}
});

try {
	await smtpTransporter.verify();
	console.log('SMTP Server is ready to accept messages');
} catch (err) {
	console.error('An error occurred while verifying the SMTP server:', err);
}

export const auth = betterAuth({
	baseURL: env.ORIGIN,
	secret: env.BETTER_AUTH_SECRET,
	database: drizzleAdapter(db, { provider: 'pg' }),
	emailAndPassword: {
		enabled: true,
		autoSignIn: false,
		requireEmailVerification: true
	},
	plugins: [
		sveltekitCookies(getRequestEvent) // make sure this is the last plugin in the array
	],
	emailVerification: {
		sendOnSignUp: true,
		sendVerificationEmail: async ({ user, token }) => {
			const verificationUrl = `${BASE_URL}/verify-email?token=${token}`
			console.log(`Sending verification email to ${user.email}`);
			smtpTransporter.sendMail(
				{
					from: `${APP_NAME} <${APP_NAME.toLowerCase()}@wirefrm.com>`,
					to: user.email,
					subject: `Complete your sign-up for ${APP_NAME}`,
					text: [
						`Hi ${user.name},`,
						`Thanks for signing up for ${APP_NAME}! Please click the link below to verify your email address and activate your account.`,
						`${verificationUrl}`,
						`If you didn't sign up for ${APP_NAME}, please ignore this email.`
					].join("\n")
				}
			).then((result) => {
				console.log(`Sent verification email ${result.messageId} to ${user.email}`);
			})
			.catch((err) => {
				console.error(`An error occurred while sending the verification email to ${user.email}:`, err);
			})
		}
	}
});

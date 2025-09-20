<script lang="ts">
	import { goto } from '$app/navigation';
	import TogglePasswordIcon from '$lib/components/TogglePasswordIcon.svelte';
	import { onMount } from 'svelte';

	let email = '';
	let password = '';
	let showPassword = $state(false);
	let showConfirmPassword = $state(false);
	let confirmPassword = '';
	let displayName = '';
	let isLoading = false;
	let error = '';

	async function handleRegister(event: SubmitEvent) {
		event.preventDefault();
		error = '';

		if (!email || !password || !confirmPassword || !displayName) {
			error = 'Please fill in all fields';
			return;
		}

		if (password !== confirmPassword) {
			error = 'Passwords do not match';
			return;
		}

		if (password.length < 6) {
			error = 'Password must be at least 6 characters';
			return;
		}

		if (displayName.trim().length < 2) {
			error = 'Display name must be at least 2 characters';
			return;
		}

		isLoading = true;

		try {
			const response = await fetch('/api/register', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ email, password, displayName: displayName.trim() })
			});

			const result = await response.json();

			if (response.ok) {
				// Registration successful, now create session
				// Import Firebase auth to get the current user
				const { auth } = await import('$lib/FirebaseConfig');
				const { signInWithEmailAndPassword } = await import('firebase/auth');

				// Sign in the user to get the token
				const userCredential = await signInWithEmailAndPassword(auth, email, password);
				const idToken = await userCredential.user.getIdToken();

				// Create session
				const sessionResponse = await fetch('/api/auth/session', {
					method: 'POST',
					headers: {
						'Content-Type': 'application/json'
					},
					body: JSON.stringify({ idToken })
				});

				if (sessionResponse.ok) {
					console.log('✅ Session created successfully');
				} else {
					console.log('⚠️ Session creation failed, but user is registered');
				}

				// Redirect to app
				goto('/app');
			} else {
				error = result.error || 'Registration failed';
			}
		} catch (err) {
			error = 'Registration failed. Please try again.';
			console.error('Registration error:', err);
		} finally {
			isLoading = false;
		}
	}

	function navigateToLogin() {
		goto('/login');
	}

	function navigateToHome() {
		goto('/');
	}
</script>

<svelte:head>
	<title>Create Account - JHCGN</title>
	<meta name="description" content="Create your JHCGN account" />
	<meta name="viewport" content="width=device-width, initial-scale=1.0" />
</svelte:head>

<div class="register-container">
	<div class="register-card">
		<div class="header">
			<button class="back-btn" onclick={navigateToHome} aria-label="Go back"> ← </button>
			<h1 class="title">Create Account</h1>
			<div class="spacer"></div>
		</div>

		<form onsubmit={handleRegister} class="register-form">
			{#if error}
				<div class="error-message">{error}</div>
			{/if}

			<div class="form-group">
				<label for="email">Email Address</label>
				<input
					id="email"
					type="email"
					bind:value={email}
					placeholder="Enter your email"
					required
					disabled={isLoading}
				/>
			</div>

			<div class="form-group">
				<label for="displayName">Display Name</label>
				<input
					id="displayName"
					type="text"
					bind:value={displayName}
					placeholder="Enter your display name"
					required
					disabled={isLoading}
				/>
			</div>

			<div class="form-group">
				<label for="password">Password</label>
				<div class="password-input-wrapper">
					<input
						id="password"
						type={showPassword ? 'text' : 'password'}
						bind:value={password}
						placeholder="Create a password"
						required
						disabled={isLoading}
					/>
					<label class="toggle-password-label" for="togglePassword">
						<TogglePasswordIcon {showPassword} />
					</label>
					<input type="checkbox" id="togglePassword" bind:checked={showPassword} style="display: none;" />
				</div>
			</div>

			<div class="form-group">
				<label for="confirmPassword">Confirm Password</label>
				<div class="password-input-wrapper">
					<input
						id="confirmPassword"
						type={showConfirmPassword ? 'text' : 'password'}
						bind:value={confirmPassword}
						placeholder="Confirm your password"
						required
						disabled={isLoading}
					/>
					<label class="toggle-password-label" for="toggleConfirmPassword">
						<TogglePasswordIcon {showConfirmPassword} />
					</label>
					<input type="checkbox" id="toggleConfirmPassword" bind:checked={showConfirmPassword} style="display: none;" />
				</div>
			</div>

			<button type="submit" class="register-btn" disabled={isLoading}>
				{isLoading ? 'Creating Account...' : 'Create Account'}
			</button>
		</form>

		<div class="footer">
			<p>Already have an account?</p>
			<button class="link-btn" onclick={navigateToLogin}> Sign In </button>
		</div>
	</div>
</div>

<style>
	.register-container {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 20px;
	}

	.register-card {
		background: white;
		border-radius: 16px;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.1);
		width: 100%;
		max-width: 400px;
		overflow: hidden;
	}

	.header {
		display: flex;
		align-items: center;
		padding: 20px 24px 16px;
		background: #f8f9fa;
	}

	.back-btn {
		background: none;
		border: none;
		font-size: 24px;
		cursor: pointer;
		color: #6c757d;
		padding: 4px;
		border-radius: 4px;
		transition: background-color 0.2s;
	}

	.back-btn:hover {
		background-color: #e9ecef;
	}

	.title {
		font-size: 1.5rem;
		font-weight: 600;
		margin: 0;
		flex: 1;
		text-align: center;
		color: #333;
	}

	.spacer {
		width: 32px;
	}

	.register-form {
		padding: 24px;
	}

	.error-message {
		background: #fee;
		color: #c33;
		padding: 12px;
		border-radius: 8px;
		margin-bottom: 20px;
		font-size: 0.9rem;
		border: 1px solid #fcc;
	}

	.form-group {
		margin-bottom: 20px;
	}

	.form-group label {
		display: block;
		margin-bottom: 6px;
		font-weight: 500;
		color: #333;
		font-size: 0.9rem;
	}

	.form-group input {
		width: 100%;
		padding: 14px;
		border: 2px solid #e9ecef;
		border-radius: 8px;
		font-size: 1rem;
		transition: border-color 0.2s;
		box-sizing: border-box;
	}

	.form-group input:focus {
		outline: none;
		border-color: #667eea;
	}

	.form-group input:disabled {
		background-color: #f8f9fa;
		cursor: not-allowed;
	}

	.register-btn {
		width: 100%;
		padding: 16px;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		color: white;
		border: none;
		border-radius: 8px;
		font-size: 1rem;
		font-weight: 600;
		cursor: pointer;
		transition: transform 0.2s;
		margin-top: 8px;
	}

	.register-btn:hover:not(:disabled) {
		transform: translateY(-1px);
	}

	.register-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
		transform: none;
	}

	.footer {
		padding: 20px 24px 24px;
		text-align: center;
		background: #f8f9fa;
		border-top: 1px solid #e9ecef;
	}

	.footer p {
		margin: 0 0 8px;
		color: #6c757d;
		font-size: 0.9rem;
	}

	.link-btn {
		background: none;
		border: none;
		color: #667eea;
		font-weight: 600;
		cursor: pointer;
		font-size: 0.9rem;
	}

	.link-btn:hover {
		text-decoration: underline;
	}

	@media (max-width: 480px) {
		.register-container {
			padding: 10px;
		}

		.header,
		.register-form,
		.footer {
			padding-left: 20px;
			padding-right: 20px;
		}

		.title {
			font-size: 1.3rem;
		}
	}

	.password-input-wrapper {
		position: relative;
		display: flex;
		align-items: center;
	}
	.password-input-wrapper input[type="password"],
	.password-input-wrapper input[type="text"] {
		flex: 1;
		padding-right: 40px;
	}
	.toggle-password-label {
		position: absolute;
		right: 10px;
		top: 50%;
		transform: translateY(-50%);
		display: flex;
		align-items: center;
		cursor: pointer;
		user-select: none;
	}
</style>

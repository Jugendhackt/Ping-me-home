<script lang="ts">
	import { goto } from '$app/navigation';
	import PasswordInput from '$lib/components/PasswordInput.svelte';
	import { auth } from '$lib/FirebaseConfig';
	import { signInWithEmailAndPassword } from 'firebase/auth';
	import { onMount } from 'svelte';
	
	let email = $state('');
	let password = $state('');
	let isLoading = $state(false);
	let error = $state('');
	
	onMount(() => {
		// Redirect when logged in already
		if (auth.currentUser) {
			goto('/app');
		}
	});

	async function handleLogin(event: SubmitEvent) {
		event.preventDefault();
		if (isLoading) return;
		
		isLoading = true;
		error = '';
		
		try {
			// Try to log-in via Firebase Auth
			const userCredential = await signInWithEmailAndPassword(auth, email, password);
			const user = userCredential.user;
			
			console.log('✅ Login successful for:', user.email);
			
			// Get ID token and create session
			const idToken = await user.getIdToken();
			
			const response = await fetch('/api/auth/session', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({ idToken })
			});
			
			if (response.ok) {
				console.log('✅ Session created successfully');
				goto('/app');
			} else {
				console.error('❌ Session creation failed');
				const responseData = await response.json();
				error = `Session creation failed: ${responseData.error || 'Unknown error'}`;
			}
		} catch (err: any) {
			console.error('❌ Login error:', err);
			
			switch (err.code) {
				case 'auth/user-not-found':
					error = 'User not found';
					break;
				case 'auth/wrong-password':
					error = 'Wrong password';
					break;
				case 'auth/invalid-email':
					error = 'Invalid email address';
					break;
				case 'auth/invalid-credential':
					error = 'Invalid login credentials';
					break;
				default:
					error = 'Login failed. Please try again.';
			}
		} finally {
			isLoading = false;
		}
	}
</script>

<svelte:head>
	<title>Sign In - Ping me Home</title>
	<meta name="description" content="Sign in to your account">
	<meta name="viewport" content="width=device-width, initial-scale=1.0">
</svelte:head>

<div class="login-container">
	<div class="login-card">
		<div class="header">
			<button class="back-btn" onclick={() => goto('/')} aria-label="Go back">
				←
			</button>
			<h1 class="title">Sign In</h1>
			<div class="spacer"></div>
		</div>

		<div class="login-form">
			{#if error}
				<div class="error-message">{error}</div>
			{/if}

			<form onsubmit={handleLogin} class="form">
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

				<PasswordInput
					bind:password={password}
					isLoading={isLoading}
					label="Password"
					elementId="password"
					placeholder="Create a password"
				/>

				<button 
					type="submit"
					disabled={isLoading}
					class="login-btn"
				>
					{isLoading ? 'Signing In...' : 'Sign In'}
				</button>
			</form>
		</div>
		
		<div class="footer">
			<p>Don't have an account?</p>
			<button class="link-btn" onclick={() => goto('/register')}>
				Create Account
			</button>
		</div>
	</div>
</div>

<style>
	.login-container {
		min-height: 100vh;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
		padding: 20px;
	}
	
	.login-card {
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
	
	.login-form {
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
	
	.form {
		display: flex;
		flex-direction: column;
		gap: 20px;
	}
	
	.form-group {
		display: flex;
		flex-direction: column;
	}
	
	.form-group label {
		margin-bottom: 6px;
		font-weight: 500;
		color: #333;
		font-size: 0.9rem;
	}
	
	.form-group input {
		padding: 14px;
		border: 2px solid #e9ecef;
		border-radius: 8px;
		font-size: 1rem;
		transition: border-color 0.2s;
	}
	
	.form-group input:focus {
		outline: none;
		border-color: #667eea;
	}
	
	.form-group input:disabled {
		background-color: #f8f9fa;
		cursor: not-allowed;
	}
	
	.login-btn {
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
	
	.login-btn:hover:not(:disabled) {
		transform: translateY(-1px);
	}
	
	.login-btn:disabled {
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
		.login-container {
			padding: 10px;
		}
		
		.header,
		.login-form,
		.footer {
			padding-left: 20px;
			padding-right: 20px;
		}
		
		.title {
			font-size: 1.3rem;
		}
	}
</style>

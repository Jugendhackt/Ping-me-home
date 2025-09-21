<script lang="ts">
	import PasswordInput from '$lib/components/PasswordInput.svelte';
	import ProfileAvatar from '$lib/components/ProfileAvatar.svelte';
	import { CoordinateService } from '$lib/utils/geoUtils';
	import type { PageData } from './$types';


	let { data }: { data: PageData } = $props();
	

	let displayName = $state(data.user.displayName || '');
	let profileURL = $state(data.user.profileURL || '');
	let currentPassword = $state('');
	let newPassword = $state('');
	let confirmPassword = $state('');
	
	let isUpdatingProfile = $state(false);
	let isUpdatingPassword = $state(false);
	let profileMessage = $state('');
	let passwordMessage = $state('');
	let profileError = $state('');
	let passwordError = $state('');
	let locationInput = $state('');
	let locationMessage = $state('');
	
	
	async function updateProfile() {
		profileError = '';
		profileMessage = '';
		
		if (!displayName.trim()) {
			profileError = 'Display name is required';
			return;
		}
		
		if (displayName.trim().length < 2) {
			profileError = 'Display name must be at least 2 characters';
			return;
		}
		
		isUpdatingProfile = true;
		
		try {
			const response = await fetch('/api/profile/update', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					displayName: displayName.trim(),
					profileURL: profileURL.trim()
				})
			});
			
			const result = await response.json();
			
			if (response.ok) {
				profileMessage = 'Profile updated successfully!';
				// Refresh the page to show updated data
				setTimeout(() => {
					window.location.reload();
				}, 1500);
			} else {
				profileError = result.error || 'Failed to update profile';
			}
		} catch (error) {
			profileError = 'Failed to update profile. Please try again.';
		} finally {
			isUpdatingProfile = false;
		}
	}
	
	async function updatePassword() {
		passwordError = '';
		passwordMessage = '';
		
		if (!currentPassword || !newPassword || !confirmPassword) {
			passwordError = 'All password fields are required';
			return;
		}
		
		if (newPassword.length < 6) {
			passwordError = 'New password must be at least 6 characters';
			return;
		}
		
		if (newPassword !== confirmPassword) {
			passwordError = 'New passwords do not match';
			return;
		}
		
		if (currentPassword === newPassword) {
			passwordError = 'New password must be different from current password';
			return;
		}
		
		isUpdatingPassword = true;
		
		try {
			const response = await fetch('/api/profile/change-password', {
				method: 'POST',
				headers: {
					'Content-Type': 'application/json'
				},
				body: JSON.stringify({
					currentPassword,
					newPassword
				})
			});
			
			const result = await response.json();
			
			if (response.ok) {
				passwordMessage = 'Password updated successfully!';
				currentPassword = '';
				newPassword = '';
				confirmPassword = '';
			} else {
				passwordError = result.error || 'Failed to update password';
			}
		} catch (error) {
			passwordError = 'Failed to update password. Please try again.';
		} finally {
			isUpdatingPassword = false;
		}
	}
  async function handleSetCoordinates() {
    const result = await CoordinateService.setCoordinatesFromInput(locationInput);
    locationMessage = result.message;
  }
	async function handleSetCoordinates2() {
	const result = await CoordinateService.setCoordinatesFromlocation();
	locationMessage = result.message;
  }



</script>

<svelte:head>
	<title>Profile Settings - JHCGN</title>
</svelte:head>

<div class="profile-container">
	<div class="profile-header">
		<h1>Profile Settings</h1>
	</div>
	
	<!-- Profile Information Section -->
	<div class="profile-section">
		<div class="section-header">
			<h2>Profile Information</h2>
			<p>Update your profile details</p>
		</div>
		
		<div class="profile-preview">
			<ProfileAvatar 
				displayName={displayName || data.user.displayName || 'User'} 
				profileURL={profileURL}
				size="large"
			/>
			<div class="preview-text">
				<h3>{displayName || data.user.displayName || 'User'}</h3>
				<p>{data.user.email}</p>
			</div>
		</div>
		
		<form onsubmit={updateProfile} class="profile-form">
			{#if profileMessage}
				<div class="success-message">{profileMessage}</div>
			{/if}
			{#if profileError}
				<div class="error-message">{profileError}</div>
			{/if}
			
			<div class="form-group">
				<label for="displayName">Display Name</label>
				<input
					id="displayName"
					type="text"
					bind:value={displayName}
					placeholder="Enter your display name"
					required
					disabled={isUpdatingProfile}
				/>
			</div>
			
			<div class="form-group">
				<label for="profileURL">Profile Image URL (optional)</label>
				<input
					id="profileURL"
					type="url"
					bind:value={profileURL}
					placeholder="https://example.com/image.jpg"
					disabled={isUpdatingProfile}
				/>
				<small class="help-text">Leave empty to use auto-generated avatar</small>
			</div>
			
			<button type="submit" class="update-btn" disabled={isUpdatingProfile}>
				{isUpdatingProfile ? 'Updating...' : 'Update Profile'}
			</button>
		</form>
	</div>
	
	<!-- Account Security Section -->
	<div class="profile-section">
		<div class="section-header">
			<h2>Account Security</h2>
			<p>Change your account password</p>
		</div>
		
		<form onsubmit={updatePassword} class="profile-form">
			{#if passwordMessage}
				<div class="success-message">{passwordMessage}</div>
			{/if}
			{#if passwordError}
				<div class="error-message">{passwordError}</div>
			{/if}

			<PasswordInput
				bind:password={currentPassword}
				isLoading={isUpdatingPassword}
				label="Current Password"
				elementId="currentPassword"
				placeholder="Enter your current password"
			/>

			<PasswordInput
				bind:password={newPassword}
				isLoading={isUpdatingPassword}
				label="New Password"
				elementId="newPassword"
				placeholder="Enter new password"
			/>

			<PasswordInput
				bind:password={confirmPassword}
				isLoading={isUpdatingPassword}
				label="Confirm New Password"
				elementId="confirmPassword"
				placeholder="Confirm new password"
			/>
			
			<button type="submit" class="update-btn danger" disabled={isUpdatingPassword}>
				{isUpdatingPassword ? 'Updating...' : 'Change Password'}
			</button>
		</form>
	</div>
	<div class="profile-section">
		<div class="section-header">
			<h2>Spawn coords</h2>
			<p>Change your home location password</p>
			

			<div class="form-group">
				<label for="Address">Address</label>
				<input
					id="address"
					type="text"
					bind:value={locationInput} 
					placeholder="Enter your home address"
					required
				/>
			</div>
			
			
			<button class="update-btn" onclick={handleSetCoordinates}>
			Set home location
			</button>

			<button class="update-btn" onclick={handleSetCoordinates2}>
			Set home location to current location
			</button>

			{#if locationMessage}
			<div class="success-message">{locationMessage}</div>
			{/if}

		
		</div>

	</div>
	<!-- Account Information Section -->
	<div class="profile-section">
		<div class="section-header">
			<h2>Account Information</h2>
			<p>Your account details</p>
		</div>
		
		<div class="info-grid">
			<div class="info-item">
				<span class="info-label">User ID</span>
				<div class="info-value">
					<code>{data.user.uid}</code>
				</div>
			</div>
			
			<div class="info-item">
				<span class="info-label">Email Address</span>
				<div class="info-value">{data.user.email}</div>
			</div>
			
			<div class="info-item">
				<span class="info-label">Account Created</span>
				<div class="info-value">
					{data.user.createdAt ? new Date(data.user.createdAt).toLocaleDateString() : 'Unknown'}
				</div>
			</div>
			
			<div class="info-item">
				<span class="info-label">Last Updated</span>
				<div class="info-value">
					{data.user.updatedAt ? new Date(data.user.updatedAt).toLocaleDateString() : 'Unknown'}
				</div>
			</div>
		</div>
	</div>
</div>

<style>
	.profile-container {
		max-width: 800px;
		margin: 0 auto;
	}
	
	.profile-header {
		margin-bottom: 2rem;
	}
	
	.profile-header h1 {
		margin: 0;
		color: var(--text-primary);
		font-size: 2rem;
		font-weight: 700;
	}
	
	.profile-section {
		background: var(--bg-secondary);
		border: 1px solid var(--border-color);
		border-radius: 12px;
		padding: 1.5rem;
		margin-bottom: 1rem;
	}
	
	.section-header {
		margin-bottom: 1.5rem;
	}
	
	.section-header h2 {
		margin: 0 0 0.5rem 0;
		color: var(--text-primary);
		font-size: 1.25rem;
		font-weight: 600;
	}
	
	.section-header p {
		margin: 0;
		color: var(--text-secondary);
		font-size: 0.9rem;
	}
	
	.profile-preview {
		display: flex;
		align-items: center;
		gap: 1rem;
		margin-bottom: 1.5rem;
		padding: 1rem;
		background: var(--bg-tertiary);
		border-radius: 8px;
	}
	
	.preview-text h3 {
		margin: 0 0 0.25rem 0;
		color: var(--text-primary);
		font-size: 1.1rem;
		font-weight: 600;
	}
	
	.preview-text p {
		margin: 0;
		color: var(--text-secondary);
		font-size: 0.9rem;
	}
	
	.profile-form {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}
	
	.form-group {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	
	.form-group label {
		color: var(--text-primary);
		font-size: 0.9rem;
		font-weight: 500;
	}
	
	.form-group input {
		padding: 0.75rem;
		border: 1px solid var(--border-color);
		border-radius: 6px;
		background: var(--bg-primary);
		color: var(--text-primary);
		font-size: 0.9rem;
		transition: border-color 0.2s ease;
	}
	
	.form-group input:focus {
		outline: none;
		border-color: var(--accent-color);
		box-shadow: 0 0 0 3px rgba(52, 152, 219, 0.1);
	}
	
	.form-group input:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
	
	.help-text {
		color: var(--text-secondary);
		font-size: 0.8rem;
	}
	
	.update-btn {
		background: var(--accent-color);
		color: white;
		border: none;
		padding: 0.75rem 1.5rem;
		border-radius: 6px;
		cursor: pointer;
		font-size: 0.9rem;
		font-weight: 500;
		transition: background-color 0.2s ease;
		align-self: flex-start;
	}
	
	.update-btn:hover:not(:disabled) {
		background: var(--accent-hover);
	}
	
	.update-btn:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
	
	.update-btn.danger {
		background: #e74c3c;
	}
	
	.update-btn.danger:hover:not(:disabled) {
		background: #c0392b;
	}
	
	.success-message {
		background: #d4edda;
		color: #155724;
		padding: 0.75rem;
		border-radius: 6px;
		border: 1px solid #c3e6cb;
		font-size: 0.9rem;
	}
	
	.error-message {
		background: #f8d7da;
		color: #721c24;
		padding: 0.75rem;
		border-radius: 6px;
		border: 1px solid #f5c6cb;
		font-size: 0.9rem;
	}
	
	.info-grid {
		display: grid;
		gap: 1rem;
		grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
	}
	
	.info-item {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}
	
	.info-item span.info-label {
		color: var(--text-secondary);
		font-size: 0.8rem;
		font-weight: 500;
		text-transform: uppercase;
		letter-spacing: 0.5px;
	}
	
	.info-value {
		color: var(--text-primary);
		font-size: 0.9rem;
	}
	
	.info-value code {
		background: var(--bg-tertiary);
		padding: 0.25rem 0.5rem;
		border-radius: 4px;
		font-family: monospace;
		font-size: 0.8rem;
		word-break: break-all;
	}
	
	@media (max-width: 768px) {
		.profile-container {
			padding: 0 1rem;
		}
		
		.profile-section {
			padding: 1rem;
		}
		
		.profile-preview {
			flex-direction: column;
			text-align: center;
		}
		
		.info-grid {
			grid-template-columns: 1fr;
		}
	}
</style>
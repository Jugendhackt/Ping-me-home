<script lang="ts">
	import { passwordHiddenIcon, passwordShownIcon } from "./Icons.svelte";

	let { password = $bindable<string>(), isLoading, label, elementId, placeholder } = $props<{
		password: string;
		isLoading: boolean;
        label: string;
        elementId: string;
        placeholder: string;
	}>();

	let showPassword = $state(false);
</script>

<div class="form-group">
	<label for="{elementId}">{label}</label>
	<div class="password-input-wrapper">
		<input
			id="{elementId}"
			type={showPassword ? 'text' : 'password'}
			bind:value={password}
			placeholder={placeholder}
			required
			disabled={isLoading}
		/>
		<label class="toggle-password-label" for="toggle-{elementId}">
			<span class="toggle-password-icon align-center">
				{#if showPassword}
					{@render passwordShownIcon()}
				{:else}
					{@render passwordHiddenIcon()}
				{/if}
			</span>
		</label>
		<input type="checkbox" id="toggle-{elementId}" bind:checked={showPassword} style="display: none;" />
	</div>
</div>

<style>
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
        width: 100%;
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
<script lang="ts">
	import { taskTypes, zoomConfig } from '$lib/config';
	import { m } from '$lib/paraglide/messages';
	import TaskTooltip from '$lib/TaskTooltip.svelte';
	import { onMount } from 'svelte';

	let Gantt: any = $state(),
		Willow: any = $state(),
		Field: any = $state(),
		Locale: any = $state(),
		Switch: any = $state(),
		DatePicker: any = $state(),
		Tooltip: any = $state();
	onMount(async () => {
		const gm = await import('wx-svelte-gantt');
		const cm = await import('wx-svelte-core');
		Gantt = gm.Gantt ?? gm.default;
		Tooltip = gm.Tooltip ?? gm.default;
		Willow = gm.Willow ?? gm.default;
		Field = cm.Field ?? cm.default;
		Locale = cm.Locale ?? cm.default;
		Switch = cm.Switch ?? cm.default;
		DatePicker = cm.DatePicker ?? cm.default;
	});

	let username = $state('');
	let tasks: MSATObj[] = $state([]);
	let loading = $state(false);
	let error = $state();

	async function fetchStore() {
		loading = true;
		tasks = [];
		error = null;
		try {
			const anime = await fetch(`/api/proxy/${encodeURIComponent(username)}/anime`);
			if (!anime.ok) throw new Error(`HTTP ${anime.status}`);
			tasks = await anime.json();

			const manga = await fetch(`/api/proxy/${encodeURIComponent(username)}/manga`);
			if (!manga.ok) throw new Error(`HTTP ${manga.status}`);
			tasks = tasks.concat(await manga.json());
		} catch (e: any) {
			error = e.message;
		} finally {
			loading = false;
		}
	}

	let api = $state();

	let start = $state(),
		end = $state(),
		autoScale = $state(false);
</script>

<svelte:head>
	<title>My Svelty Anime Timeline</title>
</svelte:head>

<h1 class="mb-6 text-center text-3xl font-extrabold">{m.welcome()}</h1>

<p class="mx-auto mb-6 max-w-4xl px-4 text-center text-gray-700">
	{m.introduction()}
</p>

<div class="mx-auto max-w-3xl px-4">
	<form
		class="mb-6 flex flex-col items-stretch gap-3 sm:flex-row sm:items-center"
		onsubmit={fetchStore}
	>
		<label for="username" class="sr-only">Username</label>
		<input
			id="username"
			type="text"
			bind:value={username}
			placeholder="Enter username"
			class="flex-1 rounded-md border border-gray-300 bg-white px-4 py-2 text-gray-900 placeholder-gray-400 transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500 focus:outline-none"
			aria-invalid={error ? 'true' : 'false'}
		/>

		<button
			type="submit"
			class="inline-flex items-center justify-center rounded-md bg-indigo-600 px-4 py-2 font-medium text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
			disabled={loading || !username}
		>
			{#if loading}
				<svg
					class="mr-2 h-4 w-4 animate-spin"
					xmlns="http://www.w3.org/2000/svg"
					fill="none"
					viewBox="0 0 24 24"
				>
					<circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"
					></circle>
					<path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
					></path>
				</svg>
				Loading
			{:else}
				{m.fetch_btn()}
			{/if}
		</button>
	</form>

	{#if error}
		<div class="mb-4 rounded border border-red-100 bg-red-50 px-3 py-2 text-sm text-red-700">
			{error}
		</div>
	{/if}
</div>

{#if tasks.length && Gantt && Willow}
	<div class="mx-0 w-full px-4 sm:px-6">
		<div class="w-full rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
			<Willow>
				<Locale>
					<div class="bar">
						<Field label="Start" position="left">
							{#snippet children({ id })}
								<DatePicker bind:value={start} {id} />
							{/snippet}
						</Field>
						<Field label="End" position="left">
							{#snippet children({ id })}
								<DatePicker bind:value={end} {id} />
							{/snippet}
						</Field>
						<Field label="autoScale" position="left">
							{#snippet children({ id })}
								<div class="input">
									<Switch bind:value={autoScale} {id} />
								</div>
							{/snippet}
						</Field>
					</div>
				</Locale>
				<Tooltip {api} content={TaskTooltip}>
					<Gantt
						{tasks}
						readonly
						!editable
						zoom={zoomConfig}
						{autoScale}
						{start}
						{end}
						{taskTypes}
						bind:this={api}
					/>
				</Tooltip>
			</Willow>
		</div>
	</div>
{/if}

<style>
	.bar {
		display: flex;
		padding: 12px;
		border-bottom: var(--wx-gantt-border);
	}
</style>

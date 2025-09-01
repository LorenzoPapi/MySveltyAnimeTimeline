<script lang="ts">
	import { m } from '$lib/paraglide/messages';
	import { onMount } from 'svelte';

	let Gantt: any = $state();
	let Willow: any = $state();
	onMount(async () => {
		const gm = await import('wx-svelte-gantt');
		Gantt = gm.Gantt ?? gm.default;
		Willow = gm.Willow ?? gm.default;
	});

	let username = $state('');
	let tasks : MSATObj[] = $state([]);
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

	const MONTHS_ONLY_TRESHOLD = 40;
	const INIT_CELL_PX = 40;
	const MIN_PERCENT = 10;
	const MAX_PERCENT = 400;
	const STEP_PERCENT = 10;
	const MONTHS_ONLY_SCALE_FACTOR = 25;

	let percent = $state(100);

	function incPercent() {
		percent = Math.min(MAX_PERCENT, percent + STEP_PERCENT);
	}
	function decPercent() {
		percent = Math.max(MIN_PERCENT, percent - STEP_PERCENT);
	}
	function setPercent(v: number) {
		percent = Math.min(MAX_PERCENT, Math.max(MIN_PERCENT, Math.round(v)));
	}
	function resetZoom() {
		percent = 100;
	}

	const monthScale = { unit: 'month', step: 1, format: 'MMMM yyyy' };
	const dayScale = { unit: 'day', step: 1, format: 'd' };

	const computedPx = $derived(Math.max(1, Math.round(INIT_CELL_PX * (percent / 100))));
	const scales = $derived(percent < MONTHS_ONLY_TRESHOLD ? [monthScale] : [monthScale, dayScale]);
	const cellWidthLocal = $derived(
		percent < MONTHS_ONLY_TRESHOLD
			? Math.max(1, Math.round(computedPx * MONTHS_ONLY_SCALE_FACTOR))
			: computedPx
	);

	let filter: ClientObjCategory = $state('both');
	const filteredTasks = $derived(
		tasks && tasks.length
			? filter == 'both'
				? tasks
				: tasks.filter((t: MSATObj) => t.objType == filter)
			: []
	);
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
	<div class="mb-4 flex flex-wrap items-center gap-3 p-4">
		<span class="text-sm text-gray-600">Scale</span>

		<button
			type="button"
			class="rounded-md bg-gray-100 px-2 py-1 hover:bg-gray-200 disabled:opacity-50"
			onclick={decPercent}
			aria-label="Decrease scale"
			disabled={percent <= MIN_PERCENT}>−</button
		>

		<input
			type="range"
			min={MIN_PERCENT}
			max={MAX_PERCENT}
			step="1"
			bind:value={percent}
			class="w-48"
			aria-label="Scale percentage"
		/>

		<button
			type="button"
			class="rounded-md bg-gray-100 px-2 py-1 hover:bg-gray-200 disabled:opacity-50"
			onclick={incPercent}
			aria-label="Increase scale"
			disabled={percent >= MAX_PERCENT}>+</button
		>

		<input
			type="number"
			min={MIN_PERCENT}
			max={MAX_PERCENT}
			bind:value={percent}
			class="w-20 rounded border px-2 py-1"
			aria-label="Scale percent"
			oninput={(e) => setPercent(Number((e.target as HTMLInputElement).value))}
		/>

		<div class="rounded border bg-white px-3 py-1 text-sm text-gray-700">
			{cellWidthLocal}px
		</div>

		<button
			type="button"
			class="ml-2 rounded-md bg-indigo-600 px-3 py-1 text-white hover:bg-indigo-700"
			onclick={resetZoom}>Reset</button
		>
		<br>
		<label for="typeFilter" class="text-sm text-gray-600">Show</label>

		<select
			id="typeFilter"
			bind:value={filter}
			class="rounded border bg-white px-3 py-1 text-gray-900"
			aria-label="Filter by type"
		>
			<option value="both">Both</option>
			<option value="anime">Anime only</option>
			<option value="manga">Manga only</option>
		</select>
	</div>
	<div class="mx-0 w-full px-4 sm:px-6">
		<div class="w-full rounded-lg border border-gray-200 bg-white p-4 shadow-sm">
			<Willow>
				<Gantt tasks={filteredTasks} readonly editable {scales} cellWidth={cellWidthLocal} />
			</Willow>
		</div>
	</div>
{/if}

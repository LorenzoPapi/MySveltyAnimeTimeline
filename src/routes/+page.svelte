<script lang="ts">
	import { onMount } from 'svelte';
	// import { setLocale } from '$lib/paraglide/runtime';
	// import { page } from '$app/state';
	// import { goto } from '$app/navigation';
	// import { m } from '$lib/paraglide/messages.js';

	let Gantt: any = $state();
	let Willow: any = $state();
	onMount(async () => {
		const gm = await import('wx-svelte-gantt');
		Gantt = gm.Gantt ?? gm.default;
		Willow = gm.Willow ?? gm.default;
	});

	let username = $state('');
	let result = $state([]);
	let loading = $state(false);
	let error = $state();

	async function fetchStore() {
		loading = true;
		result = [];
		error = null;
		try {
			const res = await fetch(`/api/proxy/${encodeURIComponent(username)}/anime`);
			if (!res.ok) throw new Error(`HTTP ${res.status}`);
			result = await res.json();
		} catch (e) {
			error = e.message;
		} finally {
			loading = false;
		}
	}
	const scales = [
		{ unit: 'month', step: 1, format: 'MMMM yyyy' },
		{ unit: 'day', step: 1, format: 'd' } // larger step => less zoomed
	];
</script>

<!---<h1>{m.hello_world({ name: 'SvelteKit User' })}</h1>-->
<h1>My Svelty Anime Timeline</h1>
<input bind:value={username} placeholder="username" />
<button onclick={() => fetchStore()} disabled={loading || !username}>Fetch store</button>

{#if result.length}
	<!--<pre>{JSON.stringify(result, null, 2)}</pre>-->
	{#if Gantt && Willow}
		<Willow>
			<Gantt
				tasks={result}
				readonly={true}
				editable={false}
				scales={scales}
				zoom={true}
				cellWidth={60}
			/>
		</Willow>
	{/if}
{/if}
{#if error}
	<p style="color:red">{error}</p>
{/if}

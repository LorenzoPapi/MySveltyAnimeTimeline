<script lang="ts">
	import { format } from 'date-fns';
	let { data } = $props() as { data: MSATObj };

	const mask = 'yyyy.MM.dd';
</script>

{#if data}
	<div class="data">
		<div class="text">
			<span class="caption">{data.objType}:</span>
			{data.text}
		</div>
		<div class="text">
			<span class="caption">Status:</span>
			{data.objStatus}
		</div>
		<div class="text">
			<span class="caption">Started on:</span>
			{format(data.start, mask)}
		</div>
		{#if data.end}
			<div class="text">
				<span class="caption">Ended on:</span>
				{format(data.end, mask)}
			</div>
		{/if}

		{#if data.score}
			<div class="text">
				<span class="caption">Score:</span>
				{data.score}/10
			</div>
		{/if}
	</div>
{/if}

<style>
	.data {
		white-space: nowrap;
		background-color: var(--wx-tooltip-background);
		padding: 3px 8px;
	}

	.text {
		font-family: var(--wx-font-family);
		color: var(--wx-color-primary-font);
		font-size: 13px;
		text-transform: capitalize;
		margin-bottom: 5px;
	}

	.text:last-child {
		margin-bottom: 0;
	}

	.caption {
		font-weight: 700;
	}
</style>

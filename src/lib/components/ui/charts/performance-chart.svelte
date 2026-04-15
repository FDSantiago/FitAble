<script lang="ts">
	interface SetData {
		reps: number;
		formScore: number;
	}

	let { sets }: { sets: SetData[] } = $props();

	let maxReps = $derived(Math.max(...sets.map((s) => s.reps), 1));
	let maxFormScore = 100;

	const CHART_HEIGHT = 120;
	const BAR_WIDTH = 28;
	const BAR_GAP = 12;
	const PADDING_LEFT = 10;
	const PADDING_BOTTOM = 24;

	function barHeight(value: number, max: number): number {
		return (value / max) * CHART_HEIGHT;
	}

	function chartWidth(): number {
		return sets.length * (BAR_WIDTH + BAR_GAP) + PADDING_LEFT + 20;
	}
</script>

<div class="rounded-xl border border-border bg-card p-4">
	<h3 class="mb-3 text-sm font-bold">Performance Chart</h3>

	{#if sets.length > 0}
		<div class="flex flex-col gap-3">
			<div class="flex items-center gap-4 text-xs">
				<div class="flex items-center gap-1.5">
					<span class="inline-block h-2.5 w-2.5 rounded-sm bg-primary"></span>
					<span class="text-muted-foreground">Reps</span>
				</div>
				<div class="flex items-center gap-1.5">
					<span class="inline-block h-2.5 w-2.5 rounded-sm bg-green-500"></span>
					<span class="text-muted-foreground">Form Score</span>
				</div>
			</div>

			<div class="overflow-x-auto">
				<svg
					width={chartWidth()}
					height={CHART_HEIGHT + PADDING_BOTTOM + 20}
					class="overflow-visible"
				>
					{#each sets as set, i}
						{@const barX = PADDING_LEFT + i * (BAR_WIDTH + BAR_GAP)}
						{@const repsBarH = barHeight(set.reps, maxReps)}
						{@const formBarH = barHeight(set.formScore, maxFormScore)}
						{@const baseline = CHART_HEIGHT}

						<g class="transition-all duration-300">
							<rect
								x={barX}
								y={baseline - repsBarH}
								width={BAR_WIDTH}
								height={repsBarH}
								rx="4"
								class="fill-primary"
							/>
							<rect
								x={barX + BAR_WIDTH + 4}
								y={baseline - formBarH}
								width={BAR_WIDTH}
								height={formBarH}
								rx="4"
								class="fill-green-500"
							/>
						</g>

						<text
							x={barX + BAR_WIDTH / 2}
							y={baseline + 14}
							text-anchor="middle"
							class="fill-muted-foreground text-[9px] font-medium"
						>
							Set {i + 1}
						</text>
					{/each}
				</svg>
			</div>
		</div>
	{:else}
		<p class="text-xs text-muted-foreground">No set data available.</p>
	{/if}
</div>

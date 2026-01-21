<script setup lang="ts">
import { HoverCard, HoverCardContent, HoverCardTrigger, Button } from '@kunkka/ui'
</script>

<template>
  <HoverCard>
    <HoverCardTrigger as-child>
      <Button variant="link">@vuejs</Button>
    </HoverCardTrigger>
    <HoverCardContent class="w-80">
      <div class="flex justify-between space-x-4">
        <div class="space-y-1">
          <h4 class="text-sm font-semibold">@vuejs</h4>
          <p class="text-sm">
            The Progressive JavaScript Framework
          </p>
          <div class="flex items-center pt-2">
            <span class="text-xs text-muted-foreground">
              Joined December 2013
            </span>
          </div>
        </div>
      </div>
    </HoverCardContent>
  </HoverCard>
</template>

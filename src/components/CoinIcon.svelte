<script lang="ts">
  let { class: className = "w-5 h-5" } = $props<{ class?: string }>();
</script>

<svg viewBox="0 0 100 100" class={className} xmlns="http://www.w3.org/2000/svg">
  <circle cx="50" cy="50" r="45" fill="url(#goldGradient)" stroke="#B8860B" stroke-width="4" />
  <circle cx="50" cy="50" r="38" fill="none" stroke="#DAA520" stroke-width="1" stroke-dasharray="2,2" />
  <text x="50" y="65" font-family="Arial, sans-serif" font-weight="900" font-size="45" text-anchor="middle" fill="#8B6508" style="text-shadow: 1px 1px 0px #FFD700;">KC</text>
  <defs>
    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FFDF00" />
      <stop offset="50%" stop-color="#DAA520" />
      <stop offset="100%" stop-color="#B8860B" />
    </linearGradient>
  </defs>
</svg>

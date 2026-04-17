<script setup lang="ts">
/** Steam-client footer bar — purely cosmetic. */
</script>

<template>
  <footer class="client-footer">
    <div class="footer-left">
      <a class="f-item"><span class="f-icon">+</span> Add a Game</a>
    </div>
    <div class="footer-center">
      <a class="f-item"><span class="f-icon">⬇</span> Manage Downloads</a>
    </div>
    <div class="footer-right">
      <a class="f-item">Friends &amp; Chat <span class="f-icon">👥</span></a>
    </div>
  </footer>
</template>

<style scoped>
.client-footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 16px;
  background: #171a21;
  border-top: 1px solid #000;
  height: 32px;
  color: #8f98a0;
  font-size: 11px;
  user-select: none;
}
.f-item {
  color: #8f98a0;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 6px;
}
.f-item:hover { color: #c7d5e0; }
.f-icon { opacity: 0.8; }
.footer-center { text-align: center; }
</style>

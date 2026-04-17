<script setup lang="ts">
import { useProject } from '~/composables/useProject'

const { state } = useProject()

/** Preserve paragraph breaks from a plain-text field. */
const paragraphs = computed(() =>
  state.value.aboutThisGame.split(/\n{2,}/).filter(Boolean)
)
</script>

<template>
  <section class="about">
    <h2 class="section-title">About This Game</h2>
    <div class="about-body">
      <p v-for="(p, i) in paragraphs" :key="i">{{ p }}</p>
    </div>
    <div v-if="state.matureContent" class="mature">
      <h2 class="section-title">Mature Content Description</h2>
      <p class="mature-body">The developers describe the content like this:</p>
      <blockquote class="mature-quote">{{ state.matureContent }}</blockquote>
    </div>
  </section>
</template>

<style scoped>
.about {
  margin-top: 24px;
  color: #acb2b8;
}
.section-title {
  color: #fff;
  font-size: 20px;
  font-weight: 100;
  border-bottom: 1px solid #223242;
  padding-bottom: 8px;
  margin: 0 0 14px;
}
.about-body p {
  font-size: 14px;
  line-height: 1.6;
  margin: 0 0 14px;
}
.mature { margin-top: 28px; }
.mature-body { font-size: 14px; }
.mature-quote {
  background: rgba(0,0,0,0.2);
  padding: 14px 18px;
  margin: 8px 0 0;
  border-left: 3px solid #67c1f5;
  font-style: italic;
  color: #c7d5e0;
  font-size: 14px;
}
</style>

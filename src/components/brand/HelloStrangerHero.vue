<template>
  <section class="brand-hero">
    <p class="eyebrow">Every conversation is a new beginning.</p>
    <h1>Hello, Stranger</h1>
    <p class="lead">在日常故事里，自然地开口说英语。</p>
    <div class="hero-actions">
      <slot></slot>
    </div>
  </section>
</template>

<style scoped>
.brand-hero {
  display: grid;
  align-content: center;
  gap: 1rem;
  min-height: calc(100vh - 10rem);
}

.hero-actions {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 0.65rem;
}

.hero-actions :deep(a) {
  min-height: 3rem;
  margin-top: 0.5rem;
}

.hero-actions :deep(.secondary-action) {
  display: inline-flex;
  align-items: center;
  width: fit-content;
  padding: 0.8rem 1.15rem;
  color: #173f3a;
  border: 1px solid rgb(23 63 58 / 18%);
  border-radius: 999px;
  font-weight: 750;
  text-decoration: none;
}
</style>

<script setup lang="ts">
import { useQuery } from '@tanstack/vue-query';

const getTodos = async () => {
  return [1, 2, 3]
}

const { isPending, isError, data, error } = useQuery({
  queryKey: ['todos'],
  queryFn: getTodos,
})

</script>

<template>
  <div>
    <h1>Olá, Mundo!</h1>
    <UIButton />
    <pre><code>{{ { isPending, isError, data, error } }}</code></pre>
  </div>
</template>

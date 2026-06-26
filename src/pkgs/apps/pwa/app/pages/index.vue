<script setup lang="ts">
import { useQuery } from "@tanstack/vue-query";

const getTodos = async () => {
  return [1, 2, 3];
};

const query = useQuery({
  queryKey: ["todos"],
  queryFn: getTodos,
});

const { isPending, isError, data, error } = query;
</script>

<template>
  <div>
    <h1>Olá, Mundo!</h1>
    <UIButton />
    <pre><code>{{ { isPending, isError, data, error } }}</code></pre>
  </div>
</template>

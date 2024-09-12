<script setup lang="ts">
import type {NuxtError} from '#app'

const props = defineProps({
  error: Object as () => NuxtError
})

const handleError = () => clearError({redirect: '/'})
</script>

<template>
  <div v-if=" error.statusCode === 404">
    <a-result status="404" title="404" sub-title="Sorry, the page you visited does not exist.">
      <template #extra>
        <a-button type="primary" @click="handleError">Back Home</a-button>
      </template>
    </a-result>
  </div>
  <div v-else-if=" error.statusCode === 500">
    P{{error}}
    <a-result status="500" title="500" sub-title="Sorry, the server is wrong.">
      <template #extra>
        <a-button type="primary" @click="handleError">Back Home</a-button>
      </template>
    </a-result>
  </div>
  <div v-else-if=" error.statusCode === 403">
    <a-result status="403" title="403" sub-title="Sorry, you are not authorized to access this page.">
      <template #extra>
        <a-button type="primary" @click="handleError">Back Home</a-button>
      </template>
    </a-result>
  </div>
  <div v-else>
    <a-result
        status="error"
        title="Something went wrong"
        sub-title="Something unexpected happened. We apologize for the inconvenience."
    >
      <template #extra>
        <a-button type="primary" @click="handleError">Back Home</a-button>
      </template>


    </a-result>
  </div>
</template>

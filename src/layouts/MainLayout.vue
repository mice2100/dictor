<template>
  <q-layout view="lHh Lpr lFf">
    <q-header elevated>
      <q-toolbar>
        <q-toolbar-title> Dictation v2.3 </q-toolbar-title>
        <q-btn
          flat
          icon="mdi-refresh"
          color="info"
          @click="refreshWindow"
        ></q-btn>
      </q-toolbar>
    </q-header>

    <q-page-container>
      <router-view />
    </q-page-container>
  </q-layout>
</template>

<script setup lang="ts">
function refreshWindow() {
  window.location.reload();
}
</script>

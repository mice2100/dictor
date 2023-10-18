<template>
  <q-page class="column items-center q-pa-md">
    <NewsListVue @newsChanged="onNewsChanged"></NewsListVue>
    <AudioPlayer
      :uid="news.uid"
      :title="news.title"
      :audioUrl="news.audioUrl"
      ref="player"
    ></AudioPlayer>
  </q-page>
</template>

<script setup lang="ts">
import { News } from 'components/models';
import AudioPlayer from 'components/AudioPlayer.vue';
import NewsListVue from 'components/NewsList.vue';
import { ref } from 'vue';

let news = ref<News>({
  uid: '0001',
  title: 'NPR NEWS',
  audioUrl: '',
});

function onNewsChanged(newOne: News) {
  news.value = newOne;
}
</script>

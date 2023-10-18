<template>
  <div class="row inline justify-between full-width">
    <q-btn
      flat
      dense
      round
      icon="mdi-skip-previous"
      class="float-left"
      @click="previous"
      :disable="currentIdx === 0"
    />
    <q-card flat>
      <q-card-section class="text-subtitle1">{{
        currentNews.title
      }}</q-card-section>
    </q-card>
    <q-btn
      flat
      dense
      round
      icon="mdi-skip-next"
      class="float-right"
      @click="next"
      :disable="currentIdx === newsList.length - 1"
    />
  </div>
</template>
<script setup lang="ts">
import { defineEmits, onMounted, ref } from 'vue';
import { News } from './models';

const emit = defineEmits(['newsChanged']);

let newsList: News[] = [];
let currentIdx = ref(0);
let currentNews = ref({} as News);

onMounted(async () => {
  const resp = await fetch('https://moosephotoprint.com/npr/list', {
    method: 'GET',
    redirect: 'follow',
  });

  const data = await resp.json();
  newsList = data;
  // newsList = [
  //   {
  //     title: 'NPR News: 10-13-2023 11AM EDT',
  //     uid: 'nsv2-1697209200000-s1-long:1000',
  //     audioUrl:
  //       // 'https://play.podtrac.com/npr-500005/traffic.megaphone.fm/NPR8245440516.mp3?p=500005&amp;e=nsv2-1697209200000-s1-long&amp;d=300&amp;t=podcast&amp;size=4524986&amp;sc=siteplayer&amp;aw_0_1st.playerid=siteplayer',
  //       '/mp3/NPR8245440516.mp3',
  //   },
  //   {
  //     title: 'NPR News: 10-13-2023 10AM EDT',
  //     uid: 'nsv2-1697205600000-s1-long:1000',
  //     audioUrl:
  //       // 'https://play.podtrac.com/npr-500005/traffic.megaphone.fm/NPR5359954446.mp3?p=500005&amp;e=nsv2-1697205600000-s1-long&amp;d=300&amp;t=podcast&amp;size=4524986&amp;sc=siteplayer&amp;aw_0_1st.playerid=siteplayer',
  //       '/mp3/NPR5359954446.mp3',
  //   },
  //   {
  //     title: 'NPR News: 10-13-2023 9AM EDT',
  //     uid: 'nsv2-1697202000000-s1-long:1000',
  //     audioUrl:
  //       // 'https://play.podtrac.com/npr-500005/traffic.megaphone.fm/NPR8556935602.mp3?p=500005&amp;e=nsv2-1697202000000-s1-long&amp;d=300&amp;t=podcast&amp;size=4524986&amp;sc=siteplayer&amp;aw_0_1st.playerid=siteplayer',
  //       '/mp3/NPR8556935602.mp3',
  //   },
  // ];

  currentIdx.value = 0;
  currentNews.value = newsList[currentIdx.value];
  emit('newsChanged', newsList[currentIdx.value]);
});

function next() {
  currentIdx.value += 1;
  currentNews.value = newsList[currentIdx.value];
  emit('newsChanged', newsList[currentIdx.value]);
}

function previous() {
  currentIdx.value -= 1;
  currentNews.value = newsList[currentIdx.value];
  emit('newsChanged', newsList[currentIdx.value]);
}
</script>

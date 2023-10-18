<template>
  <q-card
    class="q-pa-sm column full-width"
    flat
    v-touch-swipe.mouse.left="handleSwipe"
    style="height: 430px"
  >
    <h6 class="q-ma-sm">{{ currentTimeFormatted }}/{{ durationFormatted }}</h6>
    <q-slider
      v-model="currentTime"
      :max="duration"
      class="q-ma-sm"
      disable
      :inner-min="innerMin"
      :inner-max="innerMax"
      thumb-size="15px"
      inner-track-color="info"
    />
    <div class="q-ma-sm row inline full-width justify-between">
      <q-btn-toggle
        v-model="playMode"
        no-caps
        flat
        toggle-color="primary"
        size="lg"
        :options="[
          { label: 'Auto', value: 'auto' },
          { label: 'Manual', value: 'manual' },
        ]"
      />
      <q-checkbox v-model="showText" label="Show Text" color="primary" />
      <div class="col" />
      <q-btn color="primary" flat no-caps :label="playSpeed" class="q-ml-lg">
        <q-menu>
          <q-list style="min-width: 100px">
            <q-item
              clickable
              v-close-popup
              v-for="(item, index) in [
                '0.7 x',
                '0.8 x',
                '0.9 x',
                '1 x',
                '1.25 x',
                '1.5 x',
              ]"
              :key="index"
              @click="playSpeed = item"
            >
              <q-item-section>{{ item }}</q-item-section>
            </q-item>
          </q-list>
        </q-menu>
      </q-btn>
    </div>
    <div class="q-ma-xs row full-width inline">
      <q-btn
        outline
        color="primary"
        :icon="isplaying ? 'mdi-stop' : 'mdi-play'"
        class="col-2"
        :disable="!readyState"
        @click="startOrStop"
      />
      <q-btn
        outline
        color="secondary"
        :icon="paused ? 'mdi-play' : 'mdi-pause'"
        v-if="playMode === 'manual'"
        :disable="!readyState || !isplaying"
        class="col-3 q-ml-md"
        @click="pause"
      />
      <q-btn
        outline
        color="secondary"
        icon="mdi-skip-previous"
        v-if="playMode === 'manual'"
        :disable="!readyState || !isplaying"
        class="col-3"
        @click="rewind('far')"
      />
      <q-btn
        outline
        color="secondary"
        icon="mdi-replay"
        v-if="playMode === 'manual'"
        :disable="!readyState || !isplaying"
        class="col-3"
        @click="rewind('near')"
      />
    </div>
    <div class="q-ma-xs row full-width justify-center inline">
      <q-circular-progress
        show-value
        class="text-light-blue q-ma-md"
        :value="waitTimer"
        :max="waitTimerMax"
        size="80px"
        color="light-blue"
        v-if="showWait"
        :hiden="!showWait"
      />
      <q-card-section v-if="currentText && showText">
        {{ currentText }}
      </q-card-section>
    </div>
  </q-card>
  <q-card flat>
    <q-card-section class="text-center">
      <div>
        Author: George Lou from
        <a href="https://moosephotoprint.com">moosephotoprint.com</a>
      </div>
      <div>Audio credits to: NPR News</div>
      <div>Transcript credits to: DeepGram</div>
    </q-card-section>
  </q-card>
</template>

<script setup lang="ts">
import { computed, ref, watch, onMounted } from 'vue';
import { type News, PlayModel, PlayTask, PlayType } from './models';

let news = defineProps<News>();

let currentTime = ref(0);
let duration = ref(42);
let innerMin = ref(0);
let innerMax = ref(42);
let audio: HTMLAudioElement;
let playSpeed = ref('1 x');
let isplaying = ref(false);
let paused = ref(true);
let playMode = ref('auto');
let readyState = ref(false);
const playModel = new PlayModel();
let rewindPosNear = 0;

let waitTimer = ref(5.0);
let waitTimerMax = ref(5.0);
let showWait = ref(false);

let currentTask: PlayTask;
let currentText = ref('');
let showText = ref(true);

onMounted(async () => {
  audio = new Audio();
  audio.addEventListener('timeupdate', () => {
    currentTime.value = audio.currentTime;
  });
  audio.addEventListener('loadeddata', async () => {
    duration.value = Math.round(audio.duration);
    innerMax.value = duration.value;
    audio.playbackRate = parseFloat(playSpeed.value);
    readyState.value = true;
  });
});

watch(news, async (newOne, oldOne) => {
  console.log(newOne);
  if (newOne.uid) {
    await playModel.initSegment(news.uid);

    audio.src = playModel.audioUrl;
    audio.load();
  }
  isplaying.value = false;
  paused.value = false;
});

watch(playSpeed, async (newOne, oldOne) => {
  audio.playbackRate = parseFloat(newOne);
});

watch(playMode, async (newOne, oldOne) => {
  if (isplaying.value) {
    audio.pause();
    audio.currentTime = 0;
    currentTime.value = 0;
    innerMin.value = 0;
    innerMax.value = 0;
    isplaying.value = false;
    paused.value = true;
    return;
  }
});

function handleSwipe({ evt, ...newInfo }) {
  if (playMode.value === 'auto') {
    return;
  }

  switch (newInfo.direction) {
    case 'left':
      rewind('near');
      break;
  }

  // native Javascript event
  // console.log(evt)
}
const wait = (n: number) => new Promise((resolve) => setTimeout(resolve, n));
async function waitWithUI(n: number) {
  const tmax = Math.floor(n / 100);
  waitTimerMax.value = tmax;
  showWait.value = true;
  for (let i = 0; i <= tmax; i++) {
    waitTimer.value = i;
    if (!isplaying.value) {
      break;
    }
    await wait(100);
  }
  showWait.value = false;
}

async function startOrStop() {
  if (isplaying.value) {
    audio.pause();
    audio.currentTime = 0;
    currentTime.value = 0;
    innerMin.value = 0;
    innerMax.value = 0;
    isplaying.value = false;
    paused.value = true;
    return;
  }

  playModel.initModel(playMode.value);

  isplaying.value = true;
  paused.value = false;

  currentTask = playModel.firstPlayTask();
  async function waitForEnd() {
    while (
      audio.currentTime <
      (currentTask.ptstart || 0) + currentTask.ptduration
    ) {
      await wait(20);
    }
  }

  isplaying.value = true;
  while (currentTask.pttype != 'end' && isplaying.value) {
    if (currentTask.pttype == 'play') {
      syncCurrentTask();
      await audio.play();
      isplaying.value = true;
      await waitForEnd();
    } else if (currentTask.pttype == 'pause') {
      currentText.value = '';
      audio.pause();
      await waitWithUI(currentTask.ptduration * 1000);
    }
    currentTask = playModel.nextPlayTask();
  }
  isplaying.value = false;
}

function pause() {
  if (audio) {
    if (audio.paused) {
      audio.play();
      paused.value = false;
    } else {
      audio.pause();
      paused.value = true;
    }
  }
}

function syncCurrentTask() {
  innerMin.value = currentTask.ptstart || 0;
  innerMax.value = innerMin.value + currentTask.ptduration;
  audio.currentTime = currentTask.ptstart || 0;
  rewindPosNear = audio.currentTime;
  currentText.value = currentTask.pttext || '';

  if (playMode.value === 'auto') {
    audio.playbackRate = currentTask.ptspeed || 1.0;
    playSpeed.value = `${audio.playbackRate} x`;
  }
}

function rewind(pos: string) {
  if (pos === 'near') {
    audio.currentTime = rewindPosNear;
  } else if (pos === 'far') {
    currentTask = playModel.previousPlayTask();
    currentText.value = currentTask.pttext || '';

    syncCurrentTask();
  }
}

const currentTimeFormatted = computed(() => {
  const minutes = Math.floor(currentTime.value / 60);
  const seconds = Math.round(currentTime.value % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});

const durationFormatted = computed(() => {
  const minutes = Math.floor(duration.value / 60);
  const seconds = Math.round(duration.value % 60);
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
});
</script>
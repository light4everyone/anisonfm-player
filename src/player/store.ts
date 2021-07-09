import { createEffect, createEvent, createStore, forward, guard } from "effector";
import { searchAnime } from "../api/skikimori.api";
import { getStatus } from "../api/anison-status.api";
import { createCountdown } from "./countdown";

// Effects

const getStatusFx = createEffect(getStatus);
const searchAnimeFx = createEffect((anime: string) => searchAnime(anime));

// Events

export const playToggle = createEvent();
export const audioLoaded = createEvent();

const startCountdown = createEvent();
const abortCountdown = createEvent();

const timerTick = createCountdown({
  start: startCountdown,
  abort: abortCountdown,
  timeout: 5000
});

// Stores

export const play$ = createStore(false)
  .on(playToggle, (play) => !play);

export const trackDuration$ = createStore<number>(0)
  .on(getStatusFx.done, (_, { result }) => result.duration)
  .reset(play$);

export const trackTitle$ = createStore<string>('')
  .on(getStatusFx.done, (_, { result }) => result.trackTitle)
  .reset(play$);

export const animeTitle$ = createStore<string>('')
  .on(getStatusFx.done, (_, { result }) => result.anime)
  .reset(play$);

export const animeImageUrl$ = createStore<string>('')
  .reset(animeTitle$)
  .reset(play$);

export const animeUrl$ = createStore<string>('')
  .reset(play$);

// Routing

forward({
  from: audioLoaded,
  to: startCountdown
});

guard({
  clock: playToggle,
  source: play$,
  filter: (play) => !play,
  target: abortCountdown
});

forward({
  from: timerTick,
  to: getStatusFx
});

guard({
  source: animeTitle$,
  filter: (anime) => anime.length > 0 && anime !== 'Anison.FM',
  target: searchAnimeFx
});

forward({
  from: searchAnimeFx.done.map(({ result }) => `https://shikimori.one/${result.data[0]?.image.original}`),
  to: animeImageUrl$
});

forward({
  from: searchAnimeFx.done.map(({ result }) => `https://shikimori.one/${result.data[0]?.url}`),
  to: animeUrl$
});

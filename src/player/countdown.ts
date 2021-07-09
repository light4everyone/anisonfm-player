import { createEvent, createStore, createEffect, guard, forward, Event } from "effector"

export function createCountdown(
  {start, abort, timeout}: { start: Event<void>; abort: Event<void>, timeout: number },
) {
  const $working = createStore(false);
  const tick = createEvent();
  const timerFx = createEffect(() => wait(timeout));

  $working.on(abort, () => false).on(start, () => true);

  guard({
    source: start,
    filter: timerFx.pending.map(is => !is),
    target: tick,
  });

  forward({
    from: tick,
    to: timerFx,
  });

  guard({
    source: timerFx.done,
    filter: $working,
    target: tick,
  });

  return tick;
}

function wait(ms: number): Promise<void> {
  return new Promise(resolve => {
    setTimeout(resolve, ms);
  })
}
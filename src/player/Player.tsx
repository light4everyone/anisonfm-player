import React, { ChangeEvent, useEffect, useRef, useState } from "react";
import { Howl } from 'howler';
import { useStore } from "effector-react";
import { Counter } from "./Counter";
import { PlayButton } from "./PlayButton";
import { animeImageUrl$, animeTitle$, animeUrl$, audioLoaded, play$, playToggle, trackDuration$, trackTitle$ } from "./store";

export const Player = () => {
  const play = useStore(play$);

  const trackTitle = useStore(trackTitle$);
  const animeTitle = useStore(animeTitle$);
  const animeImageUrl = useStore(animeImageUrl$);
  const animeUrl = useStore(animeUrl$);

  const trackDuration = useStore(trackDuration$);

  const howl = useRef<Howl>(undefined);

  const timer = useRef<ReturnType<typeof setTimeout>>(undefined);

  const [hidePlayer, setHidePlayer] = useState(false);
  const [volume, setVolume] = useState<number>(0);

  const updateTimer = () => {
    setHidePlayer(false);
    clearTimer();

    timer.current = setTimeout(() => {
      setHidePlayer(true);
    }, 5000);
  };

  const clearTimer = () => {
    if (timer.current) {
      clearTimeout(timer.current);
    }
  }

  useEffect(() => {
    timer.current = setTimeout(() => {
      setHidePlayer(true);
    }, 5000);

    return () => {
      clearTimer();
    }
  }, []);

  useEffect(() => {
    let savedVolume = +localStorage.getItem('volume') ?? 0;

    setVolume(savedVolume);

    howl.current = new Howl({
      src: 'https://pool.anison.fm/AniSonFM(320)',
      html5: true,
      volume: savedVolume,
      format: ['mpeg'],
    });

    howl.current.on('play', () => { audioLoaded(); });

    return () => {
      howl.current.unload();
    };
  }, []);

  useEffect(() => {
    if (play) {
      howl.current.play();
    } else {
      howl.current.stop();
    }
  }, [play]);

  const changeVolume = (event: ChangeEvent<HTMLInputElement>) => {
    const volume = +event.target.value
    howl.current.volume(volume);
    setVolume(volume);
    localStorage.setItem('volume', volume.toString());
  }

  return (
    <div className={`player${hidePlayer ? ' player_hide' : ''}`} onMouseOver={() => updateTimer()}>
      {play && animeTitle.length > 0 && <a href={animeUrl} target="_blank" className="track-title">{animeTitle}<br />{trackTitle}</a>}

      {play && animeImageUrl.length > 0 && <img className="image" src={animeImageUrl} />}

      <input className="volume" type="range" id="volume" name="volume" onChange={changeVolume} min="0.00" max="0.5" step="0.02" value={volume} />

      <PlayButton play={play} onToggle={() => playToggle()}></PlayButton>

      {play && <Counter duration={trackDuration}></Counter> }
    </div>
  );
}
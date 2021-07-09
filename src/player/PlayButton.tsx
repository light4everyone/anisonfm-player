import React from "react";
import { Play } from "./icons/Play";
import { Stop } from "./icons/Stop";

export const PlayButton = ({ play, onToggle }: { play: boolean, onToggle: () => void}) => {
  
  return (
    <div className="play-button" onClick={() => { onToggle() }}>
      <div className="play-button__background"></div>

      <div className="play-button__icon-container">
        {
          play ? <Stop></Stop> : <div className="play-icon"><Play></Play></div>
        }
      </div>
    </div>
  );
}

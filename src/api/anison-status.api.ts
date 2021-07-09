interface GetStatusResponse {
  duration: number;
  on_air: {
    anime: string;
    track: string;
  };
}

export interface Status {
  duration: number;
  anime: string;
  trackTitle: string;
}

export const getStatus: () => Promise<Status> = async () => {
  const response = await fetch('https://anison.fm/status.php', {
  });

  const object = await response.json() as GetStatusResponse;

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const status = { duration: object.duration, anime: object.on_air.anime, trackTitle: object.on_air.track };

  return status;
}

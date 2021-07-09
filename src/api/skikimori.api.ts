export interface SearchAnimeResponse {
  data: [
    {
      image: {
        original: string;
      };
      url: string;
    }
  ]
}

export const searchAnime: (anime: string) => Promise<SearchAnimeResponse> = async (anime: string) => {
  const response = await fetch(`https://shikimori.one/api/animes?search=${anime}`);

  if (!response.ok) {
    throw new Error(await response.text());
  }

  const object = { data: await response.json() } as SearchAnimeResponse;

  return object;
}

console.log('Hello via Bun!')

let playlist = await fetch(
  `${Bun.env.NETEAST_CLOUD_URL}/playlist/track/all?id=2044230836`
)
playlist = await playlist.json()

const ids = playlist.songs.map((song) => song.id).join(',')

let res = await fetch(
  `${Bun.env.NETEAST_CLOUD_URL}/song/url?id=${ids}&br=320000`
)
res = await res.json()
res = res.data.map((song) => song.url)

await Bun.write('./output/download-urls.txt', res.join('\n'))

console.log('Hello via Bun!')

const webUrl = 'http://localhost:3001'

let playlist = await fetch(`${webUrl}/playlist/track/all?id=2044230836`)
playlist = await playlist.json()

const ids = playlist.songs.map((song) => song.id).join(',')

let res = await fetch(`${webUrl}/song/url?id=${ids}&br=320000`)
res = await res.json()
res = res.data.map((song) => song.url)

await Bun.write('output.json', JSON.stringify(res))

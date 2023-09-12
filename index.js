import axios from 'axios'
import fs from 'node:fs'

const apiRoot = Bun.env.NETEASE_MUSIC_URL
const playlistId = Bun.env.PLAYLIST_ID

const playlist = await axios.get(`${apiRoot}/playlist/track/all`, {
  params: {
    id: playlistId,
  },
})

if (playlist.status !== 200) {
  throw new Error('Failed to fetch playlist')
}

const ids = playlist.data?.songs.map((song) => song.id).join(',')

const urls = await axios.get(`${apiRoot}/song/url`, {
  params: { id: ids, br: 320000 },
})

if (urls.status !== 200) {
  throw new Error('Failed to fetch song urls')
}

// gather metadata
const metadata = urls.data?.data.map((song, index) => ({
  url: song.url,
  name: playlist.data?.songs[index].name,
  id: song.id,
}))

// write metadata to file
await Bun.write('./output/meta.json', JSON.stringify(metadata))

// download songs
const fileStreams = await Promise.all(
  metadata.map((song) => axios.get(song.url, { responseType: 'stream' }))
)

// write song streams to file
fileStreams.forEach((stream, index) => {
  const name = playlist.data?.songs[index].name
  stream.data.pipe(fs.createWriteStream(`./output/${name}.mp3`))
})

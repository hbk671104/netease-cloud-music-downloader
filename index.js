import axios from 'axios'
import fs from 'node:fs'

const apiRoot = Bun.env.NETEASE_MUSIC_URL
const email = Bun.env.EMAIL
const password = Bun.env.PASSWORD
const playlistId = Bun.env.PLAYLIST_ID

const user = await axios.get(`${apiRoot}/login`, {
  params: {
    email,
    password,
  },
})

const cookie = user.data?.cookie

console.log('Fetching playlist...')
const playlist = await axios.get(`${apiRoot}/playlist/track/all`, {
  params: {
    id: playlistId,
    cookie,
  },
})

if (playlist.status !== 200) {
  throw new Error('Failed to fetch playlist')
}

const ids = playlist.data?.songs.map((song) => song.id).join(',')

console.log('Fetching song urls...')
const urls = await axios.get(`${apiRoot}/song/url`, {
  params: { id: ids, br: 320000, cookie },
})

if (urls.status !== 200) {
  throw new Error('Failed to fetch song urls')
}

// gather metadata
const metadata = urls.data?.data
  .filter((song) => song.url)
  .map((song, index) => ({
    ...song,
    name: playlist.data?.songs[index].name,
  }))

// write metadata to file
await Bun.write('./output/meta.json', JSON.stringify(metadata))

// download songs
console.log('Downloading songs...')
const fileStreams = await Promise.all(
  metadata.map((song) => axios.get(song.url, { responseType: 'stream' }))
)

// write song streams to file
fileStreams.forEach((stream, index) => {
  const { name, type } = metadata[index]
  stream.data.pipe(fs.createWriteStream(`./output/${name}.${type}`))
})

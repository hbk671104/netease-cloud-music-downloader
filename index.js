import axios from 'axios'

const playlist = await axios.get(
  `${Bun.env.NETEAST_CLOUD_URL}/playlist/track/all`,
  {
    params: {
      id: 2044230836,
    },
  }
)

if (playlist.status !== 200) {
  throw new Error('Failed to fetch playlist')
}

const ids = playlist.data?.songs.map((song) => song.id).join(',')

let urls = await axios.get(`${Bun.env.NETEAST_CLOUD_URL}/song/url`, {
  params: { id: ids, br: 320000 },
})

if (urls.status !== 200) {
  throw new Error('Failed to fetch song urls')
}

urls = urls.data?.data.map((song) => song.url)

await Bun.write('./output/download-urls.txt', urls.join('\n'))

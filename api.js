import express from 'express'
import {getVideoFrameReader} from "./api/getVideoFrameReader.js"
const app = express()

app.get("/api/sequence", async (req, res) => {
	const {dir,frameRate,duration,frameCount} = req.query

	// console.log(dirname)
	const videoPath = `public/assets/pexels-4782135.mp4`
	const base = `public/tmp/${dir}`
	// console.log(`Extracting frames from video 1... ${dir}`)
	const frames = await getVideoFrameReader(videoPath, base, frameRate)
	res.json({ frames, base })
})

export const handler = app
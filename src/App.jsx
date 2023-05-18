import { useState, useEffect, useRef } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {interpolateKeyframes} from "./fn"

import {renderMainComposition} from "./compositions/renderMainComposition"

let isPlaying = false

const timeout = async (t) => {
    return new Promise((resolve,reject)=>{
        setTimeout(()=>{
            resolve()
        },t)
    })
}

class Sequence {
    constructor( start = 0, end = Infinity, interval = 1 ) {
        this.start = start;
        this.end = end;
        this.interval = interval;
    }
    * [Symbol.iterator]() {
        for( let index = this.start; index <= this.end; index += this.interval ) {
            yield index;
        }
    }
}
function App() {
    const [frames, setFrames] = useState([])
    const [dir, setDir] = useState('video-3')

    const [pstop, setStop] = useState(false)
    const [ppause, setPause] = useState(false)
    const [pplay, setPlay] = useState(false)

    const pstopRef = useRef(null)
    pstopRef.current = pstop

    const [vFrames1, setVFrames1] = useState({frames:[], base: null})
    const [vFrames2, setVFrames2] = useState({frames:[], base: null})
    const [vFrames3, setVFrames3] = useState({frames:[], base: null})
    
    const [playingCanvas,playCanvas] = useState(0)

    const duration = 9.15
    const frameRate = 60
    const frameSkip = 1
    const frameCount = Math.floor(duration * frameRate)
    const images = []
    let pause = false
    
    const images1 = []
    const images2 = []
    const images3 = []

    const logo = new Image()
    logo.src = "logo.svg"

    const sequence =  new Sequence(1,  frameCount, frameSkip)


    let canvas,ctx,frameNumber = 0

    const getImageFrame = (index) => {



        const {frames, base} = index === 1 ? vFrames1 : index === 2 ? vFrames2 : vFrames3
        const images = index === 1 ? images1 : index === 2 ? images2 : images3

        if(!images[frameNumber]){
            images[frameNumber] = new Image()
            if(frames[frameNumber]){
                images[frameNumber].src = `${base}/${frames[frameNumber]}`
            }
            
        }

        return images[frameNumber]
    }
    const renderFrameNumber = (frame) => {
        console.log(`rendering frame ${frame}`)
        const time = frame / frameRate
        const sec = Math.round(time * 10) / 10
        console.log(`time ${time}, sec=${sec}`)
        clearCanvas()
        renderFrame(time)


    }
    const renderFrame = (time) => {

        renderMainComposition(
            ctx,
            getImageFrame(1),
            getImageFrame(2),
            getImageFrame(3),
            logo,
            canvas.width,
            canvas.height,
            time
        )

        
    }

    const clearCanvas = () => {
        ctx.clearRect(0, 0, canvas.width, canvas.height)
    }
    

    const fetchVideoFrames = async (dir) => {
        try{
            const url = `/api/sequence?dir=${dir}&duration=${duration}&frameRate=${frameRate}&frameCount=${frameCount}`
            const result = await fetch(url).then(r=>r.json())
            return result
        }catch(e){
            // setFrames([])

            console.error(e)
        }
        
        return null        
    }
    

    const startAnimation = () => {
        // console.log(playingCanvas)

        if(playingCanvas < 3){
            // stopAnimation()
            return
            // console.log(vFrames1,vFrames2,vFrames3)
        }
        if(!canvas){
            canvas = document.getElementById("my-canvas")
        }
        // if(ctx){
        //     return
        // }
        if(canvas && canvas.getContext){
            ctx = canvas.getContext("2d")
            if(ctx){
                play()
            }
        }
    }

    const stopAnimation = async() => {
        console.log(`stopAnimation called`)
        pause = true
        isPlaying = false

        return new Promise((resolve, reject) => {
            setTimeout(()=>{
                pause = false
                resolve(true)
            },2000)
        })
        
    }

    const stop = async()=>{
        console.log(`animation stoped`)
        // cancelAnimationFrame(animate)
        await stopAnimation()
    }
    let fpss= []
    const play = async()=>{
        // return
        if(isPlaying){
            console.log(`player already playing`)   
            return 
        }
        // console.log(`play()`)
        // cancelAnimationFrame(animate)
        // requestAnimationFrame(a=>animate(a))
        isPlaying = true
        const interval = 0.04 * (1000)
        let second = 0
        let fps = 0
        
        let prevSecond = 0, nextSecond=0
        for (const frame of sequence) {
            frameNumber = frame
            fps += 1
            renderFrameNumber(frame)
            await timeout(interval)
            second += (interval/1000)
            nextSecond = Math.ceil(second)
            if(nextSecond >= 1){
            if(nextSecond > prevSecond){
                prevSecond = nextSecond
                console.log(`fps = ${fps}`)
                fpss.push(fps)
                fps = 0

            }}
            console.log(`second = ${second}`)
            console.log(`nextSecond = ${nextSecond}`)
            console.log(`prevSecond = ${prevSecond}`)
            console.log(`fps = ${fpss.reduce((avg, value, _, { length }) => Math.ceil(avg + value / length), 0)}`)
        }
        isPlaying = false
        fpss=[fpss.pop()]
        play()
    }


    const fetchVFrames = async () => {
        let fetchNumber = 0
        playCanvas(fetchNumber)

        const vFrames1 = await fetchVideoFrames('video-1')
        fetchNumber += 1
        playCanvas(fetchNumber)

        setVFrames1(vFrames1)

        
        const vFrames2 = await fetchVideoFrames('video-2')
        setVFrames2(vFrames2)
        fetchNumber += 1
        playCanvas(fetchNumber)
        
        
        const vFrames3 = await fetchVideoFrames('video-3')
        setVFrames3(vFrames3)
        fetchNumber += 1
        playCanvas(fetchNumber)
        

    }
    const main = f => {
        stopAnimation().then(r=>fetchVFrames())
        
    }

    useEffect(f=>{startAnimation()},[playingCanvas])
    useEffect(main,[])


    const onPause = () => {
        setPause(true)
        isPlaying = false
        pause = true

        stop()
    }

    const onPlay = () => {
        setPlay(true)
        setPause(false)
        setStop(false)
        pstopRef.current = false
        isPlaying = false

        startAnimation()
    }

    const onStop = () => {
        setStop(true)
        isPlaying = false
        stop()

    }

    return (<><div>
        <canvas id="my-canvas" width="1280" height="720"></canvas>  

        <div>
            <div style={{display:'flex'}}>
                <button onClick={e=>onPlay()}>Play</button>
                <button onClick={e=>onPause()}>Pause</button>
                <button onClick={e=>onStop()}>Stop</button>
            </div>
        </div>
    </div></>)
}

export default App
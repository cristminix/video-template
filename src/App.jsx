import { useState, useEffect } from 'react'
import reactLogo from './assets/react.svg'
import viteLogo from '/vite.svg'
import './App.css'
import {interpolateKeyframes} from "./fn"

import {renderMainComposition} from "./compositions/renderMainComposition"


function App() {
    const [frames, setFrames] = useState([])
    const [dir, setDir] = useState('video-3')

    const [vFrames1, setVFrames1] = useState({frames:[], base: null})
    const [vFrames2, setVFrames2] = useState({frames:[], base: null})
    const [vFrames3, setVFrames3] = useState({frames:[], base: null})
    
    const [playingCanvas,playCanvas] = useState(0)

    const duration = 9.15
    const frameRate = 4
    const frameCount = Math.floor(duration * frameRate)
    const images = []
    
    const images1 = []
    const images2 = []
    const images3 = []

    const logo = new Image()
    logo.src = "logo.svg"

    let canvas,ctx,frameNumber = 0

    const getImageFrame = (index) => {
        const {frames, base} = index === 1 ? vFrames1 : index === 2 ? vFrames2 : vFrames3
        const images = index === 1 ? images1 : index === 2 ? images2 : images3

        if(!images[frameNumber]){
            images[frameNumber] = new Image()
            images[frameNumber].src = `${base}/${frames[frameNumber]}`
        }

        return images[frameNumber]
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

        /*
        if(!images[frameNumber]){
            images[frameNumber] = new Image()
            const base = `tmp/${dir}`
            images[frameNumber].src = `${base}/${frames[frameNumber]}`
        }
        // calculate the progress of the animation from 0 to 1
        // let t = time / duration

        // context.drawImage(logo, 100 + (t * 550), 100, 500, 500)

        const x = interpolateKeyframes([
            // at time 0, we want x to be 100 
            { time: 0, value: 100},
            // at time 1.5, we want x to be 550 (using cubic easing)
            { time: 1.5, value: 550, easing: 'cubic-in-out'},
            // at time 1.5, we want x to be 200 (using cubic easing)
            { time: 3, value: 200, easing: 'cubic-in-out'},
        ], time)
        
        try{
            ctx.drawImage(images[frameNumber], x, 0, 1080/2, 760/2)
        }catch(e){
            console.log(e)
        }
        */
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
        console.log(playingCanvas)

        if(playingCanvas < 3){
            stopAnimation()
            return
            // console.log(vFrames1,vFrames2,vFrames3)
        }
        if(!canvas){
            canvas = document.getElementById("my-canvas")
        }

        if(canvas && canvas.getContext){
            ctx = canvas.getContext("2d")
            if(ctx){
                animate()
            }
        }
    }

    const stopAnimation = () => {
        cancelAnimationFrame(animate)
    }

    const animate = ()=>{
        if(++frameNumber > frameCount){
            frameNumber = 1
        }

        const time = frameNumber / frameRate
        const sec = Math.round(time * 10) / 10
        clearCanvas()
        
        renderFrame(time)
        requestAnimationFrame(animate)
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
        stopAnimation()
        fetchVFrames()
    }

    useEffect(startAnimation,[playingCanvas])
    useEffect(main,[])

    return (<><div>
        <canvas id="my-canvas" width="1280" height="720"></canvas>  
    </div></>)
}

export default App
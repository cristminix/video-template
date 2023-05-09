import im from "imagemagick"
import path from "path"
import fs from "fs" 
import process from "process"
import rdl from "readline"
const timeout =(ms)=> {
    return new Promise(resolve => setTimeout(resolve, ms))
}
class LoadingBar {
    constructor(size) {
        this.size = size
        this.maxSize = size
        this.cursor = 0
        this.timer = null
        this.text = ""
        this.percentage = 0
    }
	
	start() {
        // process.stdout.write("\x1B[?25l")
        // for (let i = 0; i < 100; i++) {
        //     process.stdout.write("\u2591")
        // }
        // rdl.cursorTo(process.stdout, this.cursor, 0);
        // this.timer = setInterval(() => {
        

        //     process.stdout.write("\u2588")
        //     this.cursor++
        //     if (this.cursor >= 100) {
        //         // clearInterval(this.timer)
        //         this.cursor = 0
        //         // process.stdout.clear()
        // 		rdl.cursorTo(process.stdout, this.cursor, 0);
        // 		process.stdout.write("\x1B[?25l")
        // for (let i = 0; i < 100; i++) {
        //     process.stdout.write("\u2591")
        // }

        //     }
        // }, 100)
    }

    setText(text, skip=false){
    	this.text = text
    	this.maxSize = this.size + text.length + 1

    	var i = 0;  // dots counter
    	clearInterval(this.timer)
		this.timer = setInterval(()=> {
		  process.stdout.clearLine();  // clear current text
		  process.stdout.cursorTo(0);  // move cursor to beginning of line
		  i = (i + 1) % 4;
		  var dots = new Array(i + 1).join(".");
		  process.stdout.write(this.percentage +" % "+this.text + dots);  // write text
		}, skip?2:300);

    }
    setProgress(percentage){
    	this.percentage = percentage
    }
}
const ld = new LoadingBar(50)
ld.start()
// console.log(im) 

const getPercentage = (peak, max) => {
	const percentage = Math.ceil(Math.floor(peak / max * 100))
	return percentage
}

const makeImageSm = async (srcImage, dstImage, width = 250, height = 250) => {
	let convertArgs = [
		srcImage,
		'-resize',
		`${width}x${height}`,
		dstImage
	];
	
	return new Promise((resolve, reject) => {
		im.convert(convertArgs, function(err, metadata){
			if (err) {
				reject(err)
			}
		 
			// console.log('success! Checkout your new thumb: ');
			resolve(true)
		});
	}) 
	
}

const main = async()=>{
	const srcDir = `public/tmp`
	const dstDir = `public/tmp-small`

	if(!fs.existsSync(dstDir)){
		ld.setText(`\nmkdir ${dstDir}`,true)

		fs.mkdirSync(dstDir, { recursive:true })
		await timeout(500)
	}

	const excludeDirs = ['output']

	let dirLists = fs.readdirSync(srcDir)
		dirLists = dirLists.filter(dir => !excludeDirs.includes(dir))
	// console.log(dirLists)
	let lv1=0,lv2=0,message="",lv1pctg=0,lv2pctg=0
	const lv1Len = dirLists.length
	for(const dir of dirLists){
		lv1 += 1
		lv1pctg = getPercentage(lv1, lv1Len)
		message = `${lv1pctg}% Processing ${dir} ${lv1} of ${lv1Len}`
	
		ld.setProgress(lv1pctg)
		ld.setText(message)
		
		const activeSrcDir = `${srcDir}/${dir}`
		const activeDstDir = `${dstDir}/${dir}`

		if(!fs.existsSync(activeDstDir)){
			console.log(`mkdir ${activeDstDir}`)
			fs.mkdirSync(activeDstDir, { recursive:true })
		}

		const ls = fs.readdirSync(activeSrcDir)
		lv2 = 0
		const lv2Len = ls.length
		for(const item of ls){
			lv2 += 1

			const srcImage = `${activeSrcDir}/${item}`
			const dstImage = `${activeDstDir}/${item}`

			if(fs.existsSync(dstImage)){
				ld.setText(`skipping ${srcImage}`,true)
				await timeout(2)
				continue
			}
			lv2pctg = getPercentage(lv2, lv2Len)
			message = `Processing ${srcImage}  [${dir}] ${lv2} of ${lv2Len}`
		
			ld.setProgress(lv2pctg)
			ld.setText(message)


			const result = await makeImageSm(srcImage, dstImage)
			// const message = result? 'Ok' : 'Fail'
			if(!result)
				console.log(`fails`)

			// await timeout(5000)
		}			
	}
	process.exit(0)	
}

main()
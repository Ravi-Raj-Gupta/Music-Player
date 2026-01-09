const input = document.querySelector('.spotify-search .input');
const clear = document.querySelector('.spotify-search .clear');
let currentsong = new Audio();


function convertToMinutesSeconds(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);

    const formattedMins = mins < 10 ? '0' + mins : mins;
    const formattedSecs = secs < 10 ? '0' + secs : secs;

    return `${formattedMins}:${formattedSecs}`;
}


console.log("let write javascript")


input.addEventListener('input', () => {
    clear.style.display = input.value ? 'block' : 'none';
});

clear.addEventListener('click', () => {
    input.value = '';
    clear.style.display = 'none';
    input.focus();
});



// getting songs from the songs folder

async function getsongs() {
    try {
        let a = await fetch("./songs/")
        let response = await a.text()
        console.log("Songs response:", response)
        let div = document.createElement("div")
        div.innerHTML = response
        let as = div.getElementsByTagName("a")
        let songs = []
        for (let index = 0; index < as.length; index++) {
            const element = as[index];
            if (element.href.endsWith(".mp3")) {
                songs.push(element.href.split("/songs/")[1])
            }
        }
        console.log("Songs fetched:", songs)
        return songs
    } catch (error) {
        console.error("Error fetching songs:", error)
        return []
    }
}

// Function to extract song details from filename
function getSongDetails(songName) {
    let name = decodeURI(songName.replace(".mp3", ""))
    // Remove %2C and other URL encoded characters
    name = name.replace(/%2C/g, ",").replace(/%20/g, " ")
    const parts = name.split(" - ")
    return {
        title: parts[0].trim(),
        details: parts.slice(1).join(" - ").trim() || "Unknown Artist",
        fullName: name,
        rawSongName: songName
    }
}

// Function to generate a unique thumbnail based on song name
function generateThumbnail(songName) {
    // Array of different gradient colors
    const colors = [
        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
        "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
        "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
        "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
        "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
        "linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)",
        "linear-gradient(135deg, #2e2e78 0%, #662d8c 100%)",
        "linear-gradient(135deg, #eb3349 0%, #f45c43 100%)",
    ]
    
    // Generate a hash from song name to pick a consistent color
    let hash = 0
    for (let i = 0; i < songName.length; i++) {
        hash = ((hash << 5) - hash) + songName.charCodeAt(i)
        hash = hash & hash // Convert to 32bit integer
    }
    
    const colorIndex = Math.abs(hash) % colors.length
    return `<div style="width: 100%; height: 64%; background: ${colors[colorIndex]}; border-radius: 5px; display: flex; align-items: center; justify-content: center; color: white; font-size: 32px; font-weight: bold;">${songName.charAt(0).toUpperCase()}</div>`
}

// Cache for fetched thumbnails
const thumbnailCache = {}

// Function to fetch thumbnail using iTunes API (no authentication needed)
async function fetchThumbnailFromiTunes(title, artist) {
    const cacheKey = `${title}-${artist}`
    
    if (thumbnailCache[cacheKey]) {
        return thumbnailCache[cacheKey]
    }
    
    try {
        const query = encodeURIComponent(`${title} ${artist}`)
        const response = await fetch(`https://itunes.apple.com/search?term=${query}&media=music&limit=5`)
        const data = await response.json()
        
        if (data.results && data.results.length > 0) {
            // Find the best match
            let bestMatch = data.results[0]
            
            // Try to find exact title match
            for (let result of data.results) {
                if (result.trackName && result.trackName.includes(title)) {
                    bestMatch = result
                    break
                }
            }
            
            if (bestMatch.artworkUrl600) {
                thumbnailCache[cacheKey] = bestMatch.artworkUrl600
                console.log("Found thumbnail for:", title)
                return bestMatch.artworkUrl600
            } else if (bestMatch.artworkUrl100) {
                const largeUrl = bestMatch.artworkUrl100.replace('100x100', '600x600')
                thumbnailCache[cacheKey] = largeUrl
                return largeUrl
            }
        }
    } catch (error) {
        console.log("Error fetching thumbnail for", title, ":", error)
    }
    
    return null
}

// Function to display songs in trending section
async function displayTrendingSongs() {
    let songs = await getsongs()
    const cardContainer = document.querySelector(".card-container")
    
    // Clear existing cards
    cardContainer.innerHTML = ""
    
    // Array of different gradient backgrounds (fallback)
    const gradients = [
        "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
        "linear-gradient(135deg, #f093fb 0%, #f5576c 100%)",
        "linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)",
        "linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)",
        "linear-gradient(135deg, #fa709a 0%, #fee140 100%)",
        "linear-gradient(135deg, #30cfd0 0%, #330867 100%)",
        "linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)",
        "linear-gradient(135deg, #ff9a56 0%, #ff6a88 100%)",
        "linear-gradient(135deg, #2e2e78 0%, #662d8c 100%)",
        "linear-gradient(135deg, #eb3349 0%, #f45c43 100%)",
    ]
    
    // Add each song as a card
    for (let index = 0; index < songs.length; index++) {
        const song = songs[index]
        const songDetails = getSongDetails(song)
        const card = document.createElement("div")
        card.className = "songs-card"
        
        // Get gradient for fallback
        const gradient = gradients[index % gradients.length]
        
        // Set placeholder while fetching thumbnail
        card.innerHTML = `
            <div style="width: 100%; height: 64%; background: ${gradient}; border-radius: 5px; display: flex; align-items: center; justify-content: center; color: white; font-size: 48px; font-weight: bold; text-shadow: 2px 2px 4px rgba(0,0,0,0.5);">
                ${songDetails.title.charAt(0).toUpperCase()}
            </div>
            <h3>${songDetails.title}</h3>
            <div class="songs-details">${songDetails.details}</div>
        `
        
        // Add click listener to play the song
        card.addEventListener("click", () => {
            playmusic(songDetails.fullName)
        })
        
        cardContainer.appendChild(card)
        
        // Fetch and update thumbnail asynchronously
        setTimeout(async () => {
            const thumbnailUrl = await fetchThumbnailFromiTunes(songDetails.title, songDetails.details)
            if (thumbnailUrl) {
                const imgDiv = card.querySelector("div")
                const img = document.createElement("img")
                img.src = thumbnailUrl
                img.alt = songDetails.title
                img.style.cssText = "width: 100%; height: 64%; border-radius: 5px; object-fit: cover;"
                imgDiv.replaceWith(img)
            }
        }, index * 500) // Stagger requests to avoid rate limiting
    }
    
    // Initialize slider buttons
    initializeSlider()
}

// Function to initialize slider navigation
function initializeSlider() {
    const cardContainer = document.querySelector("#cardContainer")
    const prevBtn = document.querySelector("#prev-slider")
    const nextBtn = document.querySelector("#next-slider")
    
    // Show buttons if there are more cards than visible
    const updateButtonVisibility = () => {
        const containerWidth = cardContainer.clientWidth
        const scrollWidth = cardContainer.scrollWidth
        
        prevBtn.style.display = cardContainer.scrollLeft > 0 ? "block" : "none"
        nextBtn.style.display = cardContainer.scrollLeft < (scrollWidth - containerWidth - 10) ? "block" : "none"
    }
    
    // Scroll amount per click
    const scrollAmount = 400
    
    prevBtn.addEventListener("click", () => {
        cardContainer.scrollBy({
            left: -scrollAmount,
            behavior: "smooth"
        })
        setTimeout(updateButtonVisibility, 300)
    })
    
    nextBtn.addEventListener("click", () => {
        cardContainer.scrollBy({
            left: scrollAmount,
            behavior: "smooth"
        })
        setTimeout(updateButtonVisibility, 300)
    })
    
    // Update button visibility on scroll
    cardContainer.addEventListener("scroll", updateButtonVisibility)
    
    // Add mouse wheel scrolling support
    cardContainer.addEventListener("wheel", (e) => {
        e.preventDefault()
        const scrollAmount = 200
        
        if (e.deltaY > 0) {
            // Scroll down/right
            cardContainer.scrollBy({
                left: scrollAmount,
                behavior: "smooth"
            })
        } else {
            // Scroll up/left
            cardContainer.scrollBy({
                left: -scrollAmount,
                behavior: "smooth"
            })
        }
        
        setTimeout(updateButtonVisibility, 300)
    })
    
    // Add drag to scroll support
    let isDown = false
    let startX
    let scrollLeft
    
    cardContainer.addEventListener("mousedown", (e) => {
        isDown = true
        startX = e.pageX - cardContainer.offsetLeft
        scrollLeft = cardContainer.scrollLeft
    })
    
    cardContainer.addEventListener("mouseleave", () => {
        isDown = false
    })
    
    cardContainer.addEventListener("mouseup", () => {
        isDown = false
    })
    
    cardContainer.addEventListener("mousemove", (e) => {
        if (!isDown) return
        e.preventDefault()
        const x = e.pageX - cardContainer.offsetLeft
        const walk = (x - startX) * 1 // Scroll sensitivity
        cardContainer.scrollLeft = scrollLeft - walk
        updateButtonVisibility()
    })
    
    // Initial button visibility check
    updateButtonVisibility()
}

const playmusic = (track, pause = false) => {
    // let audio = new Audio("/songs/" + track)
    currentsong.src = "/songs/" + track + ".mp3"
    if(!pause){
        currentsong.play()
        play.src = "pause.svg"
    }
    document.querySelector(".songname").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}



// main function
async function main() {
    // get the list of first songs
    let songs = await getsongs();
    playmusic(songs[0],true)

    // Display songs in trending section
    await displayTrendingSongs()

    // inserting all the songs in the library 
    let songul = document.querySelector(".songs-list").getElementsByTagName('ul')[0]
    for (const song of songs) {
        // Extract song name without .mp3 and decode URL encoding
        let displayName = decodeURI(song.replace(".mp3", ""))
        displayName = displayName.replace(/%2C/g, ",")
        
        songul.innerHTML = songul.innerHTML + `<li>
                            <img src="music.svg" height=18px>
                            <div class="info">
                                <div data-song="${displayName}">${displayName}</div>
                                <div></div>
                            </div>
                            <div class="playbtn">
                                <img src="play.svg" alt="">
                            </div>
                        </li>`
    }

    // attach an event listener to each songs
    Array.from(document.querySelector(".songs-list").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", () => {
            const songName = e.querySelector(".info").firstElementChild.getAttribute("data-song")
            console.log("Playing song:", songName)
            playmusic(songName)
        })
    })

    // attach an event listener to each button in playbar

    play.addEventListener("click", () => {
        if (currentsong.paused) {
            currentsong.play();
            play.src = "pause.svg"

        }
        else {
            currentsong.pause()
            play.src = "play.svg"
        }
    })

    currentsong.addEventListener("timeupdate", () => {
        // console.log(currentsong.currentTime, currentsong.duration)
        document.querySelector(".songtime").innerHTML = `${convertToMinutesSeconds(currentsong.currentTime)}/${convertToMinutesSeconds(currentsong.duration)}`

        document.querySelector(".circle").style.left = (currentsong.currentTime/currentsong.duration)*100 + "%"

    })
 
    document.querySelector(".seekbar").addEventListener("click",e=>{
        let percent = (e.offsetX/e.target.getBoundingClientRect().width)*100
        document.querySelector(".circle").style.left = percent + "%"
        currentsong.currentTime = (currentsong.duration)*percent /100
    })
    // add an event listener to previous
    prev.addEventListener("click", ()=>{
        console.log("prev")
        console.log(currentsong)
        let index = songs.indexOf(currentsong.src.split("/songs/").slice(-1) [0])
        if(index-1 >= 0){
            playmusic(songs[index-1])
        }
    })  

    // add an event listtener to next button
    next.addEventListener("click", ()=>{
        console.log("next")
        console.log(currentsong)
        let index = songs.indexOf(currentsong.src.split("/songs/").slice(-1) [0])
        if(index+1 > length){
            playmusic(songs[index+1])   
        }
    })  
}


main()

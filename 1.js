const input = document.querySelector('.spotify-search .input');
const clear = document.querySelector('.spotify-search .clear');
let currentsong = new Audio();
let folder = "cs"; // You can change this dynamically later


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

async function getsongs(folder) {
    let a = await fetch(`http://127.0.0.1:3000/songs/${folder}/`);
    let response = await a.text();

    let div = document.createElement("div");
    div.innerHTML = response;

    let as = div.getElementsByTagName("a");
    let songs = [];

    for (let index = 0; index < as.length; index++) {
        const element = as[index];
        if (element.href.endsWith(".mp3")) {
            songs.push(`${folder}/` + element.href.split(`/songs/${folder}/`)[1]);
        }
    }

    return songs;
}


const playmusic = (track, pause = false) => {
    // let audio = new Audio("/songs/" + track)
    currentsong.src = "/songs/" + track
    if (!pause) {
        currentsong.play()
        play.src = "pause.svg"

    }
    document.querySelector(".songname").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00 / 00:00"
}





// main function
async function main() {
    // get the list of first songs
    let songs = await getsongs(folder);
    playmusic(songs[0], true);


    // inserting all the songs in the library 
    let songul = document.querySelector(".songs-list ul");
    songul.innerHTML = ""; // Clear old songs
    for (const song of songs) {
        songul.innerHTML += `<li>
            <img src="music.svg" height=18px>
            <div class="info">
                <div>${song.replace(`${folder}/`, "").replaceAll("%20", " ")}</div>
                <div></div>
            </div>
            <div class="playbtn">
                <img src="play.svg" alt="">
            </div>
        </li>`;
    }

    // attach an event listener to each songs
    Array.from(document.querySelectorAll(".songs-list li")).forEach(e => {
        e.addEventListener("click", () => {
            const songName = e.querySelector(".info").firstElementChild.innerHTML;
            playmusic(`${folder}/` + songName);
        });
    });

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
    // event listener for the current song duration  and current songs current time
    currentsong.addEventListener("timeupdate", () => {
        // console.log(currentsong.currentTime, currentsong.duration)
        document.querySelector(".songtime").innerHTML = `${convertToMinutesSeconds(currentsong.currentTime)}/${convertToMinutesSeconds(currentsong.duration)}`

        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%"

    })
    // add an event listener to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {
        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100
        document.querySelector(".circle").style.left = percent + "%"
        currentsong.currentTime = (currentsong.duration) * percent / 100
    })
    // add an event listener to previous
    prev.addEventListener("click", () => {
        console.log("prev")
        console.log(currentsong)
        let index = songs.indexOf(currentsong.src.split("/songs/").slice(-1)[0])
        if (index - 1 >= 0) {
            playmusic(songs[index - 1])
        }
    })

    // add an event listtener to next button
    next.addEventListener("click", () => {
        console.log("next")
        console.log(currentsong)
        let index = songs.indexOf(currentsong.src.split("/songs/").slice(-1)[0])
        if (index + 1 > length) {
            playmusic(songs[index + 1])
        }

    })

}


main()

console.log('hello jii');

let currentsong = new Audio();
let songs;
let currfolder;


function convertToMinuteSeconds(Seconds) {
    if (isNaN(Seconds) || Seconds < 0) {
        return "00:00";
    }

    const minutes = Math.floor(Seconds / 60);
    const remaningseconds = Math.floor(Seconds % 60);

    const formatedminutes = String(minutes).padStart(2, '0');
    const formatedseconds = String(remaningseconds).padStart(2, '0');

    return `${formatedminutes}:${formatedseconds}`;
}


async function getsongs(folder) {
    currfolder = folder;    
    let a = await fetch(`http://127.0.0.1:3002/${folder}/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let as = div.getElementsByTagName("a")
    songs = []
    for (let index = 0; index < as.length; index++) {
        const element = as[index];

        if (element.href.endsWith(".mp3")) {
            songs.push(element.href.split(`/${folder}/`)[1])
        }

    }

    //show all songs in playlist



    let songul = document.querySelector(".songlist").getElementsByTagName("ul")[0]
    songul.innerHTML = ""
    for (const song of songs) {
        songul.innerHTML = songul.innerHTML + `
      <li>
      <img src="music.svg" alt="">
                  <div class="info">
                  <div>${song.replaceAll("%20", " ")}</div>
                  <div>ashish</div>
                  </div>
                  <div class="playnow"><img src="playnow.svg" alt=""></div>
                        
     </li>`;

    }

    //attach a eventlistner to the song
    Array.from(document.querySelector(".songlist").getElementsByTagName("li")).forEach(e => {
        e.addEventListener("click", element => {

            PlayMusic(e.querySelector(".info").firstElementChild.innerHTML.trim())

        })


    })


   return songs
}

const PlayMusic = (track, pause = false) => {

    currentsong.src = `/${currfolder}/` + track
    if (!pause) {
        currentsong.play()
        play.src = "pause.svg"
    }

    document.querySelector(".songinfo").innerHTML = decodeURI(track)
    document.querySelector(".songtime").innerHTML = "00:00/00:00"
}

//funcation to display albums

async function displayalbums() {
    let a = await fetch(`http://127.0.0.1:3002/songs/`)
    let response = await a.text();
    let div = document.createElement("div")
    div.innerHTML = response;
    let acnhors = div.getElementsByTagName("a")
    let cardconatiner = document.querySelector(".cardconatiner")
    let array = Array.from(acnhors)
    for (let index = 0; index < array.length; index++) {
        const e = array[index]


        if (e.href.includes("/songs")) {
            let folder = e.href.split("/").slice(-2)[0];
            //get the meta data of the folder

            let a = await fetch(`http://127.0.0.1:3002/songs/${folder}/info.json`)
            let response = await a.json();
            console.log(response)
            cardconatiner.innerHTML = cardconatiner.innerHTML + `
              <div data-folder="${folder}" class="card">
                        <div class="play">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 38 38" width="36" height="38">
                                <rect width="36" height="36" rx="18" fill="	#1db954" />
                                <g transform="translate(6 6)">
                                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" width="24" height="24"
                                        color="#000000" fill="none">
                                        <path fill="black"
                                            d="M18.8906 12.846C18.5371 14.189 16.8667 15.138 13.5257 17.0361C10.296 18.8709 8.6812 19.7884 7.37983 19.4196C6.8418 19.2671 6.35159 18.9776 5.95624 18.5787C5 17.6139 5 15.7426 5 12C5 8.2574 5 6.3861 5.95624 5.42132C6.35159 5.02245 6.8418 4.73288 7.37983 4.58042C8.6812 4.21165 10.296 5.12907 13.5257 6.96393C16.8667 8.86197 18.5371 9.811 18.8906 11.154C19.0365 11.7084 19.0365 12.2916 18.8906 12.846Z"
                                            stroke="black" stroke-width="1.5" stroke-linejoin="round" />
                                    </svg>
                                </g>
                            </svg>

                        </div>
                        <img src="/songs/${folder}/cover.jpg" alt="">
                        <h3>${response.title}</h3>
                        <p class="color1">${response.description}</p>
                    </div>`
        }
    }


    //load plsylist whwnever is clicked

    Array.from(document.getElementsByClassName("card")).forEach(e => {

        e.addEventListener("click", async item => {

            songs = await getsongs(`songs/${item.currentTarget.dataset.folder}`)
            PlayMusic(songs[0])

        })
    })


    // event listner to run next song auto if previous finished
    currentsong.addEventListener("ended", () => {

        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);

        PlayMusic(songs[index + 1])

    })

    //add event to next and previous

    previous.addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);

        if ((index - 1) >= 0) {
            PlayMusic(songs[index - 1])
        }



    })



    next.addEventListener("click", () => {
        let index = songs.indexOf(currentsong.src.split("/").slice(-1)[0]);

        if ((index + 1) < songs.length) {
            PlayMusic(songs[index + 1])
        }


    })




}


async function main() {


    //get the list of all the songs
    await getsongs("songs")
    PlayMusic(songs[0], true)

    //album display code
    displayalbums()

    //attch event listner to play ,previous and next

    play.addEventListener("click", () => {

        if (currentsong.paused) {
            currentsong.play()
            play.src = "pause.svg"
        }
        else {
            currentsong.pause()
            play.src = "play.svg"
        }
    })


    //listen for time update event

    currentsong.addEventListener("timeupdate", () => {
        document.querySelector(".songtime").innerHTML = `${convertToMinuteSeconds(currentsong.currentTime)} / ${convertToMinuteSeconds(currentsong.duration)}`
        document.querySelector(".circle").style.left = (currentsong.currentTime / currentsong.duration) * 100 + "%";

    })

    //add an eventlistner to seekbar
    document.querySelector(".seekbar").addEventListener("click", e => {

        let percent = (e.offsetX / e.target.getBoundingClientRect().width) * 100;
        document.querySelector(".circle").style.left = percent + "%";
        currentsong.currentTime = (currentsong.duration) * percent / 100;

    })

    //add event on hamburger
    document.querySelector(".hamburger").addEventListener("click", () => {

        document.querySelector(".left").style.left = "0"
    })

    //add event on cross
    document.querySelector(".close").addEventListener("click", () => {

        document.querySelector(".left").style.left = "-120%"
    })



    //add eventlistner to range volume


    document.querySelector(".range").getElementsByTagName("input")[0].addEventListener("change", (e) => {

        currentsong.volume = parseInt(e.target.value) / 100;


    })

    //add event listner to the volume to mute and unmute

    document.querySelector(".volume>img").addEventListener("click", e => {

        if (e.target.src.includes("volume.svg")) {
           e.target.src = e.target.src.replace("volume.svg","mute.svg")
           currentsong.volume=0;
           document.querySelector(".range").getElementsByTagName("input")[0].value=0;
        }
        else {
            e.target.src = e.target.src.replace("mute.svg","volume.svg")
            currentsong.volume=.50;
            document.querySelector(".range").getElementsByTagName("input")[0].value=.50;
        }



    })



    document.querySelector(".button1").addEventListener("click",()=>{

        alert("this feature is under construction")  
    
    })

    document.querySelector(".button").addEventListener("click",()=>{

        alert("this feature is under construction")  
    
    })

}

main()





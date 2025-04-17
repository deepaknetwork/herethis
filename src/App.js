import { useEffect, useRef, useState } from 'react';
import './index.css';
import axios from 'axios';
import { languagesOfState, rainyCodes } from './data/data';
import { GetListByKeyword } from 'youtube-search-api';
function App() {
  
  var lat=useRef();
  var lon=useRef();
  var ln=useRef();
  var cl=useRef();
  var now=useRef();
  var [change,setChange]=useState(1);
  const [title, setTitle] = useState();
  const [videoId, setVideoId] = useState(null);
  const playerRef = useRef(null);
  const ytPlayer = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [fetched, setFetched] = useState(false);
  var songlist = useRef()
  var ind = useRef(1);
  var [ops, setOps] = useState("Featured")
  var input1 = useRef()
  var [loading, setLoading] = useState(false);
  var[location, setLocation] = useState(false)
  const colors = [
    "lightgray",    
    "#d3d3d3",      
    "#6a8acd",    
    "#e07b7b",       
    "lightgreen",   
  ];
  const colors1 = [
    "rgba(0, 0, 0, 0.08)",     
    "rgba(169, 169, 169, 0.08)", 
    "rgba(0, 0, 139, 0.08)",   
    "rgba(255, 0, 0, 0.08)",   
    "rgba(0, 128, 0, 0.08)",   
  ];
  const [currentColor, setCurrentColor] = useState(0);
  const [error, setError] = useState(null);
  
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          lat.current=position.coords.latitude
          lon.current=position.coords.longitude
          findLn(lat.current, lon.current);
          findwe(lat.current, lon.current);
          findTi();
        },
        (err) => {
          setError("Location access denied or unavailable.");
        }
      );
      
    } else {
      setError("Geolocation not supported by this browser.");
    }
  }, []);
  useEffect(() => {
    if(isPlaying){
    const interval = setInterval(() => {
      setCurrentColor((prevColor) => (prevColor + 1) % colors.length);
    }, 2000); 

    return () => clearInterval(interval);
   } 
  }, [isPlaying]);

  useEffect(() => {
    document.documentElement.style.setProperty('--dynamic-color', colors[currentColor]);
    document.documentElement.style.setProperty('--dynamic-color-1', colors1[currentColor]);
  }, [currentColor]);

  const findLn = async (tlat, tlon) => {
    await axios.get(`https://nominatim.openstreetmap.org/reverse?lat=${tlat}&lon=${tlon}&format=json`)
      .then(res => {
        ln.current=languagesOfState.find(item => item.state.toLowerCase() === res.data.address.state.toLowerCase()).language;
        setChange(2);
      })
      .catch(err => {
        console.log(err);
      });
  };

  const findwe = async (tlat, tlon) => {
    await axios.get(`https://api.open-meteo.com/v1/forecast?latitude=${tlat}&longitude=${tlon}&current_weather=true`)
      .then(res => {
        if (rainyCodes.includes(res.data.current_weather.weathercode)) {
          cl.current="Rainy";
        } else if (res.data.current_weather.temperature >= 32) cl.current="Hot";
        else if (res.data.current_weather.temperature >= 22) cl.current="Normal";
        else cl.current="Chill";
        setChange(3);
      })
      .catch(err => console.log(err));
  };

  const findTi = () => {
    const noww = new Date();
    const hour = noww.getHours();
    if (hour >= 5 && hour < 12) now.current="Morning";
    else if (hour >= 12 && hour < 17) now.current="Afternoon";
    else if (hour >= 17 && hour < 20) now.current="Evening";
    else now.current="Night";
    setChange(4);
  };
  function nextSong() {
    console.log(ind)
    setVideoId(songlist.current[ind.current].videoId)
    setTitle(songlist.current[ind.current].title)
    ind.current = ind.current + 1
  }
  function skip1() {
    if (ytPlayer.current) {
      const currentTime = ytPlayer.current.getCurrentTime();
      ytPlayer.current.seekTo(currentTime + 60, true);
    }
  }
  function skip5() {
    if (ytPlayer.current) {
      const currentTime = ytPlayer.current.getCurrentTime();
      ytPlayer.current.seekTo(currentTime + 300, true);
    }
  }
  function back1() {
    if (ytPlayer.current) {
      const currentTime = ytPlayer.current.getCurrentTime();
      ytPlayer.current.seekTo(currentTime - 60, true);
    }
  }
  function back5() {
    if (ytPlayer.current) {
      const currentTime = ytPlayer.current.getCurrentTime();
      ytPlayer.current.seekTo(currentTime - 300, true);
    }
  }


  useEffect(() => {
    if (ln.current && cl.current && now.current && !fetched) {
      axios.get(`https://herethisexpress.yellowrock-ae9aa95a.southindia.azurecontainerapps.io/song?q=${ln.current} songs ${now.current} ${cl.current=="Rainy"?"with rain":""}`)
        .then(res => {
          songlist.current=res.data.videoId
          console.log(res.data.videoId)
          setOps(`Featured`)
          setVideoId(res.data.videoId[0].videoId);
          setTitle(res.data.videoId[0].title);
          setFetched(true);
        });
    }
  }, [ln.current, cl.current, now.current, fetched,change]);

  useEffect(() => {
    const loadYouTubeAPI = () => {
      const tag = document.createElement('script');
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName('script')[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    };

    if (!window.YT) {
      loadYouTubeAPI();
      window.onYouTubeIframeAPIReady = () => {
        ytPlayer.current = new window.YT.Player('yt-player', {
          videoId,
          playerVars: {
            autoplay: 1,
            mute: 0,
            controls: 0,
            modestbranding: 1,
            loop: 0,
          },
          events: {
            onStateChange: (event) => {
              if (event.data === window.YT.PlayerState.ENDED) {
                nextSong();
              }
            }
          }
        });
      };
    } else {
      if (ytPlayer.current && ytPlayer.current.loadVideoById) {
        ytPlayer.current.loadVideoById(videoId);
      } else {
        ytPlayer.current = new window.YT.Player('yt-player', {
          videoId,
          playerVars: {
            autoplay: 1,
            mute: 0,
            controls: 0,
            modestbranding: 1,
            loop: 0,
          },
          events: {
            onStateChange: (event) => {
              if (event.data === window.YT.PlayerState.ENDED) {
                setOps("Featured")
                nextSong();
              }
            }
          }
        });
      }
    }
  }, [videoId]);


  const togglePlayback = () => {
    const player = ytPlayer.current;
    if (player) {
      const state = player.getPlayerState();
      if (state === window.YT.PlayerState.PLAYING) {
        player.pauseVideo();
        setIsPlaying(false);
      } else {
        player.playVideo();
        setIsPlaying(true);
      }
    }
  };

  async function findSong() {
    setLoading(true)
    console.log(input1.current)
    await axios.get(`https://herethisexpress.yellowrock-ae9aa95a.southindia.azurecontainerapps.io/song/find?q=${input1.current} song`)
      .then(res => {
        setVideoId(res.data.videoId);
        setTitle(res.data.title);
        setOps(res.data.title)
        setFetched(true);
        setIsPlaying(true)
        setLoading(false)
      });
  }
  function playfeatured() {
    if (ops != "Featured") {
      setVideoId(songlist.current[ind.current].videoId)
      setTitle(songlist.current[ind.current].title)

      setOps("Featured")
    }
  }
  return (
    <><header >
      <div className='h1'>
        <img className='hicon' src='/icon.png'/>
      <span className='htext'>HereThis</span>
      </div>
      <div className='slogan'>
        <span className='slogantext'>Bringing Music, Language, and Time Together</span>
        </div>
    </header>

      <div className='row app'>
        {videoId && (
        <div className='col-xl-6 col-sm-12 sec1'>
          <div className='sec11' >
            <div className='sec1h'><span className='sh'>Featured</span>{ops!=="Featured"&&<button className='feplay' onClick={playfeatured}>play</button>}</div>
            <div className='sec1b'>
              <span className='si'>Language : {ln.current}</span>
              <span className='si'>Climate : {cl.current}</span>
              <span className='si'>Day Time : {now.current}</span>
            </div>
            
          </div>
          <div className='sec12'>
          <div className='sec1h'><span className='sh'>Find the song</span></div>
          <div className='sec1b1'>
            <div className='sec120'>
              <input className='sii' placeholder='enter the name of song' onChange={(x) => {
                input1.current = x.target.value
              }} />
              {!loading && <svg onClick={findSong} xmlns="http://www.w3.org/2000/svg"  fill="currentColor" class="bi bi-search sbtn" viewBox="0 0 16 16">
                <path d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001q.044.06.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1 1 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0" />
              </svg>}
            </div>
            </div>
            <div className='sbot'>
        <span className='sbott'>A product by <a href='https://mrdeepak.tech/'>DEEPAK</a></span>
      </div>
          </div>

        </div>)}
        <div className='col-xl-6 col-sm-12 sec2 '>
          {videoId ? (
            <div className='sec2div'>
              <div className='s2d0'>
                <span className='s2d0t'>{ops.split("|")[0]}</span>
              </div>
              <div className='s2d1'>
                <div id="yt-player" style={{ width: 300, height: 180, borderRadius: "1rem", boxShadow: "0 0 10px rgba(0,0,0,0.2)" }}></div>
                  <button
                    className={`playbtn ${isPlaying ? 'playing-effect' : ''}`}
                    onClick={togglePlayback}>
                    {isPlaying ? <svg  xmlns="http://www.w3.org/2000/svg"  fill="currentColor" class="bi bi-pause-fill playicon" viewBox="0 0 16 16">
                      <path d="M5.5 3.5A1.5 1.5 0 0 1 7 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5m5 0A1.5 1.5 0 0 1 12 5v6a1.5 1.5 0 0 1-3 0V5a1.5 1.5 0 0 1 1.5-1.5" />
                    </svg> : <svg xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-play-fill playicon" viewBox="0 0 16 16">
                      <path d="m11.596 8.697-6.363 3.692c-.54.313-1.233-.066-1.233-.697V4.308c0-.63.692-1.01 1.233-.696l6.363 3.692a.802.802 0 0 1 0 1.393" />
                    </svg>}
                  </button>

              </div>
              <div className='s2d2'>
                <svg onClick={back5} xmlns="http://www.w3.org/2000/svg"  fill="currentColor" class="bi bi-skip-backward-fill s2d2btn" viewBox="0 0 16 16">
                  <path d="M.5 3.5A.5.5 0 0 0 0 4v8a.5.5 0 0 0 1 0V8.753l6.267 3.636c.54.313 1.233-.066 1.233-.697v-2.94l6.267 3.636c.54.314 1.233-.065 1.233-.696V4.308c0-.63-.693-1.01-1.233-.696L8.5 7.248v-2.94c0-.63-.692-1.01-1.233-.696L1 7.248V4a.5.5 0 0 0-.5-.5" />
                </svg>
                <svg onClick={back1} xmlns="http://www.w3.org/2000/svg"  fill="currentColor" class="bi bi-skip-start-fill s2d2btn" viewBox="0 0 16 16">
                  <path d="M4 4a.5.5 0 0 1 1 0v3.248l6.267-3.636c.54-.313 1.232.066 1.232.696v7.384c0 .63-.692 1.01-1.232.697L5 8.753V12a.5.5 0 0 1-1 0z" />
                </svg>
                <svg  onClick={skip1} xmlns="http://www.w3.org/2000/svg" fill="currentColor" class="bi bi-skip-end-fill s2d2btn" viewBox="0 0 16 16">
                  <path d="M12.5 4a.5.5 0 0 0-1 0v3.248L5.233 3.612C4.693 3.3 4 3.678 4 4.308v7.384c0 .63.692 1.01 1.233.697L11.5 8.753V12a.5.5 0 0 0 1 0z" />
                </svg>
                <svg  onClick={skip5} xmlns="http://www.w3.org/2000/svg"  fill="currentColor" class="bi bi-skip-forward-fill s2d2btn" viewBox="0 0 16 16">
                  <path d="M15.5 3.5a.5.5 0 0 1 .5.5v8a.5.5 0 0 1-1 0V8.753l-6.267 3.636c-.54.313-1.233-.066-1.233-.697v-2.94l-6.267 3.636C.693 12.703 0 12.324 0 11.693V4.308c0-.63.693-1.01 1.233-.696L7.5 7.248v-2.94c0-.63.693-1.01 1.233-.696L15 7.248V4a.5.5 0 0 1 .5-.5" />
                </svg>
                <svg  onClick={nextSong} xmlns="http://www.w3.org/2000/svg"  fill="currentColor" class="bi bi-x-square-fill s2d2btn" viewBox="0 0 16 16">
                  <path d="M2 0a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V2a2 2 0 0 0-2-2zm3.354 4.646L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 1 1 .708-.708" />
                </svg>
              </div>
            </div>
          ) : (
            <p>{error?error:"Loading song..."}</p>
          )}
        </div>
        
      </div>
      <div className='footer'>
      <div className='bot'>
        <span className='bott'>A product by <a href='https://mrdeepak.tech/'>Deepak</a></span>
      </div>
      <div className='dlogan'>
        <span className='dlogantext'>Bringing Music, Language, and Time Together</span>
        </div>
        </div>
    </>
  );
}

export default App;

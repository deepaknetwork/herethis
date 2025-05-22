import { useEffect, useRef, useState } from "react";
import "./big.css";
import "./small.css";
import axios from "axios";
import { languagesOfState, rainyCodes } from "./data/data";
import { GetListByKeyword } from "youtube-search-api";

function App() {
  const [category, setCategory] = useState("");
  const [selectedLanguage, setSelectedLanguage] = useState(""); // single language
  const [selectedMood, setSelectedMood] = useState(""); // single mood
  const [selectedTimeline, setSelectedTimeline] = useState(""); // single timeline
  var cusSelected = useRef("");

  // Handle language selection
  const toggleLanguage = (lang) => {
    setSelectedLanguage(selectedLanguage === lang ? "" : lang); // toggle between select and deselect
  };

  // Handle mood selection
  const toggleMood = (mood) => {
    setSelectedMood(selectedMood === mood ? "" : mood); // toggle between select and deselect
  };

  // Handle timeline selection
  const toggleTimeline = (time) => {
    setSelectedTimeline(selectedTimeline === time ? "" : time); // toggle between select and deselect
  };

  var lat = useRef();
  var lon = useRef();
  var ln = useRef();
  var cl = useRef();
  var now = useRef();
  var [change, setChange] = useState(1);
  const [title, setTitle] = useState();
  const [videoId, setVideoId] = useState(null);
  const playerRef = useRef(null);
  const ytPlayer = useRef(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [fetched, setFetched] = useState(false);
  var songlist = useRef();
  var ind = useRef(1);
  var [ops, setOps] = useState("Featured");
  var input1 = useRef();
  var [loading, setLoading] = useState(false);
  var [location, setLocation] = useState(false);
  var [showCustomGet, setShowCustomGet] = useState(true);
  var [showPlayFea, setShowPlayFea] = useState(false);
  const colors = ["lightgray", "#d3d3d3", "#6a8acd", "#e07b7b", "lightgreen"];
  const colors1 = [
    "rgba(0, 0, 0, 0.08)",
    "rgba(169, 169, 169, 0.08)",
    "rgba(0, 0, 139, 0.08)",
    "rgba(255, 0, 0, 0.08)",
    "rgba(0, 128, 0, 0.08)",
  ];
  const [currentColor, setCurrentColor] = useState(0);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!navigator.geolocation) {
      setError("Geolocation not supported by this browser.");
      return;
    }

    navigator.permissions?.query({ name: "geolocation" }).then((result) => {
      if (result.state === "denied") {
        setError("Location access has been denied.");
      } else {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            setLocation(true);
            lat.current = position.coords.latitude;
            lon.current = position.coords.longitude;
            findLn(lat.current, lon.current);
            findwe(lat.current, lon.current);
            findTi();
          },
          (err) => {
            if (err.code === 1) {
              setError("Location access denied by user.");
            } else if (err.code === 2) {
              setError("Location unavailable.");
            } else if (err.code === 3) {
              setError("Location request timed out.");
            } else {
              setError("An unknown error occurred.");
            }
          }
        );
      }
    });
  }, []);

  useEffect(() => {
    if (isPlaying) {
      const interval = setInterval(() => {
        setCurrentColor((prevColor) => (prevColor + 1) % colors.length);
      }, 2000);

      return () => clearInterval(interval);
    }
  }, [isPlaying]);

  useEffect(() => {
    document.documentElement.style.setProperty(
      "--dynamic-color",
      colors[currentColor]
    );
    document.documentElement.style.setProperty(
      "--dynamic-color-1",
      colors1[currentColor]
    );
  }, [currentColor]);

  const findLn = async (tlat, tlon) => {
    await axios
      .get(
        `https://nominatim.openstreetmap.org/reverse?lat=${tlat}&lon=${tlon}&format=json`
      )
      .then((res) => {
        ln.current = languagesOfState.find(
          (item) =>
            item.state.toLowerCase() === res.data.address.state.toLowerCase()
        ).language;
        setChange(2);
      })
      .catch((err) => {
        console.log(err);
      });
  };

  const findwe = async (tlat, tlon) => {
    await axios
      .get(
        `https://api.open-meteo.com/v1/forecast?latitude=${tlat}&longitude=${tlon}&current_weather=true`
      )
      .then((res) => {
        if (rainyCodes.includes(res.data.current_weather.weathercode)) {
          cl.current = "Rainy";
        } else if (res.data.current_weather.temperature >= 32)
          cl.current = "Hot";
        else if (res.data.current_weather.temperature >= 22)
          cl.current = "Normal";
        else cl.current = "Chill";
        setChange(3);
      })
      .catch((err) => console.log(err));
  };

  const findTi = () => {
    const noww = new Date();
    const hour = noww.getHours();
    if (hour >= 5 && hour < 12) now.current = "Morning";
    else if (hour >= 12 && hour < 17) now.current = "Afternoon";
    else if (hour >= 17 && hour < 20) now.current = "Evening";
    else now.current = "Night";
    setChange(4);
  };

  function nextSong() {
    console.log(ind);
    setVideoId(songlist.current[ind.current].videoId);
    setTitle(songlist.current[ind.current].title);
    ind.current = ind.current + 1;
    localStorage.setItem("savedind", ind.current);
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
      var index = parseInt(localStorage.getItem("savedind") || "0");
      ind.current = index < 7 ? index : 0;
      axios
        .get(
          `https://herethisexpress.yellowrock-ae9aa95a.southindia.azurecontainerapps.io/song?q=${
            ln.current
          } songs ${now.current} ${cl.current == "Rainy" ? "with rain" : ""}`
        )
        .then((res) => {
          songlist.current = res.data.videoId;
          console.log(res.data.videoId);
          setOps(`Featured`);
          setVideoId(res.data.videoId[ind.current].videoId);
          setTitle(res.data.videoId[ind.current].title);
          localStorage.setItem("savedind", ind.current + 1);
          setFetched(true);
        });
    }
  }, [ln.current, cl.current, now.current, fetched, change]);

  useEffect(() => {
    const loadYouTubeAPI = () => {
      const tag = document.createElement("script");
      tag.src = "https://www.youtube.com/iframe_api";
      const firstScriptTag = document.getElementsByTagName("script")[0];
      firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
    };

    if (!window.YT) {
      loadYouTubeAPI();
      window.onYouTubeIframeAPIReady = () => {
        ytPlayer.current = new window.YT.Player("yt-player", {
          videoId,
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
            showinfo: 0
          },
          events: {
            onStateChange: (event) => {
              if (event.data === window.YT.PlayerState.ENDED) {
                nextSong();
              }
              if (event.data === window.YT.PlayerState.PLAYING) {
                setIsPlaying(true);
              }
              if (event.data === window.YT.PlayerState.PAUSED) {
                setIsPlaying(false);
              }
            },
          },
        });
      };
    } else {
      if (ytPlayer.current && ytPlayer.current.loadVideoById) {
        ytPlayer.current.loadVideoById(videoId);
      } else {
        ytPlayer.current = new window.YT.Player("yt-player", {
          videoId,
          playerVars: {
            autoplay: 1,
            controls: 0,
            disablekb: 1,
            fs: 0,
            modestbranding: 1,
            playsinline: 1,
            rel: 0,
            showinfo: 0
          },
          events: {
            onStateChange: (event) => {
              if (event.data === window.YT.PlayerState.ENDED) {
                setOps("Featured");
                nextSong();
              }
              if (event.data === window.YT.PlayerState.PLAYING) {
                setIsPlaying(true);
              }
              if (event.data === window.YT.PlayerState.PAUSED) {
                setIsPlaying(false);
              }
            },
          },
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
    setLoading(true);
    console.log(input1.current);

    await axios
      .get(
        `https://herethisexpress.yellowrock-ae9aa95a.southindia.azurecontainerapps.io/song/find?q=${input1.current} song`
      )
      .then((res) => {
        setVideoId(res.data.videoId);
        setTitle(res.data.title);
        setOps(res.data.title);
        setFetched(true);
        setIsPlaying(true);
        setLoading(false);
        setShowPlayFea(true);
      });
  }

  function playfeatured() {
    setShowPlayFea(false);
    if (ops != "Featured") {
      axios
        .get(
          `https://herethisexpress.yellowrock-ae9aa95a.southindia.azurecontainerapps.io/song?q=${
            ln.current
          } songs ${now.current} ${cl.current == "Rainy" ? "with rain" : ""}`
        )
        .then((res) => {
          songlist.current = res.data.videoId;
          setVideoId(res.data.videoId[0].videoId);
          setTitle(res.data.videoId[0].title);
          setOps("Featured");
        });
    }
  }

  function customsong() {
    if (
      cusSelected.current !=
        `${selectedLanguage} ${selectedMood} ${selectedTimeline}` &&
      (selectedLanguage != "" || selectedMood != "" || selectedTimeline != "")
    ) {
      setShowCustomGet(false);
      if (selectedMood == "" && selectedTimeline == "") {
        axios
          .get(
            `https://herethisexpress.yellowrock-ae9aa95a.southindia.azurecontainerapps.io/song?q=${selectedLanguage} songs ${
              now.current
            } ${cl.current == "Rainy" ? "with rain" : ""}`
          )
          .then((res) => {
            cusSelected.current = `${selectedLanguage} ${selectedMood} ${selectedTimeline}`;
            songlist.current = res.data.videoId;
            console.log(res.data.videoId);
            setOps(`Customised`);
            setVideoId(res.data.videoId[0].videoId);
            setTitle(res.data.videoId[0].title);
            setIsPlaying(true);
            setFetched(true);
            setShowCustomGet(true);
            setShowPlayFea(true);
          });
      } else {
        axios
          .get(
            `https://herethisexpress.yellowrock-ae9aa95a.southindia.azurecontainerapps.io/song?q=${
              selectedLanguage == "Telugu"
                ? "Telugu language"
                : selectedLanguage
            } ${
              selectedMood == "Party" ? "boys party vibe" : selectedMood
            } ${selectedTimeline} songs`
          )
          .then((res) => {
            cusSelected = `${selectedLanguage} ${selectedMood} ${selectedTimeline}`;
            songlist.current = res.data.videoId;
            console.log(res.data.videoId);
            setOps(`Customised`);
            setVideoId(res.data.videoId[0].videoId);
            setTitle(res.data.videoId[0].title);
            setIsPlaying(true);
            setFetched(true);
            setShowCustomGet(true);
            setShowPlayFea(true);
          });
      }
    }
  }

  return (
    <>
      <header>
        <div className="h1">
          <img
            className="hicon"
            src="https://deepaknetwork.github.io/herethis/icon.png"
            alt="HereThis Logo"
          />
          <span className="htext">HereThis</span>
        </div>
        <div className="slogan">
          <span className="slogantext">
            Bringing Music, Language, and Time Together
          </span>
        </div>
      </header>

      <div className="row app">
        {(videoId || error !== "") && (
          <div className="col-xl-6 col-lg-6 col-md-12 col-sm-12 sec1">
            <div className="featured-section">
              <div className="featured-header">
                <span className="featured-title">Featured</span>
                {showPlayFea && location && (
                  <button className="play-button" onClick={playfeatured}>
                    play
                  </button>
                )}
              </div>
              {error !== "" ? (
                <span>{error}</span>
              ) : (
                <div className="featured-details">
                  <div className="featured-info">
                    <span>Language </span>
                    <span className="featured-info-txt">{ln.current}</span>
                  </div>
                  <div className="featured-info">
                    <span>Climate </span>
                    <span className="featured-info-txt">{cl.current}</span>
                  </div>
                  <div className="featured-info">
                    <span>Day Time </span>
                    <span className="featured-info-txt">{now.current}</span>
                  </div>
                </div>
              )}
            </div>

            <div className="find-song-section">
              <div className="find-song-header">
                <span className="find-song-title">Find the song</span>
              </div>
              <div className="find-song-input">
                <input
                  className="song-search-input"
                  placeholder="Enter the name of the song"
                  onChange={(x) => {
                    input1.current = x.target.value;
                  }}
                />
                {!loading && (
                  <svg
                    onClick={findSong}
                    className="search-icon"
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="11" cy="11" r="8" />
                    <line x1="21" y1="21" x2="16.65" y2="16.65" />
                  </svg>
                )}
              </div>
            </div>

            <div className="customize-section">
              <div className="customize-header">
                <span className="customize-title">Customize</span>
              </div>

              <div className="option-group">
                <div className="option-title">Languages</div>
                <div className="option-list">
                  {[
                    "Tamil",
                    "Telugu",
                    "English",
                    "Hindi",
                    "Bengali",
                    "Marathi",
                    "Gujarati",
                    "Kannada",
                    "Malayalam",
                    "Punjabi",
                  ].map((lang) => (
                    <button
                      key={lang}
                      className={`option-button ${
                        selectedLanguage === lang ? "active" : ""
                      }`}
                      onClick={() => toggleLanguage(lang)}
                    >
                      {lang}
                    </button>
                  ))}
                </div>
              </div>

              <div className="option-group">
                <div className="option-title">Mood</div>
                <div className="option-list">
                  {["Love", "Breakup", "Happy", "Sad", "Party"].map((mood) => (
                    <button
                      key={mood}
                      className={`option-button ${
                        selectedMood === mood ? "active" : ""
                      }`}
                      onClick={() => toggleMood(mood)}
                    >
                      {mood}
                    </button>
                  ))}
                </div>
              </div>

              <div className="option-group">
                <div className="option-title">Timeline</div>
                <div className="option-list">
                  {["2K", "90s", "80s", "70s", "Top", "New"].map((time) => (
                    <button
                      key={time}
                      className={`option-button ${
                        selectedTimeline === time ? "active" : ""
                      }`}
                      onClick={() => toggleTimeline(time)}
                    >
                      {time}
                    </button>
                  ))}
                </div>
              </div>

              <div className="get-button-container">
                {showCustomGet && (
                  <button onClick={customsong} className="get-button">
                    Get
                  </button>
                )}
              </div>
            </div>
          </div>
        )}

        <div className="col-xl-6 col-sm-12 sec2">
          {videoId ? (
            <div className="sec2div">
              <div className="s2d0">
                <span className="s2d0t">{title || ops.split("|")[0]}</span>
              </div>
              <div className="s2d1">
                <div id="yt-player" style={{ display: 'none' }}></div>
                <button
                  className={`playbtn ${isPlaying ? "playing-effect" : ""}`}
                  onClick={togglePlayback}
                >
                  {isPlaying ? (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="playicon"
                    >
                      <path fill="currentColor" d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
                    </svg>
                  ) : (
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      viewBox="0 0 24 24"
                      className="playicon"
                    >
                      <path fill="currentColor" d="M8 5v14l11-7z"/>
                    </svg>
                  )}
                </button>
              </div>
              <div className="s2d2">
                <button onClick={back5} className="s2d2btn">
                  <svg viewBox="0 0 24 24" width="24" height="24">
                    <path fill="currentColor" d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
                  </svg>
                </button>
                <button onClick={back1} className="s2d2btn">
                  <svg viewBox="0 0 24 24" width="24" height="24">
                    <path fill="currentColor" d="M6 6h2v12H6zm3.5 6l8.5 6V6z"/>
                  </svg>
                </button>
                <button onClick={skip1} className="s2d2btn">
                  <svg viewBox="0 0 24 24" width="24" height="24">
                    <path fill="currentColor" d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                  </svg>
                </button>
                <button onClick={skip5} className="s2d2btn">
                  <svg viewBox="0 0 24 24" width="24" height="24">
                    <path fill="currentColor" d="M12 5V1L7 6l5 5V7c3.31 0 6 2.69 6 6s-2.69 6-6 6-6-2.69-6-6H4c0 4.42 3.58 8 8 8s8-3.58 8-8-3.58-8-8-8z"/>
                  </svg>
                </button>
                <button onClick={nextSong} className="s2d2btn">
                  <svg viewBox="0 0 24 24" width="24" height="24">
                    <path fill="currentColor" d="M6 18l8.5-6L6 6v12zM16 6v12h2V6h-2z"/>
                  </svg>
                </button>
              </div>
            </div>
          ) : location === true || error === "" ? (
            <div className="sec2divnot">
              <span>Song loading...</span>
            </div>
          ) : (
            <div className="sec2divnot">
              <span>
                {error} Hear songs with Find the Song or Customised options
              </span>
            </div>
          )}
        </div>
      </div>

      <div className="footer">
        <span>
          A product by <a href="https://mrdeepak.tech/">Deepak</a>
        </span>
      </div>
    </>
  );
}

export default App;
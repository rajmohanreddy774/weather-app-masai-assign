import { useEffect, useState } from "react";
import { Skeleton, Stack } from "@mui/material";
import axios from "axios";
import "../styles/weather.css";
import Chart1 from "./chart";

const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const getPlaces = (inputVal, key) =>
  axios.get(
    `https://api.geoapify.com/v1/geocode/autocomplete?text=${inputVal}&apiKey=${key}`
  );

const getWeather = (latitude, longitude, key) =>
  axios.get(
    `https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&exclude=hourly&appid=${key}`
  );

const Icons = {
  sun: "https://img.freepik.com/premium-vector/sun-icon-bright-yellow-sol-symbol-with-rays-childish-simple-style_53562-14613.jpg?w=2000",
  snow: "https://www.nicepng.com/png/detail/127-1278067_weather-snow-icon.png",
  rain: "https://t4.ftcdn.net/jpg/03/38/74/43/360_F_338744374_c8v4RyKnToRWqPA4SalFf8ktaMQA48QW.jpg",
  clouds:
    "https://www.citypng.com/public/uploads/preview/hd-blue-storage-host-clouds-icon-png-31631696247hkxadwakoh.png",
  search:
    "https://cdn2.iconfinder.com/data/icons/ios-7-icons/50/search-512.png",
  loc: "https://cdn-icons-png.flaticon.com/512/17/17736.png",
};
var id;
function useWindowDimensions() {
  const [windowDimensions, setWindowDimensions] = useState(
    getWindowDimensions()
  );

  useEffect(() => {
    function handleResize() {
      setWindowDimensions(getWindowDimensions());
    }

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return windowDimensions;
}

function getWindowDimensions() {
  const { innerWidth: width, innerHeight: height } = window;
  return {
    width,
    height,
  };
}

export function getHoursAndMinutes(data) {
  let time = new Date(data);
  let hours = time.getHours();
  let minutes = time.getMinutes();
  return {
    hours,
    minutes,
  };
}
function Weather() {
  const [input, setInput] = useState("");
  const [data, setData] = useState([""]);
  const [flexbox, setFlexbox] = useState([]);
  const [flexChange, setFlexChange] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);
  const [dayNum, setDayNum] = useState(new Date());
  const [sunset, setSunset] = useState("");
  const [sunrise, setSunrise] = useState("");

  let div1 = document.getElementById("div1");
  const handleFocus = () => {
    div1.style.border = "2px solid rgb(91,179,231)";
    div1.style.padding = "7px 9px";
  };

  const handleBlur = () => {
    div1.style.border = "1px solid rgb(231,231,232)";
    div1.style.padding = "8px 10px";
  };

  const handleBorder = (i, el) => {
    let border = document.querySelectorAll(".div2-subject");
    border.forEach((el) => {
      el.style.border = "1px solid rgb(242, 242, 243)";
      el.style.padding = "5px 10px";
    });

    let borderDiv = document.getElementById(i);
    borderDiv.style.border = "2px solid rgb(91,179,231)";
    borderDiv.style.padding = "4px 9px";

    setFlexChange([el]);

    let sunset = getHoursAndMinutes(el.sunset);
    setSunset(`${sunset.hours}:${sunset.minutes}pm`);

    let sunrise = getHoursAndMinutes(el.sunrise);
    setSunrise(`${sunrise.hours}:${sunrise.minutes}am`);
  };

  const handleInput = (e) => {
    let change = document.getElementById("chan");
    let changing = document.getElementById("changing");
    changing.style.display = "none";
    change.style.display = "block";
    setInput(e.target.value);
  };

  function showPosition(position) {
    handleInpData("", "", position.coords.latitude, position.coords.longitude);
  }

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(showPosition);
    } else {
      return alert("Geolocation not supported on this browser");
    }
  }, []);

  useEffect(() => {
    let dropDown = document.getElementById("drop-down");
    if (input.length < 2) {
      dropDown.style.display = "none";
      return;
    }
    dropDown.style.display = "block";
    if (id) {
      return;
    }
    id = setTimeout(() => {
      place();
      id = undefined;
    }, 500);
  }, [input]);

  function place() {
    let change = document.getElementById("chan");
    let changing = document.getElementById("changing");
    let inputVal = document.getElementById("input-box").value;

    getPlaces(inputVal)
      .then((res) => {
        setData(res.data.features);
        change.style.display = "none";
        changing.style.display = "block";
      })
      .catch((err) => {
        console.log(err);
      });
  }

  const handleInpData = (city, state, lat, lon) => {
    setLoading(true);
    let input_box = document.getElementById("input-box");
    let changing = document.getElementById("changing");

    changing.style.display = "none";
    input_box.value = city ? (state ? `${city} , ${state}` : `${city}`) : "";

    getWeather(lat, lon, process.env.REACT_APP_SECOND_KEY)
      .then((res) => {
        setLoading(false);

        setFlexbox(res.data.daily);
        setFlexChange([res.data.daily[0]]);

        let sunset = getHoursAndMinutes(res.data.daily[0].sunset);
        setSunset(`${sunset.hours}:${sunset.minutes}pm`);

        let sunrise = getHoursAndMinutes(res.data.daily[0].sunrise);
        setSunrise(`${sunrise.hours}:${sunrise.minutes}am`);
      })
      .catch((err) => {
        setLoading(false);
        setError(true);
        console.log(err);
      });
  };

  const { width, height } = useWindowDimensions();

  return (
    <div className="box">
      <div id="div1">
        <img className="img1" src={Icons.loc} alt="locImg" />
        <input
          autoComplete="off"
          id="input-box"
          onChange={handleInput}
          onBlur={handleBlur}
          onFocus={handleFocus}
          placeholder="Enter Location"
        />
        <img style={{ cursor: "pointer" }} src={Icons.search} alt="searchImg" />
      </div>
      <div id="drop-down">
        <div id="changing">
          {data[0] ? (
            data.map((el, i) => {
              if (!el.properties.name) {
                return;
              }
              return (
                <div
                  onClick={() =>
                    handleInpData(
                      el.properties.name,
                      el.properties.state,
                      el.properties.lat,
                      el.properties.lon
                    )
                  }
                  key={i}
                  className="drop all"
                >
                  <span style={{ fontWeight: "700" }}>
                    {el.properties.name}
                  </span>
                  {el.properties.state ? ` , ${el.properties.state}` : ""}
                </div>
              );
            })
          ) : (
            <div id="change" className="drop">
              Not Found
            </div>
          )}
        </div>
        <div id="chan" className="drop">
          ...Loading
        </div>
      </div>
      {loading ? (
        <Stack spacing={1}>
          <Skeleton variant="text" />
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="rectangular" width={210} height={118} />
        </Stack>
      ) : error ? (
        "...error"
      ) : (
        <div>
          <div className="div2">
            {flexbox.map((el, i) => {
              if (i >= 7) {
                return;
              }
              return (
                <div
                  style={
                    i === 0
                      ? {
                          fontWeight: "700",
                          border: "2px solid rgb(91,179,231)",
                          padding: "4px 9px",
                        }
                      : {}
                  }
                  key={i}
                  id={i}
                  onClick={() => handleBorder(i, el)}
                  className="div2-subject"
                >
                  <span>{days[(Number(dayNum.getDay()) + i) % 7]}</span>
                  <br />
                  <span>
                    {(el.temp.day - 273.15).toFixed(2).split(".")[0]}°
                  </span>
                  <span
                    style={{ color: "rgb(150,150,151)", marginLeft: "5px" }}
                  >
                    {(el.temp.day - 273.15).toFixed(2).split(".")[1]}°
                  </span>
                  <br />
                  <img
                    src={
                      el.weather[0].main === "Clouds"
                        ? Icons.clouds
                        : el.weather[0].main === "Rain"
                        ? Icons.rain
                        : el.weather[0].main === "Snow"
                        ? Icons.snow
                        : Icons.sun
                    }
                    alt="weatherIcon"
                  />
                  <br />
                  <span className="font1" style={{ color: "rgb(150,150,151)" }}>
                    {el.weather[0].main}
                  </span>
                </div>
              );
            })}
          </div>
          {flexChange[0] ? (
            <div className="div3">
              <div style={{ display: "flex" }}>
                <span id="div3-degree">
                  {(flexChange[0].temp.day - 273.15).toFixed(2).split(".")[0]}°
                  C
                </span>
                <img
                  src={
                    flexChange[0].weather[0].main === "Clouds"
                      ? Icons.clouds
                      : flexChange[0].weather[0].main === "Rain"
                      ? Icons.rain
                      : flexChange[0].weather[0].main === "Snow"
                      ? Icons.snow
                      : Icons.sun
                  }
                  alt="weatherIcon"
                />
              </div>
              <div id="chart">
                <Chart1 dim={[width, height]} vall={[flexChange[0].temp]} />
              </div>
              <div className="div3-sub">
                <div className="cat1">
                  <span style={{ fontWeight: "700", color: "black" }}>
                    Pressure
                  </span>
                  <br />
                  {flexChange[0].pressure} hpa
                </div>
                <div className="cat1">
                  <span style={{ fontWeight: "700", color: "black" }}>
                    Humidity
                  </span>
                  <br />
                  {flexChange[0].humidity} %
                </div>
              </div>

              <div>
                <div className="container">
                  <div className="div-above">
                    <div style={{ width: "10%" }} className="cat1 cat3">
                      <span style={{ fontWeight: "700", color: "black" }}>
                        Sunrise
                      </span>
                      <br />
                      {sunrise}
                    </div>
                    <div style={{ width: "10%" }} className="cat1 cat2">
                      <span style={{ fontWeight: "700", color: "black" }}>
                        Sunset
                      </span>
                      <br />
                      {sunset}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          ) : (
            ""
          )}
        </div>
      )}
    </div>
  );
}

export { Weather };

import React, { useState, useEffect } from "react";
import moment from "moment";
import { getLocation } from "../utils/Location";
import { fetchPrayerTimes } from "../utils/Api";
import { getCityName } from "../utils/reverseGeocoding"; // Importer getCityName
import "./PrayerApp.css";
import crescentMoonIcon from "../assets/crescent-moon.png";
import sunsetIcon from "../assets/le-coucher-du-soleil.png";
import fajrIcon from "../assets/fajr.png";
import MaghribIcon from "../assets/sunset.png";
import sun from "../assets/sun.png";
import asr from "../assets/Asr.png";
const PrayerApp = () => {
  const [location, setLocation] = useState(null);
  const [city, setCity] = useState(""); // État pour stocker le nom de la ville
  const [prayerTimes, setPrayerTimes] = useState([]);
  const [nextPrayer, setNextPrayer] = useState(null);
  const [countdown, setCountdown] = useState(null);
  const [selectedDate, setSelectedDate] = useState(moment());

  useEffect(() => {
    async function fetchLocationAndTimes() {
      try {
        const { latitude, longitude } = await getLocation();
        setLocation({ lat: latitude, long: longitude });

        // Récupérer le nom de la ville en fonction des coordonnées
        const cityName = await getCityName(latitude, longitude);
        setCity(cityName); // Mettre à jour le nom de la ville

        const month = selectedDate.month() + 1;
        const year = selectedDate.year();
        const data = await fetchPrayerTimes(latitude, longitude, month, year);

        const todayPrayerTimes = data.data[selectedDate.date() - 1].timings;

        const mainPrayers = [
          "Fajr",
          "Sunrise",
          "Dhuhr",
          "Asr",
          "Maghrib",
          "Isha",
        ];
        const filteredPrayerTimes = Object.entries(todayPrayerTimes)
          .filter(([name]) => mainPrayers.includes(name))
          .map(([name, time]) => ({ name, time: moment(time, "HH:mm") }));

        setPrayerTimes(filteredPrayerTimes);

        const nextPrayerData = getNextPrayer(filteredPrayerTimes);
        setNextPrayer(nextPrayerData);
      } catch (error) {
        console.error("Erreur lors de la récupération des données :", error);
      }
    }

    fetchLocationAndTimes();

    const intervalId = setInterval(() => {
      if (nextPrayer) {
        const countdownValue = moment
          .utc(nextPrayer.time.diff(moment()))
          .format("HH:mm:ss");
        setCountdown(countdownValue);
      }
    }, 1000);

    return () => clearInterval(intervalId);
  }, [selectedDate, nextPrayer]);

  const getNextPrayer = (filteredPrayerTimes) => {
    const now = moment();
    let nextPrayerData = null;

    for (let i = 0; i < filteredPrayerTimes.length; i++) {
      const prayer = filteredPrayerTimes[i];
      if (prayer.time.isAfter(now)) {
        nextPrayerData = prayer;
        break;
      }
    }

    if (!nextPrayerData) {
      nextPrayerData = filteredPrayerTimes[0];
    }

    return nextPrayerData;
  };

  const changeDate = (direction) => {
    const newDate = selectedDate.clone().add(direction, "days");
    setSelectedDate(newDate);
  };

  const isToday = moment().isSame(selectedDate, "day");

  return (
    <div className="app">
      <h1>
        Heure de prière <span>{city}</span> {/* Afficher la ville dynamique */}
      </h1>

      <div className="date-navigation">
        <button onClick={() => changeDate(-1)}>&lt; Jour précédent</button>
        <p>{selectedDate.format("LL")}</p>
        <button onClick={() => changeDate(1)}>Jour suivant &gt;</button>
      </div>

      {isToday && nextPrayer && (
        <div className="next-prayer">
          <h2>
            Il reste pour adhan : <span>{nextPrayer.name}</span>
          </h2>
          <p>{moment.utc(nextPrayer.time.diff(moment())).format("HH:mm:ss")}</p>
        </div>
      )}

      <div className="prayer-times">
        {prayerTimes.map(({ name, time }) => (
          <div key={name} className="prayer-time">
            <p>
              {name}
              {name === "Isha" && (
                <img src={crescentMoonIcon} alt="Isha Icon" className="icon" />
              )}
              {name === "Sunrise" && (
                <img src={sunsetIcon} alt="Sunrise Icon" className="icon" />
              )}
              {name === "Dhuhr" && (
                <img src={sun} alt="Dhuhr icon" className="icon" />
              )}
              {name === "Fajr" && (
                <img src={fajrIcon} alt="Fajr Icon" className="icon" />
              )}
              {name === "Asr" && (
                <img src={asr} alt="Asr Icon" className="icon" />
              )}
              {name === "Maghrib" && (
                <img src={MaghribIcon} alt="Maghrib icon" className="icon" />
              )}
            </p>
            <p>{time.format("HH:mm")}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default PrayerApp;

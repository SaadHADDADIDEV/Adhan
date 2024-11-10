// src/utils/api.js
import axios from "axios";

export async function fetchPrayerTimes(lat, long, month, year) {
  const url = `http://api.aladhan.com/v1/calendar?latitude=${lat}&longitude=${long}&method=21&month=${month}&year=${year}`;
  const response = await axios.get(url);
  return response.data;
}

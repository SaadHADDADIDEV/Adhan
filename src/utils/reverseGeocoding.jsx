import axios from "axios";

export const getCityName = async (latitude, longitude) => {
  try {
    const response = await axios.get(
      `https://nominatim.openstreetmap.org/reverse`,
      {
        params: {
          lat: latitude,
          lon: longitude,
          format: "json",
        },
      }
    );

    if (response.data && response.data.address) {
      const { city, town, village } = response.data.address;
      return city || town || village || "Unknown location"; // Choose city, town, or village
    } else {
      throw new Error("No location data available");
    }
  } catch (error) {
    console.error("Error fetching city name:", error);
    return "Location error";
  }
};

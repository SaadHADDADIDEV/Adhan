// src/utils/location.js
export function getLocation() {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => resolve(position.coords),
        (error) => reject(error)
      );
    } else {
      reject(
        new Error("La géolocalisation n'est pas supportée par ce navigateur.")
      );
    }
  });
}

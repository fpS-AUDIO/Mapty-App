'use strict';

// prettier-ignore
const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

const form = document.querySelector('.form');
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

const successGetCallback = function (position) {
  // get the current latitude and longitude
  const latitude = position.coords.latitude;
  const longitude = position.coords.longitude;

  // create the actual map 
  
};

const failGetCallback = function () {
  alert(`To use application please allow the access to your position 📌`);
};

// if browser supports `navigator.geolocation`
if (navigator.geolocation) {
  navigator.geolocation.getCurrentPosition(successGetCallback, failGetCallback);
}

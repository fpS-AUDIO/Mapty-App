'use strict';

//////////////////////
// Global Variables //
//////////////////////

const form = document.querySelector('.form');
const workouts = document.querySelector(`.workouts`);
const containerWorkouts = document.querySelector('.workouts');
const inputType = document.querySelector('.form__input--type');
const inputDistance = document.querySelector('.form__input--distance');
const inputDuration = document.querySelector('.form__input--duration');
const inputCadence = document.querySelector('.form__input--cadence');
const inputElevation = document.querySelector('.form__input--elevation');

/////////////
// Classes //
/////////////

// ---| start architecture |-------------------------------------------------------

class App {
  // set privat properties
  #map;
  #mapEvent;
  #workouts = [];

  // indeed constructor is called immediately when an instance is created
  constructor() {
    this.#getPosition();
    // event listener when change the type of workout <select>, use bind() otherwise `this` points to html element in event listeners
    inputType.addEventListener(`change`, this.#toggleElevationField.bind(this));

    // event listener when submitting the form, use bind() otherwise `this` points to html element in event listeners
    form.addEventListener(`submit`, this.#newWorkout.bind(this));
  }

  #getPosition() {
    // if browser supports `navigator.geolocation`
    if (navigator.geolocation) {
      // always use bind() in callback to set this to the current instance object
      navigator.geolocation.getCurrentPosition(
        this.#loadMap.bind(this),
        function () {
          alert(
            `To use application please allow the access to your position 📌`
          );
        }
      );
    }
  }

  #loadMap(position) {
    // get the current latitude and longitude
    const latitude = position.coords.latitude;
    const longitude = position.coords.longitude;

    // create the actual map and store it in #map privat variable
    this.#map = L.map(`map`).setView([latitude, longitude], 13);

    // generate layer and add it to the map
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution:
        '&copy; <a href="https://www.openstreetmap.fr/hot/copyright">OpenStreetMap</a> contributors',
    }).addTo(this.#map);

    // add custom leaflet event listener to map objectuse
    // use bind() otherwise `this`, in event listeners, points to this.#map and not to actual instance
    this.#map.on(`click`, this.#showForm.bind(this));
  }

  #showForm(mapE) {
    this.#mapEvent = mapE; // assign given map event to privat property
    form.classList.remove(`hidden`); // show form when click on map
    inputDistance.focus(); // and instantly focus on the input field for a better user exprience
  }

  #hideForm() {
    form.style.display = `none`; // first to eliminate animation
    form.classList.add(`hidden`); // then add class `hidden`
    setTimeout(() => (form.style.display = `grid`), 1000); // so after 1second set display grid as before
  }

  #toggleElevationField() {
    // basically toggle hidden class for both containers (`.form__row`) of input
    inputCadence.closest(`.form__row`).classList.toggle(`form__row--hidden`);
    inputElevation.closest(`.form__row`).classList.toggle(`form__row--hidden`);
  }

  #newWorkout(e) {
    e.preventDefault(); // preventing default behavior of the form when submitted

    // some variables
    const { lat, lng } = this.#mapEvent.latlng; // get the coords of the click (use destructuring) from this.#mapEvent
    const type = inputType.value;
    const distance = +inputDistance.value;
    const duration = +inputDuration.value;
    const cadence = +inputCadence.value;
    const elevation = +inputElevation.value;
    let workout;

    // validater function to check the input data
    const isFiniteNumber = function (...givenValue) {
      return givenValue.every(val => Number.isFinite(val));
    };

    // validater function to check the input data
    const isPositiveNumber = function (...givenValue) {
      return givenValue.every(val => val > 0);
    };

    // validate running
    if (type === `running`) {
      if (
        !isFiniteNumber(duration, distance, cadence) ||
        !isPositiveNumber(distance, duration, cadence)
      ) {
        return alert(`Please enter a positive number...`);
      }
      // create new instance of Running class
      workout = new Running({
        coords: [lat, lng],
        cadence: cadence,
        duration: duration,
        distance: distance,
      });
    }

    // validate cycling
    if (type === `cycling`) {
      if (
        !isFiniteNumber(duration, distance, elevation) ||
        !isPositiveNumber(distance, duration)
      ) {
        return alert(`Please enter a positive number...`);
      }
      // create new instance of Running class
      workout = new Cycling({
        coords: [lat, lng],
        elevationGain: elevation,
        duration: duration,
        distance: distance,
      });
    }

    // add the create workout instance object to the array of #workouts
    this.#workouts.push(workout);

    // then clean all the fields of the form
    inputDistance.value =
      inputDuration.value =
      inputCadence.value =
      inputElevation.value =
        ``;

    this.#createMarker(workout);
    this.#showWorkout(workout);
  }

  #createMarker(workout) {
    const { lat, lng } = this.#mapEvent.latlng; // get the coords of the click (use destructuring) from this.#mapEvent
    // create optional options object for the new popup returned from L.popup({options: here})
    const popUpOptions = {
      maxWidth: 300,
      minWidth: 50,
      autoClose: false,
      closeOnClick: false,
      className: `${workout.type}-popup`, // for custom css styling
    };

    // L.marker() create marker on the given coords
    // .addTo(map) add marker to map object
    // .bindPopup()  bind and create popup
    // .openPopup() open binded popup
    // L.popup(popUpOptions) create new popuop which accepts options
    // .setPopupContent(`Hello World!`) add some content
    L.marker([lat, lng])
      .addTo(this.#map)
      .bindPopup(L.popup(popUpOptions))
      .setPopupContent(
        `${workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'}${workout.description}`
      )
      .openPopup();
  }

  #showWorkout(workout) {
    let htmlTempl = `
      <li class="workout workout--${workout.type}" data-id="${workout.getId}">
        <h2 class="workout__title">${workout.description}</h2>
        <div class="workout__details">
          <span class="workout__icon">${
            workout.type === 'running' ? '🏃‍♂️' : '🚴‍♀️'
          }</span>
          <span class="workout__value">${workout.distance}</span>
          <span class="workout__unit">km</span>
        </div>
        <div class="workout__details">
          <span class="workout__icon">⏱</span>
          <span class="workout__value">${workout.duration}</span>
          <span class="workout__unit">min</span>
        </div>
    `;

    if (workout.type === `running`) {
      htmlTempl += `
      <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${workout.pace}</span>
        <span class="workout__unit">min/km</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">🦶🏼</span>
        <span class="workout__value">${workout.cadence}</span>
        <span class="workout__unit">spm</span>
      </div>
    </li>
      `;
    }
    if (workout.type === `cycling`) {
      htmlTempl += `
      <div class="workout__details">
        <span class="workout__icon">⚡️</span>
        <span class="workout__value">${workout.speed}</span>
        <span class="workout__unit">km/h</span>
      </div>
      <div class="workout__details">
        <span class="workout__icon">⛰</span>
        <span class="workout__value">${workout.elevationGain}</span>
        <span class="workout__unit">m</span>
      </div>
    </li>
      `;
    }

    // insert generate html as last child of workouts container element
    workouts.insertAdjacentHTML(`beforeend`, htmlTempl);

    this.#hideForm();
  }
}
// ---| end architecture |-------------------------------------------------------

class Workout {
  #id = `${Date.now()}`.slice(-10);
  date = new Date();

  constructor(parameters) {
    this.distance = parameters.distance; // in km
    this.duration = parameters.duration; // in min
    this.coords = parameters.coords; // [latitude, longitude]
  }

  _generateDescription() {
    // prettier-ignore
    const months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

    this.description = `${this.type[0].toUpperCase()}${this.type.slice(1)} on ${
      months[this.date.getMonth()]
    } ${this.date.getDate()}`;
  }

  get getId() {
    return this.#id;
  }
}

class Running extends Workout {
  type = `running`;
  constructor(parameters) {
    super(parameters);
    this.cadence = parameters.cadence;
    this.#calcPace();
    this._generateDescription();
  }
  #calcPace() {
    // creating new property `pace` in min/km
    this.pace = this.duration / this.distance;
    return this.pace;
  }
}

class Cycling extends Workout {
  type = `cycling`;
  constructor(parameters) {
    super(parameters);
    this.elevationGain = parameters.elevationGain;
    this.#calcSpeed();
    this._generateDescription();
  }
  #calcSpeed() {
    // creating new property `speed` in km/h
    this.speed = this.distance / (this.duration / 60);
    return this.speed;
  }
}

///////////////
// Instances //
///////////////

const mainApp = new App();

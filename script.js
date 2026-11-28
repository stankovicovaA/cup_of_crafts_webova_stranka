const menuToggle = document.querySelector(".menu-toggle");
const mainNav = document.querySelector(".main-nav");
const searchForm = document.querySelector(".site-search");
const searchInput = document.querySelector("#site-search-input");
const searchStatus = document.querySelector("#search-status");

if (menuToggle && mainNav) {
  menuToggle.addEventListener("click", () => {
    const isOpen = menuToggle.getAttribute("aria-expanded") === "true";
    menuToggle.setAttribute("aria-expanded", String(!isOpen));
    menuToggle.setAttribute("aria-label", isOpen ? "Otvoriť navigáciu" : "Zatvoriť navigáciu");
    mainNav.classList.toggle("is-open", !isOpen);
  });

  mainNav.addEventListener("click", (event) => {
    if (event.target.closest("a")) {
      menuToggle.setAttribute("aria-expanded", "false");
      menuToggle.setAttribute("aria-label", "Otvoriť navigáciu");
      mainNav.classList.remove("is-open");
    }
  });
}

if (searchForm && searchInput && searchStatus) {
  searchForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const query = searchInput.value.trim().toLocaleLowerCase("sk");
    const sections = [...document.querySelectorAll(".searchable")];

    sections.forEach((section) => section.removeAttribute("data-search-match"));

    if (!query) {
      searchStatus.textContent = "Zadaj výraz, ktorý chceš na stránke nájsť.";
      searchInput.focus();
      return;
    }

    const match = sections.find((section) =>
      section.textContent.toLocaleLowerCase("sk").includes(query)
    );

    if (!match) {
      searchStatus.textContent = `Výraz „${searchInput.value.trim()}“ sa na stránke nenašiel.`;
      return;
    }

    match.setAttribute("data-search-match", "true");
    match.scrollIntoView({ behavior: "smooth", block: "center" });
    searchStatus.textContent = `Nájdené: ${match.querySelector("h1, h2")?.textContent ?? "sekcia stránky"}.`;
  });

  searchInput.addEventListener("input", () => {
    document.querySelectorAll("[data-search-match]").forEach((section) =>
      section.removeAttribute("data-search-match")
    );
    searchStatus.textContent = "";
  });
}

const reservationType = document.querySelector("#reservation-type");
const reservationForm = document.querySelector(".reservation-form");
const reservationGuests = document.querySelector("#reservation-guests");
const reservationWorkshop = document.querySelector("#reservation-workshop");
const reservationDate = document.querySelector("#reservation-date");
const reservationTime = document.querySelector("#reservation-time");
const workshopAttendees = document.querySelector("#workshop-attendees");
const workshopAttendeeList = document.querySelector("#workshop-attendee-list");
const addWorkshopAttendeeButton = document.querySelector("#workshop-attendee-add");

if (
  reservationType &&
  reservationForm &&
  reservationGuests &&
  reservationWorkshop &&
  reservationDate &&
  reservationTime &&
  workshopAttendees &&
  workshopAttendeeList &&
  addWorkshopAttendeeButton
) {
  const workshopField = reservationWorkshop.closest(".reservation-field");
  const timeNote = reservationTime.parentElement.querySelector(".reservation-time-note");
  const guestPlaceholder = reservationGuests.options[0].cloneNode(true);
  const personNamePattern = /^[\p{L}\p{M}]+(?:[ .'-][\p{L}\p{M}]+)*$/u;

  reservationForm.noValidate = true;

  const validateControl = (control) => {
    const value = control.value.trim();
    let customError = "";

    if (control.required && !value && control.dataset.validation === "person-name") {
      customError = "Zadajte meno a priezvisko.";
    } else if (control.required && !value && control.dataset.validation === "phone") {
      customError = "Zadajte telefónne číslo.";
    } else if (
      control.dataset.validation === "person-name" &&
      value &&
      !personNamePattern.test(value.replace(/\s+/g, " "))
    ) {
      customError = "Zadajte meno a priezvisko použitím písmen.";
    }

    if (control.dataset.validation === "phone" && value) {
      const digits = value.replace(/\D/g, "");
      if (!/^\+?[\d\s().-]+$/.test(value) || digits.length < 9 || digits.length > 15) {
        customError = "Zadajte telefónne číslo s 9 až 15 číslicami.";
      }
    }

    control.setCustomValidity(customError);
    const isValid = control.validity.valid;
    const error = control.getAttribute("aria-describedby");
    const errorMessage = error && document.getElementById(error);

    if (errorMessage) {
      errorMessage.textContent = isValid ? "" : control.validationMessage;
    }
    control.setAttribute("aria-invalid", String(!isValid));
    return isValid;
  };

  const attachValidation = (control) => {
    ["input", "change", "blur"].forEach((eventName) => {
      control.addEventListener(eventName, () => validateControl(control));
    });
  };

  reservationForm.querySelectorAll("input, select, textarea").forEach(attachValidation);

  const updateGuestOptions = () => {
    const selectedCount = Number(reservationGuests.value);
    const minGuests = reservationType.value === "Skupinové tvorenie" ? 6 : 1;
    const maxGuests = reservationType.value === "Voľné tvorenie" ? 5 : 20;
    reservationGuests.replaceChildren(guestPlaceholder.cloneNode(true));

    for (let count = minGuests; count <= maxGuests; count += 1) {
      reservationGuests.add(new Option(String(count), String(count)));
    }

    if (selectedCount >= minGuests && selectedCount <= maxGuests) {
      reservationGuests.value = String(selectedCount);
    }
  };

  const updateOpeningHours = () => {
    let openingTime = "09:00";
    let closingTime = "20:00";

    if (reservationDate.value) {
      const [year, month, day] = reservationDate.value.split("-").map(Number);
      const weekday = new Date(year, month - 1, day).getDay();
      const isWeekend = weekday === 0 || weekday === 6;
      openingTime = isWeekend ? "10:00" : "09:00";
      closingTime = isWeekend ? "20:00" : "19:00";
    }

    reservationTime.min = openingTime;
    reservationTime.max = closingTime;

    if (reservationTime.value && (reservationTime.value < openingTime || reservationTime.value > closingTime)) {
      reservationTime.value = "";
      validateControl(reservationTime);
    }
  };

  const createAttendeeField = (number) => {
    const row = document.createElement("div");
    row.className = "workshop-attendee-row";

    const label = document.createElement("label");
    label.className = "reservation-field";
    const inputId = `workshop-attendee-${number}`;
    label.htmlFor = inputId;

    const caption = document.createElement("span");
    caption.textContent = `Meno a priezvisko účastníka ${number}`;

    const input = document.createElement("input");
    input.id = inputId;
    input.name = `Meno ďalšieho účastníka ${number}`;
    input.type = "text";
    input.autocomplete = "off";
    input.required = true;
    input.dataset.validation = "person-name";

    const error = document.createElement("span");
    error.className = "reservation-error";
    error.id = `${inputId}-error`;
    error.setAttribute("aria-live", "polite");
    input.setAttribute("aria-describedby", error.id);

    label.append(caption, input, error);
    attachValidation(input);

    const removeButton = document.createElement("button");
    removeButton.className = "button button-secondary workshop-attendee-remove";
    removeButton.type = "button";
    removeButton.textContent = "Odstrániť";
    removeButton.setAttribute("aria-label", `Odstrániť účastníka ${number}`);
    removeButton.addEventListener("click", () => {
      reservationGuests.value = String(Number(reservationGuests.value) - 1);
      syncWorkshopAttendees();
      validateControl(reservationGuests);
    });

    row.append(label, removeButton);
    return row;
  };

  const syncWorkshopAttendees = () => {
    const isWorkshop = reservationType.value === "Workshop s lektorom";
    workshopAttendees.hidden = !isWorkshop;

    if (!isWorkshop) {
      workshopAttendeeList.querySelectorAll("input").forEach((input) => {
        input.disabled = true;
      });
      addWorkshopAttendeeButton.disabled = true;
      return;
    }

    if (!reservationGuests.value) {
      reservationGuests.value = "1";
    }

    const additionalPeople = Number(reservationGuests.value) - 1;
    while (workshopAttendeeList.children.length > additionalPeople) {
      workshopAttendeeList.lastElementChild.remove();
    }
    while (workshopAttendeeList.children.length < additionalPeople) {
      const number = workshopAttendeeList.children.length + 2;
      workshopAttendeeList.append(createAttendeeField(number));
    }

    workshopAttendeeList.querySelectorAll("input").forEach((input) => {
      input.disabled = false;
    });
    addWorkshopAttendeeButton.disabled = Number(reservationGuests.value) >= 20;
  };

  const updateWorkshopFields = () => {
    const isWorkshop = reservationType.value === "Workshop s lektorom";
    workshopField.hidden = !isWorkshop;
    reservationWorkshop.required = isWorkshop;
    reservationWorkshop.disabled = !isWorkshop;
    reservationDate.readOnly = isWorkshop;

    if (isWorkshop) {
      reservationTime.type = "text";
      reservationTime.readOnly = true;
      timeNote.hidden = false;
      const selectedWorkshop = reservationWorkshop.selectedOptions[0];
      if (selectedWorkshop?.dataset.date && selectedWorkshop.dataset.time) {
        reservationDate.value = selectedWorkshop.dataset.date;
        reservationTime.value = selectedWorkshop.dataset.time;
      } else {
        reservationDate.value = "";
        reservationTime.value = "";
      }
      syncWorkshopAttendees();
      return;
    }

    if (reservationTime.type === "text") {
      reservationTime.value = "";
    }
    reservationTime.type = "time";
    reservationTime.readOnly = false;
    timeNote.hidden = true;
    updateOpeningHours();
    syncWorkshopAttendees();
  };

  reservationType.addEventListener("change", () => {
    updateGuestOptions();
    updateWorkshopFields();
  });

  reservationDate.addEventListener("change", updateOpeningHours);
  reservationWorkshop.addEventListener("change", updateWorkshopFields);
  reservationGuests.addEventListener("change", () => {
    if (reservationType.value === "Workshop s lektorom") {
      syncWorkshopAttendees();
    }
  });
  addWorkshopAttendeeButton.addEventListener("click", () => {
    const currentCount = Number(reservationGuests.value || "1");
    if (currentCount < 20) {
      reservationGuests.value = String(currentCount + 1);
      syncWorkshopAttendees();
      validateControl(reservationGuests);
    }
  });

  reservationForm.addEventListener("submit", (event) => {
    const invalidControls = [...reservationForm.querySelectorAll("input, select, textarea")]
      .filter((control) => !control.disabled && control.willValidate)
      .filter((control) => !validateControl(control));

    if (invalidControls.length > 0) {
      event.preventDefault();
      invalidControls[0].focus();
      return;
    }

    event.preventDefault();
    const body = [...new FormData(reservationForm).entries()]
      .map(([name, value]) => `${name}: ${value}`)
      .join("\n");
    const subject = encodeURIComponent("Rezervácia CUP of CRAFTS");
    window.location.href = `mailto:cupofcrafts@gmail.com?subject=${subject}&body=${encodeURIComponent(body)}`;
  });

  updateGuestOptions();
  updateOpeningHours();
  const params = new URLSearchParams(window.location.search);
  if (params.get("typ") === "workshop") {
    reservationType.value = "Workshop s lektorom";
  }
  if (reservationType.value === "Workshop s lektorom") {
    const requestedWorkshop = params.get("workshop");
    const workshopOption = [...reservationWorkshop.options].find(
      (option) => option.dataset.id === requestedWorkshop
    );
    if (workshopOption) {
      reservationWorkshop.value = workshopOption.value;
    }
    updateGuestOptions();
    updateWorkshopFields();
  }
}
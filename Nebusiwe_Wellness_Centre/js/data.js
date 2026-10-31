/* =========================================================
   data.js - clinic details and the services list.
   Edit this file to change prices, hours, branches or services;
   every page that uses them updates automatically.
   PRICES, DURATIONS AND "walk-in / appointment" ARE PLACEHOLDERS:
   please confirm them with the clinic before publishing.
   ========================================================= */
window.NEBUSIWE = {
  "name": "Nebusiwe Wellness Centre",
  "email": "busiwane@gmail.com",
  "phoneDisplay": "011 634 3030",
  "phoneTel": "+27116343030",
  "hours": {
    "weekday": {
      "open": "08:00",
      "close": "17:00"
    },
    "weekend": {
      "open": "09:00",
      "close": "13:00"
    }
  },
  "branches": [
    {
      "id": "springs",
      "name": "Springs (Bakerton) branch",
      "short": "Springs",
      "address": "No. 1 5th Avenue, Bakerton, Springs",
      "lat": -26.223667474989895,
      "lng": 28.46613156776602 
    },
   
  ],
  "services": [
    {
      "id": "consultation",
      "name": "Consultation",
      "category": "Everyday care",
      "description": "See a clinician about a health concern, get advice, or ask for a check-up.",
      "price": 400,
      "minutes": 20,
      "booking": "walk-in"
    },
    {
      "id": "nebulizer",
      "name": "Nebulizer treatment",
      "category": "Everyday care",
      "description": "Breathing treatment for wheezing and asthma-type symptoms, given under supervision.",
      "price": 250,
      "minutes": 20,
      "booking": "walk-in"
    },
    {
      "id": "vitamin-injection",
      "name": "Vitamin injections",
      "category": "Everyday care",
      "description": "Vitamin injections given by a nurse.",
      "price": 100,
      "minutes": 10,
      "booking": "walk-in"
    },
    {
      "id": "wound-care",
      "name": "Wound care",
      "category": "Everyday care",
      "description": "Cleaning, dressing and follow-up care for cuts and other wounds.",
      "price": 150,
      "minutes": 20,
      "booking": "walk-in"
    },
    {
      "id": "baby-wellness",
      "name": "Baby wellness",
      "category": "Mother & child",
      "description": "Routine check-ups to keep your baby healthy and growing well.",
      "price": 150-250,
      "minutes": 30,
      "booking": "walk-in"
    },
    {
      "id": "antenatal-care",
      "name": "Antenatal care",
      "category": "Mother & child",
      "description": "Regular check-ups and support for you and your baby during pregnancy.",
      "price": 720,
      "minutes": 30,
      "booking": "appointment"
    },
    {
      "id": "postnatal-care",
      "name": "Postnatal care",
      "category": "Mother & child",
      "description": "Care and advice for you and your newborn after the birth.",
      "price": 300,
      "minutes": 30,
      "booking": "appointment"
    },
    {
      "id": "family-planning",
      "name": "Family planning",
      "category": "Mother & child",
      "description": "Confidential advice and support to help you choose a family planning method.",
      "price": 150,
      "minutes": 20,
      "booking": "walk-in"
    },
    {
      "id": "hiv-testing",
      "name": "HIV testing and counselling",
      "category": "Screening & tests",
      "description": "Confidential HIV testing with counselling before and after the test.",
      "price": 100,
      "minutes": 30,
      "booking": "walk-in"
    },
    {
      "id": "blood-pressure",
      "name": "Blood pressure test",
      "category": "Screening & tests",
      "description": "A quick check of your blood pressure.",
      "price": 50,
      "minutes": 10,
      "booking": "walk-in"
    },
    {
      "id": "cholesterol",
      "name": "Cholesterol test",
      "category": "Screening & tests",
      "description": "A simple test to check your cholesterol level.",
      "price": 100,
      "minutes": 10,
      "booking": "walk-in"
    },
    {
      "id": "glucose",
      "name": "Glucose test",
      "category": "Screening & tests",
      "description": "A simple test to check your blood sugar level.",
      "price": 50,
      "minutes": 10,
      "booking": "walk-in"
    },
    {
      "id": "pap-smear",
      "name": "Pap smear and lab",
      "category": "Screening & tests",
      "description": "A cervical screening test, with the sample sent to a laboratory.",
      "price": 450,
      "minutes": 30,
      "booking": "appointment"
    },
    {
      "id": "wellness-assessment",
      "name": "Wellness assessment",
      "category": "Screening & tests",
      "description": "A broad health check to see where you stand. Ask us about wellness days for your workplace.",
      "price": 500,
      "minutes": 45,
      "booking": "appointment"
    },
    {
      "id": "circumcision",
      "name": "Adult and child circumcision",
      "category": "Procedures & travel",
      "description": "Circumcision for adults and children, with aftercare advice.",
      "price": 1250,
      "minutes": 60,
      "booking": "appointment"
    },
    
    {
      "id": "pdp-assessment",
      "name": "PDP assessment",
      "category": "Procedures & travel",
      "description": "Medical assessment for a professional driving permit (PDP).",
      "price": 150,
      "minutes": 30,
      "booking": "appointment"
    }
  ]
};

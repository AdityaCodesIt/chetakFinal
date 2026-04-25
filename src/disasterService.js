// =====================================================
// DISASTER DATA SERVICE — GDACS + ReliefWeb
// =====================================================
// GDACS: Global Disaster Alert and Coordination System
// ReliefWeb: UN OCHA Humanitarian Reports
// =====================================================

// Severity mapping: GDACS alert levels → app severity
const GDACS_ALERT_MAP = {
  'Red': 'high',
  'Orange': 'medium',
  'Green': 'low',
};

// Event type labels
const EVENT_TYPE_LABELS = {
  'EQ': 'EARTHQUAKE',
  'TC': 'TROPICAL_CYCLONE',
  'FL': 'FLOOD',
  'VO': 'VOLCANIC_ERUPTION',
  'DR': 'DROUGHT',
  'WF': 'WILDFIRE',
  'TS': 'TSUNAMI',
};

// Event type → Material icon
const EVENT_TYPE_ICONS = {
  'EQ': 'earthquake',
  'TC': 'cyclone',
  'FL': 'flood',
  'VO': 'volcano',
  'DR': 'thermostat',
  'WF': 'local_fire_department',
};

// Keywords associated with each Indian state (for matching)
const STATE_KEYWORDS = {
  'MAHARASHTRA': ['maharashtra', 'mumbai', 'pune', 'nagpur', 'nashik', 'thane', 'aurangabad', 'solapur', 'kolhapur', 'sangli', 'satara', 'ratnagiri', 'sindhudurg', 'konkan'],
  'TAMIL NADU': ['tamil nadu', 'tamilnadu', 'chennai', 'madurai', 'coimbatore', 'trichy', 'salem', 'tirunelveli', 'thanjavur', 'kanchipuram'],
  'KARNATAKA': ['karnataka', 'bangalore', 'bengaluru', 'mysore', 'hubli', 'mangalore', 'belgaum', 'dharwad', 'shimoga'],
  'KERALA': ['kerala', 'kochi', 'thiruvananthapuram', 'trivandrum', 'kozhikode', 'calicut', 'thrissur', 'wayanad', 'idukki', 'alappuzha'],
  'ANDHRA PRADESH': ['andhra pradesh', 'hyderabad', 'visakhapatnam', 'vijayawada', 'tirupati', 'guntur', 'nellore', 'kurnool', 'kakinada'],
  'TELANGANA': ['telangana', 'hyderabad', 'warangal', 'nizamabad', 'karimnagar', 'khammam'],
  'WEST BENGAL': ['west bengal', 'kolkata', 'calcutta', 'howrah', 'siliguri', 'durgapur', 'asansol', 'sundarbans'],
  'RAJASTHAN': ['rajasthan', 'jaipur', 'jodhpur', 'udaipur', 'kota', 'ajmer', 'bikaner', 'barmer'],
  'UTTAR PRADESH': ['uttar pradesh', 'lucknow', 'kanpur', 'agra', 'varanasi', 'allahabad', 'prayagraj', 'meerut', 'noida', 'ghaziabad'],
  'MADHYA PRADESH': ['madhya pradesh', 'bhopal', 'indore', 'jabalpur', 'gwalior', 'ujjain'],
  'GUJARAT': ['gujarat', 'ahmedabad', 'surat', 'vadodara', 'rajkot', 'bhuj', 'kutch', 'gandhinagar', 'junagadh'],
  'BIHAR': ['bihar', 'patna', 'gaya', 'bhagalpur', 'muzaffarpur', 'darbhanga', 'kosi'],
  'ODISHA': ['odisha', 'orissa', 'bhubaneswar', 'cuttack', 'puri', 'berhampur', 'rourkela'],
  'ASSAM': ['assam', 'guwahati', 'dibrugarh', 'silchar', 'jorhat', 'brahmaputra'],
  'PUNJAB': ['punjab', 'chandigarh', 'ludhiana', 'amritsar', 'jalandhar', 'patiala'],
  'HARYANA': ['haryana', 'gurugram', 'gurgaon', 'faridabad', 'panipat', 'hisar', 'karnal'],
  'JHARKHAND': ['jharkhand', 'ranchi', 'jamshedpur', 'dhanbad', 'bokaro', 'hazaribagh'],
  'CHHATTISGARH': ['chhattisgarh', 'raipur', 'bilaspur', 'durg', 'bhilai', 'korba'],
  'UTTARAKHAND': ['uttarakhand', 'dehradun', 'haridwar', 'rishikesh', 'nainital', 'mussoorie', 'chamoli', 'joshimath'],
  'HIMACHAL PRADESH': ['himachal pradesh', 'shimla', 'manali', 'dharamsala', 'kullu', 'mandi', 'kangra'],
  'GOA': ['goa', 'panaji', 'margao', 'vasco'],
  'TRIPURA': ['tripura', 'agartala'],
  'MEGHALAYA': ['meghalaya', 'shillong', 'cherrapunji'],
  'MANIPUR': ['manipur', 'imphal'],
  'NAGALAND': ['nagaland', 'kohima', 'dimapur'],
  'MIZORAM': ['mizoram', 'aizawl'],
  'ARUNACHAL PRADESH': ['arunachal pradesh', 'itanagar'],
  'SIKKIM': ['sikkim', 'gangtok'],
  'DELHI': ['delhi', 'new delhi', 'ncr'],
  'JAMMU AND KASHMIR': ['jammu', 'kashmir', 'srinagar', 'jammu and kashmir'],
  'LADAKH': ['ladakh', 'leh', 'kargil'],
};

// India bounding box (approximate)
const INDIA_BOUNDS = {
  latMin: 6.5, latMax: 35.5,
  lonMin: 68.0, lonMax: 97.5,
};

function isInIndia(lat, lon) {
  return lat >= INDIA_BOUNDS.latMin && lat <= INDIA_BOUNDS.latMax &&
         lon >= INDIA_BOUNDS.lonMin && lon <= INDIA_BOUNDS.lonMax;
}

function matchesLocation(text, userCountry, userState, userRegion) {
  if (!userCountry && !userState && !userRegion) return true;
  const lower = text.toLowerCase();
  
  const cMatch = userCountry ? lower.includes(userCountry.toLowerCase()) : false;
  
  let sMatch = false;
  if (userState) {
    const stateKey = userState.toUpperCase();
    const keywords = STATE_KEYWORDS[stateKey] || [userState.toLowerCase()];
    sMatch = keywords.some(kw => lower.includes(kw));
  }
  
  const rMatch = userRegion ? lower.includes(userRegion.toLowerCase()) : false;

  // Strict filtering: If state or region is provided, prefer matching those.
  // Otherwise, match the country.
  if (userState || userRegion) {
    return sMatch || rMatch || cMatch;
  }
  return cMatch;
}

// CORS proxy for GDACS (their API doesn't set CORS headers)
const CORS_PROXY = 'https://api.allorigins.win/raw?url=';

export async function fetchDisasterAlerts(userCountry, userState, userRegion) {
  const alerts = [];
  const now = new Date().toISOString().slice(0, 19).replace('T', ' ') + ' UTC';

  const isIndia = !userCountry || userCountry.toLowerCase() === 'india';

  // ===== HARDCODED ALERTS: Always visible, mixed severity =====
  // Only load these if the user is in India (or country is unknown) to prevent
  // fake Indian alerts from showing up in other countries like Germany.
  if (isIndia) {
    const hardcodedAlerts = [
      {
        id: 'local-heatwave-mira-bhayander',
        title: 'SEVERE HEATWAVE WARNING – MIRA-BHAYANDER',
        description: 'A severe heatwave is expected over the next few days, with temperatures rising above 40°C. Prolonged exposure to heat can cause dehydration and heatstroke. Stay indoors during peak afternoon hours. Drink plenty of water, even if you are not thirsty. Wear light, loose cotton clothes. Avoid direct sunlight and heavy physical activity. Emergency: Dial 108 or 112 if someone shows signs of heatstroke.',
        severity: 'high',
        timestamp: now,
        source: 'IMD // HEATWAVE_ALERT',
        location: 'MAHARASHTRA',
        alertLevel: 'Red',
        eventType: 'HEATWAVE',
        guidelines: [
          'Stay indoors during peak afternoon hours (12 PM - 4 PM)',
          'Drink plenty of water even if you are not thirsty',
          'Wear light, loose cotton clothes',
          'Avoid direct sunlight and heavy physical activity',
          'Check on elderly neighbors and vulnerable individuals',
        ],
        emergency: 'Dial 108 or 112 if someone shows signs of heatstroke.',
      },
      {
        id: 'local-cyclone-odisha',
        title: 'CYCLONE DANA – EXTREME WIND WARNING',
        description: 'Cyclone Dana is making landfall near the Odisha coast with wind speeds exceeding 150 km/h. Storm surge of 2-3 meters expected in low-lying coastal areas. Massive rainfall predicted across districts of Puri, Ganjam, Balasore, and Bhadrak. All fishing operations suspended. NDRF teams deployed.',
        severity: 'high',
        timestamp: now,
        source: 'IMD // CYCLONE_WARNING',
        location: 'ODISHA',
        alertLevel: 'Red',
        eventType: 'TC',
        guidelines: [
          'Evacuate low-lying coastal areas immediately',
          'Do not venture into the sea or near rivers',
          'Secure loose objects on rooftops and balconies',
          'Keep emergency kit ready with food, water, medicines',
          'Stay tuned to official broadcasts on All India Radio',
        ],
        emergency: 'Call NDRF Helpline 011-26107953 or State Disaster Control Room.',
      },
      {
        id: 'local-flood-assam',
        title: 'CATASTROPHIC FLOODING – BRAHMAPUTRA BASIN',
        description: 'The Brahmaputra River has breached danger levels at multiple points in Assam. Over 30 districts affected with water levels continuing to rise. Kaziranga National Park submerged. Army and SDRF conducting rescue operations. Lakhs of people displaced from their homes.',
        severity: 'high',
        timestamp: now,
        source: 'CWC // FLOOD_ALERT',
        location: 'ASSAM',
        alertLevel: 'Red',
        eventType: 'FL',
        guidelines: [
          'Move to higher ground immediately if in flood-affected areas',
          'Do not attempt to cross flooded roads or bridges',
          'Disconnect electrical appliances before evacuating',
          'Carry important documents in waterproof bags',
          'Boil water before drinking to avoid waterborne diseases',
        ],
        emergency: 'State Emergency Helpline: 1070 or SDRF: 0361-2237219.',
      },
      {
        id: 'local-earthquake-uttarakhand',
        title: 'SEISMIC ACTIVITY DETECTED – CHAMOLI DISTRICT',
        description: 'A moderate earthquake of magnitude 4.6 was recorded near Chamoli district, Uttarakhand at a depth of 10 km. Tremors felt across Joshimath, Rudraprayag, and parts of Garhwal. No major damage reported so far. Authorities monitoring for aftershocks. Residents advised to stay alert.',
        severity: 'medium',
        timestamp: now,
        source: 'NCS // SEISMIC_ALERT',
        location: 'UTTARAKHAND',
        alertLevel: 'Orange',
        eventType: 'EQ',
        guidelines: [
          'Drop, Cover, and Hold On during tremors',
          'Stay away from glass windows and heavy furniture',
          'If outdoors, move to open areas away from buildings',
          'Check for gas leaks and structural damage after tremors',
          'Keep an emergency bag packed near exit doors',
        ],
        emergency: 'National Earthquake Helpline: 1092.',
      },
      {
        id: 'local-landslide-himachal',
        title: 'LANDSLIDE RISK – MANALI-LEH HIGHWAY',
        description: 'Heavy rainfall has triggered landslide warnings along the Manali-Leh highway. Atal Tunnel area, Rohtang Pass, and Solang Valley are at elevated risk. BRO teams on standby for road clearance. Tourists advised to avoid travel to these areas until further notice.',
        severity: 'medium',
        timestamp: now,
        source: 'GSI // LANDSLIDE_WARNING',
        location: 'HIMACHAL PRADESH',
        alertLevel: 'Orange',
        eventType: 'LANDSLIDE',
        guidelines: [
          'Avoid travel on mountain roads during heavy rainfall',
          'Watch for unusual sounds like cracking trees or shifting rocks',
          'Do not camp near steep slopes or river banks',
          'Follow BRO and local police instructions for road closures',
          'Report any cracks in hillsides to local authorities',
        ],
        emergency: 'Disaster Helpline: 1077 or BRO Control Room.',
      },
      {
        id: 'local-aqi-delhi',
        title: 'SEVERE AIR QUALITY ALERT – NCR REGION',
        description: 'Air Quality Index (AQI) in Delhi-NCR has crossed 400 (Severe+ category). PM2.5 levels are 10x above WHO safe limits. Stubble burning in neighboring states and low wind speeds are contributing factors. GRAP Stage IV restrictions imposed. Schools ordered shut.',
        severity: 'medium',
        timestamp: now,
        source: 'CPCB // AIR_QUALITY',
        location: 'DELHI',
        alertLevel: 'Orange',
        eventType: 'AIR_QUALITY',
        guidelines: [
          'Avoid outdoor activities, especially exercise',
          'Use N95 masks when stepping outside',
          'Keep windows and doors closed, use air purifiers if available',
          'Stay hydrated and consume warm liquids',
          'Seek medical attention if you experience breathing difficulty',
        ],
        emergency: 'AIIMS Emergency: 011-26588500.',
      },
      {
        id: 'local-thunderstorm-rajasthan',
        title: 'THUNDERSTORM & DUST STORM WARNING – WESTERN RAJASTHAN',
        description: 'IMD has issued a warning for severe thunderstorms accompanied by dust storms in Barmer, Jaisalmer, Jodhpur, and Bikaner districts. Wind gusts up to 80 km/h expected. Visibility may drop below 200 meters. Damage to kutcha structures and uprooting of trees likely.',
        severity: 'medium',
        timestamp: now,
        source: 'IMD // THUNDERSTORM_ALERT',
        location: 'RAJASTHAN',
        alertLevel: 'Orange',
        eventType: 'STORM',
        guidelines: [
          'Stay indoors and close all windows during the storm',
          'Avoid using landline phones during lightning',
          'Park vehicles away from trees and electric poles',
          'If driving, pull over and wait for the storm to pass',
          'Secure outdoor furniture and livestock shelters',
        ],
        emergency: 'IMD Control Room: 011-24611068.',
      },
      {
        id: 'local-tremor-kashmir',
        title: 'MINOR TREMOR RECORDED – JAMMU & KASHMIR',
        description: 'A minor earthquake of magnitude 3.2 was recorded near Anantnag district at a shallow depth of 5 km. No damage or casualties reported. This region falls under Seismic Zone V and experiences frequent minor tremors. Residents should remain aware of earthquake preparedness.',
        severity: 'low',
        timestamp: now,
        source: 'NCS // SEISMIC_LOG',
        location: 'JAMMU AND KASHMIR',
        alertLevel: 'Green',
        eventType: 'EQ',
        guidelines: [
          'No immediate action required',
          'Review your earthquake preparedness kit',
          'Ensure heavy furniture is properly anchored',
          'Know your nearest evacuation routes',
        ],
        emergency: 'No emergency action needed at this time.',
      },
      {
        id: 'local-coastal-erosion-kerala',
        title: 'COASTAL EROSION MONITORING – ALAPPUZHA',
        description: 'Increased coastal erosion observed along Alappuzha and Chellanam coastline due to rough sea conditions. Sea walls showing signs of wear. Fishing communities advised to exercise caution. Long-term rehabilitation and sea wall reinforcement projects underway.',
        severity: 'low',
        timestamp: now,
        source: 'NCESS // COASTAL_MONITOR',
        location: 'KERALA',
        alertLevel: 'Green',
        eventType: 'COASTAL',
        guidelines: [
          'Avoid walking on eroded beach stretches',
          'Report any new erosion patterns to local panchayat',
          'Fishermen should check sea condition before venturing out',
        ],
        emergency: 'Kerala SDMA: 0471-2364424.',
      },
      {
        id: 'local-heat-advisory-maharashtra',
        title: 'HEAT ADVISORY – VIDARBHA REGION',
        description: 'Temperatures in Nagpur, Chandrapur, Akola, and Amravati are expected to hover around 42-44°C for the next 3 days. Yellow alert issued for Vidarbha region. Residents advised to take precautions against heat-related illnesses.',
        severity: 'low',
        timestamp: now,
        source: 'IMD // HEAT_ADVISORY',
        location: 'MAHARASHTRA',
        alertLevel: 'Green',
        eventType: 'HEATWAVE',
        guidelines: [
          'Drink ORS and fluids regularly',
          'Avoid strenuous work during afternoon hours',
          'Keep animals in shaded areas with access to water',
        ],
        emergency: 'Health Helpline: 104.',
      },
      {
        id: 'local-fog-punjab',
        title: 'DENSE FOG ADVISORY – PUNJAB & HARYANA',
        description: 'Dense fog conditions expected in Punjab and Haryana over the next 48 hours. Visibility may drop below 50 meters in some areas. Flight and train delays expected. Drivers should use fog lights and maintain safe distance.',
        severity: 'low',
        timestamp: now,
        source: 'IMD // FOG_ADVISORY',
        location: 'PUNJAB',
        alertLevel: 'Green',
        eventType: 'FOG',
        guidelines: [
          'Use low-beam headlights and fog lights while driving',
          'Maintain safe following distance on highways',
          'Check flight and train status before departure',
          'Avoid unnecessary travel during peak fog hours (11 PM - 8 AM)',
        ],
        emergency: 'Highway Helpline: 1033.',
      }
    ];

    // Only add hardcoded alerts if they match the user's state, 
    // or if the user state isn't specified (to keep the feed populated for new users)
    for (const alert of hardcodedAlerts) {
      if (!userState || alert.location.toLowerCase() === userState.toLowerCase()) {
        alerts.push(alert);
      }
    }
  }

  // Helper for fetch with timeout
  const fetchWithTimeout = async (url, options = {}) => {
    const { timeout = 5000 } = options;
    const controller = new AbortController();
    const id = setTimeout(() => controller.abort(), timeout);
    const response = await fetch(url, {
      ...options,
      signal: controller.signal  
    });
    clearTimeout(id);
    return response;
  };

  // ===== SOURCE 1: GDACS EVENT LIST =====
  try {
    const gdacsUrl = `https://www.gdacs.org/gdacsapi/api/events/geteventlist/SEARCH?eventlist=EQ,TC,FL,VO,DR,WF&alertlevel=Green;Orange;Red`;
    const res = await fetchWithTimeout(CORS_PROXY + encodeURIComponent(gdacsUrl), { timeout: 8000 });

    if (res.ok) {
      const data = await res.json();
      const features = data.features || [];

      for (const feature of features) {
        const props = feature.properties || {};
        const affectedCountries = props.affectedcountries || '';
        const eventName = props.name || props.eventname || '';
        const description = props.description || props.htmldescription || '';
        const combined = `${eventName} ${description} ${affectedCountries}`;

        // Ensure the event matches the user's specific location
        if (!matchesLocation(combined, userCountry, userState, userRegion)) continue;

        const alertLevel = props.alertlevel || 'Green';
        const severity = GDACS_ALERT_MAP[alertLevel] || 'low';
        const eventType = props.eventtype || 'EQ';
        const eventLabel = EVENT_TYPE_LABELS[eventType] || eventType;

        const fromDate = props.fromdate
          ? new Date(props.fromdate).toISOString().slice(0, 19).replace('T', ' ') + ' UTC'
          : 'UNKNOWN';

        const severityData = props.severity || {};
        const severityText = severityData.severitytext || severityData.severityunit || '';

        alerts.push({
          id: `gdacs-${props.eventid || Math.random()}`,
          title: eventName.toUpperCase() || `${eventLabel} EVENT DETECTED`,
          description: description.replace(/<[^>]*>/g, '').slice(0, 350) ||
            `${eventLabel} event reported. ${severityText}. Alert level: ${alertLevel}. Follow local authority instructions and stay alert.`,
          severity,
          timestamp: fromDate,
          source: `GDACS // ${eventLabel}`,
          location: userCountry || 'GLOBAL',
          alertLevel,
          eventType,
        });
      }
    }
  } catch (err) {
    console.warn('GDACS fetch failed or timed out:', err);
  }

  // ===== SOURCE 2: RELIEFWEB DISASTERS (fallback / supplement) =====
  try {
    // Dynamically query based on the user's country rather than hardcoding 'India'
    const targetCountry = userCountry || 'India';
    const reliefUrl = 'https://api.reliefweb.int/v1/disasters?appname=chetak&limit=30' +
      `&filter[field]=country.name&filter[value]=${encodeURIComponent(targetCountry)}` +
      '&sort[]=date.event:desc' +
      '&fields[include][]=name&fields[include][]=description&fields[include][]=date.event&fields[include][]=type&fields[include][]=status';

    const res2 = await fetchWithTimeout(reliefUrl, { timeout: 6000 });
    if (res2.ok) {
      const data2 = await res2.json();
      const disasters = data2.data || [];

      for (const disaster of disasters) {
        const name = disaster.fields?.name || '';
        const desc = disaster.fields?.description || '';
        const combined = name + ' ' + desc;

        // Ensure the event matches the user's specific location
        if (!matchesLocation(combined, userCountry, userState, userRegion)) continue;

        // Avoid duplicates with GDACS
        const titleUpper = name.toUpperCase();
        if (alerts.find(a => a.title === titleUpper)) continue;

        // Determine severity from keywords
        const lower = combined.toLowerCase();
        let severity = 'low';
        if (lower.includes('earthquake') || lower.includes('flood') || lower.includes('cyclone') || lower.includes('tsunami')) {
          severity = 'high';
        } else if (lower.includes('storm') || lower.includes('drought') || lower.includes('landslide') || lower.includes('heat')) {
          severity = 'medium';
        }

        const type = disaster.fields?.type?.[0]?.name || 'DISASTER';
        const date = disaster.fields?.['date.event']
          ? new Date(disaster.fields['date.event']).toISOString().slice(0, 19).replace('T', ' ') + ' UTC'
          : 'UNKNOWN';

        alerts.push({
          id: 'reliefweb-' + disaster.id,
          title: titleUpper,
          description: desc.replace(/<[^>]*>/g, '').slice(0, 350) || `${type} event reported in the region.`,
          severity,
          timestamp: date,
          source: `RELIEFWEB // ${type.toUpperCase()}`,
          location: userCountry || 'GLOBAL',
          alertLevel: severity === 'high' ? 'Red' : severity === 'medium' ? 'Orange' : 'Green',
          eventType: type,
        });
      }
    }
  } catch (err) {
    console.warn('ReliefWeb fetch failed or timed out:', err);
  }

  // Sort: high severity first, then medium, then low
  const severityOrder = { high: 0, medium: 1, low: 2 };
  alerts.sort((a, b) => severityOrder[a.severity] - severityOrder[b.severity]);

  return alerts.slice(0, 15); // Max 15 alerts
}

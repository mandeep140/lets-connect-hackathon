import { NextResponse } from 'next/server';

// Dataset: array of trains with realistic IRCTC data
const trains = [
  { 
    number: '12301', 
    name: 'Rajdhani Express', 
    type: 'Express',
    stops: [
      { code: 'NDLS', name: 'New Delhi', arrival: '--', departure: '16:55', platform: '16', day: 1 },
      { code: 'CNB', name: 'Kanpur Central', arrival: '22:00', departure: '22:10', platform: '4', day: 1 },
      { code: 'PNBE', name: 'Patna Jn', arrival: '02:15', departure: '02:25', platform: '10', day: 2 },
      { code: 'PRYJ', name: 'Parasnath', arrival: '04:30', departure: '04:32', platform: '2', day: 2 },
      { code: 'HWH', name: 'Howrah Jn', arrival: '09:55', departure: '--', platform: '9', day: 2 }
    ]
  },
  { 
    number: '12951', 
    name: 'Mumbai Rajdhani', 
    type: 'Express',
    stops: [
      { code: 'MMCT', name: 'Mumbai Central', arrival: '--', departure: '17:00', platform: '8', day: 1 },
      { code: 'SUR', name: 'Surat', arrival: '21:15', departure: '21:20', platform: '3', day: 1 },
      { code: 'BRC', name: 'Vadodara Jn', arrival: '22:35', departure: '22:40', platform: '6', day: 1 },
      { code: 'RTM', name: 'Ratlam Jn', arrival: '02:05', departure: '02:10', platform: '4', day: 2 },
      { code: 'BPL', name: 'Bhopal Jn', arrival: '05:30', departure: '05:35', platform: '5', day: 2 },
      { code: 'NDLS', name: 'New Delhi', arrival: '10:50', departure: '--', platform: '14', day: 2 }
    ]
  },
  { 
    number: '12236', 
    name: 'Duronto Express', 
    type: 'Express',
    stops: [
      { code: 'NDLS', name: 'New Delhi', arrival: '--', departure: '22:15', platform: '12', day: 1 },
      { code: 'DHN', name: 'Dhanbad Jn', arrival: '07:45', departure: '07:50', platform: '3', day: 2 },
      { code: 'ASN', name: 'Asansol Jn', arrival: '09:15', departure: '09:20', platform: '6', day: 2 },
      { code: 'HWH', name: 'Howrah Jn', arrival: '13:10', departure: '--', platform: '23', day: 2 }
    ]
  },
  { 
    number: '12430', 
    name: 'Lucknow Mail', 
    type: 'Mail',
    stops: [
      { code: 'NDLS', name: 'New Delhi', arrival: '--', departure: '22:30', platform: '9', day: 1 },
      { code: 'CNB', name: 'Kanpur Central', arrival: '04:15', departure: '04:25', platform: '7', day: 2 },
      { code: 'LKO', name: 'Lucknow', arrival: '06:40', departure: '--', platform: '4', day: 2 }
    ]
  },
  { 
    number: '12002', 
    name: 'Bhopal Shatabdi', 
    type: 'Shatabdi',
    stops: [
      { code: 'NDLS', name: 'New Delhi', arrival: '--', departure: '06:00', platform: '10', day: 1 },
      { code: 'AGC', name: 'Agra Cantt', arrival: '08:18', departure: '08:20', platform: '3', day: 1 },
      { code: 'GWL', name: 'Gwalior Jn', arrival: '09:23', departure: '09:25', platform: '2', day: 1 },
      { code: 'JHS', name: 'Jhansi Jn', arrival: '10:35', departure: '10:40', platform: '4', day: 1 },
      { code: 'BPL', name: 'Bhopal Jn', arrival: '14:25', departure: '--', platform: '6', day: 1 }
    ]
  },
  { 
    number: '12618', 
    name: 'Mngla Lksdp', 
    type: 'Superfast',
    stops: [
      { code: 'MAS', name: 'Chennai Central', arrival: '--', departure: '20:15', platform: '7', day: 1 },
      { code: 'GNT', name: 'Guntur Jn', arrival: '03:25', departure: '03:30', platform: '3', day: 2 },
      { code: 'BZA', name: 'Vijayawada Jn', arrival: '04:40', departure: '04:50', platform: '8', day: 2 },
      { code: 'NGP', name: 'Nagpur', arrival: '14:55', departure: '15:05', platform: '5', day: 2 },
      { code: 'BPL', name: 'Bhopal Jn', arrival: '22:00', departure: '22:10', platform: '4', day: 2 },
      { code: 'NDLS', name: 'New Delhi', arrival: '04:45', departure: '--', platform: '16', day: 3 }
    ]
  },
  { 
    number: '22926', 
    name: 'Paschim Express', 
    type: 'Superfast',
    stops: [
      { code: 'MMCT', name: 'Mumbai Central', arrival: '--', departure: '19:05', platform: '4', day: 1 },
      { code: 'BVI', name: 'Borivali', arrival: '19:35', departure: '19:37', platform: '6', day: 1 },
      { code: 'ST', name: 'Surat', arrival: '23:15', departure: '23:20', platform: '2', day: 1 },
      { code: 'ADI', name: 'Ahmedabad Jn', arrival: '01:50', departure: '02:00', platform: '5', day: 2 },
      { code: 'ABR', name: 'Abu Road', arrival: '06:05', departure: '06:15', platform: '1', day: 2 },
      { code: 'AII', name: 'Ajmer Jn', arrival: '09:25', departure: '09:30', platform: '3', day: 2 },
      { code: 'JP', name: 'Jaipur', arrival: '11:45', departure: '11:55', platform: '4', day: 2 },
      { code: 'NDLS', name: 'New Delhi', arrival: '17:10', departure: '--', platform: '11', day: 2 }
    ]
  },
  { 
    number: '12260', 
    name: 'Varanasi Duronto', 
    type: 'Duronto',
    stops: [
      { code: 'SDAH', name: 'Sealdah', arrival: '--', departure: '20:50', platform: '9', day: 1 },
      { code: 'BWN', name: 'Barddhaman Jn', arrival: '22:35', departure: '22:37', platform: '4', day: 1 },
      { code: 'DHN', name: 'Dhanbad Jn', arrival: '01:20', departure: '01:22', platform: '5', day: 2 },
      { code: 'PNBE', name: 'Patna Jn', arrival: '05:00', departure: '05:10', platform: '8', day: 2 },
      { code: 'MGS', name: 'Mughal Sarai Jn', arrival: '08:15', departure: '--', platform: '6', day: 2 }
    ]
  },
  { 
    number: '54321', 
    name: 'Delhi Local', 
    type: 'Local Train',
    stops: [
      { code: 'NDLS', name: 'New Delhi', arrival: '--', departure: '07:00', platform: '2', day: 1 },
      { code: 'OKD', name: 'Old Delhi', arrival: '07:10', departure: '07:12', platform: '1', day: 1 },
      { code: 'SDB', name: 'Shahdara', arrival: '07:25', departure: '07:27', platform: '2', day: 1 },
      { code: 'VVB', name: 'Vivek Vihar', arrival: '07:35', departure: '07:37', platform: '1', day: 1 },
      { code: 'GZB', name: 'Ghaziabad', arrival: '08:30', departure: '--', platform: '3', day: 1 }
    ]
  },
  { 
    number: '54322', 
    name: 'Mumbai Local', 
    type: 'Local Train',
    stops: [
      { code: 'CSTM', name: 'Chhatrapati Shivaji Terminus', arrival: '--', departure: '08:00', platform: '12', day: 1 },
      { code: 'BYC', name: 'Byculla', arrival: '08:10', departure: '08:12', platform: '2', day: 1 },
      { code: 'CLA', name: 'Kurla', arrival: '08:25', departure: '08:27', platform: '4', day: 1 },
      { code: 'TNA', name: 'Thane', arrival: '08:50', departure: '08:52', platform: '6', day: 1 },
      { code: 'KALYAN', name: 'Kalyan', arrival: '09:45', departure: '--', platform: '8', day: 1 }
    ]
  },
  { 
    number: 'M101', 
    name: 'Delhi Metro Blue Line', 
    type: 'Metro',
    stops: [
      { code: 'DWRK', name: 'Dwarka Sector 21', arrival: '--', departure: '06:00', platform: '1', day: 1 },
      { code: 'JANAK', name: 'Janakpuri West', arrival: '06:08', departure: '06:09', platform: '1', day: 1 },
      { code: 'RJCHK', name: 'Rajiv Chowk', arrival: '06:25', departure: '06:26', platform: '2', day: 1 },
      { code: 'MANDI', name: 'Mandi House', arrival: '06:30', departure: '06:31', platform: '1', day: 1 },
      { code: 'AKSHD', name: 'Akshardham', arrival: '06:42', departure: '06:43', platform: '2', day: 1 },
      { code: 'NOIDA', name: 'Noida City Centre', arrival: '07:15', departure: '--', platform: '1', day: 1 }
    ]
  },
  { 
    number: 'M102', 
    name: 'Delhi Metro Red Line', 
    type: 'Metro',
    stops: [
      { code: 'RITHALA', name: 'Rithala', arrival: '--', departure: '05:45', platform: '1', day: 1 },
      { code: 'ROHINI', name: 'Rohini East', arrival: '05:52', departure: '05:53', platform: '1', day: 1 },
      { code: 'KASHM', name: 'Kashmere Gate', arrival: '06:15', departure: '06:16', platform: '2', day: 1 },
      { code: 'NDLSM', name: 'New Delhi Metro', arrival: '06:22', departure: '06:23', platform: '1', day: 1 },
      { code: 'SHIVJ', name: 'Shivaji Stadium', arrival: '06:28', departure: '06:29', platform: '2', day: 1 },
      { code: 'GHAZIABAD', name: 'Ghaziabad', arrival: '07:05', departure: '--', platform: '1', day: 1 }
    ]
  },
  { 
    number: 'M201', 
    name: 'Mumbai Metro Line 1', 
    type: 'Metro',
    stops: [
      { code: 'VERSOVA', name: 'Versova', arrival: '--', departure: '05:30', platform: '1', day: 1 },
      { code: 'ANDHER', name: 'Andheri', arrival: '05:38', departure: '05:39', platform: '1', day: 1 },
      { code: 'SANTC', name: 'Santacruz', arrival: '05:44', departure: '05:45', platform: '1', day: 1 },
      { code: 'BANDRA', name: 'Bandra BKC', arrival: '05:52', departure: '05:53', platform: '1', day: 1 },
      { code: 'SIONM', name: 'Sion', arrival: '06:02', departure: '06:03', platform: '1', day: 1 },
      { code: 'GHATKOPAR', name: 'Ghatkopar', arrival: '06:15', departure: '--', platform: '1', day: 1 }
    ]
  }
];

// Build adjacency graph from train stops
function buildGraph(trains) {
  const graph = {};
  for (const t of trains) {
    const stopCodes = t.stops.map(s => s.code);
    for (let i = 0; i < stopCodes.length; i++) {
      const s = stopCodes[i];
      if (!graph[s]) graph[s] = new Set();
      // Connect neighbouring stops on same train route
      if (i > 0) graph[s].add(stopCodes[i - 1]);
      if (i < stopCodes.length - 1) graph[s].add(stopCodes[i + 1]);
    }
  }
  // Convert sets to arrays
  const out = {};
  for (const k of Object.keys(graph)) out[k] = Array.from(graph[k]);
  return out;
}

const graph = buildGraph(trains);

// Find shortest station-path using BFS
function findRouteBFS(source, dest) {
  source = source?.toUpperCase();
  dest = dest?.toUpperCase();
  if (!source || !dest) return null;
  if (source === dest) return [source];

  const q = [source];
  const visited = new Set([source]);
  const parent = {};
  
  while (q.length) {
    const cur = q.shift();
    const neighbors = graph[cur] || [];
    for (const nb of neighbors) {
      if (!visited.has(nb)) {
        visited.add(nb);
        parent[nb] = cur;
        if (nb === dest) {
          // Build path
          const path = [dest];
          let p = dest;
          while (parent[p]) {
            p = parent[p];
            path.push(p);
          }
          return path.reverse();
        }
        q.push(nb);
      }
    }
  }
  return null;
}

// Get trains that connect two consecutive stations
function trainsCoveringSegment(a, b) {
  const matching = [];
  for (const t of trains) {
    const stopCodes = t.stops.map(s => s.code);
    for (let i = 0; i < stopCodes.length - 1; i++) {
      if (stopCodes[i] === a && stopCodes[i + 1] === b) {
        const fromStop = t.stops[i];
        const toStop = t.stops[i + 1];
        matching.push({
          number: t.number,
          name: t.name,
          type: t.type,
          from_station: fromStop.name,
          to_station: toStop.name,
          departure: fromStop.departure,
          arrival: toStop.arrival,
          from_platform: fromStop.platform,
          to_platform: toStop.platform,
          journey_day: `Day ${fromStop.day} to Day ${toStop.day}`
        });
      }
      if (stopCodes[i] === b && stopCodes[i + 1] === a) {
        const fromStop = t.stops[i];
        const toStop = t.stops[i + 1];
        matching.push({
          number: t.number,
          name: t.name,
          type: t.type,
          from_station: fromStop.name,
          to_station: toStop.name,
          departure: fromStop.departure,
          arrival: toStop.arrival,
          from_platform: fromStop.platform,
          to_platform: toStop.platform,
          journey_day: `Day ${fromStop.day} to Day ${toStop.day}`
        });
      }
    }
  }
  return matching;
}

export async function GET(request) {
  const { searchParams } = new URL(request.url);
  const from = (searchParams.get('from') || '').toUpperCase();
  const to = (searchParams.get('to') || '').toUpperCase();
  const trainNumber = searchParams.get('train');

  if (!from || !to) {
    return NextResponse.json(
      { error: 'Please provide from and to query params, e.g. /api/routes?from=NDLS&to=HWH' },
      { status: 400 }
    );
  }

  // If train number provided, find the specific train and extract path
  let path = null;
  if (trainNumber) {
    const train = trains.find(t => t.number === trainNumber);
    if (train) {
      const stopCodes = train.stops.map(s => s.code);
      const fromIdx = stopCodes.indexOf(from);
      const toIdx = stopCodes.indexOf(to);
      
      if (fromIdx !== -1 && toIdx !== -1) {
        // Extract only stations between from and to on this train
        if (fromIdx < toIdx) {
          path = stopCodes.slice(fromIdx, toIdx + 1);
        } else {
          path = stopCodes.slice(toIdx, fromIdx + 1).reverse();
        }
      }
    }
  }
  
  // Fallback to BFS if no train specified or train not found
  if (!path) {
    path = findRouteBFS(from, to);
  }
  
  if (!path) {
    return NextResponse.json(
      { error: 'No route found between given stations in dataset' },
      { status: 404 }
    );
  }

  // Map segments to trains that run that segment with timing details
  const segments = [];
  for (let i = 0; i < path.length - 1; i++) {
    const a = path[i], b = path[i + 1];
    const trainsOnSegment = trainsCoveringSegment(a, b);
    
    // Get station full names
    let fromName = a, toName = b;
    for (const t of trains) {
      for (const stop of t.stops) {
        if (stop.code === a) fromName = stop.name;
        if (stop.code === b) toName = stop.name;
      }
    }
    
    segments.push({
      from: a,
      from_name: fromName,
      to: b,
      to_name: toName,
      trains: trainsOnSegment
    });
  }

  return NextResponse.json({
    from,
    to,
    path,
    total_stations: path.length,
    segments,
    message: 'Route found with realistic IRCTC train data including timings and platforms'
  });
}

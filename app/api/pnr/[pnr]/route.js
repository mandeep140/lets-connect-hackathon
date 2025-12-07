import { NextResponse } from 'next/server';

// Sample data
const firstNames = [
  'Rajesh', 'Priya', 'Amit', 'Sneha', 'Vikram', 'Anjali', 'Rahul', 'Kavita',
  'Suresh', 'Meena', 'Ramesh', 'Pooja', 'Arun', 'Deepa', 'Kiran'
];

const lastNames = [
  'Kumar', 'Singh', 'Sharma', 'Patel', 'Verma', 'Reddy', 'Nair', 'Gupta',
  'Joshi', 'Desai', 'Rao', 'Mehta', 'Iyer', 'Pillai'
];

const trainData = [
  { number: '12301', name: 'Rajdhani Express', from: 'NDLS', to: 'HWH', duration: '17:00', type: 'Express' },
  { number: '12951', name: 'Mumbai Rajdhani', from: 'MMCT', to: 'NDLS', duration: '15:50', type: 'Express' },
  { number: '12236', name: 'Duronto Express', from: 'NDLS', to: 'HWH', duration: '14:55', type: 'Express' },
  { number: '12430', name: 'Lucknow Mail', from: 'NDLS', to: 'LKO', duration: '08:10', type: 'Mail' },
  { number: '12002', name: 'Bhopal Shatabdi', from: 'NDLS', to: 'BPL', duration: '08:25', type: 'Shatabdi' },
  { number: '54321', name: 'Delhi Local', from: 'NDLS', to: 'GZB', duration: '01:30', type: 'Local Train' },
  { number: '54322', name: 'Mumbai Local', from: 'CSTM', to: 'KALYAN', duration: '01:45', type: 'Local Train' },
  { number: 'M101', name: 'Delhi Metro Blue Line', from: 'DWRK', to: 'NOIDA', duration: '01:15', type: 'Metro' },
  { number: 'M102', name: 'Delhi Metro Red Line', from: 'RITHALA', to: 'GHAZIABAD', duration: '01:20', type: 'Metro' },
  { number: 'M201', name: 'Mumbai Metro Line 1', from: 'VERSOVA', to: 'GHATKOPAR', duration: '00:45', type: 'Metro' }
];

// Generate random passengers
function genPassengers(count) {
  const passengers = [];
  const coaches = ['A1', 'A2', 'B1', 'B2', 'B3', 'S1', 'S2'];
  const berths = ['LB', 'MB', 'UB', 'SL', 'SU'];
  const genders = ['M', 'F'];

  for (let i = 0; i < count; i++) {
    const firstName = firstNames[Math.floor(Math.random() * firstNames.length)];
    const lastName = lastNames[Math.floor(Math.random() * lastNames.length)];
    
    // 60% CNF, 20% RAC, 20% WL
    const rand = Math.random();
    let status, coach, berth, seat;
    
    if (rand < 0.6) {
      // CNF
      status = 'CNF';
      coach = coaches[Math.floor(Math.random() * coaches.length)];
      berth = berths[Math.floor(Math.random() * berths.length)];
      seat = Math.floor(Math.random() * 72) + 1;
    } else if (rand < 0.8) {
      // RAC
      status = 'RAC';
      coach = coaches[Math.floor(Math.random() * coaches.length)];
      berth = 'RAC';
      seat = Math.floor(Math.random() * 18) + 1;
    } else {
      // WL
      status = 'WL';
      coach = coaches[Math.floor(Math.random() * coaches.length)];
      berth = 'WL';
      seat = Math.floor(Math.random() * 50) + 1;
    }

    passengers.push({
      sno: i + 1,
      name: `${firstName} ${lastName}`,
      age: Math.floor(Math.random() * 60) + 18,
      gender: genders[Math.floor(Math.random() * genders.length)],
      booking_status: `${coach}/${seat}/${berth}`,
      current_status: status === 'CNF' ? `${coach}/${seat}/${berth}` : `${status}${seat}`
    });
  }

  return passengers;
}

export async function GET(request, { params }) {
  const { pnr } = await params;
  
  // Random train selection
  const train = trainData[Math.floor(Math.random() * trainData.length)];
  
  // Random class
  const classes = ['1A', '2A', '3A', 'SL', '2S', 'CC'];
  const selectedClass = classes[Math.floor(Math.random() * classes.length)];
  
  // Random quota
  const quotas = ['GN', 'TQ', 'PT', 'LD'];
  const quota = quotas[Math.floor(Math.random() * quotas.length)];
  
  // Chart status (30% chance of prepared)
  const chartStatus = Math.random() > 0.7;
  
  // Journey date (random future date within 120 days)
  const today = new Date();
  const randomDays = Math.floor(Math.random() * 120);
  const journeyDate = new Date(today.getTime() + randomDays * 24 * 60 * 60 * 1000);
  const formattedDate = journeyDate.toISOString().split('T')[0];
  
  // Number of passengers (1-4)
  const passengerCount = Math.floor(Math.random() * 4) + 1;
  
  // Boarding time between 18:00 (6 PM) and 23:00 (11 PM)
  const hour = Math.floor(Math.random() * 6) + 18; // 18-23
  const minute = ['00', '15', '30', '45'][Math.floor(Math.random() * 4)];
  const boardingTime = `${String(hour).padStart(2, '0')}:${minute}`;
  
  const response = {
    pnr,
    train_number: train.number,
    train_name: train.name,
    train_type: train.type,
    from_station: train.from,
    to_station: train.to,
    boarding_point: train.from,
    reservation_upto: train.to,
    journey_date: formattedDate,
    class: selectedClass,
    quota: quota,
    chart_prepared: chartStatus,
    distance: `${Math.floor(Math.random() * 2000) + 200} KM`,
    boarding_time: boardingTime,
    journey_duration: train.duration,
    passengers: genPassengers(passengerCount),
    ticket_fare: {
      base_fare: Math.floor(Math.random() * 2000) + 500,
      reservation_charges: 40,
      superfast_charge: 30,
      other_charges: 10,
      total_fare: Math.floor(Math.random() * 2000) + 580
    },
    booking_date: new Date(today.getTime() - Math.random() * 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  };
  
  return NextResponse.json(response);
}

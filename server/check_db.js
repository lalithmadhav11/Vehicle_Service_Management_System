import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

mongoose.connect(process.env.MONGO_URI).then(async () => {
  console.log('Connected to DB.');
  const Vehicle = mongoose.model('Vehicle', new mongoose.Schema({}, {strict: false}));
  const Appointment = mongoose.model('Appointment', new mongoose.Schema({}, {strict: false}));
  
  const vehicles = await Vehicle.find();
  const appointments = await Appointment.find();
  
  console.log('Vehicles in DB:', vehicles.length);
  console.log('Appointments in DB:', appointments.length);
  process.exit(0);
}).catch(e => {
  console.error(e);
  process.exit(1);
});

import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

async function checkDatabaseName() {
  try {
    console.log('Connecting to check database name...');
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected!');
    console.log('Database name:', mongoose.connection.db.databaseName);
    
    // Check collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    // Check events collection specifically
    const eventsCount = await mongoose.connection.db.collection('events').countDocuments();
    console.log('Events count in collection:', eventsCount);
    
    if (eventsCount > 0) {
      const sampleEvent = await mongoose.connection.db.collection('events').findOne();
      console.log('Sample event:', {
        title: sampleEvent.title,
        status: sampleEvent.status,
        isActive: sampleEvent.isActive
      });
    }
    
    await mongoose.disconnect();
  } catch (error) {
    console.error('Error:', error);
  }
  process.exit(0);
}

checkDatabaseName();
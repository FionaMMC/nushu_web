import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

// Event model definition (same as in API)
const EventSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, 'Event title is required'],
    trim: true,
    maxlength: [200, 'Title cannot exceed 200 characters']
  },
  date: {
    type: String,
    required: [true, 'Event date is required'],
    validate: {
      validator: function(v) {
        return /^\d{4}-\d{2}-\d{2}$/.test(v);
      },
      message: 'Date must be in YYYY-MM-DD format'
    }
  },
  time: {
    type: String,
    required: [true, 'Event time is required'],
    trim: true
  },
  venue: {
    type: String,
    required: [true, 'Event venue is required'],
    trim: true,
    maxlength: [500, 'Venue cannot exceed 500 characters']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [50, 'Tag cannot exceed 50 characters']
  }],
  blurb: {
    type: String,
    required: [true, 'Event description is required'],
    trim: true,
    maxlength: [2000, 'Description cannot exceed 2000 characters']
  },
  status: {
    type: String,
    enum: ['upcoming', 'ongoing', 'completed'],
    default: 'upcoming',
    required: true
  },
  registrationLink: {
    type: String,
    trim: true
  },
  capacity: {
    type: Number,
    min: [1, 'Capacity must be at least 1']
  },
  currentRegistrations: {
    type: Number,
    default: 0,
    min: [0, 'Current registrations cannot be negative']
  },
  isActive: {
    type: Boolean,
    default: true
  },
  priority: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true,
  versionKey: false
});

const Event = mongoose.models.Event || mongoose.model('Event', EventSchema);

const seedEvents = [
  {
    title: "Welcome Seminar: Introduction to Nüshu",
    date: "2025-03-14",
    time: "18:00 – 20:00",
    venue: "Law Library, Law Group Study Room M107",
    tags: ["Seminar", "Social"],
    blurb: "A welcoming session to introduce Nüshu for the semester, including an overview, practice, and social time.",
    status: "upcoming",
    registrationLink: "#",
    capacity: 30,
    currentRegistrations: 12,
    priority: 10,
    isActive: true,
  },
  {
    title: "Calligraphy Workshop: Slender Gold to Nüshu Lines",
    date: "2025-03-25",
    time: "16:00 – 18:30",
    venue: "Fisher Library, Learning Studio 1",
    tags: ["Workshop", "Hands-on"],
    blurb: "Technique drills, stroke analysis, and stitched-letter forms on cloth. Materials provided.",
    status: "upcoming",
    registrationLink: "#",
    capacity: 20,
    currentRegistrations: 18,
    priority: 8,
    isActive: true,
  },
  {
    title: "Reading Group: Women's Scripts in Historical Context",
    date: "2025-04-12",
    time: "14:00 – 16:00",
    venue: "Quadrangle Building, Room S414",
    tags: ["Reading Group", "Academic"],
    blurb: "Discussion of recent scholarship on women's writing systems across cultures, with focus on Nüshu documentation.",
    status: "upcoming",
    capacity: 15,
    currentRegistrations: 7,
    priority: 6,
    isActive: true,
  }
];

async function createProductionEvents() {
  try {
    console.log('Connecting to production database...');
    console.log('MongoDB URI:', process.env.MONGODB_URI);
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected successfully!');
    console.log('Database name:', mongoose.connection.db.databaseName);

    // Clear existing events
    console.log('Clearing existing events...');
    const deleteResult = await Event.deleteMany({});
    console.log(`Deleted ${deleteResult.deletedCount} existing events`);

    // Create new events
    console.log('Creating events...');
    const results = [];
    for (const eventData of seedEvents) {
      const event = new Event(eventData);
      const saved = await event.save();
      results.push(saved);
      console.log(`✅ Created: ${saved.title}`);
    }

    // Verify
    const allEvents = await Event.find({});
    console.log(`📊 Total events in database: ${allEvents.length}`);
    allEvents.forEach(event => {
      console.log(`  - ${event.title} (${event.date}) - Status: ${event.status}, Active: ${event.isActive}`);
    });

    await mongoose.disconnect();
    console.log('✅ Production events created successfully!');
  } catch (error) {
    console.error('❌ Error:', error);
    await mongoose.disconnect();
  }
  process.exit(0);
}

createProductionEvents();
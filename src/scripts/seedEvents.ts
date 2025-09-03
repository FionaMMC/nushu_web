import mongoose from 'mongoose';
import dotenv from 'dotenv';

dotenv.config();

// Event model definition (same as in API)
interface IEvent extends mongoose.Document {
  title: string;
  date: string;
  time: string;
  venue: string;
  tags: string[];
  blurb: string;
  status: 'upcoming' | 'ongoing' | 'completed';
  registrationLink?: string;
  capacity?: number;
  currentRegistrations?: number;
  priority: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EventSchema = new mongoose.Schema<IEvent>({
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
      validator: function(v: string) {
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

const Event = mongoose.models.Event || mongoose.model<IEvent>('Event', EventSchema);

// Database connection helper
let isConnected = false;

const connectDatabase = async () => {
  if (isConnected) return;
  
  if (!process.env.MONGODB_URI) {
    throw new Error('MONGODB_URI environment variable is not defined');
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    isConnected = true;
    console.log('✅ Database connected');
  } catch (error) {
    console.error('❌ Database connection failed:', error);
    throw error;
  }
};

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

async function seedDatabase() {
  try {
    console.log('Connecting to database...');
    await connectDatabase();
    
    console.log('Clearing existing events...');
    await Event.deleteMany({});
    
    console.log('Seeding events...');
    await Event.insertMany(seedEvents);
    
    console.log('✅ Database seeded successfully!');
    console.log(`📊 Added ${seedEvents.length} events to the database`);
    
    const events = await Event.find().sort({ priority: -1, date: 1 });
    console.log('\n📅 Events in database:');
    events.forEach(event => {
      console.log(`  - ${event.title} (${event.date}) - ${event.status}`);
    });
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    process.exit(1);
  }
}

// Run if this file is executed directly
if (import.meta.url === `file://${process.argv[1]}`) {
  seedDatabase();
}

export default seedDatabase;
import { connectDatabase } from '../config/database.js';
import { Event } from '../models/Event.js';
import dotenv from 'dotenv';

dotenv.config();

const seedEvents = [
  {
    title: "Welcome Seminar: Introduction to Nüshu",
    date: new Date("2025-03-14"),
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
    date: new Date("2025-03-25"),
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
    date: new Date("2025-04-12"),
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
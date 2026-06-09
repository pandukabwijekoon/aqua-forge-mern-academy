import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const dbFilePath = path.join(__dirname, '..', 'aquaforge_db.json');

// Helper to read database file
const readData = () => {
  try {
    if (!fs.existsSync(dbFilePath)) {
      const defaultData = { users: [], coaches: [], bookings: [] };
      fs.writeFileSync(dbFilePath, JSON.stringify(defaultData, null, 2), 'utf-8');
      return defaultData;
    }
    const data = fs.readFileSync(dbFilePath, 'utf-8');
    return JSON.parse(data);
  } catch (err) {
    console.error('Error reading mock database:', err);
    return { users: [], coaches: [], bookings: [] };
  }
};

// Helper to write database file
const writeData = (data) => {
  try {
    fs.writeFileSync(dbFilePath, JSON.stringify(data, null, 2), 'utf-8');
  } catch (err) {
    console.error('Error writing to mock database:', err);
  }
};

// Generate random UUID-like string
const generateId = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

export const MockUser = {
  find: async () => {
    const data = readData();
    return data.users;
  },
  findOne: async (query) => {
    const data = readData();
    return data.users.find(u => {
      for (let key in query) {
        if (u[key] !== query[key]) return false;
      }
      return true;
    }) || null;
  },
  findById: async (id) => {
    const data = readData();
    return data.users.find(u => u._id === id) || null;
  },
  create: async (userData) => {
    const data = readData();
    const newUser = {
      _id: generateId(),
      role: 'swimmer',
      profiles: [],
      createdAt: new Date().toISOString(),
      ...userData
    };
    data.users.push(newUser);
    writeData(data);
    return newUser;
  },
  findByIdAndUpdate: async (id, updateData) => {
    const data = readData();
    const index = data.users.findIndex(u => u._id === id);
    if (index === -1) return null;
    data.users[index] = { ...data.users[index], ...updateData };
    writeData(data);
    return data.users[index];
  },
  deleteMany: async (query) => {
    const data = readData();
    if (!query || Object.keys(query).length === 0) {
      const deletedCount = data.users.length;
      data.users = [];
      writeData(data);
      return { deletedCount };
    }
    const beforeCount = data.users.length;
    data.users = data.users.filter(u => {
      for (let key in query) {
        if (u[key] === query[key]) return false;
      }
      return true;
    });
    writeData(data);
    return { deletedCount: beforeCount - data.users.length };
  }
};

export const MockCoach = {
  find: async () => {
    const data = readData();
    return data.coaches;
  },
  findOne: async (query) => {
    const data = readData();
    return data.coaches.find(c => {
      for (let key in query) {
        if (c[key] !== query[key]) return false;
      }
      return true;
    }) || null;
  },
  findById: async (id) => {
    const data = readData();
    return data.coaches.find(c => c._id === id) || null;
  },
  create: async (coachData) => {
    const data = readData();
    const newCoach = {
      _id: generateId(),
      ...coachData
    };
    data.coaches.push(newCoach);
    writeData(data);
    return newCoach;
  },
  insertMany: async (coachesArray) => {
    const data = readData();
    const seeded = [];
    for (let c of coachesArray) {
      const newCoach = { _id: generateId(), ...c };
      data.coaches.push(newCoach);
      seeded.push(newCoach);
    }
    writeData(data);
    return seeded;
  },
  deleteMany: async () => {
    const data = readData();
    data.coaches = [];
    writeData(data);
    return { deletedCount: 0 };
  }
};

export const MockBooking = {
  find: async (query) => {
    const data = readData();
    const bookings = data.bookings.filter(b => {
      for (let key in query) {
        if (b[key] !== query[key]) return false;
      }
      return true;
    });
    
    // Custom populate implementation
    return bookings.map(b => {
      const coach = data.coaches.find(c => c._id === b.coach) || null;
      const user = data.users.find(u => u._id === b.user) || null;
      return { ...b, coach, user };
    });
  },
  findOne: async (query) => {
    const data = readData();
    const booking = data.bookings.find(b => {
      // 1. Support $or Queries
      if (query.$or && Array.isArray(query.$or)) {
        return query.$or.some(subQuery => {
          for (let key in subQuery) {
            const queryVal = subQuery[key];
            const dbVal = b[key];

            // Resolve $in checks
            if (queryVal && typeof queryVal === 'object' && queryVal.$in) {
              if (!queryVal.$in.includes(dbVal)) return false;
            } else if (key === 'date') {
              if (new Date(queryVal).getTime() !== new Date(dbVal).getTime()) return false;
            } else if (key === 'coach' || key === 'user') {
              const queryId = queryVal && queryVal.toString ? queryVal.toString() : queryVal;
              const dbId = dbVal && dbVal.toString ? dbVal.toString() : dbVal;
              if (dbId !== queryId) return false;
            } else {
              if (dbVal !== queryVal) return false;
            }
          }
          return true;
        });
      }

      // 2. Standard queries
      for (let key in query) {
        const queryVal = query[key];
        const dbVal = b[key];
        
        if (queryVal && typeof queryVal === 'object' && queryVal.$in) {
          if (!queryVal.$in.includes(dbVal)) return false;
        } else if (key === 'date') {
          if (new Date(queryVal).getTime() !== new Date(dbVal).getTime()) return false;
        } else {
          if (dbVal !== queryVal) return false;
        }
      }
      return true;
    });

    if (!booking) return null;
    const coach = data.coaches.find(c => c._id === booking.coach) || null;
    const user = data.users.find(u => u._id === booking.user) || null;
    return { ...booking, coach, user };
  },
  findById: async (id) => {
    const data = readData();
    const booking = data.bookings.find(b => b._id === id);
    if (!booking) return null;
    const coach = data.coaches.find(c => c._id === booking.coach) || null;
    return { ...booking, coach };
  },
  create: async (bookingData) => {
    const data = readData();
    const newBooking = {
      _id: generateId(),
      status: 'Pending_Approval',
      createdAt: new Date().toISOString(),
      ...bookingData
    };
    data.bookings.push(newBooking);
    writeData(data);
    
    // Return populated
    const coach = data.coaches.find(c => c._id === newBooking.coach) || null;
    return { ...newBooking, coach };
  },
  findByIdAndUpdate: async (id, updateData, options) => {
    const data = readData();
    const index = data.bookings.findIndex(b => b._id === id);
    if (index === -1) return null;
    data.bookings[index] = { ...data.bookings[index], ...updateData };
    writeData(data);
    
    const booking = data.bookings[index];
    const coach = data.coaches.find(c => c._id === booking.coach) || null;
    return { ...booking, coach };
  }
};

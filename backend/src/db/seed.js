require('dotenv').config({ path: require('path').resolve(__dirname, '../../.env') });
const mongoose = require('mongoose');
const User = require('../models/User');
const Project = require('../models/Project');
const ProjectMember = require('../models/ProjectMember');
const Task = require('../models/Task');
const RefreshToken = require('../models/RefreshToken');

async function seed() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    // Clear existing data
    await Promise.all([
      User.deleteMany({}),
      Project.deleteMany({}),
      ProjectMember.deleteMany({}),
      Task.deleteMany({}),
      RefreshToken.deleteMany({}),
    ]);
    console.log('Cleared existing data');

    // Create users (password hashing handled by pre-save hook)
    const admin = await User.create({ name: 'Admin User', email: 'admin@demo.com', password: 'Admin@1234', role: 'ADMIN' });
    const alice = await User.create({ name: 'Alice Johnson', email: 'alice@demo.com', password: 'Member@1234', role: 'MEMBER' });
    const bob = await User.create({ name: 'Bob Smith', email: 'bob@demo.com', password: 'Member@1234', role: 'MEMBER' });
    const carol = await User.create({ name: 'Carol Williams', email: 'carol@demo.com', password: 'Member@1234', role: 'MEMBER' });
    console.log('Created 4 users');

    // Create projects
    const p1 = await Project.create({ name: 'E-Commerce Platform', description: 'A full-featured online marketplace with payment integration, inventory management, and real-time analytics.', owner: admin._id });
    const p2 = await Project.create({ name: 'Mobile App', description: 'Cross-platform mobile application built with React Native for iOS and Android deployment.', owner: admin._id });
    const p3 = await Project.create({ name: 'AI Dashboard', description: 'Interactive dashboard for monitoring AI model performance, training metrics, and real-time predictions.', owner: admin._id });
    console.log('Created 3 projects');

    // Add members
    const allProjects = [p1, p2, p3];
    const allMembers = [alice, bob, carol];
    for (const p of allProjects) {
      await ProjectMember.create({ user: admin._id, project: p._id, role: 'ADMIN' });
      for (const m of allMembers) {
        await ProjectMember.create({ user: m._id, project: p._id, role: 'MEMBER' });
      }
    }
    console.log('Added project members');

    // Create tasks
    const now = Date.now();
    const day = 24 * 60 * 60 * 1000;

    const tasksData = [
      // E-Commerce (p1) — 5 tasks
      { title: 'Design Database Schema', description: 'Create the ER diagram and define all tables for the e-commerce platform.', status: 'DONE', priority: 'HIGH', dueDate: new Date(now - 5 * day), project: p1._id, assignee: alice._id, creator: admin._id },
      { title: 'Setup Payment Gateway', description: 'Integrate Stripe API for handling payments and subscriptions.', status: 'IN_PROGRESS', priority: 'URGENT', dueDate: new Date(now + 2 * day), project: p1._id, assignee: bob._id, creator: admin._id },
      { title: 'Build Product Listing Page', description: 'Create responsive product grid with filtering and sorting.', status: 'TODO', priority: 'MEDIUM', dueDate: new Date(now + 7 * day), project: p1._id, assignee: carol._id, creator: admin._id },
      { title: 'Implement User Authentication', description: 'Set up JWT-based auth with login, register, and password reset.', status: 'IN_REVIEW', priority: 'HIGH', dueDate: new Date(now - 1 * day), project: p1._id, assignee: alice._id, creator: admin._id },
      { title: 'Shopping Cart Logic', description: 'Build add-to-cart, update quantity, and remove item features.', status: 'TODO', priority: 'LOW', dueDate: new Date(now + 14 * day), project: p1._id, assignee: null, creator: admin._id },

      // Mobile App (p2) — 4 tasks
      { title: 'iOS App Setup', description: 'Initialize the React Native project and configure for iOS builds.', status: 'IN_REVIEW', priority: 'HIGH', dueDate: new Date(now - 3 * day), project: p2._id, assignee: alice._id, creator: admin._id },
      { title: 'Android App Setup', description: 'Configure Android build tools and test on emulator.', status: 'IN_PROGRESS', priority: 'MEDIUM', dueDate: new Date(now + 5 * day), project: p2._id, assignee: bob._id, creator: admin._id },
      { title: 'Push Notifications', description: 'Implement Firebase push notifications for both platforms.', status: 'TODO', priority: 'MEDIUM', dueDate: new Date(now + 10 * day), project: p2._id, assignee: alice._id, creator: admin._id },
      { title: 'App Store Submission', description: 'Prepare screenshots, descriptions and submit to stores.', status: 'TODO', priority: 'LOW', dueDate: new Date(now + 30 * day), project: p2._id, assignee: null, creator: admin._id },

      // AI Dashboard (p3) — 3 tasks
      { title: 'ML Model Training Pipeline', description: 'Build automated training pipeline with hyperparameter tuning.', status: 'DONE', priority: 'URGENT', dueDate: new Date(now - 7 * day), project: p3._id, assignee: carol._id, creator: admin._id },
      { title: 'Data Pipeline Setup', description: 'Configure ETL process for streaming data into the analytics engine.', status: 'IN_PROGRESS', priority: 'HIGH', dueDate: new Date(now - 2 * day), project: p3._id, assignee: admin._id, creator: admin._id },
      { title: 'Real-time Metrics Display', description: 'Build live-updating charts for model accuracy, loss, and throughput.', status: 'TODO', priority: 'MEDIUM', dueDate: new Date(now + 3 * day), project: p3._id, assignee: bob._id, creator: admin._id },
    ];

    await Task.insertMany(tasksData);
    console.log(`Created ${tasksData.length} tasks`);

    console.log('\n✅ Seed completed successfully!');
    console.log('\nDemo credentials:');
    console.log('  Admin: admin@demo.com / Admin@1234');
    console.log('  Alice: alice@demo.com / Member@1234');
    console.log('  Bob:   bob@demo.com   / Member@1234');
    console.log('  Carol: carol@demo.com / Member@1234');
  } catch (err) {
    console.error('Seed failed:', err);
  } finally {
    await mongoose.disconnect();
  }
}

seed();

const connectDB = require('../config/db');
const mongoose = require('mongoose');
const Job = require('../models/Job');
const Match = require('../models/Match');

(async () => {
  try {
    await connectDB();
    const jobs = await Job.find();
    console.log('Jobs to delete:', jobs.length);
    const jobIds = jobs.map(j => j._id);

    // remove matches referencing these jobs
    const rmMatches = await Match.deleteMany({ jobId: { $in: jobIds } });
    console.log('Deleted matches:', rmMatches.deletedCount);

    const rmJobs = await Job.deleteMany({ _id: { $in: jobIds } });
    console.log('Deleted jobs:', rmJobs.deletedCount);

    await mongoose.connection.close();
    console.log('Done.');
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();

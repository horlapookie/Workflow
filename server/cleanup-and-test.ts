import mongoose from 'mongoose';
import { config } from './config';
import { User, Bot } from './db';

async function cleanupAndTest() {
  try {
    await mongoose.connect(config.mongodb.uri);
    console.log('Connected to MongoDB');

    // Delete all bots
    const result = await Bot.deleteMany({});
    console.log(`Deleted ${result.deletedCount} bots from database`);

    // Delete the Pterodactyl server (ID 61) 
    console.log('Deleting Pterodactyl server ID 61...');
    const deleteResponse = await fetch(
      `${config.pterodactyl.url}/api/application/servers/61`,
      {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${config.pterodactyl.apiKey}`,
          'Accept': 'application/json',
        },
      }
    );

    if (deleteResponse.ok) {
      console.log('✅ Pterodactyl server deleted successfully');
    } else {
      console.log('Server might already be deleted or error:', deleteResponse.status);
    }

    await mongoose.disconnect();
    console.log('\n✅ Cleanup completed! Now you can test a new deployment.');
  } catch (error) {
    console.error('Error during cleanup:', error);
    process.exit(1);
  }
}

cleanupAndTest();

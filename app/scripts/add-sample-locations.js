const { sequelize, Location, Category } = require('../src/models');

async function addSampleLocations() {
  try {
    console.log('Adding sample locations and updating categories...');

    // Update categories with GST rates
    await Category.update({ gstRate: 5.00 }, { where: { id: 1 } }); // Pizza - 5% GST
    await Category.update({ gstRate: 5.00 }, { where: { id: 2 } }); // Noodles - 5% GST
    await Category.update({ gstRate: 5.00 }, { where: { id: 3 } }); // Burgers - 5% GST
    console.log('✓ Updated category GST rates');

    // Add sample locations in Chandigarh
    const locations = [
      {
        id: 1,
        name: 'Sector 15',
        area: 'Sector 15',
        city: 'Chandigarh',
        pincode: '160015',
        deliveryCharge: 30,
        estimatedDeliveryTime: 25,
        isAvailable: true,
      },
      {
        id: 2,
        name: 'Sector 17',
        area: 'Sector 17',
        city: 'Chandigarh',
        pincode: '160017',
        deliveryCharge: 35,
        estimatedDeliveryTime: 30,
        isAvailable: true,
      },
      {
        id: 3,
        name: 'Sector 22',
        area: 'Sector 22',
        city: 'Chandigarh',
        pincode: '160022',
        deliveryCharge: 40,
        estimatedDeliveryTime: 30,
        isAvailable: true,
      },
      {
        id: 4,
        name: 'Sector 26',
        area: 'Sector 26',
        city: 'Chandigarh',
        pincode: '160026',
        deliveryCharge: 45,
        estimatedDeliveryTime: 35,
        isAvailable: true,
      },
      {
        id: 5,
        name: 'Sector 35',
        area: 'Sector 35',
        city: 'Chandigarh',
        pincode: '160035',
        deliveryCharge: 50,
        estimatedDeliveryTime: 35,
        isAvailable: true,
      },
      {
        id: 6,
        name: 'Sector 43',
        area: 'Sector 43',
        city: 'Chandigarh',
        pincode: '160043',
        deliveryCharge: 55,
        estimatedDeliveryTime: 40,
        isAvailable: true,
      },
      {
        id: 7,
        name: 'Mohali Phase 7',
        area: 'Phase 7',
        city: 'Mohali',
        pincode: '160062',
        deliveryCharge: 60,
        estimatedDeliveryTime: 45,
        isAvailable: true,
      },
      {
        id: 8,
        name: 'Panchkula Sector 12',
        area: 'Sector 12',
        city: 'Panchkula',
        pincode: '134112',
        deliveryCharge: 65,
        estimatedDeliveryTime: 45,
        isAvailable: true,
      },
    ];

    for (const locationData of locations) {
      await Location.upsert(locationData);
    }
    console.log('✓ Added sample locations');

    console.log('\n✅ Sample locations added successfully!');
    console.log('\nSummary:');
    console.log(`- ${locations.length} delivery locations`);
    console.log('- GST rates updated for all categories (5%)');
    console.log('\nLocations:');
    locations.forEach(loc => {
      console.log(`  - ${loc.name}: ₹${loc.deliveryCharge} delivery, ~${loc.estimatedDeliveryTime} mins`);
    });

    process.exit(0);
  } catch (error) {
    console.error('Error adding sample locations:', error);
    process.exit(1);
  }
}

addSampleLocations();


// Calculate distance between two coordinates using Haversine formula
export function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Earth's radius in kilometers
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  
  const a = 
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const distance = R * c;
  
  return distance; // Distance in kilometers
}

function toRad(degrees) {
  return degrees * (Math.PI / 180);
}

// Calculate delivery fee based on distance and settings
export function calculateDeliveryFee(distance, orderTotal, settings) {
  if (!settings) {
    // Fallback to old logic
    return orderTotal >= 500 ? 0 : 50;
  }

  // Within free delivery radius
  if (distance <= settings.free_delivery_radius_km) {
    // Check if order meets minimum
    if (orderTotal >= settings.min_order_for_free_delivery) {
      return 0;
    }
    // Within radius but below minimum order
    return settings.base_delivery_fee;
  }

  // Outside radius - charge based on distance
  const extraDistance = distance - settings.free_delivery_radius_km;
  const distanceFee = Math.ceil(extraDistance) * settings.per_km_charge;
  return settings.base_delivery_fee + distanceFee;
}

// Find nearest shop location
export function findNearestShop(customerLat, customerLon, shopLocations) {
  if (!shopLocations || shopLocations.length === 0) {
    return null;
  }

  let nearestShop = null;
  let minDistance = Infinity;

  shopLocations.forEach(shop => {
    if (shop.latitude && shop.longitude) {
      const distance = calculateDistance(
        customerLat, 
        customerLon, 
        shop.latitude, 
        shop.longitude
      );
      
      if (distance < minDistance) {
        minDistance = distance;
        nearestShop = { shop, distance };
      }
    }
  });

  return nearestShop;
}
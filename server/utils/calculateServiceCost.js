export const calculateServiceCost = (services) => {
  // Assuming 'services' is an array of objects: { name: 'Oil Change', cost: 1500 }
  if (!services || services.length === 0) return 0;
  
  return services.reduce((total, service) => total + (service.cost || 0), 0);
};

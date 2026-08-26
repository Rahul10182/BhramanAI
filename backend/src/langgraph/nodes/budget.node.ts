import { PlannerStateAnnotation } from "../state/planner.state.js";
export const budgetNode = async (state: typeof PlannerStateAnnotation.State) => {
    console.log("💰 [Node: Budget] Calculating total estimated cost...");
    
    let totalCost = 0;
    
    // Sum flight costs
    const flightsCost = state.selectedFlights?.reduce((sum: number, flight: any) => sum + (flight.price || flight.estimatedCost || 0), 0) || 0;
    
    // Sum hotel costs (Assume price is per night if totalPrice is not available)
    const totalDays = state.tripContext.totalDays || 1;
    const hotelsCost = state.selectedHotels?.reduce((sum: number, hotel: any) => {
        const cost = hotel.totalPrice || (hotel.pricePerNight * totalDays) || hotel.estimatedCost || 0;
        return sum + cost;
    }, 0) || 0;
    
    // Sum activities costs
    const activitiesCost = state.selectedActivities?.reduce((sum: number, activity: any) => sum + (activity.estimatedCost || activity.price || 0), 0) || 0;
    
    // Sum food costs
    const foodCost = state.selectedFood?.reduce((sum: number, food: any) => sum + (food.estimatedCost || food.averageCost || 0), 0) || 0; 
    
    totalCost = flightsCost + hotelsCost + activitiesCost + foodCost;

    console.log(`💵 Estimated Total Cost: ${totalCost} ${state.tripContext.baseCurrency}`);
    
    return {
        estimatedCost: totalCost
    } as any;
};

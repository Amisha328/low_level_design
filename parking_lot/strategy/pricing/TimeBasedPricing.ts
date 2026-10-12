import { PricingStrategy } from "./PricingStrategy";
import { VehicleType } from "../../enums/VehicleType";

/*
So the full logic is:
Same-day session → 1 iteration of the day-loop → 1 application of the overlap formula → done
Multi-day session → N iterations (one per calendar day touched) → sum the overlaps from each day

Hence, day loop is better than the one hour loop
*/

export class TimeBasedPricing implements PricingStrategy{

    // Peak period hours (e.g., 9:00 to 17:00)
    private readonly peakStart: number = 9;
    private readonly peakEnd: number = 17;

    private countPeakHours(entryTime: Date, exitTime: Date){
        let totalPeakMs = 0;

        // Start at midnight of the entry day, so we can walk day-by-day
        const currentDay = new Date(entryTime);
        currentDay.setHours(0, 0, 0, 0);

        while(currentDay <= exitTime){
             // Build today's peak window: 9:00 AM to 5:00 PM on this calendar day
             const dayPeakStart = new Date(currentDay);
             dayPeakStart.setHours(this.peakStart, 0, 0, 0);

             const dayPeakEnd = new Date(currentDay);
             dayPeakEnd.setHours(this.peakEnd, 0, 0, 0);

             // Overlap
             const overlapEnd = Math.min(exitTime.getTime(), dayPeakEnd.getTime());
             const overlapStart = Math.max(entryTime.getTime(), dayPeakStart.getTime());
             const overlapMs = Math.max(0, overlapEnd - overlapStart);

             totalPeakMs += overlapMs;
            
             // Move to the next day
             currentDay.setDate(currentDay.getDate() + 1);
        }

        return totalPeakMs / (1000 * 60 * 60); // convert ms → hours
    }
    public computeFee(vehicleType: VehicleType, entryTime: Date, exitTime: Date): number {

        if(exitTime < entryTime) throw new Error("Exit time can't be before entry time");
        
        /*
        let peakHours = 0, nonPeakHours = 0;
        
        // Create a tracking variable starting at the entry time
        let currentTrackTime = new Date(entryTime.getTime());

        // Loop forward 1 hour at a time until we pass the exit time
        while(currentTrackTime < exitTime){
            let currentHour = currentTrackTime.getHours();

            // Check if the current hour is between 9 AM and 5 PM (09:00 - 17:00)
            if(currentHour >= this.peakStart && currentHour < this.peakEnd){
                peakHours++;
            } else {
                nonPeakHours++;
            }

            currentTrackTime.setHours(currentTrackTime.getHours() + 1);
        }

        // Ensure minimum 1 hour billing if total parking duration is under 1 hour
        if (peakHours === 0 && nonPeakHours === 0) {
            nonPeakHours = 1;
        }
        */

        const totalMs = exitTime.getTime() - entryTime.getTime();
        const peakHoursExact = this.countPeakHours(entryTime, exitTime);

        const totalBillableHours = Math.max(1, Math.ceil(totalMs / (1000 * 60 * 60)));
        const peakHours = Math.round(peakHoursExact);
        const nonPeakHours = totalBillableHours - peakHours;    


        const peakRate = this.getPeakRate(vehicleType);
        const nonPeakRate = this.getNonPeakRate(vehicleType);

        return peakHours * peakRate + nonPeakHours * nonPeakRate;
    }

    private getPeakRate(vehicleType: VehicleType): number {
    switch (vehicleType) {
      case VehicleType.BIKE:
        return 20.0;
      case VehicleType.CAR:
        return 50.0;
      case VehicleType.BUS:
        return 100.0;
      default:
        return 0.0;
    }
  }

  private getNonPeakRate(vehicleType: VehicleType): number {
    switch (vehicleType) {
      case VehicleType.BIKE:
        return 10.0;
      case VehicleType.CAR:
        return 40.0;
      case VehicleType.BUS:
        return 80.0;
      default:
        return 0.0;
    }
  }
}
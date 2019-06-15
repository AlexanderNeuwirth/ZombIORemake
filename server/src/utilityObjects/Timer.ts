export class ZIRTimer {
    private static startTimes: {[id: string]: number} = {};
    private static loggedTimes: {[id: string]: number[]} = {};
    private static loggedCounts: {[id: string]: number} = {};
    private static metadata: {[id: string]: IZIRTimerMetadata} = {};
    private static timingEnabled = true;

    public static start(id: string, parent?: string) {
        if(this.timingEnabled) {
            this.startTimes[id] = this.getNanoTime();
            this.metadata[id] = {parent: parent, type: "time"};
        }
    }

    public static stop(id: string) {
        if(this.timingEnabled) {

            if(this.startTimes[id]) {
                const dt = this.getNanoTime() - this.startTimes[id]
                if(!this.loggedTimes[id]) {
                    this.loggedTimes[id] = [dt];
                } else {
                    this.loggedTimes[id][0] += dt;
                }
                delete this.startTimes[id];
            } else {
                throw new Error("Cannot stop timer that was not started. ID: " + id);
            }
        }
    }

    public static count(data: number, id: string, parent?: string) {
        if (this.timingEnabled) {
            this.metadata[id] = {parent: parent, type: "count"};
            if(!this.loggedCounts[id]) {
                this.loggedCounts[id] = data;
            } else {
                this.loggedCounts[id] += data;
            }
        }
    }

    public static pullLoggedTimes(): {[id: string]: number[]} {
        const temp = this.loggedTimes;
        this.loggedTimes = {};
        return temp;
    }

    public static pullLoggedCounts(): {[id: string]: number} {
        const temp = this.loggedCounts;
        this.loggedCounts = {};
        return temp;
    }

    public static pullLoggedMetadata(): {[id: string]: IZIRTimerMetadata} {
        const temp = this.metadata;
        this.metadata = {};
        return temp;
    }

    public static disableTiming() {
        this.timingEnabled = false;
    }

    public static getNanoTime(): number {
        var hrTime = process.hrtime();
        return hrTime[0] * 1000000000 + hrTime[1];
      }
}

export interface IZIRTimerMetadata {
    parent: string;
    type: string;
}
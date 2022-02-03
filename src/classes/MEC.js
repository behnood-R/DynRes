export default class MEC {
    constructor(id, messageConfigs, rateMaps){
        this.id = id;
        this.rateMaps = rateMaps;
        this.server = {};
        this.buffer = {};
        this.lambda = {};
        messageConfigs.forEach((_,i) => {
            this.server[`type-${i}`] = [];
            this.buffer[`type-${i}`] = [];
            this.lambda[`type-${i}`] = [];
        });
    }
}
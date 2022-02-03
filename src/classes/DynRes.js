import { randomInt } from 'mathjs';
import { getRndInteger, sum } from '../utils';
import Message from './Message';
// {
//     messageSize: 10,
//     tw: rand(8,10)
// }
export default class DynRes{
    constructor(totalRun, messageConfigs = [], MECs = []){
        this.MECs = MECs;
        this.messageConfigs = messageConfigs;
        this.totalRun = totalRun;
        messageConfigs.forEach((messageConfig, i) => {
            this[`buffer-${i}`] = {
                messages: [],
            };
        });
    }

    simulateMessages (config, id) {
        const { messageSize, r, xl } = config;
        const totalMessages = randomInt(0, 10);
        for (let index = 0; index < totalMessages; index++) {
            this[`buffer-${id}`].messages.push(new Message({
                messageSize, 
                xh: getRndInteger(8, 10),
                xl,
                r,
            }))
        }
    }

    run(){
        for (let run = 0; run < this.totalRun; run++) {
            this.messageConfigs.forEach((messageConfig, i) => {
                this.simulateMessages(messageConfig, i);
            });
            const tMDP = this.gettMDP(this.messageConfigs, this.MECs);
            const s = Array.from({length: this.messageConfigs.length * this.MECs.length}, e => Array(2).fill(0));
            const qs = 0;
            const valueFunctionArrivalList = []
            const valueFunctionDepartureList = []
            const valueFunctionList = []
            for (let indexMessageType = 0; indexMessageType < this.messageConfigs.length; indexMessageType++) {
                const { r } = this.messageConfigs[indexMessageType];
                const buffer = this[`buffer-${indexMessageType}`];
                const currentsmu = this.currentsmu(this.MECs, indexMessageType);
                const qsMessageType = r * currentsmu;
                const valueFunction = qsMessageType * tMDP
                for (let indexMessage = 0; indexMessage < buffer.messages.length; indexMessage++) {
                    const message = buffer.messages[indexMessage];
                    // const GList = [];
                    // for (let indexMEC = 0; indexMEC < this.MECs.length; indexMEC++) {
                    //     const MEC = this.MECs[indexMEC];
                    //     const mu = MEC.rateMaps.filter(x=>x.MessageTypeId === indexMessage)[0].mu;
                    //     const r = message.r;
                    //     debugger;
                    // }
                }
            } 
        }
    }

    getGmax(){
        return 3;
    }
    gettMDP(messageConfigs, MECs){
        const sumLambda = sum(messageConfigs.map(messageConfig=>{
            return messageConfig.totalMessages * messageConfig.messageSize
        }));
        const sumMu = sum(MECs.map(MEC=>sum(MEC.rateMaps.map(x=>x.mu))))
        return 1 / (sumLambda + sumMu);
    }
    currentsmu(MECs, indexMessageType){
        return sum(MECs.map(MEC=>{
            const mu = MEC.rateMaps.filter(x=>x.MessageTypeId===indexMessageType)[0].mu
            const countBuffer = MEC.buffer[`type-${indexMessageType}`].length
            const countServer = MEC.server[`type-${indexMessageType}`].length
            return (countBuffer + countServer) * mu;
        }))
    }
}
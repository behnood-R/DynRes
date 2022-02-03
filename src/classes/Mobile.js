import { getFraction, getRandWithP, getRndInteger, makeSequence, subtractString, sum, im } from "../utils";
import * as math from 'mathjs';
import Matrix from '../matrix';
import Message from "./Message";

export default class Mobile{
    constructor(id){
        this.id = id;
        this.messages = [];
    }
    send(message){
        console.log(this.id, this.serverId, message.creation);
    }
    allocateServer(id){
        this.serverId = id;
        this.serverMu = {
            't1': 5,
            't2': 10,
        }
    }
    exec(){
        return message.size * 15;
    }
    generateMessage(creation){
        const message = new Message(creation);
        this.messages.push(message);
        return message;
    }
    runS1(){
        const config = {
            tc: 0, 
            D: 10 * Math.pow(10, 6),
            FMD: 1 * Math.pow(10, 6), 
            VcpuMD: 2 * Math.pow(10, -6),
            runtime: 100,
            tComp: 60,
            messageSize: 50,
            Bmax: 2,
            Bmin: 1,
            Ptrans: 1,
            Ptoffloads: 0.8,
            TOffload: 10,
            Pbb: 0.8,
            Pgg: 0.2,
            Pgb: 0.8,
            Pbg: 0.2,
            tw: 0 + 1, // tc + 1
        }
        
        const message = this.generateMessage(config);

        console.log('-------------OfflineBound-------------')

        const PtList = [];
        const PMDexeList = [];

        // time changes over simulation
        for (let t = 1; t <= config.runtime; t++) {

            let Pt = 0;
            if(t < message.tMDExe){
                Pt = message.Ptrans;
            } else {
                Pt = message.Ptrans +  (message.PMDt/message.TMDExe)
            }
            PtList.push({t, value: Pt});
            
            // calculation of PMDexe
            let PMDexe = 0;
            const Poffload = 0;
            if(t >= 1 && t < message.tMDExe){
                const tmp = [];
                for (let Toffload = message.tMDExe - t + 1; Toffload < Math.ceil(message.size / message.Bmin); Toffload++) {
                    tmp.push((message.Ptoffloads * (Math.min(message.tComp + 1, t + Toffload)-message.tMDExe) / message.TMDExe)*message.PMDt)
                }
                PMDexe = sum(tmp);
            } else if(t>= message.tMDExe && t < message.tComp){
                const tmp = [];
                for (let Toffload =Math.ceil(message.size / message.Bmax); Toffload < Math.ceil(message.size / message.Bmin); Toffload++) {
                    tmp.push((message.Ptoffloads * (Math.min(message.tComp + 1, t + Toffload)-message.tMDExe) / message.TMDExe)*message.PMDt)
                }
                PMDexe = sum(tmp);
            } else {
                PMDexe = message.PMDt;
            }
            
            // calculation of Poffload
            if(t>= 1 && t< message.tComp - (message.size/message.Bmin) + 1){
                const tmp = []
                for (let Toffload = Math.ceil(message.size / message.Bmax); Toffload < Math.ceil(message.size / message.Bmin); Toffload++) {
                    tmp.push(message.Ptoffloads*message.TOffload)
                }
                Poffload = sum(tmp);
            } else if(t>=message.tComp - (message.size/message.Bmin) + 1 && t< message.tComp){
                const tmp1 = [];
                const tmp2 = [];
                for (let Toffload = Math.ceil(message.size / message.Bmax); Toffload < message.tComp - t; Toffload++) {
                    tmp1.push(message.Ptoffloads*message.TOffload)
                }
                for (let Toffload = message.tComp - t + 1; Toffload < Math.ceil(message.size / message.Bmin); Toffload++) {
                    tmp2.push(message.Ptoffloads*(message.tComp - t + 1))
                }
                Poffload = sum(tmp1) + sum(tmp2);
            } else {
                Poffload = 0;
            }

            console.log('t => ', t);
            console.log('-----------PMDexe----------------')
            console.log('1:', `${t} >= 1 && ${t} < ${message.tMDExe}`)
            console.log('2:', `${t} >= ${message.tMDExe} && ${t} < ${message.tComp}`)
            console.log('3:', `${t} >= ${message.tComp}`)
            console.log('PMDexe', PMDexe)
            PMDexeList.push({t, value: PMDexe});
            console.log('-----------Poffload----------------')
            console.log('1:', `${t}>=${message.tComp - (message.size/message.Bmin) + 1} && ${t}< ${message.tComp}`)
            console.log('2:', `${t}>=${message.tComp - (message.size/message.Bmin) + 1} && ${t< message.tComp}`)
            console.log('3:', `${t}>= ${message.tComp}`)
            console.log('Poffload', Poffload)
        }

        const mintwList = []

        for (let twCalc = 1; twCalc <= message.tComp; twCalc++) {
            const PtList_tw_tOffTw =  PtList.filter(x=>x.t >= twCalc && x.t <= twCalc + 10).map(x=>x.value).reduce((a, b)=>a+b)

            const p1 = (((Math.max(message.tw, message.tMDExe) - message.tMDExe)/message.TMDExe) * message.PMDt) + PtList_tw_tOffTw
            if(p1<message.PMDt){
                mintwList.push({t: twCalc, value: p1})
            }
        }
        console.log('-----------mintwList----------------')
        console.log( )

        // make decision
        const minValue_mintwList = Math.min(...mintwList.map(x=>x.value));
        const filtered_mintwList = mintwList.filter(x=>x.value === minValue_mintwList);
        const index =getRndInteger(0, filtered_mintwList.length - 1)
        const offlineBoundDecision = filtered_mintwList[index]
        console.log('offlineBoundDecision', offlineBoundDecision)
        message.twActAlgOfflineBound = offlineBoundDecision.t;

    }
    runS2(){
        const config = {
            tc: 0, 
            D: 10 * Math.pow(10, 6),
            FMD: 1 * Math.pow(10, 6), 
            VcpuMD: 2 * Math.pow(10, -6),
            runtime: 10,
            tComp: 10,
            messageSize: 5,
            Bmax: 2,
            Bmin: 1,
            Ptrans: 1,
            Pbb: 0.8,
            Pgg: 0.2,
            Pgb: 0.8,
            Pbg: 0.2,
        }

        const message = this.generateMessage(config);

        console.log('-------------TDAMC-------------')
        let sequence = makeSequence(message.Bmax,message.Bmin,message.size)
        console.log('---------------sequence---------------');
        console.log(sequence);
        let matrix = Array.from({length: sequence.length}, e => Array(sequence.length).fill(0));;
        for (let i = 0; i < sequence.length; i++) {
            for (let j = 0; j < sequence.length; j++) {
                const rowIndex = sequence[i];
                const valueRowTotalSize= this.getTotalSize(rowIndex, message.Bmax, message.Bmin);
                const columnIndex = sequence[j];
                if(valueRowTotalSize>=message.size&&rowIndex===columnIndex){
                    matrix[i][j]=1;
                }
                if(valueRowTotalSize<message.size){
                    const val = subtractString(rowIndex, columnIndex,message.Pgg,message.Pbb,message.Pbg,message.Pgb)
                    matrix[i][j] = val;
                }
            }
        }
        const listOfIndexes = [];
        const listOfSequences = [];
        const listOfOnes = [];
        const listOfOthers = [];
        let lastIndex = 0;
        for (let index = 0; index < sequence.length; index++) {
            const hasOne = matrix[index].includes(1)
            if(hasOne){
                listOfIndexes.push(index);
                listOfSequences.push(sequence[index]);
                listOfOnes.push(sequence[index]);
                lastIndex = listOfIndexes.indexOf(index);
            }
        }
        for (let index = 0; index < sequence.length; index++) {
            const hasOne = matrix[index].includes(1)
            if(!hasOne){
                listOfOthers.push(sequence[index]);
                listOfIndexes.push(index);
                listOfSequences.push(sequence[index]);
            }
        }
        let matrixSorted = Array.from({length: sequence.length}, e => Array(sequence.length).fill(0));
        for (let i = 0; i < sequence.length; i++) {
            for (let j = 0; j < sequence.length; j++) {
                const oldi = listOfIndexes[i]
                const oldj = listOfIndexes[j]
                matrixSorted[i][j] = matrix[oldi][oldj];
            }
            
        }

        console.log('---------------listOfSequences---------------');
        console.log(listOfSequences);

        const matrix0 = new Matrix(...getFraction(matrixSorted,[0,lastIndex + 1],[lastIndex,matrixSorted.length - 1]))
        const matrixR = new Matrix(...getFraction(matrixSorted,[lastIndex + 1, 0],[matrixSorted.length - 1,lastIndex]))
        const matrixQ = new Matrix(...getFraction(matrixSorted,[lastIndex + 1,lastIndex + 1],[matrixSorted.length - 1,matrixSorted.length - 1]))
        const matrixQCount = matrixQ.rows.length;
        const matrixI = new Matrix(...im(matrixQCount))
        
        console.log(`---------listOfOnes----------`)
        console.log(listOfOnes)
        console.log(`---------listOfOthers----------`)
        console.log(listOfOthers)
        console.log(`---------matrixSorted----------`)
        console.log(matrixSorted)
        console.log(`---------matrixI from ${[0,0]} - ${[lastIndex,lastIndex]} ----------`)
        console.log(matrixI)
        console.log(`---------matrix0 from ${[0,lastIndex + 1]} - ${[lastIndex,matrixSorted.length - 1]} ----------`)
        console.log(matrix0)
        console.log(`---------matrixR from ${[lastIndex + 1, 0]} - ${[matrixSorted.length - 1,lastIndex]} ----------`)
        console.log(matrixR)
        console.log(`---------matrixQ from ${[lastIndex + 1,lastIndex + 1]} - ${[matrixSorted.length - 1,matrixSorted.length - 1]} ----------`)
        console.log(matrixQ)
        const matrixWC = listOfSequences.slice(0, lastIndex + 1);
        const matrixWR = listOfSequences.slice(lastIndex + 1, matrixSorted.length);
        console.log(`---------matrixWC----------`)
        console.log(matrixWC)
        console.log(`---------matrixWR----------`)
        console.log(matrixWR)

        const matrixN = math.inv(new math.matrix(matrixI.subtract(matrixQ).rows))
        console.log(`---------matrixN----------`)
        console.log(matrixN._data)

        const matrixW = math.multiply(matrixN, new math.matrix(matrixR.rows))
        console.log(`---------matrixW----------`)
        console.log(matrixW._data)

        const PMDexeList = [];
        const PoffloadList = [];
        // const STList = [];
        // let sActArr = [];
        for (let t = 1; t <= config.runtime; t++) {
            // const sArrItem = getRandWithP(message.Pgg*100);
            // if(t===1){
            //     sActArr.push(`1`);
            // } else {
            //     sActArr.push(`${sArrItem}`);
            // }
            // const s = sActArr.join('');
            // console.log('t',t);
            // console.log('s',s);
            // STList.push({[t]: s});
            
            // calculation of PMDexe
            const PMDexe = this.getPMDexe(t,message, matrixWC, matrixWR, matrixW);
            
            // calculation of Poffload
            const Poffload = this.getPoffload(t,message, matrixWC, matrixWR, matrixW);
            
            console.log('t => ', t);
            console.log('-----------PMDexe----------------')
            console.log('1:', `${t} >= 1 && ${t} < ${message.tMDExe}`)
            console.log('2:', `${t} >= ${message.tMDExe} && ${t} < ${message.tComp}`)
            console.log('3:', `${t} >= ${message.tComp}`)
            console.log('PMDexe', PMDexe)
            PMDexeList.push({t, value: PMDexe});
            console.log('-----------Poffload----------------')
            console.log('1:', `${t}>=${message.tComp - (message.size/message.Bmin) + 1} && ${t}< ${message.tComp}`)
            console.log('2:', `${t}>=${message.tComp - (message.size/message.Bmin) + 1} && ${t< message.tComp}`)
            console.log('3:', `${t}>= ${message.tComp}`)
            console.log('Poffload', Poffload);
            PoffloadList.push({t, value: Poffload});
        }
        // console.log(`---------STList----------`)
        // console.log(STList)
        console.log(`---------PMDexeList----------`)
        console.log(PMDexeList)
        console.log(`---------PoffloadList----------`)
        console.log(PoffloadList)

        const STActList = [];
        let sRealArr = [];
        let tw = Infinity;
        let isLocalExecutionStared = false;
        let messageSizeAct = message.size;
        let isOffloadBegin = false;
        for (let ts = 1; ts < message.tComp; ts++) {
            let sCurrent = 1;
            if(ts!==1){
                sCurrent = getRandWithP(message.Pgg*100);
            }
            sRealArr.push(`${sCurrent}`);
            const s = sRealArr.join('');
            STActList.push({[ts]: s});
            if(messageSizeAct>0 && isOffloadBegin ){
                let reduce = 0;
                if(sCurrent === 1){
                    reduce = message.Bmax
                } else {
                    reduce = message.Bmin
                }
                if(messageSizeAct-reduce>=0){
                    messageSizeAct -= reduce
                } else {
                    console.log(`offload finished 🤬 - ts: ${ts}`);
                    messageSizeAct = 0
                }
                
            }
            if(ts<tw){
                const PMDexets = this.getPMDexe(ts, message, matrixWC, matrixWR, matrixW, s);
                const Poffloadts = this.getPoffload(ts, message, matrixWC, matrixWR, matrixW, s);
                const Ets = PMDexets + Poffloadts;
                const getVmdt = (t, tcomp, message) => {
                    const PMDts = PMDexeList[t - 1].value;
                    const Poffloadts = PoffloadList[t - 1].value;
                    const gMDts = PMDts + Poffloadts;
                    if(t>=tcomp){
                        return message.PMDexe
                    } else {
                        const vmdt1 = getVmdt(t+1, tcomp, message)
                        const laststate = STActList[STActList.length-1][STActList.length]
                        const condition = `${laststate[t-1]}${laststate[t]}`
                        let p = 0
                        switch (condition) {
                            case '11':
                                p = message.Pgg;
                                break;
                            case '12':
                                p = message.Pgb;
                                break;
                            case '21':
                                p = message.Pbg;
                                break;
                            case '22':
                                p = message.Pbb;
                                break;

                        }
                        return Math.min(gMDts, p*vmdt1)
                    }
                }
                const Ets1 = getVmdt(ts + 1, message.tComp, message);
                if(Ets <= Ets1){
                    tw = ts;
                    console.log(`offload begins 🤬 - ts: ${ts} - message size: ${messageSizeAct}`);
                    message.tw = ts;
                    isOffloadBegin = true;
                }
            } else if(messageSizeAct === 0) {
                if(isOffloadBegin){
                    console.log(`offload response has been resceived 🤬 - ts: ${ts} - message size: ${messageSizeAct}`);
                    isOffloadBegin = false;
                    console.log(`abort local execution 🤬 - ts: ${ts} - message size: ${messageSizeAct}`);
                }
            } else if(ts === message.tComp - message.TMDExe + 1){
                console.log(`start local task execution 🤬 - ts: ${ts} - message size: ${messageSizeAct}`);
                isLocalExecutionStared = true;
            } else if(ts === message.tComp){
                if(isLocalExecutionStared){
                    console.log(`terminate offloading 🤬 - ts: ${ts} - message size: ${messageSizeAct}`);
                    isOffloadBegin = false;
                }
            }
        }
    }
    linkQuality(){
        const rand = getRndInteger(0,1);
        return rand ? 50 : 10;
    }
    estExecDurationMD(){
        return 10;
    }
    estExecPowerMD(){
        return 20;
    }
    estExecPowerOffload(){
        return 20;
    }
    mdp(){
        return 'MD';
    }
    getEts(){
        return 
    }
    getTotalSize(route, valueGood, valueBad){
        const routeString = `${route}`;
        const goodCount = routeString.split('').filter(x=>x==='1').length
        const badCount = routeString.split('').filter(x=>x==='2').length
        return (goodCount * valueGood) + (badCount * valueBad)
    }
    getptoffloads(matrixW, iSequenses, jSequenses){
        const arrResult = [];
        for (let index = 0; index < jSequenses.length; index++) {
            let value = 0;
            if(matrixW._data&&matrixW._data[iSequenses]&& matrixW._data[iSequenses][jSequenses[index]]){
                value = matrixW._data[iSequenses][jSequenses[index]];
            }
            arrResult.push(value);
        }
        return sum(arrResult)
    }
    getPMDexe(t, message, matrixWC, matrixWR, matrixW, s = null){
        if(t >= 1 && t < message.tMDExe){
            const tmp = [];
            if(message.tMDExe - t + 1 < Math.ceil(message.size / message.Bmin)){
                for (let Toffload = message.tMDExe - t + 1; Toffload <= Math.ceil(message.size / message.Bmin); Toffload++) {
                    let iSequenses = 0;
                    if(s){
                        iSequenses = matrixWR.map(x=>x.toString()).indexOf(s);
                    }
                    const jSequenses = matrixWC.map(x=>x.toString()).filter(x=>x.toString().length === Math.ceil(Toffload)).map(x=>matrixWC.map(x=>x.toString()).indexOf(x));
                    const PtToffloads = this.getptoffloads(matrixW, iSequenses, jSequenses);
                    tmp.push((PtToffloads * (Math.min(message.tComp + 1, t + Toffload)-message.tMDExe) / message.TMDExe)*message.PMDt)
                }
            }
            return sum(tmp);
        } else if(t>= message.tMDExe && t < message.tComp){
            const tmp = [];
            for (let Toffload =Math.ceil(message.size / message.Bmax); Toffload <= Math.ceil(message.size / message.Bmin); Toffload++) {
                let iSequenses = 0;
                if(s){
                    iSequenses = matrixWR.map(x=>x.toString()).indexOf(s);
                }
                const jSequenses = matrixWC.map(x=>x.toString()).filter(x=>x.toString().length === Math.ceil(Toffload)).map(x=>matrixWC.map(x=>x.toString()).indexOf(x));
                const PtToffloads = this.getptoffloads(matrixW, iSequenses, jSequenses);
                tmp.push((PtToffloads * (Math.min(message.tComp + 1, t + Toffload)-message.tMDExe) / message.TMDExe)*message.PMDt)
            }
            return sum(tmp);
        } else {
            return message.PMDt;
        }
    }
    getPoffload(t, message, matrixWC, matrixWR, matrixW, s = null){
        if(t>= 1 && t< message.tComp - (message.size/message.Bmin) + 1){
            const tmp = []
            for (let Toffload = Math.ceil(message.size / message.Bmax); Toffload <= Math.ceil(message.size / message.Bmin); Toffload++) {
                let iSequenses = 0;
                if(s){
                    iSequenses = matrixWR.map(x=>x.toString()).indexOf(s);
                }
                const jSequenses = matrixWC.map(x=>x.toString()).filter(x=>x.toString().length === Math.ceil(Toffload)).map(x=>matrixWC.map(x=>x.toString()).indexOf(x));
                const PtToffloads = this.getptoffloads(matrixW, iSequenses, jSequenses);
                tmp.push(PtToffloads * Toffload)
            }
            return sum(tmp);
        } else if(t>=message.tComp - (message.size/message.Bmin) + 1 && t<= message.tComp){
            const tmp1 = [];
            const tmp2 = [];
            for (let Toffload = Math.ceil(message.size / message.Bmax); Toffload < message.tComp - t; Toffload++) {
                let iSequenses = 0;
                if(s){
                    iSequenses = matrixWR.map(x=>x.toString()).indexOf(s);
                }
                const jSequenses = matrixWC.map(x=>x.toString()).filter(x=>x.toString().length === Math.ceil(Toffload)).map(x=>matrixWC.map(x=>x.toString()).indexOf(x));
                const PtToffloads = this.getptoffloads(matrixW, iSequenses, jSequenses);
                tmp1.push(PtToffloads*Toffload)
            }
            for (let Toffload = message.tComp - t + 1; Toffload < Math.ceil(message.size / message.Bmin); Toffload++) {
                let iSequenses = 0;
                if(s){
                    iSequenses = matrixWR.map(x=>x.toString()).indexOf(s);
                }
                const jSequenses = matrixWC.map(x=>x.toString()).filter(x=>x.toString().length === Math.ceil(Toffload)).map(x=>matrixWC.map(x=>x.toString()).indexOf(x));
                const PtToffloads = this.getptoffloads(matrixW, iSequenses, jSequenses);
                tmp2.push(PtToffloads*(message.tComp - t + 1))
            }
            return message.Ptrans * (sum(tmp1) + sum(tmp2));
        } else {
            return 0;
        }
    }
}
import "@babel/polyfill";
import Message from './classes/Message';
import Mobile from './classes/Mobile';
import MEC from './classes/MEC';
import { makeSequence } from "./utils";
import DynRes from "./classes/DynRes";

const mobile1 = new Mobile('m1');
mobile1.allocateServer('1');
// mobile1.runS2();

const messageConfigs = [{
    messageSize: 10,
    r: 2,
    xl: 0,
},
{
    messageSize: 20,
    r: 3,
    xl: 1,
}
];

const rateMaps = [
    {
        MECId: 0,
        MessageTypeId: 0,
        mu: 10,
        maxBuffer: 20,
        maxServer: 80,
    },
    {
        MECId: 1,
        MessageTypeId: 0,
        mu: 10,
        maxBuffer: 20,
        maxServer: 80,
    },
]

const dynRes = new DynRes(100, messageConfigs,[
    new MEC(0,messageConfigs, rateMaps.filter(x=>x.MECId === 0)),
    new MEC(1,messageConfigs, rateMaps.filter(x=>x.MECId === 1)),
]);

dynRes.run();
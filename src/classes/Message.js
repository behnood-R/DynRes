import { getRndInteger } from '../utils';
export default class Message {
    constructor(config){
        const {tc, D, FMD, VcpuMD, tComp, messageSize, Bmax, Bmin, Ptrans, Ptoffloads, TOffload,
            Pbb, Pgg, Pgb, Pbg, r = 0, remainTime = 0, xh, xl
         } = config;
        this.type = 't1';
        this.size = messageSize;

        this.tc = tc;
        this.VcpuMD = VcpuMD;
        this.D = D;
        this.FMD = FMD;
        this.Bmax = Bmax;
        this.Bmin = Bmin;
        this.Ptrans = Ptrans;
        this.Ptoffloads = Ptoffloads;
        this.PMDt = this.VcpuMD * this.D
        this.TOffload = TOffload;
        this.TMDExe = D/FMD;
        this.tComp = this.tc + tComp;
        this.TComp = this.tComp - this.tw - 1;
        this.tMDExe = this.tComp - this.TMDExe + 1;
        this.twActAlgOfflineBound = null;
        this.Pbb = Pbb;
        this.Pgg = Pgg;
        this.Pgb = Pgb;
        this.Pbg = Pbg;
        this.xh = xh;
        this.xl = xl;
        this.xm = (this.xh - this.xl)/2;
        this.xn = null;

        this.TtxUp = 0;
        this.TMECExe = 0;
        this.TtxDown = 0;
        this.exeMode = 0;
        this.PMDexe = 0;
        this.PoffloadTs = 0;
        this.r = r;
        this.a = null;
    }
}
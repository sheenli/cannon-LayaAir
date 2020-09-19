import {GameMain} from "../../TestGame/GameMain";
import {ComMgr} from "./ComMgr";
import {CannonPhysicalCtrl} from "../core/CannonPhysicalCtrl";

export class GameMgr {
    public comMgr: ComMgr;
    public cannonPhysicalCtrl: CannonPhysicalCtrl;
    private static mInst: GameMgr;

    static get Inst() {
        if (this.mInst == null) new GameMgr();
        return this.mInst;
    }

    constructor() {
        GameMgr.mInst = this;
    }

    init() {
        this.comMgr = new ComMgr();
        this.cannonPhysicalCtrl = new CannonPhysicalCtrl();
        this.cannonPhysicalCtrl.init();
        Laya.UnlitMaterial
    }


}

import { GameMain } from "../../GameMain";
import { ComMgr } from "./ComMgr";

export class GameMgr {
    public comMgr: ComMgr;
    private static mInst: GameMgr;
    public world: CANNON.World;
    private fixedTimeStep = 1.0 / 60.0;
    private maxSubSteps = 3;
    static get Inst() {
        if (this.mInst == null) new GameMgr()
        return this.mInst;
    }
    constructor() {
        GameMgr.mInst = this;
    }

    init() {
        this.comMgr = new ComMgr()

        Laya.timer.frameLoop(1, this, this.update, null, true)

        this.world = new CANNON.World();

        this.world.gravity.set(0, -0.982, 0);

        this.world.broadphase = new CANNON.NaiveBroadphase()

        Laya.timer.frameLoop(1, this, this.update, null, true)

        new GameMain()
    }

    private update() {
        this.world.step(this.fixedTimeStep, Laya.timer.delta, this.maxSubSteps)
    }
}
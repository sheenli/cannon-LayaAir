import {PhysicsComponent} from "./PhysicsComponent";

export class CannonPhysicalCtrl {
    public world: CANNON.World;
    private fixedTimeStep = 1.0 / 60.0;
    private maxSubSteps = 3;

    private updateList = new Array<PhysicsComponent>();
    private updateToPyList = new Array<PhysicsComponent>();

    public addToUpdateToPyList(com: PhysicsComponent) {
        this.updateToPyList.push(com)
    }

    addBody(com: PhysicsComponent) {
        let index = this.updateList.findIndex(a => a == com);
        if (index == -1 && com.Body) {
            this.world.addBody(com.Body);
            this.updateList.push(com);
        }
    }

    removeBody(com: PhysicsComponent) {
        if (com.Body) {
            this.world.remove(com.Body);
            let index = this.updateList.findIndex(a => a == com);
            if (index != -1) this.updateList.splice(index, 1);
        }
    }

    init() {
        Laya.timer.frameLoop(1, this, this.update, null, true);

        this.world = new CANNON.World();

        this.world.gravity.set(0, -9.82, 0);
        this.world.broadphase = new CANNON.NaiveBroadphase();
        Laya.timer.frameLoop(1, this, this.update, null, true);
    }

    private update() {

        PhysicsComponent.canAdd = false;
        for (let i = 0; i < this.updateToPyList.length; i++) {
            this.updateToPyList.pop().updatePhysicsTransformFromRender();
        }
        this.world.step(this.fixedTimeStep);
        for (let i = 0; i < this.updateList.length; i++) {
            this.updateList[i].updateTransformPhysicsComponent();
        }
        PhysicsComponent.canAdd = true;
    }

}